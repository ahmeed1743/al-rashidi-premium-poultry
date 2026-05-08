import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { PRODUCTS } from "@/data/products";

export const Route = createFileRoute("/meals")({
  head: () => ({
    meta: [
      { title: "الواجبات — طيور الرشيدي" },
      { name: "description", content: "واجبات جاهزة طازجة مع مقبلات ومشروبات." },
    ],
  }),
  component: MealsPage,
});

function MealsPage() {
  const meals = PRODUCTS.filter((p) => p.category === "meals");
  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10">
        <h1 className="mb-2 text-3xl font-black md:text-5xl">الواجبات</h1>
        <p className="mb-8 text-muted-foreground">واجبات جاهزة بنكهة لا تُقاوم.</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {meals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
