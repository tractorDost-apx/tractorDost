'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Play,
  Clock,
  Eye,
  Calendar,
  Search,
  Sparkles,
  Share2,
  X,
  Tv,
  CheckCircle2,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { cmsAPI, ContentPost } from '@/lib/api/cms';
import { TractorLoader } from '@/components/ui/TractorLoader';

// Curated fallback videos if backend database has not yet been populated
const CURATED_VIDEOS: Partial<ContentPost>[] = [
  {
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
    tags: ['Mahindra', 'Mileage Test', 'Field Demo', 'Rotavator'],
    isTrending: true,
  },
  {
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
    tags: ['Swaraj', 'Comparison', '50 HP', 'Review'],
    isTrending: true,
  },
  {
    id: 903,
    title: 'John Deere 5310 4WD Heavy Duty Plowing with 3-Bottom Reversible MB Plough',
    slug: 'john-deere-5310-4wd-mb-plough-demo',
    postType: 'VIDEO',
    youtubeId: '9nJz0Z_j90s',
    thumbnailUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop',
    durationSec: 580,
    viewsCount: 215000,
    publishedAt: '2026-03-08T09:15:00Z',
    excerpt: 'Watch the powerhouse 55 HP John Deere 5310 GearPro 4WD tackle hardpan clay soil with effortless ease and superior traction.',
    tags: ['John Deere', '4WD', 'Plowing', 'MB Plough'],
    isTrending: false,
  },
  {
    id: 904,
    title: 'Top 5 Mini Tractors in India under ₹4 Lakhs for Orchard and Vineyard Farming',
    slug: 'top-5-mini-tractors-in-india-under-4-lakhs',
    postType: 'VIDEO',
    youtubeId: 'kLK0eK05j9A',
    thumbnailUrl: 'https://images.unsplash.com/photo-1594771804886-a933bb2d609b?q=80&w=800&auto=format&fit=crop',
    durationSec: 920,
    viewsCount: 88200,
    publishedAt: '2026-02-28T16:00:00Z',
    excerpt: 'Comparing Kubota NeoStar B2441, Captain 250 DI, VST Shakti MT 270, Sonalika GT 22, and Mahindra Jivo 225 DI for inter-cultivation.',
    tags: ['Mini Tractor', 'Orchard', 'Kubota', 'Under 4 Lakh'],
    isTrending: false,
  },
  {
    id: 905,
    title: 'How to Increase Tractor Mileage by 15%: Maintenance Tips & Fuel Saving Secrets',
    slug: 'how-to-increase-tractor-mileage-maintenance-tips',
    postType: 'VIDEO',
    youtubeId: 'L8Yg8x7j2jQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=800&auto=format&fit=crop',
    durationSec: 495,
    viewsCount: 165400,
    publishedAt: '2026-02-20T11:45:00Z',
    excerpt: 'Practical maintenance checklist: air filter cleaning, tyre air pressure calibration, injector timing, and gear selection rules.',
    tags: ['Maintenance', 'Mileage', 'Fuel Saving', 'Tips'],
    isTrending: false,
  },
  {
    id: 906,
    title: 'Sonalika Tiger DI 55 CRDS Review: India’s Most Powerful Common Rail Diesel Tractor',
    slug: 'sonalika-tiger-di-55-crds-review',
    postType: 'VIDEO',
    youtubeId: 'oO7j8K1l3mM',
    thumbnailUrl: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?q=80&w=800&auto=format&fit=crop',
    durationSec: 740,
    viewsCount: 76300,
    publishedAt: '2026-02-14T13:20:00Z',
    excerpt: 'Testing Sonalika Tiger with Next-Gen Trem-IV CRDS engine. High torque at low RPM, dual clutch, and multi-speed PTO performance test.',
    tags: ['Sonalika', 'CRDS', 'Trem-IV', 'Technology'],
    isTrending: false,
  },
];

const CATEGORIES = [
  'All Videos',
  'Tractor Reviews',
  'Comparisons',
  'Field Demos',
  'Mini Tractors',
  'Maintenance Tips',
];

