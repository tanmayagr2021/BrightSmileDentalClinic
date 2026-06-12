import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4A9B6F',
          dark: '#3d8560',
          light: '#5db583',
        },
        dark: '#1A3D2B',
        tint: '#F0F7F2',
        ivory: '#FAFAF7',
        teal: {
          DEFAULT: '#0D9488',
          light: '#14B8A6',
          dark: '#0F766E',
        },
        'emerald-rich': {
          DEFAULT: '#065F46',
          dark: '#0A2318',
        },
        'clinic-text': '#1C1C1E',
      },
      fontFamily: {
        display: ['var(--font-dm-serif)', 'Georgia', 'serif'],
        heading: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'counter': 'counter 2s ease-out forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      boxShadow: {
        'glass': '0 4px 24px rgba(0, 0, 0, 0.08)',
        'card': '0 2px 16px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 12px 40px rgba(0, 0, 0, 0.14)',
        'premium': '0 20px 60px rgba(26, 61, 43, 0.15)',
        'glow-primary': '0 0 40px rgba(74, 155, 111, 0.25)',
      },
    },
  },
  plugins: [],
}

export default config
