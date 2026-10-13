import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function Notifications() {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState<string[]>([]);
  const { data: notifications = [] } = useQuery({
    queryKey: ["customer-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase.from("customer_announcements").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000,
  });
  useEffect(() => {
    try { setSeen(JSON.parse(localStorage.getItem("elrashidy-notifications-seen") || "[]")); } catch { setSeen([]); }
  }, []);
  const unread = notifications.filter((item) => !seen.includes(item.id)).length;
  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      const ids = notifications.map((item) => item.id);
      setSeen(ids);
      localStorage.setItem("elrashidy-notifications-seen", JSON.stringify(ids));
    }
  };
  return <>
    <Button variant="ghost" size="icon" onClick={() => onOpenChange(true)} className="relative h-9 w-9 rounded-full glass md:h-11 md:w-11" aria-label="الإشعارات">
      <Bell className="h-5 w-5" />
      {unread > 0 && <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{unread}</span>}
    </Button>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader><DialogTitle className="text-right">إشعارات طيور الرشيدي</DialogTitle></DialogHeader>
        <div className="max-h-[60vh] space-y-4 overflow-y-auto">
          {notifications.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">لا توجد إشعارات حالياً</p>}
          {notifications.map((item) => <article key={item.id} className="border-b border-border pb-4">
            <h3 className="break-words font-bold">{item.title}</h3>
            <p className="mt-2 whitespace-pre-wrap break-words text-sm text-muted-foreground">{item.body}</p>
            <time className="mt-2 block text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString("ar-EG", { timeZone: "Africa/Cairo" })}</time>
          </article>)}
        </div>
      </DialogContent>
    </Dialog>
  </>;
}