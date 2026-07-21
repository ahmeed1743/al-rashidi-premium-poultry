import { useCallback, useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Gift, Copy } from "lucide-react";

export type Prize = {
  label: string;
  type: "coupon" | "gift" | "none";
  code?: string;
  note?: string;
  weight?: number;      // relative probability (0 = never)
  enabled?: boolean;    // default true when undefined
  maxWins?: number;     // 0 or undefined = unlimited
  color?: string;       // custom sector color
  icon?: string;        // emoji shown on the sector
};
export type SpinTrigger = "floating" | "after_order";
export type SpinConfig = {
  enabled: boolean;
  prizes: Prize[];
  cooldownDays?: number;
  trigger?: SpinTrigger;
  minOrderTotal?: number;   // only show wheel when subtotal >= this
};
export type ActivePrize = Prize & { id: string; won_at: number };

const LS_KEY_BASE = "spin_wheel_last_spin";
const PRIZE_KEY = "spin_wheel_prize";
const SESSION_KEY = "spin_wheel_session";
const DEVICE_KEY = "spin_wheel_device_id";
const lastKey = (phone?: string) => (phone ? `${LS_KEY_BASE}:${phone}` : LS_KEY_BASE);

function getSessionId() {
  let s = localStorage.getItem(SESSION_KEY);
  if (!s) {
    s = (crypto.randomUUID?.() || String(Date.now() + Math.random()));
    localStorage.setItem(SESSION_KEY, s);
  }
  return s;
}

