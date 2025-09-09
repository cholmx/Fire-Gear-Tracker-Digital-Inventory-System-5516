/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter-tight': ['Inter Tight', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'roboto-mono': ['Roboto Mono', 'monospace'],
      },
      colors: {
        fire: {
          red: 'hsl(0, 84%, 60%)',
          'red-dark': 'hsl(0, 84%, 50%)',
          'red-light': 'hsl(0, 84%, 70%)',
        },
        mission: {
          'bg-primary': '#0a0b0d',
          'bg-secondary': '#111315',
          'bg-tertiary': '#1a1d21',
          'border': '#242830',
          'border-light': '#2d3139',
          'text-primary': '#ffffff',
          'text-secondary': '#b4b8c0',
          'text-muted': '#6b7280',
          'accent-blue': '#0ea5e9',
          'accent-green': '#10b981',
          'accent-orange': '#f59e0b',
          'accent-purple': '#8b5cf6',
        }
      },
      fontSize: {
        'xs': ['11px', { lineHeight: '16px' }],
        'sm': ['13px', { lineHeight: '18px' }],
        'base': ['14px', { lineHeight: '20px' }],
        'lg': ['16px', { lineHeight: '22px' }],
        'xl': ['18px', { lineHeight: '26px' }],
        '2xl': ['20px', { lineHeight: '30px' }],
        '3xl': ['24px', { lineHeight: '34px' }],
        '4xl': ['28px', { lineHeight: '38px' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}