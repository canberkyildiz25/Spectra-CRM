import { Columns3, FileText, LayoutGrid, ListChecks, Users, type LucideIcon } from 'lucide-react';

/* One list feeds the desktop rail and the phone tab bar, so the two can never
   disagree about where things are. `short` is the tab-bar label. */
export const NAV: { href: string; label: string; short: string; icon: LucideIcon }[] = [
  { href: '/dashboard', label: 'Dashboard', short: 'Home', icon: LayoutGrid },
  { href: '/opportunities', label: 'Deals', short: 'Deals', icon: Columns3 },
  { href: '/proposals', label: 'Proposals', short: 'Proposals', icon: FileText },
  { href: '/customers', label: 'Customers', short: 'Customers', icon: Users },
  { href: '/tasks', label: 'Tasks', short: 'Tasks', icon: ListChecks },
];

export const isActive = (pathname: string, href: string) =>
  href === '/dashboard' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
