'use client';

import { useEffect, useMemo, useState } from 'react';
import { LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { Ellipsis, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import AppShell from '@/components/AppShell';
import PageHead, { Page } from '@/components/app/PageHead';
import ToneChip, { ToneDot } from '@/components/app/ToneChip';
import EmptyState from '@/components/EmptyState';
import ConfirmDelete from '@/components/ConfirmDelete';
import { toast } from '@/components/Toast';
import { Sheet, Field } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import api from '@/lib/axios';
import { useAuthReady } from '@/lib/store';
import { OPEN_STAGES, STAGES, stageOf, toneVar, type Stage } from '@/lib/stages';
import { date, errorText, money, moneyShort } from '@/lib/format';

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  company?: string;
}
interface Opportunity {
  _id: string;
  title: string;
  customerId: Customer | null;
  amount: number;
  stage: Stage;
  probability: number;
  expectedCloseDate?: string;
  description?: string;
}

const emptyForm = {
  title: '',
  customerId: '',
  amount: '',
  stage: 'lead' as Stage,
  probability: '10',
  expectedCloseDate: '',
  description: '',
};

const who = (c: Customer | null) => (c ? `${c.firstName} ${c.lastName}` : 'Silinmiş müşteri');

export default function Opportunities() {
  const reduce = useReducedMotion();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'board' | 'list'>('board');
  const [search, setSearch] = useState('');
  const [dragOver, setDragOver] = useState<Stage | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [probTouched, setProbTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Opportunity | null>(null);

  const authReady = useAuthReady();
  const refresh = () => api.get('/opportunities').then((r) => setOpportunities(r.data.data));

  useEffect(() => {
    if (!authReady) return;
    Promise.all([
      api.get('/opportunities').then((r) => setOpportunities(r.data.data)),
      api.get('/customers?limit=100').then((r) => setCustomers(r.data.data.customers)),
    ])
      .catch(() => toast.error('Fırsatlar yüklenemedi'))
      .finally(() => {
        setLoading(false);
        // A customer page links here with ?new=1&customerId=… to start a
        // deal for that customer.
        const q = new URLSearchParams(window.location.search);
        if (q.get('new')) {
          setForm({ ...emptyForm, customerId: q.get('customerId') ?? '' });
          setSheetOpen(true);
          window.history.replaceState(null, '', '/opportunities');
        }
      });
  }, [authReady]);

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase('tr');
    if (!q) return opportunities;
    return opportunities.filter((o) =>
      `${o.title} ${who(o.customerId)} ${o.customerId?.company ?? ''}`.toLocaleLowerCase('tr').includes(q),
    );
  }, [opportunities, search]);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setProbTouched(false);
    setFormError('');
    setSheetOpen(true);
  };

  const openEdit = (o: Opportunity) => {
    setEditingId(o._id);
    setForm({
      title: o.title,
      customerId: o.customerId?._id ?? '',
      amount: String(o.amount),
      stage: o.stage,
      probability: String(o.probability),
      expectedCloseDate: o.expectedCloseDate ? o.expectedCloseDate.split('T')[0] : '',
      description: o.description ?? '',
    });
    setProbTouched(true);
    setFormError('');
    setSheetOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload = { ...form, amount: Number(form.amount), probability: Number(form.probability) };
      if (editingId) {
        await api.put(`/opportunities/${editingId}`, payload);
        toast.success('Fırsat güncellendi');
      } else {
        await api.post('/opportunities', payload);
        toast.success('Fırsat eklendi');
      }
      setSheetOpen(false);
      await refresh();
    } catch (err) {
      setFormError(errorText(err, 'Kayıt başarısız'));
    } finally {
      setSaving(false);
    }
  };

  /* Optimistic: the card moves the moment it is dropped, and moves back if
     the server refuses. Stage and probability travel together. */
  const moveTo = async (o: Opportunity, stage: Stage) => {
    if (o.stage === stage) return;
    const before = opportunities;
    const { probability, label } = stageOf(stage);
    setOpportunities((list) => list.map((x) => (x._id === o._id ? { ...x, stage, probability } : x)));
    try {
      await api.put(`/opportunities/${o._id}`, { stage, probability });
      toast.success(`${o.title} → ${label}`);
    } catch {
      setOpportunities(before);
      toast.error('Aşama güncellenemedi');
    }
  };

  const remove = async () => {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setPendingDelete(null);
    try {
      await api.delete(`/opportunities/${target._id}`);
      setOpportunities((list) => list.filter((x) => x._id !== target._id));
      toast.success('Fırsat silindi');
    } catch {
      toast.error('Silme başarısız');
    }
  };

  const openDeals = opportunities.filter((o) => OPEN_STAGES.some((s) => s.key === o.stage));
  const wonDeals = opportunities.filter((o) => o.stage === 'closed-won');
  const closed = wonDeals.length + opportunities.filter((o) => o.stage === 'closed-lost').length;
  const sum = (rows: Opportunity[]) => rows.reduce((s, o) => s + o.amount, 0);

  const actions = (o: Opportunity) => (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${o.title} için işlemler`}
        className="flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-fg-3 transition-colors hover:bg-lift hover:text-fg data-[state=open]:bg-lift data-[state=open]:text-fg"
      >
        <Ellipsis className="size-4" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuItem onSelect={() => openEdit(o)}>
          <Pencil aria-hidden />
          Düzenle
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* The keyboard and touch route for what the board does by dragging. */}
        <DropdownMenuLabel>Aşamaya taşı</DropdownMenuLabel>
        {STAGES.filter((s) => s.key !== o.stage).map((s) => (
          <DropdownMenuItem key={s.key} onSelect={() => moveTo(o, s.key)}>
            <ToneDot tone={s.tone} />
            {s.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        {/* Deferred a tick so the menu hands focus back before the dialog
            takes it — otherwise the two focus managers race. */}
        <DropdownMenuItem variant="destructive" onSelect={() => setTimeout(() => setPendingDelete(o), 0)}>
          <Trash2 aria-hidden />
          Sil
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <AppShell>
      <Page wide>
        <PageHead
          label="Satış hattı"
          title="Fırsatlar"
          meta={`${opportunities.length} fırsat · ${openDeals.length} açık`}
          actions={
            <>
              <div className="segmented" role="group" aria-label="Görünüm">
                <button type="button" className="segmented-item" aria-pressed={view === 'board'} onClick={() => setView('board')}>
                  Pano
                </button>
                <button type="button" className="segmented-item" aria-pressed={view === 'list'} onClick={() => setView('list')}>
                  Liste
                </button>
              </div>
              <button type="button" onClick={openNew} className="btn btn-sm">
                <Plus className="size-4" aria-hidden />
                Fırsat ekle
              </button>
            </>
          }
        />

        {/* ── Summary: one strip, four readings ── */}
        <dl className="grid grid-cols-2 overflow-hidden rounded-[var(--radius-lg)] border border-line bg-panel lg:grid-cols-4">
          {[
            { k: 'Açık hat', v: moneyShort(sum(openDeals)), title: money(sum(openDeals)) },
            { k: 'Kazanılan', v: moneyShort(sum(wonDeals)), title: money(sum(wonDeals)) },
            { k: 'Kazanma oranı', v: `%${closed ? Math.round((wonDeals.length / closed) * 100) : 0}`, title: `${wonDeals.length} / ${closed} kapanış` },
            { k: 'Açık fırsat', v: String(openDeals.length), title: 'aday, nitelikli, teklif, müzakere' },
          ].map((s, i) => (
            <div
              key={s.k}
              className={`px-4 py-4 sm:px-5 ${i % 2 === 0 ? 'border-r border-line' : ''} ${i < 2 ? 'border-b border-line lg:border-b-0' : ''} ${i === 1 ? 'lg:border-r' : ''}`}
            >
              <dt className="label">{s.k}</dt>
              <dd className="readout mt-2 text-[2.25rem] text-fg" title={s.title}>
                {s.v}
              </dd>
            </div>
          ))}
        </dl>

        <div className="relative mt-5 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-3" aria-hidden />
          <label htmlFor="opp-search" className="sr-only">
            Fırsat ara
          </label>
          <input
            id="opp-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Başlık, müşteri ya da şirket"
            className="input pl-9"
          />
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="flex gap-3 overflow-hidden" role="status" aria-label="Yükleniyor">
              {STAGES.map((s) => (
                <div key={s.key} className="h-72 w-[17rem] shrink-0 animate-pulse rounded-[var(--radius-lg)] bg-well" />
              ))}
            </div>
          ) : view === 'board' ? (
            <LayoutGroup>
              {/* Columns scroll sideways and snap on narrow screens. */}
              <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 sm:-mx-8 sm:px-8">
                {STAGES.map((stage) => {
                  const cards = filtered.filter((o) => o.stage === stage.key);
                  const over = dragOver === stage.key;
                  return (
                    <section
                      key={stage.key}
                      aria-label={`${stage.label}: ${cards.length} fırsat`}
                      className="flex w-[17rem] shrink-0 snap-start flex-col"
                    >
                      <header className="mb-2 px-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-2">
                            <ToneDot tone={stage.tone} />
                            <span className="text-sm font-semibold text-fg">{stage.label}</span>
                            <span className="figure text-xs text-fg-3">{cards.length}</span>
                          </span>
                          <span className="figure text-xs text-fg-2">{moneyShort(sum(cards))}</span>
                        </div>
                      </header>
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                          if (dragOver !== stage.key) setDragOver(stage.key);
                        }}
                        onDragLeave={(e) => {
                          if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(null);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragOver(null);
                          const o = opportunities.find((x) => x._id === e.dataTransfer.getData('text/opportunity'));
                          if (o) moveTo(o, stage.key);
                        }}
                        className={`flex min-h-40 flex-1 flex-col gap-2 rounded-[var(--radius-lg)] border-t-2 p-2 transition-colors ${
                          over ? 'bg-lift' : 'bg-well'
                        }`}
                        style={{ borderTopColor: toneVar(stage.tone) }}
                      >
                        {cards.map((o) => (
                          <motion.article
                            key={o._id}
                            layoutId={reduce ? undefined : o._id}
                            layout={!reduce}
                            transition={{ type: 'spring', stiffness: 480, damping: 40 }}
                            className="rounded-[var(--radius-md)] border border-line bg-panel"
                            style={{ boxShadow: `inset 2px 0 0 ${toneVar(stage.tone)}` }}
                          >
                            <div
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/opportunity', o._id);
                                e.dataTransfer.effectAllowed = 'move';
                              }}
                              className="cursor-grab p-3 pl-4 active:cursor-grabbing"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="text-sm font-medium leading-snug text-fg">{o.title}</h3>
                                {actions(o)}
                              </div>
                              <p className="mt-1 truncate text-xs text-fg-3">
                                {who(o.customerId)}
                                {o.customerId?.company ? ` · ${o.customerId.company}` : ''}
                              </p>
                              <div className="mt-3 flex items-end justify-between gap-2">
                                <span className="figure text-sm text-fg">{money(o.amount)}</span>
                                <span className="figure text-[0.6875rem] text-fg-3">
                                  %{o.probability}
                                  {o.expectedCloseDate ? ` · ${date(o.expectedCloseDate)}` : ''}
                                </span>
                              </div>
                            </div>
                          </motion.article>
                        ))}
                        {cards.length === 0 && (
                          <p className="flex flex-1 items-center justify-center py-8 text-xs text-fg-3">Boş</p>
                        )}
                      </div>
                    </section>
                  );
                })}
              </div>
            </LayoutGroup>
          ) : filtered.length === 0 ? (
            <EmptyState variant={search ? 'search' : 'opportunities'} ctaLabel="Fırsat ekle" onCta={search ? undefined : openNew} />
          ) : (
            <div className="table-wrap">
              <table className="data-table stack">
                <thead>
                  <tr>
                    <th>Fırsat</th>
                    <th>Aşama</th>
                    <th className="num">Tutar</th>
                    <th className="num">Olasılık</th>
                    <th>Kapanış</th>
                    <th>
                      <span className="sr-only">İşlemler</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => {
                    const s = stageOf(o.stage);
                    return (
                      <tr key={o._id}>
                        <td className="pr-12 md:pr-4">
                          <span className="block font-medium text-fg">{o.title}</span>
                          <span className="block text-xs text-fg-3">
                            {who(o.customerId)}
                            {o.customerId?.company ? ` · ${o.customerId.company}` : ''}
                          </span>
                        </td>
                        <td data-label="Aşama">
                          <ToneChip tone={s.tone}>{s.label}</ToneChip>
                        </td>
                        <td data-label="Tutar" className="num text-fg">
                          {money(o.amount)}
                        </td>
                        <td data-label="Olasılık" className="num text-fg-2">
                          %{o.probability}
                        </td>
                        <td data-label="Kapanış" className="figure text-fg-2">
                          {date(o.expectedCloseDate)}
                        </td>
                        <td className="row-actions text-right">
                          {actions(o)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Page>

      <Sheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={editingId ? 'Fırsatı düzenle' : 'Yeni fırsat'}
        description={editingId ? undefined : 'Yeni fırsat seçtiğiniz aşamaya düşer; olasılık aşamadan gelir.'}
      >
        <form onSubmit={submit} className="grid grid-cols-2 gap-4">
          {formError && (
            <div role="alert" className="notice col-span-2">
              {formError}
            </div>
          )}
          <Field id="o-title" label="Başlık" className="col-span-2">
            <input
              id="o-title"
              required
              minLength={3}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="ABC Teknoloji - Yazılım lisansı"
              className="input"
            />
          </Field>
          <Field id="o-customer" label="Müşteri" className="col-span-2">
            <select
              id="o-customer"
              required
              value={form.customerId}
              onChange={(e) => setForm({ ...form, customerId: e.target.value })}
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
          <Field id="o-amount" label="Tutar (₺)" className="col-span-2 sm:col-span-1">
            <input
              id="o-amount"
              required
              type="number"
              min="0"
              inputMode="numeric"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="input figure"
            />
          </Field>
          <Field id="o-stage" label="Aşama" className="col-span-2 sm:col-span-1">
            <select
              id="o-stage"
              value={form.stage}
              onChange={(e) => {
                const stage = e.target.value as Stage;
                setForm((f) => ({
                  ...f,
                  stage,
                  probability: probTouched ? f.probability : String(stageOf(stage).probability),
                }));
              }}
              className="input"
            >
              {STAGES.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
          <Field id="o-prob" label="Olasılık (%)" className="col-span-2 sm:col-span-1">
            <input
              id="o-prob"
              type="number"
              min="0"
              max="100"
              value={form.probability}
              onChange={(e) => {
                setProbTouched(true);
                setForm({ ...form, probability: e.target.value });
              }}
              className="input figure"
            />
          </Field>
          <Field id="o-close" label="Tahmini kapanış" className="col-span-2 sm:col-span-1">
            <input
              id="o-close"
              type="date"
              value={form.expectedCloseDate}
              onChange={(e) => setForm({ ...form, expectedCloseDate: e.target.value })}
              className="input figure"
            />
          </Field>
          <Field id="o-desc" label="Açıklama" className="col-span-2">
            <textarea
              id="o-desc"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input resize-none"
            />
          </Field>
          <div className="col-span-2 mt-2 flex gap-2">
            <button type="submit" disabled={saving} className="btn">
              {saving ? 'Kaydediliyor' : editingId ? 'Değişiklikleri kaydet' : 'Fırsatı ekle'}
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
        name={(o) => o.title}
        detail={(o) => `${who(o.customerId)} için açılan ${money(o.amount)} tutarındaki fırsat kaldırılır.`}
      />
    </AppShell>
  );
}
