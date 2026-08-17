'use client';

import { useState, useEffect, useMemo } from 'react';
import AppShell from '@/components/AppShell';
import api from '@/lib/axios';
import { toast } from '@/components/Toast';
import EmptyState from '@/components/EmptyState';
import ConfirmDelete from '@/components/ConfirmDelete';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Customer { _id: string; firstName: string; lastName: string; company?: string; }
interface Opportunity {
  _id: string; title: string; customerId: Customer;
  amount: number; stage: Stage; probability: number;
  expectedCloseDate?: string; description?: string;
}

type Stage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';

/* The old table hard-coded Tailwind's own palette — slate-100, blue-50,
   violet-50, emerald-50. Those are light-mode literals: they stayed white in
   dark mode, which is why the board came out as white cards on a dark page.
   They also spent six unrelated hues on what is really one ordered sequence.

   The four open stages now walk the ordinal ramp, so the pipeline reads as
   progression rather than as six categories. Only the two terminal states carry
   meaning-bearing colour, and `closed-lost` is grey, not red — a lost deal is a
   normal business outcome, not an alarm. */
const STAGES: { key: Stage; label: string; tone: string }[] = [
  { key: 'lead',        label: 'Lead',       tone: 'var(--chart-1)' },
  { key: 'qualified',   label: 'Nitelikli',  tone: 'var(--chart-2)' },
  { key: 'proposal',    label: 'Teklif',     tone: 'var(--chart-3)' },
  { key: 'negotiation', label: 'Müzakere',   tone: 'var(--chart-4)' },
  { key: 'closed-won',  label: 'Kazanıldı',  tone: 'var(--positive)' },
  { key: 'closed-lost', label: 'Kaybedildi', tone: 'var(--quiet)' },
];

const emptyForm = { title: '', customerId: '', amount: '', stage: 'lead' as Stage, probability: '10', expectedCloseDate: '', description: '' };
const fmt = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);

