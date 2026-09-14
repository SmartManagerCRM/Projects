/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#0a1424",
          900: "#0e1b30",
          800: "#142542",
          700: "#1c3358",
          600: "#26436f",
        },
        gold: {
          400: "#e0bd6b",
          500: "#c9a227",
          600: "#a8841d",
        },
        ink: {
          900: "#1a1f2b",
          700: "#3a4152",
          500: "#69707f",
          300: "#a2a8b5",
          200: "#c7cbd4",
          100: "#e7e9ed",
          50: "#f7f8fa",
        },
      },
      fontFamily: {
        sans: ["Inter", "Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.06), 0 1px 3px rgba(16, 24, 40, 0.08)",
        panel: "0 4px 24px rgba(10, 20, 36, 0.08)",
      },
    },
  },
  plugins: [],
};
