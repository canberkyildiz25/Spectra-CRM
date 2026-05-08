'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';
import api from '@/lib/axios';

interface Stats {
  customers: { total: number; active: number };
  tasks: { total: number; pending: number; completed: number };
  users: { total: number };
  opportunities: { total: number; won: number; pipelineValue: number; wonValue: number };
  proposals: { total: number; accepted: number; acceptedValue: number };
  recentTasks: { _id: string; title: string; status: string; priority: string; dueDate: string }[];
  recentCustomers: { _id: string; firstName: string; lastName: string; company: string; status: string }[];
}

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);

const fmtShort = (n: number) => {
  if (n >= 1_000_000) return `₺${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₺${(n / 1_000).toFixed(0)}K`;
  return fmt(n);
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Günaydın';
  if (h < 18) return 'İyi öğleden sonralar';
  return 'İyi akşamlar';
};

const priorityBadge: Record<string, string> = {
  high: 'bg-rose-50 text-rose-600', medium: 'bg-amber-50 text-amber-600', low: 'bg-emerald-50 text-emerald-600',
};
const priorityLabel: Record<string, string> = { high: 'Yüksek', medium: 'Orta', low: 'Düşük' };
const statusBadge: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700', 'in-progress': 'bg-blue-50 text-blue-700',
  completed: 'bg-emerald-50 text-emerald-700', customer: 'bg-emerald-50 text-emerald-700',
  prospect: 'bg-blue-50 text-blue-700', inactive: 'bg-slate-100 text-slate-500',
};
const statusLabel: Record<string, string> = {
  pending: 'Bekliyor', 'in-progress': 'Devam', completed: 'Tamam',
  customer: 'Müşteri', prospect: 'Aday', inactive: 'Pasif',
};

