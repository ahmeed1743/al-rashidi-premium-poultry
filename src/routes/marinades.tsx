import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { PRODUCTS } from "@/data/products";
import { fetchProducts } from "@/lib/products-api";

export const Route = createFileRoute("/marinades")({
  head: () => ({
    meta: [
      { title: "المتبلات — طيور الرشيدي" },
      { name: "description", content: "متبلات يومية بنكهات مميزة جاهزة للطبخ والشواء." },
    ],
  }),
  component: MarinadesPage,
});

function MarinadesPage() {
  const { data: products = PRODUCTS } = useQuery({ queryKey: ["products"], queryFn: () => fetchProducts(false) });
  const items = products.filter((p) => p.section === "marinated");
  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10">
        <h1 className="mb-2 text-3xl font-black md:text-5xl">المتبلات</h1>
        <p className="mb-8 text-muted-foreground">نكهات أصيلة جاهزة للطبخ والشواء.</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </SiteLayout>
  );
}
