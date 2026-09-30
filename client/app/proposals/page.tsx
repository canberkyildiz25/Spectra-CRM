'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Ellipsis, Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import AppShell from '@/components/AppShell';
import PageHead, { Page } from '@/components/app/PageHead';
import ToneChip, { ToneDot } from '@/components/app/ToneChip';
import EmptyState from '@/components/EmptyState';
import ConfirmDelete from '@/components/ConfirmDelete';
import { toast } from '@/components/Toast';
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
import { PROPOSAL_STATUS } from '@/lib/stages';
import { date, money, moneyShort } from '@/lib/format';

type Status = 'draft' | 'sent' | 'accepted' | 'rejected';
interface Proposal {
  _id: string;
  proposalNumber: string;
  title: string;
  customerId: { firstName: string; lastName: string; company?: string } | null;
  status: Status;
  validUntil: string;
  items: { unitPrice: number; quantity: number }[];
  taxRate: number;
}

const total = (p: Proposal) => p.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0) * (1 + p.taxRate / 100);
const ORDER: Status[] = ['sent', 'accepted', 'rejected', 'draft'];

export default function Proposals() {
  const router = useRouter();
  const authReady = useAuthReady();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | Status>('all');
  const [pendingDelete, setPendingDelete] = useState<Proposal | null>(null);
  // Read once: "expired" is judged against when the page was opened.
  const [now] = useState(() => Date.now());

  useEffect(() => {
    if (!authReady) return;
    api
      .get('/proposals')
      .then((r) => setProposals(r.data.data))
      .catch(() => toast.error('Teklifler yüklenemedi'))
      .finally(() => setLoading(false));
  }, [authReady]);

  const groups = useMemo(() => {
    const g: Record<string, { count: number; value: number }> = { all: { count: 0, value: 0 } };
    for (const p of proposals) {
      g[p.status] ??= { count: 0, value: 0 };
      g[p.status].count += 1;
      g[p.status].value += total(p);
      g.all.count += 1;
      g.all.value += total(p);
    }
    return g;
  }, [proposals]);

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase('tr');
    return proposals.filter(
      (p) =>
        (filter === 'all' || p.status === filter) &&
        (!q ||
          `${p.title} ${p.proposalNumber} ${p.customerId?.firstName ?? ''} ${p.customerId?.lastName ?? ''} ${p.customerId?.company ?? ''}`
            .toLocaleLowerCase('tr')
            .includes(q)),
    );
  }, [proposals, search, filter]);

  const setStatus = async (p: Proposal, status: Status) => {
    const before = proposals;
    setProposals((list) => list.map((x) => (x._id === p._id ? { ...x, status } : x)));
    try {
      await api.put(`/proposals/${p._id}`, { status });
      toast.success(`${p.proposalNumber} → ${PROPOSAL_STATUS[status].label}`);
    } catch {
      setProposals(before);
      toast.error('Durum güncellenemedi');
    }
  };

  /* window.confirm() is gone here too: it cannot name the document it is
     about to destroy, and some browsers let the user suppress it. */
  const remove = async () => {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setPendingDelete(null);
    try {
      await api.delete(`/proposals/${target._id}`);
      setProposals((list) => list.filter((x) => x._id !== target._id));
      toast.success('Teklif silindi');
    } catch {
      toast.error('Silme başarısız');
    }
  };


  return (
    <AppShell>
      <Page>
        <PageHead
          label="Belgeler"
          title="Teklifler"
          meta={`${proposals.length} teklif · ${money(groups.accepted?.value ?? 0)} kabul edildi`}
          actions={
            <Link href="/proposals/new" className="btn btn-sm">
              <Plus className="size-4" aria-hidden />
              Yeni teklif
            </Link>
          }
        />

        {/* The summary is the filter: each cell narrows the list to its status. */}
        <div
          role="group"
          aria-label="Duruma göre süz"
          className="grid grid-cols-2 overflow-hidden rounded-[var(--radius-lg)] border border-line bg-panel sm:grid-cols-5"
        >
          {(['all', ...ORDER] as const).map((k, i) => {
            const g = groups[k] ?? { count: 0, value: 0 };
            const pressed = filter === k;
            return (
              <button
                key={k}
                type="button"
                aria-pressed={pressed}
                onClick={() => setFilter(pressed && k !== 'all' ? 'all' : k)}
                className={`relative px-4 py-4 text-left transition-colors ${pressed ? 'bg-lift' : 'hover:bg-lift/60'} ${
                  i > 0 ? 'border-line max-sm:border-t sm:border-l' : 'max-sm:col-span-2'
                } ${i % 2 === 0 && i > 0 ? 'max-sm:border-l' : ''}`}
              >
                {pressed && <span className="absolute inset-x-0 top-0 h-[2px] bg-fg" aria-hidden />}
                <span className="flex items-center gap-2">
                  {k !== 'all' && <ToneDot tone={PROPOSAL_STATUS[k].tone} />}
                  <span className="label">{k === 'all' ? 'Tümü' : PROPOSAL_STATUS[k].label}</span>
                </span>
                <span className="readout mt-2 block text-[2rem] text-fg">{g.count}</span>
                <span className="figure mt-1 block text-xs text-fg-2">{moneyShort(g.value)}</span>
              </button>
            );
          })}
        </div>

        <div className="relative mt-5 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-3" aria-hidden />
          <label htmlFor="p-search" className="sr-only">
            Teklif ara
          </label>
          <input
            id="p-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Numara, başlık ya da müşteri"
            className="input pl-9"
          />
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="table-wrap" role="status" aria-label="Yükleniyor">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex animate-pulse gap-6 border-b border-line px-4 py-5 last:border-0">
                  <div className="h-3 w-24 rounded bg-lift" />
                  <div className="h-3 flex-1 rounded bg-lift" />
                  <div className="h-3 w-20 rounded bg-lift" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              variant={proposals.length ? 'search' : 'proposals'}
              ctaLabel="Yeni teklif"
              ctaHref={proposals.length ? undefined : '/proposals/new'}
            />
          ) : (
            <div className="table-wrap">
              <table className="data-table stack">
                <thead>
                  <tr>
                    <th>Teklif</th>
                    <th>Müşteri</th>
                    <th className="num">Tutar</th>
                    <th>Durum</th>
                    <th>Geçerlilik</th>
                    <th>
                      <span className="sr-only">İşlemler</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const st = PROPOSAL_STATUS[p.status] ?? PROPOSAL_STATUS.draft;
                    const expired = new Date(p.validUntil).getTime() < now && (p.status === 'sent' || p.status === 'draft');
                    return (
                      <tr key={p._id}>
                        <td className="pr-12 md:pr-4">
                          <Link href={`/proposals/${p._id}`} className="group block">
                            <span className="figure block text-xs text-fg-3 group-hover:text-fg-2">{p.proposalNumber}</span>
                            <span className="block font-medium text-fg underline decoration-transparent underline-offset-4 transition-colors group-hover:decoration-fg-3">
                              {p.title}
                            </span>
                          </Link>
                        </td>
                        <td data-label="Müşteri" className="text-fg-2">
                          {p.customerId ? `${p.customerId.firstName} ${p.customerId.lastName}` : '—'}
                          {p.customerId?.company && <span className="block text-xs text-fg-3">{p.customerId.company}</span>}
                        </td>
                        <td data-label="Tutar" className="num text-fg">
                          {money(total(p))}
                        </td>
                        <td data-label="Durum">
                          <ToneChip tone={st.tone}>{st.label}</ToneChip>
                        </td>
                        <td data-label="Geçerlilik" className="figure text-fg-2">
                          {date(p.validUntil)}
                          {expired && <span className="block font-sans text-xs text-fg-3">süresi doldu</span>}
                        </td>
                        <td className="row-actions text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              aria-label={`${p.proposalNumber} için işlemler`}
                              className="inline-flex size-8 items-center justify-center rounded-[var(--radius-md)] text-fg-3 transition-colors hover:bg-lift hover:text-fg data-[state=open]:bg-lift"
                            >
                              <Ellipsis className="size-4" aria-hidden />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-52">
                              <DropdownMenuItem onSelect={() => router.push(`/proposals/${p._id}`)}>
                                <Eye aria-hidden />
                                Belgeyi aç
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => router.push(`/proposals/${p._id}/edit`)}>
                                <Pencil aria-hidden />
                                Düzenle
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Durumu değiştir</DropdownMenuLabel>
                              {ORDER.filter((s) => s !== p.status).map((s) => (
                                <DropdownMenuItem key={s} onSelect={() => setStatus(p, s)}>
                                  <ToneDot tone={PROPOSAL_STATUS[s].tone} />
                                  {PROPOSAL_STATUS[s].label}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem variant="destructive" onSelect={() => setTimeout(() => setPendingDelete(p), 0)}>
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
        </div>
      </Page>

      <ConfirmDelete
        target={pendingDelete}
        onCancel={() => setPendingDelete(null)}
        onConfirm={remove}
        name={(p) => p.proposalNumber}
        detail={(p) => `“${p.title}” teklifi ve kalemleri kaldırılır.`}
      />
    </AppShell>
  );
}
