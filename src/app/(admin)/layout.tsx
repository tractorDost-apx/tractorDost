import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminSidebar from '@/components/dashboard/AdminSidebar';
import { ToastContainer } from '@/components/ui/toast';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <ToastContainer />
      <div className="mx-auto flex flex-1 w-full max-w-[1920px] flex-col gap-4 md:flex-row min-h-[calc(100dvh-7rem)] md:h-[calc(100dvh-7rem)] p-2 sm:p-4">
        <AdminSidebar />
        <div className="glass-panel hidden-scrollbar relative flex flex-1 flex-col w-full min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-7 min-h-0 rounded-2xl md:rounded-3xl border border-[var(--border-subtle)]">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
