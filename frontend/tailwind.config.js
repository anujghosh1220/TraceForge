export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#e6e9f2",
          subtle: "#94a3b8",
          muted: "#64748b",
          dim: "#475569",
        },
        surface: {
          base: "#101828",
          hover: "#16213e",
        },
        border: {
          base: "#1f2a44",
          strong: "#334155",
        },
        accent: {
          violet: "#8b5cf6",
          blue: "#3b82f6",
        },
      },
      borderRadius: {
        md: "8px",
        lg: "12px",
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
}
