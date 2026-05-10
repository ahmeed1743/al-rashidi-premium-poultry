import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/data/products";
import { Pencil, Trash2, Plus, LogOut, Upload } from "lucide-react";
import { toast } from "sonner";
import { resolveImage } from "@/lib/products-api";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "لوحة الإدارة — طيور الرشيدي" }] }),
  component: AdminPage,
});

const CUSTOMIZATIONS = [
  { v: "none", l: "بدون خيارات" },
  { v: "size-cut", l: "حجم + تقطيع" },
  { v: "duck", l: "نوع البط + تقطيع" },
  { v: "baladi-hor", l: "بلدي حر + تقطيع" },
  { v: "type-cut", l: "أبيض/بلدي + تقطيع (٢)" },
  { v: "type-cut-simple", l: "أبيض/بلدي + تقطيع" },
  { v: "cut-only", l: "تقطيع فقط" },
];

interface ProductRow {
  id: string;
  name: string;
  description: string;
  price: number;
  old_price: number | null;
  image_url: string;
  category: string;
  badge: string | null;
  customization: string;
  note: string | null;
  sort_order: number;
  is_active: boolean;
}

const blank: ProductRow = {
  id: "", name: "", description: "", price: 0, old_price: null,
  image_url: "", category: "white", badge: null, customization: "none",
  note: null, sort_order: 0, is_active: true,
};

