'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  BadgePercent,
  Tractor,
  Headphones,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  Heart,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export function Footer() {
  const pathname = usePathname();
  const [contactInput, setContactInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const isDashboardRoute =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/dealer') ||
    pathname?.startsWith('/agent');

  if (isDashboardRoute) {
    return null;
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactInput.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setContactInput('');
      }, 5000);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-12 overflow-hidden border-t border-[var(--border-subtle)] bg-background/90 pt-12 pb-8 backdrop-blur-md">
      {/* Subtle ambient lighting */}
      <div className="pointer-events-none absolute -top-40 left-1/4 -z-10 h-72 w-72 rounded-full bg-[var(--color-brand-green)]/5 blur-[120px]" />
      <div className="pointer-events-none absolute -top-40 right-1/4 -z-10 h-72 w-72 rounded-full bg-[var(--color-brand-orange)]/5 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 1. Value Propositions & Trust Bar */}
        <div className="mb-14 grid grid-cols-1 gap-6 border-b border-[var(--border-subtle)] pb-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-4 rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-5 transition-all duration-300 hover:border-[var(--color-brand-green)]/30 hover:bg-foreground/[0.04]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">100% Verified Tractors</h4>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Certified physical inspection & authentic dealer documentation.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-5 transition-all duration-300 hover:border-[var(--color-brand-orange)]/30 hover:bg-foreground/[0.04]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-orange)]/10 text-[var(--color-brand-orange)]">
              <BadgePercent className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Easy Tractor Loans</h4>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Lowest interest rates, flexible EMIs & fast paperless approval.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-5 transition-all duration-300 hover:border-[var(--color-brand-green)]/30 hover:bg-foreground/[0.04]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
              <Tractor className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Accurate Valuation</h4>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                AI-driven fair market price evaluation for used tractors & tools.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-5 transition-all duration-300 hover:border-[var(--color-brand-orange)]/30 hover:bg-foreground/[0.04]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-orange)]/10 text-[var(--color-brand-orange)]">
              <Headphones className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Kisan Helpline</h4>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Free advisory & guidance from experienced agricultural experts.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Advisory Newsletter / Updates Strip */}
        <div className="glass-panel relative mb-14 overflow-hidden border border-[var(--border-subtle)] p-6 sm:p-8">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-green)]">
                <Sparkles className="h-4 w-4" />
                Kisan Updates & Alerts
              </div>
              <h3 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
                Get Latest Tractor Prices, Subsidies & Schemes
              </h3>
              <p className="mt-1.5 text-sm text-muted">
                Receive authentic on-road price updates, government agriculture subsidies, and
                seasonal dealer offers directly.
              </p>
            </div>

            <div className="w-full lg:w-auto">
              {subscribed ? (
                <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 px-5 py-3 text-sm font-semibold text-[var(--color-brand-green)]">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  Dhanyawad! You are successfully subscribed to TractorDost updates.
                </div>
              ) : (
                <form
                  onSubmit={handleSubscribe}
                  className="flex w-full flex-col gap-2.5 sm:flex-row sm:items-center"
                >
                  <div className="relative w-full sm:w-72">
                    <input
                      type="text"
                      required
                      value={contactInput}
                      onChange={(e) => setContactInput(e.target.value)}
                      placeholder="Enter mobile or email"
                      className="w-full rounded-xl border border-[var(--border-subtle)] bg-background/80 px-4 py-3 text-sm text-foreground shadow-sm placeholder:text-muted focus:border-[var(--color-brand-green)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-green)]"
                      suppressHydrationWarning
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[var(--color-brand-green-dark)] hover:shadow-lg active:scale-95"
                    suppressHydrationWarning
                  >
                    <span>Get Updates</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* 3. Main Footer Links Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 lg:gap-6">
          {/* Brand & Contact Column (spans full on mobile, 1 col on desktop) */}
          <div className="flex flex-col gap-3.5 sm:col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" className="inline-block">
              <img
                src="/TD%20Black.png"
                alt="TractorDost Logo"
                className="logo-light h-11 w-auto"
              />
              <img
                src="/TD%20White.png"
                alt="TractorDost Logo"
                className="logo-dark h-11 w-auto"
              />
            </Link>

            <p className="text-xs leading-relaxed text-muted">
              India&apos;s trusted digital agricultural marketplace. Empowering farmers to discover,
              compare, buy, sell, and finance new &amp; used tractors and farm equipment.
            </p>

            {/* Direct Contact Points */}
            <div className="space-y-1.5 pt-0.5 text-xs text-muted">
              <a
                href="tel:18002088282"
                className="flex items-center gap-2 text-foreground transition-colors hover:text-[var(--color-brand-green)]"
              >
                <Phone className="h-3.5 w-3.5 text-[var(--color-brand-green)]" />
                <span className="font-semibold">Toll Free: 1800-208-8282</span>
              </a>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-muted" />
                <span>Mon - Sat: 9:00 AM - 7:00 PM</span>
              </div>
              <a
                href="mailto:support@tractordost.com"
                className="flex items-center gap-2 transition-colors hover:text-foreground"
              >
                <Mail className="h-3.5 w-3.5 text-[var(--color-brand-orange)]" />
                <span>support@tractordost.com</span>
              </a>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-muted" />
                <span>Pune, Maharashtra, India</span>
              </div>
            </div>

            {/* Real Social Media Channels (with distinct, accurate icons) */}
            <div className="pt-0.5">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                Connect With Us
              </p>
              <div className="flex items-center gap-2">
                <SocialButton
                  href="https://facebook.com"
                  label="Facebook"
                  hoverColorClass="hover:bg-[#1877F2]/10 hover:text-[#1877F2] hover:border-[#1877F2]/40"
                  icon={
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  }
                />
                <SocialButton
                  href="https://instagram.com"
                  label="Instagram"
                  hoverColorClass="hover:bg-[#E4405F]/10 hover:text-[#E4405F] hover:border-[#E4405F]/40"
                  icon={
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  }
                />

                <SocialButton
                  href="https://youtube.com"
                  label="YouTube"
                  hoverColorClass="hover:bg-[#FF0000]/10 hover:text-[#FF0000] hover:border-[#FF0000]/40"
                  icon={
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  }
                />
                <SocialButton
                  href="https://x.com"
                  label="X (Twitter)"
                  hoverColorClass="hover:bg-foreground/10 hover:text-foreground hover:border-foreground/40"
                  icon={
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  }
                />
                <SocialButton
                  href="https://whatsapp.com"
                  label="WhatsApp"
                  hoverColorClass="hover:bg-[#25D366]/10 hover:text-[#25D366] hover:border-[#25D366]/40"
                  icon={
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 2c-5.507 0-9.989 4.478-9.989 9.984 0 1.76.459 3.479 1.332 4.992L2 22l5.163-1.354a9.96 9.96 0 0 0 4.868 1.259h.004c5.507 0 9.99-4.479 9.99-9.988 0-2.668-1.039-5.176-2.927-7.065A9.927 9.927 0 0 0 12.031 2zm0 18.292h-.003a8.27 8.27 0 0 1-4.221-1.157l-.303-.18-3.137.823.837-3.058-.197-.314a8.28 8.28 0 0 1-1.272-4.422c0-4.57 3.719-8.289 8.293-8.289a8.24 8.24 0 0 1 5.864 2.43 8.24 8.24 0 0 1 2.428 5.862c0 4.57-3.719 8.288-8.292 8.288zm4.544-6.205c-.249-.125-1.474-.727-1.703-.81-.229-.083-.396-.125-.562.125-.166.249-.645.81-.79 1.059-.145.249-.291.27-.54.145-.249-.125-1.052-.388-2.003-1.236-.74-.66-1.24-1.475-1.385-1.724-.145-.249-.015-.383.109-.507.112-.112.249-.291.374-.437.125-.145.166-.249.249-.415.083-.166.042-.312-.021-.437-.062-.125-.562-1.352-.77-1.851-.203-.486-.409-.42-.562-.428-.145-.008-.312-.01-.478-.01s-.437.062-.666.312c-.229.249-.873.853-.873 2.079s.894 2.41 1.019 2.577c.125.166 1.76 2.688 4.264 3.769.596.257 1.061.411 1.424.526.598.19 1.143.163 1.573.099.48-.072 1.474-.602 1.682-1.185.208-.582.208-1.08.145-1.185-.062-.104-.228-.166-.477-.291z" />
                    </svg>
                  }
                />
                <SocialButton
                  href="https://linkedin.com"
                  label="LinkedIn"
                  hoverColorClass="hover:bg-[#0A66C2]/10 hover:text-[#0A66C2] hover:border-[#0A66C2]/40"
                  icon={
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  }
                />
              </div>
            </div>
          </div>

          {/* Col 2: Explore Tractors */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Explore Tractors
            </h3>
            <div className="flex flex-col gap-2 pt-1">
              <FooterLink href="/tractors">New Tractors</FooterLink>
              <FooterLink href="/used-tractors" badge="Hot">
                Used Tractors
              </FooterLink>
              <FooterLink href="/implements">Implements &amp; Tools</FooterLink>
              <FooterLink href="/harvesters">Harvesters</FooterLink>
              <FooterLink href="/tyres">Tractor Tyres</FooterLink>
              <FooterLink href="/compare">Compare Models</FooterLink>
              <FooterLink href="/brands">All Brands</FooterLink>
            </div>
          </div>

          {/* Col 3: Services & Finance */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Services &amp; Finance
            </h3>
            <div className="flex flex-col gap-2 pt-1">
              <FooterLink href="/loan" badge="Low EMI">
                Tractor Finance
              </FooterLink>
              <FooterLink href="/emi-calculator">EMI Calculator</FooterLink>
              <FooterLink href="/used-tractor-valuation">Valuation Check</FooterLink>
              <FooterLink href="/sell-used-tractor">Sell Your Tractor</FooterLink>
              <FooterLink href="/on-road-price">On-Road Price</FooterLink>
              <FooterLink href="/dealers">Find Dealers</FooterLink>
              <FooterLink href="/service-centers">Service Centers</FooterLink>
            </div>
          </div>

          {/* Col 4: News & Knowledge */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              News &amp; Media
            </h3>
            <div className="flex flex-col gap-2 pt-1">
              <FooterLink href="/blogs">Agriculture Blogs</FooterLink>
              <FooterLink href="/news">Tractor News</FooterLink>
              <FooterLink href="/videos">Video Reviews</FooterLink>
              <FooterLink href="/web-stories">Web Stories</FooterLink>
              <FooterLink href="/faqs">FAQs &amp; Kisan Help</FooterLink>
            </div>
          </div>

          {/* Col 5: Company & Legal */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Company
            </h3>
            <div className="flex flex-col gap-2 pt-1">
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/contact">Contact Support</FooterLink>
              <FooterLink href="/showrooms">Dealer Showrooms</FooterLink>
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
            </div>
          </div>
        </div>

        {/* 4. Popular Tractor Brands in India (SEO & Farmer Quick Links) */}
        <div className="mt-6 border-t border-[var(--border-subtle)] pt-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted">
            <span className="font-bold text-foreground">Popular Brands:</span>
            {[
              'Mahindra Tractors',
              'Swaraj Tractors',
              'Sonalika Tractors',
              'John Deere',
              'Massey Ferguson',
              'New Holland',
              'Eicher Tractors',
              'Farmtrac',
              'Kubota Tractors',
              'Powertrac',
              'Captain Tractors',
              'Solis Tractors',
            ].map((brandName, idx) => (
              <React.Fragment key={brandName}>
                <Link
                  href={`/tractors?search=${encodeURIComponent(brandName.split(' ')[0])}`}
                  className="transition-colors hover:text-[var(--color-brand-green)]"
                >
                  {brandName}
                </Link>
                {idx < 11 && <span className="text-muted/40">•</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* 5. Bottom Copyright Bar */}
        <div className="mt-5 flex flex-col items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-5 text-xs text-muted sm:flex-row">
          <p>© {currentYear} TractorDost Technologies Pvt. Ltd. All rights reserved.</p>

          <div className="flex items-center gap-5">
            <Link href="/privacy" className="transition-colors hover:text-foreground">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="transition-colors hover:text-foreground">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/faqs" className="transition-colors hover:text-foreground">
              FAQs
            </Link>
            <span>•</span>
            <Link href="/contact" className="transition-colors hover:text-foreground">
              Contact
            </Link>
          </div>

          <p className="flex items-center gap-1.5 font-medium text-foreground">
            Built with{' '}
            <Heart className="h-3.5 w-3.5 animate-pulse fill-rose-500 text-rose-500 inline-block" />{' '}
            for Indian Farmers
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
  badge,
}: {
  href: string;
  children: React.ReactNode;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
    >
      <span className="transition-transform duration-200 group-hover:translate-x-0.5">
        {children}
      </span>
      {badge && (
        <span className="rounded-full border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/15 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-brand-green)]">
          {badge}
        </span>
      )}
    </Link>
  );
}

function SocialButton({
  href,
  label,
  icon,
  hoverColorClass,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  hoverColorClass: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.03] text-muted transition-all duration-300 hover:scale-110 active:scale-95 ${hoverColorClass}`}
    >
      {icon}
    </a>
  );
}
