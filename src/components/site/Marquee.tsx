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
