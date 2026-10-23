'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { DashboardFooter } from './DashboardFooter';
import { LeadAttributionTracker } from '@/components/analytics/LeadAttributionTracker';

export function LayoutOrchestrator({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboardRoute =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/dealer') ||
    pathname?.startsWith('/agent');
  const isHome = pathname === '/';

  return (
    <div className={`flex w-full flex-1 flex-col ${isDashboardRoute ? 'spatial-background' : ''}`}>
      <Suspense fallback={null}>
        <LeadAttributionTracker />
      </Suspense>
      <Navbar />
      <main
        className={`flex flex-1 flex-col min-h-0 ${
          isDashboardRoute
            ? 'px-3 pt-3 pb-2 sm:px-5 sm:pt-3.5 sm:pb-2.5'
            : isHome
              ? 'pt-0 px-0 pb-0'
              : 'px-4 pt-28 pb-12 sm:px-8 lg:px-12'
        }`}
      >
        {children}
      </main>
      {isDashboardRoute ? <DashboardFooter /> : <Footer />}
    </div>
  );
}
