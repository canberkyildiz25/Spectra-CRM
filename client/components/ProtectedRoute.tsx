'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { DEMO_CREDENTIALS } from '@/lib/demo';
import SpectraMark from './brand/SpectraMark';

type Phase = 'checking' | 'ready' | 'unreachable';

/**
 * This CRM is a portfolio piece, so a visitor should reach every screen without
 * being stopped at a login form. Rather than dropping the auth guard — which
 * would leave the app looking like it has none — an unauthenticated visitor is
 * signed in as the demo user and carried through. The real login screen stays
 * at /auth/login for anyone who wants to see it.
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>('checking');

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      // Read straight off the store rather than the render-time snapshot, so a
      // returning visitor is not bounced for one frame while it loads.
      useAuthStore.getState().loadFromStorage();
      if (!useAuthStore.getState().isAuthenticated) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(DEMO_CREDENTIALS),
          });
          const body = await res.json();
          if (!res.ok) throw new Error(body?.error ?? 'Giriş başarısız');
          useAuthStore.getState().setAuth(body.data.token, body.data.user);
        } catch {
          if (!cancelled) setPhase('unreachable');
          return;
        }
      }
      if (!cancelled) setPhase('ready');
    };

    // Deferred a tick so the phase change never lands inside the effect body.
    const t = setTimeout(start, 0);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

  if (phase === 'checking') {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-ground px-6" role="status">
        <SpectraMark size={22} className="animate-pulse" />
        <p className="label">Oturum hazırlanıyor</p>
      </div>
    );
  }

  if (phase === 'unreachable') {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-ground px-6">
        <div className="max-w-sm">
          <p className="label">Bağlantı yok</p>
          <h1 className="mt-3 text-[2.25rem] text-fg">Sunucuya ulaşılamıyor.</h1>
          <p className="mt-3 text-sm leading-relaxed text-fg-2">
            Demo oturumu açılamadı. API yanıt vermiyor olabilir; birkaç saniye sonra yeniden
            deneyin.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => window.location.reload()} className="btn">
              Yeniden dene
            </button>
            <Link href="/auth/login" className="btn-secondary">
              Giriş ekranı
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
