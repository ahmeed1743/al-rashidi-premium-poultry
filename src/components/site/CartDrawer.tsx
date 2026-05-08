import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/store/cart";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export function CartDrawer() {
  const { items, isOpen, setOpen, updateQty, removeItem, total } = useCart();
  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side="left" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-right text-xl">السلة ({items.length})</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <ShoppingBag className="h-14 w-14 text-muted-foreground" />
            <p className="text-muted-foreground">سلتك فاضية</p>
            <Button onClick={() => setOpen(false)} variant="secondary">
              تسوق الآن
            </Button>
          </div>
        ) : (
          <>
            <div className="-mx-2 flex-1 overflow-y-auto px-2">
              <div className="space-y-3 py-3">
                {items.map((it) => (
                  <div key={it.uid} className="flex gap-3 rounded-xl bg-secondary/40 p-3">
                    <img src={it.image} alt={it.name} className="h-20 w-20 flex-none rounded-lg object-cover" />
                    <div className="flex flex-1 flex-col gap-1 text-right">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold">{it.name}</div>
                        <button
                          onClick={() => removeItem(it.uid)}
                          className="text-destructive transition-opacity hover:opacity-70"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      {it.options && (
                        <div className="flex flex-wrap gap-1 text-[11px] text-muted-foreground">
                          {Object.entries(it.options).map(([k, v]) => (
                            <span key={k} className="rounded-full bg-background px-2 py-0.5">
                              {k}: {v}
                            </span>
                          ))}
                        </div>
                      )}
                      {it.cuttingNote && (
                        <div className="text-[11px] text-muted-foreground">📝 {it.cuttingNote}</div>
                      )}
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQty(it.uid, it.quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-background"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center text-sm font-bold">{it.quantity}</span>
                          <button
                            onClick={() => updateQty(it.uid, it.quantity + 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="font-extrabold text-gradient-primary">
                          {it.price * it.quantity} ج
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between text-lg font-extrabold">
                <span>الإجمالي</span>
                <span className="text-gradient-primary">{total()} ج</span>
              </div>
              <Link to="/checkout" onClick={() => setOpen(false)}>
                <Button className="h-12 w-full rounded-xl bg-gradient-primary text-base font-extrabold text-primary-foreground shadow-elegant">
                  إتمام الطلب
                </Button>
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
