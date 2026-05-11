import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "لوحة الإدارة — طيور الرشيدي" }] }),
  component: () => (
    <SiteLayout>
      <div className="container mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="mb-3 text-3xl font-black">لوحة الإدارة قيد التحديث</h1>
        <p className="text-muted-foreground">
          جاري تجهيز لوحة الإدارة الجديدة مع داش بورد التحليلات وإدارة المنتجات والأسعار والعروض في المرحلة 2.
        </p>
      </div>
    </SiteLayout>
  ),
});
