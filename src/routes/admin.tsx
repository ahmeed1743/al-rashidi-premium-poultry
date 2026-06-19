import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from "recharts";
import {
  Users, ShoppingBag, Package, TrendingUp, LogOut, Tag,
  Plus, Pencil, Trash2, Save, RefreshCw, Activity, Clock, Upload, Download, MapPin, X,
} from "lucide-react";
import { toast } from "sonner";
import { captureToPdf } from "@/lib/report-pdf";

const DEFAULT_SIZE_OPTIONS = [
  { id: "small", label: "صغير" },
  { id: "med", label: "وسط" },
  { id: "above", label: "فوق الوسط" },
  { id: "large", label: "كبير" },
];

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "لوحة الإدارة — طيور الرشيدي" }] }),
  component: AdminPage,
});

type Stats = {
  visitsToday: number;
  visitsWeek: number;
  visitsLive: number; // last 5 min
  ordersToday: number;
  ordersTotal: number;
  productsCount: number;
  offersCount: number;
  dailyOrders: { day: string; count: number }[];
  dailyVisits: { day: string; count: number }[];
  recentOrders: any[];
};

const CATEGORIES = ["chicken", "duck", "turkey", "pigeon", "marinated", "parts", "other"];
const CAT_LABELS: Record<string, string> = {
  chicken: "فراخ", duck: "بط", turkey: "رومي", pigeon: "حمام/سمان",
  marinated: "متبلات", parts: "أجزاء", other: "أخرى",
};
const PRESETS = ["none", "chicken", "rabbit", "duck", "thigh-bone", "thigh-duck", "fakhayed", "breast-bone", "dababees"];
const PRESET_LABELS: Record<string, string> = {
  none: "بدون تخصيص",
  chicken: "فراخ (تقطيع كامل)",
  rabbit: "أرانب (سليم/مقطع)",
  duck: "بط (مع نصف بطة)",
  "thigh-bone": "وراك بالعظم",
  "thigh-duck": "وراك بط (وحدة فقط)",
  fakhayed: "فخايد (وحدة فقط)",
  "breast-bone": "صدور بالعظم",
  dababees: "دبابيس",
};
const BADGES = ["", "خصم", "الأكثر مبيعاً", "جديد", "مميز", "موصى به", "تم النفاذ"];

function AdminPage() {
  const nav = useNavigate();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { setAuthed(false); return; }
      const { data: roles } = await supabase
        .from("user_roles").select("role").eq("user_id", data.user.id).eq("role", "admin");
      setAuthed(!!roles?.length);
    })();
  }, []);

  if (authed === null)
    return <SiteLayout><div className="container mx-auto px-4 py-20 text-center text-muted-foreground">جاري التحقق...</div></SiteLayout>;

  if (!authed)
    return (
      <SiteLayout>
        <div className="container mx-auto max-w-md px-4 py-20 text-center">
          <h1 className="mb-3 text-2xl font-black">مطلوب صلاحية أدمن</h1>
          <p className="mb-6 text-sm text-muted-foreground">سجل دخول بحساب أدمن للوصول للوحة.</p>
          <Link to="/login"><Button className="bg-gradient-primary text-primary-foreground">تسجيل الدخول</Button></Link>
        </div>
      </SiteLayout>
    );

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-black md:text-4xl">لوحة الإدارة</h1>
          <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); nav({ to: "/login" }); }}>
            <LogOut className="ml-2 h-4 w-4" /> خروج
          </Button>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="overview">📊 نظرة عامة</TabsTrigger>
            <TabsTrigger value="products">🛒 المنتجات</TabsTrigger>
            <TabsTrigger value="offers">🏷️ العروض</TabsTrigger>
            <TabsTrigger value="orders">🧾 الطلبات</TabsTrigger>
            <TabsTrigger value="coupons">🎟️ الكوبونات</TabsTrigger>
            <TabsTrigger value="visitors">👥 الزوار</TabsTrigger>
          </TabsList>
          <TabsContent value="overview"><Dashboard /></TabsContent>
          <TabsContent value="products"><ProductsAdmin /></TabsContent>
          <TabsContent value="offers"><ProductsAdmin onlyOffers /></TabsContent>
          <TabsContent value="orders"><OrdersTab /></TabsContent>
          <TabsContent value="coupons"><CouponsTab /></TabsContent>
          <TabsContent value="visitors"><VisitorsTab /></TabsContent>
        </Tabs>
      </div>
    </SiteLayout>
  );
}

