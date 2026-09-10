/**
 * Single source of truth for design tokens.
 *
 * Plain JS (not .ts) so both `tailwind.config.js` (require) and the app
 * (import, typed via theme.d.ts) read the same values. Change a token here
 * and it flows to every `className` and every inline style.
 */
const color = {
  bg: "#FFF9F0", // warm cream page background
  surface: "#FFFFFF",
  ink: "#3D3A54", // primary text / SVG outlines (soft near-black)
  inkSoft: "#8B8AA0", // secondary text
  // playful accent family — bright, high-contrast on white
  grape: "#7C4DBC",
  sky: "#3F9BD6",
  grass: "#4FB477",
  sun: "#F5A623",
  berry: "#EC5F9E",
  tangerine: "#FF7A45",
  onAccent: "#FFFFFF", // text on an accent surface
};

const font = {
  light: "Fredoka_300Light",
  regular: "Fredoka_400Regular",
  medium: "Fredoka_500Medium",
  semibold: "Fredoka_600SemiBold",
  bold: "Fredoka_700Bold",
};

const motion = {
  press: 120, // press feedback
  base: 240, // enter / exit
  slow: 420, // large surfaces
  breathe: 2600, // idle "tap me" loop
};

const radius = { md: 16, lg: 24, xl: 32, full: 9999 };

const shadow = {
  card: "0px 4px 10px rgba(61, 58, 84, 0.10)",
  raised: "0px 10px 24px rgba(61, 58, 84, 0.16)",
};

module.exports = { theme: { color, font, motion, radius, shadow } };
