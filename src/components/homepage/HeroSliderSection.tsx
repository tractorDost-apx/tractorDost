'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Search,
  ChevronRight,
  ChevronLeft,
  Tractor,
  Handshake,
  CircleDollarSign,
  Landmark,
  Wrench,
  ShieldCheck,
  BadgePercent,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { AnimatedWord } from '@/components/ui/AnimatedWord';
import { isExternalLink, trackBannerEvent } from '@/lib/api/banners';
import type { PublicBanner } from '@/types/models/banner';

interface SlideData {
  id: number;
  image: string;
  badge: string;
  highlightText: string;
  titleSuffix: string;
  description: string;
  statLabel: string;
  statValue: string;
}

const SLIDES: SlideData[] = [
  {
    id: 1,
    image: '/images/hero/slide-1.jpg',
    badge: "India's Premium Tractor Network",
    highlightText: 'Find the Perfect',
    titleSuffix: 'for Your Farm',
    description:
      'Discover, buy, and finance premium new and used tractors. Compare models and connect with verified dealers instantly.',
    statLabel: 'Farmers Empowered',
    statValue: '50,000+',
  },
  {
    id: 2,
    image: '/images/hero/slide-2.jpg',
    badge: '100% Certified & Inspected',
    highlightText: 'Find the Perfect',
    titleSuffix: 'for Your Farm',
    description:
      'Explore verified pre-owned tractors with multi-point quality checks, authentic RC book verification, and transparent price tags.',
    statLabel: 'Verified Dealers',
    statValue: '1,200+',
  },
  {
    id: 3,
    image: '/images/hero/slide-3.jpg',
    badge: 'Quick & Transparent Agri Loans',
    highlightText: 'Find the Perfect',
    titleSuffix: 'for Your Farm',
    description:
      'Get hassle-free tractor loan approval with lowest interest rates from 15+ leading banking partners and minimum paperwork.',
    statLabel: 'Loan Approval Rate',
    statValue: '98.5%',
  },
];

/** One background slide. Slides built from a managed banner carry its id, which tracking uses. */
interface HeroSlide {
  key: string;
  bannerId?: number;
  image: string;
  mobileImage?: string;
  alt: string;
  badge: string;
  cta?: { bannerId: number; label: string; href: string; external: boolean };
}

const FALLBACK_SLIDES: HeroSlide[] = SLIDES.map((slide) => ({
  key: `fallback-${slide.id}`,
  image: slide.image,
  alt: slide.badge,
  badge: slide.badge,
}));

const NO_BANNERS: PublicBanner[] = [];

/**
 * Live banners replace the static slides. A banner with no mobile image shows its desktop image on phones.
 * With no live banners, the static slides are shown, so the hero is unchanged.
 */
function buildSlides(banners: PublicBanner[]): HeroSlide[] {
  if (banners.length === 0) return FALLBACK_SLIDES;

  return banners.map((banner) => ({
    key: `banner-${banner.id}`,
    bannerId: banner.id,
    image: banner.imageUrl,
    mobileImage: banner.mobileImageUrl ?? undefined,
    alt: banner.altText || banner.title || '',
    badge: banner.title || '',
    cta:
      banner.ctaText && banner.linkUrl
        ? {
            bannerId: banner.id,
            label: banner.ctaText,
            href: banner.linkUrl,
            external: isExternalLink(banner.linkUrl),
          }
        : undefined,
  }));
}

interface HeroSliderSectionProps {
  /** Live homepage banners, already in display order. */
  banners?: PublicBanner[];
}

