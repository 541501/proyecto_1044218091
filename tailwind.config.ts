import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        playfair: 'var(--font-playfair)',
        poppins: 'var(--font-poppins)',
      },
      colors: {
        dark: {
          50: '#f6f6f6',
          100: '#e7e7e7',
          900: '#0f0f0f',
          950: '#050505',
        },
        gradient: {
          cyan: '#06b6d4',
          purple: '#a855f7',
          pink: '#ec4899',
        },
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)',
        'gradient-accent': 'linear-gradient(90deg, #06b6d4, #a855f7, #ec4899)',
      },
    },
  },
  plugins: [],
}
export default config
