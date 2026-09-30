'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, Info, TriangleAlert, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';
interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

// Global singleton — toast.success('Kaydedildi') from anywhere.
let push: ((msg: string, type: ToastType) => void) | null = null;

export const toast = {
  success: (msg: string) => push?.(msg, 'success'),
  error: (msg: string) => push?.(msg, 'error'),
  info: (msg: string) => push?.(msg, 'info'),
};

/* Success is the won colour — a completed action is a small win. Errors use
   danger, which appears nowhere else but the destructive confirm. */
const TONE: Record<ToastType, { color: string; Icon: typeof Check }> = {
  success: { color: 'var(--color-won)', Icon: Check },
  error: { color: 'var(--color-danger)', Icon: TriangleAlert },
  info: { color: 'var(--color-fg-2)', Icon: Info },
};

const LIFETIME = 3800;
let seq = 0;

function ToastCard({ item, onClose }: { item: ToastItem; onClose: (id: number) => void }) {
  const { color, Icon } = TONE[item.type];
  const reduce = useReducedMotion();

  useEffect(() => {
    // onClose is stable and takes the id, so a new toast arriving does not
    // restart the timers of the ones already on screen.
    const t = setTimeout(() => onClose(item.id), LIFETIME);
    return () => clearTimeout(t);
  }, [item.id, onClose]);

  return (
    <motion.div
      layout={!reduce}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-[var(--radius-lg)] border border-line bg-panel py-3 pl-4 pr-2 shadow-[var(--shadow-pop)] sm:w-80"
      role={item.type === 'error' ? 'alert' : 'status'}
    >
      <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: color }} aria-hidden />
      <Icon className="mt-0.5 size-4 shrink-0" style={{ color }} aria-hidden />
      <p className="flex-1 pt-px text-sm font-medium leading-snug text-fg">{item.message}</p>
      <button
        type="button"
        onClick={() => onClose(item.id)}
        aria-label="Bildirimi kapat"
        className="flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-fg-3 transition-colors hover:bg-lift hover:text-fg"
      >
        <X className="size-3.5" aria-hidden />
      </button>
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const add = useCallback((message: string, type: ToastType) => {
    seq += 1;
    const id = seq;
    setToasts((t) => [...t.slice(-3), { id, message, type }]);
  }, []);

  useEffect(() => {
    push = add;
    return () => {
      push = null;
    };
  }, [add]);

  const remove = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  return (
    <>
      {children}
      {/* Sits above the phone tab bar; bottom-right on desktop. */}
      <div
        className="pointer-events-none fixed inset-x-4 bottom-20 z-[70] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 lg:bottom-6"
        aria-live="polite"
      >
        <AnimatePresence initial={false}>
          {toasts.map((item) => (
            <ToastCard key={item.id} item={item} onClose={remove} />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
