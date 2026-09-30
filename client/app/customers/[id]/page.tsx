'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, ListChecks, Plus } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { Page } from '@/components/app/PageHead';
import ToneChip from '@/components/app/ToneChip';
import { toast } from '@/components/Toast';
import { Sheet, Field } from '@/components/ui/sheet';
import api from '@/lib/axios';
import { useAuthReady } from '@/lib/store';
import { CUSTOMER_STATUS, PRIORITY, PROPOSAL_STATUS, stageOf } from '@/lib/stages';
import { date, dateLong, errorText, money } from '@/lib/format';

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  city?: string;
  country?: string;
  status: 'prospect' | 'customer' | 'inactive';
  source?: string;
  notes?: string;
  createdAt: string;
}
interface Opportunity {
  _id: string;
  title: string;
  amount: number;
  stage: string;
  probability: number;
  expectedCloseDate?: string;
  customerId: { _id: string } | string | null;
}
interface Proposal {
  _id: string;
  proposalNumber: string;
  title: string;
  status: string;
  validUntil: string;
  items: { unitPrice: number; quantity: number }[];
  taxRate: number;
  customerId: { _id: string } | string | null;
}

const ownerId = (ref: { _id: string } | string | null) => (typeof ref === 'string' ? ref : ref?._id);
const proposalTotal = (p: Proposal) => p.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0) * (1 + p.taxRate / 100);
const emptyTask = { title: '', description: '', priority: 'medium', dueDate: '' };

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskOpen, setTaskOpen] = useState(false);
  const [task, setTask] = useState(emptyTask);
  const [taskSaving, setTaskSaving] = useState(false);
  const [taskError, setTaskError] = useState('');

  const authReady = useAuthReady();

  useEffect(() => {
    if (!authReady) return;
    Promise.all([api.get(`/customers/${id}`), api.get('/opportunities'), api.get('/proposals')])
      .then(([c, o, p]) => {
        setCustomer(c.data.data);
        setOpportunities((o.data.data as Opportunity[]).filter((x) => ownerId(x.customerId) === id));
        setProposals((p.data.data as Proposal[]).filter((x) => ownerId(x.customerId) === id));
      })
      .catch(() => {
        toast.error('Müşteri bulunamadı');
        router.push('/customers');
      })
      .finally(() => setLoading(false));
  }, [id, router, authReady]);

  /* The old form sent `relatedCustomer`, a field the Task model does not have,
     so the task was saved but never tied to the customer. */
  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setTaskSaving(true);
    setTaskError('');
    try {
      await api.post('/tasks', { ...task, relatedTo: { type: 'customer', id } });
      toast.success('Görev eklendi');
      setTaskOpen(false);
      setTask(emptyTask);
    } catch (err) {
      setTaskError(errorText(err, 'Görev eklenemedi'));
    } finally {
      setTaskSaving(false);
    }
  };

  if (loading || !customer) {
    return (
      <AppShell>
        <Page>
          <div className="animate-pulse space-y-5" role="status" aria-label="Yükleniyor">
            <div className="h-4 w-28 rounded bg-lift" />
            <div className="h-14 w-80 rounded bg-lift" />
            <div className="h-40 rounded-[var(--radius-lg)] bg-panel" />
          </div>
        </Page>
      </AppShell>
    );
  }

  const st = CUSTOMER_STATUS[customer.status];
  const openValue = opportunities
    .filter((o) => o.stage !== 'closed-won' && o.stage !== 'closed-lost')
    .reduce((s, o) => s + o.amount, 0);

  const info: [string, React.ReactNode][] = [
    [
      'E-posta',
      <a key="e" href={`mailto:${customer.email}`} className="break-all text-fg underline decoration-line-strong underline-offset-4 hover:decoration-fg">
        {customer.email}
      </a>,
    ],
    [
      'Telefon',
      customer.phone ? (
        <a key="p" href={`tel:${customer.phone.replace(/\s/g, '')}`} className="figure text-fg">
          {customer.phone}
        </a>
      ) : (
        '—'
      ),
    ],
    ['Şehir', customer.city || '—'],
    ['Ülke', customer.country || '—'],
    ['Kaynak', customer.source || '—'],
    ['Kayıt', <span key="d" className="figure">{date(customer.createdAt)}</span>],
  ];

  return (
    <AppShell>
      <Page>
        <Link href="/customers" className="btn-ghost -ml-3 mb-6">
          <ArrowLeft className="size-4" aria-hidden />
          Müşteriler
        </Link>

        <header className="flex flex-col gap-6 border-b border-line pb-8 md:flex-row md:items-end md:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <span className="figure flex size-14 shrink-0 items-center justify-center rounded-[var(--radius-lg)] border border-line bg-panel text-base text-fg">
              {customer.firstName[0]}
              {customer.lastName[0]}
            </span>
            <div className="min-w-0">
              <p className="label">{customer.company || 'Bireysel'}</p>
              <h1 className="mt-1 text-[clamp(2.25rem,5vw,3.25rem)] text-fg">
                {customer.firstName} {customer.lastName}
              </h1>
              <div className="mt-2">
                <ToneChip tone={st.tone}>{st.label}</ToneChip>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setTaskOpen(true)} className="btn-secondary btn-sm">
              <ListChecks className="size-4" aria-hidden />
              Görev ekle
            </button>
            <Link href={`/opportunities?new=1&customerId=${id}`} className="btn-secondary btn-sm">
              <Plus className="size-4" aria-hidden />
              Fırsat ekle
            </Link>
            <Link href={`/proposals/new?customerId=${id}`} className="btn btn-sm">
              <Plus className="size-4" aria-hidden />
              Teklif hazırla
            </Link>
          </div>
        </header>

        <dl className="grid grid-cols-1 gap-x-8 gap-y-5 py-8 sm:grid-cols-2 lg:grid-cols-3">
          {info.map(([k, v]) => (
            <div key={k} className="min-w-0">
              <dt className="label">{k}</dt>
              <dd className="mt-1.5 text-sm text-fg">{v}</dd>
            </div>
          ))}
          {customer.notes && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="label">Notlar</dt>
              <dd className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-fg-2">{customer.notes}</dd>
            </div>
          )}
        </dl>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="card overflow-hidden" aria-labelledby="c-opps">
            <div className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-4">
              <h2 id="c-opps" className="text-[1.375rem] text-fg">
                Fırsatlar <span className="figure text-sm text-fg-3">{opportunities.length}</span>
              </h2>
              {openValue > 0 && <span className="figure text-sm text-fg-2">açık {money(openValue)}</span>}
            </div>
            {opportunities.length === 0 ? (
              <p className="px-5 py-8 text-sm text-fg-3">Bu müşteriye bağlı fırsat yok.</p>
            ) : (
              <ul>
                {opportunities.map((o) => {
                  const s = stageOf(o.stage);
                  return (
                    <li key={o._id} className="flex items-center gap-3 border-b border-line px-5 py-3.5 last:border-0">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-fg">{o.title}</span>
                        <span className="figure block text-xs text-fg-3">
                          %{o.probability}
                          {o.expectedCloseDate ? ` · ${date(o.expectedCloseDate)}` : ''}
                        </span>
                      </span>
                      <span className="figure text-sm text-fg">{money(o.amount)}</span>
                      <ToneChip tone={s.tone}>{s.label}</ToneChip>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="card overflow-hidden" aria-labelledby="c-props">
            <div className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-4">
              <h2 id="c-props" className="text-[1.375rem] text-fg">
                Teklifler <span className="figure text-sm text-fg-3">{proposals.length}</span>
              </h2>
            </div>
            {proposals.length === 0 ? (
              <p className="px-5 py-8 text-sm text-fg-3">Bu müşteriye hazırlanmış teklif yok.</p>
            ) : (
              <ul>
                {proposals.map((p) => {
                  const ps = PROPOSAL_STATUS[p.status] ?? PROPOSAL_STATUS.draft;
                  return (
                    <li key={p._id} className="border-b border-line last:border-0">
                      <Link href={`/proposals/${p._id}`} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-lift">
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-fg">{p.title}</span>
                          <span className="figure block text-xs text-fg-3">
                            {p.proposalNumber} · {dateLong(p.validUntil)}
                          </span>
                        </span>
                        <span className="figure text-sm text-fg">{money(proposalTotal(p))}</span>
                        <ToneChip tone={ps.tone}>{ps.label}</ToneChip>
                        <ArrowUpRight className="size-4 shrink-0 text-fg-3" aria-hidden />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </Page>

      <Sheet
        open={taskOpen}
        onOpenChange={setTaskOpen}
        title="Yeni görev"
        description={`${customer.firstName} ${customer.lastName} kaydına bağlanır.`}
      >
        <form onSubmit={createTask} className="grid grid-cols-2 gap-4">
          {taskError && (
            <div role="alert" className="notice col-span-2">
              {taskError}
            </div>
          )}
          <Field id="t-title" label="Başlık" className="col-span-2">
            <input
              id="t-title"
              required
              minLength={3}
              value={task.title}
              onChange={(e) => setTask({ ...task, title: e.target.value })}
              className="input"
            />
          </Field>
          <Field id="t-desc" label="Açıklama" className="col-span-2">
            <textarea
              id="t-desc"
              rows={3}
              value={task.description}
              onChange={(e) => setTask({ ...task, description: e.target.value })}
              className="input resize-none"
            />
          </Field>
          <Field id="t-priority" label="Öncelik" className="col-span-2 sm:col-span-1">
            <select id="t-priority" value={task.priority} onChange={(e) => setTask({ ...task, priority: e.target.value })} className="input">
              {Object.entries(PRIORITY).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </Field>
          <Field id="t-due" label="Son tarih" className="col-span-2 sm:col-span-1">
            <input id="t-due" type="date" value={task.dueDate} onChange={(e) => setTask({ ...task, dueDate: e.target.value })} className="input figure" />
          </Field>
          <div className="col-span-2 mt-2 flex gap-2">
            <button type="submit" disabled={taskSaving} className="btn">
              {taskSaving ? 'Kaydediliyor' : 'Görevi ekle'}
            </button>
            <button type="button" onClick={() => setTaskOpen(false)} className="btn-secondary">
              Vazgeç
            </button>
          </div>
        </form>
      </Sheet>
    </AppShell>
  );
}