function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [tick, setTick] = useState(0);
  const reportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    (async () => {
      const now = new Date();
      const startToday = new Date(now); startToday.setHours(0, 0, 0, 0);
      const startWeek = new Date(now); startWeek.setDate(startWeek.getDate() - 6); startWeek.setHours(0, 0, 0, 0);
      const live5 = new Date(now.getTime() - 5 * 60 * 1000);

      const [visitsT, visitsW, visitsLive, ordersT, ordersAll, recent, productsCnt, offersCnt] = await Promise.all([
        supabase.from("visit_events").select("id", { count: "exact", head: true }).gte("created_at", startToday.toISOString()),
        supabase.from("visit_events").select("created_at").gte("created_at", startWeek.toISOString()),
        supabase.from("visit_events").select("session_id").gte("created_at", live5.toISOString()),
        supabase.from("orders").select("id", { count: "exact", head: true }).gte("created_at", startToday.toISOString()),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id, created_at, customer_name, phone, total, mode, items, time_slot, region").order("created_at", { ascending: false }).limit(15),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }).not("old_price", "is", null),
      ]);

      const days: { day: string; count: number }[] = [];
      const visitDays: { day: string; count: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now); d.setDate(d.getDate() - i);
        const k = `${d.getDate()}/${d.getMonth() + 1}`;
        days.push({ day: k, count: 0 });
        visitDays.push({ day: k, count: 0 });
      }
      const { data: ordersWeek } = await supabase
        .from("orders").select("created_at").gte("created_at", startWeek.toISOString());
      (ordersWeek || []).forEach((o: any) => {
        const d = new Date(o.created_at);
        const k = `${d.getDate()}/${d.getMonth() + 1}`;
        const slot = days.find((x) => x.day === k);
        if (slot) slot.count++;
      });
      (visitsW.data || []).forEach((v: any) => {
        const d = new Date(v.created_at);
        const k = `${d.getDate()}/${d.getMonth() + 1}`;
        const slot = visitDays.find((x) => x.day === k);
        if (slot) slot.count++;
      });

      const liveSessions = new Set((visitsLive.data || []).map((r: any) => r.session_id).filter(Boolean));

      setStats({
        visitsToday: visitsT.count || 0,
        visitsWeek: visitsW.data?.length || 0,
        visitsLive: liveSessions.size,
        ordersToday: ordersT.count || 0,
        ordersTotal: ordersAll.count || 0,
        productsCount: productsCnt.count || 0,
        offersCount: offersCnt.count || 0,
        dailyOrders: days,
        dailyVisits: visitDays,
        recentOrders: recent.data || [],
      });
    })();
  }, [tick]);

  if (!stats) return <div className="py-10 text-center text-muted-foreground">جاري تحميل البيانات...</div>;

  return (
    <div className="mt-4 space-y-6">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          disabled={exporting}
          onClick={async () => {
            if (!reportRef.current) return;
            setExporting(true);
            try {
              await captureToPdf(reportRef.current, `report-overview-${new Date().toISOString().slice(0,10)}.pdf`, "تقرير شامل");
              toast.success("تم تنزيل التقرير");
            } catch (e: any) { toast.error(e.message || "فشل التصدير"); }
            finally { setExporting(false); }
          }}
        >
          <Download className="ml-1 h-4 w-4" /> {exporting ? "جاري التحضير..." : "تنزيل تقرير شامل (PDF)"}
        </Button>
      </div>
      <div ref={reportRef} className="space-y-6 bg-background p-2">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Users className="h-5 w-5" />} label="زوار حاليون (5 د)" value={stats.visitsLive} sub="🟢 يتحدث كل 10 ثوان" pulse />
        <Stat icon={<Users className="h-5 w-5" />} label="زوار اليوم" value={stats.visitsToday} sub={`${stats.visitsWeek} زائر هذا الأسبوع`} />
        <Stat icon={<ShoppingBag className="h-5 w-5" />} label="طلبات اليوم" value={stats.ordersToday} sub={`${stats.ordersTotal} طلب إجمالي`} />
        <Stat icon={<Package className="h-5 w-5" />} label="المنتجات" value={stats.productsCount} sub={`${stats.offersCount} عرض نشط`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="الطلبات اليومية (آخر 7 أيام)" icon={<TrendingUp className="h-4 w-4" />}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.dailyOrders}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="count" fill="oklch(0.62 0.23 28)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="الزوار اليوميين (آخر 7 أيام)" icon={<Users className="h-4 w-4" />}>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={stats.dailyVisits}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Line type="monotone" dataKey="count" stroke="oklch(0.82 0.14 85)" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="آخر الطلبات">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="p-2">التاريخ</th>
                <th className="p-2">العميل</th>
                <th className="p-2">الهاتف</th>
                <th className="p-2">النوع</th>
                <th className="p-2">المنطقة</th>
                <th className="p-2">الموعد</th>
                <th className="p-2">عدد المنتجات</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((o: any) => (
                <tr key={o.id} className="border-t border-border/50">
                  <td className="p-2 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("ar-EG")}</td>
                  <td className="p-2 font-bold">{o.customer_name || "—"}</td>
                  <td className="p-2 font-mono text-xs">{o.phone}</td>
                  <td className="p-2">{o.mode === "delivery" ? "توصيل" : "استلام"}</td>
                  <td className="p-2 text-xs">{o.region || "—"}</td>
                  <td className="p-2 text-xs">{o.time_slot || "—"}</td>
                  <td className="p-2">{Array.isArray(o.items) ? o.items.length : 0}</td>
                </tr>
              ))}
              {stats.recentOrders.length === 0 && (
                <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">لا توجد طلبات بعد</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      </div>
    </div>
  );
}

type ProductRow = {
  id: string; name: string; description: string; price: number; old_price: number | null;
  image_url: string; category: string; subcategory: string | null; badge: string | null;
  customization: string; pair_unit: boolean; note: string | null; sort_order: number;
  is_active: boolean; sold_out: boolean; discount_percent: number | null;
  customization_config: any | null;
};

function emptyProduct(offer = false): ProductRow {
  return {
    id: "", name: "", description: "", price: 0, old_price: null, image_url: "",
    category: "chicken", subcategory: null, badge: offer ? "🔥 عرض" : null, customization: "none",
    pair_unit: false, note: null, sort_order: 0, is_active: true, sold_out: false, discount_percent: null,
    customization_config: null,
  };
}

