import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | TractorDost',
  description:
    'Learn how TractorDost collects, uses, and safeguards your personal and financial information on our agricultural marketplace platform.',
};

export default function PrivacyPage() {
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
        <div className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-[var(--color-brand-green)]/10 blur-3xl" />
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-green)]">
          <ShieldCheck className="h-4 w-4" />
          Data Security & Trust
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted">
          Last updated: October 2026. TractorDost is committed to protecting the privacy and personal data of farmers, dealers, and agricultural business partners.
        </p>
      </div>

      {/* Content */}
      <div className="glass-inner space-y-8 p-6 sm:p-10 text-foreground">
        <section>
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Lock className="h-5 w-5 text-[var(--color-brand-green)]" />
            1. Information We Collect
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            We collect personal details such as your name, contact phone number, email address, location (state/district/village), and agricultural machinery preferences when you register, request tractor loans, inquire about listings, or submit valuation requests.
          </p>
        </section>

        <section>
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Eye className="h-5 w-5 text-[var(--color-brand-orange)]" />
            2. How We Use Your Information
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Your data is used solely to facilitate tractor inquiries, connect you with verified local tractor dealers and certified financiers, calculate customized loan EMIs, provide authentic resale valuations, and deliver important alerts or updates.
          </p>
        </section>

        <section>
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <CheckCircle2 className="h-5 w-5 text-[var(--color-brand-green)]" />
            3. Data Sharing & Security
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            We never sell your personal information to unverified third parties. Information is only shared with authorized tractor dealerships and verified financial partners when you explicitly submit an inquiry or loan application. All transmission is encrypted using bank-grade SSL standards.
          </p>
        </section>

        <section>
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <FileText className="h-5 w-5 text-[var(--color-brand-orange)]" />
            4. Contact Our Privacy Team
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            If you have questions about your data or would like to request data deletion or updates, please reach out to our team at{' '}
            <a href="mailto:privacy@tractordost.com" className="font-semibold text-[var(--color-brand-green)] underline">
              privacy@tractordost.com
            </a>{' '}
            or call our toll-free farmer helpline at 1800-208-8282.
          </p>
        </section>
      </div>
    </div>
  );
}
