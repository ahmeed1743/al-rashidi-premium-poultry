import { PRODUCTS, type Product, type SectionId, type ProductConfig } from "@/data/products";
import { supabase } from "@/integrations/supabase/client";
import whiteImg from "@/assets/p-white-chicken.jpg";
import baladiImg from "@/assets/p-baladi.jpg";
import duckImg from "@/assets/p-duck.jpg";
import turkeyImg from "@/assets/p-turkey.jpg";
import rabbitImg from "@/assets/p-rabbit.jpg";
import marinatedImg from "@/assets/p-marinated.jpg";
import mealImg from "@/assets/p-meal.jpg";
import { displaySaleUnitName, type ConfiguredSaleUnit } from "@/lib/sale-units";

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
  const [productResult, unitResult] = await Promise.all([
    includeInactive ? q : q.eq("is_active", true),
    (supabase as any)
      .from("product_sale_units")
      .select("product_id, unit_id, price, is_default, is_active, sale_units(name_ar, display_format, unit_kind, is_active)")
      .eq("is_active", true),
  ]);
  const { data, error } = productResult;
  if (error || !data || data.length === 0) return PRODUCTS; // fallback while DB warms up

  const unitsByProduct = new Map<string, ConfiguredSaleUnit[]>();
  for (const row of (unitResult.data || []) as any[]) {
    const related = Array.isArray(row.sale_units) ? row.sale_units[0] : row.sale_units;
    if (!row.is_active || !related?.is_active) continue;
    const kind = related.unit_kind === "weight" || related.unit_kind === "count" ? related.unit_kind : "other";
    const configured: ConfiguredSaleUnit = {
      unitId: row.unit_id,
      name: related.name_ar,
      displayFormat: related.display_format,
      kind,
      price: Number(row.price) || 0,
      isDefault: !!row.is_default,
      isActive: true,
    };
    const current = unitsByProduct.get(row.product_id) || [];
    current.push(configured);
    unitsByProduct.set(row.product_id, current);
  }

  return data.map((r: any) => ({
    id: r.id,
    name: r.name,
    description: r.description || "",
    price: Number((unitsByProduct.get(r.id) || []).find((unit) => unit.isDefault)?.price ?? r.price) || 0,
    oldPrice: r.old_price ? Number(r.old_price) : undefined,
    image: resolveImage(r.category, r.image_url, r.subcategory),
    section: r.category as SectionId,
    subcategory: r.subcategory || undefined,
    badge: r.badge || (r.sold_out ? "تم النفاذ" : undefined),
    customization: r.customization || "none",
    pairUnit: !!r.pair_unit,
    note: r.note || undefined,
    soldOut: !!r.sold_out,
    config: (r.customization_config as ProductConfig) || undefined,
    discountPercent: r.discount_percent ? Number(r.discount_percent) : undefined,
    saleUnits: unitsByProduct.get(r.id),
    priceUnitLabel: (() => {
      const defaultUnit = (unitsByProduct.get(r.id) || []).find((unit) => unit.isDefault);
      return defaultUnit ? displaySaleUnitName(1, defaultUnit.displayFormat, defaultUnit.name) : undefined;
    })(),
  } as any));
}
