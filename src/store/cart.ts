import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  uid: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  pairUnit?: boolean;
  unitId?: string;       // 'kg' | 'count' | undefined
  unitLabel?: string;    // 'كيلو' | 'قطعة' | undefined
  step?: number;         // 0.5 for kg, otherwise 1
  options?: Record<string, string>;
  generalNote?: string;
  raw?: {
    sizeId?: string;
    typeId?: string;
    cutId?: string;
    cutSubId?: string;
    unitId?: string;
    note?: string;
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

const makeUid = (item: { productId: string }) =>
  `${item.productId}::${Date.now()}::${Math.random().toString(36).slice(2, 7)}`;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (item) => {
        const uid = item.uid || makeUid(item);
        set({ items: [...get().items, { ...item, uid }], isOpen: true });
      },
      replaceItem: (oldUid, item) => {
        const uid = item.uid || makeUid(item);
        set({ items: get().items.map((i) => (i.uid === oldUid ? { ...item, uid } : i)) });
      },
      removeItem: (uid) => set({ items: get().items.filter((i) => i.uid !== uid) }),
      updateQty: (uid, qty) =>
        set({
          items: get().items.map((i) => {
            if (i.uid !== uid) return i;
            const step = i.step || 1;
            const next = Math.max(step, Math.round(qty / step) * step);
            return { ...i, quantity: parseFloat(next.toFixed(2)) };
          }),
        }),
      clear: () => set({ items: [] }),
      setOpen: (v) => set({ isOpen: v }),
      total: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
      count: () => get().items.length,
    }),
    { name: "rashidy-cart-v3" },
  ),
);
