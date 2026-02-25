/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./templates/**/*.html"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cochid: {
          electric: "#2d7aff",
          "electric-hover": "#1a6aef",
          cyan: "#00d4aa",
          "cyan-hover": "#00b894",
          amber: "#f59e0b",
          navy: "#0a0f1e",
          "navy-light": "#111827",
          surface: "#151c2c",
          "surface-light": "#1e2740",
          "surface-border": "rgba(45,122,255,0.15)",
          glow: "rgba(45,122,255,0.08)",
          "glow-cyan": "rgba(0,212,170,0.08)",
        },
        light: {
          bg: "#f8fafc",
          surface: "#ffffff",
          "surface-alt": "#f1f5f9",
          ink: "#0f172a",
          muted: "#64748b",
          line: "#e2e8f0",
        },
      },
      fontFamily: {
        display: ["Outfit", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
