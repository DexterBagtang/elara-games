/**
 * Synthesizes the game's sound effects to assets/sounds/*.wav
 * (16-bit mono PCM, no dependencies). Original tones — no licensing.
 *
 * Run: npm run gen:sounds
 * Tweak: edit the SOUNDS definitions below, re-run.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "assets",
  "sounds"
);
const RATE = 44100;

const clamp = (v) => Math.max(-1, Math.min(1, v));

/** one sine partial with an exponential decay envelope */
function tone(buf, { start = 0, dur, freq, freqEnd, vol = 0.3, decay = 6, attack = 0.005 }) {
  const n0 = Math.floor(start * RATE);
  const n = Math.floor(dur * RATE);
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const f = freqEnd ? freq + (freqEnd - freq) * (i / n) : freq;
    const env =
      Math.min(1, t / attack) * Math.exp(-decay * t) * vol;
    const idx = n0 + i;
    if (idx < buf.length) buf[idx] = clamp(buf[idx] + Math.sin(2 * Math.PI * f * t) * env);
  }
}

function render(seconds, build) {
  const buf = new Float32Array(Math.ceil(seconds * RATE));
  build(buf);
  return buf;
}

const SOUNDS = {
  // tap a shape / fill a region — quick rising blip
  pop: render(0.22, (b) => {
    tone(b, { dur: 0.14, freq: 420, freqEnd: 880, vol: 0.32, decay: 22 });
    tone(b, { dur: 0.14, freq: 840, freqEnd: 1760, vol: 0.12, decay: 26 });
  }),

  // pick a color / menu press — soft short click
  tap: render(0.1, (b) => {
    tone(b, { dur: 0.07, freq: 1100, vol: 0.22, decay: 45, attack: 0.002 });
  }),

  // finished the picture — little C-major arpeggio + sparkle
  win: render(1.3, (b) => {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((f, i) => {
      tone(b, { start: i * 0.13, dur: 0.9, freq: f, vol: 0.26, decay: 4 });
      tone(b, { start: i * 0.13, dur: 0.5, freq: f * 2, vol: 0.08, decay: 8 });
    });
    // sparkle tail
    tone(b, { start: 0.55, dur: 0.7, freq: 2093, vol: 0.06, decay: 5 });
  }),
};

mkdirSync(OUT_DIR, { recursive: true });

function writeWav(name, samples) {
  const data = Buffer.alloc(samples.length * 2);
  for (let i = 0; i < samples.length; i++) {
    data.writeInt16LE((clamp(samples[i]) * 32767) | 0, i * 2);
  }
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(RATE, 24);
  header.writeUInt32LE(RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(data.length, 40);
  const path = join(OUT_DIR, `${name}.wav`);
  writeFileSync(path, Buffer.concat([header, data]));
  console.log(`  ${name}.wav  ${(header.length + data.length) / 1024 | 0}KB`);
}

for (const [name, samples] of Object.entries(SOUNDS)) writeWav(name, samples);
console.log(`wrote ${Object.keys(SOUNDS).length} sounds to ${OUT_DIR}`);
