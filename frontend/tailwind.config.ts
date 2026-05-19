import type { Config } from "tailwindcss";

const config: Config = {
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
        pitch: {
          FF: "#3b82f6",
          SL: "#ef4444",
          CH: "#22c55e",
          CU: "#a855f7",
          SI: "#06b6d4",
          FC: "#f97316",
          FS: "#ec4899",
        },
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

export default config;
