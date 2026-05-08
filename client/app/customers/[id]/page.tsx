'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import Link from 'next/link';
import api from '@/lib/axios';
import { toast } from '@/components/Toast';

interface Customer {
  _id: string; firstName: string; lastName: string; email: string;
  phone?: string; company?: string; city?: string; country?: string;
  status: 'prospect' | 'customer' | 'inactive'; source?: string; notes?: string; createdAt: string;
}
interface Opportunity {
  _id: string; title: string; amount: number; stage: string; probability: number; expectedCloseDate?: string;
}
interface Proposal {
  _id: string; proposalNumber: string; title: string; status: string;
  validUntil: string; items: { unitPrice: number; quantity: number }[]; taxRate: number;
}

const statusLabel: Record<string, string> = { customer: 'Müşteri', prospect: 'Aday', inactive: 'Pasif' };
const statusBadge: Record<string, string> = { customer: 'bg-emerald-50 text-emerald-700', prospect: 'bg-blue-50 text-blue-700', inactive: 'bg-slate-100 text-slate-500' };
const stageLabel: Record<string, string> = { lead: 'Lead', qualified: 'Nitelikli', proposal: 'Teklif', negotiation: 'Müzakere', 'closed-won': 'Kazanıldı', 'closed-lost': 'Kaybedildi' };
const stageColor: Record<string, string> = { lead: 'bg-slate-100 text-slate-600', qualified: 'bg-blue-50 text-blue-700', proposal: 'bg-violet-50 text-violet-700', negotiation: 'bg-amber-50 text-amber-700', 'closed-won': 'bg-emerald-50 text-emerald-700', 'closed-lost': 'bg-rose-50 text-rose-700' };
const proposalStatusLabel: Record<string, string> = { draft: 'Taslak', sent: 'Gönderildi', accepted: 'Kabul', rejected: 'Red' };
const proposalStatusColor: Record<string, string> = { draft: 'bg-slate-100 text-slate-600', sent: 'bg-blue-50 text-blue-700', accepted: 'bg-emerald-50 text-emerald-700', rejected: 'bg-rose-50 text-rose-700' };
const avatarColors = ['bg-gradient-brand', 'bg-gradient-info', 'bg-gradient-success', 'bg-gradient-warning', 'bg-gradient-rose'];
const avatarColor = (name: string) => avatarColors[name.charCodeAt(0) % avatarColors.length];

