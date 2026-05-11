import { PRODUCTS, type Product } from "@/data/products";

// Phase 1: serve products from local catalog. DB-backed admin returns in Phase 2.
export async function fetchProducts(_includeInactive = false): Promise<Product[]> {
  return PRODUCTS;
}

export function resolveImage(_section: string, image_url?: string | null): string {
  if (image_url && image_url.length > 0) return image_url;
  return PRODUCTS[0].image;
}
