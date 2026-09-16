import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core brand system, derived directly from the LeoTech Solution logo.
        navy: {
          950: "#00001f",
          900: "#000054", // logo primary (deep navy)
          800: "#050a3d",
          700: "#0c1552",
          600: "#141f66",
          500: "#1d2c80",
        },
        blue: {
          50: "#eef5ff",
          100: "#dbeafe",
          200: "#b3d4ff",
          300: "#7fb4ff",
          400: "#2e8cff", // light-logo accent
          500: "#1373e9", // logo primary blue
          600: "#0451ae", // logo secondary blue
          700: "#053e88",
          800: "#0a2f66",
          900: "#0a1f42",
        },
        ink: "#0a0e27",
        slate: {
          50: "#f5f7fb",
          100: "#e8ecf5",
          200: "#cfd7e8",
          300: "#a9b5d1",
          400: "#7887ac",
          500: "#57628a",
          600: "#414a6e",
          700: "#2f3656",
          800: "#1d2340",
          900: "#12162b",
        },
        border: {
          DEFAULT: "#e2e7f2",
          dark: "rgba(120, 150, 220, 0.16)",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        display: [
          "var(--font-space-grotesk)",
          "var(--font-inter)",
          "sans-serif",
        ],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "grid-light":
          "linear-gradient(to right, rgba(20,31,102,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(20,31,102,0.05) 1px, transparent 1px)",
        "grid-dark":
          "linear-gradient(to right, rgba(120,150,220,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(120,150,220,0.08) 1px, transparent 1px)",
        "glow-blue":
          "radial-gradient(circle at 50% 0%, rgba(19,115,233,0.25), transparent 60%)",
      },
      backgroundSize: {
        grid: "40px 40px",
        "grid-sm": "20px 20px",
      },
      boxShadow: {
        "glow-sm": "0 0 24px rgba(19,115,233,0.25)",
        "glow-md": "0 0 48px rgba(19,115,233,0.3)",
        card: "0 1px 2px rgba(10,14,39,0.04), 0 8px 24px rgba(10,14,39,0.06)",
      },
      clipPath: {
        "corner-tl": "polygon(0 0, 100% 0, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 20s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      transitionTimingFunction: {
        technical: "cubic-bezier(0.65, 0, 0.35, 1)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
