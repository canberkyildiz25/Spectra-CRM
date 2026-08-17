'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import api from '@/lib/axios';

interface Customer { _id: string; firstName: string; lastName: string; company?: string; }
interface Opportunity { _id: string; title: string; }
interface Item { name: string; description: string; quantity: number; unit: string; unitPrice: number; }

export default function EditProposal() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    customerId: '', opportunityId: '', title: '', validUntil: '', taxRate: 20, notes: '', paymentTerms: '',
  });

  const [items, setItems] = useState<Item[]>([{ name: '', description: '', quantity: 1, unit: 'Adet', unitPrice: 0 }]);

  useEffect(() => {
    Promise.all([
      api.get(`/proposals/${id}`),
      api.get('/customers?limit=100'),
      api.get('/opportunities'),
    ]).then(([pRes, cRes, oRes]) => {
      const p = pRes.data.data;
      setForm({
        customerId: p.customerId._id,
        opportunityId: p.opportunityId?._id || '',
        title: p.title,
        validUntil: p.validUntil.split('T')[0],
        taxRate: p.taxRate,
        notes: p.notes || '',
        paymentTerms: p.paymentTerms || '',
      });
      setItems(p.items.map((i: any) => ({ name: i.name, description: i.description || '', quantity: i.quantity, unit: i.unit, unitPrice: i.unitPrice })));
      setCustomers(cRes.data.data.customers);
      setOpportunities(oRes.data.data);
    }).catch(() => setError('Teklif yüklenemedi')).finally(() => setLoading(false));
  }, [id]);

  const addItem = () => setItems([...items, { name: '', description: '', quantity: 1, unit: 'Adet', unitPrice: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof Item, value: any) =>
    setItems(items.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const tax = subtotal * form.taxRate / 100;
  const total = subtotal + tax;

  const fmt = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 2 }).format(n);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.some(i => !i.name)) return setError('Tüm ürün/hizmet adları doldurulmalıdır');
    setSaving(true);
    setError('');
    try {
      await api.put(`/proposals/${id}`, { ...form, items, opportunityId: form.opportunityId || undefined });
      router.push(`/proposals/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Güncelleme başarısız');
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen text-muted-foreground text-sm">Yükleniyor...</div>;

  return (
    <AppShell>
      <div className="px-8 py-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <button onClick={() => router.back()} className="text-sm text-muted-foreground hover:text-muted-foreground mb-3 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Geri
          </button>
          <h1 className="text-2xl font-bold text-foreground">Teklif Düzenle</h1>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">Teklif Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1">BAŞLIK *</label>
                <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">MÜŞTERİ *</label>
                <select required value={form.customerId} onChange={e => setForm({ ...form, customerId: e.target.value })} className="input">
                  <option value="">Müşteri seçin...</option>
                  {customers.map(c => <option key={c._id} value={c._id}>{c.firstName} {c.lastName} {c.company ? `(${c.company})` : ''}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">İLGİLİ FIRSAT</label>
                <select value={form.opportunityId} onChange={e => setForm({ ...form, opportunityId: e.target.value })} className="input">
                  <option value="">Fırsat seçin (opsiyonel)</option>
                  {opportunities.map(o => <option key={o._id} value={o._id}>{o.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">GEÇERLİLİK TARİHİ *</label>
                <input required type="date" value={form.validUntil} onChange={e => setForm({ ...form, validUntil: e.target.value })} className="input" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">KDV ORANI (%)</label>
                <select value={form.taxRate} onChange={e => setForm({ ...form, taxRate: Number(e.target.value) })} className="input">
                  <option value={0}>%0 (KDV Yok)</option>
                  <option value={10}>%10</option>
                  <option value={20}>%20</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1">ÖDEME KOŞULLARI</label>
                <input value={form.paymentTerms} onChange={e => setForm({ ...form, paymentTerms: e.target.value })} className="input" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Ürün / Hizmet Listesi</h2>
              <button type="button" onClick={addItem} className="btn-secondary text-xs">+ Satır Ekle</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-3 text-xs font-medium text-muted-foreground uppercase w-5/12">Ürün / Hizmet</th>
                    <th className="text-left py-2 pr-3 text-xs font-medium text-muted-foreground uppercase w-2/12">Birim</th>
                    <th className="text-right py-2 pr-3 text-xs font-medium text-muted-foreground uppercase w-1/12">Miktar</th>
                    <th className="text-right py-2 pr-3 text-xs font-medium text-muted-foreground uppercase w-2/12">Birim Fiyat (₺)</th>
                    <th className="text-right py-2 pr-3 text-xs font-medium text-muted-foreground uppercase w-2/12">Toplam</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} className="border-b border-border">
                      <td className="py-2 pr-3">
                        <input value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} placeholder="Ad" className="input" />
                        <input value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} placeholder="Açıklama (opsiyonel)" className="input mt-1 py-1 text-xs" />
                      </td>
                      <td className="py-2 pr-3">
                        <select value={item.unit} onChange={e => updateItem(i, 'unit', e.target.value)} className="input">
                          {['Adet', 'Saat', 'Gün', 'Ay', 'Yıl', 'Kg', 'Litre', 'Metre', 'Paket'].map(u => <option key={u}>{u}</option>)}
                        </select>
                      </td>
                      <td className="py-2 pr-3">
                        <input type="number" min="0" step="0.01" value={item.quantity} onChange={e => updateItem(i, 'quantity', Number(e.target.value))} className="input figure text-right" />
                      </td>
                      <td className="py-2 pr-3">
                        <input type="number" min="0" step="0.01" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', Number(e.target.value))} className="input figure text-right" />
                      </td>
                      <td className="py-2 pr-3 text-right font-semibold text-foreground whitespace-nowrap text-sm">{fmt(item.quantity * item.unitPrice)}</td>
                      <td className="py-2">
                        {items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="text-muted-foreground hover:text-[var(--destructive)] transition-colors duration-fast ease-out text-lg leading-none">×</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-5 flex justify-end">
              <div className="w-60 space-y-1.5">
                <div className="flex justify-between text-sm text-muted-foreground"><span>Ara Toplam</span><span>{fmt(subtotal)}</span></div>
                <div className="flex justify-between text-sm text-muted-foreground"><span>KDV (%{form.taxRate})</span><span>{fmt(tax)}</span></div>
                <div className="flex justify-between text-base font-medium text-foreground border-t border-border pt-2"><span>Genel Toplam</span><span className="text-foreground">{fmt(total)}</span></div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">Notlar ve Koşullar</h2>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Teslim süresi, garanti koşulları, özel notlar..." className="input resize-none" />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Kaydediliyor...' : 'Teklifi Güncelle'}
            </button>
            <button type="button" onClick={() => router.back()} className="btn-secondary">İptal</button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
