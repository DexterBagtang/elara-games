/**
 * Animals for the "Animal Sounds" game.
 *
 * `says` is fed straight to text-to-speech, so keep it spelled the way it
 * should *sound* ("Baa baa", not "Bleat"). `name` is spoken back on a
 * correct answer as gentle language reinforcement.
 */
export type Animal = {
  id: string;
  emoji: string;
  name: string;
  says: string;
};

export const ANIMALS: Animal[] = [
  { id: "cow", emoji: "🐮", name: "Cow", says: "Moo" },
  { id: "dog", emoji: "🐶", name: "Dog", says: "Woof woof" },
  { id: "cat", emoji: "🐱", name: "Cat", says: "Meow" },
  { id: "pig", emoji: "🐷", name: "Pig", says: "Oink oink" },
  { id: "duck", emoji: "🦆", name: "Duck", says: "Quack quack" },
  { id: "frog", emoji: "🐸", name: "Frog", says: "Ribbit" },
  { id: "sheep", emoji: "🐑", name: "Sheep", says: "Baa baa" },
  { id: "lion", emoji: "🦁", name: "Lion", says: "Roar" },
  { id: "horse", emoji: "🐴", name: "Horse", says: "Neigh" },
  { id: "rooster", emoji: "🐔", name: "Rooster", says: "Cock a doodle doo" },
];

/** animals shown per round — 3 is the toddler sweet spot */
export const CHOICES = 3;

export type Round = {
  target: Animal;
  /** `target` plus (CHOICES - 1) distractors, shuffled */
  options: Animal[];
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
 * Build the next round. Pass the previous target's id so the same animal is
 * never asked twice in a row (feels broken to a toddler).
 */
export function nextRound(prevTargetId?: string): Round {
  const pool = prevTargetId
    ? ANIMALS.filter((a) => a.id !== prevTargetId)
    : ANIMALS;
  const target = pool[Math.floor(Math.random() * pool.length)];
  const distractors = shuffle(
    ANIMALS.filter((a) => a.id !== target.id)
  ).slice(0, CHOICES - 1);
  return { target, options: shuffle([target, ...distractors]) };
}
