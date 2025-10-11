
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#137fec",
        "background-light": "#f6f7f8",
        "background-dark": "#101922",
        "content-light": "#111418",
        "content-dark": "#f6f7f8",
        "subtle-light": "#617589",
        "subtle-dark": "#a0b3c6",
        "border-light": "#dbe0e6",
        "border-dark": "#303e4c"
      },
      fontFamily: {
        "display": ["Manrope", "sans-serif"],
        "inter": ["Inter", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "0.75rem",
        "xl": "1rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
};
