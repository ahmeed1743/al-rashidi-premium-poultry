import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Truck, ShieldCheck, Award, Clock } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Marquee, OffersMarquee } from "@/components/site/Marquee";
import { HScroll } from "@/components/site/HScroll";
import { fetchProducts } from "@/lib/products-api";
import { PRODUCTS } from "@/data/products";
import heroImg from "@/assets/hero.jpg";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "طيور الرشيدي — دواجن طازجة وعروض يومية" },
      { name: "description", content: "اطلب فراخ بيضاء وبلدي، بط، رومي، أرانب، متبلات وواجبات بأعلى جودة وأسرع توصيل." },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: products = PRODUCTS } = useQuery({
    queryKey: ["products"],
    queryFn: () => fetchProducts(false),
  });

  const offers = products.filter((p) => p.category === "offers" || p.oldPrice);
  const meals = products.filter((p) => p.category === "meals");
  const marinades = products.filter((p) => p.category === "marinated");
  const featured = products.filter((p) => !["offers", "meals", "marinated"].includes(p.category)).slice(0, 8);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="container relative mx-auto grid items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-right"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-bold">
              <span className="h-2 w-2 rounded-full bg-gold" />
              الجودة الأصلية منذ سنوات
            </div>
            <h1 className="mb-5 text-4xl font-black leading-tight md:text-6xl">
              طازج كل يوم.<br />
              <span className="text-gradient-primary">طيور الرشيدي</span>
            </h1>
            <p className="mb-8 max-w-lg text-base text-muted-foreground md:text-lg">
              فراخ بيضاء وبلدي، بط ورومي وأرانب، متبلات وواجبات جاهزة — بجودة لا تُقاوم وتوصيل سريع لباب البيت.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/products"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-primary px-7 text-sm font-extrabold text-primary-foreground shadow-elegant transition-transform hover:scale-105"
              >
                اطلب الآن <ArrowLeft className="h-4 w-4" />
              </Link>
              <Link
                to="/offers"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-secondary/40 px-7 text-sm font-extrabold transition-colors hover:bg-secondary"
              >
                شوف العروض
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-30 blur-3xl" />
            <img
              src={heroImg}
              alt="طيور الرشيدي"
              width={1600}
              height={1024}
              className="relative rounded-3xl object-cover shadow-elegant"
            />
          </motion.div>
        </div>
      </section>

      {/* MARQUEE */}
      <Marquee
        items={[
          "🍗 فراخ بيضاء طازجة",
          "🦆 بط فلاحي ومسكوفي",
          "🦃 رومي طازج",
          "🌶️ متبلات يومية",
          "🎁 عروض حصرية",
          "🚚 توصيل سريع لباب البيت",
        ]}
      />

      {/* OFFERS IMAGE MARQUEE */}
      <OffersMarquee products={offers.length ? offers : products.slice(0, 6)} />

      {/* FEATURED */}
      <HScroll
        title="منتجاتنا المميزة"
        products={featured}
        viewAllTo="/products"
      />

      {/* OFFERS scroll */}
      {offers.length > 0 && (
        <HScroll
          title="العروض"
          products={offers}
          viewAllTo="/offers"
          eyebrow={
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-gradient-gold px-3 py-1 text-[11px] font-black text-background">
              🔥 عروض حصرية
            </div>
          }
        />
      )}

      {/* MEALS */}
      <HScroll title="الواجبات الجاهزة" products={meals} viewAllTo="/meals" />

      {/* MARINADES */}
      <HScroll title="المتبلات" products={marinades} viewAllTo="/marinades" />

      {/* TESTIMONIALS */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-8 text-center text-3xl font-black md:text-4xl">آراء عملائنا</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { n: "أحمد محمد", t: "أفضل دواجن جربتها، الجودة ممتازة والتوصيل سريع." },
            { n: "نهى حسن", t: "المتبلات لذيذة جداً. أنصح بيهم." },
            { n: "محمود علي", t: "خدمة محترمة وفروع نضيفة. ربنا يبارك." },
          ].map((c, i) => (
            <motion.div
              key={c.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl bg-gradient-card p-6 shadow-card"
            >
              <p className="mb-3 text-sm text-muted-foreground">"{c.t}"</p>
              <div className="font-bold">{c.n}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* WHY US — moved to before last */}
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
            <motion.div
              key={f.t}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl bg-gradient-card p-6 shadow-card"
            >
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-1 font-extrabold">{f.t}</h3>
              <p className="text-sm text-muted-foreground">{f.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
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
