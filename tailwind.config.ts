import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#050E22",
          900: "#07122B",
          800: "#0B1B3A",
          700: "#12274F",
          600: "#1B356B",
          100: "#E4E9F4",
          50: "#F4F6FB",
        },
        gold: {
          DEFAULT: "#C9A24B",
          light: "#E3C57D",
          dark: "#A8832F",
        },
      },
      fontFamily: { sans: ["var(--font-tajawal)", "system-ui", "sans-serif"] },
      keyframes: {
        glow: {
          "0%": { opacity: "0", transform: "scale(0.85)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: { glow: "glow 1.2s ease-out both" },
    },
  },
  plugins: [],
};
export default config;
