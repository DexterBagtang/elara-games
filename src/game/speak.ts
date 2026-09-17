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

// matches the bounds on the settings page's sliders — if a persisted value
// ever ends up outside these (corrupted storage, a bad restore) we clamp
// back into range instead of handing the TTS engine something it might
// reject outright and go silent on.
const DEFAULTS: SpeechOverride = { voice: undefined, rate: 0.96, pitch: 1.35 };
const RATE_RANGE = { min: 0.5, max: 1.5 };
const PITCH_RANGE = { min: 0.8, max: 1.8 };

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

let override: SpeechOverride = DEFAULTS;

/** set from the settings page; persisted copy lives in settings.ts */
export function setSpeechOverride(next: SpeechOverride) {
  override = next;
}

// name / identifier fragments for common female English voices across
// iOS, Android (Google TTS) and web SpeechSynthesis
const FEMALE =
  /female|samantha|karen|moira|tessa|fiona|serena|allison|\bava\b|susan|\bzoe\b|nicky|victoria|catherine|martha|\bkate\b|\bemma\b|-tpf-|#female|-sfg-|-iob-|zira|jenny|aria|libby|sonia|clara/i;

let autoVoice: string | undefined;
let knownVoiceIds: Set<string> | null = null; // null = not fetched yet, so we can't validate
let pickStarted = false;

async function pickVoice() {
  if (pickStarted) return;
  pickStarted = true;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    knownVoiceIds = new Set(voices.map((v) => v.identifier));
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

// bumped on every speak()/stopSpeaking() call. An utterance's onError only
// retries if it's still the *current* one — otherwise Speech.stop() cutting
// it off for the next line (a normal, expected interruption) reads as a
// failure and replays the old line on top of the new one.
let gen = 0;

export function speak(text: string) {
  if (!isSoundEnabled()) return;
  void pickVoice();

  const seq = ++gen;

  // a voice id survives an OS update, a restore onto a different device, or
  // hand-edited storage poorly — drop it once we know the device's real
  // voice list and it isn't in there, rather than handing the engine a
  // dangling identifier and going silent.
  const voice =
    override.voice && (knownVoiceIds === null || knownVoiceIds.has(override.voice))
      ? override.voice
      : autoVoice;
  const rate = Number.isFinite(override.rate)
    ? clamp(override.rate, RATE_RANGE.min, RATE_RANGE.max)
    : DEFAULTS.rate;
  const pitch = Number.isFinite(override.pitch)
    ? clamp(override.pitch, PITCH_RANGE.min, PITCH_RANGE.max)
    : DEFAULTS.pitch;

  try {
    Speech.stop(); // cut off any in-flight phrase so prompts don't pile up
    Speech.speak(text, {
      rate,
      pitch,
      voice,
      onError: () => {
        if (seq !== gen) return; // superseded by a newer speak()/stop() — just an interruption
        // the configured voice/rate/pitch broke the engine on this device —
        // retry once with the untouched defaults so play never goes silent
        if (voice === undefined && rate === DEFAULTS.rate && pitch === DEFAULTS.pitch) return;
        try {
          Speech.speak(text, { rate: DEFAULTS.rate, pitch: DEFAULTS.pitch });
        } catch {
          // truly unavailable — silent is fine
        }
      },
    });
  } catch {
    // TTS engine not ready / unavailable — silent is fine
  }
}

export function stopSpeaking() {
  gen++; // any in-flight utterance's onError is now stale — don't let it retry
  try {
    Speech.stop();
  } catch {
    // ignore
  }
}
