import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#0A1C3A",
          700: "#17386B"
        },
        sky: {
          100: "#EAF2FF",
          200: "#D7E7FF",
          500: "#2E63C8"
        },
        ambersoft: {
          100: "#FFF5E5",
          600: "#B66A00"
        }
      },
      boxShadow: {
        card: "0 6px 18px rgba(10, 28, 58, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
