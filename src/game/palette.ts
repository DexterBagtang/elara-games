/** blank / erased region fill */
export const BLANK = "#FFFFFF";

export type Swatch = { id: string; label: string; color: string };

/**
 * 8 bright, clearly-distinct colors + eraser. Kept small on purpose:
 * ages 2–5 do better with fewer, bigger targets in one row than a full
 * rainbow. Add more here if you want — the strip wraps.
 */
export const PALETTE: Swatch[] = [
  { id: "red", label: "Red", color: "#EF4444" },
  { id: "orange", label: "Orange", color: "#F97316" },
  { id: "yellow", label: "Yellow", color: "#FACC15" },
  { id: "green", label: "Green", color: "#22C55E" },
  { id: "blue", label: "Blue", color: "#3B82F6" },
  { id: "purple", label: "Purple", color: "#A855F7" },
  { id: "pink", label: "Pink", color: "#EC4899" },
  { id: "brown", label: "Brown", color: "#92400E" },
];

export const ERASER: Swatch = { id: "eraser", label: "Eraser", color: BLANK };
