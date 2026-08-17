'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import Link from 'next/link';
import api from '@/lib/axios';
import { toast } from '@/components/Toast';
import EmptyState from '@/components/EmptyState';

interface Proposal {
  _id: string; proposalNumber: string; title: string;
  customerId: { firstName: string; lastName: string; company?: string };
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  validUntil: string; items: { unitPrice: number; quantity: number }[]; taxRate: number; createdAt: string;
}

const statusLabel: Record<string, string> = { draft: 'Taslak', sent: 'Gönderildi', accepted: 'Kabul', rejected: 'Red' };
const statusStyle: Record<string, { badge: string; dot: string }> = {
  draft:    { badge: 'badge-quiet',    dot: 'var(--quiet)' },
  sent:     { badge: 'badge-accent',   dot: 'var(--chart-2)' },
  accepted: { badge: 'badge-positive', dot: 'var(--positive)' },
  rejected: { badge: 'badge-quiet',    dot: 'var(--quiet)' },
};

const fmt = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);
const calcTotal = (p: Proposal) => p.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0) * (1 + p.taxRate / 100);

export default function Proposals() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    api.get('/proposals').then(r => setProposals(r.data.data)).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Bu teklifi silmek istediğinize emin misiniz?')) return;
    await api.delete(`/proposals/${id}`);
    setProposals(p => p.filter(x => x._id !== id));
    toast.success('Teklif silindi');
  };

  const handleStatusChange = async (id: string, status: string) => {
    await api.put(`/proposals/${id}`, { status });
    setProposals(p => p.map(x => x._id === id ? { ...x, status: status as any } : x));
    toast.success('Durum güncellendi');
  };

  const filtered = proposals.filter(p => {
    const q = `${p.title} ${p.proposalNumber} ${p.customerId.firstName} ${p.customerId.lastName} ${p.customerId.company || ''}`.toLowerCase();
    return (search === '' || q.includes(search.toLowerCase())) &&
           (statusFilter === 'all' || p.status === statusFilter);
  });

  const acceptedTotal = proposals.filter(p => p.status === 'accepted').reduce((s, p) => s + calcTotal(p), 0);
  const sentTotal = proposals.filter(p => p.status === 'sent').reduce((s, p) => s + calcTotal(p), 0);

  return (
    <AppShell>
      <div className="animate-fade-in">

        {/* ── Page header ─────────────────────────── */}
        <div className="relative overflow-hidden px-8 pt-7 pb-8"
          style={{ background: 'linear-gradient(135deg, #0d1117 0%, #0f172a 60%, #06336422 100%)' }}>
          <div className="absolute top-0 right-0 w-72 h-40 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at top right, rgba(167,139,250,.1) 0%, transparent 65%)' }} />
          <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="label mb-1">Belgeler</p>
              <h1 className="text-2xl font-bold text-white tracking-tight">Satış Teklifleri</h1>
              <p className="text-muted-foreground text-sm mt-1">{proposals.length} teklif · {fmt(acceptedTotal)} kabul edildi</p>
            </div>
            <Link href="/proposals/new" className="btn-primary self-start md:self-auto">
              + Yeni Teklif
            </Link>
          </div>
        </div>

        <div className="px-8 py-6 max-w-6xl mx-auto space-y-5">

          {/* ── Summary pills ───────────────────────── */}
          {!loading && proposals.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Hex literals — #3b82f6, #10b981 — could not follow the theme,
                  and colouring each label a different hue turned four filter
                  buttons into a rainbow that carried no information. Selection
                  is shown by the ring, which is what selection means everywhere
                  else in the app. */}
              {[
                { key: 'all',      label: 'Toplam',     count: proposals.length,                                      value: proposals.reduce((s, p) => s + calcTotal(p), 0) },
                { key: 'sent',     label: 'Gönderildi', count: proposals.filter(p => p.status === 'sent').length,     value: sentTotal },
                { key: 'accepted', label: 'Kabul',      count: proposals.filter(p => p.status === 'accepted').length, value: acceptedTotal },
                { key: 'rejected', label: 'Red',        count: proposals.filter(p => p.status === 'rejected').length, value: proposals.filter(p => p.status === 'rejected').reduce((s, p) => s + calcTotal(p), 0) },
              ].map(s => (
                <button
                  key={s.key}
                  onClick={() => setStatusFilter(statusFilter === s.key ? 'all' : s.key)}
                  aria-pressed={statusFilter === s.key}
                  className={`card px-4 py-3 text-left transition-colors duration-fast ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    statusFilter === s.key ? 'border-ring ring-1 ring-ring' : 'hover:border-ring/40'
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="label">{s.label}</span>
                    <span className="figure text-lg font-medium text-foreground">{s.count}</span>
                  </div>
                  <p className="figure text-xs text-muted-foreground">{fmt(s.value)}</p>
                </button>
              ))}
            </div>
          )}

          {/* ── Filters ─────────────────────────────── */}
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-sm">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Teklif ara..." className="input pl-10" />
            </div>
          </div>

          {/* ── Table ───────────────────────────────── */}
          {loading ? (
            <div className="card overflow-hidden">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-6 px-5 py-4 border-b border-border animate-pulse">
                  <div className="h-3 bg-muted rounded w-24" />
                  <div className="h-3 bg-muted rounded flex-1" />
                  <div className="h-3 bg-muted rounded w-20" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState variant="proposals" ctaLabel="İlk teklifi oluştur" ctaHref="/proposals/new" />
          ) : (
            <div className="card overflow-hidden">
              <table className="min-w-full data-table">
                <thead>
                  <tr>
                    <th>Teklif No</th>
                    <th>Başlık</th>
                    <th>Müşteri</th>
                    <th>Tutar</th>
                    <th>Durum</th>
                    <th>Geçerlilik</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => {
                    const s = statusStyle[p.status];
                    const isExpired = new Date(p.validUntil) < new Date() && p.status !== 'accepted';
                    return (
                      <tr key={p._id} className="group">
                        <td>
                          <Link href={`/proposals/${p._id}`}
                            className="text-xs font-mono font-bold hover:underline"
                            style={{ color: '#7c3aed' }}>
                            {p.proposalNumber}
                          </Link>
                        </td>
                        <td>
                          <p className="text-sm font-medium text-foreground">{p.title}</p>
                        </td>
                        <td className="text-sm text-muted-foreground">
                          {p.customerId.firstName} {p.customerId.lastName}
                          {p.customerId.company && <div className="text-xs text-muted-foreground">{p.customerId.company}</div>}
                        </td>
                        <td className="figure text-sm font-medium text-foreground">{fmt(calcTotal(p))}</td>
                        <td>
                          {/* Dot for the status, plain control for the change —
                              the same split as the opportunities table. */}
                          <div className="flex items-center gap-2">
                            <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.dot }} />
                            <select
                              value={p.status}
                              onChange={e => handleStatusChange(p._id, e.target.value)}
                              aria-label={`${p.title} durumu`}
                              className="cursor-pointer rounded-md border border-border bg-transparent py-0.5 pl-1.5 pr-6 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              {Object.entries(statusLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                          </div>
                        </td>
                        <td>
                          <span className={`text-sm ${isExpired ? 'text-[var(--caution)] font-medium' : 'text-muted-foreground'}`}>
                            {new Date(p.validUntil).toLocaleDateString('tr-TR')}
                          </span>
                          {isExpired && <div className="text-[10px] text-[var(--caution)]">Süresi doldu</div>}
                        </td>
                        <td className="text-right">
                          <div className="flex justify-end gap-1">
                            <Link href={`/proposals/${p._id}`} className="btn-ghost text-xs">Görüntüle</Link>
                            <Link href={`/proposals/${p._id}/edit`} className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted rounded-lg transition">Düzenle</Link>
                            <button onClick={() => handleDelete(p._id)} className="btn-ghost text-xs">Sil</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
