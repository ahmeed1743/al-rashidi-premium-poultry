import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Truck, ShieldCheck, Award, Clock, MapPin, Phone, MessageCircle } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Marquee, OffersMarquee } from "@/components/site/Marquee";
import { HScroll } from "@/components/site/HScroll";
import { fetchProducts } from "@/lib/products-api";
import { PRODUCTS } from "@/data/products";
import logoAsset from "@/assets/logo.jpg.asset.json";
import { StoryCarousel } from "@/components/site/StoryCarousel";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "طيور الرشيدي — دواجن طازجة وعروض يومية" },
      { name: "description", content: "اطلب فراخ بيضاء وبلدي، بط، رومي، حمام وسمان، أرانب، ومتبلات بأعلى جودة." },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: products = PRODUCTS } = useQuery({ queryKey: ["products"], queryFn: () => fetchProducts(false) });

  const offers = products.filter((p) => p.oldPrice || p.badge);
  const chicken = products.filter((p) => p.section === "chicken").slice(0, 8);
  const marinades = products.filter((p) => p.section === "marinated").slice(0, 10);
  const parts = products.filter((p) => p.section === "parts").slice(0, 10);
  const featured = products.filter((p) => ["duck", "turkey", "pigeon", "other"].includes(p.section)).slice(0, 10);

  return (
    <SiteLayout>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="container relative mx-auto grid items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="text-right">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-bold">
              <span className="h-2 w-2 rounded-full bg-gold" />
              الجودة الأصلية منذ سنوات
            </div>
            <h1 className="mb-5 text-4xl font-black leading-tight md:text-6xl">
              طازج كل يوم.<br />
              <span className="text-gradient-primary">طيور الرشيدي</span>
            </h1>
            <p className="mb-8 max-w-lg text-base text-muted-foreground md:text-lg">
              فراخ بيضاء وبلدي، بط ورومي وأرانب، حمام وسمان، متبلات وأجزاء — جودة مضمونة وتوصيل سريع.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products" className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-primary px-7 text-sm font-extrabold text-primary-foreground shadow-elegant transition-transform hover:scale-105">
                اطلب الآن <ArrowLeft className="h-4 w-4" />
              </Link>
              <Link to="/marinades" className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-secondary/40 px-7 text-sm font-extrabold transition-colors hover:bg-secondary">
                المتبلات
              </Link>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }} className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-30 blur-3xl" />
            <img src={logoAsset.url} alt="طيور الرشيدي" width={1024} height={1024} className="relative mx-auto rounded-3xl object-cover shadow-elegant" />
          </motion.div>
        </div>
      </section>

      <Marquee items={["🍗 فراخ طازجة", "🦆 بط فلاحي ومسكوفي", "🦃 رومي طازج", "🕊️ حمام وسمان", "🌶️ متبلات يومية", "🚚 توصيل سريع"]} />

      <StoryCarousel />

      {offers.length > 0 && <OffersMarquee products={offers} />}

      <HScroll title="الفراخ" products={chicken} viewAllTo="/products" />
      <HScroll title="المتبلات" products={marinades} viewAllTo="/marinades" />
      <HScroll title="الأجزاء" products={parts} viewAllTo="/products" />
      <HScroll title="منتجات مميزة" products={featured} viewAllTo="/products" />

      <section className="container mx-auto px-4 py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-black md:text-4xl">الفرع الرئيسي</h2>
            <p className="mt-1 text-muted-foreground">كامب شيزار — الإسكندرية</p>
          </div>
          <Link to="/branches" className="text-sm font-bold text-primary hover:underline">كل الفروع ←</Link>
        </div>
        <div className="grid items-stretch gap-5 md:grid-cols-5">
          <div className="md:col-span-2 flex flex-col gap-3 rounded-2xl bg-gradient-card p-6 shadow-card">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-extrabold">طيور الرشيدي - كامب شيزار</h3>
            <p className="text-sm text-muted-foreground">الإسكندرية - مفتوح من 8 صباحاً حتى 8 مساءً</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /><a dir="ltr" href="tel:01223381405" className="font-mono font-bold">01223381405</a></div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /><a dir="ltr" href="tel:01099342344" className="font-mono font-bold">01099342344</a></div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /><a dir="ltr" href="tel:035900717" className="font-mono font-bold">035900717</a></div>
            </div>
            <div className="mt-auto grid grid-cols-2 gap-2 pt-2">
              <a href="https://wa.me/201223381405" target="_blank" rel="noreferrer" className="inline-flex h-11 items-center justify-center gap-1 rounded-xl bg-emerald-600 text-sm font-bold text-white">
                <MessageCircle className="h-4 w-4" /> واتساب
              </a>
              <a href="https://maps.app.goo.gl/7dN6WUnmkbq5kWK27" target="_blank" rel="noreferrer" className="inline-flex h-11 items-center justify-center gap-1 rounded-xl bg-gradient-primary text-sm font-extrabold text-primary-foreground shadow-elegant">
                <MapPin className="h-4 w-4" /> الاتجاهات
              </a>
            </div>
          </div>
          <div className="md:col-span-3 overflow-hidden rounded-2xl border border-border shadow-card">
            <iframe
              title="موقع كامب شيزار"
              src="https://www.google.com/maps?q=Tyor%20Elrshedy%20Camp%20Shizar%20Alexandria&output=embed"
              width="100%"
              height="100%"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block min-h-[320px] w-full border-0"
            />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-black md:text-4xl">ليه طيور الرشيدي؟</h2>
          <p className="mt-2 text-muted-foreground">جودة، سرعة، وثقة من أول يوم.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { icon: ShieldCheck, t: "جودة مضمونة", d: "اختيار يومي ونظافة كاملة" },
            { icon: Truck, t: "توصيل سريع", d: "خدمة توصيل لباب البيت" },
            { icon: Award, t: "خبرة سنوات", d: "ثقة آلاف العملاء" },
            { icon: Clock, t: "خدمة عملاء", d: "تواصل دائم على واتساب" },
          ].map((f, i) => (
            <motion.div key={f.t} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="rounded-2xl bg-gradient-card p-6 shadow-card">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-1 font-extrabold">{f.t}</h3>
              <p className="text-sm text-muted-foreground">{f.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container mx-auto max-w-3xl px-4 py-16">
        <h2 className="mb-8 text-center text-3xl font-black md:text-4xl">الأسئلة الشائعة</h2>
        <Accordion type="single" collapsible className="space-y-3">
          {[
            { q: "هل المنتجات طازجة يومياً؟", a: "نعم، كل منتجاتنا طازجة بشكل يومي ومختارة بعناية." },
            { q: "إزاي أعمل طلب؟", a: "اختر منتجاتك وعدّلها كما تحب ثم أرسل الطلب عبر واتساب." },
            { q: "هل أقدر استلم من الفرع؟", a: "أكيد، تقدر تختار الاستلام من أقرب فرع وقت تحب." },
            { q: "إيه طريقة الدفع؟", a: "كاش عند الاستلام أو Instapay." },
          ].map((f, i) => (
            <AccordionItem key={i} value={`q-${i}`} className="rounded-xl border border-border bg-card px-4">
              <AccordionTrigger className="text-right font-bold hover:no-underline">{f.q}</AccordionTrigger>
              <AccordionContent className="text-right text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </SiteLayout>
  );
}
