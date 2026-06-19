import { motion } from "framer-motion";
import { Plus, Phone, Flame, Sparkles, BadgePercent, Star } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/data/products";
import { ProductDialog } from "./ProductDialog";

function badgeStyle(label?: string) {
  if (!label) return null;
  if (label.includes("نفذ"))
    return { cls: "bg-destructive text-destructive-foreground", icon: <Flame className="h-3 w-3" /> };
  if (label.includes("عرض"))
    return { cls: "bg-orange-600 text-white", icon: <Flame className="h-3 w-3" /> };
  if (label.includes("الأكثر") || label.includes("مبيع"))
    return { cls: "bg-rose-600 text-white", icon: <Flame className="h-3 w-3" /> };
  if (label.includes("خصم"))
    return { cls: "bg-emerald-600 text-white", icon: <BadgePercent className="h-3 w-3" /> };
  if (label.includes("جديد"))
    return { cls: "bg-blue-600 text-white", icon: <Sparkles className="h-3 w-3" /> };
  if (label.includes("مميز"))
    return { cls: "bg-violet-600 text-white", icon: <Star className="h-3 w-3" /> };
  if (label.includes("موصى"))
    return { cls: "bg-teal-600 text-white", icon: <Star className="h-3 w-3" /> };
  return { cls: "bg-gradient-gold text-background", icon: <Sparkles className="h-3 w-3" /> };
}

export function ProductCard({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const sold = product.soldOut;
  const badgeLabel = sold ? "تم النفاذ" : product.badge || undefined;
  const bs = badgeStyle(badgeLabel);
  const discount = product.oldPrice && product.price
    ? Math.max(0, Math.round((1 - product.price / product.oldPrice) * 100))
    : 0;
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        whileHover={{ y: -4 }}
        className={`group relative flex flex-col overflow-hidden rounded-2xl bg-gradient-card shadow-card transition-shadow hover:shadow-elegant ${sold ? "opacity-80" : ""}`}
      >
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 ${sold ? "grayscale" : ""}`}
          />
          {bs && (
            <div className={`absolute top-4 right-0 z-10 inline-flex items-center gap-1 rounded-l-md px-3 py-1.5 text-[11px] font-black shadow-elegant ring-1 ring-white/20 ${bs.cls}`}>
              {bs.icon}<span>{badgeLabel}</span>
              <span className="absolute -bottom-1 right-0 h-0 w-0 border-t-4 border-r-4 border-t-transparent border-r-black/40" />
            </div>
          )}
          {discount > 0 && !sold && (
            <div className="absolute top-3 left-3 rounded-full bg-primary px-2.5 py-1 text-[11px] font-black text-primary-foreground shadow-elegant">
              -{discount}%
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="text-base font-extrabold leading-tight md:text-lg">{product.name}</h3>
          <p className="line-clamp-2 text-xs text-muted-foreground md:text-sm">{product.description}</p>
          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            <div className="flex flex-wrap items-baseline gap-1.5">
              {product.price > 0 ? (
                <>
                  {product.oldPrice && (
                    <span className="rounded-md bg-destructive/15 px-1.5 py-0.5 text-[11px] font-extrabold text-destructive line-through decoration-2">
                      {product.oldPrice} ج
                    </span>
                  )}
                  <span className="text-lg font-black text-primary">{product.price}</span>
                  <span className="text-[11px] font-bold text-muted-foreground">
                    ج{product.pairUnit ? " /جوز" : ""}
                  </span>
                </>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gold">
                  <Phone className="h-3 w-3" /> اتصل للسعر
                </span>
              )}
            </div>
            <button
              onClick={() => !sold && setOpen(true)}
              disabled={sold}
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-gradient-primary px-4 text-xs font-extrabold text-primary-foreground shadow-elegant transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
              aria-label="أضف للسلة"
            >
              <Plus className="h-4 w-4" />
              {sold ? "نفذ" : "أضف"}
            </button>
          </div>
        </div>
      </motion.div>
      <ProductDialog product={product} open={open} onOpenChange={setOpen} />
    </>
  );
}
