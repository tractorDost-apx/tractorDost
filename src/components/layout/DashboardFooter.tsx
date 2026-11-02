import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export function DashboardFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto w-full border-t border-[var(--border-subtle)] bg-background/80 py-3 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex flex-col items-center justify-between gap-3 text-xs text-muted md:flex-row">
        <div className="flex items-center gap-2 font-medium">
          <ShieldCheck size={14} className="text-[var(--color-brand-green)] shrink-0" />
          <span>&copy; {year} TractorDost Technologies. Secure Management Portal.</span>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 font-medium">
          <Link
            href="/contact"
            className="text-muted transition-colors hover:text-foreground"
          >
            Help & Support
          </Link>
          <span className="text-muted/40">•</span>
          <Link
            href="/terms"
            className="text-muted transition-colors hover:text-foreground"
          >
            Terms of Service
          </Link>
          <span className="text-muted/40">•</span>
          <Link
            href="/privacy"
            className="text-muted transition-colors hover:text-foreground"
          >
            Privacy Policy
          </Link>
        </div>

        <div className="flex items-center gap-1.5 font-medium">
          <span>Design & Developed by</span>
          <a
            href="https://www.apxteck.com/"
            target="_blank"
            rel="noopener noreferrer"
            title="APXTECK - Digital Innovation & Web Development"
            className="font-bold text-[var(--color-brand-green)] transition-all hover:text-[var(--color-brand-orange)] hover:underline underline-offset-4"
          >
            APXTECK
          </a>
        </div>
      </div>
    </footer>
  );
}
