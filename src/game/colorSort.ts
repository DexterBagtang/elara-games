/**
 * Round logic for the "Sort by Color" game — same shape as `animals.ts`'s
 * `nextRound`, reusing the palette from the coloring game instead of a
 * separate color list.
 */
import { PALETTE, type Swatch } from "./palette";

/** bins shown per round — 3 is the toddler sweet spot (see animals.ts) */
export const BINS = 3;

export type Round = {
  target: Swatch;
  /** target plus (BINS - 1) distractors, shuffled into bin order */
  bins: Swatch[];
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build the next round. Pass the previous target's id so the same color is
 * never asked twice in a row (feels broken to a toddler).
 */
export function nextRound(prevTargetId?: string): Round {
  const pool = prevTargetId
    ? PALETTE.filter((s) => s.id !== prevTargetId)
    : PALETTE;
  const target = pool[Math.floor(Math.random() * pool.length)];
  const distractors = shuffle(
    PALETTE.filter((s) => s.id !== target.id),
  ).slice(0, BINS - 1);
  return { target, bins: shuffle([target, ...distractors]) };
}
