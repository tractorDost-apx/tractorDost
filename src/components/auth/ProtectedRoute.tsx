'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/store/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated, saving the current path to return to
        router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      } else if (allowedRoles && user?.role?.name && !allowedRoles.includes(user.role.name)) {
        // User is authenticated but lacks required role
        switch (user.role.name) {
          case 'ADMIN':
          case 'SUPER_ADMIN':
            router.replace('/admin/dashboard');
            break;
          case 'DEALER':
            router.replace('/dealer/dashboard');
            break;
          case 'CUSTOMER':
            router.replace('/dashboard');
            break;
          default:
            router.replace('/');
        }
      }
    }
  }, [isLoading, isAuthenticated, user, router, pathname, allowedRoles]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <Loader2 className="animate-spin text-lime-400" size={32} />
      </div>
    );
  }

  // Render children only if authenticated and authorized
  if (
    !isAuthenticated || 
    (allowedRoles && user?.role?.name && !allowedRoles.includes(user.role.name))
  ) {
    return null; // Return null to prevent flicker before redirect occurs
  }

  return <>{children}</>;
}
