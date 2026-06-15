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
          DEFAULT: '#0EA5A4',
          dark: '#0d9488',
          light: '#14b8a6',
        },
        dark: '#0F172A',
        slate: '#1E293B',
        tint: '#F0F9FF',
        ivory: '#FAFAF8',
        teal: {
          DEFAULT: '#0EA5A4',
          light: '#14B8A6',
          dark: '#0d9488',
        },
        'clinic-text': '#111827',
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
        'glass-dark': '0 24px 64px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.07)',
        'card': '0 1px 12px rgba(0, 0, 0, 0.05), 0 2px 6px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 16px 48px rgba(0, 0, 0, 0.10), 0 4px 12px rgba(0, 0, 0, 0.05)',
        'premium': '0 24px 72px rgba(15, 23, 42, 0.18), 0 8px 24px rgba(15, 23, 42, 0.08)',
        'glow-primary': '0 0 40px rgba(14, 165, 164, 0.22)',
        'lift': '0 8px 32px rgba(0, 0, 0, 0.10), 0 2px 8px rgba(0, 0, 0, 0.06)',
        'button': '0 4px 16px rgba(14, 165, 164, 0.28), 0 1px 4px rgba(14, 165, 164, 0.14)',
      },
    },
  },
  plugins: [],
}

export default config
