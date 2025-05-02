/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        slide: "slide 25s linear infinite", // Slower speed for smoother transition
      },
      keyframes: {
        slide: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-100%)" }, // Ensure it slides fully off the screen
        },
      },
      // You can define custom spacing for the logos if needed
      spacing: {
        logo: "4rem", // Example logo height to ensure consistency
      },
    },
  },
  plugins: [],
};
