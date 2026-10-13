import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CategoryGrid } from "@/components/site/CategoryGrid";

export const Route = createFileRoute("/meals")({
  head: () => ({ meta: [
    { title: "اختيارات الوجبات — طيور الرشيدي" },
    { name: "description", content: "اختيارات طيور الرشيدي لتحضير وجباتك." },
    { property: "og:title", content: "اختيارات الوجبات — طيور الرشيدي" },
    { property: "og:description", content: "اختيارات طيور الرشيدي لتحضير وجباتك." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10">
        <h1 className="mb-6 text-3xl font-black md:text-5xl">منتجاتنا</h1>
        <CategoryGrid initial="all" />
      </div>
    </SiteLayout>
  ),
});
