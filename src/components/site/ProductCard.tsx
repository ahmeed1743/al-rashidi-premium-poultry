import { motion } from "framer-motion";
import { Plus, Phone } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/data/products";
import { ProductDialog } from "./ProductDialog";

export function ProductCard({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const sold = product.soldOut;
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
          {sold ? (
            <div className="absolute top-3 right-3 rounded-full bg-destructive px-3 py-1 text-xs font-black text-destructive-foreground shadow-card">
              تم النفاذ
            </div>
          ) : product.badge && (
            <div className="absolute top-3 right-3 rounded-full bg-gradient-gold px-3 py-1 text-xs font-black text-background shadow-card">
              {product.badge}
            </div>
          )}
          {product.oldPrice && !product.badge && !sold && (
            <div className="absolute top-3 left-3 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
              عرض
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="text-base font-extrabold leading-tight md:text-lg">{product.name}</h3>
          <p className="line-clamp-2 text-xs text-muted-foreground md:text-sm">{product.description}</p>
          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            <div className="flex items-baseline gap-1.5">
              {product.price > 0 ? (
                <>
                  <span className="text-lg font-black text-primary">{product.price}</span>
                  <span className="text-[11px] font-bold text-muted-foreground">
                    ج{product.pairUnit ? " /جوز" : ""}
                  </span>
                  {product.oldPrice && (
                    <span className="text-[11px] text-muted-foreground line-through">{product.oldPrice}</span>
                  )}
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
