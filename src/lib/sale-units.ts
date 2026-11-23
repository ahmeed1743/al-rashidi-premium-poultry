export type SaleUnitKind = "weight" | "count" | "other";

export type ConfiguredSaleUnit = {
  unitId: string;
  name: string;
  displayFormat?: string | null;
  kind: SaleUnitKind;
  price: number;
  isDefault: boolean;
  isActive: boolean;
};

export type ProductSaleUnitDraft = {
  price: number;
  isActive: boolean;
  isDefault: boolean;
};

export function updateProductSaleUnitDrafts(
  drafts: Record<string, ProductSaleUnitDraft>,
  unitId: string,
  change: Partial<ProductSaleUnitDraft>,
): Record<string, ProductSaleUnitDraft> {
  const current = drafts[unitId] || { price: 0, isActive: false, isDefault: false };
  const next = { ...drafts, [unitId]: { ...current, ...change } };

  if (change.isDefault === true) {
    for (const [id, draft] of Object.entries(next)) {
      next[id] = { ...draft, isDefault: id === unitId, isActive: id === unitId ? true : draft.isActive };
    }
  }

  if (change.isActive === false && current.isDefault) {
    next[unitId] = { ...next[unitId], isDefault: false };
    const replacement = Object.keys(next).find((id) => id !== unitId && next[id]?.isActive);
    if (replacement) next[replacement] = { ...next[replacement], isDefault: true };
  }

  if (change.isActive === true && !Object.values(next).some((draft) => draft.isActive && draft.isDefault)) {
    next[unitId] = { ...next[unitId], isDefault: true };
  }

  return next;
}

export function quantityText(value: number): string {
  return Number(value).toLocaleString("en-US", { maximumFractionDigits: 2, useGrouping: false });
}

export function displaySaleUnitName(
  quantity: number,
  displayFormat: string | null | undefined,
  fallbackName: string,
): string {
  const forms = (displayFormat || fallbackName)
    .split(/[|/]/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (forms.length === 0) return fallbackName;
  if (quantity === 1 || forms.length === 1) return forms[0] || fallbackName;
  return forms[1] || forms[0] || fallbackName;
}

export type OrderMessageItem = {
  name: string;
  quantity: number;
  price: number;
  pairUnit?: boolean;
  unitLabel?: string;
  unitFormat?: string | null;
  unitKind?: SaleUnitKind;
  options?: Record<string, string>;
  generalNote?: string;
  isOffer?: boolean;
};

const optionText = (item: OrderMessageItem) => {
  const preferred = [item.options?.["الحجم"], item.options?.["النوع"], item.options?.["التقطيع"]]
    .filter((value): value is string => !!value?.trim())
    .map((value) => value.replace(/^(مقطع|سلخ|خلي)\s*[-–—]\s*/, "").trim());
  return preferred.join(" ");
};

export function formatOrderItemDescription(item: OrderMessageItem): string {
  const quantity = quantityText(item.quantity);
  const productDescription = [item.name.trim(), optionText(item)].filter(Boolean).join(" ");
  const unitName = item.unitLabel?.trim();

  if (item.pairUnit) return `${quantity} جوز ${productDescription}`;
  if (item.unitKind === "weight" && unitName) return `${quantity} ${unitName} ${productDescription}`;
  if (item.unitKind === "count" && unitName === "قطعة") return `عدد ${quantity} ${productDescription}`;
  if (unitName) {
    const formattedName = displaySaleUnitName(item.quantity, item.unitFormat, unitName);
    if (item.unitKind === "count" && unitName === "عدد") return `عدد ${quantity} ${productDescription}`;
    return `${quantity} ${formattedName} ${productDescription}`;
  }
  return `${quantity} ${productDescription}`;
}

export function normalizeEnglishDigits(value: string): string {
  return value
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));
}