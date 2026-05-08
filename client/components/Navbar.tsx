'use client';

import { useAuthStore } from '@/lib/store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-6">
            <Link href="/dashboard" className="text-xl font-bold">
              Spectra CRM
            </Link>
            <div className="hidden md:flex items-center space-x-1">
              <Link href="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 transition">Dashboard</Link>
              <Link href="/customers" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 transition">Müşteriler</Link>
              <Link href="/tasks" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 transition">Görevler</Link>
              <Link href="/opportunities" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 transition">Fırsatlar</Link>
              <Link href="/proposals" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 transition">Teklifler</Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-xs bg-indigo-400 px-2 py-1 rounded">
                {user?.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-semibold transition"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
