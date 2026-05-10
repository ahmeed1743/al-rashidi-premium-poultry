import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  uid: string;          // unique line id (product + options hash)
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  options?: Record<string, string>;
  cuttingNote?: string;
  generalNote?: string;
  // Raw selections so we can reopen the dialog in edit mode
  raw?: {
    size?: string;
    type?: string;
    cut?: string;            // سليم | مقطع | خلي بالجلد | خلي شيش
    cutKind?: string;        // قطع /4 ...
    cutNote?: string;
  };
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "uid"> & { uid?: string }) => void;
  replaceItem: (uid: string, item: Omit<CartItem, "uid"> & { uid?: string }) => void;
  removeItem: (uid: string) => void;
  updateQty: (uid: string, qty: number) => void;
  clear: () => void;
  setOpen: (v: boolean) => void;
  total: () => number;
  count: () => number;
}

const makeUid = (item: { productId: string; options?: Record<string, string>; cuttingNote?: string }) =>
  `${item.productId}::${JSON.stringify(item.options || {})}::${item.cuttingNote || ""}`;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (item) => {
        const uid = item.uid || makeUid(item);
        const existing = get().items.find((i) => i.uid === uid);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.uid === uid ? { ...i, quantity: i.quantity + item.quantity } : i,
            ),
            isOpen: true,
          });
        } else {
          set({ items: [...get().items, { ...item, uid }], isOpen: true });
        }
      },
      replaceItem: (oldUid, item) => {
        const uid = item.uid || makeUid(item);
        set({
          items: get().items.map((i) => (i.uid === oldUid ? { ...item, uid } : i)),
        });
      },
      removeItem: (uid) => set({ items: get().items.filter((i) => i.uid !== uid) }),
      updateQty: (uid, qty) =>
        set({
          items: get()
            .items.map((i) => (i.uid === uid ? { ...i, quantity: Math.max(1, qty) } : i)),
        }),
      clear: () => set({ items: [] }),
      setOpen: (v) => set({ isOpen: v }),
      total: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    { name: "rashidy-cart" },
  ),
);
