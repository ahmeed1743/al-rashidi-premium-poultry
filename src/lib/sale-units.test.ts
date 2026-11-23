import { describe, expect, it } from "bun:test";
import { buildWhatsappOrderMessage } from "@/lib/order-message";
import { displaySaleUnitName, formatOrderItemDescription, updateProductSaleUnitDrafts } from "@/lib/sale-units";

describe("sale unit formatting", () => {
  it("formats a fractional weight quantity in English digits", () => {
    expect(formatOrderItemDescription({
      name: "شيش متبل وراك",
      quantity: 1.5,
      price: 290,
      unitLabel: "كيلو",
      unitKind: "weight",
    })).toBe("1.5 كيلو شيش متبل وراك");
  });

  it("formats a count quantity and only the selected cutting option", () => {
    expect(formatOrderItemDescription({
      name: "وراك بالعظم",
      quantity: 7,
      price: 105,
      unitLabel: "قطعة",
      unitKind: "count",
      options: { "الطلب": "بالعدد", "التقطيع": "مقطع - قطع /2" },
    })).toBe("عدد 7 وراك بالعظم قطع /2");
  });

  it("chooses the configured plural form for custom units", () => {
    expect(displaySaleUnitName(3, "صينية / صواني", "صينية")).toBe("صواني");
    expect(formatOrderItemDescription({
      name: "منتج تجريبي",
      quantity: 3,
      price: 50,
      unitLabel: "صينية",
      unitFormat: "صينية / صواني",
      unitKind: "other",
    })).toBe("3 صواني منتج تجريبي");
  });

  it("keeps exactly one active default when a product unit is changed", () => {
    const first = updateProductSaleUnitDrafts({}, "kg", { price: 120, isActive: true });
    const second = updateProductSaleUnitDrafts(first, "piece", { price: 18, isActive: true });
    const selected = updateProductSaleUnitDrafts(second, "piece", { isDefault: true });
    const defaults = Object.entries(selected).filter(([, unit]) => unit.isActive && unit.isDefault);

    expect(defaults.map(([id]) => id)).toEqual(["piece"]);
  });

  it("puts customer and delivery details before products and keeps products last", () => {
    const message = buildWhatsappOrderMessage({
      customerName: "أحمد",
      phone: "٠١٢٣٤٥٦٧٨٩٠",
      mode: "delivery",
      region: "سموحة",
      street: "شارع النصر",
      floorApt: "4 - 1",
      timeSlot: "11:00 ص",
      payment: "كاش",
      items: [{ name: "أبيض", quantity: 2, price: 118, unitLabel: "قطعة", unitKind: "count" }],
    });

    expect(message.indexOf("📱 الهاتف: 01234567890")).toBeLessThan(message.indexOf("🛍️ *المنتجات المطلوبة*"));
    expect(message.indexOf("🕒 موعد التوصيل: 11:00 ص")).toBeLessThan(message.indexOf("🛍️ *المنتجات المطلوبة*"));
    expect(message.endsWith("━━━━━━━━━━━━━━━━")).toBe(true);
  });
});