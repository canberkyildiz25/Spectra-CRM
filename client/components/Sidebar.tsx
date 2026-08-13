'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-3a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" />
      </svg>
    ),
  },
  {
    href: '/customers',
    label: 'Müşteriler',
    icon: (
      <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: '/opportunities',
    label: 'Fırsatlar',
    icon: (
      <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    href: '/proposals',
    label: 'Teklifler',
    icon: (
      <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: '/tasks',
    label: 'Görevler',
    icon: (
      <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => { logout(); router.push('/auth/login'); };
  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <aside
      className="w-[230px] shrink-0 flex flex-col h-screen sticky top-0"
      style={{
        background: 'var(--color-rail)',
        borderRight: '1px solid var(--color-rail-rule)',
      }}
    >
      {/* The emerald hairline and the radial bloom that used to sit here are
          gone: a glow behind a wordmark is decoration the rail does not need,
          and the accent budget belongs to the active nav item. */}

      {/* Logo */}
      <div className="relative px-5 pt-6 pb-5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div
            className="w-8 h-8 flex items-center justify-center shrink-0"
            style={{
              background: 'var(--color-accent)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="var(--color-paper)" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <span
              className="text-[15px] font-semibold tracking-tight"
              style={{ color: 'var(--color-rail-ink-strong)' }}
            >
              Spectra
            </span>
            <span
              className="block -mt-0.5 text-[10px] font-medium uppercase tracking-widest"
              style={{ color: 'var(--color-rail-ink)', fontFamily: 'var(--font-mono)' }}
            >
              CRM
            </span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="relative flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        <p
          className="px-3 mb-3 text-[10px] font-medium uppercase tracking-widest"
          style={{ color: 'var(--color-rail-ink)', opacity: 0.6, fontFamily: 'var(--font-mono)' }}
        >
          Navigasyon
        </p>
        {navItems.map(item => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative group flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium"
              style={{
                borderRadius: 'var(--radius-md)',
                background: active ? 'var(--color-rail-2)' : 'transparent',
                color: active ? 'var(--color-rail-ink-strong)' : 'var(--color-rail-ink)',
                transition: 'background-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)',
              }}
            >
              {/* The active marker is the one place the accent appears in the
                  rail — a 2px edge, not a glowing pill plus a glowing dot. */}
              {active && (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2"
                  style={{ background: 'var(--color-accent)', borderRadius: '0 2px 2px 0' }}
                />
              )}
              <span style={{ color: 'inherit' }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="relative p-3 space-y-1" style={{ borderTop: '1px solid var(--color-rail-rule)' }}>
        {/* User card */}
        <div
          className="flex items-center gap-3 px-3 py-2.5"
          style={{ background: 'var(--color-rail-2)', borderRadius: 'var(--radius-md)' }}
        >
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center text-[11px]"
            style={{
              background: 'var(--color-rail)',
              color: 'var(--color-rail-ink-strong)',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="truncate text-[13px] font-medium"
              style={{ color: 'var(--color-rail-ink-strong)' }}
            >
              {user?.firstName} {user?.lastName}
            </p>
            <p className="truncate text-[11px] capitalize" style={{ color: 'var(--color-rail-ink)' }}>{user?.role}</p>
          </div>
        </div>

        {/* Signing out is a normal action, not a hazard — no red. The hover was
            also being applied by mutating style in mouse handlers, which skips
            :focus-visible entirely; a keyboard user got no feedback at all. */}
        <button onClick={handleLogout} className="rail-signout">
          <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
