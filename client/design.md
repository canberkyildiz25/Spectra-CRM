# Design — Spectra CRM

A locked design system for this app. Every page redesign reads this file before
emitting code. Do not regenerate per page — extend or amend this file when the
system needs to grow.

## Genre

modern-minimal. A CRM is a B2B tool; the register is Stripe rather than Linear —
warm, composed, quiet. The tone brief was **soft**, so warmth carries it: warm-grey
paper, generous radii, hairline rules instead of shadows.

## Macrostructure family

- **App pages** (dashboard, customers, opportunities, tasks, proposals):
  **Workbench** — the data is the content. Sidebar rail + working surface. Pages
  vary only in how the working surface is composed (board / table / detail).
- **Auth pages** (login, register): **Letter** — a single narrow column, no
  marketing furniture.

## Theme — Coral

Anchor hue 40–60° (warm). One accent, coral, held to **≤ 3 % of any viewport**.

- `--color-paper`      oklch(97.5% 0.006 60)  — page ground
- `--color-paper-2`    oklch(95%   0.008 58)  — cards, raised surfaces
- `--color-paper-3`    oklch(92%   0.010 56)  — hover, inset wells
- `--color-ink`        oklch(23%   0.014 45)  — primary text
- `--color-ink-2`      oklch(46%   0.012 48)  — secondary text
- `--color-ink-3`      oklch(62%   0.010 50)  — labels, meta
- `--color-rule`       oklch(89%   0.008 55)  — hairlines
- `--color-accent`     oklch(66%   0.152 32)  — coral, fills and marks
- `--color-accent-ink` oklch(51%   0.155 32)  — coral as text on paper (contrast)
- `--color-accent-wash` oklch(95%  0.030 34)  — selected rows, faint tint
- `--color-focus`      oklch(58%   0.150 32)  — focus rings

### Data states

Deliberately low-chroma so the coral accent stays the only loud thing on screen.
**Lost deals are grey, not red** — an alarm colour on a normal business outcome is
noise, and red would compete with the accent.

- `--color-positive`   oklch(56% 0.085 160)  — won, completed
- `--color-caution`    oklch(72% 0.095 80)   — pending, due soon
- `--color-quiet`      oklch(52% 0.020 45)   — lost, inactive, archived

## Typography

Two families, inside the 2+1 rule.

- **Display:** Geist, 500–600, tracking `-0.02em`
- **Body:** Geist, 400–500
- **Mono:** Geist Mono, 400–500 — every figure, currency amount, date, ID and
  table numeral. Tabular numerals are mandatory in tables so columns align.
- Type scale anchor: `--text-display` = `clamp(2rem, 1.4rem + 2vw, 2.75rem)`

Inter is banned in this project. It was the previous default and is the single
most recognisable generated-UI tell.

## Spacing

4-point named scale, values in `tokens.css`. Pages must use named tokens
(`var(--space-md)`), never raw values.

## Radii

Soft, but not uniformly round — uniform `rounded-2xl` on everything is a tell.

- Buttons: full pill (`--radius-pill`)
- Cards, panels: `--radius-lg` (14px)
- Inputs, chips, table wells: `--radius-md` (10px)

## Motion

The project ships no motion library and will not gain one. Motion is CSS only.

- Easings: `--ease-out` `cubic-bezier(0.16, 1, 0.3, 1)`, `--ease-in-out`
  `cubic-bezier(0.4, 0, 0.2, 1)`
- Reveal pattern: fade only, 180 ms. No slide-up on route change — it makes a
  data table feel like a marketing page.
- Animate `transform` and `opacity` only.
- `prefers-reduced-motion: reduce` collapses everything to a ≤ 150 ms opacity
  crossfade. Focus rings never animate.

## Microinteractions stance

- Silent success. A saved record updates in place; no celebratory toast.
- Optimistic update + Undo over confirmation dialogs.
- Hover tooltips delay 800 ms; focus tooltips 0 ms.
- Buttons do not lift on hover. The previous build's `translateY(-1px)` on every
  button is restless in a tool people use all day.

## CTA voice

- **Primary:** flat coral fill, pill, no gradient, no shadow. Label is a verb and
  its object — "Fırsat ekle", never "Gönder".
- **Secondary:** paper-2 fill, hairline rule, pill, ink text.
- **Destructive:** no red fill. Ink text, hairline rule, coral only on the
  confirm step.

## What pages MUST share

- The wordmark and the sidebar rail.
- Coral, at ≤ 3 % per viewport, only on: active nav item, primary button, focus
  ring, the single most important figure on the page.
- Geist + Geist Mono, with mono on every number.
- Button shape and padding rhythm.
- Hairline rules as the separator language — **no drop shadows on cards**.

## What pages MAY differ on

- How the working surface is composed: board, table, split detail, form.
- Which figure is promoted to display size.

## Per-page allowances

App pages MUST NOT use hero enrichment. Function carries the page.

## Bans specific to this project

Carried over from what the previous build got wrong:

- `linear-gradient` on buttons, badges or stat cards. Gradients are gone.
- Five parallel gradient utilities (`.bg-gradient-brand/success/warning/info/rose`).
- Tailwind's stock `emerald` and `slate` ramps as brand colour.
- `rounded-2xl` applied uniformly to every surface.
- Drop shadows as the card-separation device.
- Emoji as icons.
