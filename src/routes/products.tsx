import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CategoryGrid } from "@/components/site/CategoryGrid";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "المنتجات — طيور الرشيدي" },
      { name: "description", content: "كل منتجات طيور الرشيدي: فراخ، بط، رومي، حمام وسمان، متبلات، أجزاء، وأرانب." },
      { property: "og:title", content: "المنتجات — طيور الرشيدي" },
      { property: "og:description", content: "تسوق منتجات طيور الرشيدي الطازجة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10">
        <h1 className="mb-2 text-3xl font-black md:text-5xl">منتجاتنا</h1>
        <p className="mb-8 text-muted-foreground">اختر القسم اللي يناسبك واطلب اللي يعجبك.</p>
        <CategoryGrid initial="all" />
      </div>
    </SiteLayout>
  );
}
