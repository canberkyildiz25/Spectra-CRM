'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LoaderCircle, TriangleAlert } from 'lucide-react';
import AuthFrame from '@/components/auth/AuthFrame';
import { useAuthStore } from '@/lib/store';
import { errorText } from '@/lib/format';

const FIELDS = [
  { name: 'firstName', label: 'Ad', autoComplete: 'given-name', half: true },
  { name: 'lastName', label: 'Soyad', autoComplete: 'family-name', half: true },
  { name: 'username', label: 'Kullanıcı adı', autoComplete: 'username' },
  { name: 'email', label: 'E-posta', type: 'email', autoComplete: 'email' },
  { name: 'password', label: 'Şifre', type: 'password', autoComplete: 'new-password', hint: 'En az 6 karakter' },
  { name: 'confirmPassword', label: 'Şifre tekrar', type: 'password', autoComplete: 'new-password' },
] as const;

type Form = Record<(typeof FIELDS)[number]['name'], string>;

export default function Register() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Form>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Şifreler eşleşmiyor.');
    if (form.password.length < 6) return setError('Şifre en az 6 karakter olmalı.');
    setLoading(true);
    try {
      const { confirmPassword: _skip, ...payload } = form;
      void _skip;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Kayıt başarısız');
      setAuth(data.data.token, data.data.user);
      router.push('/dashboard');
    } catch (err) {
      setError(errorText(err, 'Kayıt başarısız'));
      setLoading(false);
    }
  };

  return (
    <AuthFrame>
      <p className="label">Kayıt</p>
      <h1 className="mt-3 text-[2.5rem] text-fg">Hesap oluşturun.</h1>
      <p className="mt-2 text-sm text-fg-2">
        Yalnızca göz atmak için gerek yok —{' '}
        <Link href="/auth/login" className="text-fg underline decoration-line-strong underline-offset-4 hover:decoration-fg">
          demo hesabı
        </Link>{' '}
        hazır.
      </p>

      {error && (
        <div role="alert" className="notice mt-6">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-8 grid grid-cols-2 gap-4">
        {FIELDS.map((f) => (
          <div key={f.name} className={'half' in f && f.half ? 'col-span-1' : 'col-span-2'}>
            <label htmlFor={f.name} className="label field-label">
              {f.label}
            </label>
            <input
              id={f.name}
              name={f.name}
              type={'type' in f ? f.type : 'text'}
              autoComplete={f.autoComplete}
              value={form[f.name]}
              onChange={(e) => {
                setForm((s) => ({ ...s, [f.name]: e.target.value }));
                setError('');
              }}
              aria-describedby={'hint' in f ? `${f.name}-hint` : undefined}
              className="input"
              required
            />
            {'hint' in f && (
              <p id={`${f.name}-hint`} className="mt-1.5 text-xs text-fg-3">
                {f.hint}
              </p>
            )}
          </div>
        ))}
        <button type="submit" disabled={loading} className="btn col-span-2 mt-2 w-full">
          {loading && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
          {loading ? 'Hesap oluşturuluyor' : 'Hesap oluştur'}
        </button>
      </form>

      <p className="mt-8 text-sm text-fg-2">
        Zaten hesabınız var mı?{' '}
        <Link href="/auth/login" className="font-medium text-fg underline decoration-line-strong underline-offset-4 hover:decoration-fg">
          Giriş yapın
        </Link>
      </p>
    </AuthFrame>
  );
}
