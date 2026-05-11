import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PRODUCTS, SECTIONS, type SectionId } from "@/data/products";
import { ProductCard } from "./ProductCard";
import { fetchProducts } from "@/lib/products-api";

export function CategoryGrid({ initial }: { initial?: SectionId | "all" }) {
  const [active, setActive] = useState<SectionId | "all">(initial || "all");
  const { data: products = PRODUCTS } = useQuery({
    queryKey: ["products"],
    queryFn: () => fetchProducts(false),
  });
  const items = useMemo(
    () => (active === "all" ? products : products.filter((p) => p.section === active)),
    [active, products],
  );

  return (
    <div>
      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4">
        <button
          onClick={() => setActive("all")}
          className={`flex-none rounded-full px-4 py-2 text-sm font-bold transition-all ${
            active === "all"
              ? "bg-gradient-primary text-primary-foreground shadow-elegant"
              : "bg-secondary/40 hover:bg-secondary"
          }`}
        >
          الكل
        </button>
        {SECTIONS.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={`flex-none whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition-all ${
              active === c.id
                ? "bg-gradient-primary text-primary-foreground shadow-elegant"
                : "bg-secondary/40 hover:bg-secondary"
            }`}
          >
            <span className="ml-1">{c.emoji}</span>{c.label}
          </button>
        ))}
      </div>
      {items.length === 0 ? (
        <div className="rounded-2xl bg-card py-16 text-center text-muted-foreground">
          لا توجد منتجات في هذا القسم حالياً.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
