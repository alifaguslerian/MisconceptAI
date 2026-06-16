/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg:        "#0A0C10",
        surface:   "#111318",
        surface2:  "#1C1F2A",
        border:    "#2A2D3A",
        accent:    "#4F7FFF",
        "accent-dim": "#1E2D5A",
        correct:   "#22C55E",
        partial:   "#F59E0B",
        incorrect: "#EF4444",
        missing:   "#6B7280",
      },
      fontFamily: {
        sora:  ["Sora", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        mono:  ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
}