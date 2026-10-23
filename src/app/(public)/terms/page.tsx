import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, ArrowLeft, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | TractorDost',
  description:
    'Read the terms of service governing the use of TractorDost marketplace, tractor buying and selling services, loans, and dealer connections.',
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Back button */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>

      {/* Header */}
      <div className="glass-panel relative mb-10 overflow-hidden p-8 sm:p-12">
        <div className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-[var(--color-brand-orange)]/10 blur-3xl" />
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-orange)]">
          <FileText className="h-4 w-4" />
          User Agreement
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted">
          Last updated: October 2026. Please read these terms carefully before accessing or using TractorDost services.
        </p>
      </div>

      {/* Content */}
      <div className="glass-inner space-y-8 p-6 sm:p-10 text-foreground">
        <section>
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <CheckCircle2 className="h-5 w-5 text-[var(--color-brand-green)]" />
            1. Acceptance of Terms
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            By accessing or using the TractorDost web and mobile platforms, you agree to comply with and be bound by these Terms of Service. If you disagree with any part of these terms, you should immediately cease use of our platform.
          </p>
        </section>

        <section>
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <AlertCircle className="h-5 w-5 text-[var(--color-brand-orange)]" />
            2. Platform Role & Marketplace Nature
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            TractorDost connects buyers, sellers, dealerships, and financiers. While we perform verification and moderation on listings, users are advised to inspect tractors in person, verify RTO documents, and validate financing conditions prior to final purchase execution.
          </p>
        </section>

        <section>
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <ShieldAlert className="h-5 w-5 text-[var(--color-brand-green)]" />
            3. User Obligations & Accurate Information
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            You agree to provide true, accurate, and current information when creating listings, booking tractor inspections, or submitting loan inquiries. Misrepresentation of tractor condition, meter hours, or engine specifications may result in account termination.
          </p>
        </section>

        <section>
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <FileText className="h-5 w-5 text-[var(--color-brand-orange)]" />
            4. Contact & Support
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            For legal inquiries, dispute resolution, or dealership onboarding assistance, please email{' '}
            <a href="mailto:legal@tractordost.com" className="font-semibold text-[var(--color-brand-green)] underline">
              legal@tractordost.com
            </a>{' '}
            or contact TractorDost headquarters.
          </p>
        </section>
      </div>
    </div>
  );
}
