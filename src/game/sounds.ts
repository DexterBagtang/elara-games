/**
 * Tiny sound-effect layer over expo-audio.
 *
 * pop/tap/win.wav are synthesized by `npm run gen:sounds`
 * (scripts/generate-sounds.mjs) — original tones, no licensing. win-cheer.mp3
 * is the one exception: a real "Happy crowd cheer" clip from Mixkit
 * (mixkit.co/free-sound-effects/happy/, id 975), free for commercial use
 * under the Mixkit Free Sound Effects License, no attribution required —
 * see https://mixkit.co/license/ for the current terms. It's ~8s long in
 * full; MAX_MS below cuts it short so it doesn't bleed into the next round.
 *
 * One persistent player per effect, created once at app start; `playSound`
 * restarts it from 0 so rapid taps re-trigger.
 */
import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
} from "expo-audio";

const SOURCES = {
  pop: require("../../assets/sounds/pop.wav"),
  tap: require("../../assets/sounds/tap.wav"),
  win: require("../../assets/sounds/win-cheer.mp3"),
} as const;

export type SoundName = keyof typeof SOURCES;

// sounds not listed here just play to their natural end
const MAX_MS: Partial<Record<SoundName, number>> = {
  win: 1800,
};

let players: Record<SoundName, AudioPlayer> | null = null;
let stopTimers: Partial<Record<SoundName, ReturnType<typeof setTimeout>>> = {};
let enabled = true;

/** call once from the root layout */
export function initSounds() {
  setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  if (players) return;
  const entries = Object.entries(SOURCES).map(([name, src]) => [
    name,
    createAudioPlayer(src),
  ]);
  players = Object.fromEntries(entries) as Record<SoundName, AudioPlayer>;
}

export function playSound(name: SoundName) {
  if (!enabled || !players) return;
  const player = players[name];
  try {
    if (stopTimers[name]) clearTimeout(stopTimers[name]);
    player.seekTo(0);
    player.play();
    const maxMs = MAX_MS[name];
    if (maxMs) {
      stopTimers[name] = setTimeout(() => {
        try {
          player.pause();
          player.seekTo(0);
        } catch {
          // already gone — ignore
        }
      }, maxMs);
    }
  } catch {
    // player not ready yet — ignore
  }
}

export function setSoundEnabled(value: boolean) {
  enabled = value;
}

export function isSoundEnabled() {
  return enabled;
}
