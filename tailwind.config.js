/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // toddler-friendly high-contrast palette
        sky: "#4FC3F7",
        grass: "#81C784",
        sun: "#FFD54F",
        berry: "#F06292",
        grape: "#BA68C8",
      },
    },
  },
  plugins: [],
};
