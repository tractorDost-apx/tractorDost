import React from 'react';
import Link from 'next/link';

export function DashboardFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-background/50 mt-auto w-full border-t border-[var(--border-subtle)] py-3 sm:py-3.5">
      <div className="flex flex-col items-center justify-between gap-3 px-4 sm:px-6 md:flex-row">
        <p className="text-muted text-sm font-medium">
          &copy; {year} TractorDost. All rights reserved.
        </p>
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link
            href="/contact"
            className="text-muted transition-colors hover:text-[var(--color-brand-green)]"
          >
            Support
          </Link>
          <Link
            href="/terms"
            className="text-muted transition-colors hover:text-[var(--color-brand-green)]"
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy"
            className="text-muted transition-colors hover:text-[var(--color-brand-green)]"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
