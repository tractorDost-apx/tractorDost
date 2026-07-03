import React from 'react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row gap-6 min-h-[calc(100vh-140px)]">
        {/* Sidebar Navigation */}
        <DashboardSidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <div className="glass-panel p-6 md:p-8 h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
