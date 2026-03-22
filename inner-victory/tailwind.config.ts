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
        bg: "#0F1117",
        surface: {
          1: "#1A1D27",
          2: "#252836",
          3: "#2d3144",
        },
        border: {
          1: "rgba(255,255,255,0.07)",
          2: "rgba(255,255,255,0.12)",
        },
        text: {
          primary: "#F0F0F0",
          muted: "#8B8FA8",
          faint: "#4a4d62",
        },
        // Primary brand accent — deep sport green
        lime: {
          DEFAULT: "#3DB87F",
          dim: "rgba(45,156,110,0.14)",
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
