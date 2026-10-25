'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/AuthContext';

export function useRequireAuth(redirectUrl = '/login') {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectUrl);
    }
  }, [isLoading, isAuthenticated, redirectUrl, router]);

  return { user, isAuthenticated, isLoading };
}
