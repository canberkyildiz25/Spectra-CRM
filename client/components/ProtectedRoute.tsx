'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';

const DEMO_CREDENTIALS = { email: 'demo@spectra.com', password: 'demo1234' };

type Phase = 'checking' | 'ready' | 'unreachable';

/**
 * This CRM is a portfolio piece, so a visitor should reach every screen without
 * being stopped at a login form. Rather than dropping the auth guard — which
 * would leave the app looking like it has none — an unauthenticated visitor is
 * signed in as the read-only demo user and carried through. The real login
 * screen stays at /auth/login for anyone who wants to see it.
 */
export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const [phase, setPhase] = useState<Phase>('checking');

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      // Read straight off the store rather than the render-time snapshot: the
      // old code checked `isAuthenticated` in the same pass that populated it,
      // so a returning visitor was bounced to /auth/login for one frame.
      useAuthStore.getState().loadFromStorage();
      if (useAuthStore.getState().isAuthenticated) {
        if (!cancelled) setPhase('ready');
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(DEMO_CREDENTIALS),
          },
        );
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error ?? 'Giriş başarısız');

        useAuthStore.getState().setAuth(body.data.token, body.data.user);
        if (!cancelled) setPhase('ready');
      } catch {
        if (!cancelled) setPhase('unreachable');
      }
    };

    start();
    return () => {
      cancelled = true;
    };
  }, []);

  if (phase === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <p className="label animate-pulse-soft">Oturum hazırlanıyor</p>
      </div>
    );
  }

  if (phase === 'unreachable') {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <p className="label mb-3">Bağlantı yok</p>
          <h1 className="mb-3 text-xl">Sunucuya ulaşılamıyor</h1>
          <p className="mb-6 text-sm leading-relaxed text-ink-2">
            Demo oturumu açılamadı. API yanıt vermiyor olabilir; birkaç saniye
            sonra tekrar deneyin.
          </p>
          <Link href="/auth/login" className="btn-secondary">
            Giriş ekranına git
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
