'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import ProtectedRoute from './ProtectedRoute';
import { Wordmark } from './brand/SpectraMark';
import { useAuthStore } from '@/lib/store';
import { NAV, isActive } from '@/lib/nav';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

/* App — Workbench (design.md). A rail and a working surface on desktop; on a
 * phone the rail becomes a top bar and a five-item tab bar. The previous
 * shell kept a 230 px rail at every width, which left about ninety pixels of
 * content on a 320 px screen.
 */

function initials(first?: string, last?: string) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || '—';
}

function useSignOut() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  return () => {
    logout();
    router.push('/auth/login');
  };
}

function Rail() {
  const pathname = usePathname() ?? '';
  const user = useAuthStore((s) => s.user);
  const signOut = useSignOut();
  const reduce = useReducedMotion();

  return (
    <aside className="no-print sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-raised lg:flex">
      <div className="px-5 pb-6 pt-6">
        <Link href="/dashboard" aria-label="Panele git" className="rounded-sm">
          <Wordmark />
        </Link>
      </div>

      <nav className="flex-1 px-3" aria-label="Uygulama">
        <p className="label px-3 pb-3">Çalışma alanı</p>
        <ul className="space-y-0.5">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex min-h-10 items-center gap-3 rounded-[var(--radius-md)] px-3 text-sm font-medium transition-colors ${
                    active ? 'bg-lift text-fg' : 'text-fg-2 hover:bg-panel hover:text-fg'
                  }`}
                >
                  {/* The active marker is colourless and slides between items —
                      colour in this app always means a stage. */}
                  {active && (
                    <motion.span
                      layoutId="rail-active"
                      transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 42 }}
                      className="absolute inset-y-2 left-0 w-[2px] rounded-full bg-fg"
                      aria-hidden
                    />
                  )}
                  <Icon className="size-[17px] shrink-0" strokeWidth={1.75} aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-line p-3">
        <div className="flex items-center gap-3 rounded-[var(--radius-md)] px-2 py-2">
          <span className="figure flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-line bg-panel text-[0.6875rem] text-fg">
            {initials(user?.firstName, user?.lastName)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-fg">
              {user ? `${user.firstName} ${user.lastName}` : '—'}
            </span>
            <span className="label block truncate">{user?.role ?? ''}</span>
          </span>
          <button
            type="button"
            onClick={signOut}
            aria-label="Çıkış yap"
            title="Çıkış yap"
            className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-fg-3 transition-colors hover:bg-lift hover:text-fg"
          >
            <LogOut className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </aside>
  );
}

function TopBar() {
  const user = useAuthStore((s) => s.user);
  const signOut = useSignOut();
  return (
    <header className="no-print sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-raised px-4 lg:hidden">
      <Link href="/dashboard" aria-label="Panele git" className="rounded-sm">
        <Wordmark />
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Hesap menüsü"
          className="figure flex size-9 items-center justify-center rounded-[var(--radius-md)] border border-line bg-panel text-[0.6875rem] text-fg"
        >
          {initials(user?.firstName, user?.lastName)}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-52">
          <DropdownMenuLabel>{user ? `${user.firstName} ${user.lastName}` : 'Hesap'}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={signOut}>
            <LogOut aria-hidden />
            Çıkış yap
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

function TabBar() {
  const pathname = usePathname() ?? '';
  const reduce = useReducedMotion();
  return (
    <nav
      aria-label="Uygulama"
      className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-line bg-raised pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`relative flex h-16 flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium ${
                  active ? 'text-fg' : 'text-fg-3'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="tab-active"
                    transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 42 }}
                    className="absolute inset-x-4 top-0 h-[2px] rounded-full bg-fg"
                    aria-hidden
                  />
                )}
                <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                {item.short}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  return (
    <ProtectedRoute>
      <a href="#content" className="skip-link no-print">
        İçeriğe geç
      </a>
      <div className="flex min-h-dvh bg-ground">
        <Rail />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <motion.main
            key={pathname}
            id="content"
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="min-w-0 flex-1 pb-24 lg:pb-0"
          >
            {children}
          </motion.main>
        </div>
      </div>
      <TabBar />
    </ProtectedRoute>
  );
}
