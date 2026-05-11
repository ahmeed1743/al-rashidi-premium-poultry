import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Minus, Plus, ShoppingCart, Info } from "lucide-react";
import type { Product } from "@/data/products";
import { useCart, type CartItem } from "@/store/cart";
import { getSchema, type Group } from "@/data/customization";
import { toast } from "sonner";

function InfoBtn({ text }: { text: string }) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="text-muted-foreground hover:text-primary" aria-label={text}>
            <Info className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[240px] text-right">{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function Chip({
  active, onClick, children, danger,
}: { active: boolean; onClick: () => void; children: React.ReactNode; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-bold transition-all ${
        active
          ? "border-primary bg-gradient-primary text-primary-foreground shadow-elegant"
          : danger
            ? "border-destructive/40 bg-destructive/5 text-destructive/90 hover:border-destructive"
            : "border-border bg-secondary/40 text-foreground/80 hover:border-primary/50"
      }`}
    >
      {children}
    </button>
  );
}

function GroupChips({
  groups, value, onChange, label,
}: {
  groups: Group[];
  value: string;
  onChange: (id: string) => void;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-bold">{label}</div>
      <div className="flex flex-wrap items-center gap-2">
        {groups.map((g) => (
          <div key={g.id} className="flex items-center gap-1">
            <Chip active={value === g.id} onClick={() => onChange(g.id)}>{g.label}</Chip>
            {g.info && <InfoBtn text={g.info} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function SubRadio({
  options, value, onChange, danger,
}: {
  options: NonNullable<Group["subOptions"]>;
  value: string;
  onChange: (id: string) => void;
  danger?: boolean;
}) {
  return (
    <div className={`space-y-2 rounded-xl border p-3 ${danger ? "border-destructive/50 bg-destructive/5" : "border-primary/30 bg-primary/5"}`}>
      <div className="text-xs font-bold text-muted-foreground">
        {danger ? "اختر طريقة (مطلوب)" : "اختر طريقة"}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((o) => (
          <label
            key={o.id}
            className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-all ${
              value === o.id
                ? "border-primary bg-gradient-primary text-primary-foreground"
                : "border-border bg-background hover:border-primary/40"
            }`}
          >
            <span className="flex items-center gap-2">
              <input
                type="radio"
                checked={value === o.id}
                onChange={() => onChange(o.id)}
                className="accent-primary"
              />
              {o.label}
            </span>
            {o.info && (
              <span onClick={(e) => e.preventDefault()}>
                <InfoBtn text={o.info} />
              </span>
            )}
          </label>
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
  const schema = useMemo(() => getSchema(product.customization), [product.customization]);

  const [sizeId, setSizeId] = useState("");
  const [typeId, setTypeId] = useState("");
  const [cutId, setCutId] = useState("");
  const [cutSubId, setCutSubId] = useState("");
  const [note, setNote] = useState("");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setSizeId(editing.raw?.sizeId || "");
      setTypeId(editing.raw?.typeId || "");
      setCutId(editing.raw?.cutId || "");
      setCutSubId(editing.raw?.cutSubId || "");
      setNote(editing.generalNote || "");
      setQty(editing.quantity);
    } else {
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

  const subMissing = !!(cutGroup?.subRequired && cutGroup.subOptions?.length && !cutSubId);

  const handleSubmit = () => {
    if (subMissing) {
      toast.error("اختر طريقة التقطيع");
      return;
    }
    const opts: Record<string, string> = {};
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
      options: Object.keys(opts).length ? opts : undefined,
      generalNote: note.trim() || undefined,
      raw: { sizeId, typeId, cutId, cutSubId, note },
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

  const unitLabel = product.pairUnit ? "جوز" : "كمية";

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

          {schema.sizes && schema.sizes.length > 0 && (
            <GroupChips groups={schema.sizes} value={sizeId} onChange={setSizeId} label="الحجم" />
          )}
          {schema.types && schema.types.length > 0 && (
            <GroupChips groups={schema.types} value={typeId} onChange={setTypeId} label="النوع" />
          )}

          {schema.cuts && schema.cuts.length > 0 && (
            <div className="space-y-2">
              <GroupChips groups={schema.cuts} value={cutId} onChange={(id) => { setCutId(id); setCutSubId(""); }} label="التقطيع" />
              {cutGroup?.subOptions && (
                <SubRadio
                  options={cutGroup.subOptions}
                  value={cutSubId}
                  onChange={setCutSubId}
                  danger={subMissing}
                />
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
            <div className="text-sm font-bold">{unitLabel}</div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-background"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-6 text-center font-black">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
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
