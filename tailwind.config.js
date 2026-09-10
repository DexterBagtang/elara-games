const { theme } = require("./src/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: theme.color.bg,
        surface: theme.color.surface,
        ink: theme.color.ink,
        "ink-soft": theme.color.inkSoft,
        grape: theme.color.grape,
        sky: theme.color.sky,
        grass: theme.color.grass,
        sun: theme.color.sun,
        berry: theme.color.berry,
        tangerine: theme.color.tangerine,
      },
      fontFamily: {
        light: [theme.font.light],
        DEFAULT: [theme.font.regular],
        sans: [theme.font.regular],
        medium: [theme.font.medium],
        semibold: [theme.font.semibold],
        bold: [theme.font.bold],
      },
      borderRadius: {
        md: `${theme.radius.md}px`,
        lg: `${theme.radius.lg}px`,
        xl: `${theme.radius.xl}px`,
      },
      boxShadow: {
        card: theme.shadow.card,
        raised: theme.shadow.raised,
      },
    },
  },
  plugins: [],
};
