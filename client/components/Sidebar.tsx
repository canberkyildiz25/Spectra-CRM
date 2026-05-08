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
    <aside className="w-[230px] shrink-0 flex flex-col h-screen sticky top-0" style={{
      background: 'linear-gradient(180deg, #0d1117 0%, #0f172a 100%)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
    }}>

      {/* Emerald glow top accent */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #10b981, transparent)' }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top, rgba(16,185,129,.12) 0%, transparent 70%)' }} />

      {/* Logo */}
      <div className="relative px-5 pt-6 pb-5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 0 12px rgba(16,185,129,.4)' }}>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <span className="font-bold text-white text-[15px] tracking-tight">Spectra</span>
            <span className="block text-[10px] text-emerald-400/70 tracking-widest uppercase font-medium -mt-0.5">CRM</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="relative flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold px-3 mb-3 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Navigasyon
        </p>
        {navItems.map(item => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150"
              style={active ? {
                background: 'rgba(16,185,129,0.12)',
                color: '#34d399',
              } : {
                color: 'rgba(255,255,255,0.4)',
              }}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full" style={{ background: '#10b981' }} />
              )}
              <span style={{ color: active ? '#34d399' : 'rgba(255,255,255,0.3)', transition: 'color 0.15s' }}
                    className="group-hover:!text-white/70 transition-colors">
                {item.icon}
              </span>
              <span className="group-hover:text-white/80 transition-colors">{item.label}</span>

              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="relative p-3 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {/* User card */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-[11px] shrink-0"
               style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-[11px] capitalize truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{user?.role}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150"
          style={{ color: 'rgba(255,255,255,0.3)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f87171'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
