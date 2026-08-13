'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';

// seed.ts bu hesabı oluşturuyor - ikisi birlikte değişmeli.
const DEMO_CREDENTIALS = { email: 'demo@spectra.com', password: 'demo1234' };

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

  // Demo girişi state güncellemesini beklemeden gönderebilsin diye
  // kimlik bilgileri parametre olarak geçiliyor.
  const login = async (credentials: { email: string; password: string }) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(formData);
  };

  const handleDemoLogin = async () => {
    setFormData(DEMO_CREDENTIALS);
    await login(DEMO_CREDENTIALS);
  };

  return (
    <div className="min-h-screen flex relative" style={{ backgroundColor: 'var(--color-rail)' }}>
      {/* The autoplaying background video is gone. It was a 13.9 MB download on
          the first screen anyone sees, looping behind a form — motion competing
          with the one thing the page asks you to do. */}

      {/* Sol panel — yarı şeffaf koyu */}
      {/* Translucency and a backdrop blur existed to let the video through.
          With nothing behind it, the panel is simply the rail tone. */}
      <div
        className="hidden lg:flex flex-col w-[480px] shrink-0 px-14 py-16"
        style={{
          position: 'relative',
          zIndex: 2,
          background: 'var(--color-rail)',
          borderRight: '1px solid var(--color-rail-rule)',
        }}
      >
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

      {/* Right panel — the form sits on paper. It used to be a dark glass card
          floating on the video; with the video gone, glass over nothing is just
          a blurred rectangle. */}
      <div
        className="flex-1 flex items-center justify-center px-6 py-16"
        style={{ position: 'relative', zIndex: 2, background: 'var(--color-paper)' }}
      >
        <div className="w-full max-w-sm animate-fade-in">
          <div>
            {/* Mobil logo */}
            <div className="flex items-center gap-2 mb-8 lg:hidden">
              <div
                className="w-8 h-8 flex items-center justify-center"
                style={{ background: 'var(--color-accent)', borderRadius: 'var(--radius-md)' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="var(--color-paper)" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-semibold">Spectra CRM</span>
            </div>

            <div className="mb-7">
              <p className="label mb-2">Giriş</p>
              <h1 className="text-2xl">Tekrar hoş geldiniz</h1>
              <p className="mt-1.5 text-sm text-ink-2">Hesabınıza giriş yapın.</p>
            </div>

            {/* Demo erişimi - portfolyoya bakan biri kayıt olmadan gezebilsin */}
            <div
              className="mb-6 p-4"
              style={{
                background: 'var(--color-accent-wash)',
                border: '1px solid color-mix(in oklch, var(--color-accent) 25%, transparent)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <div className="mb-2.5 flex items-center justify-between gap-3">
                <span className="label" style={{ color: 'var(--color-accent-ink)' }}>
                  Demo hesabı
                </span>
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={loading}
                  className="btn-ghost text-xs disabled:opacity-40"
                  style={{ color: 'var(--color-accent-ink)' }}
                >
                  Tek tıkla gir
                </button>
              </div>
              <p className="text-[13px] leading-relaxed text-ink-2">
                Kayıt olmadan incelemek için:{' '}
                <span className="figure text-ink">{DEMO_CREDENTIALS.email}</span>
                {' / '}
                <span className="figure text-ink">{DEMO_CREDENTIALS.password}</span>
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2.5 px-4 py-3 text-sm"
                style={{
                  background: 'var(--color-accent-wash)',
                  border: '1px solid color-mix(in oklch, var(--color-accent) 35%, transparent)',
                  color: 'var(--color-accent-ink)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label block mb-1.5">E-posta</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ornek@email.com"
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label block mb-1.5">Şifre</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="input pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink-2 transition-colors"
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

            <p className="mt-7 text-center text-sm text-ink-2">
              Hesabınız yok mu?{' '}
              <Link href="/auth/register" className="font-medium transition-colors" style={{ color: 'var(--color-accent-ink)' }}>
                Kayıt olun
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
