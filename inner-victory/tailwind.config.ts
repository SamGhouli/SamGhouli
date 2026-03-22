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
        bg: "#f5f0e8",
        surface: {
          1: "#ede7da",
          2: "#e4dccf",
          3: "#d9d1c2",
        },
        border: {
          1: "rgba(0,0,0,0.08)",
          2: "rgba(0,0,0,0.14)",
        },
        text: {
          primary: "#1c1914",
          muted: "#6e6254",
          faint: "#a89a88",
        },
        lime: {
          DEFAULT: "#5a8200",
          dim: "rgba(90,130,0,0.12)",
        },
        teal: {
          DEFAULT: "#0d8a78",
          dim: "rgba(13,138,120,0.12)",
        },
        sky: {
          DEFAULT: "#1d6fd1",
          dim: "rgba(29,111,209,0.12)",
        },
        rose: {
          DEFAULT: "#d93b52",
          dim: "rgba(217,59,82,0.12)",
        },
        amber: {
          DEFAULT: "#b87d10",
          dim: "rgba(184,125,16,0.12)",
        },
        violet: {
          DEFAULT: "#6b3fcf",
          dim: "rgba(107,63,207,0.12)",
        },
        green: {
          DEFAULT: "#1a8a47",
          dim: "rgba(26,138,71,0.12)",
        },
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        ui: ["Plus Jakarta Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderColor: {
        DEFAULT: "rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
