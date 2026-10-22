import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DealerSidebar from '@/components/dashboard/DealerSidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['DEALER', 'ADMIN', 'SUPER_ADMIN']}>
      <div className="mx-auto flex h-[calc(100vh-10rem)] w-full max-w-[1400px] flex-col gap-6 md:flex-row">
        <DealerSidebar />
        <div className="glass-panel hidden-scrollbar relative w-full overflow-y-auto p-6 sm:p-8">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
