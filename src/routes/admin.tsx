import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { PRODUCTS } from "@/data/products";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from "recharts";
import { Users, ShoppingBag, Package, TrendingUp, LogOut, Tag } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "لوحة الإدارة — طيور الرشيدي" }] }),
  component: AdminPage,
});

interface Stats {
  visitsToday: number;
  visitsWeek: number;
  ordersToday: number;
  ordersTotal: number;
  productsCount: number;
  offersCount: number;
  dailyOrders: { day: string; count: number }[];
  dailyVisits: { day: string; count: number }[];
  recentOrders: any[];
}

function AdminPage() {
  const nav = useNavigate();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { setAuthed(false); return; }
      const { data: roles } = await supabase
        .from("user_roles").select("role").eq("user_id", data.user.id).eq("role", "admin");
      setAuthed(!!roles?.length);
    })();
  }, []);

  useEffect(() => {
    if (!authed) return;
    (async () => {
      const now = new Date();
      const startToday = new Date(now); startToday.setHours(0, 0, 0, 0);
      const startWeek = new Date(now); startWeek.setDate(startWeek.getDate() - 6); startWeek.setHours(0, 0, 0, 0);

      const [visitsT, visitsW, ordersT, ordersAll, recent] = await Promise.all([
        supabase.from("visit_events").select("id", { count: "exact", head: true }).gte("created_at", startToday.toISOString()),
        supabase.from("visit_events").select("created_at").gte("created_at", startWeek.toISOString()),
        supabase.from("orders").select("id", { count: "exact", head: true }).gte("created_at", startToday.toISOString()),
        supabase.from("orders").select("id, created_at, customer_name, phone, total, mode, items, time_slot, region", { count: "exact" }).order("created_at", { ascending: false }).limit(15),
        supabase.from("orders").select("created_at").gte("created_at", startWeek.toISOString()),
      ]);

      const days: { day: string; count: number }[] = [];
      const visitDays: { day: string; count: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now); d.setDate(d.getDate() - i);
        const k = `${d.getDate()}/${d.getMonth() + 1}`;
        days.push({ day: k, count: 0 });
        visitDays.push({ day: k, count: 0 });
      }
      (recent.data || []).forEach((o: any) => {
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

      setStats({
        visitsToday: visitsT.count || 0,
        visitsWeek: visitsW.data?.length || 0,
        ordersToday: ordersT.count || 0,
        ordersTotal: ordersAll.count || 0,
        productsCount: PRODUCTS.length,
        offersCount: PRODUCTS.filter((p) => p.oldPrice || p.badge).length,
        dailyOrders: days,
        dailyVisits: visitDays,
        recentOrders: ordersAll.data || [],
      });
    })();
  }, [authed]);

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

        {!stats ? (
          <div className="text-center text-muted-foreground">جاري تحميل البيانات...</div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat icon={<Users className="h-5 w-5" />} label="زوار اليوم" value={stats.visitsToday} sub={`${stats.visitsWeek} زائر هذا الأسبوع`} />
              <Stat icon={<ShoppingBag className="h-5 w-5" />} label="طلبات اليوم" value={stats.ordersToday} sub={`${stats.ordersTotal} طلب إجمالي`} />
              <Stat icon={<Package className="h-5 w-5" />} label="المنتجات" value={stats.productsCount} sub={`${stats.offersCount} منتج بعرض`} />
              <Stat icon={<Tag className="h-5 w-5" />} label="العروض" value={stats.offersCount} sub="منتجات مميزة" />
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
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

            <Card title="آخر الطلبات" className="mt-6">
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
                    {stats.recentOrders.slice(0, 15).map((o: any) => (
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

            <div className="mt-6 rounded-xl border border-gold/40 bg-gold/10 p-4 text-sm text-gold">
              💡 إدارة المنتجات والأسعار CRUD كاملة — جاهزة للإطلاق في الجولة القادمة (يبني على نفس الجداول).
            </div>
          </>
        )}
      </div>
    </SiteLayout>
  );
}

function Stat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-2xl bg-gradient-card p-5 shadow-card">
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">{icon}</div>
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
