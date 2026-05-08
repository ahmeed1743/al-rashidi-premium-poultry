import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { MessageCircle, Truck, Store, Banknote, Smartphone } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "إتمام الطلب — طيور الرشيدي" },
      { name: "description", content: "أكمل طلبك بكل سهولة وسلام عبر واتساب." },
    ],
  }),
  component: CheckoutPage,
});

const WHATSAPP_NUMBERS = [
  { id: "201223381405", label: "01223381405" },
  { id: "201099342344", label: "01099342344" },
  { id: "201226151455", label: "01226151455" },
];

const PICKUP_TIMES = [
  "خلال ساعتين إلى 3 ساعات",
  "11:00 ص", "12:00 م", "1:00 م", "2:00 م", "3:00 م", "4:00 م",
];

type Method = "delivery" | "pickup";
type Pay = "cash" | "instapay";

function CheckoutPage() {
  const navigate = useNavigate();
  const { items, total, clear } = useCart();
  const [method, setMethod] = useState<Method>("delivery");
  const [pay, setPay] = useState<Pay>("cash");
  const [whatsapp, setWhatsapp] = useState(WHATSAPP_NUMBERS[0].id);
  const [pickupTime, setPickupTime] = useState(PICKUP_TIMES[0]);
  const [form, setForm] = useState({
    name: "", phone: "", building: "", street: "", floor: "", apt: "", area: "", notes: "",
  });

  const upd = (k: keyof typeof form, v: string) => setForm((s) => ({ ...s, [k]: v }));

  const buildMessage = () => {
    const lines: string[] = [];
    lines.push("🍗 *طلب جديد - طيور الرشيدي*");
    lines.push("━━━━━━━━━━━━━━");
    lines.push("");
    lines.push("👤 *بيانات العميل*");
    lines.push(`• الاسم: ${form.name}`);
    lines.push(`• الهاتف: ${form.phone}`);
    lines.push("");
    lines.push(`🚚 *طريقة الاستلام:* ${method === "delivery" ? "توصيل" : "استلام من الفرع"}`);
    if (method === "delivery") {
      lines.push("");
      lines.push("📍 *العنوان*");
      if (form.area) lines.push(`• المنطقة: ${form.area}`);
      if (form.street) lines.push(`• الشارع: ${form.street}`);
      if (form.building) lines.push(`• رقم العمارة: ${form.building}`);
      if (form.floor) lines.push(`• الدور: ${form.floor}`);
      if (form.apt) lines.push(`• رقم الشقة: ${form.apt}`);
    } else {
      lines.push(`⏰ وقت الاستلام: ${pickupTime}`);
    }
    lines.push("");
    lines.push(`💰 *طريقة الدفع:* ${pay === "cash" ? "كاش" : "Instapay"}`);
    lines.push("");
    lines.push("🛒 *المنتجات*");
    items.forEach((it, i) => {
      lines.push(`${i + 1}. ${it.name}  ×${it.quantity}  =  ${it.price * it.quantity}ج`);
      if (it.options) {
        Object.entries(it.options).forEach(([k, v]) => lines.push(`    - ${k}: ${v}`));
      }
      if (it.cuttingNote) lines.push(`    📝 تقطيع: ${it.cuttingNote}`);
    });
    lines.push("");
    lines.push("━━━━━━━━━━━━━━");
    lines.push(`💵 *الإجمالي: ${total()} جنيه*`);
    if (form.notes) {
      lines.push("");
      lines.push(`📌 ملاحظات: ${form.notes}`);
    }
    return encodeURIComponent(lines.join("\n"));
  };

  const submit = () => {
    if (!form.name || !form.phone) {
      toast.error("من فضلك ادخل الاسم ورقم الهاتف");
      return;
    }
    if (method === "delivery" && (!form.area || !form.street)) {
      toast.error("من فضلك أكمل بيانات العنوان");
      return;
    }
    if (items.length === 0) {
      toast.error("السلة فاضية");
      return;
    }
    const url = `https://wa.me/${whatsapp}?text=${buildMessage()}`;
    window.open(url, "_blank");
    toast.success("جاري فتح واتساب لإرسال طلبك");
  };

  if (items.length === 0) {
    return (
      <SiteLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-black">سلتك فاضية</h1>
          <p className="mt-2 text-muted-foreground">ابدأ التسوق دلوقتي.</p>
          <Button onClick={() => navigate({ to: "/products" })} className="mt-6 bg-gradient-primary text-primary-foreground">
            تصفح المنتجات
          </Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="container mx-auto grid gap-6 px-4 py-10 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 lg:col-span-2">
          <h1 className="text-3xl font-black md:text-4xl">إتمام الطلب</h1>

          {/* Method */}
          <Section title="طريقة الاستلام">
            <div className="grid grid-cols-2 gap-3">
              <Choice active={method === "delivery"} onClick={() => setMethod("delivery")} icon={<Truck className="h-5 w-5" />} label="توصيل" />
              <Choice active={method === "pickup"} onClick={() => setMethod("pickup")} icon={<Store className="h-5 w-5" />} label="استلام من الفرع" />
            </div>
          </Section>

          {/* Customer */}
          <Section title="بيانات العميل">
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="الاسم الثنائي" v={form.name} onChange={(v) => upd("name", v)} />
              <Field label="رقم الهاتف" v={form.phone} onChange={(v) => upd("phone", v)} />
            </div>
          </Section>

          {/* Address */}
          {method === "delivery" && (
            <Section title="عنوان التوصيل">
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="المنطقة" v={form.area} onChange={(v) => upd("area", v)} />
                <Field label="الشارع" v={form.street} onChange={(v) => upd("street", v)} />
                <Field label="رقم العمارة" v={form.building} onChange={(v) => upd("building", v)} />
                <Field label="الدور" v={form.floor} onChange={(v) => upd("floor", v)} />
                <Field label="رقم الشقة" v={form.apt} onChange={(v) => upd("apt", v)} />
              </div>
            </Section>
          )}

          {/* Pickup time */}
          {method === "pickup" && (
            <Section title="وقت الاستلام">
              <div className="flex flex-wrap gap-2">
                {PICKUP_TIMES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setPickupTime(t)}
                    className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
                      pickupTime === t ? "bg-gradient-primary text-primary-foreground shadow-elegant" : "bg-secondary/40"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Section>
          )}

          {/* Payment */}
          <Section title="طريقة الدفع">
            <div className="grid grid-cols-2 gap-3">
              <Choice active={pay === "cash"} onClick={() => setPay("cash")} icon={<Banknote className="h-5 w-5" />} label="كاش" />
              <Choice active={pay === "instapay"} onClick={() => setPay("instapay")} icon={<Smartphone className="h-5 w-5" />} label="Instapay" />
            </div>
          </Section>

          {/* WhatsApp number */}
          <Section title="إرسال الطلب على واتساب">
            <div className="flex flex-wrap gap-2">
              {WHATSAPP_NUMBERS.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setWhatsapp(n.id)}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
                    whatsapp === n.id ? "bg-gradient-primary text-primary-foreground shadow-elegant" : "bg-secondary/40"
                  }`}
                >
                  {n.label}
                </button>
              ))}
            </div>
          </Section>

          {/* Notes */}
          <Section title="ملاحظات عامة">
            <Textarea value={form.notes} onChange={(e) => upd("notes", e.target.value)} placeholder="أي ملاحظات إضافية..." />
          </Section>
        </motion.div>

        {/* Summary */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-4 rounded-2xl bg-gradient-card p-5 shadow-card">
            <h3 className="text-lg font-extrabold">ملخص الطلب</h3>
            <div className="space-y-2 text-sm">
              {items.map((it) => (
                <div key={it.uid} className="flex justify-between gap-2">
                  <span className="text-muted-foreground">{it.name} ×{it.quantity}</span>
                  <span className="font-bold">{it.price * it.quantity}ج</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3">
              <div className="flex items-center justify-between text-lg font-extrabold">
                <span>الإجمالي</span>
                <span className="text-gradient-primary">{total()} ج</span>
              </div>
            </div>
            <Button onClick={submit} className="h-12 w-full rounded-xl bg-[#25D366] text-base font-extrabold text-white shadow-elegant hover:bg-[#1fb957]">
              <MessageCircle className="ml-2 h-5 w-5" />
              تأكيد عبر واتساب
            </Button>
            <button onClick={clear} className="w-full text-xs text-muted-foreground hover:text-destructive">
              مسح السلة
            </button>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-gradient-card p-5 shadow-card">
      <h3 className="mb-4 text-lg font-extrabold">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, v, onChange }: { label: string; v: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      <Input value={v} onChange={(e) => onChange(e.target.value)} className="bg-background" />
    </div>
  );
}

function Choice({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-4 text-sm font-bold transition-all ${
        active ? "border-primary bg-gradient-primary text-primary-foreground shadow-elegant" : "border-border bg-secondary/40"
      }`}
    >
      {icon} {label}
    </button>
  );
}
