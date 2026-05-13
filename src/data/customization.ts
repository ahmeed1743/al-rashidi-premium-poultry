// Flexible customization schema engine with optional unit selection
export type SubOption = { id: string; label: string; info?: string };

export type Group = {
  id: string;
  label: string;
  info?: string;
  subRequired?: boolean;
  subOptions?: SubOption[];
};

export type UnitOption = {
  id: string;          // 'kg' | 'count'
  label: string;       // 'بالكيلو' | 'بالعدد'
  step: number;        // 0.5 for kg, 1 for count
  unitLabel: string;   // 'كيلو' | 'قطعة'
  info?: string;
};

export type CustomSchema = {
  units?: UnitOption[];   // when set => required radio
  cuts?: Group[];
  sizes?: Group[];
  types?: Group[];
};

const UNIT_KG_OR_COUNT: UnitOption[] = [
  { id: "kg", label: "بالكيلو", step: 0.5, unitLabel: "كيلو" },
  { id: "count", label: "بالعدد", step: 1, unitLabel: "قطعة" },
];

const SIZES_4: Group[] = [
  { id: "small", label: "صغير", info: "صغير الحجم" },
  { id: "med", label: "وسط", info: "حجم وسط" },
  { id: "above", label: "فوق الوسط", info: "أكبر شوية من الوسط" },
  { id: "large", label: "كبير", info: "كبير الحجم" },
];

const CHICKEN: CustomSchema = {
  sizes: SIZES_4,
  cuts: [
    { id: "saleem", label: "سليم" },
    {
      id: "cut", label: "مقطع", subRequired: true,
      subOptions: [
        { id: "4", label: "قطع /4" },
        { id: "8", label: "قطع /8" },
        { id: "long", label: "قطع بالطول" },
        { id: "wide", label: "قطع بالعرض" },
      ],
    },
    {
      id: "khaly", label: "خلي", subRequired: true,
      subOptions: [
        { id: "skin", label: "خلي بالجلد", info: "بدون عظم — مع الاحتفاظ بالجلد" },
        { id: "shish", label: "خلي شيش", info: "بدون عظم وبدون جلد" },
      ],
    },
    {
      id: "salkh", label: "سلخ", subRequired: true,
      subOptions: [
        { id: "saleem", label: "سلخ سليم", info: "بدون جلد — قطعة كاملة" },
        { id: "4", label: "سلخ /4", info: "بدون جلد ومقطع 4 قطع" },
        { id: "8", label: "سلخ /8", info: "بدون جلد ومقطع 8 قطع" },
      ],
    },
  ],
};

const RABBIT: CustomSchema = {
  sizes: SIZES_4,
  cuts: [
    { id: "saleem", label: "سليم" },
    { id: "cut", label: "مقطع" },
  ],
};

// وراك بالعظم / وراك بالعظم بلدي / فخايد — يمكن طلبه بالكيلو أو بالعدد
const THIGH_BONE: CustomSchema = {
  units: UNIT_KG_OR_COUNT,
  cuts: [
    { id: "saleem", label: "سليم" },
    {
      id: "cut", label: "مقطع", subRequired: true,
      subOptions: [
        { id: "2", label: "قطع /2" },
        { id: "3", label: "قطع /3" },
      ],
    },
    {
      id: "khaly", label: "خلي", subRequired: true,
      subOptions: [
        { id: "skin", label: "خلي بالجلد", info: "بدون عظم — مع الجلد" },
        { id: "shish", label: "خلي شيش", info: "بدون عظم وبدون جلد" },
      ],
    },
    {
      id: "salkh", label: "سلخ", subRequired: true,
      subOptions: [
        { id: "saleem", label: "سلخ سليم", info: "بدون جلد" },
        { id: "2", label: "سلخ /2", info: "بدون جلد ومقطع 2" },
        { id: "3", label: "سلخ /3", info: "بدون جلد ومقطع 3" },
      ],
    },
  ],
};

const FAKHAYED: CustomSchema = {
  units: UNIT_KG_OR_COUNT,
};

const THIGH_DUCK: CustomSchema = {
  units: UNIT_KG_OR_COUNT,
};

const DUCK: CustomSchema = {
  sizes: SIZES_4,
  cuts: [
    { id: "saleem", label: "سليم" },
    { id: "half-long", label: "نصف بطة بالطول", info: "بطة مقسومة نصفين بالطول" },
    {
      id: "cut", label: "مقطع", subRequired: true,
      subOptions: [
        { id: "4", label: "قطع /4" },
        { id: "8", label: "قطع /8" },
        { id: "long", label: "قطع بالطول" },
        { id: "wide", label: "قطع بالعرض" },
      ],
    },
  ],
};

const BREAST_BONE: CustomSchema = {
  cuts: [
    { id: "saleem", label: "سليم" },
    {
      id: "cut", label: "مقطع", subRequired: true,
      subOptions: [{ id: "2", label: "قطع /2" }],
    },
  ],
};

// دبابيس — سليم / سلخ + اختيار وحدة
const DABABEES: CustomSchema = {
  units: UNIT_KG_OR_COUNT,
  cuts: [
    { id: "saleem", label: "سليم" },
    { id: "salkh", label: "سلخ", info: "بدون جلد" },
  ],
};

export const PRESETS: Record<string, CustomSchema> = {
  chicken: CHICKEN,
  rabbit: RABBIT,
  "thigh-bone": THIGH_BONE,
  "thigh-duck": THIGH_DUCK,
  fakhayed: FAKHAYED,
  duck: DUCK,
  "breast-bone": BREAST_BONE,
  dababees: DABABEES,
  none: {},
};

export function getSchema(preset?: string | null): CustomSchema {
  if (!preset) return {};
  return PRESETS[preset] || {};
}
