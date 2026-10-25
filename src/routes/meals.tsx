import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CategoryGrid } from "@/components/site/CategoryGrid";

export const Route = createFileRoute("/meals")({
  head: () => ({ meta: [{ title: "المنتجات — طيور الرشيدي" }] }),
  component: () => (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10">
        <h1 className="mb-6 text-3xl font-black md:text-5xl">منتجاتنا</h1>
        <CategoryGrid initial="all" />
      </div>
    </SiteLayout>
  ),
});
