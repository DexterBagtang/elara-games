/**
 * Text-to-speech, wrapped so it obeys the same mute toggle as the sound
 * effects (the 🔊 button on the home screen).
 *
 * A slightly slow rate + high pitch reads as friendly / child-directed.
 */
import * as Speech from "expo-speech";

import { isSoundEnabled } from "./sounds";

const OPTIONS: Speech.SpeechOptions = {
  rate: 0.85,
  pitch: 1.25,
};

export function speak(text: string) {
  if (!isSoundEnabled()) return;
  try {
    Speech.stop(); // cut off any in-flight phrase so prompts don't pile up
    Speech.speak(text, OPTIONS);
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
