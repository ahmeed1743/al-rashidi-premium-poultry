// Flexible customization schema engine
export type SubOption = { id: string; label: string; info?: string };

export type Group = {
  id: string;
  label: string;
  info?: string;            // tooltip shown next to the chip
  subRequired?: boolean;    // if user picks this group, sub-radio is required
  subOptions?: SubOption[];
};

export type CustomSchema = {
  cuts?: Group[];
  sizes?: Group[];   // typed groups too (so we can add tooltips like duck sizes)
  types?: Group[];
};

const CHICKEN: CustomSchema = {
  cuts: [
    { id: "saleem", label: "سليم" },
    {
      id: "cut",
      label: "مقطع",
      subRequired: true,
      subOptions: [
        { id: "4", label: "قطع /4" },
        { id: "8", label: "قطع /8" },
        { id: "long", label: "قطع بالطول" },
        { id: "wide", label: "قطع بالعرض" },
      ],
    },
    {
      id: "khaly",
      label: "خلي",
      subRequired: true,
      subOptions: [
        { id: "skin", label: "خلي بالجلد", info: "بدون عظم" },
        { id: "shish", label: "خلي شيش", info: "بدون عظم وبدون جلد" },
      ],
    },
    {
      id: "salkh",
      label: "سلخ",
      subRequired: true,
      subOptions: [
        { id: "saleem", label: "سلخ سليم", info: "بدون جلد" },
        { id: "4", label: "سلخ /4", info: "بدون جلد ومقطع 4 قطع" },
        { id: "8", label: "سلخ /8", info: "بدون جلد ومقطع 8 قطع" },
      ],
    },
  ],
};

const RABBIT: CustomSchema = {
  cuts: [
    { id: "saleem", label: "سليم" },
    { id: "cut", label: "مقطع" },
  ],
};

const THIGH_BONE: CustomSchema = {
  cuts: [
    { id: "saleem", label: "سليم" },
    {
      id: "cut",
      label: "مقطع",
      subRequired: true,
      subOptions: [
        { id: "2", label: "قطع /2" },
        { id: "3", label: "قطع /3" },
      ],
    },
    {
      id: "khaly",
      label: "خلي",
      subRequired: true,
      subOptions: [
        { id: "skin", label: "خلي بالجلد", info: "بدون عظم" },
        { id: "shish", label: "خلي شيش", info: "بدون عظم وبدون جلد" },
      ],
    },
    {
      id: "salkh",
      label: "سلخ",
      subRequired: true,
      subOptions: [
        { id: "saleem", label: "سلخ سليم", info: "بدون جلد" },
        { id: "2", label: "سلخ /2", info: "بدون جلد ومقطع 2" },
        { id: "3", label: "سلخ /3", info: "بدون جلد ومقطع 3" },
      ],
    },
  ],
};

const DUCK: CustomSchema = {
  sizes: [
    { id: "small", label: "صغير", info: "من 2.5 إلى 3 كيلو" },
    { id: "med", label: "وسط", info: "من 3 إلى 4 كيلو" },
    { id: "large", label: "كبير", info: "من 4 إلى 5 كيلو" },
  ],
  cuts: [
    { id: "saleem", label: "سليم" },
    {
      id: "cut",
      label: "مقطع",
      subRequired: true,
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
      id: "cut",
      label: "مقطع",
      subRequired: true,
      subOptions: [{ id: "2", label: "قطع /2" }],
    },
  ],
};

const DABABEES: CustomSchema = {
  cuts: [
    { id: "salkh", label: "سلخ", info: "بدون جلد" },
  ],
};

export const PRESETS: Record<string, CustomSchema> = {
  chicken: CHICKEN,
  rabbit: RABBIT,
  "thigh-bone": THIGH_BONE,
  duck: DUCK,
  "breast-bone": BREAST_BONE,
  dababees: DABABEES,
  none: {},
};

export function getSchema(preset?: string | null): CustomSchema {
  if (!preset) return {};
  return PRESETS[preset] || {};
}
