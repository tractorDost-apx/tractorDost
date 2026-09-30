import React from 'react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="flex min-h-[calc(100vh-140px)] flex-col gap-6 md:flex-row">
        {/* Sidebar Navigation */}
        <DashboardSidebar />

        {/* Main Content Area */}
        <main className="min-w-0 flex-1">
          <div className="glass-panel h-full p-6 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
