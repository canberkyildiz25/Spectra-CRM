import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Wordmark } from '@/components/brand/SpectraMark';
import Readout from '@/components/landing/Readout';
import LandingFx from '@/components/landing/LandingFx';
import { DEMO_DEALS, dealsIn, totalOf, type DemoDeal } from '@/lib/demo';
import { OPEN_STAGES, STAGES, toneVar, type Tone } from '@/lib/stages';
import { money, moneyShort } from '@/lib/format';

/* Landing — Narrative Workflow with a spectrum opening (design.md).
 *
 * Every figure on this page is computed from lib/demo.ts, which mirrors the
 * seed the demo account opens onto. Nothing is invented: the previous
 * generations of this page claimed "3.2x more sales" for a one-account demo,
 * and that is the kind of thing this page exists not to do.
 */

const openTotal = totalOf(DEMO_DEALS.filter((d) => OPEN_STAGES.some((s) => s.key === d.stage)));
const won = dealsIn('closed-won');
const lost = dealsIn('closed-lost');
const winRate = Math.round((won.length / (won.length + lost.length)) * 100);

type Band = {
  id: string;
  n: string;
  label: string;
  tone: Tone;
  title: string;
  body: string;
  ledgers: { caption: string; tone: Tone; deals: DemoDeal[] }[];
  note: string;
};

const stage = (key: string) => STAGES.find((s) => s.key === key)!;
const share = (deals: DemoDeal[]) => Math.round((totalOf(deals) / openTotal) * 100);

const BANDS: Band[] = [
  {
    id: 'stage-lead',
    n: '01',
    label: stage('lead').label,
    tone: 'cold',
    title: 'A name, a need, no budget yet.',
    body: 'A deal opens against a customer record. Probability starts at 10% and the card waits in the leftmost column of the board.',
    ledgers: [{ caption: `${dealsIn('lead').length} deals`, tone: 'cold', deals: dealsIn('lead') }],
    note: `${share(dealsIn('lead'))}% of the open pipeline`,
  },
  {
    id: 'stage-qualified',
    n: '02',
    label: stage('qualified').label,
    tone: 'cool',
    title: 'The decision-maker is known and the need is real.',
    body: 'Dragging the card one column right updates the stage and the probability together. There is no separate form to fill in.',
    ledgers: [{ caption: `${dealsIn('qualified').length} deals`, tone: 'cool', deals: dealsIn('qualified') }],
    note: `${share(dealsIn('qualified'))}% of the open pipeline`,
  },
  {
    id: 'stage-proposal',
    n: '03',
    label: stage('proposal').label,
    tone: 'warm',
    title: 'Line-item proposals, printable documents.',
    body: 'A proposal is calculated from product and service lines, with VAT shown separately. It prints as a PDF, and its status is tracked as sent, accepted or rejected.',
    ledgers: [{ caption: `${dealsIn('proposal').length} deals`, tone: 'warm', deals: dealsIn('proposal') }],
    note: `${share(dealsIn('proposal'))}% of the open pipeline`,
  },
  {
    id: 'stage-negotiation',
    n: '04',
    label: stage('negotiation').label,
    tone: 'hot',
    title: 'Price is on the table. The hottest part of the pipeline.',
    body: 'Probability is 75%. The largest share of the open pipeline usually sits here, and in the demo data it does. On the dashboard this is the first column to check.',
    ledgers: [{ caption: `${dealsIn('negotiation').length} deals`, tone: 'hot', deals: dealsIn('negotiation') }],
    note: `${share(dealsIn('negotiation'))}% of the open pipeline`,
  },
  {
    id: 'stage-close',
    n: '05',
    label: 'Close',
    tone: 'won',
    title: 'Won or lost, it goes on the record.',
    body: 'A lost deal is not marked in red. Losing is a normal outcome, so it is shown in grey. The win rate is calculated from these two columns.',
    ledgers: [
      { caption: `${stage('closed-won').label} · ${won.length}`, tone: 'won', deals: won },
      { caption: `${stage('closed-lost').label} · ${lost.length}`, tone: 'ash', deals: lost },
    ],
    note: `${winRate}% win rate · ${won.length} / ${won.length + lost.length} closed`,
  },
];

const SCREENS = [
  { href: '/dashboard', name: 'Dashboard', body: 'Open pipeline, won revenue, proposal acceptance, recent tasks and recent customers.' },
  { href: '/opportunities', name: 'Deal board', body: 'Six columns. Drag a card and both the stage and the probability update.' },
  { href: '/proposals', name: 'Proposals', body: 'Status tracking and a printable proposal document.' },
  { href: '/customers', name: 'Customers', body: 'Contact details, linked deals and proposals in one record.' },
  { href: '/tasks', name: 'Tasks', body: 'Priority is marked by heat, so urgent work shows up hot.' },
];

