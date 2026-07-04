import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Gift, Copy } from "lucide-react";

type Prize = { label: string; type: "coupon" | "gift" | "none"; code?: string; note?: string };
type Config = { enabled: boolean; prizes: Prize[]; cooldownDays?: number };

const LS_KEY = "spin_wheel_last_spin";
const PRIZE_KEY = "spin_wheel_prize";
const SESSION_KEY = "spin_wheel_session";

function getSessionId() {
  let s = localStorage.getItem(SESSION_KEY);
  if (!s) {
    s = (crypto.randomUUID?.() || String(Date.now() + Math.random()));
    localStorage.setItem(SESSION_KEY, s);
  }
  return s;
}

const COLORS = [
  "#f43f5e", "#f59e0b", "#10b981", "#3b82f6",
  "#a855f7", "#ec4899", "#14b8a6", "#f97316",
];

export function SpinWheel() {
  const [cfg, setCfg] = useState<Config | null>(null);
  const [open, setOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [result, setResult] = useState<Prize | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "spin_wheel")
        .maybeSingle();
      if (!data?.value) return;
      try {
        const parsed = JSON.parse(data.value as string) as Config;
        setCfg(parsed);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const prizes = cfg?.prizes || [];
  const canSpin = useMemo(() => {
    const last = Number(localStorage.getItem(LS_KEY) || 0);
    const cooldown = (cfg?.cooldownDays ?? 7) * 24 * 60 * 60 * 1000;
    return Date.now() - last > cooldown;
  }, [cfg, open]);

  if (!cfg?.enabled || prizes.length < 2) return null;

  const segAngle = 360 / prizes.length;

  const spin = () => {
    if (spinning || !canSpin) return;
    setResult(null);
    setSpinning(true);
    const idx = Math.floor(Math.random() * prizes.length);
    // Land the middle of segment idx at pointer (top, 0deg). Add 5 turns.
    const target = 360 * 6 - (idx * segAngle + segAngle / 2);
    setAngle(target);
    setTimeout(async () => {
      setSpinning(false);
      const prize = prizes[idx];
      setResult(prize);
      localStorage.setItem(LS_KEY, String(Date.now()));
      // log attempt + persist active prize for checkout auto-attach
      try {
        const { data } = await supabase
          .from("spin_attempts")
          .insert({
            session_id: getSessionId(),
            prize_label: prize.label,
            prize_type: prize.type,
            prize_code: prize.code || null,
          })
          .select("id")
          .maybeSingle();
        if (prize.type !== "none" && data?.id) {
          localStorage.setItem(
            PRIZE_KEY,
            JSON.stringify({ id: data.id, ...prize, won_at: Date.now() }),
          );
        }
      } catch { /* ignore */ }
    }, 4200);
  };

  const gradient = prizes
    .map((_, i) => `${COLORS[i % COLORS.length]} ${i * segAngle}deg ${(i + 1) * segAngle}deg`)
    .join(", ");

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="عجلة الحظ"
        className="group fixed bottom-24 left-4 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-rose-500 to-fuchsia-600 text-white shadow-2xl ring-4 ring-white/40 transition-all hover:scale-110 hover:ring-white/70 md:bottom-6"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-rose-500/40" />
        <Sparkles className="relative h-7 w-7 animate-pulse drop-shadow" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md overflow-hidden border-0 bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-black tracking-tight text-white">
              🎡 عجلة الحظ
            </DialogTitle>
            <p className="text-center text-xs text-white/70">لف العجلة واربح جائزة فورية!</p>
          </DialogHeader>

          {/* Wheel */}
          <div className="relative mx-auto my-6 h-80 w-80">
            {/* glow */}
            <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-amber-400/30 via-rose-500/30 to-fuchsia-600/30 blur-2xl" />

            {/* Pointer */}
            <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-2">
              <div className="relative">
                <div className="h-0 w-0 border-x-[16px] border-t-[26px] border-x-transparent border-t-white drop-shadow-xl" />
                <div className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1 rounded-full bg-white shadow" />
              </div>
            </div>

            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300 via-rose-400 to-fuchsia-500 p-[6px] shadow-[0_0_40px_rgba(244,63,94,0.5)]">
              <div className="relative h-full w-full rounded-full bg-slate-900 p-[4px]">
                <div
                  className="relative h-full w-full overflow-hidden rounded-full"
                  style={{
                    background: `conic-gradient(${gradient})`,
                    transform: `rotate(${angle}deg)`,
                    transition: spinning
                      ? "transform 4s cubic-bezier(0.17, 0.67, 0.16, 0.99)"
                      : "none",
                  }}
                >
                  {/* segment dividers + labels */}
                  {prizes.map((p, i) => {
                    const rot = i * segAngle + segAngle / 2;
                    return (
                      <div
                        key={i}
                        className="absolute left-1/2 top-1/2 h-1/2 origin-bottom"
                        style={{ transform: `translateX(-50%) rotate(${rot}deg)` }}
                      >
                        <div className="flex h-full flex-col items-center justify-start pt-4">
                          <span
                            className="block max-w-[80px] truncate text-center text-[11px] font-black leading-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                            style={{ transform: "rotate(180deg)" }}
                          >
                            {p.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Center hub */}
            <div className="absolute left-1/2 top-1/2 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-white to-slate-200 shadow-inner ring-4 ring-amber-300">
              <Sparkles className="h-6 w-6 text-rose-500" />
            </div>
          </div>

          {result ? (
            <div className="rounded-xl bg-gradient-to-br from-amber-100 to-pink-100 p-4 text-center dark:from-amber-900/30 dark:to-pink-900/30">
              <Gift className="mx-auto mb-2 h-8 w-8 text-amber-600" />
              <div className="text-lg font-black text-foreground">مبروك! ربحت</div>
              <div className="text-xl font-black text-primary">{result.label}</div>
              {result.note && <p className="mt-1 text-xs text-muted-foreground">{result.note}</p>}
              {result.type === "coupon" && result.code && (
                <div className="mt-3">
                  <div className="mb-1 text-xs text-muted-foreground">استخدم الكود عند الدفع:</div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(result.code!);
                      toast.success("تم نسخ الكود");
                    }}
                    className="mx-auto inline-flex items-center gap-2 rounded-lg border-2 border-dashed border-primary bg-background px-4 py-2 text-lg font-mono font-black text-primary"
                  >
                    {result.code}
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              )}
              {result.type === "gift" && (
                <p className="mt-2 text-xs text-muted-foreground">
                  اذكر جائزتك في ملاحظات الطلب عند الدفع.
                </p>
              )}
              <Button onClick={() => setOpen(false)} className="mt-4 w-full bg-gradient-primary text-primary-foreground">
                تمام
              </Button>
            </div>
          ) : (
            <div className="text-center">
              {canSpin ? (
                <Button
                  onClick={spin}
                  disabled={spinning}
                  className="h-12 w-full bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 text-base font-black text-white shadow-elegant"
                >
                  {spinning ? "جاري الدوران..." : "🎯 لف العجلة"}
                </Button>
              ) : (
                <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                  لعبت مؤخراً — رجّع تاني بعد فترة 🕐
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}