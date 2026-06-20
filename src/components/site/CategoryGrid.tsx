import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PRODUCTS, SECTIONS, type SectionId } from "@/data/products";
import { ProductCard } from "./ProductCard";
import { fetchProducts } from "@/lib/products-api";
import { Search, X } from "lucide-react";

export function CategoryGrid({ initial }: { initial?: SectionId | "all" }) {
  const [active, setActive] = useState<SectionId | "all">(initial || "all");
  const [q, setQ] = useState("");
  const { data: products = PRODUCTS } = useQuery({
    queryKey: ["products"],
    queryFn: () => fetchProducts(false),
  });
  const items = useMemo(
    () => {
      const base = active === "all" ? products : products.filter((p) => p.section === active);
      const term = q.trim().toLowerCase();
      if (!term) return base;
      return base.filter((p) =>
        p.name.toLowerCase().includes(term) ||
        (p.description ?? "").toLowerCase().includes(term),
      );
    },
    [active, products, q],
  );

  return (
    <div>
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          id="site-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث عن منتج..."
          className="h-12 w-full rounded-2xl border border-border bg-card pr-10 pl-10 text-right text-sm font-semibold outline-none ring-0 focus:border-primary"
        />
        {q && (
          <button
            onClick={() => setQ("")}
            aria-label="مسح"
            className="absolute left-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
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