/** Stable-ish device fingerprint. Not cryptographic — deters casual replay. */
export function getDeviceId(): string {
  let d = localStorage.getItem(DEVICE_KEY);
  if (d) return d;
  try {
    const parts = [
      navigator.userAgent,
      navigator.language,
      String(screen.width) + "x" + String(screen.height),
      String(screen.colorDepth),
      Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      String(navigator.hardwareConcurrency || ""),
    ].join("|");
    let h = 0;
    for (let i = 0; i < parts.length; i++) h = (h * 31 + parts.charCodeAt(i)) | 0;
    const rnd = crypto.randomUUID?.().slice(0, 8) || Math.random().toString(36).slice(2, 10);
    d = `d_${Math.abs(h).toString(36)}_${rnd}`;
  } catch {
    d = `d_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  }
  localStorage.setItem(DEVICE_KEY, d);
  return d;
}

/** Async cooldown check against DB by device_id AND phone. Falls back to localStorage. */
export async function canSpinNowAsync(cfg: SpinConfig | null, phone?: string): Promise<boolean> {
  if (!cfg?.enabled || (cfg.prizes || []).length < 2) return false;
  const cooldown = (cfg.cooldownDays ?? 1) * 24 * 60 * 60 * 1000;
  const cutoff = new Date(Date.now() - cooldown).toISOString();
  const deviceId = getDeviceId();
  try {
    const orFilter = phone
      ? `device_id.eq.${deviceId},order_phone.eq.${phone}`
      : `device_id.eq.${deviceId}`;
    const { data, error } = await supabase
      .from("spin_attempts" as any)
      .select("id")
      .or(orFilter)
      .gte("created_at", cutoff)
      .limit(1);
    if (error) return canSpinNow(cfg, phone);
    return (data?.length ?? 0) === 0;
  } catch {
    return canSpinNow(cfg, phone);
  }
}

const DEFAULT_COLORS = [
  "#ef4444", "#f59e0b", "#10b981", "#0ea5e9",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316",
  "#eab308", "#22c55e", "#3b82f6", "#d946ef",
];

/** Filter prizes to only enabled + not exceeding maxWins. */
function availablePrizes(prizes: Prize[], winCounts: Record<string, number>) {
  return prizes
    .map((p, idx) => ({ p, idx }))
    .filter(({ p }) => p.enabled !== false)
    .filter(({ p }) => !p.maxWins || (winCounts[p.label] ?? 0) < p.maxWins);
}

/** Weighted random pick returning index into the ORIGINAL prizes array. */
function pickWeighted(prizes: Prize[], winCounts: Record<string, number>): number {
  const avail = availablePrizes(prizes, winCounts);
  if (!avail.length) return Math.floor(Math.random() * prizes.length);
  const weights = avail.map(({ p }) => Math.max(0, p.weight ?? 1));
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) return avail[Math.floor(Math.random() * avail.length)].idx;
  let r = Math.random() * total;
  for (let i = 0; i < avail.length; i++) {
    r -= weights[i];
    if (r <= 0) return avail[i].idx;
  }
  return avail[avail.length - 1].idx;
}

export function canSpinNow(cfg: SpinConfig | null, phone?: string) {
  if (!cfg?.enabled || (cfg.prizes || []).length < 2) return false;
  const last = Number(localStorage.getItem(lastKey(phone)) || 0);
  const cooldown = (cfg.cooldownDays ?? 7) * 24 * 60 * 60 * 1000;
  return Date.now() - last > cooldown;
}

export async function loadSpinConfig(): Promise<SpinConfig | null> {
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "spin_wheel")
    .maybeSingle();
  if (!data?.value) return null;
  try {
    return JSON.parse(data.value as string) as SpinConfig;
  } catch {
    return null;
  }
}

export function SpinWheel() {
  const [cfg, setCfg] = useState<Config | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadSpinConfig().then(setCfg);
  }, []);

  if (!cfg?.enabled || (cfg.prizes || []).length < 2) return null;
  if ((cfg.trigger ?? "floating") !== "floating") return null;

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
      <SpinWheelDialog open={open} onOpenChange={setOpen} config={cfg} />
    </>
  );
}

/* ------------------------------------------------------------- */
/* Controlled dialog — usable from anywhere (checkout, floating)  */
/* ------------------------------------------------------------- */

type Config = SpinConfig;

export function SpinWheelDialog({
  open,
  onOpenChange,
  config,
  phone,
  onPrizeWon,
  onFinished,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  config: SpinConfig | null;
  phone?: string;
  onPrizeWon?: (p: ActivePrize) => void;
  onFinished?: () => void;
}) {
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [result, setResult] = useState<Prize | null>(null);

  const prizes = config?.prizes || [];
  const canSpin = useMemo(
    () => canSpinNow(config, phone),
    [config, phone, open],
  );

  const [winCounts, setWinCounts] = useState<Record<string, number>>({});
  const [canSpinDB, setCanSpinDB] = useState<boolean>(true);
  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data } = await supabase
        .from("spin_attempts")
        .select("prize_label")
        .in("prize_label", prizes.map((p) => p.label));
      const counts: Record<string, number> = {};
      (data || []).forEach((r: any) => {
        const k = r.prize_label as string;
        counts[k] = (counts[k] ?? 0) + 1;
      });
      setWinCounts(counts);
      // DB-backed cooldown check (device + phone)
      const ok = await canSpinNowAsync(config, phone);
      setCanSpinDB(ok);
    })();
  }, [open]);

  useEffect(() => {
    if (open) {
      setResult(null);
      setAngle(0);
      setSpinning(false);
    }
  }, [open]);

  const spin = useCallback(() => {
    if (spinning || !canSpin || !canSpinDB || !config) return;
    setResult(null);
    setSpinning(true);
    const segAngle = 360 / prizes.length;
    const idx = pickWeighted(prizes, winCounts);
    const target = 360 * 6 - (idx * segAngle + segAngle / 2);
    setAngle(target);
    setTimeout(async () => {
      setSpinning(false);
      const prize = prizes[idx];
      setResult(prize);
      localStorage.setItem(lastKey(phone), String(Date.now()));
      try {
        const cooldownMs = (config.cooldownDays ?? 1) * 24 * 60 * 60 * 1000;
        const { data } = await supabase
          .from("spin_attempts")
          .insert({
            session_id: getSessionId(),
            device_id: getDeviceId(),
            prize_label: prize.label,
            prize_type: prize.type,
            prize_code: prize.code || null,
            order_phone: phone || null,
            cooldown_end: new Date(Date.now() + cooldownMs).toISOString(),
          } as any)
          .select("id")
          .maybeSingle();
        if (prize.type !== "none" && data?.id) {
          const active: ActivePrize = {
            id: data.id,
            label: prize.label,
            type: prize.type,
            code: prize.code,
            note: prize.note,
            won_at: Date.now(),
          };
          localStorage.setItem(PRIZE_KEY, JSON.stringify(active));
          onPrizeWon?.(active);
        }
      } catch {
        /* ignore */
      }
    }, 4200);
  }, [spinning, canSpin, canSpinDB, config, prizes, phone, onPrizeWon, winCounts]);

  if (!config?.enabled || prizes.length < 2) return null;

  const segAngle = 360 / prizes.length;

  const done = () => {
    onOpenChange(false);
    onFinished?.();
  };

  // Build SVG sectors
  const SIZE = 300;
  const R = SIZE / 2;
  const cx = R;
  const cy = R;
  const toRad = (deg: number) => (deg - 90) * (Math.PI / 180); // start at top
  const sectorPath = (i: number) => {
    const a0 = i * segAngle;
    const a1 = (i + 1) * segAngle;
    const x0 = cx + R * Math.cos(toRad(a0));
    const y0 = cy + R * Math.sin(toRad(a0));
    const x1 = cx + R * Math.cos(toRad(a1));
    const y1 = cy + R * Math.sin(toRad(a1));
    const large = segAngle > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1} Z`;
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) done(); else onOpenChange(v); }}>
      <DialogContent
        className="w-[95vw] max-w-md overflow-hidden border-0 bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 p-4 text-white sm:p-6"
      >
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-black tracking-tight text-white sm:text-2xl">
            🎡 عجلة الحظ
          </DialogTitle>
          <p className="text-center text-[11px] text-white/70 sm:text-xs">
            لف العجلة واربح جائزة فورية على طلبك!
          </p>
        </DialogHeader>

        {/* Wheel */}
        <div
          className="relative mx-auto my-4 sm:my-6"
          style={{ width: "min(78vw, 22rem)", height: "min(78vw, 22rem)" }}
        >
          <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-amber-400/30 via-rose-500/30 to-fuchsia-600/30 blur-2xl" />

          {/* Pointer */}
          <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1">
            <div className="relative">
              <div className="h-0 w-0 border-x-[14px] border-t-[24px] border-x-transparent border-t-amber-300 drop-shadow-xl" />
              <div className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1 rounded-full bg-amber-300 shadow ring-2 ring-white" />
            </div>
          </div>

          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300 via-rose-400 to-fuchsia-500 p-[6px] shadow-[0_0_50px_rgba(244,63,94,0.55)]">
            <div className="relative h-full w-full rounded-full bg-slate-900 p-[4px]">
              <div
                className="relative h-full w-full overflow-hidden rounded-full"
                style={{
                  transform: `rotate(${angle}deg)`,
                  transition: spinning
                    ? "transform 4s cubic-bezier(0.17, 0.67, 0.16, 0.99)"
                    : "none",
                }}
              >
                <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full">
                  {prizes.map((p, i) => {
                    const color = p.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
                    // Label placement: mid-angle, at ~65% radius, tangent to arc.
                    const midDeg = i * segAngle + segAngle / 2;
                    const rLabel = R * 0.62;
                    const lx = cx + rLabel * Math.cos(toRad(midDeg));
                    const ly = cy + rLabel * Math.sin(toRad(midDeg));
                    // Rotate text so its baseline points outward (radial reading)
                    const textRot = midDeg; // 0 at top
                    const label = `${p.icon ? p.icon + " " : ""}${p.label}`;
                    const fontSize = prizes.length > 8 ? 10 : prizes.length > 6 ? 12 : 14;
                    return (
                      <g key={i}>
                        <path d={sectorPath(i)} fill={color} stroke="rgba(255,255,255,0.55)" strokeWidth={1.5} />
                        <g transform={`translate(${lx} ${ly}) rotate(${textRot})`}>
                          <text
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="#fff"
                            fontSize={fontSize}
                            fontWeight={900}
                            style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,0.85)", strokeWidth: 3, strokeLinejoin: "round" } as any}
                          >
                            {label.length > 14 ? label.slice(0, 13) + "…" : label}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                  {/* inner shading */}
                  <circle cx={cx} cy={cy} r={R} fill="url(#innerShade)" pointerEvents="none" />
                  <defs>
                    <radialGradient id="innerShade">
                      <stop offset="55%" stopColor="rgba(0,0,0,0)" />
                      <stop offset="100%" stopColor="rgba(0,0,0,0.35)" />
                    </radialGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>

          {/* Center hub */}
          <div className="absolute left-1/2 top-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-white to-slate-200 shadow-inner ring-4 ring-amber-300 sm:h-16 sm:w-16">
            <Sparkles className="h-5 w-5 text-rose-500 sm:h-6 sm:w-6" />
          </div>
        </div>

        {result ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur sm:p-5">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-rose-500 shadow-lg sm:h-14 sm:w-14">
              <Gift className="h-6 w-6 text-white sm:h-7 sm:w-7" />
            </div>
            <div className="text-xs font-bold text-white/80 sm:text-sm">
              {result.type === "none" ? "😔 حظاً أوفر المرة القادمة" : "🎉 مبروك! ربحت"}
            </div>
            <div className="mt-1 text-xl font-black text-amber-300 sm:text-2xl">{result.label}</div>
            {result.note && <p className="mt-1 text-[11px] text-white/60 sm:text-xs">{result.note}</p>}
            {result.type === "coupon" && result.code && (
              <div className="mt-3">
                <div className="mb-1 text-[10px] text-white/60 sm:text-[11px]">الكود:</div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(result.code!);
                    toast.success("تم نسخ الكود");
                  }}
                  className="mx-auto inline-flex items-center gap-2 rounded-lg border-2 border-dashed border-amber-300 bg-white/10 px-3 py-1.5 font-mono text-base font-black text-amber-200 sm:text-lg"
                >
                  {result.code}
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            )}
            {result.type !== "none" && (
              <p className="mt-3 rounded-lg bg-emerald-500/20 px-3 py-2 text-[11px] font-bold text-emerald-200 sm:text-xs">
                ✓ تمت إضافة الجائزة على طلبك
              </p>
            )}
            <Button
              onClick={done}
              className="mt-4 h-11 w-full bg-gradient-to-r from-amber-400 to-rose-500 text-white hover:opacity-90"
            >
              متابعة
            </Button>
          </div>
        ) : (
          <div className="text-center">
            {canSpin && canSpinDB ? (
              <Button
                onClick={spin}
                disabled={spinning}
                className="h-12 w-full rounded-xl bg-gradient-to-r from-amber-400 via-rose-500 to-fuchsia-600 text-base font-black text-white shadow-lg hover:opacity-95 sm:h-14 sm:text-lg"
              >
                {spinning ? "🎡 جاري الدوران..." : "🎯 لف العجلة"}
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/70 sm:text-sm">
                  🕐 لعبت مؤخراً من هذا الجهاز أو الرقم — رجّع تاني بعد فترة
                </div>
                <Button onClick={done} variant="secondary" className="w-full">
                  تخطي
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}