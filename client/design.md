# Design — Spectra CRM

Locked design system for every route. Read it before changing a page; amend
this file when the system needs to grow. Rewritten 2026-09-30 for the dark,
cinematic rebuild. The earlier Coral / paper system is retired.

## The idea

The product is a sales pipeline, and the name is Spectra, so the system is a
**spectrum**. Every opportunity sits at a temperature. A lead is cold, a deal
at the negotiating table is hot, and a closed deal leaves the scale. It is won
or it is ash.

That one scale is the whole colour system. It runs through the kanban, the
charts, the badges and the landing page, and it means the same thing
everywhere. The chrome around it (surfaces, text, buttons) carries no hue at
all, so the moment colour appears it is saying something.

The type follows the same idea along a different axis: **width**. Hubot Sans
and Mona Sans are variable in width. Figures and stage names are set
condensed, like an instrument readout, and the wordmark is set wide. Body text
sits in the middle.

## Genre

atmospheric / instrument. Dark ground, bright signal, nothing decorative.

## Language

English throughout: interface, landing page and demo data. The demo
companies are international and fictional; their emails sit under
example.com and their phone numbers in the ranges reserved for fiction.
Money is USD. Short dates are ISO (2026-09-30), which read the same in every
country and sort the way they read; long dates spell the month out.

## Stack

Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind 4 (`@theme`
tokens in `app/globals.css`), GSAP ScrollTrigger on the landing and auth
pages, Framer Motion inside the app, next/font. Dark only. The previous light
theme and its toggle were removed, because a second theme was never designed
with the same care.

## Palette

### Ground and ink

| Token | Value | Job |
| --- | --- | --- |
| `ground` | `#0A0B0D` | page |
| `raised` | `#111317` | rail, top bar, auth form side |
| `panel` | `#171A1F` | cards, popovers, table body |
| `lift` | `#1F232A` | hover, pressed, selected row |
| `well` | `#0E1013` | recessed: kanban column, inputs |
| `line` | `#252932` | hairlines |
| `line-strong` | `#343944` | input borders, table head rule |
| `fg` | `#EEF0F3` | text: 15.3 on panel |
| `fg-2` | `#AAB0BA` | secondary text: 8.0 on panel |
| `fg-3` | `#8A919D` | labels, meta: 5.5 on panel, 4.97 on lift |

### The temperature scale

| Token | Value | Means | On panel |
| --- | --- | --- | --- |
| `cold` | `#5B9BFF` | stage **Lead**; low priority; prospect | 6.29 |
| `cool` | `#34D1D8` | stage **Qualified** | 9.35 |
| `warm` | `#F7C948` | stage **Proposal**; medium priority; proposal sent | 11.13 |
| `hot` | `#FF7B3A` | stage **Negotiation**; high priority | 6.77 |
| `won` | `#52E08A` | **Won**; active customer; accepted; done | 10.29 |
| `ash` | `#737A86` | **Lost**; inactive; rejected; draft | 4.03, marks only |
| `danger` | `#FF5C5C` | the destructive confirm step, nothing else | 5.76 |

- All six pass 3:1 as marks on every surface. Five pass 4.5:1 as text on
  every surface. `ash` is never used as text; a lost label is `fg-2`.
- Ground text on any scale fill is at least 4.55:1, so a filled chip can
  carry a dark label.
- Colour is **never alone**. Every stage colour sits next to its stage name.
  Every bar has a figure, and every chart has a table behind a disclosure.
  Under deuteranopia `warm`, `hot` and `won` converge, and under tritanopia
  `cold`, `cool` and `won` converge. The labels and the fixed stage order
  carry identity there.

### Chrome is colourless

- Primary button: `fg` fill, ground text (17.25), a pill.
- Secondary: `panel` fill, `line-strong` hairline, `fg` text.
- Focus: a 2 px `fg` ring, offset 2 px, on every surface. It never animates.
- Active navigation: an `fg` bar that slides between items (a shared layout
  animation), not a colour.

## Typography