const fmt = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium' as 'low' | 'medium' | 'high', dueDate: '' });
  const [taskSaving, setTaskSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/customers/${id}`),
      api.get('/opportunities'),
      api.get('/proposals'),
    ]).then(([cRes, oRes, pRes]) => {
      setCustomer(cRes.data.data);
      setOpportunities((oRes.data.data as any[]).filter((o: any) => o.customerId._id === id || o.customerId === id));
      setProposals((pRes.data.data as any[]).filter((p: any) => p.customerId._id === id || p.customerId === id));
    }).catch(() => router.push('/customers')).finally(() => setLoading(false));
  }, [id]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault(); setTaskSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...taskForm, relatedCustomer: id }),
      });
      if (!res.ok) throw new Error();
      toast.success('Görev oluşturuldu');
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '' });
    } catch { toast.error('Görev oluşturulamadı'); } finally { setTaskSaving(false); }
  };

  if (loading) return (
    <AppShell>
      <div className="px-8 py-8 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-100 rounded w-48" />
          <div className="card p-6 h-40" />
        </div>
      </div>
    </AppShell>
  );

  if (!customer) return null;

  const calcTotal = (p: Proposal) => p.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0) * (1 + p.taxRate / 100);

  return (
    <AppShell>
      <div className="px-8 py-8 max-w-4xl mx-auto animate-fade-in">
        {/* Back */}
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 mb-6 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Müşteriler
        </button>

        {/* Profil + Hızlı Aksiyonlar */}
        <div className="card p-6 mb-5">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl ${avatarColor(customer.firstName)} flex items-center justify-center text-white font-bold text-xl shrink-0`}>
                {customer.firstName[0]}{customer.lastName[0]}
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{customer.firstName} {customer.lastName}</h1>
                {customer.company && <p className="text-sm text-slate-500">{customer.company}</p>}
                <span className={`badge mt-1 ${statusBadge[customer.status]}`}>{statusLabel[customer.status]}</span>
              </div>
            </div>
            {/* Quick actions */}
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <button
                onClick={() => setShowTaskModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                Görev Ekle
              </button>
              <Link
                href={`/opportunities/new?customerId=${id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-violet-50 text-violet-700 hover:bg-violet-100 rounded-xl transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                Fırsat Ekle
              </Link>
              <Link
                href={`/proposals/new?customerId=${id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium btn-primary text-xs py-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Teklif Oluştur
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            <InfoItem label="E-posta" value={customer.email} />
            <InfoItem label="Telefon" value={customer.phone || '—'} />
            <InfoItem label="Şehir" value={customer.city || '—'} />
            <InfoItem label="Ülke" value={customer.country || '—'} />
            <InfoItem label="Kaynak" value={customer.source || '—'} />
            <InfoItem label="Kayıt Tarihi" value={new Date(customer.createdAt).toLocaleDateString('tr-TR')} />
          </div>

          {customer.notes && (
            <div className="mt-5 pt-5 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Notlar</p>
              <p className="text-sm text-slate-700 whitespace-pre-line">{customer.notes}</p>
            </div>
          )}
        </div>

        {/* Task Modal */}
        {showTaskModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowTaskModal(false)}>
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <div className="relative card p-6 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Yeni Görev</h2>
                <button onClick={() => setShowTaskModal(false)} className="text-slate-400 hover:text-slate-600 transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-widest">Başlık *</label>
                  <input type="text" required value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} className="input" placeholder="Görev başlığı..." />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-widest">Açıklama</label>
                  <textarea value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} className="input resize-none" rows={2} placeholder="Açıklama..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-widest">Öncelik</label>
                    <select value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value as any })} className="input">
                      <option value="low">Düşük</option><option value="medium">Orta</option><option value="high">Yüksek</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-widest">Bitiş Tarihi</label>
                    <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} className="input" />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="submit" disabled={taskSaving} className="btn-primary flex-1">{taskSaving ? 'Kaydediliyor...' : 'Görev Oluştur'}</button>
                  <button type="button" onClick={() => setShowTaskModal(false)} className="btn-secondary">İptal</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Fırsatlar */}
        <div className="card p-6 mb-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Fırsatlar <span className="text-slate-400 font-normal">({opportunities.length})</span></h2>
            <Link href={`/opportunities/new?customerId=${id}`} className="text-xs text-brand-600 hover:text-brand-700 font-medium">+ Fırsat Ekle</Link>
          </div>
          {opportunities.length === 0 ? (
            <p className="text-sm text-slate-400 py-3">Bu müşteriye ait fırsat yok</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {opportunities.map(o => (
                <div key={o._id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{o.title}</p>
                    {o.expectedCloseDate && <p className="text-xs text-slate-400 mt-0.5">Kapanış: {new Date(o.expectedCloseDate).toLocaleDateString('tr-TR')}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-brand-600">{fmt(o.amount)}</span>
                    <span className={`badge ${stageColor[o.stage]}`}>{stageLabel[o.stage]}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Teklifler */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Teklifler <span className="text-slate-400 font-normal">({proposals.length})</span></h2>
            <Link href={`/proposals/new?customerId=${id}`} className="text-xs text-brand-600 hover:text-brand-700 font-medium">+ Teklif Oluştur</Link>
          </div>
          {proposals.length === 0 ? (
            <p className="text-sm text-slate-400 py-3">Bu müşteriye ait teklif yok</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {proposals.map(p => (
                <div key={p._id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{p.title}</p>
                    <p className="text-xs font-mono text-slate-400">{p.proposalNumber}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-900">{fmt(calcTotal(p))}</span>
                    <span className={`badge ${proposalStatusColor[p.status]}`}>{proposalStatusLabel[p.status]}</span>
                    <Link href={`/proposals/${p._id}`} className="text-xs text-brand-600 hover:text-brand-700 font-medium">Görüntüle →</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-slate-800">{value}</p>
    </div>
  );
}
