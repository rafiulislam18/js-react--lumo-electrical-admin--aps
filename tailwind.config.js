/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Command theme tokens (dark terminal aesthetic)
        bg: '#0a0b0d',
        bg2: '#0c0d10',
        panel: '#101216',
        panel2: '#181b21',
        line: '#23262d',
        body: '#e9ebef',
        dim: '#9aa0aa',
        mute: '#5f6670',
        accent: {
          DEFAULT: '#f6a821',
          ink: '#1a1205',
        },
        pos: '#5fcf80',
        neg: '#f0726f',
        warn: '#fbb845',
        info: '#6aa6f5',
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
