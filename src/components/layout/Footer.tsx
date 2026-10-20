'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();
  const isDashboardRoute =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/dealer');

  if (isDashboardRoute) {
    return null;
  }

  return (
    <footer className="bg-background relative z-10 mt-6 overflow-hidden border-t border-[var(--border-subtle)] pt-12 pb-10">
      <div className="relative z-10 mx-auto max-w-7xl px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center">
                <img
                  src="/TD%20Black.png"
                  alt="TractorDost Logo"
                  className="logo-light h-16 w-auto"
                />
                <img
                  src="/TD%20White.png"
                  alt="TractorDost Logo"
                  className="logo-dark h-16 w-auto"
                />
              </div>
            </Link>
            <p className="text-muted text-sm leading-relaxed">
              The ultimate spatial marketplace to discover, buy, and sell premium tractors and
              agricultural implements.
            </p>
            <div className="flex gap-4">
              <SocialIcon />
              <SocialIcon />
              <SocialIcon />
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-foreground text-lg font-bold">Explore</h3>
            <FooterLink href="/tractors">New Tractors</FooterLink>
            <FooterLink href="/used-tractors">Used Tractors</FooterLink>
            <FooterLink href="/implements">Implements & Tools</FooterLink>
            <FooterLink href="/compare">Compare Models</FooterLink>
          </div>

          {/* Services */}
          <div className="flex flex-col gap-4">
            <h3 className="text-foreground text-lg font-bold">Services</h3>
            <FooterLink href="/loan">Tractor Finance</FooterLink>
            <FooterLink href="/used-tractor-valuation">Valuation Check</FooterLink>
            <FooterLink href="/dealers">Find Dealers</FooterLink>
            <FooterLink href="/service-centers">Service Centers</FooterLink>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-4">
            <h3 className="text-foreground text-lg font-bold">Company</h3>
            <FooterLink href="/about">About Us</FooterLink>
            <FooterLink href="/contact">Contact Support</FooterLink>
            <FooterLink href="/faqs">FAQs & Help</FooterLink>
            <FooterLink href="/privacy">Privacy Policy</FooterLink>
            <FooterLink href="/terms">Terms of Service</FooterLink>
          </div>
        </div>

        <div className="mt-20 flex flex-col items-center justify-between border-t border-[var(--border-subtle)] pt-8 sm:flex-row">
          <p className="text-muted text-sm">
            © {new Date().getFullYear()} TractorDost. All rights reserved.
          </p>
          <p className="text-muted mt-4 flex items-center gap-1 text-sm sm:mt-0">
            Built with <span className="text-[var(--color-versa-accent-pink)]">❤</span> for Indian
            Farmers
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-muted hover:text-foreground text-sm transition-colors">
      {children}
    </Link>
  );
}

function SocialIcon() {
  return (
    <button className="bg-foreground/5 text-muted hover:bg-foreground/10 hover:text-foreground flex h-10 w-10 items-center justify-center rounded-full transition-all">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 24 24"
        className="h-4 w-4"
      >
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
      </svg>
    </button>
  );
}
