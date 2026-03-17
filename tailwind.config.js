/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        body: ['"Source Serif 4"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        helix: {
          bg: '#0a0a0f',
          surface: '#12121a',
          card: '#1a1a25',
          border: '#2a2a3a',
          muted: '#6b6b80',
          text: '#e8e8f0',
          accent: '#7c5bf5',
          warm: '#f5a623',
          rhythm: '#3ecf8e',
          emotion: '#f43f5e',
          vocab: '#38bdf8',
          structure: '#c084fc',
        },
      },
    },
  },
  plugins: [],
};