function AdminPage() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setAuthed(false);
        return;
      }
      setAuthed(true);
      const { data: roles } = await supabase
        .from("user_roles" as any)
        .select("role")
        .eq("user_id", session.user.id);
      const admin = !!(roles as any[])?.some((r) => r.role === "admin");
      setIsAdmin(admin);
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange(() => check());
    return () => sub.subscription.unsubscribe();
  }, []);

  const { data: products = [], refetch } = useQuery({
    queryKey: ["admin-products"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products" as any)
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return (data || []) as unknown as ProductRow[];
    },
  });

  const save = async () => {
    if (!editing) return;
    if (!editing.id || !editing.name) {
      toast.error("ادخل المعرف والاسم");
      return;
    }
    const payload = { ...editing, price: Number(editing.price), old_price: editing.old_price ? Number(editing.old_price) : null, sort_order: Number(editing.sort_order) };
    const { error } = await supabase.from("products" as any).upsert(payload as any);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("تم الحفظ");
    setEditing(null);
    refetch();
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  const remove = async (id: string) => {
    if (!confirm("تأكيد الحذف؟")) return;
    const { error } = await supabase.from("products" as any).delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("تم الحذف");
    refetch();
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  const uploadImage = async (file: File) => {
    if (!editing) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${editing.id || Date.now()}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setEditing({ ...editing, image_url: data.publicUrl });
      toast.success("تم رفع الصورة");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    nav({ to: "/" });
  };

  if (authed === null) {
    return <SiteLayout><div className="container mx-auto px-4 py-20 text-center">جاري التحميل...</div></SiteLayout>;
  }
  if (!authed) {
    return (
      <SiteLayout>
        <div className="container mx-auto max-w-md px-4 py-20 text-center">
          <h1 className="mb-2 text-2xl font-black">يجب تسجيل الدخول</h1>
          <p className="mb-6 text-muted-foreground">سجل الدخول للوصول للوحة الإدارة.</p>
          <Link to="/login" className="inline-flex h-11 items-center rounded-xl bg-gradient-primary px-6 font-bold text-primary-foreground">
            تسجيل الدخول
          </Link>
        </div>
      </SiteLayout>
    );
  }
  if (!isAdmin) {
    return (
      <SiteLayout>
        <div className="container mx-auto max-w-md px-4 py-20 text-center">
          <h1 className="mb-2 text-2xl font-black">ليس لديك صلاحية</h1>
          <p className="mb-6 text-muted-foreground">حسابك ليس له صلاحية المسؤول. تواصل مع المالك لمنحك صلاحية admin.</p>
          <Button onClick={logout} variant="secondary">تسجيل الخروج</Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-black md:text-4xl">لوحة الإدارة</h1>
          <div className="flex gap-2">
            <Button onClick={() => setEditing({ ...blank })} className="bg-gradient-primary text-primary-foreground">
              <Plus className="ml-1 h-4 w-4" /> منتج جديد
            </Button>
            <Button onClick={logout} variant="secondary"><LogOut className="ml-1 h-4 w-4" /> خروج</Button>
          </div>
        </div>

        <div className="grid gap-3">
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-gradient-card p-3 shadow-card">
              <img src={resolveImage(p.category, p.image_url)} alt={p.name} className="h-16 w-16 flex-none rounded-lg object-cover" />
              <div className="flex-1 text-right">
                <div className="font-bold">{p.name} {!p.is_active && <span className="text-xs text-destructive">(مخفي)</span>}</div>
                <div className="text-xs text-muted-foreground">{p.category} • {p.price}ج {p.old_price && <s>{p.old_price}</s>}</div>
              </div>
              <button onClick={() => setEditing(p)} className="rounded-lg bg-secondary p-2 hover:bg-secondary/70"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => remove(p.id)} className="rounded-lg bg-destructive/20 p-2 text-destructive hover:bg-destructive/30"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>

        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setEditing(null)}>
            <div onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-card p-6 shadow-elegant">
              <h2 className="mb-4 text-xl font-black">{editing.id ? "تعديل المنتج" : "منتج جديد"}</h2>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="المعرف (id)" v={editing.id} onChange={(v) => setEditing({ ...editing, id: v })} />
                <Field label="الاسم" v={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
                <div className="md:col-span-2">
                  <Label className="text-sm">الوصف</Label>
                  <Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="mt-1.5 bg-background" />
                </div>
                <Field label="السعر" type="number" v={String(editing.price)} onChange={(v) => setEditing({ ...editing, price: Number(v) })} />
                <Field label="السعر القديم (اختياري)" type="number" v={editing.old_price?.toString() || ""} onChange={(v) => setEditing({ ...editing, old_price: v ? Number(v) : null })} />
                <div>
                  <Label className="text-sm">القسم</Label>
                  <Select value={editing.category} onValueChange={(v) => setEditing({ ...editing, category: v })}>
                    <SelectTrigger className="mt-1.5 bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">نوع التخصيص</Label>
                  <Select value={editing.customization} onValueChange={(v) => setEditing({ ...editing, customization: v })}>
                    <SelectTrigger className="mt-1.5 bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CUSTOMIZATIONS.map((c) => <SelectItem key={c.v} value={c.v}>{c.l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Field label="شارة (badge)" v={editing.badge || ""} onChange={(v) => setEditing({ ...editing, badge: v || null })} />
                <Field label="ترتيب" type="number" v={String(editing.sort_order)} onChange={(v) => setEditing({ ...editing, sort_order: Number(v) })} />
                <div className="md:col-span-2">
                  <Label className="text-sm">ملاحظة</Label>
                  <Input value={editing.note || ""} onChange={(e) => setEditing({ ...editing, note: e.target.value || null })} className="mt-1.5 bg-background" />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm">الصورة</Label>
                  <div className="mt-1.5 flex items-center gap-3">
                    {editing.image_url && <img src={editing.image_url} alt="" className="h-16 w-16 rounded-lg object-cover" />}
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm font-bold hover:bg-secondary/70">
                      <Upload className="h-4 w-4" /> {uploading ? "جاري الرفع..." : "رفع صورة"}
                      <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
                    </label>
                    <Input placeholder="أو ضع رابط الصورة" value={editing.image_url} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} className="bg-background" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={editing.is_active} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />
                  <Label>متاح للعرض</Label>
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <Button onClick={save} className="flex-1 bg-gradient-primary text-primary-foreground">حفظ</Button>
                <Button onClick={() => setEditing(null)} variant="secondary">إلغاء</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}

function Field({ label, v, onChange, type = "text" }: { label: string; v: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <Label className="text-sm">{label}</Label>
      <Input type={type} value={v} onChange={(e) => onChange(e.target.value)} className="mt-1.5 bg-background" />
    </div>
  );
}
