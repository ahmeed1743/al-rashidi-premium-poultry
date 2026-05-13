import whiteImg from "@/assets/p-white-chicken.jpg";
import baladiImg from "@/assets/p-baladi.jpg";
import duckImg from "@/assets/p-duck.jpg";
import turkeyImg from "@/assets/p-turkey.jpg";
import rabbitImg from "@/assets/p-rabbit.jpg";
import marinatedImg from "@/assets/p-marinated.jpg";
import mealImg from "@/assets/p-meal.jpg";

export type SectionId = "chicken" | "duck" | "turkey" | "pigeon" | "marinated" | "parts" | "other";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  section: SectionId;
  subcategory?: string;
  badge?: string;
  customization: string;   // preset key from PRESETS
  pairUnit?: boolean;      // true => quantity is "جوز"
  note?: string;
  soldOut?: boolean;
}

export const SECTIONS: { id: SectionId; label: string; emoji: string }[] = [
  { id: "chicken", label: "فراخ", emoji: "🐔" },
  { id: "duck", label: "بط", emoji: "🦆" },
  { id: "turkey", label: "رومي", emoji: "🦃" },
  { id: "pigeon", label: "حمام وسمان", emoji: "🕊️" },
  { id: "marinated", label: "متبلات", emoji: "🍢" },
  { id: "parts", label: "أجزاء", emoji: "🍗" },
  { id: "other", label: "أخرى", emoji: "🐰" },
];

