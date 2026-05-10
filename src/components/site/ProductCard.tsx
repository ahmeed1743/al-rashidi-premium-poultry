import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/data/products";
import { ProductDialog } from "./ProductDialog";

export function ProductCard({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        whileHover={{ y: -4 }}
        className="group relative flex flex-col overflow-hidden rounded-2xl bg-gradient-card shadow-card transition-shadow hover:shadow-elegant"
      >
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {product.badge && (
            <div className="absolute top-3 right-3 rounded-full bg-gradient-gold px-3 py-1 text-xs font-black text-background shadow-card">
              {product.badge}
            </div>
          )}
          {product.oldPrice && !product.badge && (
            <div className="absolute top-3 left-3 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
              عرض
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="text-base font-extrabold leading-tight md:text-lg">{product.name}</h3>
          <p className="line-clamp-2 text-xs text-muted-foreground md:text-sm">{product.description}</p>
          <div className="mt-auto flex items-center justify-end pt-2">
            <button
              onClick={() => setOpen(true)}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-primary px-5 text-sm font-extrabold text-primary-foreground shadow-elegant transition-transform hover:scale-105 active:scale-95"
              aria-label="أضف للسلة"
            >
              <Plus className="h-4 w-4" />
              أضف للسلة
            </button>
          </div>
        </div>
      </motion.div>
      <ProductDialog product={product} open={open} onOpenChange={setOpen} />
    </>
  );
}
