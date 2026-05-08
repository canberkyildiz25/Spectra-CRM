'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, loadFromStorage } = useAuthStore();

  useEffect(() => {
    // Load auth data from localStorage
    loadFromStorage();

    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router, loadFromStorage]);

  // Show loading state while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Yükleniyor...</div>
      </div>
    );
  }

  return <>{children}</>;
}
