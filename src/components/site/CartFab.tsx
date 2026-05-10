import { ShoppingCart } from "lucide-react";
import { useCart } from "@/store/cart";
import { motion } from "framer-motion";

export function CartFab() {
  const setOpen = useCart((s) => s.setOpen);
  const count = useCart((s) => s.items.reduce((a, b) => a + b.quantity, 0));
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 280, damping: 20 }}
      onClick={() => setOpen(true)}
      aria-label="السلة"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-elegant transition-transform hover:scale-110"
    >
      <ShoppingCart className="h-6 w-6" />
      {count > 0 && (
        <span className="absolute -top-1 -left-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-gold px-1 text-xs font-black text-background ring-2 ring-background">
          {count}
        </span>
      )}
    </motion.button>
  );
}
