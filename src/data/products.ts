import whiteImg from "@/assets/p-white-chicken.jpg";
import baladiImg from "@/assets/p-baladi.jpg";
import duckImg from "@/assets/p-duck.jpg";
import turkeyImg from "@/assets/p-turkey.jpg";
import rabbitImg from "@/assets/p-rabbit.jpg";
import marinatedImg from "@/assets/p-marinated.jpg";
import mealImg from "@/assets/p-meal.jpg";

export type CategoryId =
  | "white"
  | "baladi"
  | "baladi-hor"
  | "rabbit"
  | "duck"
  | "turkey"
  | "breast-bone"
  | "thigh-bone"
  | "thigh-turkey"
  | "rosto-turkey"
  | "duck-cubes"
  | "turkey-cubes"
  | "marinated"
  | "offers"
  | "meals";

export type CustomizationKind =
  | "size-cut"          // size + saleem/cut
  | "duck"              // duck type + saleem/cut
  | "baladi-hor"        // small only + saleem/cut
  | "type-cut"          // white/baladi + saleem/cut(2)
  | "type-cut-simple"   // white/baladi + saleem/cut
  | "cut-only"          // saleem/cut
  | "none";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: CategoryId;
  badge?: string;
  customization: CustomizationKind;
  note?: string;
}

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "white", label: "فراخ بيضاء" },
  { id: "baladi", label: "فراخ بلدي" },
  { id: "baladi-hor", label: "بلدي حر" },
  { id: "rabbit", label: "أرانب" },
  { id: "duck", label: "بط" },
  { id: "turkey", label: "رومي" },
  { id: "breast-bone", label: "صدور بالعظم" },
  { id: "thigh-bone", label: "وراك بالعظم" },
  { id: "thigh-turkey", label: "وراك رومي" },
  { id: "rosto-turkey", label: "روستو رومي" },
  { id: "duck-cubes", label: "مكعبات بط" },
  { id: "turkey-cubes", label: "مكعبات رومي" },
  { id: "marinated", label: "متبلات" },
  { id: "offers", label: "عروض" },
  { id: "meals", label: "واجبات" },
];

export const PRODUCTS: Product[] = [
  {
    id: "white-chicken",
    name: "فراخ بيضاء طازجة",
    description: "فراخ بيضاء فريش، نظافة تامة وجودة ممتازة.",
    price: 95,
    image: whiteImg,
    category: "white",
    customization: "size-cut",
  },
  {
    id: "baladi-chicken",
    name: "فراخ بلدي",
    description: "فراخ بلدي مذاق أصلي وطعم لا يُقاوم.",
    price: 165,
    image: baladiImg,
    category: "baladi",
    customization: "size-cut",
  },
  {
    id: "baladi-hor",
    name: "بلدي حر",
    description: "بلدي حر صغير، طعم تقليدي وأصيل.",
    price: 220,
    image: baladiImg,
    category: "baladi-hor",
    customization: "baladi-hor",
  },
  {
    id: "rabbit",
    name: "أرانب طازجة",
    description: "أرانب طازجة مختارة بعناية.",
    price: 240,
    image: rabbitImg,
    category: "rabbit",
    customization: "size-cut",
  },
  {
    id: "duck",
    name: "بط فلاحي / مسكوفي",
    description: "بط طازج بأنواعه، فلاحي ومسكوفي.",
    price: 280,
    image: duckImg,
    category: "duck",
    customization: "duck",
  },
  {
    id: "turkey",
    name: "رومي طازج",
    description: "رومي طازج بحجم مميز.",
    price: 230,
    image: turkeyImg,
    category: "turkey",
    customization: "cut-only",
  },
  {
    id: "breast-bone",
    name: "صدور بالعظم",
    description: "صدور بالعظم — أبيض أو بلدي.",
    price: 110,
    image: whiteImg,
    category: "breast-bone",
    customization: "type-cut",
    note: "الطلب بالعدد",
  },
  {
    id: "thigh-bone",
    name: "وراك بالعظم",
    description: "وراك بالعظم — أبيض أو بلدي.",
    price: 105,
    image: baladiImg,
    category: "thigh-bone",
    customization: "type-cut-simple",
  },
  {
    id: "thigh-turkey",
    name: "وراك رومي",
    description: "وراك رومي طازج وممتاز.",
    price: 260,
    image: turkeyImg,
    category: "thigh-turkey",
    customization: "cut-only",
    note: "الطلب بالعدد - وزن الورك من 1.5 كيلو إلى 2 كيلو",
  },
  {
    id: "rosto-turkey",
    name: "روستو رومي",
    description: "روستو رومي مميز للشوي.",
    price: 270,
    image: turkeyImg,
    category: "rosto-turkey",
    customization: "cut-only",
    note: "الطلب بالعدد - الوزن من 1.5 كيلو إلى 2 كيلو",
  },
  {
    id: "duck-cubes",
    name: "مكعبات بط",
    description: "مكعبات بط جاهزة للطبخ.",
    price: 320,
    image: duckImg,
    category: "duck-cubes",
    customization: "none",
    note: "ميكس صدور ووراك",
  },
  {
    id: "turkey-cubes",
    name: "مكعبات رومي",
    description: "مكعبات رومي جاهزة للطبخ.",
    price: 290,
    image: turkeyImg,
    category: "turkey-cubes",
    customization: "none",
    note: "ميكس صدور ووراك",
  },
  {
    id: "marinated-shawerma",
    name: "متبل شاورما",
    description: "صدور دجاج متبلة شاورما بنكهة مميزة.",
    price: 145,
    image: marinatedImg,
    category: "marinated",
    customization: "none",
  },
  {
    id: "marinated-grill",
    name: "متبل مشوي",
    description: "قطع دجاج متبلة جاهزة للشواء.",
    price: 140,
    image: marinatedImg,
    category: "marinated",
    customization: "none",
  },
  {
    id: "offer-family",
    name: "عرض العيلة",
    description: "فرختين بيضاء + كيلو متبل + توابل مجانية.",
    price: 280,
    oldPrice: 340,
    image: mealImg,
    category: "offers",
    badge: "وفّر 60ج",
    customization: "none",
  },
  {
    id: "meal-grill",
    name: "واجبة ربع مشوي",
    description: "ربع فرخة مشوية + أرز + سلطة + خبز.",
    price: 95,
    image: mealImg,
    category: "meals",
    customization: "none",
  },
  {
    id: "meal-half",
    name: "واجبة نص فرخة",
    description: "نص فرخة مشوية + أرز + سلطة + خبز + مشروب.",
    price: 165,
    image: mealImg,
    category: "meals",
    customization: "none",
  },
];
