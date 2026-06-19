import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { PRODUCTS } from "@/data/products";
import { fetchProducts } from "@/lib/products-api";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "العروض — طيور الرشيدي" },
      { name: "description", content: "عروض حصرية يومية وتوفير مميز على دواجنك المفضلة." },
    ],
  }),
  component: OffersPage,
});

function OffersPage() {
  const { data: products = PRODUCTS } = useQuery({ queryKey: ["products"], queryFn: () => fetchProducts(false) });
  const offers = products.filter((p) => !p.soldOut && (p.oldPrice || p.badge));
  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-gradient-gold px-4 py-1.5 text-xs font-black text-background">
          🔥 عروض حصرية
        </div>
        <h1 className="mb-2 text-3xl font-black md:text-5xl">العروض</h1>
        <p className="mb-8 text-muted-foreground">وفر أكتر مع باقاتنا المختارة.</p>
        {offers.length === 0 ? (
          <div className="rounded-2xl bg-card py-16 text-center text-muted-foreground">
            لا توجد عروض متاحة حالياً. تابعنا للجديد قريباً!
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {offers.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
