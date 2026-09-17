/**
 * Persisted parent settings: sound on/off, which games show on the home
 * screen, and speech voice/rate/pitch. Loaded once at app start
 * (`initSettings`, called from the root layout) and kept in memory after
 * that; every setter writes back to AsyncStorage so choices survive an app
 * restart.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";

import { GAMES } from "./games";
import { setSpeechOverride, type SpeechOverride } from "./speak";
import { setSoundEnabled } from "./sounds";

const STORAGE_KEY = "elara:settings:v1";

export type Settings = {
  soundEnabled: boolean;
  enabledGameIds: string[];
  speech: SpeechOverride;
};

const DEFAULTS: Settings = {
  soundEnabled: true,
  enabledGameIds: GAMES.map((g) => g.id),
  speech: { voice: undefined, rate: 0.96, pitch: 1.35 },
};

let current: Settings = DEFAULTS;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

function persist() {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(current)).catch(() => {});
}

/** call once from the root layout */
export async function initSettings() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<Settings>;
      current = {
        ...DEFAULTS,
        ...saved,
        speech: { ...DEFAULTS.speech, ...saved.speech },
      };
    }
  } catch {
    // no saved settings yet, or storage unavailable — defaults are fine
  }
  setSoundEnabled(current.soundEnabled);
  setSpeechOverride(current.speech);
  notify();
}

export function getSettings(): Settings {
  return current;
}

export function subscribeSettings(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** re-renders whenever a setting changes */
export function useSettings() {
  return useSyncExternalStore(subscribeSettings, getSettings);
}

function update(patch: Partial<Settings>) {
  current = { ...current, ...patch };
  notify();
  persist();
}

export function setSoundSetting(value: boolean) {
  setSoundEnabled(value);
  update({ soundEnabled: value });
}

/** at least one game always stays enabled — no empty home screen */
export function setGameEnabled(id: string, value: boolean) {
  const next = new Set(current.enabledGameIds);
  if (value) next.add(id);
  else next.delete(id);
  if (next.size === 0) return;
  update({ enabledGameIds: [...next] });
}

export function setSpeechSetting(patch: Partial<SpeechOverride>) {
  const speech = { ...current.speech, ...patch };
  setSpeechOverride(speech);
  update({ speech });
}
