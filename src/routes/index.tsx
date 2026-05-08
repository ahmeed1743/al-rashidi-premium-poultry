import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Truck, ShieldCheck, Award, Clock, Star } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Marquee } from "@/components/site/Marquee";
import { ProductCard } from "@/components/site/ProductCard";
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
  const featured = PRODUCTS.slice(0, 8);
  const offers = PRODUCTS.filter((p) => p.category === "offers" || p.oldPrice);
  const meals = PRODUCTS.filter((p) => p.category === "meals");

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

            <div className="mt-10 grid grid-cols-3 gap-4 text-center">
              {[
                { n: "+15", t: "سنة خبرة" },
                { n: "+50K", t: "عميل سعيد" },
                { n: "30د", t: "متوسط التوصيل" },
              ].map((s) => (
                <div key={s.t} className="rounded-2xl glass p-3">
                  <div className="text-xl font-black text-gradient-primary md:text-2xl">{s.n}</div>
                  <div className="text-[11px] text-muted-foreground md:text-xs">{s.t}</div>
                </div>
              ))}
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="absolute -bottom-5 right-5 rounded-2xl glass-strong px-4 py-3 shadow-card"
            >
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-gold text-gold" />
                <div>
                  <div className="text-sm font-extrabold">4.9 / 5</div>
                  <div className="text-[10px] text-muted-foreground">تقييم العملاء</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* MARQUEE */}
      <Marquee
        items={[
          "🍗 فراخ بيضاء طازجة من 95ج",
          "🦆 بط فلاحي ومسكوفي",
          "🦃 رومي طازج",
          "🌶️ متبلات يومية",
          "🎁 عرض العيلة وفّر 60ج",
          "🚚 توصيل سريع لباب البيت",
        ]}
      />

      {/* WHY US */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-black md:text-4xl">ليه طيور الرشيدي؟</h2>
          <p className="mt-2 text-muted-foreground">جودة، سرعة، وثقة من أول يوم.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { icon: ShieldCheck, t: "جودة مضمونة", d: "اختيار يومي ونظافة كاملة" },
            { icon: Truck, t: "توصيل سريع", d: "من 30 لـ 60 دقيقة" },
            { icon: Award, t: "خبرة سنوات", d: "ثقة آلاف العملاء" },
            { icon: Clock, t: "متاح طول اليوم", d: "من 11ص حتى 1ص" },
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

      {/* FEATURED */}
      <section className="container mx-auto px-4 py-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-black md:text-4xl">منتجاتنا المميزة</h2>
            <p className="mt-1 text-muted-foreground">اختر من تشكيلتنا الكاملة من الدواجن الطازجة.</p>
          </div>
          <Link to="/products" className="hidden text-sm font-bold text-primary hover:underline md:inline">
            عرض الكل ←
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* OFFERS */}
      {offers.length > 0 && (
        <section className="container mx-auto px-4 py-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-gold px-4 py-1.5 text-xs font-black text-background">
            🔥 عروض حصرية
          </div>
          <h2 className="mb-6 text-3xl font-black md:text-4xl">العروض</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {offers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* MEALS */}
      <section className="container mx-auto px-4 py-10">
        <h2 className="mb-6 text-3xl font-black md:text-4xl">الواجبات الجاهزة</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {meals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-8 text-center text-3xl font-black md:text-4xl">آراء عملائنا</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { n: "أحمد محمد", t: "أفضل دواجن جربتها، الجودة ممتازة والتوصيل سريع." },
            { n: "نهى حسن", t: "المتبلات لذيذة جداً والأسعار حلوة. أنصح بيهم." },
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
              <div className="mb-3 flex gap-1">
                {[...Array(5)].map((_, k) => (
                  <Star key={k} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>
              <p className="mb-3 text-sm text-muted-foreground">"{c.t}"</p>
              <div className="font-bold">{c.n}</div>
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
            { q: "ما هي مدة التوصيل؟", a: "متوسط التوصيل من 30 إلى 60 دقيقة حسب المنطقة." },
            { q: "هل أقدر استلم من الفرع؟", a: "أكيد، تقدر تختار الاستلام من أقرب فرع وقت تحب." },
            { q: "وسائل الدفع المتاحة؟", a: "كاش عند الاستلام أو Instapay." },
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
