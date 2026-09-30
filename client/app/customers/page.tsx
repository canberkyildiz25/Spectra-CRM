'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Ellipsis, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import AppShell from '@/components/AppShell';
import PageHead, { Page } from '@/components/app/PageHead';
import ToneChip from '@/components/app/ToneChip';
import EmptyState from '@/components/EmptyState';
import ConfirmDelete from '@/components/ConfirmDelete';
import { toast } from '@/components/Toast';
import { Sheet, Field } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import api from '@/lib/axios';
import { useAuthReady } from '@/lib/store';
import { CUSTOMER_STATUS } from '@/lib/stages';
import { errorText } from '@/lib/format';

type Status = 'prospect' | 'customer' | 'inactive';
interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  city?: string;
  country?: string;
  status: Status;
  source?: string;
  notes?: string;
}

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  city: '',
  country: 'Türkiye',
  status: 'prospect' as Status,
  source: '',
  notes: '',
};

const TEXT_FIELDS: { field: keyof typeof emptyForm; label: string; type?: string; required?: boolean; placeholder?: string; half?: boolean; autoComplete?: string }[] = [
  { field: 'firstName', label: 'Ad', required: true, half: true, autoComplete: 'off' },
  { field: 'lastName', label: 'Soyad', required: true, half: true, autoComplete: 'off' },
  { field: 'email', label: 'E-posta', type: 'email', required: true, autoComplete: 'off' },
  { field: 'phone', label: 'Telefon', type: 'tel', half: true, autoComplete: 'off' },
  { field: 'company', label: 'Şirket', half: true },
  { field: 'city', label: 'Şehir', half: true },
  { field: 'source', label: 'Kaynak', placeholder: 'Fuar, referans, web…', half: true },
];

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Customer | null>(null);

  const load = () =>
    api
      .get('/customers?limit=100')
      .then((r) => setCustomers(r.data.data.customers))
      .catch(() => toast.error('Müşteriler yüklenemedi'));

  const authReady = useAuthReady();
  useEffect(() => {
    if (!authReady) return;
    load().finally(() => setLoading(false));
  }, [authReady]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: customers.length };
    for (const x of customers) c[x.status] = (c[x.status] ?? 0) + 1;
    return c;
  }, [customers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase('tr');
    return customers.filter(
      (c) =>
        (statusFilter === 'all' || c.status === statusFilter) &&
        (!q || `${c.firstName} ${c.lastName} ${c.company ?? ''} ${c.email}`.toLocaleLowerCase('tr').includes(q)),
    );
  }, [customers, search, statusFilter]);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setSheetOpen(true);
  };

  const openEdit = (c: Customer) => {
    setEditingId(c._id);
    setForm({
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      phone: c.phone ?? '',
      company: c.company ?? '',
      city: c.city ?? '',
      country: c.country ?? 'Türkiye',
      status: c.status,
      source: c.source ?? '',
      notes: c.notes ?? '',
    });
    setFormError('');
    setSheetOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      if (editingId) {
        await api.put(`/customers/${editingId}`, form);
        toast.success('Müşteri güncellendi');
      } else {
        await api.post('/customers', form);
        toast.success('Müşteri eklendi');
      }
      setSheetOpen(false);
      await load();
    } catch (err) {
      setFormError(errorText(err, 'Kayıt başarısız'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setPendingDelete(null);
    try {
      await api.delete(`/customers/${target._id}`);
      setCustomers((list) => list.filter((x) => x._id !== target._id));
      toast.success('Müşteri silindi');
    } catch {
      toast.error('Silme başarısız');
    }
  };

  return (
    <AppShell>
      <Page>
        <PageHead
          label="Kayıtlar"
          title="Müşteriler"
          meta={`${customers.length} kayıt · ${counts.customer ?? 0} aktif müşteri`}
          actions={
            <button type="button" onClick={openNew} className="btn btn-sm">
              <Plus className="size-4" aria-hidden />
              Müşteri ekle
            </button>
          }
        />

        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-3" aria-hidden />
            <label htmlFor="c-search" className="sr-only">
              Müşteri ara
            </label>
            <input
              id="c-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ad, şirket ya da e-posta"
              className="input pl-9"
            />
          </div>
          <div className="segmented" role="group" aria-label="Duruma göre süz">
            {(['all', 'customer', 'prospect', 'inactive'] as const).map((s) => (
              <button
                key={s}
                type="button"
                className="segmented-item"
                aria-pressed={statusFilter === s}
                onClick={() => setStatusFilter(s)}
              >
                {s === 'all' ? 'Tümü' : CUSTOMER_STATUS[s].label}
                <span className="figure ml-1.5 opacity-70">{counts[s] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="table-wrap" role="status" aria-label="Yükleniyor">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex animate-pulse items-center gap-4 border-b border-line px-4 py-4 last:border-0">
                <div className="size-9 rounded-[var(--radius-md)] bg-lift" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 rounded bg-lift" />
                  <div className="h-2.5 w-1/5 rounded bg-lift" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            variant={customers.length ? 'search' : 'customers'}
            ctaLabel="Müşteri ekle"
            onCta={customers.length ? undefined : openNew}
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table stack">
              <thead>
                <tr>
                  <th>Müşteri</th>
                  <th>İletişim</th>
                  <th>Şehir</th>
                  <th>Durum</th>
                  <th>Kaynak</th>
                  <th>
                    <span className="sr-only">İşlemler</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const st = CUSTOMER_STATUS[c.status];
                  return (
                    <tr key={c._id}>
                      <td className="pr-12 md:pr-4">
                        <div className="flex items-center gap-3">
                          <span className="figure flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-line bg-well text-[0.6875rem] text-fg-2">
                            {c.firstName[0]}
                            {c.lastName[0]}
                          </span>
                          <span className="min-w-0">
                            <Link
                              href={`/customers/${c._id}`}
                              className="block truncate font-medium text-fg underline decoration-transparent underline-offset-4 transition-colors hover:decoration-fg-3"
                            >
                              {c.firstName} {c.lastName}
                            </Link>
                            {c.company && <span className="block truncate text-xs text-fg-3">{c.company}</span>}
                          </span>
                        </div>
                      </td>
                      <td data-label="İletişim" className="text-fg-2">
                        <span className="break-all">{c.email}</span>
                        {c.phone && <span className="figure block text-xs text-fg-3">{c.phone}</span>}
                      </td>
                      <td data-label="Şehir" className="text-fg-2">
                        {c.city || '—'}
                      </td>
                      <td data-label="Durum">
                        <ToneChip tone={st.tone}>{st.label}</ToneChip>
                      </td>
                      <td data-label="Kaynak" className="text-fg-2">
                        {c.source || '—'}
                      </td>
                      <td className="row-actions text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            aria-label={`${c.firstName} ${c.lastName} için işlemler`}
                            className="inline-flex size-8 items-center justify-center rounded-[var(--radius-md)] text-fg-3 transition-colors hover:bg-lift hover:text-fg data-[state=open]:bg-lift"
                          >
                            <Ellipsis className="size-4" aria-hidden />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => openEdit(c)}>
                              <Pencil aria-hidden />
                              Düzenle
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onSelect={() => setTimeout(() => setPendingDelete(c), 0)}>
                              <Trash2 aria-hidden />
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
      </Page>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen} title={editingId ? 'Müşteriyi düzenle' : 'Yeni müşteri'}>
        <form onSubmit={submit} className="grid grid-cols-2 gap-4">
          {formError && (
            <div role="alert" className="notice col-span-2">
              {formError}
            </div>
          )}
          {TEXT_FIELDS.map((f) => (
            <Field key={f.field} id={`c-${f.field}`} label={f.label} className={f.half ? 'col-span-2 sm:col-span-1' : 'col-span-2'}>
              <input
                id={`c-${f.field}`}
                type={f.type ?? 'text'}
                required={f.required}
                placeholder={f.placeholder}
                autoComplete={f.autoComplete}
                value={form[f.field]}
                onChange={(e) => setForm({ ...form, [f.field]: e.target.value })}
                className="input"
              />
            </Field>
          ))}
          <Field id="c-status" label="Durum" className="col-span-2 sm:col-span-1">
            <select
              id="c-status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Status })}
              className="input"
            >
              {(Object.keys(CUSTOMER_STATUS) as Status[]).map((k) => (
                <option key={k} value={k}>
                  {CUSTOMER_STATUS[k].label}
                </option>
              ))}
            </select>
          </Field>
          <Field id="c-notes" label="Notlar" className="col-span-2">
            <textarea
              id="c-notes"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="input resize-none"
            />
          </Field>
          <div className="col-span-2 mt-2 flex gap-2">
            <button type="submit" disabled={saving} className="btn">
              {saving ? 'Kaydediliyor' : editingId ? 'Değişiklikleri kaydet' : 'Müşteriyi ekle'}
            </button>
            <button type="button" onClick={() => setSheetOpen(false)} className="btn-secondary">
              Vazgeç
            </button>
          </div>
        </form>
      </Sheet>

      <ConfirmDelete
        target={pendingDelete}
        onCancel={() => setPendingDelete(null)}
        onConfirm={remove}
        name={(c) => `${c.firstName} ${c.lastName}`}
        detail={(c) =>
          c.company
            ? `${c.company} kaydı ve bu müşteriye bağlı geçmiş kalıcı olarak kaldırılır.`
            : 'Kayıt ve bu müşteriye bağlı geçmiş kalıcı olarak kaldırılır.'
        }
      />
    </AppShell>
  );
}
