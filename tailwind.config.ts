import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class', // Important for dark mode toggle
  theme: {
    extend: {
      colors: {
        // Main theme colors - use CSS variables
        primary: {
          light: 'var(--color-primary-light)',
          DEFAULT: 'var(--color-primary)',
          dark: 'var(--color-primary-dark)',
        },
        secondary: {
          light: 'var(--color-secondary-light)',
          DEFAULT: 'var(--color-secondary)',
          dark: 'var(--color-secondary-dark)',
        },
        background: {
          light: 'var(--color-background-light)',
          DEFAULT: 'var(--color-background)',
          dark: 'var(--color-background-dark)',
        },
        text_new: {
          light: 'var(--color-text-light)',
          DEFAULT: 'var(--color-text)',
          dark: 'var(--color-text-dark)',
        },
        card: {
          light: 'var(--color-card-light)',
          medium: 'var(--color-card-medium)',
          dark: 'var(--color-card-dark)',
        },

        unfilled: {
          DEFAULT: 'var(--color-unfilled)'
        },

        'error-text': 'var(--color-error-text)',

        success: {
          light: 'var(--color-success-light)',
          DEFAULT: 'var(--color-success)',
          dark: 'var(--color-success-dark)',
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
        beige: {
          light: "#FFFAEC",
          medium: "#F5ECD5",
        },
        text: {
          gray_unfilled: "#8C8C8C",
          teal: "#00897B",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;