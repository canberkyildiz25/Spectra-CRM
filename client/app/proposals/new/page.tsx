'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import api from '@/lib/axios';

interface Customer { _id: string; firstName: string; lastName: string; company?: string; }
interface Opportunity { _id: string; title: string; }
interface Item { name: string; description: string; quantity: number; unit: string; unitPrice: number; }

export default function NewProposal() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    customerId: '',
    opportunityId: '',
    title: '',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    taxRate: 20,
    notes: '',
    paymentTerms: 'Fatura tarihinden itibaren 30 gün',
  });

  const [items, setItems] = useState<Item[]>([{ name: '', description: '', quantity: 1, unit: 'Adet', unitPrice: 0 }]);

  useEffect(() => {
    Promise.all([
      api.get('/customers?limit=100').then(r => setCustomers(r.data.data.customers)),
      api.get('/opportunities').then(r => setOpportunities(r.data.data)),
    ]);
  }, []);

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
      const payload = { ...form, items, opportunityId: form.opportunityId || undefined };
      const res = await api.post('/proposals', payload);
      router.push(`/proposals/${res.data.data._id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Kayıt başarısız');
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="px-8 py-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-gray-600 mb-3 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Geri
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Yeni Satış Teklifi</h1>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Teklif Bilgileri */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Teklif Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">BAŞLIK *</label>
                <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Örn: Yazılım Lisans ve Destek Hizmetleri Teklifi" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">MÜŞTERİ *</label>
                <select required value={form.customerId} onChange={e => setForm({ ...form, customerId: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none">
                  <option value="">Müşteri seçin...</option>
                  {customers.map(c => <option key={c._id} value={c._id}>{c.firstName} {c.lastName} {c.company ? `(${c.company})` : ''}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">İLGİLİ FIRSAT</label>
                <select value={form.opportunityId} onChange={e => setForm({ ...form, opportunityId: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none">
                  <option value="">Fırsat seçin (opsiyonel)</option>
                  {opportunities.map(o => <option key={o._id} value={o._id}>{o.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">GEÇERLİLİK TARİHİ *</label>
                <input required type="date" value={form.validUntil} onChange={e => setForm({ ...form, validUntil: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">KDV ORANI (%)</label>
                <select value={form.taxRate} onChange={e => setForm({ ...form, taxRate: Number(e.target.value) })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none">
                  <option value={0}>%0 (KDV Yok)</option>
                  <option value={10}>%10</option>
                  <option value={20}>%20</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">ÖDEME KOŞULLARI</label>
                <input value={form.paymentTerms} onChange={e => setForm({ ...form, paymentTerms: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
              </div>
            </div>
          </div>

          {/* Ürün Listesi */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Ürün / Hizmet Listesi</h2>
              <button type="button" onClick={addItem} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-lg hover:bg-indigo-100 transition">+ Satır Ekle</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 pr-3 text-xs font-medium text-gray-400 uppercase w-5/12">Ürün / Hizmet</th>
                    <th className="text-left py-2 pr-3 text-xs font-medium text-gray-400 uppercase w-2/12">Birim</th>
                    <th className="text-right py-2 pr-3 text-xs font-medium text-gray-400 uppercase w-1/12">Miktar</th>
                    <th className="text-right py-2 pr-3 text-xs font-medium text-gray-400 uppercase w-2/12">Birim Fiyat (₺)</th>
                    <th className="text-right py-2 pr-3 text-xs font-medium text-gray-400 uppercase w-2/12">Toplam</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-2 pr-3">
                        <input value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} placeholder="Ad" className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 focus:border-transparent outline-none" />
                        <input value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} placeholder="Açıklama (opsiyonel)" className="w-full px-2 py-1 mt-1 border border-gray-100 rounded text-xs text-gray-400 focus:outline-none" />
                      </td>
                      <td className="py-2 pr-3">
                        <select value={item.unit} onChange={e => updateItem(i, 'unit', e.target.value)} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none">
                          {['Adet', 'Saat', 'Gün', 'Ay', 'Yıl', 'Kg', 'Litre', 'Metre', 'Paket'].map(u => <option key={u}>{u}</option>)}
                        </select>
                      </td>
                      <td className="py-2 pr-3">
                        <input type="number" min="0" step="0.01" value={item.quantity} onChange={e => updateItem(i, 'quantity', Number(e.target.value))} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-right focus:ring-1 focus:ring-indigo-500 focus:border-transparent outline-none" />
                      </td>
                      <td className="py-2 pr-3">
                        <input type="number" min="0" step="0.01" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', Number(e.target.value))} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-right focus:ring-1 focus:ring-indigo-500 focus:border-transparent outline-none" />
                      </td>
                      <td className="py-2 pr-3 text-right font-semibold text-gray-900 whitespace-nowrap text-sm">{fmt(item.quantity * item.unitPrice)}</td>
                      <td className="py-2">
                        {items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="text-gray-300 hover:text-red-500 transition text-lg leading-none">×</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-5 flex justify-end">
              <div className="w-60 space-y-1.5">
                <div className="flex justify-between text-sm text-gray-500"><span>Ara Toplam</span><span>{fmt(subtotal)}</span></div>
                <div className="flex justify-between text-sm text-gray-500"><span>KDV (%{form.taxRate})</span><span>{fmt(tax)}</span></div>
                <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-100 pt-2"><span>Genel Toplam</span><span className="text-indigo-700">{fmt(total)}</span></div>
              </div>
            </div>
          </div>

          {/* Notlar */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Notlar ve Koşullar</h2>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Teslim süresi, garanti koşulları, özel notlar..." className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none" />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 font-semibold disabled:opacity-50 transition">
              {saving ? 'Kaydediliyor...' : 'Teklifi Oluştur'}
            </button>
            <button type="button" onClick={() => router.back()} className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition">İptal</button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
