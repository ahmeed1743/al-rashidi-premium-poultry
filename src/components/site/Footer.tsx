import { Link } from "@tanstack/react-router";
import { Phone, MapPin, Clock } from "lucide-react";

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
            دواجن ومتبلات وواجبات بأعلى جودة وأسرع توصيل.
          </p>
        </div>
        <div>
          <div className="mb-3 font-bold">روابط</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/products" className="hover:text-primary">المنتجات</Link></li>
            <li><Link to="/offers" className="hover:text-primary">العروض</Link></li>
            <li><Link to="/meals" className="hover:text-primary">الواجبات</Link></li>
            <li><Link to="/branches" className="hover:text-primary">الفروع</Link></li>
          </ul>
        </div>
        <div>
          <div className="mb-3 font-bold">تواصل معنا</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" />01223381405</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" />01099342344</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" />01226151455</li>
          </ul>
        </div>
        <div>
          <div className="mb-3 font-bold">مواعيد العمل</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />يومياً 11ص — 1ص</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />فروعنا في انتظارك</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} طيور الرشيدي. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}
