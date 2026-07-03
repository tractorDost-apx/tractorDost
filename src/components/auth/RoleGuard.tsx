'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/store/AuthContext';
import { Loader2 } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[]; // e.g. ['ADMIN', 'DEALER']
  redirectTo?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles,
  redirectTo = '/login'
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        // Not logged in
        router.push(`${redirectTo}?callbackUrl=${encodeURIComponent(pathname)}`);
      } else if (!allowedRoles.includes(user.role?.name)) {
        // Logged in but not authorized
        router.push('/unauthorized'); // or some access denied page
      } else {
        // Authorized!
        setIsAuthorized(true);
      }
    }
  }, [isLoading, isAuthenticated, user, router, allowedRoles, redirectTo, pathname]);

  if (isLoading || !isAuthorized) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-brand-green)]" />
      </div>
    );
  }

  return <>{children}</>;
};
