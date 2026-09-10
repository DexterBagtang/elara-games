import type { Href } from "expo-router";

export type Game = {
  id: string;
  title: string;
  emoji: string;
  color: string; // tailwind bg class
  route: Href;
};

/** Add a new game here + create its screen in src/app/games/<id>.tsx */
export const GAMES: Game[] = [
  {
    id: "tap-the-shape",
    title: "Tap the Shape",
    emoji: "⭐️",
    color: "bg-sun",
    route: "/games/tap-the-shape",
  },
  {
    id: "coloring",
    title: "Coloring",
    emoji: "🎨",
    color: "bg-berry",
    route: "/games/coloring",
  },
];
