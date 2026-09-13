/**
 * Real animal-sound clips for the "Animal Sounds" game.
 *
 * Effects live in assets/sounds/animals/*.wav — short, trimmed, loudness-
 * normalized clips sourced from Wikimedia Commons / Xeno-canto (CC0, CC-BY,
 * CC-BY-SA, or public domain; see assets/sounds/animals/CREDITS.md).
 * One persistent player per animal, created once at app start;
 * `playAnimalSound` restarts it from 0 so re-tapping the speaker replays it.
 */
import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
} from "expo-audio";

import type { Animal } from "@/game/animals";

const SOURCES = {
  cow: require("../../assets/sounds/animals/cow.wav"),
  dog: require("../../assets/sounds/animals/dog.wav"),
  cat: require("../../assets/sounds/animals/cat.wav"),
  pig: require("../../assets/sounds/animals/pig.wav"),
  duck: require("../../assets/sounds/animals/duck.wav"),
  frog: require("../../assets/sounds/animals/frog.wav"),
  sheep: require("../../assets/sounds/animals/sheep.wav"),
  lion: require("../../assets/sounds/animals/lion.wav"),
  horse: require("../../assets/sounds/animals/horse.wav"),
  rooster: require("../../assets/sounds/animals/rooster.wav"),
} as const satisfies Record<Animal["id"], number>;

let players: Record<string, AudioPlayer> | null = null;

/** call once from the root layout */
export function initAnimalSounds() {
  setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  if (players) return;
  const entries = Object.entries(SOURCES).map(([id, src]) => [
    id,
    createAudioPlayer(src),
  ]);
  players = Object.fromEntries(entries);
}

export function playAnimalSound(id: string) {
  const player = players?.[id];
  if (!player) return;
  try {
    player.seekTo(0);
    player.play();
  } catch {
    // player not ready yet — ignore
  }
}

export function stopAnimalSound(id: string) {
  const player = players?.[id];
  if (!player) return;
  try {
    player.pause();
  } catch {
    // ignore
  }
}
