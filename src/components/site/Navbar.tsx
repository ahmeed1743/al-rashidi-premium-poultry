import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";
import { useSiteLogo } from "@/hooks/use-site-logo";

const links = [
  { to: "/", label: "الرئيسية" },
  { to: "/products", label: "المنتجات" },
  { to: "/marinades", label: "المتبلات" },
  { to: "/offers", label: "العروض" },
  { to: "/branches", label: "الفروع" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { url: logoUrl, isLoading: logoLoading } = useSiteLogo();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobile(false), [path]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-strong shadow-card" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:h-20">
        <Link to="/" className="flex items-center gap-2">
          {logoLoading ? (
            <div className="h-11 w-11 animate-pulse rounded-full bg-gradient-to-br from-primary/30 to-primary/10 shadow-glow ring-2 ring-primary/40" />
          ) : (
            <img
              src={logoUrl}
              alt="طيور الرشيدي"
              className="h-11 w-11 rounded-full object-cover shadow-glow ring-2 ring-primary/40"
            />
          )}
          <div className="leading-tight">
            <div className="text-base font-extrabold md:text-lg">طيور الرشيدي</div>
            <div className="text-[10px] text-muted-foreground md:text-xs">الجودة الأصلية</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => {
            const active = l.to === "/" ? path === "/" : path.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  active ? "text-primary-foreground" : "text-foreground/80 hover:text-foreground"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="navActive"
                    className="absolute inset-0 -z-10 rounded-full bg-gradient-primary shadow-elegant"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/products"
            hash="site-search"
            onClick={() => {
              setTimeout(() => {
                const el = document.getElementById("site-search") as HTMLInputElement | null;
                el?.focus();
                el?.scrollIntoView({ behavior: "smooth", block: "center" });
              }, 100);
            }}
            aria-label="بحث"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full glass"
          >
            <Search className="h-5 w-5" />
          </Link>
          <ThemeToggle />
          <button
            onClick={() => setMobile((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full glass lg:hidden"
            aria-label="القائمة"
          >
            {mobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden glass-strong lg:hidden"
          >
            <nav className="container mx-auto flex flex-col gap-1 px-4 py-3">
              {links.map((l) => (
                <Link key={l.to} to={l.to} className="rounded-xl px-4 py-3 text-sm font-semibold hover:bg-primary/10">
                  {l.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
