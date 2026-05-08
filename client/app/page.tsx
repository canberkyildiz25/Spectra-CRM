import Link from 'next/link';

const features = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Pipeline Yönetimi',
    desc: 'Kanban görünümüyle fırsatlarınızı aşama aşama takip edin, sürükle-bırak ile taşıyın.',
    gradient: 'bg-gradient-brand',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Teklif Oluşturma',
    desc: 'Profesyonel teklifler oluşturun, PDF olarak indirin ve müşterilerinize gönderin.',
    gradient: 'bg-gradient-success',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Müşteri Takibi',
    desc: 'Tüm müşteri bilgilerini, iletişim geçmişini ve ilişkili fırsatları tek yerde görün.',
    gradient: 'bg-gradient-info',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    title: 'Görev Yönetimi',
    desc: 'Görevler oluşturun, öncelik belirleyin ve tek tıkla tamamlandı olarak işaretleyin.',
    gradient: 'bg-gradient-warning',
  },
];

const stats = [
  { value: '3.2x', label: 'Daha Fazla Satış' },
  { value: '%94', label: 'Müşteri Memnuniyeti' },
  { value: '2dk', label: 'Kurulum Süresi' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">

      {/* Emerald glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] opacity-25 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, #10b981 0%, transparent 65%)' }} />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center shadow-stat">
            <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '18px', height: '18px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight">Spectra CRM</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Giriş Yap</Link>
          <Link href="/auth/register" className="px-4 py-2 bg-white text-slate-900 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-colors">Ücretsiz Başla</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-20 pb-24 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
          Satışlarınızı{' '}
          <span className="bg-gradient-to-r from-brand-400 to-emerald-300 bg-clip-text text-transparent">
            bir üst seviyeye
          </span>
          {' '}taşıyın
        </h1>
        <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Pipeline yönetimi, profesyonel teklif aracı ve müşteri takibini tek platformda birleştiren modern CRM çözümü.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/auth/register" className="px-6 py-3 bg-gradient-brand text-white rounded-xl font-semibold text-sm hover:opacity-90 transition shadow-stat">
            Hemen Başla →
          </Link>
          <Link href="/auth/login" className="px-6 py-3 bg-white/10 border border-white/10 text-white rounded-xl font-semibold text-sm hover:bg-white/15 transition backdrop-blur-sm">
            Giriş Yap
          </Link>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-10 mt-14 flex-wrap">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-white mb-3">İhtiyacınız olan her şey</h2>
          <p className="text-slate-400 text-sm">Satış sürecinizi uçtan uca yönetmek için tasarlandı</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map(f => (
            <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition backdrop-blur-sm group">
              <div className={`w-10 h-10 rounded-xl ${f.gradient} flex items-center justify-center text-white mb-4`}>
                {f.icon}
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-2xl mx-auto px-8 pb-24 text-center">
        <div className="bg-brand-500/8 border border-brand-500/15 rounded-3xl p-10 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-3">Bugün başlayın</h2>
          <p className="text-slate-400 text-sm mb-6">Dakikalar içinde kurulum yapın, hemen kullanmaya başlayın.</p>
          <Link href="/auth/register" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-brand text-white rounded-xl font-semibold text-sm hover:opacity-90 transition shadow-stat">
            Ücretsiz Hesap Oluştur
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center pb-8 text-xs text-slate-600">
        © 2026 Spectra CRM · Tüm hakları saklıdır.
      </footer>
    </div>
  );
}
