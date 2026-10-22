import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['CUSTOMER', 'DEALER', 'ADMIN', 'SUPER_ADMIN', 'AGENT', 'USER']}>
      <div className="relative w-full">{children}</div>
    </ProtectedRoute>
  );
}
