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
  country: '',
  status: 'prospect' as Status,
  source: '',
  notes: '',
};

const TEXT_FIELDS: { field: keyof typeof emptyForm; label: string; type?: string; required?: boolean; placeholder?: string; half?: boolean; autoComplete?: string }[] = [
  { field: 'firstName', label: 'First name', required: true, half: true, autoComplete: 'off' },
  { field: 'lastName', label: 'Last name', required: true, half: true, autoComplete: 'off' },
  { field: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'off' },
  { field: 'phone', label: 'Phone', type: 'tel', half: true, autoComplete: 'off' },
  { field: 'company', label: 'Company', half: true },
  { field: 'city', label: 'City', half: true },
  { field: 'country', label: 'Country', half: true },
  { field: 'source', label: 'Source', placeholder: 'Trade show, referral, website…', half: true },
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
      .catch(() => toast.error('Customers could not load'));

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
    const q = search.trim().toLocaleLowerCase('en');
    return customers.filter(
      (c) =>
        (statusFilter === 'all' || c.status === statusFilter) &&
        (!q || `${c.firstName} ${c.lastName} ${c.company ?? ''} ${c.email}`.toLocaleLowerCase('en').includes(q)),
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
      country: c.country ?? '',
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
        toast.success('Customer updated');
      } else {
        await api.post('/customers', form);
        toast.success('Customer added');
      }
      setSheetOpen(false);
      await load();
    } catch (err) {
      setFormError(errorText(err, 'Save failed'));
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
      toast.success('Customer deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <AppShell>
      <Page>
        <PageHead
          label="Records"
          title="Customers"
          meta={`${customers.length} records · ${counts.customer ?? 0} active customers`}
          actions={
            <button type="button" onClick={openNew} className="btn btn-sm">
              <Plus className="size-4" aria-hidden />
              Add customer
            </button>
          }
        />

        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-3" aria-hidden />
            <label htmlFor="c-search" className="sr-only">
              Search customers
            </label>
            <input
              id="c-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, company or email"
              className="input pl-9"
            />
          </div>
          <div className="segmented" role="group" aria-label="Filter by status">
            {(['all', 'customer', 'prospect', 'inactive'] as const).map((s) => (
              <button
                key={s}
                type="button"
                className="segmented-item"
                aria-pressed={statusFilter === s}
                onClick={() => setStatusFilter(s)}
              >
                {s === 'all' ? 'All' : CUSTOMER_STATUS[s].label}
                <span className="figure ml-1.5 opacity-70">{counts[s] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="table-wrap" role="status" aria-label="Loading">
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
            ctaLabel="Add customer"
            onCta={customers.length ? undefined : openNew}
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table stack">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>City</th>
                  <th>Status</th>
                  <th>Source</th>
                  <th>
                    <span className="sr-only">Actions</span>
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
                      <td data-label="Contact" className="text-fg-2">
                        <span className="break-all">{c.email}</span>
                        {c.phone && <span className="figure block text-xs text-fg-3">{c.phone}</span>}
                      </td>
                      <td data-label="City" className="text-fg-2">
                        {c.city || '—'}
                      </td>
                      <td data-label="Status">
                        <ToneChip tone={st.tone}>{st.label}</ToneChip>
                      </td>
                      <td data-label="Source" className="text-fg-2">
                        {c.source || '—'}
                      </td>
                      <td className="row-actions text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            aria-label={`Actions for ${c.firstName} ${c.lastName}`}
                            className="inline-flex size-8 items-center justify-center rounded-[var(--radius-md)] text-fg-3 transition-colors hover:bg-lift hover:text-fg data-[state=open]:bg-lift"
                          >
                            <Ellipsis className="size-4" aria-hidden />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => openEdit(c)}>
                              <Pencil aria-hidden />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onSelect={() => setTimeout(() => setPendingDelete(c), 0)}>
                              <Trash2 aria-hidden />
                              Delete
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

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen} title={editingId ? 'Edit customer' : 'New customer'}>
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
          <Field id="c-status" label="Status" className="col-span-2 sm:col-span-1">
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
          <Field id="c-notes" label="Notes" className="col-span-2">
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
              {saving ? 'Saving' : editingId ? 'Save changes' : 'Add customer'}
            </button>
            <button type="button" onClick={() => setSheetOpen(false)} className="btn-secondary">
              Cancel
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
            ? `The ${c.company} record and its history are removed permanently.`
            : 'The record and its history are removed permanently.'
        }
      />
    </AppShell>
  );
}
