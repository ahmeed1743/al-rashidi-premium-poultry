import type { Product } from "@/data/products";
import { Flame } from "lucide-react";

export function Marquee({ items }: { items: string[] }) {
  const repeated = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-border/60 bg-gradient-primary/90 py-3">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        {repeated.map((t, i) => (
          <span key={i} className="flex items-center gap-3 text-sm font-bold text-primary-foreground md:text-base">
            <span className="inline-block h-2 w-2 rounded-full bg-gold" />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export function OffersMarquee({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <section className="relative overflow-hidden py-10">
      <div className="container mx-auto mb-4 flex items-end justify-between px-4">
        <div>
          <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-gradient-gold px-3 py-1 text-[11px] font-black text-background">
            🔥 العروض
          </div>
          <h2 className="text-2xl font-black md:text-3xl">عروض اليوم</h2>
        </div>
        <a href="/offers" className="text-sm font-bold text-primary hover:underline">كل العروض ←</a>
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background to-transparent" />
        <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2">
          {products.map((p, i) => {
            const discount = p.oldPrice && p.price
              ? Math.max(0, Math.round((1 - p.price / p.oldPrice) * 100)) : 0;
            return (
              <a
                key={`${p.id}-${i}`}
                href="/offers"
                className="group/card relative block w-[220px] flex-none snap-start overflow-hidden rounded-2xl bg-gradient-card shadow-card ring-1 ring-border/40 transition-transform hover:-translate-y-1 hover:shadow-elegant md:w-[260px]"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-110"
                  />
                  {discount > 0 && (
                    <div className="absolute top-3 left-3 rounded-full bg-primary px-2.5 py-1 text-[11px] font-black text-primary-foreground shadow-elegant">
                      -{discount}%
                    </div>
                  )}
                  {p.badge && (
                    <div className="absolute top-3 right-0 inline-flex items-center gap-1 rounded-l-md bg-orange-600 px-2.5 py-1 text-[10px] font-black text-white shadow-elegant">
                      <Flame className="h-3 w-3" />{p.badge}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 p-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-extrabold md:text-base">{p.name}</div>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      {p.oldPrice && (
                        <span className="rounded-md bg-destructive/15 px-1 py-0.5 text-[10px] font-extrabold text-destructive line-through decoration-2">
                          {p.oldPrice}
                        </span>
                      )}
                      {p.price > 0 && (
                        <>
                          <span className="text-base font-black text-primary">{p.price}</span>
                          <span className="text-[10px] font-bold text-muted-foreground">ج</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
