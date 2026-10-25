'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Layers,
  ArrowRight,
  Share2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { cmsAPI, ContentPost } from '@/lib/api/cms';
import { TractorLoader } from '@/components/ui/TractorLoader';

export interface StorySlide {
  title: string;
  description: string;
  image: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface WebStoryItem {
  id: number;
  title: string;
  slug: string;
  coverImage: string;
  viewsCount: number;
  slides: StorySlide[];
  publishedAt: string;
}

// Curated high quality agricultural Web Stories fallback
const CURATED_STORIES: WebStoryItem[] = [
  {
    id: 801,
    title: 'Top 5 Most Fuel-Efficient 45 HP Tractors for Indian Farmers in 2026',
    slug: 'top-5-fuel-efficient-45hp-tractors',
    coverImage: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=600&auto=format&fit=crop',
    viewsCount: 28400,
    publishedAt: '2026-03-20T10:00:00Z',
    slides: [
      {
        title: 'Fuel Efficiency Matters More Than Ever',
        description: 'With diesel prices impacting operational margins, choosing an engine with high torque at lower RPMs can save up to ₹45,000 every harvest season.',
        image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=900&auto=format&fit=crop',
      },
      {
        title: '#1 Mahindra 575 DI XP Plus',
        description: 'Delivers 47 HP with extra-long-stroke 4-cylinder engine. Averages just 3.8L/hr during medium rotavator operation.',
        image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=900&auto=format&fit=crop',
        ctaText: 'View Mahindra 575 DI',
        ctaLink: '/tractors',
      },
      {
        title: '#2 Swaraj 744 FE',
        description: 'Beloved 48 HP workhorse with 3136 cc displacement. Direct injection fuel pump ensures low fuel burn in dry soil.',
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=900&auto=format&fit=crop',
        ctaText: 'Check Swaraj Price',
        ctaLink: '/tractors',
      },
      {
        title: '#3 John Deere 5045 D',
        description: 'Piston-spray jet cooling and turbocharger efficiency provide 15% better fuel conservation on heavy trailer haulage.',
        image: 'https://images.unsplash.com/photo-1594771804886-a933bb2d609b?q=80&w=900&auto=format&fit=crop',
      },
      {
        title: 'Ready to Upgrade Your Tractor?',
        description: 'Explore on-road prices, check instant pre-approved loans, or book a free doorstep test drive today.',
        image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=900&auto=format&fit=crop',
        ctaText: 'Apply for Tractor Loan',
        ctaLink: '/loan',
      },
    ],
  },
  {
    id: 802,
    title: 'How to Inspect a Used Tractor: 6 Critical Checks Before You Pay',
    slug: 'how-to-inspect-a-used-tractor',
    coverImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=600&auto=format&fit=crop',
    viewsCount: 41200,
    publishedAt: '2026-03-18T12:00:00Z',
    slides: [
      {
        title: 'Step 1: Check Engine Blow-by & Exhaust Smoke',
        description: 'Remove the oil dipstick while idling. White vapor or excessive oil splashing indicates worn piston rings and costly rebuilds.',
        image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=900&auto=format&fit=crop',
      },
      {
        title: 'Step 2: Inspect Hydraulic Lift Under Load',
        description: 'Attach a heavy cultivator or rotavator. Raise the lift and switch off the engine. If the implement sinks within 2 minutes, cylinder seals are leaking.',
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=900&auto=format&fit=crop',
      },
      {
        title: 'Step 3: Verify Original Hour Meter & Tyres',
        description: 'Compare tyre tread wear with meter reading. Front tyres worn out under 1,000 hours suggests meter tampering.',
        image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=900&auto=format&fit=crop',
      },
      {
        title: 'Get 100% Certified Used Tractors',
        description: 'TractorDost conducts 120-point mechanical inspections and authenticates RC & hypothecation papers so you buy with total peace of mind.',
        image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=900&auto=format&fit=crop',
        ctaText: 'Browse Certified Used Tractors',
        ctaLink: '/used-tractors',
      },
    ],
  },
  {
    id: 803,
    title: 'Rotavator vs Cultivator vs MB Plough: Which Implement When?',
    slug: 'rotavator-vs-cultivator-vs-mb-plough',
    coverImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=600&auto=format&fit=crop',
    viewsCount: 19800,
    publishedAt: '2026-03-14T09:30:00Z',
    slides: [
      {
        title: 'Primary vs Secondary Tillage',
        description: 'Using the right implement saves up to 30% tractor fuel and prepares optimal seedbeds for higher seed germination.',
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=900&auto=format&fit=crop',
      },
      {
        title: 'MB Plough: Deep Inversion Tillage',
        description: 'Buries stubborn weed seeds and crop stubble 9-12 inches deep. Recommended after harvest before sowing new season crops.',
        image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=900&auto=format&fit=crop',
      },
      {
        title: 'Rotavator: Instant Fine Tilth',
        description: 'One single pass pulverizes soil into powdery tilth, reducing land prep time from 3 passes to just 1.',
        image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=900&auto=format&fit=crop',
        ctaText: 'Explore Rotavators',
        ctaLink: '/implements',
      },
    ],
  },
  {
    id: 804,
    title: 'PM Kisan Tractor Subsidy Scheme 2026: Eligibility & Online Application',
    slug: 'pm-kisan-tractor-subsidy-scheme-2026',
    coverImage: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=600&auto=format&fit=crop',
    viewsCount: 52100,
    publishedAt: '2026-03-10T15:45:00Z',
    slides: [
      {
        title: 'Up to 50% Government Subsidy on New Tractors',
        description: 'Small and marginal farmers, women farmers, and SC/ST farmers can avail substantial central and state subsidies under the SMAM initiative.',
        image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=900&auto=format&fit=crop',
      },
      {
        title: 'Key Eligibility Criteria',
        description: 'Must own cultivable land in applicant’s name and have not availed any government tractor subsidy in the preceding 7 years.',
        image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=900&auto=format&fit=crop',
      },
      {
        title: 'Documents Required for Direct Benefit Transfer',
        description: 'Aadhaar Card, Land Revenue Record (7/12 or Khasra), Bank Passbook copy with active DBT linkage, and PAN Card.',
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=900&auto=format&fit=crop',
        ctaText: 'Check Loan & Subsidy Help',
        ctaLink: '/loan',
      },
    ],
  },
];

export function WebStoriesClient() {
  const [stories, setStories] = useState<WebStoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Story viewer modal state
  const [activeStoryIdx, setActiveStoryIdx] = useState<number | null>(null);
  const [currentSlideIdx, setCurrentSlideIdx] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    async function loadStories() {
      try {
        setLoading(true);
        const res = await cmsAPI.getPosts({ postType: 'WEB_STORY', limit: 20 });
        if (res.data && res.data.length > 0) {
          const mapped: WebStoryItem[] = res.data.map((p) => {
            const rawSlides = Array.isArray(p.storySlides) ? (p.storySlides as StorySlide[]) : [];
            return {
              id: p.id,
              title: p.title,
              slug: p.slug,
              coverImage: p.featuredImage || p.thumbnailUrl || CURATED_STORIES[0].coverImage,
              viewsCount: p.viewsCount || 5000,
              publishedAt: p.publishedAt || p.createdAt,
              slides:
                rawSlides.length > 0
                  ? rawSlides
                  : [
                      {
                        title: p.title,
                        description: p.excerpt || 'Swipe to learn more about tractor technology.',
                        image: p.featuredImage || CURATED_STORIES[0].coverImage,
                        ctaText: 'Explore More',
                        ctaLink: '/tractors',
                      },
                    ],
            };
          });
          setStories(mapped);
        } else {
          setStories(CURATED_STORIES);
        }
      } catch (err) {
        console.warn('Using curated stories fallback:', err);
        setStories(CURATED_STORIES);
      } finally {
        setLoading(false);
      }
    }
    loadStories();
  }, []);

  // Timer effect for auto-advancing slide in modal
  useEffect(() => {
    if (activeStoryIdx === null || isPaused) return;

    const currentStory = stories[activeStoryIdx];
    if (!currentStory) return;

    const intervalMs = 60; // tick step
    const slideDurationMs = 5000;
    const increment = (intervalMs / slideDurationMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev + increment >= 100) {
          // Slide finished, advance or next story
          if (currentSlideIdx < currentStory.slides.length - 1) {
            setCurrentSlideIdx((s) => s + 1);
            return 0;
          } else if (activeStoryIdx < stories.length - 1) {
            // Next story
            setActiveStoryIdx((si) => (si !== null ? si + 1 : null));
            setCurrentSlideIdx(0);
            return 0;
          } else {
            // End of all stories, close viewer
            setActiveStoryIdx(null);
            setCurrentSlideIdx(0);
            return 0;
          }
        }
        return prev + increment;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [activeStoryIdx, currentSlideIdx, isPaused, stories]);

  // Open story
  const openStory = (idx: number) => {
    setActiveStoryIdx(idx);
    setCurrentSlideIdx(0);
    setProgress(0);
    setIsPaused(false);
  };

  const closeStory = () => {
    setActiveStoryIdx(null);
    setCurrentSlideIdx(0);
    setProgress(0);
    setIsPaused(false);
  };

  const handlePrevSlide = () => {
    if (currentSlideIdx > 0) {
      setCurrentSlideIdx((s) => s - 1);
      setProgress(0);
    } else if (activeStoryIdx !== null && activeStoryIdx > 0) {
      setActiveStoryIdx((si) => (si !== null ? si - 1 : 0));
      const prevStory = stories[activeStoryIdx - 1];
      setCurrentSlideIdx(prevStory.slides.length - 1);
      setProgress(0);
    }
  };

  const handleNextSlide = () => {
    if (activeStoryIdx === null) return;
    const currentStory = stories[activeStoryIdx];
    if (currentSlideIdx < currentStory.slides.length - 1) {
      setCurrentSlideIdx((s) => s + 1);
      setProgress(0);
    } else if (activeStoryIdx < stories.length - 1) {
      setActiveStoryIdx((si) => (si !== null ? si + 1 : null));
      setCurrentSlideIdx(0);
      setProgress(0);
    } else {
      closeStory();
    }
  };

  const activeStory = activeStoryIdx !== null ? stories[activeStoryIdx] : null;
  const activeSlide = activeStory ? activeStory.slides[currentSlideIdx] : null;

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-4 pt-12 pb-24 sm:px-6 lg:px-8">
      {/* Header */}
      <section className="relative flex flex-col items-center justify-center pt-8 pb-12 text-center">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 px-4 py-1.5 text-xs font-black tracking-widest text-[var(--color-brand-green)] uppercase">
            <Sparkles size={14} /> Visual Web Stories
          </div>
          <h1 className="text-foreground text-4xl leading-tight font-extrabold tracking-tight md:text-6xl">
            Tractor & Farming <span className="text-[var(--color-brand-green)]">Web Stories</span>
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Quick, visual, tap-friendly guides on tractor maintenance, farm schemes, new launches, and buying advice.
          </p>
        </div>
        <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-brand-green)]/5 blur-[120px]" />
      </section>

      {/* Stories Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <TractorLoader size={48} />
          <p className="text-muted-foreground mt-4 text-sm font-semibold">Loading Web Stories...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
          {stories.map((story, idx) => (
            <div
              key={story.id}
              onClick={() => openStory(idx)}
              className="group relative flex aspect-[9/16] cursor-pointer flex-col justify-end overflow-hidden rounded-3xl border border-border/60 bg-black p-4 shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--color-brand-green)] hover:shadow-2xl"
            >
              {/* Cover Image */}
              <img
                src={story.coverImage}
                alt={story.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

              {/* Top Badges */}
              <div className="relative z-10 mb-auto flex items-center justify-between text-[11px] text-white">
                <span className="flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 backdrop-blur-md">
                  <Layers size={12} className="text-[var(--color-brand-green)]" />
                  {story.slides.length} Slides
                </span>
                <span className="flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 backdrop-blur-md">
                  <Eye size={12} />
                  {(story.viewsCount / 1000).toFixed(0)}k
                </span>
              </div>

              {/* Bottom Title & Play Overlay */}
              <div className="relative z-10 space-y-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-brand-green)] text-white shadow-md transition-transform group-hover:scale-110">
                  <Play size={16} className="ml-0.5 fill-white" />
                </div>
                <h3 className="line-clamp-3 text-sm sm:text-base font-extrabold text-white leading-snug drop-shadow-md">
                  {story.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Fullscreen Story Viewer Modal */}
      {activeStory && activeSlide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-2 sm:p-6">
          {/* Close button outside on desktop */}
          <button
            type="button"
            onClick={closeStory}
            className="absolute top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Phone-aspect Container */}
          <div
            className="relative flex aspect-[9/16] h-[92vh] max-h-[820px] w-auto max-w-[460px] flex-col justify-between overflow-hidden rounded-3xl border border-white/20 bg-black shadow-2xl"
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {/* Background Image of current slide */}
            <img
              src={activeSlide.image}
              alt={activeSlide.title}
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/60" />

            {/* Click zones for Previous / Next */}
            <div
              className="absolute left-0 top-16 bottom-24 w-1/3 z-20 cursor-pointer"
              onClick={handlePrevSlide}
            />
            <div
              className="absolute right-0 top-16 bottom-24 w-1/3 z-20 cursor-pointer"
              onClick={handleNextSlide}
            />

            {/* Top Bar: Progress Segments */}
            <div className="relative z-30 p-4 space-y-3">
              <div className="flex gap-1.5 w-full">
                {activeStory.slides.map((_, sIdx) => {
                  let barProgress = 0;
                  if (sIdx < currentSlideIdx) barProgress = 100;
                  else if (sIdx === currentSlideIdx) barProgress = progress;

                  return (
                    <div
                      key={sIdx}
                      className="h-1 flex-1 overflow-hidden rounded-full bg-white/30 backdrop-blur-sm"
                    >
                      <div
                        className="h-full bg-white transition-all duration-75"
                        style={{ width: `${barProgress}%` }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Story Header */}
              <div className="flex items-center justify-between text-white">
                <span className="text-xs font-black uppercase tracking-wider text-[var(--color-brand-green)]">
                  TractorDost Stories
                </span>
                <span className="text-[11px] font-semibold text-white/70">
                  {currentSlideIdx + 1} / {activeStory.slides.length}
                </span>
              </div>
            </div>

            {/* Bottom Content Area */}
            <div className="relative z-30 p-6 space-y-4">
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-lg">
                {activeSlide.title}
              </h2>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed drop-shadow-md">
                {activeSlide.description}
              </p>

              {activeSlide.ctaLink && (
                <div className="pt-2">
                  <Link
                    href={activeSlide.ctaLink}
                    onClick={closeStory}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-brand-green)] py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-xl transition-all hover:bg-[var(--color-brand-green)]/90"
                  >
                    {activeSlide.ctaText || 'Learn More'} <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
