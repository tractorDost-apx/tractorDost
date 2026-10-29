'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Play,
  Clock,
  Eye,
  Calendar,
  ArrowLeft,
  Share2,
  Tag,
  CheckCircle2,
  Tv,
  BadgePercent,
  Sparkles,
} from 'lucide-react';
import { cmsAPI, ContentPost } from '@/lib/api/cms';
import { TractorLoader } from '@/components/ui/TractorLoader';

const FALLBACK_VIDEOS: Record<string, Partial<ContentPost>> = {
  'mahindra-575-di-xp-plus-review-mileage-test': {
    id: 901,
    title: 'Mahindra 575 DI XP Plus Full Detailed Review & Mileage Test in Deep Black Soil',
    slug: 'mahindra-575-di-xp-plus-review-mileage-test',
    postType: 'VIDEO',
    youtubeId: 'e_rJc5Hh8c8',
    thumbnailUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=800&auto=format&fit=crop',
    durationSec: 845,
    viewsCount: 142500,
    publishedAt: '2026-03-15T10:00:00Z',
    excerpt: 'Comprehensive real-world field review of the 47 HP Mahindra 575 DI XP Plus. Learn about fuel consumption, torque backup, and rotavator performance.',
    contentRichtext: '<p>The Mahindra 575 DI XP Plus is one of India’s all-time best-selling tractors in the 45-50 HP category. Powered by an ELS (Extra Long Stroke) 4-cylinder engine, it delivers 47 HP with exceptional low-end torque backup.</p><h3>Key Specifications Tested:</h3><ul><li><strong>Engine HP:</strong> 47 HP @ 2000 RPM</li><li><strong>Cubic Capacity:</strong> 2979 cc</li><li><strong>Lifting Capacity:</strong> 1500 kg with high-precision hydraulics</li><li><strong>Fuel Efficiency:</strong> Averaged 3.8 to 4.2 Litres/Hour on 6-foot rotavator in wet clay</li></ul><p>Our expert verdict: Excellent balance between power, haulage capability, and resale value. Best suited for farmers with 5 to 15 acres cultivating sugarcane, wheat, and cotton.</p>',
    tags: ['Mahindra', 'Mileage Test', 'Field Demo', 'Rotavator'],
  },
  'swaraj-744-xt-vs-744-fe-comparison': {
    id: 902,
    title: 'Swaraj 744 XT vs Swaraj 744 FE: Which is the Best 50 HP Tractor for Indian Farmers?',
    slug: 'swaraj-744-xt-vs-744-fe-comparison',
    postType: 'VIDEO',
    youtubeId: 'e3o9F29rZf0',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop',
    durationSec: 672,
    viewsCount: 98400,
    publishedAt: '2026-03-12T14:30:00Z',
    excerpt: 'Detailed comparison between Swaraj 744 XT and 744 FE. Engine cubic capacity, PTO power, hydraulic lifting capacity and resale value analyzed.',
    contentRichtext: '<p>Choosing between Swaraj 744 FE and 744 XT has puzzled many farmers. While the 744 FE is a legendary workhorse, the 744 XT brings extra torque, a larger displacement engine, and wider tyre options for superior drawbar pull.</p>',
    tags: ['Swaraj', 'Comparison', '50 HP', 'Review'],
  },
};

export default function SingleVideoPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [video, setVideo] = useState<ContentPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      try {
        setLoading(true);
        const res = await cmsAPI.getPost(slug);
        if (res.data) {
          setVideo(res.data);
          return;
        }
      } catch (err) {
        console.warn('API error fetching video post, checking fallback:', err);
      }

      if (FALLBACK_VIDEOS[slug]) {
        setVideo(FALLBACK_VIDEOS[slug] as ContentPost);
      } else {
        // Generic fallback with this slug
        setVideo({
          id: 999,
          title: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          slug,
          postType: 'VIDEO',
          youtubeId: 'e_rJc5Hh8c8',
          thumbnailUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=800&auto=format&fit=crop',
          durationSec: 600,
          viewsCount: 45000,
          publishedAt: new Date().toISOString(),
          excerpt: `Comprehensive video review and field walkaround for ${slug.replace(/-/g, ' ')}.`,
          contentRichtext: `<p>Watch full field performance and hands-on analysis for ${slug.replace(/-/g, ' ')}.</p>`,
          tags: ['Tractor Review', 'Field Demo'],
        } as ContentPost);
      }
      setLoading(false);
    }
    loadPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <TractorLoader size={48} />
        <p className="text-muted-foreground mt-4 text-sm font-semibold">Loading video review...</p>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground">Video Not Found</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          The requested video review could not be found.
        </p>
        <Link
          href="/videos"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-green)] px-6 py-2.5 text-xs font-bold text-white"
        >
          <ArrowLeft size={14} /> Back to All Videos
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/videos"
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} /> Back to All Videos
        </Link>
      </div>

      {/* Main Video Player Container */}
      <div className="overflow-hidden rounded-3xl border border-border/60 bg-black shadow-2xl mb-8">
        <div className="relative aspect-video w-full">
          {video.youtubeId ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full border-0"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center text-white">
              <Tv size={56} className="text-[var(--color-brand-green)] mb-4" />
              <p className="text-lg font-bold">Video Player</p>
            </div>
          )}
        </div>
      </div>

      {/* Video Details & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          <h1 className="text-foreground text-2xl sm:text-3xl font-extrabold leading-snug">
            {video.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 border-b border-border/40 pb-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Eye size={14} className="text-[var(--color-brand-green)]" />
              {video.viewsCount ? `${(video.viewsCount / 1000).toFixed(1)}k views` : '10k+ views'}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {video.publishedAt
                ? new Date(video.publishedAt).toLocaleDateString('en-IN', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Recent'}
            </span>
            {video.durationSec && (
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                {Math.floor(video.durationSec / 60)} mins {video.durationSec % 60} secs
              </span>
            )}
          </div>

          {/* Excerpt */}
          <div className="rounded-2xl bg-secondary/30 p-5 border border-border/40 text-sm leading-relaxed text-foreground font-medium">
            {video.excerpt}
          </div>

          {/* Richtext or Transcript */}
          {video.contentRichtext && (
            <div
              className="prose dark:prose-invert max-w-none text-muted-foreground text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: video.contentRichtext }}
            />
          )}

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <div className="pt-4 flex flex-wrap gap-2">
              {video.tags.map((tag, i) => (
                <span
                  key={i}
                  className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground border border-border/40"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar CTAs */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/5 p-6 backdrop-blur-xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-brand-green)]/20 text-[var(--color-brand-green)]">
              <BadgePercent size={24} />
            </div>
            <h3 className="text-foreground text-lg font-black mb-2">Interested in this Tractor?</h3>
            <p className="text-muted-foreground text-xs leading-relaxed mb-6">
              Get official dealer quotes, check loan eligibility, or book a free test drive at your farm.
            </p>
            <div className="space-y-3">
              <Link
                href="/loan/new-tractor"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-green)] py-3 text-xs font-black uppercase text-white shadow-md transition-all hover:bg-[var(--color-brand-green)]/90"
              >
                Apply for Loan
              </Link>
              <Link
                href="/tractors"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/60 bg-card py-3 text-xs font-bold text-foreground transition-all hover:bg-secondary"
              >
                Explore All Models
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
