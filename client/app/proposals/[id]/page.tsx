'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/axios';

interface Item { name: string; description?: string; quantity: number; unit: string; unitPrice: number; }
interface Proposal {
  _id: string; proposalNumber: string; title: string; status: string;
  validUntil: string; taxRate: number; notes?: string; paymentTerms?: string;
  items: Item[]; createdAt: string;
  customerId: { firstName: string; lastName: string; company?: string; email?: string; phone?: string; city?: string; };
  opportunityId?: { title: string };
}

const statusConfig: Record<string, { label: string; bg: string; color: string; border: string }> = {
  draft:    { label: 'Taslak',       bg: '#f8fafc', color: '#475569', border: '#e2e8f0' },
  sent:     { label: 'Gönderildi',   bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  accepted: { label: 'Kabul Edildi', bg: '#ecfdf5', color: '#065f46', border: '#6ee7b7' },
  rejected: { label: 'Reddedildi',   bg: '#fff1f2', color: '#be123c', border: '#fecdd3' },
};

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 2 }).format(n);

export default function ProposalDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/proposals/${id}`).then(r => setProposal(r.data.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#f8fafc' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        <p className="text-sm text-slate-400">Yükleniyor...</p>
      </div>
    </div>
  );

  if (!proposal) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#f8fafc' }}>
      <p className="text-sm text-rose-500">Teklif bulunamadı</p>
    </div>
  );

  const subtotal = proposal.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const tax = subtotal * proposal.taxRate / 100;
  const total = subtotal + tax;
  const sc = statusConfig[proposal.status] ?? statusConfig.draft;
  const isAccepted = proposal.status === 'accepted';

  return (
    <ProtectedRoute>
      {/* ── Toolbar ─────────────────────────────────── */}
      <div className="no-print fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3"
        style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f1f5f9', boxShadow: '0 1px 8px rgba(0,0,0,.06)' }}>
        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Teklifler
        </button>

        <div className="flex items-center gap-2">
          {/* Status badge */}
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
            {sc.label}
          </span>
          <button onClick={() => router.push(`/proposals/${id}/edit`)}
            className="btn-secondary text-sm py-2">
            Düzenle
          </button>
          <button onClick={() => window.print()}
            className="btn-primary text-sm py-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            PDF / Yazdır
          </button>
        </div>
      </div>

      {/* ── Document ────────────────────────────────── */}
      <div className="print-page pt-16 pb-16 min-h-screen" style={{ background: '#f1f5f9' }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl overflow-hidden print:rounded-none print:shadow-none"
            style={{ boxShadow: '0 4px 40px rgba(0,0,0,.10)' }}>

            {/* ── Document header ───────────────────── */}
            <div className="relative overflow-hidden px-10 py-8"
              style={{ background: 'linear-gradient(135deg, #0d1117 0%, #0f172a 100%)' }}>
              {/* Emerald glow */}
              <div className="absolute -top-10 -right-10 w-56 h-56 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,.2) 0%, transparent 65%)' }} />
              <div className="absolute bottom-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(16,185,129,.4), transparent)' }} />

              <div className="relative flex items-start justify-between">
                {/* Brand */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg,#059669,#10b981)', boxShadow: '0 0 16px rgba(16,185,129,.4)' }}>
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg tracking-tight">Spectra CRM</p>
                      <p className="text-emerald-400/60 text-[10px] tracking-widest uppercase">Müşteri İlişkileri</p>
                    </div>
                  </div>
                </div>

                {/* Proposal title block */}
                <div className="text-right">
                  <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Satış Teklifi</p>
                  <p className="text-white font-mono font-bold text-lg">{proposal.proposalNumber}</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.color }} />
                    {sc.label}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-10 py-8">

              {/* ── Info grid ─────────────────────────── */}
              <div className="grid grid-cols-2 gap-8 mb-8 pb-8" style={{ borderBottom: '1px solid #f1f5f9' }}>
                {/* Customer */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Müşteri Bilgileri</p>
                  <p className="font-bold text-slate-900 text-base mb-1">
                    {proposal.customerId.firstName} {proposal.customerId.lastName}
                  </p>
                  {proposal.customerId.company && (
                    <p className="text-slate-600 text-sm font-medium">{proposal.customerId.company}</p>
                  )}
                  <div className="mt-2 space-y-0.5">
                    {proposal.customerId.email && (
                      <p className="text-slate-500 text-sm flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {proposal.customerId.email}
                      </p>
                    )}
                    {proposal.customerId.phone && (
                      <p className="text-slate-500 text-sm flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {proposal.customerId.phone}
                      </p>
                    )}
                    {proposal.customerId.city && (
                      <p className="text-slate-500 text-sm flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {proposal.customerId.city}
                      </p>
                    )}
                  </div>
                </div>

                {/* Proposal meta */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Teklif Detayları</p>
                  <div className="space-y-2">
                    {[
                      { label: 'Teklif Başlığı', value: proposal.title },
                      { label: 'Düzenleme Tarihi', value: new Date(proposal.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) },
                      { label: 'Geçerlilik Tarihi', value: new Date(proposal.validUntil).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) },
                      ...(proposal.opportunityId ? [{ label: 'İlgili Fırsat', value: proposal.opportunityId.title }] : []),
                    ].map(row => (
                      <div key={row.label} className="flex gap-2">
                        <span className="text-xs text-slate-400 w-32 shrink-0 pt-0.5">{row.label}</span>
                        <span className="text-sm font-medium text-slate-800">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Items table ───────────────────────── */}
              <div className="mb-8">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Ürün / Hizmet Listesi</p>
                <div className="overflow-hidden rounded-xl" style={{ border: '1px solid #f1f5f9' }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: 'linear-gradient(135deg, #0d1117, #0f172a)' }}>
                        <th className="text-left py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500 w-8">#</th>
                        <th className="text-left py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Ürün / Hizmet</th>
                        <th className="text-center py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Birim</th>
                        <th className="text-right py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Miktar</th>
                        <th className="text-right py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Birim Fiyat</th>
                        <th className="text-right py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">Toplam</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proposal.items.map((item, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? '#ffffff' : '#fafbfc', borderBottom: '1px solid #f8fafc' }}>
                          <td className="py-3.5 px-4 text-slate-400 text-xs">{i + 1}</td>
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-slate-900">{item.name}</p>
                            {item.description && <p className="text-slate-400 text-xs mt-0.5">{item.description}</p>}
                          </td>
                          <td className="py-3.5 px-4 text-center text-slate-500">{item.unit}</td>
                          <td className="py-3.5 px-4 text-right text-slate-600 font-medium">{item.quantity}</td>
                          <td className="py-3.5 px-4 text-right text-slate-600">{fmt(item.unitPrice)}</td>
                          <td className="py-3.5 px-4 text-right font-bold text-slate-900">{fmt(item.quantity * item.unitPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── Totals ────────────────────────────── */}
              <div className="flex justify-end mb-8">
                <div className="w-80">
                  <div className="space-y-1 mb-3">
                    <div className="flex justify-between py-2 text-sm" style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <span className="text-slate-500">Ara Toplam</span>
                      <span className="font-medium text-slate-800">{fmt(subtotal)}</span>
                    </div>
                    <div className="flex justify-between py-2 text-sm" style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <span className="text-slate-500">KDV (%{proposal.taxRate})</span>
                      <span className="font-medium text-slate-800">{fmt(tax)}</span>
                    </div>
                  </div>
                  {/* Total card */}
                  <div className="rounded-xl px-5 py-4 flex items-center justify-between"
                    style={{ background: isAccepted ? 'linear-gradient(135deg,#059669,#10b981)' : 'linear-gradient(135deg,#0d1117,#0f172a)', boxShadow: isAccepted ? '0 4px 20px rgba(16,185,129,.3)' : '0 4px 20px rgba(0,0,0,.2)' }}>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Genel Toplam</p>
                      {isAccepted && <p className="text-[10px] text-emerald-300/70 mt-0.5">Kabul edildi</p>}
                    </div>
                    <p className="text-2xl font-bold text-white">{fmt(total)}</p>
                  </div>
                </div>
              </div>

              {/* ── Terms & Notes ─────────────────────── */}
              {(proposal.paymentTerms || proposal.notes) && (
                <div className="grid grid-cols-2 gap-6 pt-6 mb-8" style={{ borderTop: '1px solid #f1f5f9' }}>
                  {proposal.paymentTerms && (
                    <div className="rounded-xl p-4" style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Ödeme Koşulları</p>
                      <p className="text-sm text-slate-700">{proposal.paymentTerms}</p>
                    </div>
                  )}
                  {proposal.notes && (
                    <div className="rounded-xl p-4" style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Notlar</p>
                      <p className="text-sm text-slate-700 whitespace-pre-line">{proposal.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── Signature ─────────────────────────── */}
              <div className="grid grid-cols-2 gap-16 pt-8" style={{ borderTop: '1px solid #f1f5f9' }}>
                {[{ label: 'Hazırlayan / Yetkili İmzası' }, { label: 'Müşteri Onayı / İmzası' }].map(sig => (
                  <div key={sig.label}>
                    <div className="h-14 mb-3 rounded-lg" style={{ borderBottom: '1.5px dashed #e2e8f0' }} />
                    <p className="text-[11px] text-slate-400">{sig.label}</p>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-8 pt-5 flex items-center justify-between" style={{ borderTop: '1px solid #f1f5f9' }}>
                <p className="text-[11px] text-slate-300">Spectra CRM · spectracrm.com</p>
                <p className="text-[11px] text-slate-300">{proposal.proposalNumber} · {new Date(proposal.createdAt).toLocaleDateString('tr-TR')}</p>
              </div>

            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-page { padding-top: 0 !important; background: white !important; }
          @page { margin: 1cm; }
        }
      `}</style>
    </ProtectedRoute>
  );
}
