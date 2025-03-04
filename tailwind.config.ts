import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          light: "#faf3eb",
          medium: "#e6d8c3",
          dark: "#d2be9c",
        },
        teal: {
          DEFAULT: "#2A9D8F",
          button_hover: '#238377',
          text: '#00897B',
        },
        gray: {
          light: "#8C8C8C",
          DEFAULT: "#4A4A4A",
          dark: "#2C2C2C",
        },
      },

    },
  },
  plugins: [],
} satisfies Config;
