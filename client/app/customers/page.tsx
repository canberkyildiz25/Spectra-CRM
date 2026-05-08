'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import Link from 'next/link';
import api from '@/lib/axios';
import { toast } from '@/components/Toast';
import EmptyState from '@/components/EmptyState';

interface Customer {
  _id: string; firstName: string; lastName: string; email: string;
  phone?: string; company?: string; city?: string; country?: string;
  status: 'prospect' | 'customer' | 'inactive'; source?: string; notes?: string;
}

const statusLabel: Record<string, string> = { customer: 'Müşteri', prospect: 'Aday', inactive: 'Pasif' };
const statusBadge: Record<string, string> = {
  customer: 'bg-emerald-50 text-emerald-700',
  prospect: 'bg-blue-50 text-blue-700',
  inactive: 'bg-slate-100 text-slate-500',
};

const emptyForm = { firstName: '', lastName: '', email: '', phone: '', company: '', city: '', country: 'Türkiye', status: 'prospect' as const, source: '', notes: '' };

const avatarColors = ['bg-gradient-brand', 'bg-gradient-info', 'bg-gradient-success', 'bg-gradient-warning', 'bg-gradient-rose'];
const avatarColor = (name: string) => avatarColors[name.charCodeAt(0) % avatarColors.length];

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customers?limit=100');
      setCustomers(res.data.data.customers);
    } catch { setError('Müşteriler yüklenemedi'); } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (editingId) { await api.put(`/customers/${editingId}`, formData); toast.success('Müşteri güncellendi'); }
      else { await api.post('/customers', formData); toast.success('Müşteri oluşturuldu'); }
      setShowForm(false); setEditingId(null); setFormData(emptyForm); fetchCustomers();
    } catch (err: any) { setError(err.response?.data?.error || 'Kayıt başarısız'); } finally { setSaving(false); }
  };

  const handleEdit = (c: Customer) => {
    setFormData({ firstName: c.firstName, lastName: c.lastName, email: c.email, phone: c.phone || '', company: c.company || '', city: c.city || '', country: c.country || 'Türkiye', status: c.status, source: c.source || '', notes: c.notes || '' });
    setEditingId(c._id); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu müşteriyi silmek istediğinize emin misiniz?')) return;
    try { await api.delete(`/customers/${id}`); toast.success('Müşteri silindi'); fetchCustomers(); } catch { setError('Silme başarısız'); }
  };

  const filtered = customers.filter(c => {
    const q = `${c.firstName} ${c.lastName} ${c.company} ${c.email}`.toLowerCase();
    return (search === '' || q.includes(search.toLowerCase())) && (statusFilter === 'all' || c.status === statusFilter);
  });

  return (
    <AppShell>
      <div className="px-8 py-8 max-w-6xl mx-auto animate-fade-in">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Müşteriler</h1>
            <p className="text-slate-500 text-sm mt-1">{customers.length} müşteri kayıtlı</p>
          </div>
          <button onClick={() => { setShowForm(true); setEditingId(null); setFormData(emptyForm); }} className="btn-primary">
            + Yeni Müşteri
          </button>
        </div>

        {error && <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl mb-5">{error}</div>}

        {/* Form */}
        {showForm && (
          <div className="card p-6 mb-6 animate-slide-up">
            <h2 className="text-sm font-semibold text-slate-900 mb-5 uppercase tracking-wide">{editingId ? 'Müşteri Düzenle' : 'Yeni Müşteri'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {[
                  { label: 'Ad', field: 'firstName', required: true },
                  { label: 'Soyad', field: 'lastName', required: true },
                  { label: 'E-posta', field: 'email', type: 'email', required: true },
                  { label: 'Telefon', field: 'phone' },
                  { label: 'Şirket', field: 'company' },
                  { label: 'Şehir', field: 'city' },
                  { label: 'Kaynak', field: 'source', placeholder: 'Fuar, Referans, Web...' },
                ].map(({ label, field, type, required, placeholder }) => (
                  <div key={field}>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-widest">{label}</label>
                    <input type={type || 'text'} required={required} value={(formData as any)[field]} onChange={e => setFormData({ ...formData, [field]: e.target.value })} placeholder={placeholder} className="input" />
                  </div>
                ))}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-widest">Durum</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })} className="input">
                    <option value="prospect">Aday</option>
                    <option value="customer">Müşteri</option>
                    <option value="inactive">Pasif</option>
                  </select>
                </div>
              </div>
              <div className="mb-5">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-widest">Notlar</label>
                <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} rows={2} className="input resize-none" />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Kaydediliyor...' : editingId ? 'Güncelle' : 'Kaydet'}</button>
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setFormData(emptyForm); }} className="btn-secondary">İptal</button>
              </div>
            </form>
          </div>
        )}

        {/* Filtreler */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ad, şirket veya e-posta ara..." className="input pl-10" />
          </div>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            {['all', 'customer', 'prospect', 'inactive'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${statusFilter === s ? 'bg-white text-slate-900 shadow-card' : 'text-slate-500 hover:text-slate-700'}`}>
                {s === 'all' ? 'Tümü' : statusLabel[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Tablo */}
        {loading ? (
          <div className="card overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-slate-50 animate-pulse">
                <div className="w-9 h-9 rounded-xl bg-slate-100" />
                <div className="flex-1 space-y-2"><div className="h-3 bg-slate-100 rounded w-1/3" /><div className="h-2.5 bg-slate-100 rounded w-1/4" /></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            variant="customers"
            ctaLabel="İlk müşteriyi ekle"
            onCta={() => { setShowForm(true); setEditingId(null); setFormData(emptyForm); }}
          />
        ) : (
          <div className="card overflow-hidden">
            <table className="min-w-full data-table">
              <thead><tr>
                <th>Müşteri</th><th>İletişim</th><th>Şehir</th><th>Durum</th><th>Kaynak</th><th />
              </tr></thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c._id} className="group">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl ${avatarColor(c.firstName)} flex items-center justify-center text-white font-bold text-xs shrink-0`}>
                          {c.firstName[0]}{c.lastName[0]}
                        </div>
                        <div>
                          <Link href={`/customers/${c._id}`} className="text-sm font-semibold text-slate-800 hover:text-brand-600 transition-colors">{c.firstName} {c.lastName}</Link>
                          {c.company && <p className="text-xs text-slate-400">{c.company}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="text-sm text-slate-600">{c.email}{c.phone && <div className="text-xs text-slate-400">{c.phone}</div>}</td>
                    <td className="text-sm text-slate-500">{c.city || '—'}</td>
                    <td><span className={`badge ${statusBadge[c.status]}`}>{statusLabel[c.status]}</span></td>
                    <td className="text-sm text-slate-500">{c.source || '—'}</td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(c)} className="px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50 rounded-lg transition">Düzenle</button>
                        <button onClick={() => handleDelete(c._id)} className="px-3 py-1.5 text-xs font-medium text-rose-500 hover:bg-rose-50 rounded-lg transition">Sil</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
