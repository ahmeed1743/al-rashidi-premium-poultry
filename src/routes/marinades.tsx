import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { PRODUCTS } from "@/data/products";

export const Route = createFileRoute("/marinades")({
  head: () => ({
    meta: [
      { title: "المتبلات — طيور الرشيدي" },
      { name: "description", content: "متبلات يومية بنكهات مميزة جاهزة للطبخ." },
    ],
  }),
  component: MarinadesPage,
});

function MarinadesPage() {
  const items = PRODUCTS.filter((p) => p.category === "marinated");
  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10">
        <h1 className="mb-2 text-3xl font-black md:text-5xl">المتبلات</h1>
        <p className="mb-8 text-muted-foreground">نكهات أصيلة جاهزة للطبخ والشواء.</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
