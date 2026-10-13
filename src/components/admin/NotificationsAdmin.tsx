import { useEffect, useState } from "react";
import { Bell, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { Tables } from "@/integrations/supabase/types";

export function NotificationsAdmin() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [rows, setRows] = useState<Tables<"customer_announcements">[]>([]);
  const load = async () => {
    const { data, error } = await supabase.from("customer_announcements").select("*").order("created_at", { ascending: false });
    if (error) return toast.error(error.message);
    setRows(data || []);
  };
  useEffect(() => { void load(); }, []);
  const send = async () => {
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    try {
      const { error } = await supabase.from("customer_announcements").insert({ title: title.trim(), body: body.trim() });
      if (error) throw error;
      setTitle(""); setBody("");
      toast.success("تم نشر الإشعار للعملاء داخل الموقع");
      await load();
    } catch (error) { toast.error(error instanceof Error ? error.message : "تعذر نشر الإشعار"); }
    finally { setSending(false); }
  };
  return <section className="mt-6 space-y-6" dir="rtl">
    <h2 className="flex items-center gap-2 text-xl font-bold"><Bell className="h-5 w-5" />إشعارات العملاء</h2>
    <div className="max-w-xl space-y-3">
      <label className="block space-y-2"><span className="text-sm font-bold">عنوان الإشعار</span><Input value={title} maxLength={150} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان الإشعار" /></label>
      <label className="block space-y-2"><span className="text-sm font-bold">نص الإشعار</span><Textarea value={body} maxLength={2000} onChange={(e) => setBody(e.target.value)} placeholder="نص الإشعار" className="min-h-28" /></label>
      <div className="border-r-2 border-primary bg-secondary/20 p-3"><h3 className="break-words font-bold">{title || "طيور الرشيدي"}</h3><p className="mt-1 whitespace-pre-wrap break-words text-sm text-muted-foreground">{body || "معاينة الإشعار"}</p></div>
      <Button disabled={sending || !title.trim() || !body.trim()} onClick={send}><Send className="ml-2 h-4 w-4" />{sending ? "جاري النشر..." : "نشر الإشعار داخل الموقع"}</Button>
      <p className="text-xs text-muted-foreground">إشعارات الموبايل غير مفعلة — ربط خدمة الإشعارات لم يكتمل.</p>
    </div>
    <div className="divide-y divide-border">
      {rows.length === 0 && <p className="py-6 text-sm text-muted-foreground">لا توجد إشعارات منشورة</p>}
      {rows.map((row) => <article key={row.id} className="flex items-start justify-between gap-4 py-4">
        <div className="min-w-0"><h3 className="break-words font-bold">{row.title}</h3><p className="mt-1 whitespace-pre-wrap break-words text-sm text-muted-foreground">{row.body}</p></div>
        <div className="flex shrink-0 items-center gap-2">
          <Switch checked={row.is_active} aria-label={`إظهار ${row.title}`} onCheckedChange={async (is_active) => { const { error } = await supabase.from("customer_announcements").update({ is_active }).eq("id", row.id); if (error) toast.error(error.message); else await load(); }} />
          <Button variant="ghost" size="icon" aria-label={`حذف ${row.title}`} onClick={async () => { if (!confirm("حذف الإشعار؟")) return; const { error } = await supabase.from("customer_announcements").delete().eq("id", row.id); if (error) toast.error(error.message); else await load(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      </article>)}
    </div>
  </section>;
}