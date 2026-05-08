import { useState } from "react";
import { CATEGORIES, PRODUCTS, type CategoryId } from "@/data/products";
import { ProductCard } from "./ProductCard";

export function CategoryGrid({ initial }: { initial?: CategoryId | "all" }) {
  const [active, setActive] = useState<CategoryId | "all">(initial || "all");
  const items = active === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === active);
  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActive("all")}
          className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
            active === "all"
              ? "bg-gradient-primary text-primary-foreground shadow-elegant"
              : "bg-secondary/40 hover:bg-secondary"
          }`}
        >
          الكل
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
              active === c.id
                ? "bg-gradient-primary text-primary-foreground shadow-elegant"
                : "bg-secondary/40 hover:bg-secondary"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      {items.length === 0 ? (
        <div className="rounded-2xl bg-card py-16 text-center text-muted-foreground">
          لا توجد منتجات في هذا القسم حالياً.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
