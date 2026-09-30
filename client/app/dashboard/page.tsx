'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import AppShell from '@/components/AppShell';
import PageHead, { Page } from '@/components/app/PageHead';
import CountUp from '@/components/app/CountUp';
import ToneChip, { ToneDot } from '@/components/app/ToneChip';
import StageSpectrum, { type StageDatum } from '@/components/charts/StageSpectrum';
import WonLostSplit from '@/components/charts/WonLostSplit';
import { useAuthReady, useAuthStore } from '@/lib/store';
import api from '@/lib/axios';
import { CUSTOMER_STATUS, OPEN_STAGES, PRIORITY, TASK_STATUS } from '@/lib/stages';
import { date, dateLong, moneyShort } from '@/lib/format';

interface Stats {
  customers: { total: number; active: number };
  tasks: { total: number; pending: number; completed: number };
  opportunities: { total: number; won: number; pipelineValue: number; wonValue: number };
  proposals: { total: number; accepted: number; acceptedValue: number };
  recentTasks: { _id: string; title: string; status: string; priority: string; dueDate?: string }[];
  recentCustomers: { _id: string; firstName: string; lastName: string; company?: string; status: string }[];
}

interface Opportunity {
  _id: string;
  stage: string;
  amount: number;
}

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

const plainNumber = (n: number) => String(n);
const percent = (n: number) => `${n}%`;

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<Stats | null>(null);
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [phase, setPhase] = useState<'loading' | 'ready' | 'failed'>('loading');
  const authReady = useAuthReady();

  useEffect(() => {
    if (!authReady) return;
    Promise.all([
      api.get('/stats').then((r) => r.data.data as Stats),
      api
        .get('/opportunities')
        .then((r) => (r.data.data ?? []) as Opportunity[])
        .catch(() => [] as Opportunity[]),
    ])
      .then(([s, o]) => {
        setStats(s);
        setOpps(o);
        setPhase('ready');
      })
      .catch(() => setPhase('failed'));
  }, [authReady]);

  if (phase !== 'ready' || !stats) {
    return (
      <AppShell>
        <Page>
          {phase === 'loading' ? (
            <div role="status" aria-label="Loading data" className="animate-pulse space-y-6">
              <div className="h-4 w-24 rounded bg-lift" />
              <div className="h-12 w-72 rounded bg-lift" />
              <div className="h-32 rounded-[var(--radius-lg)] bg-panel" />
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="h-72 rounded-[var(--radius-lg)] bg-panel" />
                <div className="h-72 rounded-[var(--radius-lg)] bg-panel" />
              </div>
            </div>
          ) : (
            <div className="max-w-md py-16">
              <p className="label">No data</p>
              <h1 className="mt-3 text-[2.25rem] text-fg">The summary could not load.</h1>
              <p className="mt-3 text-sm leading-relaxed text-fg-2">The server did not respond. Reload the page to try again.</p>
              <button type="button" onClick={() => window.location.reload()} className="btn mt-6">
                Reload
              </button>
            </div>
          )}
        </Page>
      </AppShell>
    );
  }

  const byStage = (key: string) => opps.filter((o) => o.stage === key);
  const sum = (rows: Opportunity[]) => rows.reduce((s, o) => s + (o.amount ?? 0), 0);

  const stageData: StageDatum[] = OPEN_STAGES.map((s) => {
    const rows = byStage(s.key);
    return { key: s.key, label: s.label, tone: s.tone, count: rows.length, value: sum(rows) };
  });
  const openValue = stageData.reduce((n, s) => n + s.value, 0);
  const openCount = stageData.reduce((n, s) => n + s.count, 0);
  const won = byStage('closed-won');
  const lost = byStage('closed-lost');
  const hottest = [...stageData].sort((a, b) => b.value - a.value)[0];
  const acceptRate =
    stats.proposals.total > 0 ? Math.round((stats.proposals.accepted / stats.proposals.total) * 100) : 0;

  return (
    <AppShell>
      <Page>
        <PageHead
          label="Dashboard"
          title={`${greeting()}${user?.firstName ? `, ${user.firstName}` : ''}.`}
          meta={dateLong(new Date())}
          actions={
            <Link href="/opportunities" className="btn-secondary btn-sm">
              Deal board
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          }
        />

        {/* ── Headline figures: one lead readout, three beside it ── */}
        <section
          aria-label="Summary figures"
          className="grid grid-cols-2 overflow-hidden rounded-[var(--radius-lg)] border border-line bg-panel sm:grid-cols-3 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]"
        >
          <div className="col-span-2 border-b border-line p-5 sm:col-span-3 sm:p-6 lg:col-span-1 lg:border-b-0 lg:border-r">
            <p className="label">Open pipeline</p>
            <p className="readout mt-3 text-[clamp(3.25rem,7vw,5rem)] text-fg">
              <CountUp value={openValue || stats.opportunities.pipelineValue} format={moneyShort} />
            </p>
            <p className="mt-2 text-sm text-fg-2">
              {openCount} open deals
              {hottest?.value > 0 && (
                <>
                  {' · '}largest share{' '}
                  <span className="inline-flex items-center gap-1.5 text-fg">
                    <ToneDot tone={hottest.tone} />
                    {hottest.label}
                  </span>
                </>
              )}
            </p>
          </div>
          {[
            { label: 'Won', value: stats.opportunities.wonValue, fmt: moneyShort, sub: `${stats.opportunities.won} deals` },
            { label: 'Proposals accepted', value: acceptRate, fmt: percent, sub: `${stats.proposals.accepted} of ${stats.proposals.total}` },
            { label: 'Customers', value: stats.customers.total, fmt: plainNumber, sub: `${stats.customers.active} active` },
          ].map((f, i) => (
            <div
              key={f.label}
              className={`min-w-0 border-line p-4 sm:p-6 ${['border-r', 'sm:border-r', 'col-span-2 border-t sm:col-span-1 sm:border-t-0'][i]}`}
            >
              <p className="label">{f.label}</p>
              <p className="readout mt-3 text-[clamp(1.75rem,7vw,2.5rem)] text-fg">
                <CountUp value={f.value} format={f.fmt} />
              </p>
              <p className="mt-2 truncate text-xs text-fg-2 sm:text-sm">{f.sub}</p>
            </div>
          ))}
        </section>

        {/* ── Pipeline and closed business ── */}
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <section className="card p-5 sm:p-6" aria-labelledby="pipeline-title">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 id="pipeline-title" className="text-[1.75rem] text-fg">
                  Open pipeline by stage
                </h2>
                <p className="mt-1 text-sm text-fg-2">Cold to hot: lead, qualified, proposal, negotiation.</p>
              </div>
            </div>
            <StageSpectrum data={stageData} />
          </section>

          <section className="card p-5 sm:p-6" aria-labelledby="closed-title">
            <h2 id="closed-title" className="text-[1.75rem] text-fg">
              Closed deals
            </h2>
            <p className="mb-6 mt-1 text-sm text-fg-2">Value won and lost.</p>
            <WonLostSplit
              wonCount={won.length || stats.opportunities.won}
              lostCount={lost.length}
              wonValue={sum(won) || stats.opportunities.wonValue}
              lostValue={sum(lost)}
            />
          </section>
        </div>

        {/* ── Recent activity ── */}
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <section className="card overflow-hidden" aria-labelledby="tasks-title">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 id="tasks-title" className="text-[1.375rem] text-fg">
                Recent tasks
              </h2>
              <Link href="/tasks" className="label transition-colors hover:text-fg">
                All ↗
              </Link>
            </div>
            {stats.recentTasks.length === 0 ? (
              <p className="px-5 py-10 text-sm text-fg-3">No tasks yet.</p>
            ) : (
              <ul>
                {stats.recentTasks.map((t) => {
                  const pr = PRIORITY[t.priority] ?? PRIORITY.medium;
                  const st = TASK_STATUS[t.status] ?? TASK_STATUS.pending;
                  return (
                    <li key={t._id} className="flex items-center gap-3 border-b border-line px-5 py-3 last:border-0">
                      <ToneDot tone={pr.tone} />
                      <span className="sr-only">{pr.label} priority:</span>
                      <span className={`min-w-0 flex-1 truncate text-sm ${t.status === 'completed' ? 'text-fg-3 line-through' : 'text-fg'}`}>
                        {t.title}
                      </span>
                      <span className="figure hidden text-xs text-fg-3 sm:inline">{date(t.dueDate)}</span>
                      <ToneChip tone={st.tone}>{st.label}</ToneChip>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="card overflow-hidden" aria-labelledby="customers-title">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 id="customers-title" className="text-[1.375rem] text-fg">
                Recent customers
              </h2>
              <Link href="/customers" className="label transition-colors hover:text-fg">
                All ↗
              </Link>
            </div>
            {stats.recentCustomers.length === 0 ? (
              <p className="px-5 py-10 text-sm text-fg-3">No customers yet.</p>
            ) : (
              <ul>
                {stats.recentCustomers.map((c) => {
                  const st = CUSTOMER_STATUS[c.status] ?? CUSTOMER_STATUS.prospect;
                  return (
                    <li key={c._id} className="border-b border-line last:border-0">
                      <Link
                        href={`/customers/${c._id}`}
                        className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-lift"
                      >
                        <span className="figure flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-line bg-well text-[0.6875rem] text-fg-2">
                          {c.firstName[0]}
                          {c.lastName[0]}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-fg">
                            {c.firstName} {c.lastName}
                          </span>
                          {c.company && <span className="block truncate text-xs text-fg-3">{c.company}</span>}
                        </span>
                        <ToneChip tone={st.tone}>{st.label}</ToneChip>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </Page>
    </AppShell>
  );
}
