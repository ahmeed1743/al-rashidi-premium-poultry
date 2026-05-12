import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { WhatsappFloat } from "./WhatsappFloat";
import { CartDrawer } from "./CartDrawer";
import { CartFab } from "./CartFab";
import { Chatbot } from "./Chatbot";
import { Toaster } from "@/components/ui/sonner";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>{children}</main>
      <Footer />
      <WhatsappFloat />
      <CartFab />
      <CartDrawer />
      <Chatbot />
      <Toaster position="top-center" richColors />
    </div>
  );
}
