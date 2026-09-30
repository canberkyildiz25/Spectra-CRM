import { Columns3, FileText, LayoutGrid, ListChecks, Users, type LucideIcon } from 'lucide-react';

/* One list feeds the desktop rail and the phone tab bar, so the two can never
   disagree about where things are. `short` is the tab-bar label. */
export const NAV: { href: string; label: string; short: string; icon: LucideIcon }[] = [
  { href: '/dashboard', label: 'Panel', short: 'Panel', icon: LayoutGrid },
  { href: '/opportunities', label: 'Fırsatlar', short: 'Fırsat', icon: Columns3 },
  { href: '/proposals', label: 'Teklifler', short: 'Teklif', icon: FileText },
  { href: '/customers', label: 'Müşteriler', short: 'Müşteri', icon: Users },
  { href: '/tasks', label: 'Görevler', short: 'Görev', icon: ListChecks },
];

export const isActive = (pathname: string, href: string) =>
  href === '/dashboard' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
