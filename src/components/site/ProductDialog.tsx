import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Minus, Plus, ShoppingCart, Info } from "lucide-react";
import type { Product } from "@/data/products";
import { useCart, type CartItem } from "@/store/cart";
import { toast } from "sonner";

function Chip({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
        active
          ? "border-primary bg-gradient-primary text-primary-foreground shadow-elegant"
          : "border-border bg-secondary/40 text-foreground/80 hover:border-primary/50"
      }`}
    >
      {children}
    </button>
  );
}

function ChipWithInfo({
  active, onClick, label, info,
}: { active: boolean; onClick: () => void; label: string; info: string }) {
  return (
    <div className="flex items-center gap-1">
      <Chip active={active} onClick={onClick}>{label}</Chip>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className="text-muted-foreground hover:text-primary" aria-label={info}>
              <Info className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">{info}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

const CUT_KINDS = ["قطع /4", "قطع /8", "قطع بالطول", "قطع بالعرض"];

export function ProductDialog({
  product,
  open,
  onOpenChange,
  editing,
}: {
  product: Product;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing?: CartItem;
}) {
  const add = useCart((s) => s.addItem);
  const replace = useCart((s) => s.replaceItem);

  const config = useMemo(() => {
    switch (product.customization) {
      case "size-cut":
        return { sizes: ["صغير", "وسط", "فوق الوسط", "كبير"], hasCuts: true };
      case "duck":
        return { types: ["فلاحي", "مسكوفي"], hasCuts: true };
      case "baladi-hor":
        return { fixedSize: "صغير", hasCuts: true };
      case "type-cut":
        return { types: ["أبيض", "بلدي"], hasCuts: true, cutTwoOnly: true };
      case "type-cut-simple":
        return { types: ["أبيض", "بلدي"], hasCuts: true };
      case "cut-only":
        return { hasCuts: true };
      default:
        return {};
    }
  }, [product.customization]);

  const cutOptions = (config as any).hasCuts
    ? ["سليم", "مقطع", "خلي بالجلد", "خلي شيش"]
    : [];

  const [size, setSize] = useState(editing?.raw?.size || (config as any).sizes?.[0] || (config as any).fixedSize || "");
  const [type, setType] = useState(editing?.raw?.type || (config as any).types?.[0] || "");
  const [cut, setCut] = useState(editing?.raw?.cut || cutOptions[0] || "");
  const [cutKind, setCutKind] = useState(editing?.raw?.cutKind || CUT_KINDS[0]);
  const [cutNote, setCutNote] = useState(editing?.raw?.cutNote || "");
  const [qty, setQty] = useState(editing?.quantity || 1);

  // Reset when dialog opens fresh
  useEffect(() => {
    if (!open) return;
    if (editing) {
      setSize(editing.raw?.size || (config as any).sizes?.[0] || (config as any).fixedSize || "");
      setType(editing.raw?.type || (config as any).types?.[0] || "");
      setCut(editing.raw?.cut || cutOptions[0] || "");
      setCutKind(editing.raw?.cutKind || CUT_KINDS[0]);
      setCutNote(editing.raw?.cutNote || "");
      setQty(editing.quantity);
    } else {
      setSize((config as any).sizes?.[0] || (config as any).fixedSize || "");
      setType((config as any).types?.[0] || "");
      setCut(cutOptions[0] || "");
      setCutKind(CUT_KINDS[0]);
      setCutNote("");
      setQty(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product.id]);

  const handleSubmit = () => {
    const opts: Record<string, string> = {};
    if (size) opts["الحجم"] = size;
    if (type) opts["النوع"] = type;
    if (cut) {
      opts["التقطيع"] = cut === "مقطع" ? `${cut} (${cutKind})` : cut;
    }

    const payload = {
      productId: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: qty,
      options: Object.keys(opts).length ? opts : undefined,
      cuttingNote: cut === "مقطع" ? cutNote || undefined : undefined,
      raw: { size, type, cut, cutKind, cutNote },
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-right text-xl">
            {editing ? "تعديل المنتج" : product.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 text-right">
          <div className="overflow-hidden rounded-xl">
            <img src={product.image} alt={product.name} className="h-52 w-full object-cover" />
          </div>
          <p className="text-sm text-muted-foreground">{product.description}</p>
          {product.note && (
            <div className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm font-semibold text-gold">
              ملاحظة: {product.note}
            </div>
          )}

          {(config as any).sizes && (
            <div className="space-y-2">
              <div className="text-sm font-bold">الحجم</div>
              <div className="flex flex-wrap gap-2">
                {(config as any).sizes.map((o: string) => (
                  <Chip key={o} active={size === o} onClick={() => setSize(o)}>{o}</Chip>
                ))}
              </div>
            </div>
          )}
          {(config as any).fixedSize && (
            <div className="rounded-xl bg-secondary/40 px-4 py-2 text-sm font-bold">
              الحجم: {(config as any).fixedSize} (متاح فقط)
            </div>
          )}
          {(config as any).types && (
            <div className="space-y-2">
              <div className="text-sm font-bold">النوع</div>
              <div className="flex flex-wrap gap-2">
                {(config as any).types.map((o: string) => (
                  <Chip key={o} active={type === o} onClick={() => setType(o)}>{o}</Chip>
                ))}
              </div>
            </div>
          )}

          {cutOptions.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-bold">التقطيع</div>
              <div className="flex flex-wrap items-center gap-2">
                <Chip active={cut === "سليم"} onClick={() => setCut("سليم")}>سليم</Chip>
                <Chip active={cut === "مقطع"} onClick={() => setCut("مقطع")}>مقطع</Chip>
                <ChipWithInfo
                  active={cut === "خلي بالجلد"}
                  onClick={() => setCut("خلي بالجلد")}
                  label="خلي بالجلد"
                  info="بدون عظم"
                />
                <ChipWithInfo
                  active={cut === "خلي شيش"}
                  onClick={() => setCut("خلي شيش")}
                  label="خلي شيش"
                  info="بدون عظم وبدون جلد"
                />
              </div>
            </div>
          )}

          {cut === "مقطع" && (
            <div className="space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
              <div className="text-sm font-bold">طريقة التقطيع</div>
              <div className="grid grid-cols-2 gap-2">
                {CUT_KINDS.map((k) => (
                  <label
                    key={k}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-all ${
                      cutKind === k
                        ? "border-primary bg-gradient-primary text-primary-foreground"
                        : "border-border bg-background"
                    }`}
                  >
                    <input
                      type="radio"
                      name="cutKind"
                      checked={cutKind === k}
                      onChange={() => setCutKind(k)}
                      className="accent-primary"
                    />
                    {k}
                  </label>
                ))}
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-bold">تعليمات إضافية للتقطيع (اختياري)</div>
                <Textarea
                  value={cutNote}
                  onChange={(e) => setCutNote(e.target.value)}
                  placeholder="مثال: صدور لوحدها، شيل الجلد..."
                  className="min-h-16"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between rounded-xl bg-secondary/40 p-3">
            <div className="text-sm font-bold">الكمية</div>
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
