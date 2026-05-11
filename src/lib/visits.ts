import { supabase } from "@/integrations/supabase/client";

const SID_KEY = "rashidy_sid";

function sid(): string {
  if (typeof window === "undefined") return "";
  let v = localStorage.getItem(SID_KEY);
  if (!v) {
    v = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(SID_KEY, v);
  }
  return v;
}

export function trackVisit(path: string) {
  if (typeof window === "undefined") return;
  // fire and forget
  supabase
    .from("visit_events")
    .insert({
      path,
      session_id: sid(),
      referrer: document.referrer || null,
      user_agent: navigator.userAgent.slice(0, 255),
    })
    .then((r) => {
      if (r.error) console.warn("visit", r.error.message);
    });
}
