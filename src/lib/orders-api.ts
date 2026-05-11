import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "@/store/cart";

export interface OrderInput {
  phone: string;
  customer_name: string;
  mode: "delivery" | "pickup";
  region?: string;
  street?: string;
  floor_apt?: string;
  branch?: string;
  time_slot?: string;
  notes?: string;
  whatsapp_number?: string;
  items: CartItem[];
}

export async function saveOrder(input: OrderInput) {
  const items = input.items.map((it) => ({
    name: it.name,
    qty: it.quantity,
    price: it.price,
    options: it.options || null,
    note: it.generalNote || null,
    pair_unit: !!it.pairUnit,
  }));
  const total = input.items.reduce((s, it) => s + it.price * it.quantity, 0);
  const { error } = await supabase.from("orders").insert({
    phone: input.phone,
    customer_name: input.customer_name,
    mode: input.mode,
    region: input.region || null,
    street: input.street || null,
    floor_apt: input.floor_apt || null,
    branch: input.branch || null,
    time_slot: input.time_slot || null,
    notes: input.notes || null,
    whatsapp_number: input.whatsapp_number || null,
    items,
    total,
  });
  if (error) console.error("saveOrder", error);
}

export async function getAddressByPhone(phone: string) {
  if (!phone || phone.length < 6) return null;
  const { data } = await supabase
    .from("customer_addresses")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();
  return data;
}

export async function upsertAddress(input: {
  phone: string;
  customer_name?: string;
  region?: string;
  street?: string;
  floor_apt?: string;
}) {
  if (!input.phone) return;
  const { error } = await supabase
    .from("customer_addresses")
    .upsert(
      {
        phone: input.phone,
        customer_name: input.customer_name || null,
        region: input.region || null,
        street: input.street || null,
        floor_apt: input.floor_apt || null,
      },
      { onConflict: "phone" },
    );
  if (error) console.error("upsertAddress", error);
}
