import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DealerSidebar from '@/components/dashboard/DealerSidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['DEALER']}>
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-[1400px] mx-auto h-[calc(100vh-10rem)]">
        <DealerSidebar />
        <div className="glass-panel p-6 sm:p-8 w-full overflow-y-auto hidden-scrollbar relative">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
