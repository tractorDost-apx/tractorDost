import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AgentSidebar from '@/components/dashboard/AgentSidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['AGENT', 'ADMIN']}>
      <div className="mx-auto flex min-h-[calc(100dvh-7rem)] md:h-[calc(100dvh-7rem)] w-full max-w-[1400px] flex-col gap-6 md:flex-row">
        <AgentSidebar />
        <div className="glass-panel hidden-scrollbar relative w-full overflow-y-auto p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
