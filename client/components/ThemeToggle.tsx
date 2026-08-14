'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

/**
 * The theme is read from localStorage on the client, so the correct icon is
 * unknowable during the server render. Rendering the button but withholding
 * the icon until mount keeps the rail from shifting — swapping a placeholder
 * for the real control would move everything beside it.
 *
 * No animation on the swap: this is a control someone hits and immediately
 * looks away from, and the whole page changes colour underneath it anyway.
 */
export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="rail-signout"
      aria-label={isDark ? 'Açık temaya geç' : 'Koyu temaya geç'}
      title={isDark ? 'Açık tema' : 'Koyu tema'}
    >
      <span className="flex h-[17px] w-[17px] items-center justify-center">
        {mounted &&
          (isDark ? (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          ) : (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
            </svg>
          ))}
      </span>
      <span>{mounted ? (isDark ? 'Açık tema' : 'Koyu tema') : 'Tema'}</span>
    </button>
  );
}
