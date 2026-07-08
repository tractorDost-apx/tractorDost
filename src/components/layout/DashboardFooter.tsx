import React from 'react';
import Link from 'next/link';

export function DashboardFooter() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="w-full mt-auto py-6 border-t border-[var(--border-subtle)] bg-background/50">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-4 sm:px-6">
        <p className="text-sm text-muted font-medium">
          &copy; {year} TractorDost. All rights reserved.
        </p>
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="/contact" className="text-muted hover:text-[var(--color-brand-green)] transition-colors">
            Support
          </Link>
          <Link href="/terms" className="text-muted hover:text-[var(--color-brand-green)] transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-muted hover:text-[var(--color-brand-green)] transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
