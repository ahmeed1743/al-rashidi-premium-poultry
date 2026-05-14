import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CartDrawer } from "./CartDrawer";
import { CartFab } from "./CartFab";
import { Chatbot } from "./Chatbot";
import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import { trackVisit } from "@/lib/visits";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  useEffect(() => { trackVisit(loc.pathname); }, [loc.pathname]);
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>{children}</main>
      <Footer />
      <CartFab />
      <CartDrawer />
      <Chatbot />
      <Toaster position="top-center" richColors />
    </div>
  );
}