export default function HeroSliderSection({ banners = NO_BANNERS }: HeroSliderSectionProps) {
  const router = useRouter();
  const slides = useMemo(() => buildSlides(banners), [banners]);
  const slideCount = slides.length;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [budget, setBudget] = useState('');
  const [hp, setHp] = useState('');
  const slideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const countedImpressions = useRef<Set<number>>(new Set());

  const activeSlide = slides[currentSlide];
  const cta = activeSlide.cta;
  const activeBannerId = activeSlide.bannerId;

  // Auto-slide effect with pause on hover
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  // An impression counts only while at least half of the hero is on screen, once per banner per page load.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.intersectionRatio >= 0.5), {
      threshold: [0, 0.5, 1],
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || activeBannerId === undefined || countedImpressions.current.has(activeBannerId)) return;
    countedImpressions.current.add(activeBannerId);
    trackBannerEvent(activeBannerId, 'impression');
  }, [inView, activeBannerId]);

  useEffect(() => {
    if (isPaused) return;

    slideTimerRef.current = setInterval(() => {
      nextSlide();
    }, 5500);

    return () => {
      if (slideTimerRef.current) clearInterval(slideTimerRef.current);
    };
  }, [isPaused, nextSlide]);

  // Handle Search & Filter Submission
  const handleExplore = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (budget) params.set('price', budget);
    if (hp) params.set('hp', hp);

    const queryStr = params.toString();
    router.push(`/tractors${queryStr ? `?${queryStr}` : ''}`);
  };

  return (
    <section
      ref={sectionRef}
      className="group relative w-full overflow-hidden transition-all duration-500"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Hero Tractor Slider"
    >
      {/* =========================================
          BACKGROUND SLIDES CAROUSEL
          ========================================= */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-stone-950">
        {slides.map((slide, idx) => {
          const isActive = idx === currentSlide;
          return (
            <div
              key={slide.key}
              className={`absolute inset-0 transition-all duration-1000 ease-out ${
                isActive
                  ? 'scale-100 opacity-100'
                  : 'pointer-events-none scale-105 opacity-0'
              }`}
            >
              {slide.bannerId !== undefined ? (
                // Device-specific image: phones (under 768px) get the mobile image when one is set,
                // and every other case uses the desktop image. The browser picks the source, so no JS runs.
                <picture className="absolute inset-0 block h-full w-full">
                  {slide.mobileImage && (
                    <source media="(max-width: 767px)" srcSet={slide.mobileImage} />
                  )}
                  {/* Remote S3 images are not whitelisted in next.config, so a plain <img> is used. */}
                  <img
                    src={slide.image}
                    alt={slide.alt}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    className="h-full w-full object-cover object-center"
                  />
                </picture>
              ) : (
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  priority={idx === 0}
                  sizes="100vw"
                  className="object-cover object-center"
                />
              )}
            </div>
          );
        })}

        {/* Clean, Sharp Photographic Dark Gradients for Text Contrast (No Blurs or Hazy Glows) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />
      </div>

      {/* =========================================
          HERO CONTENT CONTAINER (LEFT TEXT & RIGHT VERTICAL CARD)
          ========================================= */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col justify-between gap-12 px-6 pt-36 pb-14 sm:px-10 sm:pt-40 sm:pb-16 md:min-h-[780px] lg:min-h-[800px] lg:flex-row lg:items-start lg:gap-14 lg:pt-40 lg:pb-20 xl:px-14">
        {/* -----------------------------------------
            LEFT SIDE: HEADINGS, BADGES & HIGHLIGHTS
            ----------------------------------------- */}
        <div className="flex flex-1 flex-col items-start justify-start text-left pt-2">
          {/* Active Dynamic Badge (banner title on banner slides, static badge otherwise) */}
          {activeSlide.badge && (
            <div className="inline-flex cursor-default items-center gap-2.5 rounded-full border border-white/20 bg-black/40 px-4 py-1.5 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-white/40 hover:bg-black/60">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-brand-green)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-brand-green)]" />
              </span>
              <span className="text-xs font-semibold tracking-wider text-white/90 uppercase">
                {activeSlide.badge}
              </span>
            </div>
          )}

          {/* Main Hero Title */}
          <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[4.2rem] lg:leading-[1.1]">
            <span className="block">Find the Perfect</span>
            <div className="my-1.5 flex h-[1.15em] items-center justify-start text-left overflow-visible text-[var(--color-brand-green)]">
              <AnimatedWord />
            </div>
            <span className="block text-2xl font-bold tracking-tight text-white/95 sm:text-4xl md:text-5xl">
              for Your Farm
            </span>
          </h1>

          {/* Subtitle Paragraph */}
          <p className="mt-5 max-w-xl text-base leading-relaxed font-normal text-white/80 sm:text-lg">
            Discover, buy, and finance premium new and used tractors. Compare models and connect
            with verified dealers instantly.
          </p>

          {/* Banner call-to-action. Only on slides from a managed banner that has both a label and a link. */}
          {cta && (
            <div className="mt-6">
              {cta.external ? (
                <a
                  href={cta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackBannerEvent(cta.bannerId, 'click')}
                  className="inline-flex items-center rounded-full bg-[var(--color-brand-green)] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-[var(--color-brand-green-dark)]"
                >
                  {cta.label}
                </a>
              ) : (
                <Link
                  href={cta.href}
                  onClick={() => trackBannerEvent(cta.bannerId, 'click')}
                  className="inline-flex items-center rounded-full bg-[var(--color-brand-green)] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-[var(--color-brand-green-dark)]"
                >
                  {cta.label}
                </Link>
              )}
            </div>
          )}

          {/* Farmer Trust Badges */}
          <div className="mt-7 flex flex-wrap items-center gap-4 pt-1 sm:gap-6">
            <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-black/30 px-3.5 py-1.5 backdrop-blur-md">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-brand-green)]/20 text-[var(--color-brand-green)]">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-medium text-white/90">100% Verified Dealers</span>
            </div>

            <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-black/30 px-3.5 py-1.5 backdrop-blur-md">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-brand-orange)]/20 text-[var(--color-brand-orange)]">
                <BadgePercent className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-medium text-white/90">Lowest EMI & Loans</span>
            </div>

            <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-black/30 px-3.5 py-1.5 backdrop-blur-md">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-medium text-white/90">Zero Hidden Brokerage</span>
            </div>
          </div>

          {/* Slide Navigation Controls & Progress Indicator */}
          <div className="mt-8 flex items-center gap-4">
            {/* Prev / Next Arrows */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous Slide"
                suppressHydrationWarning
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/90 backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-white/50 hover:bg-black/70 hover:text-white"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next Slide"
                suppressHydrationWarning
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/90 backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-white/50 hover:bg-black/70 hover:text-white"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Slide Indicator Bars */}
            <div className="flex items-center gap-2">
              {slides.map((_, idx) => {
                const isActive = idx === currentSlide;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    suppressHydrationWarning
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isActive
                        ? 'w-8 bg-[var(--color-brand-green)]'
                        : 'w-2.5 bg-white/30 hover:bg-white/60'
                    }`}
                  />
                );
              })}
            </div>

            {/* Slide Index Counter */}
            <span className="ml-2 font-mono text-xs font-semibold tracking-wider text-white/70">
              0{currentSlide + 1} / 0{slideCount}
            </span>
          </div>
        </div>

        {/* -----------------------------------------
            RIGHT SIDE: VERTICAL RECTANGLE CARD
            (Search Brand, HP, Budget, Explore & Quick Links)
            ----------------------------------------- */}
        <div className="w-full shrink-0 md:max-w-md lg:w-[410px] xl:w-[440px]">
          <div className="rounded-[2rem] border border-black/10 bg-white/95 p-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] backdrop-blur-2xl transition-all duration-300 sm:p-6 dark:border-white/15 dark:bg-[#0c100e]/90">
            {/* Card Header */}
            <div className="mb-4 flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-brand-green)]/15 text-[var(--color-brand-green)]">
                  <Search className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-foreground text-sm font-bold tracking-tight">
                    Smart Tractor Matcher
                  </h3>
                  <p className="text-muted text-[11px] font-medium">Find models matching your needs</p>
                </div>
              </div>
              <span className="rounded-full border border-[var(--color-brand-orange)]/25 bg-[var(--color-brand-orange)]/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-[var(--color-brand-orange)] uppercase">
                Instant
              </span>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--color-brand-green)] opacity-85">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExplore()}
                placeholder="Search Brand, HP, Budget..."
                className="text-foreground placeholder:text-muted/60 w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.04] py-3 pr-4 pl-10 text-sm font-medium transition-all duration-200 focus:border-[var(--color-brand-green)] focus:bg-background focus:ring-2 focus:ring-[var(--color-brand-green)]/20 focus:outline-none"
                suppressHydrationWarning
              />
            </div>

            {/* Dropdowns Row (Budget & HP) */}
            <div className="mb-3.5 grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-muted mb-1 block text-[11px] font-bold tracking-wider uppercase">
                  Any Budget
                </label>
                <div className="relative">
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="text-foreground w-full cursor-pointer appearance-none rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.04] px-3 py-2.5 pr-8 text-xs font-semibold transition-all duration-200 hover:border-[var(--color-brand-green)]/50 focus:border-[var(--color-brand-green)] focus:bg-background focus:outline-none"
                    suppressHydrationWarning
                  >
                    <option value="" className="bg-background text-foreground">
                      Any Budget
                    </option>
                    <option value="under5" className="bg-background text-foreground">
                      Under 5 Lakh
                    </option>
                    <option value="5to8" className="bg-background text-foreground">
                      5 - 8 Lakh
                    </option>
                    <option value="over8" className="bg-background text-foreground">
                      Above 8 Lakh
                    </option>
                  </select>
                  <div className="text-muted pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
                    <ChevronRight size={14} className="rotate-90" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-muted mb-1 block text-[11px] font-bold tracking-wider uppercase">
                  Any HP
                </label>
                <div className="relative">
                  <select
                    value={hp}
                    onChange={(e) => setHp(e.target.value)}
                    className="text-foreground w-full cursor-pointer appearance-none rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.04] px-3 py-2.5 pr-8 text-xs font-semibold transition-all duration-200 hover:border-[var(--color-brand-green)]/50 focus:border-[var(--color-brand-green)] focus:bg-background focus:outline-none"
                    suppressHydrationWarning
                  >
                    <option value="" className="bg-background text-foreground">
                      Any HP
                    </option>
                    <option value="under30" className="bg-background text-foreground">
                      Under 30 HP
                    </option>
                    <option value="30to50" className="bg-background text-foreground">
                      30 - 50 HP
                    </option>
                    <option value="over50" className="bg-background text-foreground">
                      Above 50 HP
                    </option>
                  </select>
                  <div className="text-muted pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
                    <ChevronRight size={14} className="rotate-90" />
                  </div>
                </div>
              </div>
            </div>

            {/* Explore Button */}
            <button
              type="button"
              onClick={() => handleExplore()}
              className="group/btn relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[var(--color-brand-green)] py-3 text-sm font-bold tracking-wider text-white uppercase shadow-md transition-all duration-300 hover:bg-[var(--color-brand-green-dark)] hover:shadow-[0_8px_20px_rgba(74,118,53,0.35)] active:scale-[0.99]"
              suppressHydrationWarning
            >
              <span>Explore Tractors</span>
              <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </button>

            {/* Subtle Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="border-border w-full border-t" />
              <span className="text-muted bg-white px-2.5 text-[10px] font-bold tracking-wider uppercase dark:bg-[#0c100e]">
                Quick Services
              </span>
            </div>

            {/* Quick Action Links inside the Vertical Rectangle */}
            <div className="grid grid-cols-2 gap-2">
              {/* 1. New Tractors */}
              <Link
                href="/tractors"
                className="group flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-2.5 transition-all duration-200 hover:border-[var(--color-brand-green)]/40 hover:bg-[var(--color-brand-green)]/10 hover:shadow-sm"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] transition-transform duration-200 group-hover:scale-110">
                  <Tractor className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground text-xs font-bold transition-colors group-hover:text-[var(--color-brand-green)]">
                    New Tractors
                  </p>
                  <p className="text-muted text-[10px] font-medium">Latest models</p>
                </div>
              </Link>

              {/* 2. Used Tractors */}
              <Link
                href="/used-tractors"
                className="group flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-2.5 transition-all duration-200 hover:border-[var(--color-brand-orange)]/40 hover:bg-[var(--color-brand-orange)]/10 hover:shadow-sm"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-brand-orange)]/10 text-[var(--color-brand-orange)] transition-transform duration-200 group-hover:scale-110">
                  <Handshake className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground text-xs font-bold transition-colors group-hover:text-[var(--color-brand-orange)]">
                    Used Tractors
                  </p>
                  <p className="text-muted text-[10px] font-medium">Verified pre-owned</p>
                </div>
              </Link>

              {/* 3. Sell Tractor */}
              <Link
                href="/sell"
                className="group flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-2.5 transition-all duration-200 hover:border-[var(--color-brand-green)]/40 hover:bg-[var(--color-brand-green)]/10 hover:shadow-sm"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] transition-transform duration-200 group-hover:scale-110">
                  <CircleDollarSign className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground text-xs font-bold transition-colors group-hover:text-[var(--color-brand-green)]">
                    Sell Tractor
                  </p>
                  <p className="text-muted text-[10px] font-medium">Best price offer</p>
                </div>
              </Link>

              {/* 4. Tractor Loan */}
              <Link
                href="/loan"
                className="group flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-2.5 transition-all duration-200 hover:border-[var(--color-brand-orange)]/40 hover:bg-[var(--color-brand-orange)]/10 hover:shadow-sm"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-brand-orange)]/10 text-[var(--color-brand-orange)] transition-transform duration-200 group-hover:scale-110">
                  <Landmark className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground text-xs font-bold transition-colors group-hover:text-[var(--color-brand-orange)]">
                    Tractor Loan
                  </p>
                  <p className="text-muted text-[10px] font-medium">Low interest EMI</p>
                </div>
              </Link>

              {/* 5. Implements (Full Width 5th item) */}
              <Link
                href="/implements"
                className="group col-span-2 flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-2.5 transition-all duration-200 hover:border-[var(--color-brand-green)]/40 hover:bg-[var(--color-brand-green)]/10 hover:shadow-sm"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] transition-transform duration-200 group-hover:scale-110">
                  <Wrench className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-foreground text-xs font-bold transition-colors group-hover:text-[var(--color-brand-green)]">
                      Implements & Tools
                    </p>
                    <span className="text-[10px] font-semibold text-[var(--color-brand-green)]">
                      Explore All &rarr;
                    </span>
                  </div>
                  <p className="text-muted text-[10px] font-medium">
                    Rotavators, cultivators, trolleys & farm equipment
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
