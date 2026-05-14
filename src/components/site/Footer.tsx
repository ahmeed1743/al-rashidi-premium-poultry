import { Link } from "@tanstack/react-router";
import { Phone, MapPin, Clock, Facebook, MessageCircle } from "lucide-react";

const BRANCHES = [
  {
    name: "كامب شيزار (الرئيسي)",
    fb: "https://www.facebook.com/TyorElrshedy",
    phones: ["035900717", "035927195", "01223381405", "01099342344"],
    wa: "201223381405",
  },
  {
    name: "سموحة",
    fb: "https://www.facebook.com/Tyor.Elrshedy.Smouha",
    phones: ["4261199", "01226151455", "01018532722"],
    wa: "201226151455",
  },
  {
    name: "جناكليس",
    fb: "https://www.facebook.com/elrshedi",
    phones: ["01099342344"],
    wa: "201099342344",
  },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-card/50">
      <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary">
              <span className="font-black text-primary-foreground">ر</span>
            </div>
            <div className="font-extrabold">طيور الرشيدي</div>
          </div>
          <p className="text-sm text-muted-foreground">
            دواجن ومتبلات وواجبات بأعلى جودة وأسرع توصيل — الإسكندرية.
          </p>
          <div className="mt-4 rounded-xl border border-gold/40 bg-gold/10 p-3 text-xs">
            <div className="mb-1 font-extrabold text-gold">📣 شكاوى واقتراحات</div>
            <a href="tel:01038319460" className="font-mono font-bold">01038319460</a>
          </div>
        </div>
        {BRANCHES.map((b) => (
          <div key={b.name}>
            <div className="mb-3 flex items-center gap-2 font-bold">
              <MapPin className="h-4 w-4 text-primary" />فرع {b.name}
            </div>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {b.phones.map((p) => (
                <li key={p} className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  <a href={`tel:${p}`} dir="ltr" className="font-mono hover:text-primary">{p}</a>
                </li>
              ))}
              <li className="flex items-center gap-3 pt-2">
                <a href={`https://wa.me/${b.wa}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-500 hover:underline">
                  <MessageCircle className="h-3.5 w-3.5" /> واتساب
                </a>
                <a href={b.fb} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-blue-500 hover:underline">
                  <Facebook className="h-3.5 w-3.5" /> Facebook
                </a>
              </li>
            </ul>
          </div>
        ))}
      </div>
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <Link to="/products" className="hover:text-primary">المنتجات</Link>
          <Link to="/offers" className="hover:text-primary">العروض</Link>
          <Link to="/meals" className="hover:text-primary">الواجبات</Link>
          <Link to="/branches" className="hover:text-primary">الفروع</Link>
        </div>
        <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" />8 صباحاً — 8 مساءً يومياً</div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} طيور الرشيدي. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}
