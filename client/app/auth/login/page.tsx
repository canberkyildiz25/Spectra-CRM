'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, LoaderCircle, TriangleAlert } from 'lucide-react';
import AuthFrame from '@/components/auth/AuthFrame';
import { useAuthStore } from '@/lib/store';
import { DEMO_CREDENTIALS } from '@/lib/demo';
import { errorText } from '@/lib/format';

export default function Login() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [pending, setPending] = useState<'form' | 'demo' | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  // Credentials are passed in rather than read from state, so the demo button
  // can submit without waiting for a render.
  const login = async (credentials: { email: string; password: string }, via: 'form' | 'demo') => {
    setPending(via);
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
    } catch (err) {
      setError(errorText(err, 'Giriş başarısız'));
      setPending(null);
    }
  };

  return (
    <AuthFrame>
      <p className="label">Giriş</p>
      <h1 className="mt-3 text-[2.5rem] text-fg">Tekrar hoş geldiniz.</h1>
      <p className="mt-2 text-sm text-fg-2">Hesabınızla girin ya da demo hesabını kullanın.</p>

      {/* Demo access — a portfolio visitor should get in without signing up. */}
      <section className="mt-8 rounded-[var(--radius-lg)] border border-line bg-panel p-4" aria-labelledby="demo-title">
        <div className="flex items-center justify-between gap-3">
          <h2 id="demo-title" className="label text-fg-2">
            Demo hesabı
          </h2>
          <span className="flex gap-1" aria-hidden>
            {(['cold', 'cool', 'warm', 'hot', 'won'] as const).map((t) => (
              <span key={t} className="h-2.5 w-1 rounded-[1px]" style={{ background: `var(--color-${t})` }} />
            ))}
          </span>
        </div>
        <p className="mt-2 text-[0.8125rem] leading-relaxed text-fg-2">
          Kayıt olmadan incelemek için{' '}
          <span className="figure text-fg">{DEMO_CREDENTIALS.email}</span> /{' '}
          <span className="figure text-fg">{DEMO_CREDENTIALS.password}</span>
        </p>
        <button
          type="button"
          onClick={() => login(DEMO_CREDENTIALS, 'demo')}
          disabled={pending !== null}
          className="btn-secondary mt-4 w-full"
        >
          {pending === 'demo' && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
          {pending === 'demo' ? 'Giriliyor' : 'Demo hesabıyla gir'}
        </button>
      </section>

      {error && (
        <div role="alert" className="notice mt-6">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
          {error}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          login(form, 'form');
        }}
        className="mt-8 space-y-4"
      >
        <div>
          <label htmlFor="email" className="label field-label">
            E-posta
          </label>
          <input
            id="email"
            type="email"
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={onChange}
            placeholder="ornek@sirket.com"
            className="input"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="label field-label">
            Şifre
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="current-password"
              value={form.password}
              onChange={onChange}
              className="input pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
              aria-pressed={showPassword}
              className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-[var(--radius-md)] text-fg-3 transition-colors hover:text-fg"
            >
              {showPassword ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={pending !== null} className="btn mt-2 w-full">
          {pending === 'form' && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
          {pending === 'form' ? 'Giriş yapılıyor' : 'Giriş yap'}
        </button>
      </form>

      <p className="mt-8 text-sm text-fg-2">
        Hesabınız yok mu?{' '}
        <Link href="/auth/register" className="font-medium text-fg underline decoration-line-strong underline-offset-4 hover:decoration-fg">
          Kayıt olun
        </Link>
      </p>
    </AuthFrame>
  );
}
