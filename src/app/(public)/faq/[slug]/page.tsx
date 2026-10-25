import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { HelpCircle, ArrowLeft, MessageSquare, CheckCircle2, Share2, Sparkles } from 'lucide-react';
import { FAQ } from '@/lib/api/faq';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getFaqBySlug(slug: string): Promise<FAQ | null> {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    const res = await fetch(`${apiBase}/content/faqs/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && json.data) {
      return json.data as FAQ;
    }
    return null;
  } catch (error) {
    console.error('Failed to load FAQ by slug:', error);
    return null;
  }
}

async function getRelatedFaqs(targetType?: string): Promise<FAQ[]> {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    const url = targetType
      ? `${apiBase}/content/faqs?isPublished=true&targetType=${encodeURIComponent(targetType)}`
      : `${apiBase}/content/faqs?isPublished=true`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.success && Array.isArray(json.data) ? (json.data as FAQ[]) : [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const faq = await getFaqBySlug(resolvedParams.slug);

  if (!faq) {
    return {
      title: 'FAQ Not Found | TractorDost',
    };
  }

  return {
    title: `${faq.question} | TractorDost FAQ`,
    description: faq.answer.slice(0, 160),
  };
}

export default async function SingleFaqPage({ params }: PageProps) {
  const resolvedParams = await params;
  const faq = await getFaqBySlug(resolvedParams.slug);

  if (!faq) {
    // Generate readable fallback if not in database
    const readableQuestion = resolvedParams.slug
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-12">
        <div className="mb-6">
          <Link
            href="/faq"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-[var(--color-brand-green)] transition-colors"
          >
            <ArrowLeft size={14} /> Back to All FAQs
          </Link>
        </div>

        <div className="rounded-3xl border border-border/50 bg-card/60 p-8 md:p-12 shadow-xl backdrop-blur-xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 px-4 py-1.5 text-xs font-black tracking-widest text-[var(--color-brand-green)] uppercase">
            <HelpCircle size={14} /> Knowledge Hub
          </div>
          <h1 className="text-foreground text-3xl sm:text-4xl font-black mb-6 leading-tight">
            {readableQuestion}?
          </h1>
          <div className="prose dark:prose-invert max-w-none text-muted-foreground text-base leading-relaxed mb-8">
            <p>
              TractorDost provides comprehensive guidance on agricultural machinery, fair market prices, bank finance schemes, and tractor maintenance.
            </p>
            <p>
              For immediate clarification on this topic, please contact our agricultural advisory desk or explore our main FAQ directory.
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/faq"
              className="rounded-xl bg-[var(--color-brand-green)] px-6 py-3 text-xs font-bold text-white shadow-md"
            >
              Explore All FAQs
            </Link>
            <Link
              href="/contact"
              className="rounded-xl border border-border/60 bg-card px-6 py-3 text-xs font-bold text-foreground hover:bg-secondary"
            >
              Ask an Advisor
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const related = await getRelatedFaqs(faq.targetType);
  const otherFaqs = related.filter((item) => item.id !== faq.id).slice(0, 4);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-12">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center justify-between text-xs">
          <Link
            href="/faq"
            className="inline-flex items-center gap-1.5 font-bold text-muted hover:text-[var(--color-brand-green)] transition-colors"
          >
            <ArrowLeft size={14} /> Back to All FAQs
          </Link>
          <span className="rounded-full bg-secondary/80 px-3 py-1 font-bold text-muted-foreground uppercase text-[10px]">
            {faq.targetType}
          </span>
        </div>

        {/* Main Question & Answer Card */}
        <article className="rounded-3xl border border-border/50 bg-card/60 p-8 md:p-12 shadow-xl backdrop-blur-xl mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 px-4 py-1.5 text-xs font-black tracking-widest text-[var(--color-brand-green)] uppercase">
            <CheckCircle2 size={14} /> Verified Answer
          </div>

          <h1 className="text-foreground text-2xl sm:text-4xl font-extrabold leading-tight mb-6">
            {faq.question}
          </h1>

          <div className="prose dark:prose-invert max-w-none text-muted-foreground text-base sm:text-lg leading-relaxed whitespace-pre-line border-t border-border/30 pt-6">
            {faq.answer}
          </div>
        </article>

        {/* Related FAQs */}
        {otherFaqs.length > 0 && (
          <section className="mb-12">
            <h3 className="text-foreground text-xl font-black mb-4">Related Questions</h3>
            <div className="space-y-3">
              {otherFaqs.map((item) => (
                <Link
                  key={item.id}
                  href={`/faq/${item.slug || item.id}`}
                  className="flex items-center justify-between rounded-2xl border border-border/40 bg-card/40 p-4 transition-all hover:border-[var(--color-brand-green)]/40 hover:bg-secondary/40"
                >
                  <span className="text-foreground text-sm font-bold">{item.question}</span>
                  <span className="text-xs text-[var(--color-brand-green)] font-bold">&rarr;</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Bottom CTA */}
        <div className="rounded-2xl border border-border/50 bg-[var(--color-brand-green)]/5 p-8 text-center backdrop-blur-md">
          <h3 className="text-lg font-bold text-foreground">Need more personalized guidance?</h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
            Our agri-machinery and finance specialists are ready to advise you for free.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-[var(--color-brand-green)]/90 transition-all"
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