const STACK = [
  ['Client', 'Next.js 16 · React 19 · TypeScript · Tailwind 4'],
  ['Motion', 'GSAP ScrollTrigger on this page, Framer Motion in the app'],
  ['API', 'Express · MongoDB (Mongoose) · REST'],
  ['Auth', 'JWT, Bearer token'],
  ['Hosting', 'Vercel, with the client and the API as separate projects'],
];

const tone = (t: Tone) => ({ '--tone': toneVar(t) }) as React.CSSProperties;

export default function Home() {
  return (
    <div className="min-h-screen bg-ground">
      <a href="#workflow" className="skip-link">
        Skip to content
      </a>

      {/* ── Nav · N1: wordmark and two doors ─────────────── */}
      <header className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-4 py-5 sm:px-8 lg:px-12">
        <Link href="/" aria-label="Spectra CRM home" className="rounded-sm">
          <Wordmark />
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main">
          <a href="#workflow" className="btn-ghost hidden sm:inline-flex">
            Workflow
          </a>
          <Link href="/auth/login" className="btn-ghost hidden min-[360px]:inline-flex">
            Sign in
          </Link>
          <Link href="/dashboard" className="btn btn-sm">
            Open demo
          </Link>
        </nav>
      </header>

      <main>
        {/* ── Opening: the readout ─────────────────────────── */}
        <section className="mx-auto max-w-[1320px] px-4 pb-16 pt-[clamp(2rem,6vh,4.5rem)] sm:px-8 lg:px-12">
          <p className="label rise" data-now data-delay="0">
            Sales pipeline · {DEMO_DEALS.length} deals · demo dataset
          </p>
          <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-end lg:gap-12">
            <h1 className="split text-[clamp(3.1rem,9.6vw,8.75rem)] text-fg" data-now>
              From <span className="text-cold">cold</span> lead
              <br />
              to <span className="text-won">won</span> deal.
            </h1>
            <div className="lg:pb-3">
              <p className="rise max-w-[36rem] leading-relaxed text-fg-2" data-now data-delay="450">
                Spectra keeps the customer, the open deal, the proposal you sent and the task that is
                waiting on one screen. Every deal carries the colour of its stage: a lead is cold blue, a
                negotiation is hot orange.
              </p>
              <div className="rise mt-6 flex flex-wrap items-center gap-3" data-now data-delay="600">
                <Link href="/dashboard" className="btn magnetic">
                  Open the demo
                  <ArrowUpRight className="size-4" aria-hidden />
                </Link>
                <Link href="/auth/login" className="btn-secondary">
                  Sign-in screen
                </Link>
              </div>
              <p className="rise mt-3 text-sm text-fg-3" data-now data-delay="700">
                No sign-up. The demo account is ready.
              </p>
            </div>
          </div>

          <div className="mt-12 lg:mt-14">
            <Readout />
            <p className="rise mt-5 max-w-xl text-sm text-fg-3" data-now data-delay="900">
              The {DEMO_DEALS.length} deals in the demo account. Each line is one deal: its height is the
              amount and its colour is the stage. {moneyShort(openTotal)} is in the open pipeline.
            </p>
          </div>
        </section>

        {/* ── Workflow: five stops ─────────────────────────── */}
        <section id="workflow" className="border-t border-line">
          <div className="mx-auto max-w-[1320px] px-4 pt-20 sm:px-8 lg:px-12 lg:pt-28">
            <p className="label">Workflow</p>
            <h2 className="split mt-4 max-w-[14ch] text-[clamp(2.4rem,6.5vw,5.25rem)]">
              Five stops for every deal.
            </h2>
            <p className="rise mt-6 max-w-[38rem] leading-relaxed text-fg-2">
              Each column on the board is a stage, and cards warm up from left to right. The deals
              below sit exactly where they are in the demo account right now.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-[1320px] px-4 sm:px-8 lg:grid-cols-[2.25rem_minmax(0,1fr)] lg:gap-10 lg:px-12">
            {/* The rail fills stage by stage while its band is on screen. */}
            <div className="hidden lg:block" aria-hidden>
              <div className="sticky top-[30vh] flex flex-col gap-1.5">
                {BANDS.map((b) => (
                  <span key={b.id} className="relative block h-16 w-[3px] overflow-hidden rounded-full bg-line">
                    <span
                      data-rail-seg={b.id}
                      className="absolute inset-0 origin-top rounded-full"
                      style={{ background: toneVar(b.tone) }}
                    />
                  </span>
                ))}
              </div>
            </div>

            <ol className="min-w-0">
              {BANDS.map((b) => (
                <li key={b.id} id={b.id} className="relative pb-20 pt-10 lg:pb-28">
                  <span
                    aria-hidden
                    className="sweep absolute inset-x-0 top-0 block h-[2px]"
                    style={{ background: toneVar(b.tone) }}
                  />
                  <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
                    <div>
                      <p className="flex items-baseline gap-4">
                        <span className="readout text-[clamp(3.5rem,9vw,7rem)]" style={{ color: toneVar(b.tone) }}>
                          {b.n}
                        </span>
                        <span className="label text-fg-2">{b.label}</span>
                      </p>
                      <h3 className="split display mt-5 text-[clamp(1.9rem,3.6vw,3rem)] text-fg">{b.title}</h3>
                      <p className="rise mt-5 max-w-[34rem] leading-relaxed text-fg-2">{b.body}</p>
                    </div>

                    <div className="rise min-w-0 self-end">
                      {b.ledgers.map((l) => (
                        <div key={l.caption} className="mb-8 last:mb-0">
                          <div className="mb-2 flex items-center justify-between gap-4">
                            <span className="chip" style={tone(l.tone)}>
                              {l.caption}
                            </span>
                            <span className="figure text-sm text-fg">{money(totalOf(l.deals))}</span>
                          </div>
                          <ul className="border-t border-line">
                            {l.deals.map((d) => (
                              <li
                                key={`${d.company}-${d.deal}`}
                                className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4 border-b border-line py-3"
                              >
                                <span className="min-w-0">
                                  <span className="block truncate text-fg">{d.company}</span>
                                  <span className="block truncate text-sm text-fg-3">{d.deal}</span>
                                </span>
                                <span className="figure text-sm text-fg-2">{money(d.amount)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      <p className="label mt-4">{b.note}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Inside: an index of the screens ──────────────── */}
        <section className="border-t border-line">
          <div className="mx-auto max-w-[1320px] px-4 py-20 sm:px-8 lg:px-12 lg:py-28">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
              <div>
                <p className="label">Inside</p>
                <h2 className="split mt-4 text-[clamp(2.2rem,5vw,4rem)]">Five screens, one dataset.</h2>
                <p className="rise mt-5 max-w-[30rem] leading-relaxed text-fg-2">
                  These links open straight into the demo and the session sets itself up. The
                  sign-in screen is still there for anyone who wants to see it.
                </p>
              </div>
              <ol className="border-t border-line">
                {SCREENS.map((s, i) => (
                  <li key={s.href} className="border-b border-line">
                    <Link
                      href={s.href}
                      className="group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-4 py-5 transition-colors hover:bg-raised sm:py-6"
                    >
                      <span className="figure text-sm text-fg-3">{String(i + 1).padStart(2, '0')}</span>
                      <span className="min-w-0">
                        <span className="display block text-[clamp(1.4rem,2.6vw,2rem)] text-fg">{s.name}</span>
                        <span className="mt-1 block text-sm text-fg-2">{s.body}</span>
                      </span>
                      <ArrowUpRight
                        className="size-5 text-fg-3 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg"
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ── Stack: a spec sheet ──────────────────────────── */}
        <section className="border-t border-line bg-raised">
          <div className="mx-auto grid max-w-[1320px] gap-10 px-4 py-20 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 lg:px-12">
            <div>
              <p className="label">Stack</p>
              <h2 className="split mt-4 text-[clamp(2rem,4.2vw,3.25rem)]">Works end to end.</h2>
            </div>
            <dl className="border-t border-line">
              {STACK.map(([k, v]) => (
                <div key={k} className="grid gap-1 border-b border-line py-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6">
                  <dt className="label pt-0.5">{k}</dt>
                  <dd className="text-fg">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>

      {/* ── Footer · Ft5 statement ──────────────────────────── */}
      <footer className="border-t border-line">
        <div className="mx-auto max-w-[1320px] px-4 pb-10 pt-20 sm:px-8 lg:px-12 lg:pt-28">
          <p className="split display text-[clamp(3.25rem,13vw,11rem)] text-fg">Pipeline open.</p>
          <div className="mt-10 flex flex-col gap-8 border-t border-line pt-8 md:flex-row md:items-end md:justify-between">
            <p className="max-w-[36rem] text-sm leading-relaxed text-fg-2">
              This is a portfolio project and it works end to end: a Next.js client, a REST API on
              Express and MongoDB, and JWT authentication. Every figure on this page is calculated
              from the demo dataset.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href="/dashboard" className="btn">
                Open the demo
              </Link>
              <a
                href="https://github.com/canberkyildiz25/Spectra-CRM"
                target="_blank"
                rel="noreferrer"
                className="label transition-colors hover:text-fg"
              >
                Source code ↗
              </a>
              <span className="label">Canberk Yıldız</span>
            </div>
          </div>
        </div>
      </footer>

      <LandingFx />
    </div>
  );
}
