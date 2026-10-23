import React from 'react';
import type { Metadata } from 'next';
import HomePageClient from '@/components/homepage/HomePageClient';
import HomeFaqSection from '@/components/homepage/HomeFaqSection';
import { FAQ } from '@/lib/api/faq';
import type { PublicBanner } from '@/types/models/banner';

export const metadata: Metadata = {
  title: 'TractorDost | Premium Tractor Marketplace - Buy, Sell & Finance',
  description:
    'Discover, compare, and finance top tractors across India. Explore verified dealer listings, transparent pricing, and expert agricultural equipment FAQs.',
};

/**
 * Server-Side Fetch (Next.js ISR with 60s cache revalidation)
 * Fetches GENERAL published FAQs from the backend API.
 */
async function getHomeFaqs(): Promise<FAQ[]> {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    const res = await fetch(
      `${apiBase}/content/faqs?targetType=GENERAL&isPublished=true&sortOrder=asc`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) {
      return [];
    }

    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data as FAQ[];
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch home FAQs server-side:', error);
    return [];
  }
}

/**
 * Server-Side Fetch (Next.js ISR with 60s cache revalidation)
 * Live hero banners from the Banner Management module, in display order (sortOrder, then id).
 * The hero renders them on first paint. On failure it falls back to its static slides.
 */
async function getHomeBanners(): Promise<PublicBanner[]> {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    const res = await fetch(`${apiBase}/banners?page=home&position=hero&limit=10`, {
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      return [];
    }

    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data as PublicBanner[];
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch home banners server-side:', error);
    return [];
  }
}

export default async function HomePage() {
  const [faqs, banners] = await Promise.all([getHomeFaqs(), getHomeBanners()]);

  // Extract up to 8 GENERAL published FAQs (strictly real data from backend, no dummy FAQs)
  const displayFaqs = (Array.isArray(faqs) ? faqs : [])
    .filter((f) => f.targetType === 'GENERAL' && f.isPublished)
    .slice(0, 8);

  const faqJsonLd =
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
      {/* Google FAQPage JSON-LD Schema Markup (rendered only when real FAQs exist) */}
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <HomePageClient banners={banners}>
        {/* Minimalist FAQ Section (rendered only when real FAQs exist in DB) */}
        {displayFaqs.length > 0 && <HomeFaqSection faqs={displayFaqs} />}
      </HomePageClient>
    </>
  );
}
