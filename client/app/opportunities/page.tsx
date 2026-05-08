'use client';

import { useState, useEffect, useMemo } from 'react';
import AppShell from '@/components/AppShell';
import api from '@/lib/axios';
import { toast } from '@/components/Toast';
import EmptyState from '@/components/EmptyState';

interface Customer { _id: string; firstName: string; lastName: string; company?: string; }
interface Opportunity {
  _id: string; title: string; customerId: Customer;
  amount: number; stage: Stage; probability: number;
  expectedCloseDate?: string; description?: string;
}

type Stage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';

const STAGES: { key: Stage; label: string; color: string; bg: string; dot: string }[] = [
  { key: 'lead',        label: 'Lead',       color: 'text-slate-600',   bg: 'bg-slate-100',   dot: 'bg-slate-400' },
  { key: 'qualified',   label: 'Nitelikli',  color: 'text-blue-700',    bg: 'bg-blue-50',     dot: 'bg-blue-500' },
  { key: 'proposal',    label: 'Teklif',     color: 'text-violet-700',  bg: 'bg-violet-50',   dot: 'bg-violet-500' },
  { key: 'negotiation', label: 'Müzakere',   color: 'text-amber-700',   bg: 'bg-amber-50',    dot: 'bg-amber-500' },
  { key: 'closed-won',  label: 'Kazanıldı',  color: 'text-emerald-700', bg: 'bg-emerald-50',  dot: 'bg-emerald-500' },
  { key: 'closed-lost', label: 'Kaybedildi', color: 'text-rose-700',    bg: 'bg-rose-50',     dot: 'bg-rose-400' },
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

  const handleDelete = async (id: string) => {
    if (!confirm('Bu fırsatı silmek istediğinize emin misiniz?')) return;
    await api.delete(`/opportunities/${id}`);
    toast.success('Fırsat silindi');
    fetchOpportunities();
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
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fırsatlar</h1>
            <p className="text-slate-500 text-sm mt-1">{opportunities.length} fırsat</p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex bg-slate-100 p-1 rounded-xl gap-0.5">
              <button onClick={() => setView('kanban')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${view === 'kanban' ? 'bg-white text-slate-900 shadow-card' : 'text-slate-500 hover:text-slate-700'}`}>Kanban</button>
              <button onClick={() => setView('list')}   className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${view === 'list'   ? 'bg-white text-slate-900 shadow-card' : 'text-slate-500 hover:text-slate-700'}`}>Liste</button>
            </div>
            <button onClick={() => { setShowForm(true); setEditingId(null); setFormData(emptyForm); }} className="btn-primary">+ Yeni Fırsat</button>
          </div>
        </div>

        {/* Summary bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Toplam Pipeline', value: fmt(totalPipeline), sub: 'aktif fırsatlar', color: 'text-brand-600' },
            { label: 'Kazanılan', value: fmt(wonValue), sub: 'closed-won toplamı', color: 'text-emerald-600' },
            { label: 'Kazanma Oranı', value: `%${winRate}`, sub: `${totalClosed} kapanan fırsattan`, color: 'text-amber-600' },
            { label: 'Aktif Fırsat', value: String(opportunities.filter(o => o.stage !== 'closed-won' && o.stage !== 'closed-lost').length), sub: 'devam eden', color: 'text-blue-600' },
          ].map(s => (
            <div key={s.label} className="card px-4 py-3">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">{s.label}</p>
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-400">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-5 max-w-sm">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Başlık veya müşteri ara..." className="input pl-10" />
        </div>

        {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}

        {/* Form */}
        {showForm && (
          <div className="card p-6 mb-6 animate-slide-up">
            <h2 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wide">{editingId ? 'Fırsat Düzenle' : 'Yeni Fırsat'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-widest">Fırsat Başlığı *</label>
                  <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Örn: ABC Teknoloji - Yazılım Lisansı" className="input" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-widest">Müşteri *</label>
                  <select required value={formData.customerId} onChange={e => setFormData({ ...formData, customerId: e.target.value })} className="input">
                    <option value="">Müşteri seçin...</option>
                    {customers.map(c => <option key={c._id} value={c._id}>{c.firstName} {c.lastName} {c.company ? `(${c.company})` : ''}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-widest">Tutar (₺) *</label>
                  <input required type="number" min="0" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-widest">Aşama</label>
                  <select value={formData.stage} onChange={e => setFormData({ ...formData, stage: e.target.value as Stage })} className="input">
                    {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-widest">Olasılık (%)</label>
                  <input type="number" min="0" max="100" value={formData.probability} onChange={e => setFormData({ ...formData, probability: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-widest">Tahmini Kapanış</label>
                  <input type="date" value={formData.expectedCloseDate} onChange={e => setFormData({ ...formData, expectedCloseDate: e.target.value })} className="input" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-widest">Açıklama</label>
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
            {[...Array(6)].map((_, i) => <div key={i} className="flex-shrink-0 w-52 card p-3 h-40 animate-pulse"><div className="h-3 bg-slate-100 rounded w-2/3 mb-4" /><div className="h-20 bg-slate-50 rounded" /></div>)}
          </div>
        ) : view === 'kanban' ? (
          <div className="flex gap-3 overflow-x-auto pb-4">
            {STAGES.map(stage => {
              const cols = filtered.filter(o => o.stage === stage.key);
              const colTotal = cols.reduce((s, o) => s + o.amount, 0);
              return (
                <div key={stage.key} className="flex-shrink-0 w-52">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${stage.dot}`} />
                      <span className="text-xs font-semibold text-slate-700">{stage.label}</span>
                      <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{cols.length}</span>
                    </div>
                    <span className="text-xs text-slate-400">{fmt(colTotal)}</span>
                  </div>
                  <div
                    className={`rounded-xl p-2 min-h-32 space-y-2 transition-all ${dragOverStage === stage.key ? 'bg-brand-50 ring-2 ring-brand-300 ring-offset-1' : 'bg-slate-100'}`}
                    onDragOver={e => handleDragOver(e, stage.key)}
                    onDragLeave={() => setDragOverStage(null)}
                    onDrop={e => handleDrop(e, stage.key)}
                  >
                    {cols.map(o => (
                      <div key={o._id} draggable onDragStart={e => handleDragStart(e, o._id)}
                        className="bg-white rounded-xl p-3 shadow-card cursor-grab active:cursor-grabbing active:opacity-50 hover:shadow-card-hover transition group">
                        <p className="text-xs font-semibold text-slate-900 mb-1 leading-snug">{o.title}</p>
                        <p className="text-xs text-slate-400 mb-2 truncate">{o.customerId.firstName} {o.customerId.lastName}</p>
                        <p className="text-sm font-bold text-brand-600 mb-2">{fmt(o.amount)}</p>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(o)} className="text-xs text-brand-600 hover:underline">Düzenle</button>
                          <span className="text-slate-200">·</span>
                          <button onClick={() => handleDelete(o._id)} className="text-xs text-rose-500 hover:underline">Sil</button>
                        </div>
                      </div>
                    ))}
                    {cols.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-20 gap-1.5">
                        <div className="w-6 h-6 rounded-full border-2 border-dashed border-slate-300" />
                        <span className="text-xs text-slate-300">Boş</span>
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
                      <td className="text-sm font-medium text-slate-900">{o.title}</td>
                      <td className="text-sm text-slate-600">
                        {o.customerId.firstName} {o.customerId.lastName}
                        {o.customerId.company && <div className="text-xs text-slate-400">{o.customerId.company}</div>}
                      </td>
                      <td className="text-sm font-semibold text-brand-600">{fmt(o.amount)}</td>
                      <td>
                        <select value={o.stage} onChange={e => handleStageChange(o._id, e.target.value as Stage)} className={`badge border-0 cursor-pointer ${s.bg} ${s.color}`}>
                          {STAGES.map(st => <option key={st.key} value={st.key}>{st.label}</option>)}
                        </select>
                      </td>
                      <td className="text-sm text-slate-500">%{o.probability}</td>
                      <td className="text-sm text-slate-500">{o.expectedCloseDate ? new Date(o.expectedCloseDate).toLocaleDateString('tr-TR') : '—'}</td>
                      <td className="text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(o)} className="px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50 rounded-lg transition">Düzenle</button>
                          <button onClick={() => handleDelete(o._id)} className="px-3 py-1.5 text-xs font-medium text-rose-500 hover:bg-rose-50 rounded-lg transition">Sil</button>
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
    </AppShell>
  );
}
