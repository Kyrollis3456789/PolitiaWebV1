import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-bg': 'var(--color-bg)',
        'brand-card': 'var(--color-card)',
        'brand-text': 'var(--color-text)',
        'brand-button': 'var(--color-button)',
        'brand-accent': 'var(--color-accent)',
        'brand-navy': 'var(--color-text)',
        'brand-blue': 'var(--color-button)',
        'brand-gold': 'var(--color-accent)',
        'brand-white': 'var(--color-card)',
      },
    },
  },
  plugins: [],
};

export default config;
