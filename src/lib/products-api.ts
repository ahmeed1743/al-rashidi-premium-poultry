import { supabase } from "@/integrations/supabase/client";
import { PRODUCTS, type Product, type CategoryId } from "@/data/products";
import whiteImg from "@/assets/p-white-chicken.jpg";
import baladiImg from "@/assets/p-baladi.jpg";
import duckImg from "@/assets/p-duck.jpg";
import turkeyImg from "@/assets/p-turkey.jpg";
import rabbitImg from "@/assets/p-rabbit.jpg";
import marinatedImg from "@/assets/p-marinated.jpg";
import mealImg from "@/assets/p-meal.jpg";

const fallbackByCategory: Record<string, string> = {
  white: whiteImg,
  baladi: baladiImg,
  "baladi-hor": baladiImg,
  rabbit: rabbitImg,
  duck: duckImg,
  turkey: turkeyImg,
  "breast-bone": whiteImg,
  "thigh-bone": baladiImg,
  "thigh-turkey": turkeyImg,
  "rosto-turkey": turkeyImg,
  "duck-cubes": duckImg,
  "turkey-cubes": turkeyImg,
  marinated: marinatedImg,
  offers: mealImg,
  meals: mealImg,
};

export function resolveImage(category: string, image_url?: string | null): string {
  if (image_url && image_url.length > 0) return image_url;
  return fallbackByCategory[category] || mealImg;
}

export async function fetchProducts(includeInactive = false): Promise<Product[]> {
  const q = supabase.from("products").select("*").order("sort_order", { ascending: true });
  const { data, error } = await q;
  if (error || !data) return PRODUCTS;
  const rows = includeInactive ? data : data.filter((r: any) => r.is_active);
  return rows.map((r: any) => ({
    id: r.id,
    name: r.name,
    description: r.description || "",
    price: Number(r.price),
    oldPrice: r.old_price != null ? Number(r.old_price) : undefined,
    image: resolveImage(r.category, r.image_url),
    category: r.category as CategoryId,
    badge: r.badge || undefined,
    customization: r.customization as Product["customization"],
    note: r.note || undefined,
  }));
}