| Role | Face | Setting |
| --- | --- | --- |
| Display, figures, stage names | **Hubot Sans** | 700–800, `font-stretch: 75%` (condensed) |
| Wordmark | Hubot Sans | 800, `font-stretch: 125%`, tracked +0.04em |
| UI and body | **Mona Sans** | 400–600, normal width |
| Data, codes, dates, labels | **Martian Mono** | 400–500, `font-stretch: 87.5%`, tabular |

- Roman only. No italic inside a heading, ever.
- Every figure in a table is Martian Mono, tabular, right-aligned.
- Headline figures (the dashboard's open pipeline, a stage total) are Hubot
  condensed at display size. The readout look comes from that.
- Labels (`.label`) are Martian Mono, 11 px, uppercase, +0.08em, `fg-3`.
- Inter, Geist and Space Grotesk are out: the first two are the most
  predictable faces on a Next.js app, and the third was the previous build.

## Macrostructure

- **Landing — Narrative Workflow with a spectrum opening.** The first screen
  is a readout: every opportunity in the demo dataset as a vertical line,
  grouped by stage, with height set by amount. Below it the page walks the
  five stages in order (01 Lead → 05 Close). Each stage has its own band,
  colour rule and the real demo deals that sit in it. Then an index of the
  screens, a spec sheet of the stack, and a statement footer.
  Nav: N1 wordmark + two links. Footer: Ft5 statement.
- **Auth — split readout.** Left: the same readout, compact, with the stage
  legend. Right: the form on `raised`. Below `lg` the readout folds away and
  only the form remains.
- **App — Workbench.** A rail with the navigation and a working surface. Pages
  differ only in how the surface is composed (board, table, detail,
  document). Below `lg` the rail becomes a top bar plus a five-item bottom
  tab bar.

## Surfaces and shape

- Hairlines separate; shadows do not. The one shadow is on floating layers
  (menus, dialogs, toasts), where it signals elevation.
- Radii: controls and chips 6 px, cards 10 px, buttons full pill.
- Kanban columns are `well` with a 2 px top rule in the stage colour. Cards
  are `panel` with a 2 px left edge in the stage colour.
- The proposal document is the one light surface in the app. It is paper
  because it prints. It uses the same type; its status is written out, not
  coloured, so it survives a black-and-white printer.

## Motion

Landing and auth (GSAP):
- Headline lines rise behind a mask on load, 90 ms apart.
- Readout lines grow from the baseline, cold to hot, staggered, once.
- Each stage band's colour rule sweeps left to right as it enters. Section
  titles rise word by word once.
- A thin spectrum rail on the left edge fills stage by stage while the reader
  is inside the workflow section (desktop only).
- Magnetic pull on the primary CTA, fine pointers only.

App (Framer Motion, restrained):
- Route content fades in and rises 6 px, 220 ms. Nothing slides sideways.
- Headline figures count up once on first render.
- Stage bars grow from zero once. The motion explains the number.
- Kanban cards animate to their new column (layout animation) when their
  stage changes. Every drag has a menu equivalent ("Move to stage"), because
  drag and drop reaches neither a keyboard nor a touch screen.
- The active nav bar slides between items.
- Toasts enter from below and leave by fading.

`prefers-reduced-motion`: all of the above off; content is simply there.
Colour and opacity feedback on controls stays. Not used: custom cursors,
grain, looping animation, scroll hijacking, parallax inside the app.

## Honesty

- No invented numbers. The landing readout and stage ledger mirror the demo
  seed (`server/src/seed.ts`). `lib/demo.ts` says so, and the two change
  together. The page labels them "demo dataset".
- A chart never plots what the data cannot support. There is no time series,
  because the demo has no history.
- CTA copy promises only what exists: "Open the demo" opens a signed-in demo.
- No fake browser chrome, no fake device frames.

## Bans

Gradients on buttons, badges or cards · gradient text · radial blooms ·
glass · emoji as icons · Tailwind stock palette literals · hex values in
components (tokens only) · `window.confirm()` · a colour used for two
unrelated meanings · red on a lost deal (lost is ash: a normal outcome, not an
alarm).
