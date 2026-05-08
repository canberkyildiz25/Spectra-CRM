import Link from 'next/link';

type Variant = 'customers' | 'proposals' | 'opportunities' | 'tasks';

const configs: Record<Variant, {
  illustration: React.ReactNode;
  title: string;
  desc: string;
}> = {
  customers: {
    illustration: (
      <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Arka çember */}
        <circle cx="60" cy="52" r="36" fill="#f1f5f9" />
        {/* Merkez avatar */}
        <circle cx="60" cy="44" r="14" fill="#cbd5e1" />
        <path d="M36 76c0-13.255 10.745-24 24-24s24 10.745 24 24" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* Sol avatar */}
        <circle cx="30" cy="50" r="10" fill="#e2e8f0" />
        <path d="M14 72c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Sağ avatar */}
        <circle cx="90" cy="50" r="10" fill="#e2e8f0" />
        <path d="M74 72c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Artı ikonu */}
        <circle cx="82" cy="28" r="10" fill="#10b981" />
        <path d="M82 23v10M77 28h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: 'Henüz müşteri yok',
    desc: 'İlk müşterinizi ekleyerek başlayın.',
  },
  proposals: {
    illustration: (
      <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Arka belge */}
        <rect x="30" y="18" width="52" height="66" rx="6" fill="#e2e8f0" />
        {/* Ön belge */}
        <rect x="22" y="12" width="52" height="66" rx="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />
        {/* Satırlar */}
        <rect x="32" y="26" width="32" height="3.5" rx="1.75" fill="#cbd5e1" />
        <rect x="32" y="35" width="42" height="3" rx="1.5" fill="#e2e8f0" />
        <rect x="32" y="43" width="38" height="3" rx="1.5" fill="#e2e8f0" />
        <rect x="32" y="51" width="42" height="3" rx="1.5" fill="#e2e8f0" />
        {/* Fiyat kutusu */}
        <rect x="32" y="62" width="42" height="10" rx="3" fill="#ecfdf5" stroke="#10b981" strokeWidth="1" />
        <rect x="36" y="65.5" width="20" height="3" rx="1.5" fill="#10b981" opacity="0.5" />
        <rect x="60" y="65.5" width="10" height="3" rx="1.5" fill="#10b981" />
        {/* Artı ikonu */}
        <circle cx="82" cy="22" r="10" fill="#10b981" />
        <path d="M82 17v10M77 22h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: 'Henüz teklif yok',
    desc: 'Profesyonel teklifler oluşturun ve PDF olarak indirin.',
  },
  opportunities: {
    illustration: (
      <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Arka zemin */}
        <rect x="10" y="72" width="100" height="3" rx="1.5" fill="#e2e8f0" />
        {/* Bar 1 */}
        <rect x="20" y="52" width="16" height="20" rx="3" fill="#e2e8f0" />
        {/* Bar 2 */}
        <rect x="42" y="38" width="16" height="34" rx="3" fill="#cbd5e1" />
        {/* Bar 3 — emerald */}
        <rect x="64" y="24" width="16" height="48" rx="3" fill="#10b981" opacity="0.8" />
        {/* Bar 4 */}
        <rect x="86" y="44" width="16" height="28" rx="3" fill="#e2e8f0" />
        {/* Trend çizgisi */}
        <path d="M28 54 L50 40 L72 26 L94 46" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 2" fill="none" />
        {/* Artı */}
        <circle cx="90" cy="18" r="10" fill="#10b981" />
        <path d="M90 13v10M85 18h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: 'Henüz fırsat yok',
    desc: 'Satış fırsatlarınızı takip etmeye başlayın.',
  },
  tasks: {
    illustration: (
      <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Pano */}
        <rect x="22" y="14" width="76" height="72" rx="7" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />
        {/* Üst şerit */}
        <rect x="22" y="14" width="76" height="16" rx="7" fill="#e2e8f0" />
        <rect x="22" y="22" width="76" height="8" fill="#e2e8f0" />
        <circle cx="34" cy="22" r="4" fill="#cbd5e1" />
        {/* Satır 1 — tamamlandı */}
        <rect x="32" y="40" width="14" height="8" rx="2" fill="#10b981" opacity="0.2" />
        <path d="M35 44l2.5 2.5 4-4" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="52" y="42" width="30" height="4" rx="2" fill="#10b981" opacity="0.3" />
        {/* Satır 2 — tamamlandı */}
        <rect x="32" y="54" width="14" height="8" rx="2" fill="#10b981" opacity="0.2" />
        <path d="M35 58l2.5 2.5 4-4" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="52" y="56" width="24" height="4" rx="2" fill="#10b981" opacity="0.3" />
        {/* Satır 3 — boş */}
        <rect x="32" y="68" width="14" height="8" rx="2" fill="#e2e8f0" />
        <rect x="52" y="70" width="36" height="4" rx="2" fill="#e2e8f0" />
        {/* Artı */}
        <circle cx="88" cy="22" r="8" fill="#10b981" />
        <path d="M88 18v8M84 22h8" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    title: 'Henüz görev yok',
    desc: 'Görevler ekleyerek işlerinizi organize edin.',
  },
};

interface Props {
  variant: Variant;
  ctaLabel?: string;
  ctaHref?: string;
  onCta?: () => void;
}

export default function EmptyState({ variant, ctaLabel, ctaHref, onCta }: Props) {
  const { illustration, title, desc } = configs[variant];

  return (
    <div className="card py-16 flex flex-col items-center justify-center text-center">
      {/* Floating illustration */}
      <div
        className="w-32 h-28 mb-6"
        style={{ animation: 'emptyFloat 3s ease-in-out infinite' }}
      >
        {illustration}
      </div>

      <h3 className="text-base font-semibold text-slate-700 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 mb-6 max-w-xs">{desc}</p>

      {ctaHref && (
        <Link href={ctaHref} className="btn-primary inline-flex">
          {ctaLabel ?? 'Ekle'} →
        </Link>
      )}
      {onCta && !ctaHref && (
        <button onClick={onCta} className="btn-primary">
          {ctaLabel ?? 'Ekle'} →
        </button>
      )}

      <style jsx>{`
        @keyframes emptyFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
