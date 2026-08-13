/** @type {import('tailwindcss').Config} */

/* Hallmark · theme: Coral · see design.md at the client root.
 *
 * The pages address colour through Tailwind utilities (`bg-brand-600`,
 * `text-slate-700`, `border-slate-200`). Rather than rewrite thirteen route
 * files, the ramps below are re-pointed at the design tokens, so every
 * existing utility resolves into the new system. `slate` is deliberately
 * overridden — it was carrying the old cool grey, and the system is warm.
 */
const path = require('path');

module.exports = {
  /* Resolved against this file, not the working directory. Relative globs
   * silently match nothing when the dev server is started from the monorepo
   * root, and an empty `content` set means Tailwind emits no utilities at all
   * — a failure that looks like broken CSS rather than a misconfiguration. */
  content: [
    path.join(__dirname, 'app/**/*.{js,ts,jsx,tsx}'),
    path.join(__dirname, 'components/**/*.{js,ts,jsx,tsx}'),
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        /* Coral — the single accent. Budget: ≤ 3% of any viewport. */
        brand: {
          50: 'oklch(97.5% 0.012 34)',
          100: 'var(--color-accent-wash)',
          200: 'oklch(90% 0.055 33)',
          300: 'oklch(82% 0.095 33)',
          400: 'oklch(74% 0.13 32)',
          500: 'var(--color-accent)',
          600: 'var(--color-accent-hover)',
          700: 'var(--color-accent-ink)',
          800: 'oklch(43% 0.135 32)',
          900: 'oklch(35% 0.11 32)',
        },

        /* Warm neutral ramp replacing Tailwind's cool slate. */
        slate: {
          50: 'var(--color-paper)',
          100: 'var(--color-paper-2)',
          200: 'var(--color-rule)',
          300: 'var(--color-rule-strong)',
          400: 'var(--color-ink-3)',
          500: 'oklch(56% 0.011 49)',
          600: 'var(--color-ink-2)',
          700: 'oklch(38% 0.013 46)',
          800: 'oklch(30% 0.014 45)',
          900: 'var(--color-ink)',
          950: 'oklch(17% 0.012 45)',
        },

        /* Data states — see design.md § Data states. Lost is grey, not red. */
        positive: 'var(--color-positive)',
        caution: 'var(--color-caution)',
        quiet: 'var(--color-quiet)',

        paper: {
          DEFAULT: 'var(--color-paper)',
          2: 'var(--color-paper-2)',
          3: 'var(--color-paper-3)',
        },
        ink: {
          DEFAULT: 'var(--color-ink)',
          2: 'var(--color-ink-2)',
          3: 'var(--color-ink-3)',
        },
        rule: {
          DEFAULT: 'var(--color-rule)',
          strong: 'var(--color-rule-strong)',
        },

        sidebar: {
          bg: 'var(--color-rail)',
          hover: 'var(--color-rail-2)',
          active: 'var(--color-rail-2)',
          border: 'var(--color-rail-rule)',
          text: 'var(--color-rail-ink)',
          title: 'var(--color-rail-ink-strong)',
        },
      },

      /* Shadows are not the separation device — hairline rules are.
         The old card/stat/glow shadows resolve to nothing. */
      boxShadow: {
        card: 'none',
        'card-hover': 'none',
        stat: 'none',
        glow: '0 0 0 2px var(--color-focus)',
      },

      borderRadius: {
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-lg)',
        xl2: 'var(--radius-lg)',
        '2xl': 'var(--radius-lg)',
        '3xl': 'var(--radius-lg)',
        full: 'var(--radius-pill)',
      },

      /* Fade only. No slide — see design.md § Motion. */
      animation: {
        'fade-in': 'fadeIn var(--dur-base) var(--ease-out) both',
        'slide-up': 'fadeIn var(--dur-base) var(--ease-out) both',
        'pulse-soft': 'pulseSoft 2s var(--ease-in-out) infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '.6' } },
      },

      /* Gradients are banned. The names survive so no call site loses its
         fill; they resolve to flat tints. */
      backgroundImage: {
        'gradient-brand': 'none',
        'gradient-success': 'none',
        'gradient-warning': 'none',
        'gradient-info': 'none',
        'gradient-rose': 'none',
        'gradient-sidebar': 'none',
      },
    },
  },
  plugins: [],
};
