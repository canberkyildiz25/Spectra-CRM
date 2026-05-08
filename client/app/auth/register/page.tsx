'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';

export default function Register() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '', firstName: '', lastName: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) return setError('Şifreler eşleşmiyor');
    if (formData.password.length < 6) return setError('Şifre en az 6 karakter olmalıdır');
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.username, email: formData.email, password: formData.password, firstName: formData.firstName, lastName: formData.lastName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Kayıt başarısız');
      setAuth(data.data.token, data.data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-lg">Spectra CRM</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Hesap Oluştur</h1>
          <p className="text-gray-500 text-sm mt-1">Sisteme katılmak için kayıt olun</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-5">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Ad *</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Ad" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Soyad *</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Soyad" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Kullanıcı Adı *</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="kullanici_adi" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">E-posta *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="ornek@email.com" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Şifre *</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="En az 6 karakter" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Şifre Tekrar *</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition mt-1">
              {loading ? 'Hesap oluşturuluyor...' : 'Hesap Oluştur'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm mt-5">
          Zaten hesabınız var mı?{' '}
          <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-800 font-semibold">Giriş yapın</Link>
        </p>
      </div>
    </div>
  );
}
