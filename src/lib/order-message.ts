import { formatOrderItemDescription, normalizeEnglishDigits, type OrderMessageItem } from "@/lib/sale-units";

export type WhatsappOrderMessageInput = {
  customerName: string;
  phone: string;
  mode: "delivery" | "pickup";
  region?: string;
  street?: string;
  floorApt?: string;
  branch?: string;
  timeSlot: string;
  payment: string;
  notes?: string;
  coupon?: { code: string; discount: number } | null;
  prize?: { label: string; code?: string; note?: string } | null;
  items: (OrderMessageItem & { quantity: number })[];
};

const sectionDivider = "━━━━━━━━━━━━━━━━";
const itemDivider = "ــــــــــــــــــــــــــــــــــــ";

export function buildWhatsappOrderMessage(input: WhatsappOrderMessageInput): string {
  const lines = [
    "🛒 *طلب جديد - طيور الرشيدي*",
    sectionDivider,
    "👤 *بيانات العميل*",
    `👤 الاسم: ${input.customerName}`,
    `📱 الهاتف: ${input.phone}`,
    sectionDivider,
    input.mode === "delivery" ? "🚚 *بيانات التوصيل*" : "🏪 *بيانات الاستلام*",
  ];

  if (input.mode === "delivery") {
    if (input.region) lines.push(`📍 المنطقة: ${input.region}`);
    if (input.street) lines.push(`🏠 العنوان: ${input.street}`);
    if (input.floorApt) lines.push(`🏢 الدور والشقة: ${input.floorApt}`);
  } else if (input.branch) {
    lines.push(`📍 الفرع: ${input.branch}`);
  }

  lines.push(`🕒 موعد ${input.mode === "delivery" ? "التوصيل" : "الاستلام"}: ${input.timeSlot}`);
  lines.push(`💳 طريقة الدفع: ${input.payment}`);
  if (input.coupon) lines.push(`🎟️ كوبون: ${input.coupon.code} (خصم ${quantityText(input.coupon.discount)} ج.م)`);
  if (input.notes?.trim()) lines.push(`📌 ملاحظات: ${input.notes.trim()}`);
  if (input.prize) {
    lines.push("🎁 *جائزة عجلة الحظ*");
    lines.push(input.prize.label);
    if (input.prize.code) lines.push(`كود: ${input.prize.code}`);
    if (input.prize.note) lines.push(input.prize.note);
    lines.push("⚠️ يرجى تسليم الجائزة مع الطلب");
  }

  lines.push(sectionDivider, "🛍️ *المنتجات المطلوبة*");
  input.items.forEach((item, index) => {
    const productLine = formatOrderItemDescription(item);
    const offerPrefix = item.isOffer ? "🔥 [عرض] " : "";
    const offerPrice = item.isOffer
      ? ` — سعر العرض: ${quantityText(item.price * item.quantity)} ج.م`
      : "";
    const itemNote = item.generalNote?.trim() ? ` — ملاحظة: ${item.generalNote.trim()}` : "";
    lines.push(`${offerPrefix}${productLine}${itemNote}${offerPrice}`);
    if (index < input.items.length - 1) lines.push(itemDivider);
  });
  lines.push(sectionDivider);

  return normalizeEnglishDigits(lines.join("\n"));
}

function quantityText(value: number): string {
  return Number(value).toLocaleString("en-US", { maximumFractionDigits: 2, useGrouping: false });
}