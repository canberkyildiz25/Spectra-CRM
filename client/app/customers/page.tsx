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
  customer: 'badge-positive',
  prospect: 'badge-accent',
  inactive: 'badge-quiet',
};

const emptyForm = { firstName: '', lastName: '', email: '', phone: '', company: '', city: '', country: 'Türkiye', status: 'prospect' as const, source: '', notes: '' };

/* Initials on a flat well. Five gradients keyed off the first letter meant a
   list of ten customers carried ten competing colours, none of which meant
   anything — the accent budget spent on decoration. */

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
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="label mb-2">Kayıtlar</p>
            <h1 className="text-2xl sm:text-3xl">Müşteriler</h1>
            <p className="mt-1.5 text-sm text-ink-2">
              <span className="figure">{customers.length}</span> kayıt
            </p>
          </div>
          <button onClick={() => { setShowForm(true); setEditingId(null); setFormData(emptyForm); }} className="btn-primary shrink-0">
            Müşteri ekle
          </button>
        </div>

        {error && (
          <div role="alert" className="notice mb-5">
            {error}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="card p-6 mb-6 animate-slide-up">
            <h2 className="label mb-5">{editingId ? 'Müşteri Düzenle' : 'Yeni Müşteri'}</h2>
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
                    <label className="label block mb-1.5">{label}</label>
                    <input type={type || 'text'} required={required} value={(formData as any)[field]} onChange={e => setFormData({ ...formData, [field]: e.target.value })} placeholder={placeholder} className="input" />
                  </div>
                ))}
                <div>
                  <label className="label block mb-1.5">Durum</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })} className="input">
                    <option value="prospect">Aday</option>
                    <option value="customer">Müşteri</option>
                    <option value="inactive">Pasif</option>
                  </select>
                </div>
              </div>
              <div className="mb-5">
                <label className="label block mb-1.5">Notlar</label>
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
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ad, şirket veya e-posta ara..." className="input pl-10" />
          </div>
          <div className="segmented" role="group" aria-label="Duruma göre filtrele">
            {['all', 'customer', 'prospect', 'inactive'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                aria-pressed={statusFilter === s}
                className="segmented-item"
              >
                {s === 'all' ? 'Tümü' : statusLabel[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Tablo */}
        {loading ? (
          <div className="card overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse-soft flex items-center gap-4 border-b border-rule px-5 py-4">
                <div className="h-9 w-9 rounded-md" style={{ background: 'var(--color-paper-3)' }} />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 rounded" style={{ background: 'var(--color-paper-3)' }} />
                  <div className="h-2.5 w-1/4 rounded" style={{ background: 'var(--color-paper-3)' }} />
                </div>
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
                        <span
                          aria-hidden
                          className="figure flex h-9 w-9 shrink-0 items-center justify-center text-[11px]"
                          style={{
                            background: 'var(--color-paper-3)',
                            color: 'var(--color-ink-2)',
                            borderRadius: 'var(--radius-md)',
                          }}
                        >
                          {c.firstName[0]}{c.lastName[0]}
                        </span>
                        <div>
                          <Link
                            href={`/customers/${c._id}`}
                            className="text-sm font-medium transition-colors hover:text-accent-ink"
                          >
                            {c.firstName} {c.lastName}
                          </Link>
                          {c.company && <p className="text-xs text-ink-3">{c.company}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="text-sm text-ink-2">
                      {c.email}
                      {c.phone && <div className="figure text-xs text-ink-3">{c.phone}</div>}
                    </td>
                    <td className="text-sm text-ink-2">{c.city || '—'}</td>
                    <td><span className={`badge ${statusBadge[c.status]}`}>{statusLabel[c.status]}</span></td>
                    <td className="text-sm text-ink-2">{c.source || '—'}</td>
                    <td className="text-right">
                      {/* These were hidden behind ``,
                          which put both actions out of reach of a keyboard and of
                          every touch device. They are quiet, not hidden. Delete is
                          not red — it is confirmed before it runs, and an alarm
                          colour on every row is noise. */}
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleEdit(c)} className="btn-ghost text-xs">Düzenle</button>
                        <button onClick={() => handleDelete(c._id)} className="btn-ghost text-xs">Sil</button>
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
