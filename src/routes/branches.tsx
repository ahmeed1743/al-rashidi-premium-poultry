import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { MapPin, Phone, Clock } from "lucide-react";

export const Route = createFileRoute("/branches")({
  head: () => ({
    meta: [
      { title: "الفروع — طيور الرشيدي" },
      { name: "description", content: "اعرف أقرب فرع لطيور الرشيدي ومواعيد العمل." },
    ],
  }),
  component: BranchesPage,
});

const BRANCHES = [
  { name: "الفرع الرئيسي", address: "شارع الجمهورية - بجوار البنك", phone: "01223381405", hours: "11ص — 1ص" },
  { name: "فرع المحطة", address: "ميدان المحطة - الدور الأرضي", phone: "01099342344", hours: "11ص — 1ص" },
  { name: "فرع الكورنيش", address: "كورنيش النيل - أمام المسجد", phone: "01226151455", hours: "11ص — 1ص" },
];

function BranchesPage() {
  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10">
        <h1 className="mb-2 text-3xl font-black md:text-5xl">فروعنا</h1>
        <p className="mb-8 text-muted-foreground">زورنا في أقرب فرع ليك.</p>
        <div className="grid gap-4 md:grid-cols-3">
          {BRANCHES.map((b) => (
            <div key={b.name} className="rounded-2xl bg-gradient-card p-6 shadow-card">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-extrabold">{b.name}</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{b.address}</div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" />{b.phone}</div>
                <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />{b.hours}</div>
              </div>
              <a
                href={`tel:${b.phone}`}
                className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl bg-gradient-primary font-bold text-primary-foreground shadow-elegant"
              >
                اتصل الآن
              </a>
            </div>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