export const PRODUCTS: Product[] = [
  // --- فراخ ---
  { id: "white-chicken", name: "أبيض حي", description: "فراخ بيضاء طازجة فريش", price: 118, image: whiteImg, section: "chicken", subcategory: "أبيض", customization: "chicken" },
  { id: "baladi-chicken", name: "بلدي حي", description: "فراخ بلدي مذاق أصيل", price: 140, image: baladiImg, section: "chicken", subcategory: "بلدي", customization: "chicken" },
  { id: "baladi-hor", name: "بلدي حر", description: "بلدي حر طبيعي", price: 170, image: baladiImg, section: "chicken", subcategory: "بلدي حر", customization: "chicken" },
  { id: "omhat", name: "فراخ أمهات", description: "فراخ أمهات", price: 0, image: baladiImg, section: "chicken", subcategory: "أمهات", customization: "chicken", note: "اتصل لمعرفة السعر" },

  // --- بط ---
  { id: "duck-fallahi", name: "بط فلاحي", description: "بط فلاحي طازج", price: 160, image: duckImg, section: "duck", subcategory: "بط فلاحي", customization: "duck" },
  { id: "duck-moskovi", name: "بط مسكوفي", description: "بط مسكوفي طازج", price: 160, image: duckImg, section: "duck", subcategory: "بط مسكوفي", customization: "duck" },
  { id: "duck-cubes", name: "مكعبات بط", description: "مكعبات بط جاهزة (ميكس صدور ووراك)", price: 290, image: duckImg, section: "duck", subcategory: "مكعبات", customization: "none" },
  { id: "duck-breast", name: "صدور بط", description: "صدور بط طازجة", price: 280, image: duckImg, section: "duck", subcategory: "صدور", customization: "none" },
  { id: "duck-thigh", name: "وراك بط", description: "وراك بط طازج", price: 280, image: duckImg, section: "duck", subcategory: "وراك", customization: "thigh-duck" },

  // --- رومي ---
  { id: "turkey-white", name: "رومي أبيض كامل", description: "رومي أبيض كامل", price: 160, image: turkeyImg, section: "turkey", subcategory: "رومي أبيض", customization: "none" },
  { id: "turkey-baladi", name: "رومي بلدي", description: "رومي بلدي طازج", price: 190, image: turkeyImg, section: "turkey", subcategory: "رومي بلدي", customization: "none" },
  { id: "turkey-cubes", name: "مكعبات رومي", description: "مكعبات رومي (ميكس صدور ووراك)", price: 200, image: turkeyImg, section: "turkey", subcategory: "مكعبات", customization: "none" },
  { id: "rosto-turkey", name: "روستو رومي", description: "روستو رومي مميز", price: 320, image: turkeyImg, section: "turkey", subcategory: "روستو", customization: "none", note: "الوزن من 1.5 إلى 2 كيلو - الطلب بالعدد" },
  { id: "thigh-turkey", name: "وراك رومي", description: "وراك رومي طازج", price: 190, image: turkeyImg, section: "turkey", subcategory: "وراك", customization: "none", note: "وزن الورك من 1.5 إلى 2 كيلو" },

  // --- حمام وسمان ---
  { id: "pigeon", name: "حمام بلدي", description: "حمام بلدي طازج", price: 220, image: mealImg, section: "pigeon", subcategory: "حمام", customization: "none", pairUnit: true, note: "الطلب بالجوز فقط" },
  { id: "pigeon-rice", name: "حمام محشي أرز", description: "حمام محشي أرز جاهز", price: 260, image: mealImg, section: "pigeon", subcategory: "حمام محشي", customization: "none", pairUnit: true, note: "الطلب بالجوز فقط" },
  { id: "pigeon-freek", name: "حمام محشي فريك", description: "حمام محشي فريك جاهز", price: 260, image: mealImg, section: "pigeon", subcategory: "حمام محشي", customization: "none", pairUnit: true, note: "الطلب بالجوز فقط" },
  { id: "quail", name: "سمان", description: "سمان طازج", price: 110, image: mealImg, section: "pigeon", subcategory: "سمان", customization: "none", pairUnit: true, note: "الطلب بالجوز فقط" },

  // --- متبلات ---
  { id: "shish-marinated", name: "شيش متبل", description: "شيش متبل جاهز للشواء", price: 290, image: marinatedImg, section: "marinated", customization: "none" },
  { id: "shish-thigh-marinated", name: "شيش متبل وراك", description: "شيش وراك متبل", price: 290, image: marinatedImg, section: "marinated", customization: "none" },
  { id: "shish-breast-marinated", name: "شيش متبل صدور", description: "شيش صدور متبل", price: 290, image: marinatedImg, section: "marinated", customization: "none" },
  { id: "kofta-chicken", name: "كفتة فراخ", description: "كفتة فراخ متبلة", price: 290, image: marinatedImg, section: "marinated", customization: "none" },
  { id: "strips", name: "ستربس متبل", description: "ستربس فراخ متبل", price: 290, image: marinatedImg, section: "marinated", customization: "none" },
  { id: "panee-marinated", name: "بانية متبل", description: "بانية متبل", price: 290, image: marinatedImg, section: "marinated", customization: "none" },
  { id: "nuggets", name: "ناجتس", description: "ناجتس فراخ", price: 300, image: marinatedImg, section: "marinated", customization: "none" },
  { id: "crispy", name: "كرسبي", description: "قطع كرسبي", price: 300, image: marinatedImg, section: "marinated", customization: "none" },
  { id: "kofta-rice-meat", name: "كفتة أرز ولحم", description: "كفتة أرز ولحم", price: 400, image: marinatedImg, section: "marinated", customization: "none" },
  { id: "fake-pigeon", name: "جوز حمام كذاب", description: "حمام كذاب", price: 140, image: marinatedImg, section: "marinated", customization: "none" },
  { id: "sausage-chicken", name: "سجق فراخ", description: "سجق فراخ متبل", price: 290, image: marinatedImg, section: "marinated", customization: "none" },
  { id: "cordon-bleu", name: "كوردون بلو", description: "كوردون بلو", price: 300, image: marinatedImg, section: "marinated", customization: "none" },
  { id: "stuffed-rice-white", name: "فرخة أبيض محشية أرز", description: "فرخة محشية أرز", price: 260, image: mealImg, section: "marinated", customization: "none" },
  { id: "stuffed-baladi-freek", name: "فرخة بلدي محشية فريك", description: "فرخة بلدي محشية فريك", price: 290, image: mealImg, section: "marinated", customization: "none" },
  { id: "marinated-thermal", name: "فراخ متبلة حراري", description: "فراخ متبلة حراري", price: 260, image: marinatedImg, section: "marinated", customization: "none" },
  { id: "thigh-tray", name: "صينية وراك متبلة", description: "صينية وراك متبلة", price: 180, image: marinatedImg, section: "marinated", customization: "none" },
  { id: "mombar", name: "ممبار", description: "ممبار محشي", price: 145, image: marinatedImg, section: "marinated", customization: "none" },
  { id: "grape-leaves", name: "ورق عنب", description: "ورق عنب محشي", price: 125, image: marinatedImg, section: "marinated", customization: "none" },
  { id: "cabbage", name: "محشي كرنب", description: "محشي كرنب", price: 125, image: marinatedImg, section: "marinated", customization: "none" },
  { id: "kofta-panee", name: "كفتة بانية", description: "كفتة بانية", price: 0, image: marinatedImg, section: "marinated", customization: "none", note: "اتصل لمعرفة السعر" },
  { id: "shawerma", name: "شاورما عادية", description: "شاورما فراخ", price: 170, image: marinatedImg, section: "marinated", customization: "none" },

  // --- أجزاء ---
  { id: "wing", name: "جناح", description: "أجنحة فراخ", price: 60, image: whiteImg, section: "parts", customization: "none" },
  { id: "ground", name: "مفروم", description: "فراخ مفروم", price: 170, image: whiteImg, section: "parts", customization: "none" },
  { id: "breast-bone", name: "صدور بالعظم", description: "صدور بالعظم", price: 230, image: whiteImg, section: "parts", customization: "breast-bone", note: "الطلب بالعدد فقط — وزن الصدر حوالي 600 إلى 800 جرام" },
  { id: "breast-bone-baladi", name: "صدور بالعظم بلدي", description: "صدور بلدي بالعظم", price: 289, image: baladiImg, section: "parts", customization: "breast-bone", note: "الطلب بالعدد فقط — وزن الصدر حوالي 600 إلى 800 جرام" },
  { id: "shish", name: "شيش", description: "شيش طازج", price: 252, image: whiteImg, section: "parts", customization: "none" },
  { id: "panee", name: "بانية", description: "بانية فراخ", price: 259, image: whiteImg, section: "parts", customization: "none" },
  { id: "thigh-bone", name: "وراك بالعظم", description: "وراك بالعظم", price: 107, image: whiteImg, section: "parts", customization: "thigh-bone" },
  { id: "thigh-bone-baladi", name: "وراك بالعظم بلدي", description: "وراك بلدي بالعظم", price: 130, image: baladiImg, section: "parts", customization: "thigh-bone" },
  { id: "dababees", name: "دبابيس", description: "دبابيس فراخ", price: 195, image: whiteImg, section: "parts", customization: "dababees" },
  { id: "liver", name: "كبدة", description: "كبدة فراخ", price: 135, image: whiteImg, section: "parts", customization: "none" },
  { id: "qawanis", name: "قوانص", description: "قوانص فراخ", price: 110, image: whiteImg, section: "parts", customization: "none" },
  { id: "liver-qawanis", name: "كبد وقوانص (مشكل)", description: "كبدة وقوانص ميكس", price: 123, image: whiteImg, section: "parts", customization: "none" },
  { id: "fakhayed", name: "فخايد", description: "فخايد فراخ", price: 100, image: whiteImg, section: "parts", customization: "fakhayed" },

  // --- أخرى ---
  { id: "rabbit", name: "أرانب", description: "أرانب طازجة مختارة بعناية", price: 147, image: rabbitImg, section: "other", customization: "rabbit" },
];
