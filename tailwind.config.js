export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "brand-pink": "#AF4657",
        "brand-pink-hover": "#963B4A",
        "brand-reddish": "#AF4657",
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        serif: ["Playfair Display", "serif"],
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        pop: {
          "0%,100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.08)" },
        },
      },
      animation: { "fade-in": "fade-in .2s ease-out", pop: "pop .2s ease-out" },
    },
  },
  plugins: [],
};
