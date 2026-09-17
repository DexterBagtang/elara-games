/**
 * Round logic for "Feed the Monster" — a counting game that ramps through
 * seven levels (see AGENTS.md-adjacent design notes in the PR): plain
 * counting, named food, group comparison, mixed-object counting, and
 * simple addition. Same shape as `animals.ts` / `colorSort.ts`: pure
 * functions the screen calls to get the next round.
 */
export type Food = {
  id: string;
  emoji: string;
  singular: string;
  plural: string;
};

export const FOODS: Food[] = [
  { id: "apple", emoji: "🍎", singular: "apple", plural: "apples" },
  { id: "banana", emoji: "🍌", singular: "banana", plural: "bananas" },
  { id: "orange", emoji: "🍊", singular: "orange", plural: "oranges" },
  { id: "strawberry", emoji: "🍓", singular: "strawberry", plural: "strawberries" },
  { id: "cookie", emoji: "🍪", singular: "cookie", plural: "cookies" },
  { id: "cupcake", emoji: "🧁", singular: "cupcake", plural: "cupcakes" },
  { id: "carrot", emoji: "🥕", singular: "carrot", plural: "carrots" },
  { id: "donut", emoji: "🍩", singular: "donut", plural: "donuts" },
];

/** spoken aloud instead of digits — warmer for TTS ("One!" not "1!") */
export const NUMBER_WORDS = [
  "One", "Two", "Three", "Four", "Five",
  "Six", "Seven", "Eight", "Nine", "Ten",
];

export type Mode = "count" | "mixedCount" | "chooseGroup" | "addition";

export type LevelConfig = { id: number; mode: Mode; min: number; max: number };

export const LEVELS: LevelConfig[] = [
  { id: 1, mode: "count", min: 1, max: 3 },
  { id: 2, mode: "count", min: 1, max: 5 },
  { id: 3, mode: "count", min: 1, max: 10 },
  { id: 4, mode: "count", min: 3, max: 5 },
  { id: 5, mode: "chooseGroup", min: 2, max: 6 },
  { id: 6, mode: "mixedCount", min: 1, max: 5 },
  { id: 7, mode: "addition", min: 1, max: 3 },
];

export const MAX_LEVEL = LEVELS.length;
/** consecutive wins at a level before it steps up */
export const ROUNDS_PER_LEVEL = 3;

export type CountRound = { mode: "count"; food: Food; target: number };
export type MixedRound = {
  mode: "mixedCount";
  food: Food;
  target: number;
  distractor: Food;
  distractorCount: number;
};
export type GroupRound = {
  mode: "chooseGroup";
  food: Food;
  target: number;
  groupCounts: number[];
};
export type AdditionRound = {
  mode: "addition";
  food: Food;
  a: number;
  b: number;
  target: number;
};

export type Round = CountRound | MixedRound | GroupRound | AdditionRound;

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function pickFood(excludeId?: string): Food {
  const pool = excludeId ? FOODS.filter((f) => f.id !== excludeId) : FOODS;
  return pool[Math.floor(Math.random() * pool.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function levelConfig(level: number): LevelConfig {
  return LEVELS[Math.min(Math.max(level, 1), MAX_LEVEL) - 1];
}

/** pass the previous round's food id so the same food never repeats back-to-back */
export function nextRound(level: number, prevFoodId?: string): Round {
  const cfg = levelConfig(level);
  const food = pickFood(prevFoodId);

  switch (cfg.mode) {
    case "count": {
      return { mode: "count", food, target: randInt(cfg.min, cfg.max) };
    }
    case "mixedCount": {
      const target = randInt(cfg.min, cfg.max);
      const distractor = pickFood(food.id);
      const distractorCount = randInt(1, 3);
      return { mode: "mixedCount", food, target, distractor, distractorCount };
    }
    case "chooseGroup": {
      const target = randInt(cfg.min, cfg.max);
      const counts = new Set<number>([target]);
      let guard = 0;
      while (counts.size < 2 && guard++ < 20) {
        counts.add(randInt(cfg.min, cfg.max));
      }
      return { mode: "chooseGroup", food, target, groupCounts: shuffle([...counts]) };
    }
    case "addition": {
      const a = randInt(cfg.min, cfg.max);
      const b = randInt(cfg.min, cfg.max);
      return { mode: "addition", food, a, b, target: a + b };
    }
  }
}

export function promptFor(round: Round): string {
  switch (round.mode) {
    case "count":
    case "mixedCount":
      return `I'm hungry! Give me ${round.target} ${round.food.plural}!`;
    case "chooseGroup":
      return `Which one has ${round.target}?`;
    case "addition":
      return `${round.a} ${round.food.plural} plus ${round.b} ${round.food.plural}. How many altogether?`;
  }
}

export function successPhrase(round: Round): string {
  switch (round.mode) {
    case "count":
    case "mixedCount":
      return `Yummy! ${round.target} ${round.food.plural}!`;
    case "chooseGroup":
      return `Yes! ${round.target} ${round.food.plural}!`;
    case "addition":
      return `Yummy! ${round.a} plus ${round.b} is ${round.target}!`;
  }
}
