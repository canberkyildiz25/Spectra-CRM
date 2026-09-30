'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { Field } from '@/components/ui/sheet';
import { toast } from '@/components/Toast';
import api from '@/lib/axios';
import { useAuthReady } from '@/lib/store';
import { errorText, moneyExact } from '@/lib/format';

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  company?: string;
}
interface Opportunity {
  _id: string;
  title: string;
  customerId: { _id: string } | string | null;
}
interface Item {
  name: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

const UNITS = ['Adet', 'Saat', 'Gün', 'Ay', 'Yıl', 'Kullanıcı', 'Proje', 'Paket'];
const blankItem = (): Item => ({ name: '', description: '', quantity: 1, unit: 'Adet', unitPrice: 0 });
const ownerId = (ref: Opportunity['customerId']) => (typeof ref === 'string' ? ref : ref?._id);

/**
 * New and edit share this form. They were two copies of the same 190 lines
 * that had already started to drift (the edit page showed its loading text
 * outside the app shell). One form, two entry points.
 */
export default function ProposalForm({ proposalId }: { proposalId?: string }) {
  const router = useRouter();
  const authReady = useAuthReady();
  const editing = Boolean(proposalId);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(() => ({
    customerId: '',
    opportunityId: '',
    title: '',
    validUntil: new Date(Date.now() + 30 * 864e5).toISOString().split('T')[0],
    taxRate: 20,
    notes: '',
    paymentTerms: 'Fatura tarihinden itibaren 30 gün',
  }));
  const [items, setItems] = useState<Item[]>([blankItem()]);

  useEffect(() => {
    if (!authReady) return;
    const requests = [api.get('/customers?limit=100'), api.get('/opportunities')];
    if (proposalId) requests.push(api.get(`/proposals/${proposalId}`));
    Promise.all(requests)
      .then(([c, o, p]) => {
        setCustomers(c.data.data.customers);
        setOpportunities(o.data.data);
        if (p) {
          const d = p.data.data;
          setForm({
            customerId: d.customerId?._id ?? '',
            opportunityId: d.opportunityId?._id ?? '',
            title: d.title,
            validUntil: String(d.validUntil).split('T')[0],
            taxRate: d.taxRate,
            notes: d.notes ?? '',
            paymentTerms: d.paymentTerms ?? '',
          });
          setItems(
            (d.items as Item[]).map((i) => ({
              name: i.name,
              description: i.description ?? '',
              quantity: i.quantity,
              unit: i.unit,
              unitPrice: i.unitPrice,
            })),
          );
        } else {
          const pre = new URLSearchParams(window.location.search).get('customerId');
          if (pre) setForm((f) => ({ ...f, customerId: pre }));
        }
      })
      .catch(() => setError('Veriler yüklenemedi'))
      .finally(() => setLoading(false));
  }, [authReady, proposalId]);

  const update = (i: number, patch: Partial<Item>) =>
    setItems((list) => list.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const tax = (subtotal * form.taxRate) / 100;
  const total = subtotal + tax;

  // Opportunities for the chosen customer first; the rest stay reachable.
  const ownOpps = opportunities.filter((o) => ownerId(o.customerId) === form.customerId);
  const otherOpps = opportunities.filter((o) => ownerId(o.customerId) !== form.customerId);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.some((i) => !i.name.trim())) return setError('Her satırın bir adı olmalı.');
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, items, opportunityId: form.opportunityId || undefined };
      if (proposalId) {
        await api.put(`/proposals/${proposalId}`, payload);
        toast.success('Teklif güncellendi');
        router.push(`/proposals/${proposalId}`);
      } else {
        const res = await api.post('/proposals', payload);
        toast.success('Teklif oluşturuldu');
        router.push(`/proposals/${res.data.data._id}`);
      }
    } catch (err) {
      setError(errorText(err, 'Kayıt başarısız'));
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4" role="status" aria-label="Yükleniyor">
        <div className="h-12 w-72 rounded bg-lift" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-panel" />
      </div>
    );
  }

  return (
    <>
      <Link href={proposalId ? `/proposals/${proposalId}` : '/proposals'} className="btn-ghost -ml-3 mb-6">
        <ArrowLeft className="size-4" aria-hidden />
        {proposalId ? 'Teklif' : 'Teklifler'}
      </Link>
      <p className="label">Belge</p>
      <h1 className="mt-2 text-[clamp(2.25rem,5vw,3.25rem)] text-fg">{editing ? 'Teklifi düzenle' : 'Yeni teklif'}</h1>

      <form onSubmit={submit} className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="min-w-0 space-y-4">
          {error && (
            <div role="alert" className="notice">
              {error}
            </div>
          )}

          <section className="card grid grid-cols-2 gap-4 p-5 sm:p-6" aria-labelledby="pf-info">
            <h2 id="pf-info" className="col-span-2 text-[1.375rem] text-fg">
              Teklif bilgileri
            </h2>
            <Field id="pf-title" label="Başlık" className="col-span-2">
              <input
                id="pf-title"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Yazılım lisans ve destek hizmetleri teklifi"
                className="input"
              />
            </Field>
            <Field id="pf-customer" label="Müşteri" className="col-span-2 sm:col-span-1">
              <select
                id="pf-customer"
                required
                value={form.customerId}
                onChange={(e) => setForm({ ...form, customerId: e.target.value, opportunityId: '' })}
                className="input"
              >
                <option value="">Müşteri seçin</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.firstName} {c.lastName}
                    {c.company ? ` (${c.company})` : ''}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="pf-opp" label="İlgili fırsat" className="col-span-2 sm:col-span-1">
              <select
                id="pf-opp"
                value={form.opportunityId}
                onChange={(e) => setForm({ ...form, opportunityId: e.target.value })}
                className="input"
              >
                <option value="">Yok</option>
                {ownOpps.length > 0 && (
                  <optgroup label="Bu müşterinin">
                    {ownOpps.map((o) => (
                      <option key={o._id} value={o._id}>
                        {o.title}
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label={ownOpps.length ? 'Diğer' : 'Tüm fırsatlar'}>
                  {otherOpps.map((o) => (
                    <option key={o._id} value={o._id}>
                      {o.title}
                    </option>
                  ))}
                </optgroup>
              </select>
            </Field>
            <Field id="pf-valid" label="Geçerlilik" className="col-span-2 sm:col-span-1">
              <input
                id="pf-valid"
                required
                type="date"
                value={form.validUntil}
                onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                className="input figure"
              />
            </Field>
            <Field id="pf-tax" label="KDV" className="col-span-2 sm:col-span-1">
              <select
                id="pf-tax"
                value={form.taxRate}
                onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) })}
                className="input"
              >
                <option value={0}>%0 — KDV yok</option>
                <option value={10}>%10</option>
                <option value={20}>%20</option>
              </select>
            </Field>
            <Field id="pf-terms" label="Ödeme koşulları" className="col-span-2">
              <input
                id="pf-terms"
                value={form.paymentTerms}
                onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
                className="input"
              />
            </Field>
          </section>

          <section className="card p-5 sm:p-6" aria-labelledby="pf-items">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 id="pf-items" className="text-[1.375rem] text-fg">
                Kalemler
              </h2>
              <button type="button" onClick={() => setItems((l) => [...l, blankItem()])} className="btn-secondary btn-sm">
                <Plus className="size-4" aria-hidden />
                Satır ekle
              </button>
            </div>

            {/* Rows are cards on a phone and a grid on wider screens; the
                labels stay visible either way, so a row is never a bare set
                of numbers. */}
            <ol className="space-y-3">
              {items.map((item, i) => (
                <li key={i} className="rounded-[var(--radius-md)] border border-line bg-well p-3">
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-[minmax(0,1fr)_7rem_6rem_8rem_auto]">
                    <Field id={`pf-name-${i}`} label={`Satır ${i + 1}`} className="col-span-2 md:col-span-1">
                      <input
                        id={`pf-name-${i}`}
                        value={item.name}
                        onChange={(e) => update(i, { name: e.target.value })}
                        placeholder="Ürün ya da hizmet"
                        className="input"
                      />
                    </Field>
                    <Field id={`pf-unit-${i}`} label="Birim">
                      <select id={`pf-unit-${i}`} value={item.unit} onChange={(e) => update(i, { unit: e.target.value })} className="input">
                        {(UNITS.includes(item.unit) ? UNITS : [item.unit, ...UNITS]).map((u) => (
                          <option key={u}>{u}</option>
                        ))}
                      </select>
                    </Field>
                    <Field id={`pf-qty-${i}`} label="Miktar">
                      <input
                        id={`pf-qty-${i}`}
                        type="number"
                        min="0"
                        step="any"
                        inputMode="decimal"
                        value={item.quantity}
                        onChange={(e) => update(i, { quantity: Number(e.target.value) })}
                        className="input figure text-right"
                      />
                    </Field>
                    <Field id={`pf-price-${i}`} label="Birim fiyat">
                      <input
                        id={`pf-price-${i}`}
                        type="number"
                        min="0"
                        step="any"
                        inputMode="decimal"
                        value={item.unitPrice}
                        onChange={(e) => update(i, { unitPrice: Number(e.target.value) })}
                        className="input figure text-right"
                      />
                    </Field>
                    <div className="flex items-end justify-between gap-2 md:justify-end">
                      <span className="figure pb-2.5 text-sm text-fg md:hidden">{moneyExact(item.quantity * item.unitPrice)}</span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setItems((l) => l.filter((_, idx) => idx !== i))}
                          aria-label={`Satır ${i + 1}’i kaldır`}
                          className="flex size-10 items-center justify-center rounded-[var(--radius-md)] text-fg-3 transition-colors hover:bg-lift hover:text-fg"
                        >
                          <X className="size-4" aria-hidden />
                        </button>
                      )}
                    </div>
                    <Field id={`pf-desc-${i}`} label="Açıklama" className="col-span-2 md:col-span-4">
                      <input
                        id={`pf-desc-${i}`}
                        value={item.description}
                        onChange={(e) => update(i, { description: e.target.value })}
                        placeholder="İsteğe bağlı"
                        className="input"
                      />
                    </Field>
                    <p className="figure hidden self-end pb-2.5 text-right text-sm text-fg md:block">
                      {moneyExact(item.quantity * item.unitPrice)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="card p-5 sm:p-6" aria-labelledby="pf-notes">
            <h2 id="pf-notes" className="mb-4 text-[1.375rem] text-fg">
              Notlar ve koşullar
            </h2>
            <label htmlFor="pf-notes-input" className="sr-only">
              Notlar
            </label>
            <textarea
              id="pf-notes-input"
              rows={4}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Teslim süresi, garanti, özel koşullar"
              className="input resize-none"
            />
          </section>
        </div>

        {/* Totals stay beside the form on desktop, so the sum is always in
            view while rows change. */}
        <aside className="card p-5 sm:p-6 lg:sticky lg:top-6" aria-label="Toplamlar">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-fg-2">Ara toplam</dt>
              <dd className="figure text-fg">{moneyExact(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-fg-2">KDV (%{form.taxRate})</dt>
              <dd className="figure text-fg">{moneyExact(tax)}</dd>
            </div>
            <div className="border-t border-line pt-3">
              <dt className="label">Genel toplam</dt>
              <dd className="readout mt-2 text-[2.5rem] text-fg">{moneyExact(total)}</dd>
            </div>
          </dl>
          <div className="mt-6 flex flex-col gap-2">
            <button type="submit" disabled={saving} className="btn w-full">
              {saving ? 'Kaydediliyor' : editing ? 'Değişiklikleri kaydet' : 'Teklifi oluştur'}
            </button>
            <button type="button" onClick={() => router.back()} className="btn-secondary w-full">
              Vazgeç
            </button>
          </div>
        </aside>
      </form>
    </>
  );
}
