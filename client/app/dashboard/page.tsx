'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/axios';
import StageValueBars, { StageDatum } from '@/components/charts/StageValueBars';
import WonLostSplit from '@/components/charts/WonLostSplit';

interface Stats {
  customers: { total: number; active: number };
  tasks: { total: number; pending: number; completed: number };
  users: { total: number };
  opportunities: { total: number; won: number; pipelineValue: number; wonValue: number };
  proposals: { total: number; accepted: number; acceptedValue: number };
  recentTasks: { _id: string; title: string; status: string; priority: string; dueDate: string }[];
  recentCustomers: { _id: string; firstName: string; lastName: string; company: string; status: string }[];
}

interface Opportunity {
  _id: string;
  stage: string;
  amount: number;
}

const fmtFull = (n: number) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(n);

const fmtShort = (n: number) => {
  if (n >= 1_000_000) return `₺${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₺${Math.round(n / 1_000)}B`;
  return `₺${n}`;
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Günaydın';
  if (h < 18) return 'İyi günler';
  return 'İyi akşamlar';
};

/* Open pipeline only. Closed business is its own panel — mixing won and lost
   into a "pipeline" reading is how forecasts end up wrong. */
const OPEN_STAGES: { key: string; label: string }[] = [
  { key: 'lead', label: 'Aday' },
  { key: 'qualified', label: 'Nitelikli' },
  { key: 'proposal', label: 'Teklif' },
  { key: 'negotiation', label: 'Görüşme' },
];

const statusLabel: Record<string, string> = {
  pending: 'Bekliyor',
  'in-progress': 'Devam',
  completed: 'Tamam',
  customer: 'Müşteri',
  prospect: 'Aday',
  inactive: 'Pasif',
};

const statusTone: Record<string, string> = {
  pending: 'badge-caution',
  'in-progress': 'badge-accent',
  completed: 'badge-positive',
  customer: 'badge-positive',
  prospect: 'badge-accent',
  inactive: 'badge-quiet',
};

const priorityTone: Record<string, string> = {
  high: 'var(--color-accent)',
  medium: 'var(--color-caution)',
  low: 'var(--color-ink-3)',
};

/* Small inline icons. Emoji are not icons — they render differently on every
   platform and carry a tone this tool does not have. */
const Icon = ({ path }: { path: string }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d={path} />
  </svg>
);

const ICONS = {
  customers: 'M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20M9 10.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM22 20v-1.5a4 4 0 0 0-3-3.87M16 3.63a4 4 0 0 1 0 7.75',
  opportunities: 'M3 17l6-6 4 4 8-8M21 7h-5M21 7v5',
  proposals: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5ZM14 3v5h5M9 13h6M9 17h4',
  tasks: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
};

