import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0b0d14",
        surface: {
          1: "#111420",
          2: "#181c2a",
          3: "#1e2334",
        },
        border: {
          1: "rgba(255,255,255,0.07)",
          2: "rgba(255,255,255,0.12)",
        },
        text: {
          primary: "#e8ebf5",
          muted: "#7a869a",
          faint: "#3d4455",
        },
        lime: {
          DEFAULT: "#d4ff5c",
          dim: "rgba(212,255,92,0.1)",
        },
        teal: {
          DEFAULT: "#2dd4bf",
          dim: "rgba(45,212,191,0.1)",
        },
        sky: {
          DEFAULT: "#60a5fa",
          dim: "rgba(96,165,250,0.1)",
        },
        rose: {
          DEFAULT: "#fb7185",
          dim: "rgba(251,113,133,0.1)",
        },
        amber: {
          DEFAULT: "#fbbf24",
          dim: "rgba(251,191,36,0.1)",
        },
        violet: {
          DEFAULT: "#a78bfa",
          dim: "rgba(167,139,250,0.1)",
        },
        green: {
          DEFAULT: "#4ade80",
          dim: "rgba(74,222,128,0.1)",
        },
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        ui: ["Plus Jakarta Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderColor: {
        DEFAULT: "rgba(255,255,255,0.07)",
      },
    },
  },
  plugins: [],
};

export default config;
