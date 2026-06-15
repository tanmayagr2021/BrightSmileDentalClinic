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
          DEFAULT: '#1A7A5E',
          dark: '#135F4A',
          light: '#22A07C',
        },
        gold: {
          DEFAULT: '#C5A059',
          dark: '#A8883C',
          light: '#D4B87A',
        },
        dark: '#0A1128',
        slate: '#1E293B',
        tint: '#F0F9FF',
        ivory: '#FAFAF8',
        teal: {
          DEFAULT: '#1A7A5E',
          light: '#22A07C',
          dark: '#135F4A',
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
        'premium': '0 24px 72px rgba(10, 17, 40, 0.22), 0 8px 24px rgba(10, 17, 40, 0.10)',
        'glow-primary': '0 0 40px rgba(26, 122, 94, 0.22)',
        'glow-gold': '0 0 40px rgba(197, 160, 89, 0.28)',
        'lift': '0 8px 32px rgba(0, 0, 0, 0.10), 0 2px 8px rgba(0, 0, 0, 0.06)',
        'button': '0 4px 16px rgba(26, 122, 94, 0.28), 0 1px 4px rgba(26, 122, 94, 0.14)',
        'button-gold': '0 4px 20px rgba(197, 160, 89, 0.35), 0 1px 4px rgba(197, 160, 89, 0.18)',
      },
    },
  },
  plugins: [],
}

export default config
