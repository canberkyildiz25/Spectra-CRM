'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Pencil, Printer } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { Page } from '@/components/app/PageHead';
import ToneChip from '@/components/app/ToneChip';
import SpectraMark from '@/components/brand/SpectraMark';
import api from '@/lib/axios';
import { useAuthReady } from '@/lib/store';
import { PROPOSAL_STATUS } from '@/lib/stages';
import { dateLong, moneyExact } from '@/lib/format';

interface Item {
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}
interface Proposal {
  _id: string;
  proposalNumber: string;
  title: string;
  status: string;
  validUntil: string;
  taxRate: number;
  notes?: string;
  paymentTerms?: string;
  items: Item[];
  createdAt: string;
  customerId: { firstName: string; lastName: string; company?: string; email?: string; phone?: string; city?: string } | null;
  opportunityId?: { title: string } | null;
}

/* The proposal document is the one paper surface in the app — it prints.
 * It keeps the app's type and swaps the ground for white, with the scale
 * darkened so every status still clears 4.5:1 on paper (design.md).
 *
 * The old document had a fixed glass toolbar, an emerald glow, gradient
 * totals and a footer naming spectracrm.com, a domain that does not exist.
 */
export default function ProposalDetail() {
  const { id } = useParams<{ id: string }>();
  const authReady = useAuthReady();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [phase, setPhase] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    if (!authReady) return;
    api
      .get(`/proposals/${id}`)
      .then((r) => {
        setProposal(r.data.data);
        setPhase('ready');
      })
      .catch(() => setPhase('missing'));
  }, [id, authReady]);

  if (phase !== 'ready' || !proposal) {
    return (
      <AppShell>
        <Page>
          {phase === 'loading' ? (
            <div className="animate-pulse space-y-4" role="status" aria-label="Yükleniyor">
              <div className="h-10 w-64 rounded bg-lift" />
              <div className="h-[32rem] rounded-[var(--radius-lg)] bg-panel" />
            </div>
          ) : (
            <div className="max-w-md py-16">
              <p className="label">Bulunamadı</p>
              <h1 className="mt-3 text-[2.25rem] text-fg">Bu teklif yok.</h1>
              <Link href="/proposals" className="btn mt-6">
                Tekliflere dön
              </Link>
            </div>
          )}
        </Page>
      </AppShell>
    );
  }

  const subtotal = proposal.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const tax = (subtotal * proposal.taxRate) / 100;
  const total = subtotal + tax;
  const st = PROPOSAL_STATUS[proposal.status] ?? PROPOSAL_STATUS.draft;
  const c = proposal.customerId;

  const meta: [string, string][] = [
    ['Başlık', proposal.title],
    ['Düzenleme', dateLong(proposal.createdAt)],
    ['Geçerlilik', dateLong(proposal.validUntil)],
    ...(proposal.opportunityId ? ([['İlgili fırsat', proposal.opportunityId.title]] as [string, string][]) : []),
  ];

  return (
    <AppShell>
      <Page>
        {/* ── Toolbar ── */}
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/proposals" className="btn-ghost -ml-3">
            <ArrowLeft className="size-4" aria-hidden />
            Teklifler
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <ToneChip tone={st.tone}>{st.label}</ToneChip>
            <Link href={`/proposals/${proposal._id}/edit`} className="btn-secondary btn-sm">
              <Pencil className="size-4" aria-hidden />
              Düzenle
            </Link>
            <button type="button" onClick={() => window.print()} className="btn btn-sm">
              <Printer className="size-4" aria-hidden />
              Yazdır / PDF
            </button>
          </div>
        </div>

        {/* ── Document ── */}
        <article
          className="print-page mx-auto max-w-4xl overflow-hidden rounded-[var(--radius-lg)] bg-paper text-paper-ink print:rounded-none"
          aria-label={`${proposal.proposalNumber} satış teklifi`}
        >
          <header className="flex flex-col gap-6 border-b border-paper-line px-6 py-8 sm:flex-row sm:items-start sm:justify-between sm:px-10">
            <div className="flex items-center gap-2.5">
              <SpectraMark size={20} />
              <span className="wordmark text-base text-paper-ink">Spectra</span>
            </div>
            <div className="sm:text-right">
              <p className="label text-paper-ink-2">Satış teklifi</p>
              <p className="readout mt-2 text-[2.75rem] text-paper-ink">{proposal.proposalNumber}</p>
              <p className="mt-1 text-sm text-paper-ink-2">{st.label}</p>
            </div>
          </header>

          <div className="grid gap-8 border-b border-paper-line px-6 py-8 sm:grid-cols-2 sm:px-10">
            <section>
              <h2 className="label text-paper-ink-2">Müşteri</h2>
              {c ? (
                <div className="mt-3 space-y-0.5 text-sm">
                  <p className="text-base font-semibold text-paper-ink">
                    {c.firstName} {c.lastName}
                  </p>
                  {c.company && <p className="text-paper-ink">{c.company}</p>}
                  {c.email && <p className="text-paper-ink-2">{c.email}</p>}
                  {c.phone && <p className="figure text-paper-ink-2">{c.phone}</p>}
                  {c.city && <p className="text-paper-ink-2">{c.city}</p>}
                </div>
              ) : (
                <p className="mt-3 text-sm text-paper-ink-2">Müşteri kaydı silinmiş.</p>
              )}
            </section>
            <section>
              <h2 className="label text-paper-ink-2">Teklif</h2>
              <dl className="mt-3 space-y-1.5 text-sm">
                {meta.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3">
                    <dt className="text-paper-ink-2">{k}</dt>
                    <dd className="font-medium text-paper-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>

          <section className="px-6 py-8 sm:px-10" aria-labelledby="doc-items">
            <h2 id="doc-items" className="label text-paper-ink-2">
              Ürün ve hizmetler
            </h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[34rem] text-sm">
                <thead>
                  <tr className="border-b-2 border-paper-ink text-left">
                    <th className="label py-2.5 pr-3 text-paper-ink-2">#</th>
                    <th className="label py-2.5 pr-3 text-paper-ink-2">Kalem</th>
                    <th className="label py-2.5 pr-3 text-paper-ink-2">Birim</th>
                    <th className="label py-2.5 pr-3 text-right text-paper-ink-2">Miktar</th>
                    <th className="label py-2.5 pr-3 text-right text-paper-ink-2">Birim fiyat</th>
                    <th className="label py-2.5 text-right text-paper-ink-2">Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  {proposal.items.map((item, i) => (
                    <tr key={i} className="border-b border-paper-line align-top">
                      <td className="figure py-3 pr-3 text-paper-ink-2">{String(i + 1).padStart(2, '0')}</td>
                      <td className="py-3 pr-3">
                        <p className="font-medium text-paper-ink">{item.name}</p>
                        {item.description && <p className="mt-0.5 text-xs text-paper-ink-2">{item.description}</p>}
                      </td>
                      <td className="py-3 pr-3 text-paper-ink-2">{item.unit}</td>
                      <td className="figure py-3 pr-3 text-right text-paper-ink">{item.quantity}</td>
                      <td className="figure py-3 pr-3 text-right text-paper-ink">{moneyExact(item.unitPrice)}</td>
                      <td className="figure py-3 text-right text-paper-ink">{moneyExact(item.quantity * item.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <dl className="ml-auto mt-6 max-w-xs space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-paper-ink-2">Ara toplam</dt>
                <dd className="figure text-paper-ink">{moneyExact(subtotal)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-paper-ink-2">KDV (%{proposal.taxRate})</dt>
                <dd className="figure text-paper-ink">{moneyExact(tax)}</dd>
              </div>
              <div className="flex items-end justify-between gap-4 border-t-2 border-paper-ink pt-3">
                <dt className="label text-paper-ink-2">Genel toplam</dt>
                <dd className="readout text-[2.25rem] text-paper-ink">{moneyExact(total)}</dd>
              </div>
            </dl>
          </section>

          {(proposal.paymentTerms || proposal.notes) && (
            <div className="grid gap-6 border-t border-paper-line px-6 py-8 sm:grid-cols-2 sm:px-10">
              {proposal.paymentTerms && (
                <section>
                  <h2 className="label text-paper-ink-2">Ödeme koşulları</h2>
                  <p className="mt-2 text-sm text-paper-ink">{proposal.paymentTerms}</p>
                </section>
              )}
              {proposal.notes && (
                <section>
                  <h2 className="label text-paper-ink-2">Notlar</h2>
                  <p className="mt-2 whitespace-pre-line text-sm text-paper-ink">{proposal.notes}</p>
                </section>
              )}
            </div>
          )}

          <div className="grid gap-10 border-t border-paper-line px-6 py-10 sm:grid-cols-2 sm:px-10">
            {['Hazırlayan', 'Müşteri onayı'].map((label) => (
              <div key={label}>
                <div className="h-14 border-b border-paper-ink" />
                <p className="mt-2 text-xs text-paper-ink-2">{label} · imza ve tarih</p>
              </div>
            ))}
          </div>

          <footer className="flex flex-wrap justify-between gap-2 border-t border-paper-line px-6 py-4 text-xs text-paper-ink-2 sm:px-10">
            <span>Spectra CRM ile hazırlandı</span>
            <span className="figure">
              {proposal.proposalNumber} · {dateLong(proposal.createdAt)}
            </span>
          </footer>
        </article>
      </Page>
    </AppShell>
  );
}
