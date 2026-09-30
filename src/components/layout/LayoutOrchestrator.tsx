'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { DashboardFooter } from './DashboardFooter';

export function LayoutOrchestrator({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboardRoute =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/dealer') ||
    pathname?.startsWith('/agent');

  return (
    <div className={`flex w-full flex-1 flex-col ${isDashboardRoute ? 'spatial-background' : ''}`}>
      <Navbar />
      <main
        className={`z-10 flex flex-1 flex-col ${isDashboardRoute ? 'px-4 pt-6 pb-6' : 'px-4 pt-28 pb-12 sm:px-8 lg:px-12'}`}
      >
        {children}
      </main>
      {isDashboardRoute ? <DashboardFooter /> : <Footer />}
    </div>
  );
}
