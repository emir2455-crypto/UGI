import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        base: {
          bg: "#121212",
          panel: "#1b1b1b",
          panel2: "#232323",
          border: "#2e2e2e",
        },
        amber: {
          DEFAULT: "#f59e0b",
          soft: "#fbbf2433",
        },
      },
    },
  },
  plugins: [],
};
export default config;
