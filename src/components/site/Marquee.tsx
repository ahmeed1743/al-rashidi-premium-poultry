import type { Product } from "@/data/products";

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
  const list = [...products, ...products];
  return (
    <section className="relative overflow-hidden py-8">
      <div className="container mx-auto mb-4 flex items-end justify-between px-4">
        <div>
          <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-gradient-gold px-3 py-1 text-[11px] font-black text-background">
            🔥 العروض
          </div>
          <h2 className="text-2xl font-black md:text-3xl">عروض اليوم</h2>
        </div>
      </div>
      <div className="group relative">
        <div className="flex w-max animate-marquee-img gap-4 px-4 group-hover:[animation-play-state:paused]">
          {list.map((p, i) => (
            <a
              key={`${p.id}-${i}`}
              href="/offers"
              className="relative block w-[260px] flex-none overflow-hidden rounded-2xl bg-gradient-card shadow-card md:w-[300px]"
            >
              <img
                src={p.image}
                alt={p.name}
                loading="lazy"
                className="h-44 w-full object-cover md:h-52"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 to-transparent p-3">
                <div className="text-sm font-extrabold md:text-base">{p.name}</div>
                {p.badge && (
                  <div className="mt-1 inline-block rounded-full bg-gradient-gold px-2 py-0.5 text-[10px] font-black text-background">
                    {p.badge}
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
