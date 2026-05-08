/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        sidebar: {
          bg:     '#0f172a',
          hover:  '#1e293b',
          active: '#1e293b',
          border: '#1e293b',
          text:   '#94a3b8',
          title:  '#ffffff',
        },
      },
      boxShadow: {
        card:       '0 1px 3px 0 rgb(0 0 0 / .05), 0 1px 2px -1px rgb(0 0 0 / .05)',
        'card-hover':'0 4px 16px 0 rgb(0 0 0 / .09), 0 1px 3px 0 rgb(0 0 0 / .05)',
        'stat':     '0 2px 8px 0 rgb(5 150 105 / .2)',
        'glow':     '0 0 0 3px rgb(16 185 129 / .15)',
      },
      borderRadius: {
        'xl2': '1rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in':    'fadeIn 0.18s ease-out',
        'slide-up':   'slideUp 0.22s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(.4,0,.6,1) infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' },                  to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '.6' } },
      },
      backgroundImage: {
        'gradient-brand':   'linear-gradient(135deg, #059669 0%, #10b981 100%)',
        'gradient-success': 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
        'gradient-warning': 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
        'gradient-info':    'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
        'gradient-rose':    'linear-gradient(135deg, #be185d 0%, #f43f5e 100%)',
        'gradient-sidebar': 'linear-gradient(180deg, #0f172a 0%, #0f172a 100%)',
      },
    },
  },
  plugins: [],
};
