'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { FAQ } from '@/lib/api/faq';
import FaqAccordion from './FaqAccordion';

interface HomeFaqSectionProps {
  faqs: FAQ[];
}

export default function HomeFaqSection({ faqs }: HomeFaqSectionProps) {
  // Strictly filter for targetType === 'GENERAL' and isPublished === true
  const validFaqs = (Array.isArray(faqs) ? faqs : []).filter(
    (faq) => faq.targetType === 'GENERAL' && faq.isPublished
  );

  // If there are no real FAQs in the database, do not render dummy data
  if (validFaqs.length === 0) {
    return null;
  }

  // Max 8 FAQs on homepage
  const displayFaqs = validFaqs.slice(0, 8);

  return (
    <section
      id="homepage-faq-section"
      aria-label="Frequently Asked Questions"
      className="w-full max-w-3xl mx-auto mt-14 sm:mt-20 pt-8"
    >
      <div className="mb-6 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Frequently Asked Questions
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-muted">
          Common queries about buying, selling, financing, and platform services.
        </p>
      </div>

      <FaqAccordion faqs={displayFaqs} />

      <div className="mt-6 flex justify-center sm:justify-start">
        <Link
          href="/faqs"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[var(--color-brand-green)] hover:underline"
        >
          <span>View all FAQs</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
