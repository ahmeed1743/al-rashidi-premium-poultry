import { useEffect, useState } from "react";
import { Megaphone, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

type SiteNotification = {
  id: string;
  title: string;
  body: string;
  link: string | null;
};

export function NotificationBanner() {
  const [notif, setNotif] = useState<SiteNotification | null>(null);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("notifications" as any)
        .select("id, title, body, link")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1);
      const n = (data?.[0] ?? null) as SiteNotification | null;
      if (!n) return;
      if (localStorage.getItem(`notif_dismissed_${n.id}`) === "1") return;
      setNotif(n);
      setHidden(false);
    })();
  }, []);

  if (!notif || hidden) return null;

  const internal = notif.link && notif.link.startsWith("/");
  const LinkTag = internal ? Link : "a";
  const linkProps = internal ? { to: notif.link! } : { href: notif.link!, target: "_blank", rel: "noreferrer" };

  return (
    <div className="relative border-b border-border/60 bg-gradient-primary/95 text-primary-foreground shadow-card">
      <div className="container mx-auto flex items-center gap-3 px-4 py-2.5">
        <Megaphone className="h-5 w-5 flex-none shrink-0" />
        <div className="min-w-0 flex-1">
          <span className="block text-sm font-black leading-tight md:text-base">{notif.title}</span>
          <span className="block text-xs opacity-90 md:text-sm">{notif.body}</span>
        </div>
        {notif.link && (
          <LinkTag
            {...(linkProps as any)}
            className="flex-none rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-extrabold underline underline-offset-2 hover:bg-primary-foreground/25"
          >
            اعرف أكتر
          </LinkTag>
        )}
        <button
          type="button"
          aria-label="إغلاق الإشعار"
          onClick={() => {
            localStorage.setItem(`notif_dismissed_${notif.id}`, "1");
            setHidden(true);
          }}
          className="flex-none rounded-full p-1 opacity-80 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
