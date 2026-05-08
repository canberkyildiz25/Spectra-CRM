'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Giriş başarısız');
      setAuth(data.data.token, data.data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative" style={{ backgroundColor: '#0f172a' }}>

      {/* ── Tam ekran video arka plan ── */}
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          objectPosition: 'center center',
          zIndex: 0,
        }}
      >
        <source src="/demo.mp4" type="video/mp4" />
      </video>
      {/* Genel koyu overlay */}
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 1 }} />

      {/* Sol panel — yarı şeffaf koyu */}
      <div className="hidden lg:flex flex-col w-[480px] shrink-0 px-14 py-16" style={{ position: 'relative', zIndex: 2, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(2px)' }}>
        <div className="relative flex-1 flex flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-stat">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Spectra CRM</span>
          </div>

          {/* Başlık */}
          <div className="flex-1">
            <h2 className="text-4xl font-bold text-white leading-tight mb-5">
              Satışlarınızı<br />bir üst seviyeye<br />taşıyın.
            </h2>
            <p className="text-slate-400 text-[15px] leading-relaxed">
              Pipeline yöneticisi, teklif aracı ve müşteri takibini tek platformda birleştiren CRM çözümü.
            </p>

            {/* Özellik listesi */}
            <div className="mt-10 space-y-3.5">
              {[
                { text: 'Kanban ile satış pipeline yönetimi' },
                { text: 'Profesyonel teklif oluşturma ve PDF çıktısı' },
                { text: 'Müşteri ilişkileri ve görev takibi' },
              ].map(f => (
                <div key={f.text} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-slate-300">{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Alt bilgi */}
          <p className="text-white/20 text-xs">© 2026 Spectra CRM · Tüm hakları saklıdır.</p>
        </div>
      </div>

      {/* Sağ panel — form, video arkada görünür */}
      <div className="flex-1 flex items-center justify-center px-6" style={{ position: 'relative', zIndex: 2 }}>
        <div className="w-full max-w-sm animate-slide-up">
          {/* Cam kart */}
          <div className="bg-slate-900/60 backdrop-blur-lg border border-white/10 rounded-3xl p-8 shadow-2xl">
            {/* Mobil logo */}
            <div className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-8 h-8 bg-gradient-brand rounded-xl flex items-center justify-center">
                <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-bold text-white">Spectra CRM</span>
            </div>

            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white tracking-tight">Tekrar hoşgeldiniz</h1>
              <p className="text-white/50 text-sm mt-1.5">Hesabınıza giriş yapın</p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-rose-500/15 border border-rose-400/30 text-rose-300 text-sm px-4 py-3 rounded-xl mb-5">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-white/50 mb-1.5 uppercase tracking-widest">E-posta</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ornek@email.com"
                  className="w-full px-3.5 py-2.5 bg-white/10 border border-white/15 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all focus:border-brand-400 focus:bg-white/15"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-white/50 mb-1.5 uppercase tracking-widest">Şifre</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-white/10 border border-white/15 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all focus:border-brand-400 focus:bg-white/15 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Giriş yapılıyor...
                  </>
                ) : 'Giriş Yap'}
              </button>
            </form>

            <p className="text-center text-white/40 text-sm mt-7">
              Hesabınız yok mu?{' '}
              <Link href="/auth/register" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
                Kayıt olun
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
