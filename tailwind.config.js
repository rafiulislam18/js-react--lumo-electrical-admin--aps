/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Theme tokens driven by CSS variables (see index.css).
        // Light values live on :root, dark values under .dark — every
        // bg-panel / text-body / border-line usage flips automatically.
        // The `<alpha-value>` form keeps opacity modifiers (bg-accent/15,
        // border-accent/[.28], …) working in both themes.
        bg: 'rgb(var(--c-bg) / <alpha-value>)',
        bg2: 'rgb(var(--c-bg2) / <alpha-value>)',
        panel: 'rgb(var(--c-panel) / <alpha-value>)',
        panel2: 'rgb(var(--c-panel2) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
        line2: 'rgb(var(--c-line2) / <alpha-value>)', // hover/active border (was #3a3d44)
        body: 'rgb(var(--c-body) / <alpha-value>)',
        dim: 'rgb(var(--c-dim) / <alpha-value>)',
        mute: 'rgb(var(--c-mute) / <alpha-value>)',
        accent: {
          DEFAULT: 'rgb(var(--c-accent) / <alpha-value>)',
          ink: 'rgb(var(--c-accent-ink) / <alpha-value>)',
        },
        pos: 'rgb(var(--c-pos) / <alpha-value>)',
        neg: 'rgb(var(--c-neg) / <alpha-value>)',
        warn: 'rgb(var(--c-warn) / <alpha-value>)',
        info: 'rgb(var(--c-info) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '10px',
      },
      keyframes: {
        lumoFade: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        lumoPop: {
          from: { opacity: '0', transform: 'translateY(8px) scale(.99)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        fade: 'lumoFade .15s ease',
        pop: 'lumoPop .18s cubic-bezier(.2,.9,.3,1.2)',
      },
    },
  },
  plugins: [],
};
