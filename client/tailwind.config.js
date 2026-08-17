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
  darkMode: 'class',
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
      /* Named rather than written as arbitrary values at call sites: Tailwind
         cannot tell whether `duration-[var(--dur-fast)]` means transition- or
         animation-duration, and a bare `cubic-bezier(...)` reads as a class
         with commas in it. Both emitted ambiguity warnings on every build.
         `out` deliberately overrides Tailwind's built-in easing — the house
         curve is the only one this app uses. */
      backgroundColor: {
        well: 'var(--well)',
        'well-active': 'var(--well-active)',
      },
      transitionDuration: {
        press: 'var(--dur-press)',
        fast: 'var(--dur-fast)',
        base: 'var(--dur-base)',
      },
      transitionTimingFunction: {
        out: 'var(--ease-out)',
      },
      colors: {
        /* shadcn/ui contract. Components from the registry address colour
           through these names; everything below is the previous palette kept
           alive so unmigrated pages keep rendering. */
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: { DEFAULT: 'var(--card)', foreground: 'var(--card-foreground)' },
        popover: { DEFAULT: 'var(--popover)', foreground: 'var(--popover-foreground)' },
        primary: { DEFAULT: 'var(--primary)', foreground: 'var(--primary-foreground)' },
        secondary: { DEFAULT: 'var(--secondary)', foreground: 'var(--secondary-foreground)' },
        muted: { DEFAULT: 'var(--muted)', foreground: 'var(--muted-foreground)' },
        accent: { DEFAULT: 'var(--accent)', foreground: 'var(--accent-foreground)' },
        destructive: { DEFAULT: 'var(--destructive)', foreground: 'var(--destructive-foreground)' },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',

        /* `brand` used to be a coral ramp. There is no brand hue any more —
           the primary is ink. Every step folds into the monochrome system so
           an unmigrated `bg-brand-600` renders as the primary rather than
           reintroducing a colour the design no longer has. */
        brand: {
          50: 'var(--muted)',
          100: 'var(--muted)',
          200: 'var(--border)',
          300: 'var(--input)',
          400: 'var(--muted-foreground)',
          500: 'var(--primary)',
          600: 'var(--primary)',
          700: 'var(--foreground)',
          800: 'var(--foreground)',
          900: 'var(--foreground)',
        },

        /* Stone neutrals, theme-aware. Tailwind's stock slate is a fixed cool
           grey and would not follow the dark switch. */
        slate: {
          50: 'var(--background)',
          100: 'var(--muted)',
          200: 'var(--border)',
          300: 'var(--input)',
          400: 'var(--muted-foreground)',
          500: 'var(--muted-foreground)',
          600: 'var(--muted-foreground)',
          700: 'var(--foreground)',
          800: 'var(--foreground)',
          900: 'var(--foreground)',
          950: 'var(--foreground)',
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
  plugins: [require('tailwindcss-animate')],
};