const avatarColors = [
  'linear-gradient(135deg,#059669,#10b981)',
  'linear-gradient(135deg,#0284c7,#0ea5e9)',
  'linear-gradient(135deg,#7c3aed,#a78bfa)',
  'linear-gradient(135deg,#d97706,#f59e0b)',
  'linear-gradient(135deg,#be185d,#f43f5e)',
];
const avatarColor = (name: string) => avatarColors[name.charCodeAt(0) % avatarColors.length];

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats').then(r => setStats(r.data.data)).finally(() => setLoading(false));
  }, []);

  const winRate = stats
    ? stats.opportunities.won > 0 && stats.opportunities.total > 0
      ? Math.round((stats.opportunities.won / stats.opportunities.total) * 100)
      : 0
    : 0;

  const taskRate = stats && stats.tasks.total > 0
    ? Math.round((stats.tasks.completed / stats.tasks.total) * 100)
    : 0;

  return (
    <AppShell>
      <div className="animate-fade-in">

        {/* ── Hero banner ─────────────────────────────── */}
        <div className="relative overflow-hidden px-8 pt-8 pb-10"
          style={{ background: 'linear-gradient(135deg, #0d1117 0%, #0f172a 60%, #064e3b22 100%)' }}>
          {/* Ambient glows */}
          <div className="absolute top-0 right-0 w-80 h-80 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at top right, rgba(16,185,129,.12) 0%, transparent 65%)' }} />
          <div className="absolute bottom-0 left-40 w-60 h-32 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at bottom, rgba(16,185,129,.07) 0%, transparent 70%)' }} />

          <div className="relative max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-emerald-400 text-sm font-medium mb-1 tracking-wide">
                  {greeting()}, {user?.firstName}
                </p>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  Satış Kontrol Merkezi
                </h1>
                <p className="text-slate-500 text-sm mt-2">
                  {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              {/* Hero inline stats */}
              {!loading && stats && (
                <div className="flex gap-6">
                  {[
                    { label: 'Pipeline', value: fmtShort(stats.opportunities.pipelineValue), color: '#10b981' },
                    { label: 'Kazanılan', value: fmtShort(stats.opportunities.wonValue), color: '#38bdf8' },
                    { label: 'Teklif Kabul', value: `${stats.proposals.accepted}/${stats.proposals.total}`, color: '#a78bfa' },
                  ].map(s => (
                    <div key={s.label} className="text-center">
                      <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-8 py-7 max-w-6xl mx-auto space-y-6">

          {loading ? <SkeletonDashboard /> : (
            <div className="space-y-6 animate-slide-up">

              {/* ── KPI cards ─────────────────────────── */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard
                  label="Toplam Müşteri"
                  value={stats!.customers.total}
                  sub={`${stats!.customers.active} aktif`}
                  gradient="linear-gradient(135deg, #059669 0%, #10b981 100%)"
                  glow="rgba(16,185,129,.3)"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                />
                <KpiCard
                  label="Fırsat Pipeline"
                  value={stats!.opportunities.total}
                  sub={`${stats!.opportunities.won} kazanıldı`}
                  gradient="linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)"
                  glow="rgba(14,165,233,.25)"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  }
                />
                <KpiCard
                  label="Görev Tamamlama"
                  value={`%${taskRate}`}
                  sub={`${stats!.tasks.completed}/${stats!.tasks.total} görev`}
                  gradient="linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)"
                  glow="rgba(167,139,250,.25)"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
                <KpiCard
                  label="Kazanma Oranı"
                  value={`%${winRate}`}
                  sub={`${stats!.opportunities.won} fırsat kazanıldı`}
                  gradient="linear-gradient(135deg, #d97706 0%, #f59e0b 100%)"
                  glow="rgba(245,158,11,.25)"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  }
                />
              </div>

              {/* ── Pipeline + Teklif bar ──────────────── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricBar
                  label="Fırsat Pipeline"
                  value={fmtShort(stats!.opportunities.pipelineValue)}
                  sub={`${stats!.opportunities.total} aktif fırsat`}
                  progress={winRate}
                  color="#10b981"
                  colorLight="rgba(16,185,129,.1)"
                />
                <MetricBar
                  label="Kazanılan Gelir"
                  value={fmtShort(stats!.opportunities.wonValue)}
                  sub={`${stats!.opportunities.won} anlaşma tamamlandı`}
                  progress={winRate}
                  color="#38bdf8"
                  colorLight="rgba(56,189,248,.1)"
                />
                <MetricBar
                  label="Kabul Edilen Teklifler"
                  value={fmtShort(stats!.proposals.acceptedValue)}
                  sub={`${stats!.proposals.accepted} / ${stats!.proposals.total} teklif`}
                  progress={stats!.proposals.total > 0 ? Math.round(stats!.proposals.accepted / stats!.proposals.total * 100) : 0}
                  color="#a78bfa"
                  colorLight="rgba(167,139,250,.1)"
                />
              </div>

              {/* ── Recent lists ──────────────────────── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card p-0 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <h2 className="text-sm font-semibold text-slate-800">Son Görevler</h2>
                    </div>
                    <Link href="/tasks" className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">Tümünü gör →</Link>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {!stats?.recentTasks.length ? (
                      <p className="text-sm text-slate-400 py-8 text-center">Henüz görev yok</p>
                    ) : stats.recentTasks.map(t => (
                      <div key={t._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.priority === 'high' ? 'bg-rose-400' : t.priority === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                        <span className="text-sm text-slate-700 truncate flex-1">{t.title}</span>
                        <span className={`badge ${statusBadge[t.status]}`}>{statusLabel[t.status]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card p-0 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <h2 className="text-sm font-semibold text-slate-800">Son Müşteriler</h2>
                    </div>
                    <Link href="/customers" className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">Tümünü gör →</Link>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {!stats?.recentCustomers.length ? (
                      <p className="text-sm text-slate-400 py-8 text-center">Henüz müşteri yok</p>
                    ) : stats.recentCustomers.map(c => (
                      <div key={c._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                          style={{ background: avatarColor(c.firstName) }}>
                          {c.firstName[0]}{c.lastName[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{c.firstName} {c.lastName}</p>
                          {c.company && <p className="text-xs text-slate-400 truncate">{c.company}</p>}
                        </div>
                        <span className={`badge ${statusBadge[c.status]}`}>{statusLabel[c.status]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Quick actions ─────────────────────── */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { href: '/customers',     label: 'Müşteriler',  desc: 'Listele ve yönet',   gradient: 'linear-gradient(135deg,#059669,#10b981)', icon: '👥' },
                  { href: '/opportunities', label: 'Fırsatlar',   desc: 'Pipeline & Kanban',  gradient: 'linear-gradient(135deg,#0284c7,#0ea5e9)', icon: '📈' },
                  { href: '/proposals',     label: 'Teklifler',   desc: 'Oluştur ve gönder',  gradient: 'linear-gradient(135deg,#7c3aed,#a78bfa)', icon: '📄' },
                  { href: '/tasks',         label: 'Görevler',    desc: 'Takip et',           gradient: 'linear-gradient(135deg,#d97706,#f59e0b)', icon: '✅' },
                ].map(q => (
                  <Link key={q.href} href={q.href}
                    className="card p-5 group cursor-pointer flex flex-col gap-3 overflow-hidden relative"
                    style={{ border: '1px solid #f1f5f9' }}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{ background: `${q.gradient}08` }} />
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ background: `${q.gradient}18` }}>
                      {q.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">{q.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{q.desc}</p>
                    </div>
                    <p className="text-xs font-semibold mt-auto transition-transform group-hover:translate-x-0.5"
                      style={{ background: q.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      Devam Et →
                    </p>
                  </Link>
                ))}
              </div>

            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

/* ─── Sub-components ──────────────────────────────────────── */

function KpiCard({ label, value, sub, icon, gradient, glow }: {
  label: string; value: number | string; sub: string;
  icon: React.ReactNode; gradient: string; glow: string;
}) {
  return (
    <div className="rounded-2xl p-5 relative overflow-hidden text-white"
      style={{ background: gradient, boxShadow: `0 4px 24px -4px ${glow}, 0 1px 3px rgba(0,0,0,.15)` }}>
      <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/[0.07]" />
      <div className="absolute -right-2 -bottom-6 w-24 h-24 rounded-full bg-white/[0.04]" />
      <div className="relative">
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-4 backdrop-blur-sm">
          {icon}
        </div>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        <p className="text-[13px] font-medium mt-1 text-white/80">{label}</p>
        <p className="text-xs text-white/50 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

function MetricBar({ label, value, sub, progress, color, colorLight }: {
  label: string; value: string; sub: string;
  progress: number; color: string; colorLight: string;
}) {
  return (
    <div className="card px-5 py-4" style={{ borderLeft: `3px solid ${color}` }}>
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xl font-bold text-slate-900 mb-0.5">{value}</p>
      <p className="text-xs text-slate-400 mb-3">{sub}</p>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: colorLight }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(progress, 100)}%`, background: color }} />
      </div>
      <p className="text-[11px] mt-1.5 font-medium" style={{ color }}>%{progress}</p>
    </div>
  );
}

function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="rounded-2xl h-32 bg-slate-200" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="card p-5 h-24" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => <div key={i} className="card h-48" />)}
      </div>
    </div>
  );
}
