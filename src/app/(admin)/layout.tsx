import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminSidebar from '@/components/dashboard/AdminSidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="mx-auto flex flex-1 h-full min-h-[calc(100vh_-_8.5rem)] md:min-h-[calc(100vh_-_7.5rem)] w-full max-w-[1920px] flex-col gap-4 md:flex-row min-h-0">
        <AdminSidebar />
        <div className="glass-panel hidden-scrollbar relative flex flex-1 flex-col w-full min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-7 min-h-0">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
