import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Minus, Plus, ShoppingCart, Info } from "lucide-react";
import type { Product, ProductConfig } from "@/data/products";
import { useCart, type CartItem } from "@/store/cart";
import { getSchema, type Group, type UnitOption, type CustomSchema } from "@/data/customization";
import { toast } from "sonner";

/** Chip whose explanation popover opens automatically when clicked */
function InfoChip({
  active, onClick, children, info, danger, size = "md",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  info?: string;
  danger?: boolean;
  size?: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);
  const handle = () => {
    onClick();
    if (info) {
      setOpen(true);
      window.setTimeout(() => setOpen(false), 2800);
    }
  };
  const cls =
    size === "sm"
      ? "rounded-lg px-3 py-1.5 text-xs"
      : "rounded-full px-4 py-2 text-sm";
  const btn = (
    <button
      type="button"
      onClick={handle}
      className={`relative inline-flex items-center gap-1.5 border font-bold transition-all ${cls} ${
        active
          ? "border-primary bg-gradient-primary text-primary-foreground shadow-elegant"
          : danger
            ? "border-destructive/50 bg-destructive/5 text-destructive/90 hover:border-destructive"
            : "border-border bg-secondary/40 text-foreground/80 hover:border-primary/50"
      }`}
    >
      {children}
      {info && <Info className={size === "sm" ? "h-3 w-3 opacity-70" : "h-3.5 w-3.5 opacity-70"} />}
    </button>
  );
  if (!info) return btn;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{btn}</PopoverTrigger>
      <PopoverContent side="top" className="w-auto max-w-[260px] text-right text-sm font-semibold">
        {info}
      </PopoverContent>
    </Popover>
  );
}

function GroupRow({
  groups, value, onChange, label, required,
}: {
  groups: Group[];
  value: string;
  onChange: (id: string) => void;
  label: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-bold">
        {label} {required && <span className="text-destructive">*</span>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {groups.map((g) => (
          <InfoChip key={g.id} active={value === g.id} onClick={() => onChange(g.id)} info={g.info}>
            {g.label}
          </InfoChip>
        ))}
      </div>
    </div>
  );
}

function SubRow({
  options, value, onChange, danger,
}: {
  options: NonNullable<Group["subOptions"]>;
  value: string;
  onChange: (id: string) => void;
  danger?: boolean;
}) {
  return (
    <div className={`space-y-2 rounded-xl border p-3 ${danger ? "border-destructive/50 bg-destructive/5" : "border-primary/30 bg-primary/5"}`}>
      <div className="text-xs font-bold text-muted-foreground">اختر طريقة (مطلوب)</div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <InfoChip key={o.id} size="sm" active={value === o.id} onClick={() => onChange(o.id)} info={o.info}>
            {o.label}
          </InfoChip>
        ))}
      </div>
    </div>
  );
}

