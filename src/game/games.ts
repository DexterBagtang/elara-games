import type { Href } from "expo-router";

import { theme } from "@/theme";

export type Game = {
  id: string;
  title: string;
  emoji: string;
  color: string; // card background (hex from the design tokens)
  route: Href;
};

/** Add a new game here + create its screen in src/app/games/<id>.tsx */
export const GAMES: Game[] = [
  {
    id: "tap-the-shape",
    title: "Tap the Shape",
    emoji: "⭐️",
    color: theme.color.sun,
    route: "/games/tap-the-shape",
  },
  {
    id: "coloring",
    title: "Coloring",
    emoji: "🎨",
    color: theme.color.berry,
    route: "/games/coloring",
  },
  {
    id: "animal-sounds",
    title: "Animal Sounds",
    emoji: "🐾",
    color: theme.color.grass,
    route: "/games/animal-sounds",
  },
  {
    id: "sort-by-color",
    title: "Sort by Color",
    emoji: "🌈",
    color: theme.color.sky,
    route: "/games/sort-by-color",
  },
  {
    id: "feed-monster",
    title: "Feed the Monster",
    emoji: "👾",
    color: theme.color.tangerine,
    route: "/games/feed-monster",
  },
];
