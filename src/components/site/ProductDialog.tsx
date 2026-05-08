import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import type { Product } from "@/data/products";
import { useCart } from "@/store/cart";
import { toast } from "sonner";

function OptionGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-bold">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
              value === o
                ? "border-primary bg-gradient-primary text-primary-foreground shadow-elegant"
                : "border-border bg-secondary/40 text-foreground/80 hover:border-primary/50"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ProductDialog({
  product,
  open,
  onOpenChange,
}: {
  product: Product;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const add = useCart((s) => s.addItem);

  const config = useMemo(() => {
    switch (product.customization) {
      case "size-cut":
        return { sizes: ["صغير", "وسط", "فوق الوسط"], cuts: ["سليم", "مقطع"] };
      case "duck":
        return { types: ["فلاحي", "مسكوفي"], cuts: ["سليم", "مقطع"] };
      case "baladi-hor":
        return { fixedSize: "صغير", cuts: ["سليم", "مقطع"] };
      case "type-cut":
        return { types: ["أبيض", "بلدي"], cuts: ["سليم", "قطع /2"] };
      case "type-cut-simple":
        return { types: ["أبيض", "بلدي"], cuts: ["سليم", "مقطع"] };
      case "cut-only":
        return { cuts: ["سليم", "مقطع"] };
      default:
        return {};
    }
  }, [product.customization]);

  const [size, setSize] = useState((config as any).sizes?.[0] || (config as any).fixedSize || "");
  const [type, setType] = useState((config as any).types?.[0] || "");
  const [cut, setCut] = useState((config as any).cuts?.[0] || "");
  const [cutNote, setCutNote] = useState("");
  const [qty, setQty] = useState(1);

  const handleAdd = () => {
    const opts: Record<string, string> = {};
    if (size) opts["الحجم"] = size;
    if (type) opts["النوع"] = type;
    if (cut) opts["التقطيع"] = cut;
    add({
      productId: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: qty,
      options: Object.keys(opts).length ? opts : undefined,
      cuttingNote: cut === "مقطع" || cut === "قطع /2" ? cutNote || undefined : undefined,
    });
    toast.success("تمت الإضافة للسلة", { description: product.name });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-right text-xl">{product.name}</DialogTitle>
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
            <OptionGroup label="الحجم" options={(config as any).sizes} value={size} onChange={setSize} />
          )}
          {(config as any).fixedSize && (
            <div className="rounded-xl bg-secondary/40 px-4 py-2 text-sm font-bold">
              الحجم: {(config as any).fixedSize} (متاح فقط)
            </div>
          )}
          {(config as any).types && (
            <OptionGroup label="النوع" options={(config as any).types} value={type} onChange={setType} />
          )}
          {(config as any).cuts && (
            <OptionGroup label="التقطيع" options={(config as any).cuts} value={cut} onChange={setCut} />
          )}

          {(cut === "مقطع" || cut === "قطع /2") && (
            <div className="space-y-2">
              <div className="text-sm font-bold">تعليمات التقطيع</div>
              <Textarea
                value={cutNote}
                onChange={(e) => setCutNote(e.target.value)}
                placeholder="مثال: قطع 8، صدور لوحدها، شيل الجلد..."
                className="min-h-20"
              />
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
            onClick={handleAdd}
            className="h-12 w-full rounded-xl bg-gradient-primary text-base font-extrabold text-primary-foreground shadow-elegant hover:opacity-95"
          >
            <ShoppingCart className="ml-2 h-5 w-5" />
            أضف للسلة • {product.price * qty} ج
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