function UnitRow({
  units, value, onChange,
}: { units: UnitOption[]; value: string; onChange: (id: string) => void }) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-bold">طريقة الطلب <span className="text-destructive">*</span></div>
      <div className="grid grid-cols-2 gap-2">
        {units.map((u) => (
          <button
            key={u.id}
            type="button"
            onClick={() => onChange(u.id)}
            className={`rounded-xl border-2 px-4 py-3 text-center text-sm font-extrabold transition-all ${
              value === u.id
                ? "border-primary bg-gradient-primary text-primary-foreground shadow-elegant"
                : "border-border bg-secondary/40 hover:border-primary/50"
            }`}
          >
            {u.label}
            <div className="mt-0.5 text-[10px] font-normal opacity-80">
              {u.id === "kg" ? "تقدر تطلب كسور (نص كيلو)" : "بالقطعة"}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function ProductDialog({
  product, open, onOpenChange, editing,
}: {
  product: Product;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing?: CartItem;
}) {
  const add = useCart((s) => s.addItem);
  const replace = useCart((s) => s.replaceItem);
  const schema = useMemo<CustomSchema>(() => {
    const base = getSchema(product.customization);
    const cfg: ProductConfig = product.config || {};
    let units = base.units;
    if (cfg.allowHalfKg === false && units) {
      units = units.map((u) => (u.id === "kg" ? { ...u, step: 1 } : u));
    }
    if (cfg.hideUnit) units = undefined;
    if (cfg.forceUnit && base.units) {
      const f = base.units.find((u) => u.id === cfg.forceUnit);
      units = f ? [f] : units;
    }
    let cuts = base.cuts;
    if (cfg.hideCuts) cuts = undefined;
    else if (cuts && (cfg.hideSalkh || cfg.hideKhaly)) {
      cuts = cuts.filter((g) =>
        !(cfg.hideSalkh && g.id === "salkh") && !(cfg.hideKhaly && g.id === "khaly"),
      );
    }
    const sizes = cfg.hideSize ? undefined : base.sizes;
    return { ...base, units, cuts, sizes };
  }, [product.customization, product.config]);

  const [unitId, setUnitId] = useState("");
  const [sizeId, setSizeId] = useState("");
  const [typeId, setTypeId] = useState("");
  const [cutId, setCutId] = useState("");
  const [cutSubId, setCutSubId] = useState("");
  const [note, setNote] = useState("");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setUnitId(editing.raw?.unitId || "");
      setSizeId(editing.raw?.sizeId || "");
      setTypeId(editing.raw?.typeId || "");
      setCutId(editing.raw?.cutId || "");
      setCutSubId(editing.raw?.cutSubId || "");
      setNote(editing.generalNote || "");
      setQty(editing.quantity);
    } else {
      setUnitId(schema.units && schema.units.length === 1 ? schema.units[0].id : "");
      setSizeId(schema.sizes?.[0]?.id || "");
      setTypeId(schema.types?.[0]?.id || "");
      setCutId("");
      setCutSubId("");
      setNote("");
      setQty(1);
    }
  }, [open, product.id]);

  const cutGroup = schema.cuts?.find((g) => g.id === cutId);
  const sizeGroup = schema.sizes?.find((g) => g.id === sizeId);
  const typeGroup = schema.types?.find((g) => g.id === typeId);
  const unitOpt = schema.units?.find((u) => u.id === unitId);

  const subMissing = !!(cutGroup?.subRequired && cutGroup.subOptions?.length && !cutSubId);
  const unitMissing = !!(schema.units && schema.units.length && !unitId);

  const halfPair = !!product.config?.halfPair;
  const step = unitOpt?.step || (product.pairUnit && halfPair ? 0.5 : 1);
  const setQtySafe = (q: number) =>
    setQty(parseFloat(Math.max(step, Math.round(q / step) * step).toFixed(2)));

  // Reset qty when changing unit (kg → 1, count → 1)
  useEffect(() => {
    if (unitId) setQty(step);
  }, [unitId]); // eslint-disable-line

  const handleSubmit = () => {
    if (unitMissing) return toast.error("اختر طريقة الطلب (كيلو أو عدد)");
    if (subMissing) return toast.error("اختر طريقة التقطيع");

    const opts: Record<string, string> = {};
    if (unitOpt) opts["الطلب"] = unitOpt.label;
    if (sizeGroup) opts["الحجم"] = sizeGroup.label;
    if (typeGroup) opts["النوع"] = typeGroup.label;
    if (cutGroup) {
      const sub = cutGroup.subOptions?.find((s) => s.id === cutSubId);
      opts["التقطيع"] = sub ? `${cutGroup.label} - ${sub.label}` : cutGroup.label;
    }

    const payload = {
      productId: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: qty,
      pairUnit: product.pairUnit,
      unitId: unitOpt?.id,
      unitLabel: unitOpt?.unitLabel,
      step,
      options: Object.keys(opts).length ? opts : undefined,
      generalNote: note.trim() || undefined,
      raw: { unitId, sizeId, typeId, cutId, cutSubId, note },
    };

    if (editing) {
      replace(editing.uid, payload);
      toast.success("تم تعديل المنتج");
    } else {
      add(payload);
      toast.success("تمت الإضافة للسلة", { description: product.name });
    }
    onOpenChange(false);
  };

  const qtyLabel = product.pairUnit ? "جوز" : unitOpt ? unitOpt.unitLabel : "كمية";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-right text-xl">
            {editing ? "تعديل المنتج" : product.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 text-right">
          <div className="overflow-hidden rounded-xl">
            <img src={product.image} alt={product.name} className="h-52 w-full object-cover" />
          </div>
          {product.description && <p className="text-sm text-muted-foreground">{product.description}</p>}
          {product.note && (
            <div className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm font-semibold text-gold">
              ملاحظة: {product.note}
            </div>
          )}

          {schema.units && schema.units.length > 0 && (
            <UnitRow units={schema.units} value={unitId} onChange={setUnitId} />
          )}
          {schema.sizes && schema.sizes.length > 0 && (
            <GroupRow groups={schema.sizes} value={sizeId} onChange={setSizeId} label="الحجم" />
          )}
          {schema.types && schema.types.length > 0 && (
            <GroupRow groups={schema.types} value={typeId} onChange={setTypeId} label="النوع" />
          )}

          {schema.cuts && schema.cuts.length > 0 && (
            <div className="space-y-2">
              <GroupRow
                groups={schema.cuts}
                value={cutId}
                onChange={(id) => { setCutId(id); setCutSubId(""); }}
                label="التقطيع"
              />
              {cutGroup?.subOptions && (
                <SubRow options={cutGroup.subOptions} value={cutSubId} onChange={setCutSubId} danger={subMissing} />
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <div className="text-sm font-bold">ملاحظات إضافية (اختياري)</div>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="أي طلب خاص للتقطيع أو التحضير..."
              className="min-h-16"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl bg-secondary/40 p-3">
            <div className="text-sm font-bold">{qtyLabel}</div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQtySafe(qty - step)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-background"
                disabled={qty <= step}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-10 text-center font-black">{qty}</span>
              <button
                onClick={() => setQtySafe(qty + step)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            className="h-12 w-full rounded-xl bg-gradient-primary text-base font-extrabold text-primary-foreground shadow-elegant hover:opacity-95"
          >
            <ShoppingCart className="ml-2 h-5 w-5" />
            {editing ? "حفظ التعديلات" : "أضف للسلة"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
