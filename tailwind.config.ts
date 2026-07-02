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
        // Champagne Gold — primary CTA/accent (previously emerald green;
        // green is now reserved exclusively for verification/trust/status).
        primary: {
          DEFAULT: '#C9A24B',
          dark: '#A8823A',
          light: '#E7D3A1',
        },
        gold: {
          DEFAULT: '#C9A24B',
          dark: '#A8823A',
          light: '#E7D3A1',
        },
        // Deep Emerald — verification/trust/status only (NMC badges, "Active",
        // "Verified Patient"). Not a general brand accent.
        teal: {
          DEFAULT: '#0C3C2D',
          light: '#155840',
          dark: '#082A1F',
        },
        dark: '#0E1B2E',
        deep: '#070F1C',
        slate: '#1E293B',
        tint: '#FAF6EC',
        ivory: '#F5EFE4',
        cream: '#E9E2D3',
        'cream-muted': '#C9BFAE',
        'clinic-text': '#14202E',
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
        'breathe': 'breathe 3s ease-in-out infinite',
        'breathe-glow': 'breatheGlow 3s ease-in-out infinite',
        'dots': 'dots 1.1s ease-in-out infinite',
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
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.08)' },
        },
        breatheGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '0', transform: 'scale(1.55)' },
        },
        dots: {
          '0%, 80%, 100%': { opacity: '0.3', transform: 'translateY(0)' },
          '40%': { opacity: '1', transform: 'translateY(-3px)' },
        },
      },
      boxShadow: {
        'glass': '0 4px 24px rgba(0, 0, 0, 0.08)',
        'glass-dark': '0 24px 64px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.07)',
        'card': '0 1px 12px rgba(0, 0, 0, 0.05), 0 2px 6px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 16px 48px rgba(0, 0, 0, 0.10), 0 4px 12px rgba(0, 0, 0, 0.05)',
        'premium': '0 24px 72px rgba(14, 27, 46, 0.22), 0 8px 24px rgba(14, 27, 46, 0.10)',
        'glow-primary': '0 0 40px rgba(201, 162, 75, 0.22)',
        'glow-gold': '0 0 40px rgba(201, 162, 75, 0.28)',
        'lift': '0 8px 32px rgba(0, 0, 0, 0.10), 0 2px 8px rgba(0, 0, 0, 0.06)',
        'button': '0 4px 16px rgba(201, 162, 75, 0.28), 0 1px 4px rgba(201, 162, 75, 0.14)',
        'button-gold': '0 4px 20px rgba(201, 162, 75, 0.35), 0 1px 4px rgba(201, 162, 75, 0.18)',
      },
    },
  },
  plugins: [],
}

export default config
