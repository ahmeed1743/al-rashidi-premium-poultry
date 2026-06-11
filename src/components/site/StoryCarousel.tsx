import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import s1 from "@/assets/story-1.jpg.asset.json";
import s2 from "@/assets/story-2.jpg.asset.json";
import s3 from "@/assets/story-3.jpg.asset.json";
import s4 from "@/assets/story-4.jpg.asset.json";
import s5 from "@/assets/story-5.jpg.asset.json";

const SLIDES = [s1, s2, s3, s4, s5].map((a) => a.url);

export function StoryCarousel() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % SLIDES.length), 3500);
    return () => clearInterval(id);
  }, []);
  return (
    <section className="container mx-auto px-4 py-10">
      <div className="mb-5 text-center">
        <h2 className="text-2xl font-black md:text-3xl">قصة طيور الرشيدي</h2>
      </div>
      <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl shadow-elegant aspect-square">
        <AnimatePresence mode="wait">
          <motion.img
            key={i}
            src={SLIDES[i]}
            alt={`قصة طيور الرشيدي ${i + 1}`}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`الشريحة ${idx + 1}`}
              className={`h-2 rounded-full transition-all ${idx === i ? "w-8 bg-primary" : "w-2 bg-white/60"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}