export function VideosListClient() {
  const [videos, setVideos] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Videos');
  const [selectedVideo, setSelectedVideo] = useState<ContentPost | null>(null);

  useEffect(() => {
    async function loadVideos() {
      try {
        setLoading(true);
        const res = await cmsAPI.getPosts({ postType: 'VIDEO', limit: 20 });
        if (res.data && res.data.length > 0) {
          setVideos(res.data);
        } else {
          setVideos(CURATED_VIDEOS as ContentPost[]);
        }
      } catch (err) {
        console.warn('Using curated videos fallback:', err);
        setVideos(CURATED_VIDEOS as ContentPost[]);
      } finally {
        setLoading(false);
      }
    }
    loadVideos();
  }, []);

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return '10:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatViews = (views: number) => {
    if (views >= 100000) return `${(views / 100000).toFixed(1)} Lakh views`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}k views`;
    return `${views} views`;
  };

  const filteredVideos = videos.filter((v) => {
    const matchesSearch =
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.tags && v.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    if (!matchesSearch) return false;
    if (activeCategory === 'All Videos') return true;
    if (activeCategory === 'Tractor Reviews') return v.title.toLowerCase().includes('review');
    if (activeCategory === 'Comparisons') return v.title.toLowerCase().includes('vs') || v.title.toLowerCase().includes('comparison');
    if (activeCategory === 'Field Demos') return v.title.toLowerCase().includes('demo') || v.title.toLowerCase().includes('plow');
    if (activeCategory === 'Mini Tractors') return v.title.toLowerCase().includes('mini') || v.tags?.includes('Mini Tractor');
    if (activeCategory === 'Maintenance Tips') return v.title.toLowerCase().includes('tip') || v.title.toLowerCase().includes('mileage');
    return true;
  });

  const featuredVideo = videos[0] || (CURATED_VIDEOS[0] as ContentPost);

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-4 pt-12 pb-24 sm:px-6 lg:px-8">
      {/* Header */}
      <section className="relative flex flex-col items-center justify-center pt-8 pb-12 text-center">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 px-4 py-1.5 text-xs font-black tracking-widest text-[var(--color-brand-green)] uppercase">
            <Tv size={14} /> TractorDost TV & Reviews
          </div>
          <h1 className="text-foreground text-4xl leading-tight font-extrabold tracking-tight md:text-6xl">
            Tractor Videos & <span className="text-[var(--color-brand-green)]">Expert Reviews</span>
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Watch unbiased farm trials, mileage tests, implement compatibility demos, and head-to-head comparisons before buying.
          </p>
        </div>
        <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-brand-green)]/5 blur-[120px]" />
      </section>

      {/* Hero Featured Video Banner */}
      {featuredVideo && (
        <div className="mb-14 overflow-hidden rounded-3xl border border-border/50 bg-card/60 shadow-2xl backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div
              className="relative group cursor-pointer lg:col-span-7 h-72 sm:h-96 lg:h-auto overflow-hidden bg-black/40"
              onClick={() => setSelectedVideo(featuredVideo)}
            >
              <img
                src={featuredVideo.thumbnailUrl || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=800&auto=format&fit=crop'}
                alt={featuredVideo.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-brand-green)] text-white shadow-2xl shadow-[var(--color-brand-green)]/50 transition-transform duration-300 group-hover:scale-110">
                  <Play size={32} className="ml-1 fill-white" />
                </div>
              </div>
              <div className="absolute bottom-4 right-4 rounded-md bg-black/80 px-2.5 py-1 text-xs font-bold text-white">
                {formatDuration(featuredVideo.durationSec)}
              </div>
            </div>

            <div className="flex flex-col justify-center p-8 lg:col-span-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[var(--color-brand-green)]/15 px-3 py-1 text-[11px] font-black text-[var(--color-brand-green)] uppercase">
                  Featured Review
                </span>
                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Eye size={12} /> {formatViews(featuredVideo.viewsCount || 100000)}
                </span>
              </div>
              <h2 className="text-foreground text-2xl font-black leading-snug md:text-3xl">
                {featuredVideo.title}
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                {featuredVideo.excerpt}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedVideo(featuredVideo)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-6 py-3 text-xs font-black text-white uppercase tracking-wider shadow-lg shadow-[var(--color-brand-green)]/20 transition-all hover:bg-[var(--color-brand-green)]/90"
                >
                  <Play size={16} className="fill-white" /> Watch Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-[var(--color-brand-green)] text-white shadow-md'
                  : 'bg-card/60 text-muted-foreground hover:bg-secondary border border-border/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search size={16} className="text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tractor videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-card/60 border-border/50 text-foreground w-full rounded-full border py-2 pl-9 pr-4 text-xs font-medium focus:border-[var(--color-brand-green)] focus:outline-none"
          />
        </div>
      </div>

      {/* Videos Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <TractorLoader size={48} />
          <p className="text-muted-foreground mt-4 text-sm font-semibold">Loading tractor video library...</p>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="rounded-3xl border border-border/50 bg-card/40 p-12 text-center">
          <h3 className="text-foreground text-lg font-bold">No videos found</h3>
          <p className="text-muted-foreground text-xs mt-1">Try adjusting your search or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="group overflow-hidden rounded-2xl border border-border/50 bg-card/40 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-brand-green)]/40 hover:shadow-xl flex flex-col"
            >
              {/* Thumbnail Container */}
              <div
                className="relative cursor-pointer aspect-video w-full overflow-hidden bg-black/40"
                onClick={() => setSelectedVideo(video)}
              >
                <img
                  src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=600&auto=format&fit=crop'}
                  alt={video.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-brand-green)] text-white shadow-lg opacity-90 transition-transform group-hover:scale-115 group-hover:opacity-100">
                    <Play size={20} className="ml-0.5 fill-white" />
                  </div>
                </div>
                <div className="absolute bottom-2.5 right-2.5 rounded bg-black/80 px-2 py-0.5 text-[11px] font-bold text-white">
                  {formatDuration(video.durationSec)}
                </div>
              </div>

              {/* Info Body */}
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye size={12} /> {formatViews(video.viewsCount || 0)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {video.publishedAt
                      ? new Date(video.publishedAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Recent'}
                  </span>
                </div>

                <h3
                  onClick={() => setSelectedVideo(video)}
                  className="text-foreground line-clamp-2 text-base font-bold leading-snug cursor-pointer group-hover:text-[var(--color-brand-green)] transition-colors mb-2"
                >
                  {video.title}
                </h3>

                <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed mb-4">
                  {video.excerpt}
                </p>

                {/* Tags and Action */}
                <div className="mt-auto flex items-center justify-between border-t border-border/30 pt-3 text-xs">
                  <div className="flex flex-wrap gap-1.5">
                    {video.tags?.slice(0, 2).map((t, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-secondary/50 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/videos/${video.slug}`}
                    className="font-bold text-[var(--color-brand-green)] hover:underline inline-flex items-center gap-1 text-[11px]"
                  >
                    Details <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Modal Player */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-border/60 bg-card shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/40 p-4">
              <h4 className="text-foreground line-clamp-1 text-sm font-bold sm:text-base">
                {selectedVideo.title}
              </h4>
              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/50 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            {/* Video Iframe Embed */}
            <div className="relative aspect-video w-full bg-black">
              {selectedVideo.youtubeId ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${selectedVideo.youtubeId}?autoplay=1&rel=0`}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full border-0"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center">
                  <Tv size={48} className="text-muted-foreground mb-3" />
                  <p className="text-foreground font-bold">Video stream preview</p>
                  <p className="text-muted-foreground text-xs max-w-md mt-1">
                    This video is part of TractorDost expert field test series.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer / Description */}
            <div className="p-6 bg-card/60">
              <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye size={14} /> {formatViews(selectedVideo.viewsCount || 0)}
                </span>
                <Link
                  href={`/videos/${selectedVideo.slug}`}
                  className="text-[var(--color-brand-green)] font-bold hover:underline"
                >
                  View Full Article & Transcript &rarr;
                </Link>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {selectedVideo.excerpt}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
