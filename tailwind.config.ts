import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        paper: 'var(--paper)',
        'paper-soft': 'var(--paper-soft)',
        surface: 'var(--surface)',
        ink: 'var(--ink)',
        'ink-soft': 'var(--ink-soft)',
        'ink-mute': 'var(--ink-mute)',
        rule: 'var(--rule)',
        'rule-soft': 'var(--rule-soft)',
        brand: 'var(--brand)',
        'brand-soft': 'var(--brand-soft)',
        'brand-tint': 'var(--brand-tint)',
        accent: 'var(--accent)',
        'accent-soft': 'var(--accent-soft)',
        ok: 'var(--ok)',
        'ok-bg': 'var(--ok-bg)',
        warn: 'var(--warn)',
        'warn-bg': 'var(--warn-bg)',
        bad: 'var(--bad)',
        'bad-bg': 'var(--bad-bg)',
      },
      letterSpacing: {
        editorial: '-0.022em',
        wide: '0.08em',
      },
    },
  },
  plugins: [],
};

export default config;
