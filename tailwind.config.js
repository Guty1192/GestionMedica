/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        maternity: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        clinical: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        cyc: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc5fb',
          400: '#38a5f8',
          500: '#004299', // Primary Royal Blue from "CYC SALUD" in logo
          600: '#00337a', // Hover dark royal blue
          700: '#00275c',
          800: '#001c42',
          900: '#00132b',
          blue: '#004299', // Official CYC Blue
          'blue-hover': '#00337a',
          cyan: '#009fe3', // Medical Cyan / Celeste from "CONSULTORIO MEDICO"
          'cyan-hover': '#0284c7',
          'cyan-light': '#e0f2fe',
          magenta: '#e6007e', // Magenta/Pink from silhouette
          'magenta-light': '#fdf2f8',
          violet: '#7c3aed', // Purple from lotus petals
          'violet-light': '#f5f3ff',
          navy: '#00275c',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
        'glow-rose': '0 0 25px -5px rgba(244, 63, 94, 0.3)',
        'glow-teal': '0 0 25px -5px rgba(20, 184, 166, 0.3)',
      },
    },
  },
  plugins: [],
};