function StatTile({
  label,
  value,
  sub,
  lead,
}: {
  label: string;
  value: string;
  sub: string;
  lead?: boolean;
}) {
  return (
    <div className="card p-5">
      <p className="label mb-2">{label}</p>
      <p
        className="figure mb-1 leading-none"
        style={{
          fontSize: lead ? 'var(--text-display)' : '1.5rem',
          color: lead ? 'var(--color-accent-ink)' : 'var(--color-ink)',
        }}
      >
        {value}
      </p>
      <p className="text-xs text-ink-3">{sub}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [opps, setOpps] = useState<Opportunity[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/stats').then((r) => r.data.data as Stats),
      api
        .get('/opportunities')
        .then((r) => (r.data.opportunities ?? r.data.data ?? []) as Opportunity[])
        .catch(() => [] as Opportunity[]),
    ])
      .then(([s, o]) => {
        setStats(s);
        setOpps(o);
      })
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  // The stat blocks read through `stats`, which was previously asserted non-null
  // with `!`. That only silences the compiler; a failed request took the page
  // down at runtime. Nothing renders until there is something to render.
  if (loading || !stats) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center px-6">
          {loading ? (
            <p className="label animate-pulse-soft">Veriler yükleniyor</p>
          ) : (
            <div className="max-w-sm text-center">
              <p className="label mb-3">Veri yok</p>
              <h1 className="mb-3 text-xl">Özet alınamadı</h1>
              <p className="text-sm leading-relaxed text-ink-2">
                Sunucu yanıt vermedi. Sayfayı yenilemeyi deneyin.
              </p>
            </div>
          )}
        </div>
      </AppShell>
    );
  }

  const list = opps ?? [];
  const byStage = (key: string) => list.filter((o) => o.stage === key);

  const stageData: StageDatum[] = OPEN_STAGES.map((s) => {
    const rows = byStage(s.key);
    return {
      key: s.key,
      label: s.label,
      count: rows.length,
      value: rows.reduce((sum, o) => sum + (o.amount ?? 0), 0),
    };
  });

  const won = byStage('closed-won');
  const lost = byStage('closed-lost');
  const openValue = stageData.reduce((sum, s) => sum + s.value, 0);

  const acceptRate =
    stats.proposals.total > 0
      ? Math.round((stats.proposals.accepted / stats.proposals.total) * 100)
      : 0;

  return (
    <AppShell>
      <div className="animate-fade-in mx-auto max-w-6xl px-5 py-8 sm:px-8">
        {/* ── Page head ─────────────────────────────────────── */}
        <header className="mb-8">
          <p className="label mb-2">Panel</p>
          <h1 className="text-2xl sm:text-3xl">
            {greeting()}
            {user?.firstName ? `, ${user.firstName}` : ''}
          </h1>
        </header>

        {/* ── Headline figures ──────────────────────────────── */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            lead
            label="Açık hat"
            value={fmtShort(openValue || stats.opportunities.pipelineValue)}
            sub={`${list.length ? stageData.reduce((n, s) => n + s.count, 0) : stats.opportunities.total} açık fırsat`}
          />
          <StatTile
            label="Kazanılan"
            value={fmtShort(stats.opportunities.wonValue)}
            sub={`${stats.opportunities.won} anlaşma`}
          />
          <StatTile
            label="Teklif kabulü"
            value={`%${acceptRate}`}
            sub={`${stats.proposals.accepted} / ${stats.proposals.total} teklif`}
          />
          <StatTile
            label="Müşteriler"
            value={String(stats.customers.total)}
            sub={`${stats.customers.active} aktif`}
          />
        </div>

        {/* ── Charts ────────────────────────────────────────── */}
        <div className="mb-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <section className="card p-6">
            <div className="mb-5">
              <h2 className="text-lg">Aşamaya göre hat</h2>
              <p className="mt-1 text-sm text-ink-2">
                Açık fırsatların aşama başına toplam değeri.
              </p>
            </div>
            <StageValueBars data={stageData} />
          </section>

          <section className="card p-6">
            <div className="mb-5">
              <h2 className="text-lg">Kapanmış işler</h2>
              <p className="mt-1 text-sm text-ink-2">Kazanılan ve kaybedilen tutar.</p>
            </div>
            <WonLostSplit
              wonCount={won.length || stats.opportunities.won}
              lostCount={lost.length}
              wonValue={
                won.reduce((s, o) => s + (o.amount ?? 0), 0) || stats.opportunities.wonValue
              }
              lostValue={lost.reduce((s, o) => s + (o.amount ?? 0), 0)}
            />
          </section>
        </div>

        {/* ── Recent activity ───────────────────────────────── */}
        <div className="mb-8 grid gap-4 lg:grid-cols-2">
          <section className="card-flush">
            <div className="flex items-center justify-between border-b border-rule px-5 py-4">
              <h2 className="text-sm font-semibold">Son görevler</h2>
              <Link
                href="/tasks"
                className="label transition-colors hover:text-accent-ink"
              >
                Tümü
              </Link>
            </div>
            {!stats.recentTasks.length ? (
              <p className="py-10 text-center text-sm text-ink-3">Henüz görev yok</p>
            ) : (
              <ul>
                {stats.recentTasks.map((t) => (
                  <li
                    key={t._id}
                    className="flex items-center gap-3 border-b border-rule px-5 py-3 last:border-0"
                  >
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: priorityTone[t.priority] ?? 'var(--color-ink-3)' }}
                    />
                    <span className="flex-1 truncate text-sm">{t.title}</span>
                    <span className={`badge ${statusTone[t.status] ?? 'badge-quiet'}`}>
                      {statusLabel[t.status] ?? t.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card-flush">
            <div className="flex items-center justify-between border-b border-rule px-5 py-4">
              <h2 className="text-sm font-semibold">Son müşteriler</h2>
              <Link
                href="/customers"
                className="label transition-colors hover:text-accent-ink"
              >
                Tümü
              </Link>
            </div>
            {!stats.recentCustomers.length ? (
              <p className="py-10 text-center text-sm text-ink-3">Henüz müşteri yok</p>
            ) : (
              <ul>
                {stats.recentCustomers.map((c) => (
                  <li
                    key={c._id}
                    className="flex items-center gap-3 border-b border-rule px-5 py-3 last:border-0"
                  >
                    {/* Initials on a flat tinted well — the old build gave every
                        avatar its own gradient, five hues competing with the accent. */}
                    <span
                      aria-hidden
                      className="figure flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[11px]"
                      style={{
                        background: 'var(--color-paper-3)',
                        color: 'var(--color-ink-2)',
                      }}
                    >
                      {c.firstName[0]}
                      {c.lastName[0]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">
                        {c.firstName} {c.lastName}
                      </p>
                      {c.company && (
                        <p className="truncate text-xs text-ink-3">{c.company}</p>
                      )}
                    </div>
                    <span className={`badge ${statusTone[c.status] ?? 'badge-quiet'}`}>
                      {statusLabel[c.status] ?? c.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* ── Quick actions ─────────────────────────────────── */}
        <nav className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { href: '/customers', label: 'Müşteriler', desc: 'Listele ve yönet', icon: ICONS.customers },
            { href: '/opportunities', label: 'Fırsatlar', desc: 'Hat ve pano', icon: ICONS.opportunities },
            { href: '/proposals', label: 'Teklifler', desc: 'Oluştur ve gönder', icon: ICONS.proposals },
            { href: '/tasks', label: 'Görevler', desc: 'Takip et', icon: ICONS.tasks },
          ].map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="card group p-4 transition-colors hover:border-rule-strong"
            >
              <span className="mb-3 inline-flex text-ink-3 transition-colors group-hover:text-accent-ink">
                <Icon path={q.icon} />
              </span>
              <p className="text-sm font-medium">{q.label}</p>
              <p className="text-xs text-ink-3">{q.desc}</p>
            </Link>
          ))}
        </nav>
      </div>
    </AppShell>
  );
}
