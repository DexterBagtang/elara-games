/** blank / erased region fill */
export const BLANK = "#FFFFFF";

export type Swatch = { id: string; label: string; color: string };

/** 12 toddler-bright colors + eraser (eraser paints BLANK) */
export const PALETTE: Swatch[] = [
  { id: "red", label: "Red", color: "#EF4444" },
  { id: "orange", label: "Orange", color: "#F97316" },
  { id: "yellow", label: "Yellow", color: "#FACC15" },
  { id: "lime", label: "Lime", color: "#84CC16" },
  { id: "green", label: "Green", color: "#22C55E" },
  { id: "teal", label: "Teal", color: "#14B8A6" },
  { id: "sky", label: "Sky", color: "#38BDF8" },
  { id: "blue", label: "Blue", color: "#3B82F6" },
  { id: "purple", label: "Purple", color: "#A855F7" },
  { id: "pink", label: "Pink", color: "#EC4899" },
  { id: "brown", label: "Brown", color: "#92400E" },
  { id: "black", label: "Black", color: "#1F2937" },
];

export const ERASER: Swatch = { id: "eraser", label: "Eraser", color: BLANK };
