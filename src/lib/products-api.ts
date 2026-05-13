import { PRODUCTS, type Product, type SectionId } from "@/data/products";
import { supabase } from "@/integrations/supabase/client";
import whiteImg from "@/assets/p-white-chicken.jpg";
import baladiImg from "@/assets/p-baladi.jpg";
import duckImg from "@/assets/p-duck.jpg";
import turkeyImg from "@/assets/p-turkey.jpg";
import rabbitImg from "@/assets/p-rabbit.jpg";
import marinatedImg from "@/assets/p-marinated.jpg";
import mealImg from "@/assets/p-meal.jpg";

const FALLBACK: Record<string, string> = {
  chicken: whiteImg, baladi: baladiImg, duck: duckImg, turkey: turkeyImg,
  pigeon: mealImg, marinated: marinatedImg, parts: whiteImg, other: rabbitImg,
};

export function resolveImage(section: string, image_url?: string | null, subcategory?: string | null): string {
  if (image_url && image_url.length > 0) return image_url;
  if (subcategory && subcategory.includes("بلدي")) return baladiImg;
  return FALLBACK[section] || whiteImg;
}

export async function fetchProducts(includeInactive = false): Promise<Product[]> {
  const q = supabase.from("products").select("*").order("sort_order").order("name");
  const { data, error } = includeInactive ? await q : await q.eq("is_active", true);
  if (error || !data || data.length === 0) return PRODUCTS; // fallback while DB warms up
  return data.map((r: any) => ({
    id: r.id,
    name: r.name,
    description: r.description || "",
    price: Number(r.price) || 0,
    oldPrice: r.old_price ? Number(r.old_price) : undefined,
    image: resolveImage(r.category, r.image_url, r.subcategory),
    section: r.category as SectionId,
    subcategory: r.subcategory || undefined,
    badge: r.badge || (r.sold_out ? "تم النفاذ" : undefined),
    customization: r.customization || "none",
    pairUnit: !!r.pair_unit,
    note: r.note || undefined,
    soldOut: !!r.sold_out,
  } as any));
}
