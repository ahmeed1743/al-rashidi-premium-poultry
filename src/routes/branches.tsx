import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { MapPin, Phone, Clock, Facebook, MessageCircle } from "lucide-react";

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
  {
    name: "الفرع الرئيسي - كامب شيزار",
    address: "كامب شيزار، الإسكندرية",
    phones: ["035900717", "035927195", "01223381405", "01099342344"],
    wa: "201223381405",
    fb: "https://www.facebook.com/TyorElrshedy",
    map: "https://maps.app.goo.gl/7dN6WUnmkbq5kWK27",
    hours: "8ص — 8م",
  },
  {
    name: "فرع سموحة",
    address: "سموحة، الإسكندرية",
    phones: ["4261199", "01226151455", "01018532722"],
    wa: "201226151455",
    fb: "https://www.facebook.com/Tyor.Elrshedy.Smouha",
    hours: "8ص — 8م",
  },
  {
    name: "فرع جناكليس",
    address: "جناكليس، الإسكندرية",
    phones: ["01099342344"],
    wa: "201099342344",
    fb: "https://www.facebook.com/elrshedi",
    hours: "8ص — 8م",
  },
];

function BranchesPage() {
  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10">
        <h1 className="mb-2 text-3xl font-black md:text-5xl">فروعنا</h1>
        <p className="mb-8 text-muted-foreground">زورنا في أقرب فرع ليك.</p>
        <div className="grid gap-5 md:grid-cols-3">
          {BRANCHES.map((b) => (
            <div key={b.name} className="flex flex-col rounded-2xl bg-gradient-card p-6 shadow-card">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-extrabold">{b.name}</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{b.address}</div>
                {b.phones.map((p) => (
                  <div key={p} className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <a href={`tel:${p}`} dir="ltr" className="font-mono font-bold hover:text-primary">{p}</a>
                  </div>
                ))}
                <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />{b.hours}</div>
              </div>
              <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
                <a href={`https://wa.me/${b.wa}`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center gap-1 rounded-xl bg-emerald-600 text-sm font-bold text-white">
                  <MessageCircle className="h-4 w-4" /> واتساب
                </a>
                <a href={b.fb} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center gap-1 rounded-xl bg-blue-600 text-sm font-bold text-white">
                  <Facebook className="h-4 w-4" /> Facebook
                </a>
                {b.map && (
                  <a href={b.map} target="_blank" rel="noreferrer" className="col-span-2 inline-flex h-10 items-center justify-center gap-1 rounded-xl bg-gradient-primary text-sm font-extrabold text-primary-foreground shadow-elegant">
                    <MapPin className="h-4 w-4" /> فتح الموقع على خرائط جوجل
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-border shadow-card">
          <div className="bg-gradient-primary px-5 py-3 font-extrabold text-primary-foreground">
            موقع الفرع الرئيسي — كامب شيزار
          </div>
          <iframe
            title="موقع كامب شيزار"
            src="https://www.google.com/maps?q=Tyor%20Elrshedy%20Camp%20Shizar%20Alexandria&output=embed"
            width="100%"
            height="380"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="border-0"
          />
        </div>
      </div>
    </SiteLayout>
  );
}
