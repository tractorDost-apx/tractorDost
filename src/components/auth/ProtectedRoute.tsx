'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/store/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { TractorLoader } from '@/components/ui/TractorLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const userRole = user?.role?.name?.toUpperCase();
  const isAdminUser = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
  const isDealerUser =
    userRole === 'DEALER' ||
    userRole === 'DEALER_STAFF' ||
    userRole === 'SELLER' ||
    user?.sellerType?.toLowerCase() === 'dealer' ||
    Boolean(user?.dealer);

  const normalizedAllowedRoles = allowedRoles?.map((r) => r.toUpperCase());

  // Determine if current user is authorized for this route
  const isAuthorized =
    !normalizedAllowedRoles ||
    normalizedAllowedRoles.length === 0 ||
    (userRole && normalizedAllowedRoles.includes(userRole)) ||
    (isAdminUser && (normalizedAllowedRoles.includes('ADMIN') || normalizedAllowedRoles.includes('SUPER_ADMIN'))) ||
    (isDealerUser && (normalizedAllowedRoles.includes('DEALER') || normalizedAllowedRoles.includes('SELLER')));

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated, saving the current path to return to
        router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      } else if (!isAuthorized) {
        // User is authenticated but lacks required role -> redirect to their role dashboard
        switch (userRole) {
          case 'ADMIN':
          case 'SUPER_ADMIN':
            router.replace('/admin/dashboard');
            break;
          case 'AGENT':
            router.replace('/agent/dashboard');
            break;
          case 'DEALER':
          case 'DEALER_STAFF':
          case 'SELLER':
            router.replace('/dealer/dashboard');
            break;
          case 'CUSTOMER':
          case 'USER':
          default:
            router.replace('/dashboard');
            break;
        }
      }
    }
  }, [isLoading, isAuthenticated, isAuthorized, userRole, isAdminUser, isDealerUser, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <TractorLoader size={48} className="text-[var(--color-brand-green)]" />
      </div>
    );
  }

  // Render children only if authenticated and authorized
  if (!isAuthenticated || !isAuthorized) {
    return null; // Return null to prevent flicker before redirect occurs
  }

  return <>{children}</>;
}
