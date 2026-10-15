import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle, ArrowLeft, MessageSquare } from 'lucide-react';
import { FAQ } from '@/lib/api/faq';
import PublicFaqExplorer from '@/components/faq/PublicFaqExplorer';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQs) | TractorDost',
  description:
    'Find detailed answers to common questions about buying new and used tractors, loan documentation, interest rates, agricultural implements, and verified dealerships.',
};

async function getAllPublishedFaqs(): Promise<FAQ[]> {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    const res = await fetch(`${apiBase}/content/faqs?isPublished=true`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return [];
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data as FAQ[];
    }
    return [];
  } catch (error) {
    console.error('Failed to load published FAQs:', error);
    return [];
  }
}

export default async function FaqPage() {
  const faqs = await getAllPublishedFaqs();
  const displayFaqs = Array.isArray(faqs) ? faqs : [];

  const faqSchema =
    displayFaqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: displayFaqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-12">
        {/* Breadcrumb / Back button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-[var(--color-brand-green)] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Hero Header */}
        <div className="mb-10 text-center flex flex-col items-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border-brand)] bg-[var(--color-brand-green)]/10 px-4 py-1.5 backdrop-blur-md">
            <HelpCircle size={14} className="text-[var(--color-brand-green)]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-foreground/80">
              Knowledge Hub
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
            Frequently Asked <span className="text-[var(--color-brand-green)]">Questions</span>
          </h1>

          <p className="mt-3.5 max-w-2xl text-xs sm:text-base text-muted leading-relaxed">
            Everything you need to know about purchasing, selling, inspecting, and financing
            agricultural equipment on TractorDost.
          </p>
        </div>

        {/* Interactive FAQ Explorer */}
        {displayFaqs.length > 0 ? (
          <PublicFaqExplorer faqs={displayFaqs} />
        ) : (
          <div className="text-center py-16 rounded-2xl border border-[var(--border-subtle)] bg-background/40">
            <HelpCircle size={40} className="mx-auto text-muted/40 mb-3" />
            <h3 className="text-base font-bold text-foreground">No FAQs Published Yet</h3>
            <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
              Our team is currently preparing helpful guides and answers. Please check back soon or
              contact support directly.
            </p>
          </div>
        )}

        {/* Still need help banner */}
        <div className="mt-16 rounded-2xl border border-[var(--border-brand)] bg-[var(--color-brand-green)]/[0.04] p-8 text-center backdrop-blur-md">
          <h3 className="text-lg font-bold text-foreground">Still have questions?</h3>
          <p className="mt-1 text-xs text-muted max-w-md mx-auto">
            Can&apos;t find what you&apos;re looking for? Reach out to our customer advisory team
            for assistance.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-90 transition-all"
            >
              <MessageSquare size={14} />
              <span>Contact Support</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
