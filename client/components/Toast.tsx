'use client';

import { useState, useCallback, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';
interface ToastItem { id: string; message: string; type: ToastType; }

// ── Global singleton – kullanım: toast.success('Kaydedildi')
let _add: ((msg: string, type: ToastType) => void) | null = null;

export const toast = {
  success: (msg: string) => _add?.(msg, 'success'),
  error:   (msg: string) => _add?.(msg, 'error'),
  info:    (msg: string) => _add?.(msg, 'info'),
  warning: (msg: string) => _add?.(msg, 'warning'),
};

/* Toast colour is the one place status hues earn their keep: the toast is
   transient and the colour is the only thing that distinguishes success from
   failure at a glance. Tokens, not Tailwind literals, so they follow the
   theme. */
const cfg: Record<ToastType, { bar: string; icon: JSX.Element }> = {
  success: {
    bar: 'bg-[var(--positive)]',
    icon: (
      <svg className="w-4 h-4 text-[var(--positive)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  error: {
    bar: 'bg-[var(--destructive)]',
    icon: (
      <svg className="w-4 h-4 text-[var(--destructive)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  info: {
    bar: 'bg-[var(--quiet)]',
    icon: (
      <svg className="w-4 h-4 text-[var(--quiet)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  warning: {
    bar: 'bg-[var(--caution)]',
    icon: (
      <svg className="w-4 h-4 text-[var(--caution)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
  },
};

// ── Single toast card
function ToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const { bar, icon } = cfg[item.type];

  useEffect(() => {
    const t = setTimeout(onClose, 3800);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className="relative flex items-start gap-3 bg-card border border-border rounded-2xl shadow-card-hover px-4 py-3.5 w-80 overflow-hidden pointer-events-auto animate-slide-up"
      style={{ boxShadow: '0 8px 30px rgb(0 0 0 / .12)' }}
    >
      {/* Progress bar */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 ${bar} rounded-full`}
        style={{ animation: 'toastProgress 3.8s linear forwards' }}
      />
      {/* Icon */}
      <div className="shrink-0 mt-0.5 w-6 h-6 rounded-lg bg-muted flex items-center justify-center">
        {icon}
      </div>
      {/* Message */}
      <p className="flex-1 text-sm font-medium text-foreground leading-snug pt-0.5">{item.message}</p>
      {/* Close */}
      <button onClick={onClose} className="shrink-0 text-muted-foreground hover:text-muted-foreground transition mt-0.5">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ── Provider – layout.tsx içine ekle
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const add = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).slice(2, 8);
    setToasts(t => [...t, { id, message, type }]);
  }, []);

  useEffect(() => {
    _add = add;
    return () => { _add = null; };
  }, [add]);

  const remove = useCallback((id: string) => setToasts(t => t.filter(x => x.id !== id)), []);

  return (
    <>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(item => (
          <ToastCard key={item.id} item={item} onClose={() => remove(item.id)} />
        ))}
      </div>
    </>
  );
}