export default function Opportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [dragOverStage, setDragOverStage] = useState<Stage | null>(null);
  const [search, setSearch] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Opportunity | null>(null);

  useEffect(() => {
    Promise.all([
      api.get('/opportunities').then(r => setOpportunities(r.data.data)),
      api.get('/customers?limit=100').then(r => setCustomers(r.data.data.customers)),
    ]).finally(() => setLoading(false));
  }, []);

  const fetchOpportunities = async () => {
    const res = await api.get('/opportunities');
    setOpportunities(res.data.data);
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return opportunities;
    const q = search.toLowerCase();
    return opportunities.filter(o =>
      o.title.toLowerCase().includes(q) ||
      `${o.customerId.firstName} ${o.customerId.lastName}`.toLowerCase().includes(q) ||
      (o.customerId.company || '').toLowerCase().includes(q)
    );
  }, [opportunities, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const payload = { ...formData, amount: Number(formData.amount), probability: Number(formData.probability) };
      if (editingId) { await api.put(`/opportunities/${editingId}`, payload); toast.success('Fırsat güncellendi'); }
      else { await api.post('/opportunities', payload); toast.success('Fırsat oluşturuldu'); }
      setShowForm(false); setEditingId(null); setFormData(emptyForm); fetchOpportunities();
    } catch (err: any) { setError(err.response?.data?.error || 'Kayıt başarısız'); } finally { setSaving(false); }
  };

  const handleEdit = (o: Opportunity) => {
    setFormData({ title: o.title, customerId: o.customerId._id, amount: String(o.amount), stage: o.stage, probability: String(o.probability), expectedCloseDate: o.expectedCloseDate ? o.expectedCloseDate.split('T')[0] : '', description: o.description || '' });
    setEditingId(o._id); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    const { _id } = pendingDelete;
    setPendingDelete(null);
    try {
      await api.delete(`/opportunities/${_id}`);
      toast.success('Fırsat silindi');
      fetchOpportunities();
    } catch {
      setError('Silme başarısız');
    }
  };

  const handleStageChange = async (id: string, stage: Stage) => {
    const probMap: Record<Stage, number> = { lead: 10, qualified: 25, proposal: 50, negotiation: 75, 'closed-won': 100, 'closed-lost': 0 };
    await api.put(`/opportunities/${id}`, { stage, probability: probMap[stage] });
    toast.success('Aşama güncellendi');
    fetchOpportunities();
  };

  const handleDragStart = (e: React.DragEvent, id: string) => { e.dataTransfer.setData('opportunityId', id); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver = (e: React.DragEvent, stage: Stage) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverStage(stage); };
  const handleDrop = async (e: React.DragEvent, stage: Stage) => {
    e.preventDefault(); setDragOverStage(null);
    const id = e.dataTransfer.getData('opportunityId');
    const opp = opportunities.find(o => o._id === id);
    if (!opp || opp.stage === stage) return;
    await handleStageChange(id, stage);
  };

  // Summary stats
  const totalPipeline = opportunities.filter(o => o.stage !== 'closed-lost').reduce((s, o) => s + o.amount, 0);
  const wonValue = opportunities.filter(o => o.stage === 'closed-won').reduce((s, o) => s + o.amount, 0);
  const totalClosed = opportunities.filter(o => o.stage === 'closed-won' || o.stage === 'closed-lost').length;
  const winRate = totalClosed > 0 ? Math.round((opportunities.filter(o => o.stage === 'closed-won').length / totalClosed) * 100) : 0;

  return (
    <AppShell>
      <div className="px-8 py-8 max-w-full animate-fade-in">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="label mb-2">Pipeline</p>
            <h1 className="text-2xl sm:text-3xl">Fırsatlar</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              <span className="figure">{opportunities.length}</span> fırsat
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {/* The same segmented control the customers page uses for its status
                filter — one pattern for "pick one of these", not a bespoke pill
                row per page. */}
            <div className="segmented" role="group" aria-label="Görünüm">
              <button onClick={() => setView('kanban')} aria-pressed={view === 'kanban'} className="segmented-item">Kanban</button>
              <button onClick={() => setView('list')} aria-pressed={view === 'list'} className="segmented-item">Liste</button>
            </div>
            <button onClick={() => { setShowForm(true); setEditingId(null); setFormData(emptyForm); }} className="btn-primary">
              Fırsat ekle
            </button>
          </div>
        </div>

        {/* Summary bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {/* Four figures in four different colours told the reader nothing —
              the hue was decoration, not meaning. Figures are plain; the label
              above them is what distinguishes one card from the next. */}
          {[
            { label: 'Toplam Pipeline', value: fmt(totalPipeline), sub: 'aktif fırsatlar' },
            { label: 'Kazanılan', value: fmt(wonValue), sub: 'closed-won toplamı' },
            { label: 'Kazanma Oranı', value: `%${winRate}`, sub: `${totalClosed} kapanan fırsattan` },
            { label: 'Aktif Fırsat', value: String(opportunities.filter(o => o.stage !== 'closed-won' && o.stage !== 'closed-lost').length), sub: 'devam eden' },
          ].map(s => (
            <div key={s.label} className="card px-4 py-3">
              <p className="label mb-1">{s.label}</p>
              <p className="figure text-lg font-medium text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-5 max-w-sm">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Başlık veya müşteri ara..." className="input pl-10" />
        </div>

        {error && <div role="alert" className="notice mb-5">{error}</div>}

        {/* Form */}
        {showForm && (
          <div className="card p-6 mb-6 animate-slide-up">
            <h2 className="label mb-5">{editingId ? 'Fırsat Düzenle' : 'Yeni Fırsat'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="label block mb-1.5">Fırsat Başlığı *</label>
                  <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Örn: ABC Teknoloji - Yazılım Lisansı" className="input" />
                </div>
                <div>
                  <label className="label block mb-1.5">Müşteri *</label>
                  <select required value={formData.customerId} onChange={e => setFormData({ ...formData, customerId: e.target.value })} className="input">
                    <option value="">Müşteri seçin...</option>
                    {customers.map(c => <option key={c._id} value={c._id}>{c.firstName} {c.lastName} {c.company ? `(${c.company})` : ''}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label block mb-1.5">Tutar (₺) *</label>
                  <input required type="number" min="0" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="label block mb-1.5">Aşama</label>
                  <select value={formData.stage} onChange={e => setFormData({ ...formData, stage: e.target.value as Stage })} className="input">
                    {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label block mb-1.5">Olasılık (%)</label>
                  <input type="number" min="0" max="100" value={formData.probability} onChange={e => setFormData({ ...formData, probability: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="label block mb-1.5">Tahmini Kapanış</label>
                  <input type="date" value={formData.expectedCloseDate} onChange={e => setFormData({ ...formData, expectedCloseDate: e.target.value })} className="input" />
                </div>
                <div className="md:col-span-2">
                  <label className="label block mb-1.5">Açıklama</label>
                  <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={2} className="input resize-none" />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Kaydediliyor...' : editingId ? 'Güncelle' : 'Kaydet'}</button>
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setFormData(emptyForm); }} className="btn-secondary">İptal</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex gap-3">
            {[...Array(6)].map((_, i) => <div key={i} className="flex-shrink-0 w-52 card p-3 h-40 animate-pulse"><div className="mb-4 h-3 w-2/3 rounded bg-muted" /><div className="h-20 rounded bg-muted" /></div>)}
          </div>
        ) : view === 'kanban' ? (
          <div className="flex gap-3 overflow-x-auto pb-4">
            {STAGES.map(stage => {
              const cols = filtered.filter(o => o.stage === stage.key);
              const colTotal = cols.reduce((s, o) => s + o.amount, 0);
              return (
                <div key={stage.key} className="w-56 flex-shrink-0">
                  <div className="mb-2 flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        aria-hidden
                        className="h-2 w-2 rounded-full"
                        style={{ background: stage.tone }}
                      />
                      <span className="text-xs font-medium text-foreground">{stage.label}</span>
                      <span className="figure rounded-full bg-muted px-1.5 py-0.5 text-[0.6875rem] text-muted-foreground">
                        {cols.length}
                      </span>
                    </div>
                    <span className="figure text-[0.6875rem] text-muted-foreground">{fmt(colTotal)}</span>
                  </div>
                  {/* `--well` is stated per theme — see tokens.css for why an
                      alpha of the foreground could not do this job. */}
                  <div
                    className={`min-h-32 space-y-2 rounded-xl border p-2 transition-colors duration-fast ease-out ${
                      dragOverStage === stage.key
                        ? 'border-ring bg-well-active'
                        : 'border-transparent bg-well'
                    }`}
                    onDragOver={e => handleDragOver(e, stage.key)}
                    onDragLeave={() => setDragOverStage(null)}
                    onDrop={e => handleDrop(e, stage.key)}
                  >
                    {cols.map(o => (
                      <div
                        key={o._id}
                        draggable
                        onDragStart={e => handleDragStart(e, o._id)}
                        className="group cursor-grab rounded-lg border border-border bg-card p-3 transition-shadow duration-fast ease-out hover:shadow-[var(--shadow-pop)] active:cursor-grabbing active:opacity-60"
                      >
                        <p className="mb-1 text-xs font-medium leading-snug text-card-foreground">{o.title}</p>
                        <p className="mb-2 truncate text-xs text-muted-foreground">
                          {o.customerId.firstName} {o.customerId.lastName}
                        </p>
                        <div className="flex items-center justify-between gap-2">
                          <p className="figure text-sm font-medium text-foreground">{fmt(o.amount)}</p>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label={`${o.title} için işlemler`}>
                                <MoreHorizontal />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => handleEdit(o)}>
                                <Pencil />
                                Düzenle
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onSelect={() => setTimeout(() => setPendingDelete(o), 0)}
                              >
                                <Trash2 />
                                Sil
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                    {cols.length === 0 && (
                      <div className="flex h-20 items-center justify-center">
                        <span className="text-xs text-muted-foreground">Boş</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState variant="opportunities" ctaLabel="İlk fırsatı ekle" onCta={() => setShowForm(true)} />
        ) : (
          <div className="card overflow-hidden">
            <table className="min-w-full data-table">
              <thead><tr>
                <th>Başlık</th><th>Müşteri</th><th>Tutar</th><th>Aşama</th><th>Olasılık</th><th>Kapanış</th><th />
              </tr></thead>
              <tbody>
                {filtered.map(o => {
                  const s = STAGES.find(s => s.key === o.stage)!;
                  return (
                    <tr key={o._id} className="group">
                      <td className="text-sm font-medium text-foreground">{o.title}</td>
                      <td className="text-sm text-muted-foreground">
                        {o.customerId.firstName} {o.customerId.lastName}
                        {o.customerId.company && <div className="text-xs text-muted-foreground">{o.customerId.company}</div>}
                      </td>
                      <td className="figure text-sm font-medium text-foreground">{fmt(o.amount)}</td>
                      <td>
                        {/* The dot carries the stage; the select stays a plain
                            control. Tinting the select itself meant the colour
                            moved every time the value changed, and the tint was
                            a light-mode literal that never went dark. */}
                        <div className="flex items-center gap-2">
                          <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.tone }} />
                          <select
                            value={o.stage}
                            onChange={e => handleStageChange(o._id, e.target.value as Stage)}
                            aria-label={`${o.title} aşaması`}
                            className="cursor-pointer rounded-md border border-border bg-transparent py-0.5 pl-1.5 pr-6 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {STAGES.map(st => <option key={st.key} value={st.key}>{st.label}</option>)}
                          </select>
                        </div>
                      </td>
                      <td className="figure text-sm text-muted-foreground">%{o.probability}</td>
                      <td className="figure text-sm text-muted-foreground">{o.expectedCloseDate ? new Date(o.expectedCloseDate).toLocaleDateString('tr-TR') : '—'}</td>
                      <td className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label={`${o.title} için işlemler`}>
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => handleEdit(o)}>
                              <Pencil />
                              Düzenle
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={() => setTimeout(() => setPendingDelete(o), 0)}
                            >
                              <Trash2 />
                              Sil
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDelete
        target={pendingDelete}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        name={(o) => o.title}
        detail={(o) =>
          `${o.customerId.firstName} ${o.customerId.lastName} için açılan ${fmt(o.amount)} tutarındaki fırsat kaldırılır.`
        }
      />
    </AppShell>
  );
}
