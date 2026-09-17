/**
 * Text-to-speech, wrapped so it obeys the same mute toggle as the sound
 * effects (the 🔊 button on the home screen).
 *
 * Default is a bright, happy woman's voice: on first use we scan the
 * device's installed voices for a female English one and use it, with a
 * lifted pitch + near-normal rate to keep it cheerful and child-directed.
 * A parent can override voice/rate/pitch from the settings page — see
 * `setSpeechOverride`.
 */
import * as Speech from "expo-speech";

import { isSoundEnabled } from "./sounds";

export type SpeechOverride = {
  voice?: string;
  rate: number;
  pitch: number;
};

let override: SpeechOverride = { voice: undefined, rate: 0.96, pitch: 1.35 };

/** set from the settings page; persisted copy lives in settings.ts */
export function setSpeechOverride(next: SpeechOverride) {
  override = next;
}

// name / identifier fragments for common female English voices across
// iOS, Android (Google TTS) and web SpeechSynthesis
const FEMALE =
  /female|samantha|karen|moira|tessa|fiona|serena|allison|\bava\b|susan|\bzoe\b|nicky|victoria|catherine|martha|\bkate\b|\bemma\b|-tpf-|#female|-sfg-|-iob-|zira|jenny|aria|libby|sonia|clara/i;

let autoVoice: string | undefined;
let pickStarted = false;

async function pickVoice() {
  if (pickStarted) return;
  pickStarted = true;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const en = voices.filter((v) =>
      v.language?.toLowerCase().startsWith("en"),
    );
    const match =
      en.find((v) => FEMALE.test(`${v.name ?? ""} ${v.identifier}`)) ??
      voices.find((v) => FEMALE.test(`${v.name ?? ""} ${v.identifier}`));
    if (match) autoVoice = match.identifier;
  } catch {
    // no voice list available — the pitched default is fine
  }
}

/** English voices for the settings page's voice picker */
export async function listEnglishVoices(): Promise<Speech.Voice[]> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    return voices.filter((v) => v.language?.toLowerCase().startsWith("en"));
  } catch {
    return [];
  }
}

export function speak(text: string) {
  if (!isSoundEnabled()) return;
  void pickVoice();
  try {
    Speech.stop(); // cut off any in-flight phrase so prompts don't pile up
    Speech.speak(text, {
      rate: override.rate,
      pitch: override.pitch,
      voice: override.voice ?? autoVoice,
    });
  } catch {
    // TTS engine not ready / unavailable — silent is fine
  }
}

export function stopSpeaking() {
  try {
    Speech.stop();
  } catch {
    // ignore
  }
}
