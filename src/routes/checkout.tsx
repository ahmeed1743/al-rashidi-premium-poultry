import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { MessageCircle, Truck, Store, Banknote, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { saveOrder, getAddressByPhone, upsertAddress } from "@/lib/orders-api";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "إتمام الطلب — طيور الرشيدي" },
      { name: "description", content: "أكمل طلبك بكل سهولة عبر واتساب." },
    ],
  }),
  component: CheckoutPage,
});

const WHATSAPP_NUMBERS = [
  { id: "201223381405", label: "01223381405" },
  { id: "201099342344", label: "01099342344" },
  { id: "201226151455", label: "01226151455" },
];

const ASAP_SLOT = "خلال ساعتين إلى 3 ساعات";
const SCHEDULED_SLOTS = ["11:00 ص", "12:00 م", "1:00 م", "2:00 م", "3:00 م", "4:00 م"];
const PICKUP_BRANCH = "الفرع الرئيسي - كامب شيزار";

type Method = "delivery" | "pickup";
type Pay = "cash" | "instapay";

function CheckoutPage() {
  const navigate = useNavigate();
  const { items, clear } = useCart();
  const [method, setMethod] = useState<Method>("delivery");
  const [pay, setPay] = useState<Pay>("cash");
  const [whatsapp, setWhatsapp] = useState(WHATSAPP_NUMBERS[0].id);
  const [timeMode, setTimeMode] = useState<"asap" | "scheduled">("asap");
  const [scheduledTime, setScheduledTime] = useState(SCHEDULED_SLOTS[0]);
  const [form, setForm] = useState({ name: "", phone: "", area: "", street: "", floorApt: "", notes: "" });
  const [savedFound, setSavedFound] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; type: string; value: number } | null>(null);
  const [couponBusy, setCouponBusy] = useState(false);

  const timeSlot = timeMode === "asap" ? ASAP_SLOT : scheduledTime;
  const branch = PICKUP_BRANCH;

  const upd = (k: keyof typeof form, v: string) => setForm((s) => ({ ...s, [k]: v }));

  // Look up saved address by phone
  useEffect(() => {
    const phone = form.phone.trim();
    if (phone.length < 8) { setSavedFound(false); return; }
    const t = setTimeout(async () => {
      const a = await getAddressByPhone(phone);
      if (a) {
        setForm((s) => ({
          ...s,
          name: s.name || a.customer_name || "",
          area: s.area || a.region || "",
          street: s.street || a.street || "",
          floorApt: s.floorApt || a.floor_apt || "",
        }));
        setSavedFound(true);
      } else {
        setSavedFound(false);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [form.phone]);

  const buildMessage = () => {
    const lines: string[] = [];
    lines.push("🍗 *طلب جديد - طيور الرشيدي*");
    lines.push("━━━━━━━━━━━━━━");
    lines.push(`👤 الاسم: ${form.name}`);
    lines.push(`📱 الهاتف: ${form.phone}`);
    lines.push(`🚚 ${method === "delivery" ? "توصيل" : "استلام من الفرع: " + branch}`);
    lines.push(`⏰ الوقت: ${timeSlot}`);
    if (method === "delivery") {
      lines.push("📍 العنوان:");
      if (form.area) lines.push(`  • المنطقة: ${form.area}`);
      if (form.street) lines.push(`  • الشارع: ${form.street}`);
      if (form.floorApt) lines.push(`  • الدور والشقة: ${form.floorApt}`);
    }
    lines.push(`💰 الدفع: ${pay === "cash" ? "كاش" : "Instapay"}`);
    const sub = items.reduce((s, it) => s + it.price * it.quantity, 0);
    const disc = computeDiscount(sub);
    if (coupon) {
      lines.push(`🎟️ كوبون: ${coupon.code} (-${disc} ج.م)`);
      lines.push(`💵 الإجمالي: ${(sub - disc).toFixed(2)} ج.م`);
    }
    lines.push("");
    lines.push("🛒 *المنتجات*");
    items.forEach((it, i) => {
      const unitTxt = it.pairUnit ? " جوز" : it.unitLabel ? ` ${it.unitLabel}` : "";
      lines.push(`${i + 1}. ${it.name}  ×${it.quantity}${unitTxt}`);
      if (it.options) Object.entries(it.options).forEach(([k, v]) => lines.push(`    - ${k}: ${v}`));
      if (it.generalNote) lines.push(`    📝 ${it.generalNote}`);
    });
    if (form.notes) {
      lines.push("");
      lines.push(`📌 ملاحظات: ${form.notes}`);
    }
    return encodeURIComponent(lines.join("\n"));
  };

  const computeDiscount = (subtotal: number) => {
    if (!coupon) return 0;
    const d = coupon.type === "percent" ? (subtotal * coupon.value) / 100 : coupon.value;
    return Math.min(Math.max(0, d), subtotal);
  };

  const applyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) return;
    setCouponBusy(true);
    const { data, error } = await supabase.rpc("validate_coupon", { _code: code });
    setCouponBusy(false);
    const row = Array.isArray(data) ? data[0] : data;
    if (error || !row?.ok) {
      toast.error(row?.message || "كوبون غير صحيح");
      setCoupon(null);
      return;
    }
    setCoupon({ code, type: row.discount_type, value: Number(row.discount_value) });
    toast.success("تم تطبيق الكوبون");
  };

  const submit = async () => {
    if (!form.name || !form.phone) { toast.error("ادخل الاسم ورقم الهاتف"); return; }
    if (method === "delivery" && (!form.area || !form.street)) { toast.error("أكمل بيانات العنوان"); return; }
    if (items.length === 0) { toast.error("السلة فاضية"); return; }

    // Redeem coupon (atomic) before sending
    if (coupon) {
      const { data: r } = await supabase.rpc("redeem_coupon", { _code: coupon.code });
      const row = Array.isArray(r) ? r[0] : r;
      if (!row?.ok) { toast.error(row?.message || "الكوبون لم يعد متاحاً"); setCoupon(null); return; }
    }

    // Save in background
    Promise.all([
      saveOrder({
        phone: form.phone,
        customer_name: form.name,
        mode: method,
        region: form.area,
        street: form.street,
        floor_apt: form.floorApt,
        branch: method === "pickup" ? branch : undefined,
        time_slot: timeSlot,
        notes: form.notes,
        whatsapp_number: whatsapp,
        items,
        coupon_code: coupon?.code,
        discount: computeDiscount(items.reduce((s, it) => s + it.price * it.quantity, 0)),
      }),
      method === "delivery"
        ? upsertAddress({
            phone: form.phone,
            customer_name: form.name,
            region: form.area,
            street: form.street,
            floor_apt: form.floorApt,
          })
        : Promise.resolve(),
    ]).catch(() => {});

    const url = `https://wa.me/${whatsapp}?text=${buildMessage()}`;
    window.open(url, "_blank");
    toast.success("جاري فتح واتساب لإرسال طلبك");
  };

  if (items.length === 0) {
    return (
      <SiteLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-black">سلتك فاضية</h1>
          <Button onClick={() => navigate({ to: "/products" })} className="mt-6 bg-gradient-primary text-primary-foreground">تصفح المنتجات</Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="container mx-auto grid gap-6 px-4 py-10 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 lg:col-span-2">
          <h1 className="text-3xl font-black md:text-4xl">إتمام الطلب</h1>

          <Section title="طريقة الاستلام">
            <div className="grid grid-cols-2 gap-3">
              <Choice active={method === "delivery"} onClick={() => setMethod("delivery")} icon={<Truck className="h-5 w-5" />} label="توصيل" />
              <Choice active={method === "pickup"} onClick={() => setMethod("pickup")} icon={<Store className="h-5 w-5" />} label="استلام من الفرع" />
            </div>
          </Section>

          <Section title="بيانات العميل">
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="الاسم" v={form.name} onChange={(v) => upd("name", v)} />
              <Field label="رقم الهاتف" v={form.phone} onChange={(v) => upd("phone", v)} />
            </div>
            {savedFound && (
              <div className="mt-3 rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary">
                ✓ تم استرجاع بياناتك المحفوظة
              </div>
            )}
          </Section>

          {method === "delivery" && (
            <Section title="عنوان التوصيل">
              <div className="grid gap-3">
                <Field label="المنطقة" v={form.area} onChange={(v) => upd("area", v)} />
                <Field label="تفاصيل الشارع" v={form.street} onChange={(v) => upd("street", v)} />
                <Field label="الدور والشقة" v={form.floorApt} onChange={(v) => upd("floorApt", v)} />
              </div>
            </Section>
          )}

          {method === "pickup" && (
            <Section title="الفرع">
              <div className="rounded-xl bg-gradient-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-elegant">
                {PICKUP_BRANCH}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">الاستلام متاح من الفرع الرئيسي فقط.</p>
            </Section>
          )}

          <Section title="وقت الاستلام / التوصيل">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setTimeMode("asap")} className={`rounded-xl border-2 px-4 py-3 text-sm font-bold transition-all ${timeMode === "asap" ? "border-primary bg-gradient-primary text-primary-foreground shadow-elegant" : "border-border bg-secondary/40"}`}>
                  في أقرب وقت
                  <div className="mt-0.5 text-[11px] opacity-90">خلال ساعتين إلى 3 ساعات</div>
                </button>
                <button onClick={() => setTimeMode("scheduled")} className={`rounded-xl border-2 px-4 py-3 text-sm font-bold transition-all ${timeMode === "scheduled" ? "border-primary bg-gradient-primary text-primary-foreground shadow-elegant" : "border-border bg-secondary/40"}`}>
                  استلام في ميعاد
                  <div className="mt-0.5 text-[11px] opacity-90">من 11 صباحاً إلى 4 مساءً</div>
                </button>
              </div>
              {timeMode === "scheduled" && (
                <select
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm font-bold"
                >
                  {SCHEDULED_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              )}
            </div>
          </Section>

          <Section title="طريقة الدفع">
            <div className="grid grid-cols-2 gap-3">
              <Choice active={pay === "cash"} onClick={() => setPay("cash")} icon={<Banknote className="h-5 w-5" />} label="كاش" />
              <Choice active={pay === "instapay"} onClick={() => setPay("instapay")} icon={<Smartphone className="h-5 w-5" />} label="Instapay" />
            </div>
          </Section>

          <Section title="إرسال الطلب على واتساب">
            <div className="flex flex-wrap gap-2">
              {WHATSAPP_NUMBERS.map((n) => (
                <button key={n.id} onClick={() => setWhatsapp(n.id)} className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${whatsapp === n.id ? "bg-gradient-primary text-primary-foreground shadow-elegant" : "bg-secondary/40"}`}>
                  {n.label}
                </button>
              ))}
            </div>
          </Section>

          <Section title="ملاحظات عامة">
            <Textarea value={form.notes} onChange={(e) => upd("notes", e.target.value)} placeholder="أي ملاحظات إضافية..." />
          </Section>

          <Section title="كوبون خصم">
            <div className="flex gap-2">
              <Input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="ادخل كود الكوبون"
                className="bg-background"
              />
              <Button onClick={applyCoupon} disabled={couponBusy || !couponCode.trim()} className="bg-gradient-primary text-primary-foreground">
                تطبيق
              </Button>
            </div>
            {coupon && (
              <div className="mt-3 flex items-center justify-between rounded-lg bg-primary/10 px-3 py-2 text-xs">
                <span className="font-bold text-primary">✓ كوبون {coupon.code} مفعل</span>
                <button onClick={() => { setCoupon(null); setCouponCode(""); }} className="text-muted-foreground hover:text-destructive">إزالة</button>
              </div>
            )}
          </Section>
        </motion.div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-4 rounded-2xl bg-gradient-card p-5 shadow-card">
            <h3 className="text-lg font-extrabold">ملخص الطلب</h3>
            <div className="space-y-3 text-sm">
              {items.map((it) => (
                <div key={it.uid} className="border-b border-border/50 pb-2 last:border-0">
                  <div className="flex justify-between gap-2">
                    <span className="font-bold">{it.name}</span>
                    <span className="text-muted-foreground">×{it.quantity}{it.pairUnit ? " جوز" : ""}</span>
                  </div>
                  {it.options && (
                    <div className="mt-1 flex flex-wrap gap-1 text-[11px] text-muted-foreground">
                      {Object.entries(it.options).map(([k, v]) => (
                        <span key={k} className="rounded-full bg-background px-2 py-0.5">{k}: {v}</span>
                      ))}
                    </div>
                  )}
                  {it.generalNote && <div className="mt-1 text-[11px] text-muted-foreground">📝 {it.generalNote}</div>}
                </div>
              ))}
            </div>
            {(() => {
              const sub = items.reduce((s, it) => s + it.price * it.quantity, 0);
              const disc = computeDiscount(sub);
              return (
                <div className="space-y-1 border-t border-border pt-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">الإجمالي قبل الخصم</span><span className="font-bold">{sub.toFixed(2)} ج.م</span></div>
                  {disc > 0 && <div className="flex justify-between text-primary"><span>خصم ({coupon?.code})</span><span className="font-bold">-{disc.toFixed(2)} ج.م</span></div>}
                  <div className="flex justify-between text-base"><span className="font-extrabold">الإجمالي</span><span className="font-extrabold">{(sub - disc).toFixed(2)} ج.م</span></div>
                </div>
              );
            })()}
            <Button onClick={submit} className="h-12 w-full rounded-xl bg-[#25D366] text-base font-extrabold text-white shadow-elegant hover:bg-[#1fb957]">
              <MessageCircle className="ml-2 h-5 w-5" />
              تأكيد عبر واتساب
            </Button>
            <button onClick={clear} className="w-full text-xs text-muted-foreground hover:text-destructive">مسح السلة</button>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-2xl bg-gradient-card p-5 shadow-card"><h3 className="mb-4 text-lg font-extrabold">{title}</h3>{children}</div>;
}
function Field({ label, v, onChange }: { label: string; v: string; onChange: (v: string) => void }) {
  return <div className="space-y-1.5"><Label className="text-sm">{label}</Label><Input value={v} onChange={(e) => onChange(e.target.value)} className="bg-background" /></div>;
}
function Choice({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return <button onClick={onClick} className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-4 text-sm font-bold transition-all ${active ? "border-primary bg-gradient-primary text-primary-foreground shadow-elegant" : "border-border bg-secondary/40"}`}>{icon} {label}</button>;
}
