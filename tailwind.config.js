/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0A0A0B',
        graphite: '#141416',
        clay: '#1E1E22',
        'clay-light': '#2A2A30',
        wire: '#3A3A42',
        ash: '#86868B',
        bone: '#EDEDEA',
        caution: '#FFD400',
        hazard: '#FFD400',
        'caution-muted': '#D4AF00',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        grotesk: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
        /** Phosphor screen text: boot lines, terminal, logs. Drawn large for crispness. */
        screen: ['"VT323"', '"IBM Plex Mono"', 'monospace'],
        /** Handwritten floppy labels & sticky notes (canvas + DOM). */
        hand: ['"Caveat"', 'cursive'],
        stencil: ['"Big Shoulders Stencil Text"', '"Space Grotesk"', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.02em',
        code: '0.08em',
        hud: '0.18em',
        wide: '0.25em',
      },
      transitionTimingFunction: {
        snap: 'cubic-bezier(0.16, 1, 0.3, 1)',
        overshoot: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      screens: {
        xs: '420px',
      },
    },
  },
  plugins: [],
}