function ProductsAdmin({ onlyOffers = false }: { onlyOffers?: boolean }) {
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [editing, setEditing] = useState<ProductRow | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*").order("category").order("sort_order");
    if (error) toast.error(error.message);
    setRows((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => rows.filter((r) =>
    (cat === "all" || r.category === cat) &&
    (!onlyOffers || ((r.old_price != null || !!r.badge || r.discount_percent != null) && !r.sold_out)) &&
    (!filter || r.name.includes(filter) || r.id.includes(filter))
  ), [rows, filter, cat, onlyOffers]);

  const remove = async (id: string) => {
    if (!confirm("متأكد من الحذف؟")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم الحذف");
    load();
  };

  const toggleActive = async (r: ProductRow) => {
    const { error } = await supabase.from("products").update({ is_active: !r.is_active }).eq("id", r.id);
    if (error) return toast.error(error.message);
    load();
  };

  const toggleSold = async (r: ProductRow) => {
    const { error } = await supabase.from("products").update({ sold_out: !r.sold_out }).eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success(!r.sold_out ? "تم وضع شارة نفذ" : "تم إزالة الشارة");
    load();
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="🔍 بحث..."
          className="max-w-xs"
        />
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="all">كل التصنيفات</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
        </select>
        <Button variant="outline" size="sm" onClick={load}><RefreshCw className="ml-1 h-4 w-4" />تحديث</Button>
        <div className="flex-1" />
        <Button onClick={() => setEditing(emptyProduct(onlyOffers))} className="bg-gradient-primary text-primary-foreground">
          <Plus className="ml-1 h-4 w-4" /> {onlyOffers ? "عرض جديد" : "منتج جديد"}
        </Button>
      </div>

      <Card title={`المنتجات (${filtered.length})`}>
        {loading ? (
          <div className="py-10 text-center text-muted-foreground">جاري التحميل...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr>
                  <th className="p-2">الاسم</th>
                  <th className="p-2">التصنيف</th>
                  <th className="p-2">السعر</th>
                  <th className="p-2">شارة</th>
                  <th className="p-2">نشط</th>
                  <th className="p-2">نفذ</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t border-border/50">
                    <td className="p-2 font-bold">{r.name}<div className="text-[10px] text-muted-foreground font-mono">{r.id}</div></td>
                    <td className="p-2 text-xs">{CAT_LABELS[r.category] || r.category}</td>
                    <td className="p-2 font-bold">{r.price > 0 ? `${r.price} ج` : "—"}</td>
                    <td className="p-2 text-xs">{r.badge || "—"}</td>
                    <td className="p-2"><Switch checked={r.is_active} onCheckedChange={() => toggleActive(r)} /></td>
                    <td className="p-2"><Switch checked={r.sold_out} onCheckedChange={() => toggleSold(r)} /></td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => setEditing(r)}><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">لا توجد منتجات</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {editing && (
        <ProductEditor
          row={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function ProductEditor({ row, onClose, onSaved }: { row: ProductRow; onClose: () => void; onSaved: () => void }) {
  const [r, setR] = useState<ProductRow>(row);
  const isNew = !row.id;
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof ProductRow>(k: K, v: ProductRow[K]) => setR((x) => ({ ...x, [k]: v }));

  const save = async () => {
    if (!r.name.trim()) return toast.error("الاسم مطلوب");
    const id = isNew ? (r.id || r.name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w-\u0600-\u06FF]/g, "")) : r.id;
    setSaving(true);
    const payload = { ...r, id, price: Number(r.price) || 0, old_price: r.old_price ? Number(r.old_price) : null };
    const { error } = isNew
      ? await supabase.from("products").insert(payload)
      : await supabase.from("products").update(payload).eq("id", row.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(isNew ? "تمت الإضافة" : "تم الحفظ");
    onSaved();
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto text-right">
        <DialogHeader>
          <DialogTitle>{isNew ? "منتج جديد" : `تعديل: ${row.name}`}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          {isNew && (
            <Field label="المعرف (id) — اختياري"><Input value={r.id} onChange={(e) => set("id", e.target.value)} placeholder="يُولّد تلقائياً من الاسم" /></Field>
          )}
          <Field label="الاسم *"><Input value={r.name} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="الوصف"><Textarea value={r.description} onChange={(e) => set("description", e.target.value)} className="min-h-16" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="السعر"><Input type="number" step="0.01" value={r.price} onChange={(e) => set("price", parseFloat(e.target.value) || 0)} /></Field>
            <Field label="السعر القديم (اختياري)"><Input type="number" step="0.01" value={r.old_price ?? ""} onChange={(e) => set("old_price", e.target.value ? parseFloat(e.target.value) : null)} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="التصنيف">
              <select value={r.category} onChange={(e) => set("category", e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
              </select>
            </Field>
            <Field label="نمط التخصيص">
              <select value={r.customization} onChange={(e) => set("customization", e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {PRESETS.map((p) => <option key={p} value={p}>{PRESET_LABELS[p] || p}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="الفئة الفرعية"><Input value={r.subcategory || ""} onChange={(e) => set("subcategory", e.target.value || null)} /></Field>
            <Field label="ترتيب">
              <Input type="number" value={r.sort_order} onChange={(e) => set("sort_order", parseInt(e.target.value) || 0)} />
            </Field>
          </div>
          <Field label="صورة المنتج">
            <ImageUploader value={r.image_url} onChange={(url) => set("image_url", url)} productId={r.id || r.name || "new"} />
          </Field>

          <Field label="الشارة (Badge)">
            <select value={r.badge || ""} onChange={(e) => set("badge", e.target.value || null)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              {BADGES.map((b) => <option key={b} value={b}>{b || "— بدون —"}</option>)}
            </select>
          </Field>

          <Field label="ملاحظة على المنتج"><Input value={r.note || ""} onChange={(e) => set("note", e.target.value || null)} /></Field>

          <div className="grid grid-cols-3 gap-3">
            <Toggle label="نشط" v={r.is_active} on={(v) => set("is_active", v)} />
            <Toggle label="تم النفاذ" v={r.sold_out} on={(v) => set("sold_out", v)} />
            <Toggle label="بيع بالجوز" v={r.pair_unit} on={(v) => set("pair_unit", v)} />
          </div>

          <div className="rounded-xl border border-border bg-secondary/20 p-3">
            <div className="mb-2 text-sm font-extrabold">⚙️ خيارات التخصيص (تتحكم فيها لحظياً)</div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              <Toggle label="نص جوز (للحمام)" v={!!r.customization_config?.halfPair} on={(v) => set("customization_config", { ...(r.customization_config || {}), halfPair: v })} />
              <Toggle label="السماح بنص كيلو" v={r.customization_config?.allowHalfKg !== false} on={(v) => set("customization_config", { ...(r.customization_config || {}), allowHalfKg: v })} />
              <Toggle label="إخفاء اختيار الحجم" v={!!r.customization_config?.hideSize} on={(v) => set("customization_config", { ...(r.customization_config || {}), hideSize: v })} />
              <Toggle label="إخفاء التقطيع" v={!!r.customization_config?.hideCuts} on={(v) => set("customization_config", { ...(r.customization_config || {}), hideCuts: v })} />
              <Toggle label="إخفاء السلخ" v={!!r.customization_config?.hideSalkh} on={(v) => set("customization_config", { ...(r.customization_config || {}), hideSalkh: v })} />
              <Toggle label="إخفاء الخلي" v={!!r.customization_config?.hideKhaly} on={(v) => set("customization_config", { ...(r.customization_config || {}), hideKhaly: v })} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Field label="إجبار الوحدة (لو فيه اختيار كيلو/عدد)">
                <select
                  value={r.customization_config?.forceUnit || ""}
                  onChange={(e) => set("customization_config", { ...(r.customization_config || {}), forceUnit: e.target.value || undefined })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">— الاختيار للعميل —</option>
                  <option value="kg">بالكيلو فقط</option>
                  <option value="count">بالعدد فقط</option>
                </select>
              </Field>
            </div>

            <div className="mt-3 space-y-3 border-t border-border pt-3">
              <div>
                <div className="mb-2 text-xs font-bold">الأحجام المتاحة للعميل</div>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {DEFAULT_SIZE_OPTIONS.map((s) => {
                    const enabled = r.customization_config?.enabledSizes;
                    const on = !enabled || enabled.length === 0 ? true : enabled.includes(s.id);
                    return (
                      <label key={s.id} className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2">
                        <span className="text-sm font-bold">{s.label}</span>
                        <Switch
                          checked={on}
                          onCheckedChange={(v) => {
                            const current = (r.customization_config?.enabledSizes && r.customization_config.enabledSizes.length)
                              ? [...r.customization_config.enabledSizes]
                              : DEFAULT_SIZE_OPTIONS.map((x) => x.id);
                            const next = v ? Array.from(new Set([...current, s.id])) : current.filter((x) => x !== s.id);
                            set("customization_config", { ...(r.customization_config || {}), enabledSizes: next });
                          }}
                        />
                      </label>
                    );
                  })}
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground">قفّل اللي مش متاح في المنتج ده — البقية بتظهر للعميل.</div>
              </div>
              <Field label="خطوة الكمية (مثال: 0.5 / 1 / 1.5 / 2)">
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={r.customization_config?.qtyStep ?? ""}
                  onChange={(e) => set("customization_config", { ...(r.customization_config || {}), qtyStep: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="افتراضي حسب الوحدة"
                />
              </Field>
              <ListEditor
                label="تقطيعات إضافية (تنضاف للموجود)"
                hint="سطر لكل تقطيع. الصيغة: الاسم | شرح اختياري"
                value={r.customization_config?.customCuts || []}
                onChange={(v) => set("customization_config", { ...(r.customization_config || {}), customCuts: v })}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          <Button onClick={save} disabled={saving} className="bg-gradient-primary text-primary-foreground">
            <Save className="ml-1 h-4 w-4" />{saving ? "..." : "حفظ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5"><div className="text-xs font-bold text-muted-foreground">{label}</div>{children}</label>;
}

/* ------------------------------------------------------------------ */
/* Orders Tab                                                          */
/* ------------------------------------------------------------------ */
function OrdersTable({ orders }: { orders: any[] }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const allSelected = orders.length > 0 && orders.every((o) => selected[o.id]);
  const toggleAll = () => {
    if (allSelected) setSelected({});
    else setSelected(Object.fromEntries(orders.map((o) => [o.id, true])));
  };
  const selectedIds = Object.keys(selected).filter((k) => selected[k]);
  const deleteOne = async (id: string) => {
    if (!confirm("حذف هذا الطلب نهائياً؟")) return;
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("تم الحذف"); location.reload(); }
  };
  const deleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`حذف ${selectedIds.length} طلب نهائياً؟`)) return;
    const { error } = await supabase.from("orders").delete().in("id", selectedIds);
    if (error) toast.error(error.message); else { toast.success("تم الحذف"); location.reload(); }
  };
  if (orders.length === 0)
    return <div className="py-10 text-center text-muted-foreground">لا توجد طلبات</div>;
  return (
    <div className="space-y-2">
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-destructive/10 px-3 py-2 text-sm">
          <span>محدد: {selectedIds.length}</span>
          <Button size="sm" variant="destructive" onClick={deleteSelected}><Trash2 className="ml-1 h-3 w-3" /> حذف المحدد</Button>
        </div>
      )}
      <div className="overflow-x-auto">
      <table className="w-full text-right text-sm">
        <thead className="bg-secondary/30 text-xs text-muted-foreground">
          <tr>
            <th className="p-2"><input type="checkbox" checked={allSelected} onChange={toggleAll} /></th>
            <th className="p-2"></th>
            <th className="p-2">التاريخ</th>
            <th className="p-2">العميل</th>
            <th className="p-2">الهاتف</th>
            <th className="p-2">النوع</th>
            <th className="p-2">المنطقة</th>
            <th className="p-2">الفرع</th>
            <th className="p-2">المجموع</th>
            <th className="p-2">الدفع</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            const isOpen = !!expanded[o.id];
            const items: any[] = Array.isArray(o.items) ? o.items : [];
            return (
              <Fragment key={o.id}>
                <tr
                  className="cursor-pointer border-t border-border/50 hover:bg-secondary/20"
                  onClick={() => toggle(o.id)}
                >
                  <td className="p-2" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={!!selected[o.id]} onChange={(e) => setSelected((p) => ({ ...p, [o.id]: e.target.checked }))} />
                  </td>
                  <td className="p-2 text-muted-foreground">{isOpen ? "▾" : "▸"}</td>
                  <td className="p-2 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" })}</td>
                  <td className="p-2 font-bold">{o.customer_name || "—"}</td>
                  <td className="p-2 font-mono text-xs">{o.phone}</td>
                  <td className="p-2">{o.mode === "delivery" ? "توصيل" : "استلام"}</td>
                  <td className="p-2 text-xs">{o.region || "—"}</td>
                  <td className="p-2 text-xs">{o.branch || "—"}</td>
                  <td className="p-2 font-bold">{Number(o.total || 0).toFixed(2)} ج.م</td>
                  <td className="p-2 text-xs">كاش</td>
                  <td className="p-2" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => deleteOne(o.id)} className="text-destructive hover:opacity-70" aria-label="حذف">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
                {isOpen && (
                  <tr className="border-t border-border/30 bg-secondary/10">
                    <td colSpan={11} className="p-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-1 text-xs">
                          {o.whatsapp_number && <div><span className="font-bold">واتساب:</span> {o.whatsapp_number}</div>}
                          {o.street && <div><span className="font-bold">الشارع:</span> {o.street}</div>}
                          {o.floor_apt && <div><span className="font-bold">الدور/الشقة:</span> {o.floor_apt}</div>}
                          {o.time_slot && <div><span className="font-bold">موعد التوصيل:</span> {o.time_slot}</div>}
                          {o.notes && <div><span className="font-bold">ملاحظات:</span> {o.notes}</div>}
                        </div>
                        <div>
                          <div className="mb-2 font-bold">تفاصيل المنتجات:</div>
                          <div className="space-y-2">
                            {items.map((it, idx) => (
                              <div key={idx} className="rounded-lg bg-background/60 p-2">
                                <div className="flex items-center justify-between">
                                  <div className="font-bold">{it.name} {it.qty ? `× ${it.qty}` : ""}</div>
                                  <div className="font-extrabold text-primary">{Number((it.price || 0) * (it.qty || 1)).toFixed(2)} ج.م</div>
                                </div>
                                {it.options && (
                                  <div className="mt-1 text-[11px] text-muted-foreground">
                                    {Object.entries(it.options).map(([k, v]) => `${k}: ${v}`).join(" • ")}
                                  </div>
                                )}
                                {it.note && <div className="mt-1 text-[11px] text-muted-foreground">📝 {it.note}</div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const customersRef = useRef<HTMLDivElement>(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("orders").select("*").order("created_at", { ascending: false }).limit(200);
    setOrders(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(orders, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `orders-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    toast.success(`تم تنزيل ${orders.length} طلب`);
  };
  const importJSON = async (file: File) => {
    try {
      const txt = await file.text();
      const arr = JSON.parse(txt);
      if (!Array.isArray(arr)) return toast.error("ملف غير صالح");
      if (!confirm(`استيراد ${arr.length} طلب من الملف؟`)) return;
      const rows = arr.map((o: any) => {
        const { id: _id, created_at: _c, updated_at: _u, ...rest } = o;
        return rest;
      });
      const { error } = await supabase.from("orders").insert(rows);
      if (error) toast.error(error.message); else { toast.success("تم الاستيراد"); load(); }
    } catch (e: any) { toast.error(e.message || "فشل الاستيراد"); }
  };
  const deleteAll = async () => {
    if (!confirm(`حذف جميع الطلبات (${orders.length})؟ تأكد من تنزيل نسخة احتياطية أولاً.`)) return;
    if (!confirm("هل أنت متأكد تماماً؟ لن يمكن الاسترجاع.")) return;
    const { error } = await supabase.from("orders").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) toast.error(error.message); else { toast.success("تم الحذف"); load(); }
  };

  const regionStats = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    orders.forEach((o) => {
      const key = (o.region || (o.mode === "pickup" ? `استلام: ${o.branch || "—"}` : "غير محدد")).trim();
      const cur = map.get(key) || { count: 0, total: 0 };
      cur.count++; cur.total += Number(o.total || 0);
      map.set(key, cur);
    });
    return Array.from(map.entries()).map(([region, v]) => ({ region, ...v })).sort((a, b) => b.count - a.count);
  }, [orders]);

  const exportRegionsCSV = () => {
    const header = "المنطقة,عدد الطلبات,إجمالي المبيعات (ج)\n";
    const body = regionStats.map((r) => `"${r.region}",${r.count},${r.total.toFixed(2)}`).join("\n");
    const blob = new Blob(["\ufeff" + header + body], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `region-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast.success("تم تنزيل التقرير");
  };

  const customerStats = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; count: number; total: number; last: string; regions: Set<string> }>();
    orders.forEach((o) => {
      const key = (o.phone || "—").trim();
      const cur = map.get(key) || { name: o.customer_name || "—", phone: key, count: 0, total: 0, last: o.created_at, regions: new Set<string>() };
      cur.count++; cur.total += Number(o.total || 0);
      if (o.created_at > cur.last) cur.last = o.created_at;
      if (o.region) cur.regions.add(o.region);
      if (o.customer_name) cur.name = o.customer_name;
      map.set(key, cur);
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [orders]);

  const exportCustomersPdf = async () => {
    if (!customersRef.current) return;
    setExportingPdf(true);
    try {
      await captureToPdf(customersRef.current, `customers-report-${new Date().toISOString().slice(0,10)}.pdf`, "تقرير العملاء");
      toast.success("تم تنزيل تقرير العملاء");
    } catch (e: any) { toast.error(e.message || "فشل التصدير"); }
    finally { setExportingPdf(false); }
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">آخر 200 طلب</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={exportJSON}><Download className="ml-1 h-4 w-4" /> نسخة احتياطية (JSON)</Button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && importJSON(e.target.files[0])} />
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}><Upload className="ml-1 h-4 w-4" /> استيراد</Button>
          <Button variant="outline" size="sm" onClick={exportRegionsCSV}><Download className="ml-1 h-4 w-4" /> تقرير المناطق (CSV)</Button>
          <Button variant="outline" size="sm" disabled={exportingPdf} onClick={exportCustomersPdf}><Download className="ml-1 h-4 w-4" /> تقرير العملاء (PDF)</Button>
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="ml-1 h-4 w-4" /> تحديث</Button>
          <Button variant="destructive" size="sm" onClick={deleteAll}><Trash2 className="ml-1 h-4 w-4" /> حذف الكل</Button>
        </div>
      </div>

      <div ref={customersRef} className="space-y-4 bg-background p-2">
      <Card title="📍 أكثر المناطق طلباً" icon={<MapPin className="h-4 w-4" />}>
        {regionStats.length === 0 ? (
          <div className="py-4 text-center text-sm text-muted-foreground">لا توجد بيانات بعد</div>
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            {regionStats.slice(0, 10).map((r, i) => (
              <div key={r.region} className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-primary text-xs font-black text-primary-foreground">{i + 1}</span>
                  <span className="font-bold">{r.region}</span>
                </div>
                <div className="text-left">
                  <div className="text-sm font-extrabold text-primary">{r.count} طلب</div>
                  <div className="text-[10px] text-muted-foreground">{r.total.toFixed(0)} ج</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card title="👤 أفضل العملاء" icon={<Users className="h-4 w-4" />}>
        {customerStats.length === 0 ? (
          <div className="py-4 text-center text-sm text-muted-foreground">لا توجد بيانات بعد</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr>
                  <th className="p-2">#</th>
                  <th className="p-2">العميل</th>
                  <th className="p-2">الهاتف</th>
                  <th className="p-2">عدد الطلبات</th>
                  <th className="p-2">الإجمالي</th>
                  <th className="p-2">آخر طلب</th>
                  <th className="p-2">المناطق</th>
                </tr>
              </thead>
              <tbody>
                {customerStats.slice(0, 30).map((c, i) => (
                  <tr key={c.phone} className="border-t border-border/50">
                    <td className="p-2 font-black">{i + 1}</td>
                    <td className="p-2 font-bold">{c.name}</td>
                    <td className="p-2 font-mono text-xs">{c.phone}</td>
                    <td className="p-2 font-extrabold text-primary">{c.count}</td>
                    <td className="p-2 font-bold">{c.total.toFixed(0)} ج</td>
                    <td className="p-2 text-xs text-muted-foreground">{new Date(c.last).toLocaleDateString("ar-EG")}</td>
                    <td className="p-2 text-xs">{Array.from(c.regions).slice(0, 3).join("، ") || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      </div>

      <Card title={`الطلبات (${orders.length})`}>
        {loading ? <div className="py-10 text-center text-muted-foreground">جاري التحميل...</div> : (
          <OrdersTable orders={orders} />
        )}
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Visitors Tab                                                        */
/* ------------------------------------------------------------------ */
function VisitorsTab() {
  const [data, setData] = useState<any | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 8000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    (async () => {
      const now = new Date();
      const live = new Date(now.getTime() - 5 * 60 * 1000);
      const day = new Date(now); day.setHours(0, 0, 0, 0);
      const week = new Date(now); week.setDate(week.getDate() - 6); week.setHours(0, 0, 0, 0);

      const [liveR, dayR, weekR, recent] = await Promise.all([
        supabase.from("visit_events").select("session_id").gte("created_at", live.toISOString()),
        supabase.from("visit_events").select("path, session_id").gte("created_at", day.toISOString()),
        supabase.from("visit_events").select("created_at").gte("created_at", week.toISOString()),
        supabase.from("visit_events").select("path, created_at, referrer, user_agent").order("created_at", { ascending: false }).limit(40),
      ]);

      const byPath: Record<string, number> = {};
      (dayR.data || []).forEach((r: any) => { byPath[r.path] = (byPath[r.path] || 0) + 1; });
      const topPaths = Object.entries(byPath).sort((a, b) => b[1] - a[1]).slice(0, 10);

      const days: { day: string; count: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now); d.setDate(d.getDate() - i);
        days.push({ day: `${d.getDate()}/${d.getMonth() + 1}`, count: 0 });
      }
      (weekR.data || []).forEach((v: any) => {
        const d = new Date(v.created_at);
        const k = `${d.getDate()}/${d.getMonth() + 1}`;
        const slot = days.find((x) => x.day === k);
        if (slot) slot.count++;
      });

      const liveSessions = new Set((liveR.data || []).map((r: any) => r.session_id).filter(Boolean));
      const daySessions = new Set((dayR.data || []).map((r: any) => r.session_id).filter(Boolean));

      setData({
        live: liveSessions.size,
        day: dayR.data?.length || 0,
        daySessions: daySessions.size,
        week: weekR.data?.length || 0,
        days, topPaths, recent: recent.data || [],
      });
    })();
  }, [tick]);

  if (!data) return <div className="py-10 text-center text-muted-foreground">جاري التحميل...</div>;

  return (
    <div className="mt-4 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Activity className="h-5 w-5" />} label="زوار حاليون (آخر 5 د)" value={data.live} sub="🟢 يتحدث كل 8 ثوان" pulse />
        <Stat icon={<Users className="h-5 w-5" />} label="زيارات اليوم" value={data.day} sub={`${data.daySessions} زائر فريد`} />
        <Stat icon={<TrendingUp className="h-5 w-5" />} label="هذا الأسبوع" value={data.week} sub="آخر 7 أيام" />
        <Stat icon={<Clock className="h-5 w-5" />} label="مسارات مختلفة" value={data.topPaths.length} sub="صفحات تمت زيارتها اليوم" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="الزيارات اليومية (آخر 7 أيام)" icon={<TrendingUp className="h-4 w-4" />}>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.days}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Line type="monotone" dataKey="count" stroke="oklch(0.82 0.14 85)" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card title="أكثر الصفحات زيارة (اليوم)">
          <ul className="space-y-1.5 text-sm">
            {data.topPaths.map(([p, c]: any) => (
              <li key={p} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2">
                <code className="text-xs">{p}</code>
                <span className="font-black text-primary">{c}</span>
              </li>
            ))}
            {data.topPaths.length === 0 && <li className="py-6 text-center text-muted-foreground">لا توجد بيانات بعد</li>}
          </ul>
        </Card>
      </div>

      <Card title="آخر 40 زيارة">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr><th className="p-2">الوقت</th><th className="p-2">الصفحة</th><th className="p-2">من</th></tr>
            </thead>
            <tbody>
              {data.recent.map((v: any, i: number) => (
                <tr key={i} className="border-t border-border/50">
                  <td className="p-2 text-xs text-muted-foreground">{new Date(v.created_at).toLocaleString("ar-EG")}</td>
                  <td className="p-2 font-mono text-xs">{v.path}</td>
                  <td className="p-2 text-xs text-muted-foreground">{v.referrer || "مباشر"}</td>
                </tr>
              ))}
              {data.recent.length === 0 && <tr><td colSpan={3} className="p-6 text-center text-muted-foreground">لا توجد زيارات بعد</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Toggle({ label, v, on }: { label: string; v: boolean; on: (b: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2">
      <span className="text-sm font-bold">{label}</span>
      <Switch checked={v} onCheckedChange={on} />
    </label>
  );
}

function Stat({ icon, label, value, sub, pulse }: { icon: React.ReactNode; label: string; value: number; sub?: string; pulse?: boolean }) {
  return (
    <div className="rounded-2xl bg-gradient-card p-5 shadow-card">
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary ${pulse ? "animate-pulse" : ""}`}>{icon}</div>
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <div className="text-3xl font-black">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}
function Card({ title, icon, className = "", children }: { title: string; icon?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-2xl bg-card p-5 shadow-card ${className}`}>
      <div className="mb-4 flex items-center gap-2">
        {icon && <span className="text-primary">{icon}</span>}
        <h3 className="font-black">{title}</h3>
      </div>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Image uploader (Supabase storage: product-images)                   */
/* ------------------------------------------------------------------ */
function ImageUploader({ value, onChange, productId }: { value: string; onChange: (url: string) => void; productId: string }) {
  const [uploading, setUploading] = useState(false);
  const onFile = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const safe = productId.replace(/[^\w-]/g, "-") || "p";
      const path = `${safe}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("تم رفع الصورة");
    } catch (e: any) {
      toast.error(e.message || "فشل الرفع");
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {value ? (
          <img src={value} alt="" className="h-16 w-16 rounded-lg object-cover border border-border" />
        ) : (
          <div className="h-16 w-16 rounded-lg border-2 border-dashed border-border bg-secondary/30 flex items-center justify-center text-xs text-muted-foreground">لا صورة</div>
        )}
        <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-bold hover:bg-secondary">
          <Upload className="h-4 w-4" />
          {uploading ? "جاري الرفع..." : "رفع صورة"}
          <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
        </label>
        {value && (
          <Button type="button" size="icon" variant="ghost" onClick={() => onChange("")}><X className="h-4 w-4" /></Button>
        )}
      </div>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="أو الصق رابط صورة" className="text-xs" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* List editor for custom sizes / cuts                                 */
/* ------------------------------------------------------------------ */
function ListEditor({ label, hint, value, onChange }: {
  label: string; hint: string;
  value: { id: string; label: string; info?: string }[];
  onChange: (v: { id: string; label: string; info?: string }[]) => void;
}) {
  const text = (value || []).map((it) => it.info ? `${it.label} | ${it.info}` : it.label).join("\n");
  const parse = (raw: string) =>
    raw.split("\n").map((line) => line.trim()).filter(Boolean).map((line, i) => {
      const [lab, ...rest] = line.split("|").map((s) => s.trim());
      return { id: lab.toLowerCase().replace(/\s+/g, "-") || `c${i}`, label: lab, info: rest.join(" | ") || undefined };
    });
  return (
    <div>
      <div className="mb-1 text-xs font-bold">{label}</div>
      <Textarea
        value={text}
        onChange={(e) => onChange(parse(e.target.value))}
        placeholder={hint}
        className="min-h-20 text-sm"
      />
      <div className="mt-1 text-[10px] text-muted-foreground">{hint}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Coupons Tab                                                         */
/* ------------------------------------------------------------------ */
function CouponsTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ code: "", discount_type: "percent", discount_value: 10, max_uses: 10, active: true });

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase as any).from("coupons").select("*").order("created_at", { ascending: false });
    setRows(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.code.trim()) { toast.error("ادخل كود الكوبون"); return; }
    const { error } = await (supabase as any).from("coupons").insert({
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value) || 0,
      max_uses: Number(form.max_uses) || 1,
      active: form.active,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("تم إضافة الكوبون");
    setForm({ code: "", discount_type: "percent", discount_value: 10, max_uses: 10, active: true });
    load();
  };

  const update = async (id: string, patch: any) => {
    const { error } = await (supabase as any).from("coupons").update(patch).eq("id", id);
    if (error) { toast.error(error.message); return; }
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("حذف الكوبون؟")) return;
    const { error } = await (supabase as any).from("coupons").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("تم الحذف");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-card p-4 shadow-card">
        <h3 className="mb-3 text-lg font-extrabold">إضافة كوبون جديد</h3>
        <div className="grid gap-3 md:grid-cols-5">
          <div>
            <label className="mb-1 block text-xs font-bold">الكود</label>
            <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="WELCOME10" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold">نوع الخصم</label>
            <select
              value={form.discount_type}
              onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="percent">نسبة %</option>
              <option value="fixed">قيمة ثابتة</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold">قيمة الخصم</label>
            <Input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold">عدد الاستخدامات</label>
            <Input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: Number(e.target.value) })} />
          </div>
          <div className="flex items-end">
            <Button onClick={create} className="w-full bg-gradient-primary text-primary-foreground">
              <Plus className="ml-1 h-4 w-4" /> إضافة
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-card p-4 shadow-card">
        <h3 className="mb-3 text-lg font-extrabold">الكوبونات الحالية</h3>
        {loading ? (
          <p className="text-sm text-muted-foreground">جاري التحميل...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا توجد كوبونات بعد.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="border-b border-border text-xs text-muted-foreground">
                <tr>
                  <th className="px-2 py-2">الكود</th>
                  <th className="px-2 py-2">النوع</th>
                  <th className="px-2 py-2">القيمة</th>
                  <th className="px-2 py-2">الاستخدام</th>
                  <th className="px-2 py-2">مفعل</th>
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id} className="border-b border-border/50">
                    <td className="px-2 py-2 font-bold">{c.code}</td>
                    <td className="px-2 py-2">{c.discount_type === "percent" ? "نسبة %" : "قيمة ثابتة"}</td>
                    <td className="px-2 py-2">{c.discount_value}</td>
                    <td className="px-2 py-2">
                      <span className={c.used_count >= c.max_uses ? "text-destructive" : ""}>
                        {c.used_count} / {c.max_uses}
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <Switch checked={c.active} onCheckedChange={(v) => update(c.id, { active: v })} />
                    </td>
                    <td className="px-2 py-2">
                      <Button size="sm" variant="ghost" onClick={() => remove(c.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
