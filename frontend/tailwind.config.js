/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:       "#0a0c0f",
        surface:  "#111418",
        surface2: "#171b21",
        surface3: "#1e232b",
        border:   "#252b35",
        accent:   "#00d4ff",
        text:     "#e8eaed",
        text2:    "#8b95a3",
        text3:    "#545f6e",
        green:    "#22c55e",
        red:      "#ef4444",
      },
      fontFamily: {
        mono: ["IBM Plex Mono", "monospace"],
        sans: ["IBM Plex Sans", "sans-serif"],
        logo: ["Bebas Neue", "cursive"],
      },
    },
  },
  plugins: [],
};
