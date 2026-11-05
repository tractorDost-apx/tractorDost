'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  ChevronLeft,
  Star,
  Tractor,
  Handshake,
  BookOpen,
  Wrench,
} from 'lucide-react';
import { tractorAPI, Tractor as TractorModel, LaunchStatus } from '@/lib/api/tractors';
import { implementAPI, Implement } from '@/lib/api/implements';
import { brandAPI, Brand } from '@/lib/api/brands';
import { compareAPI, CompareFrequencyRecord } from '@/lib/api/compare';
import { cmsAPI, ContentPost } from '@/lib/api/cms';
import HeroSliderSection from '@/components/homepage/HeroSliderSection';
import type { PublicBanner } from '@/types/models/banner';



interface HomePageClientProps {
  children?: React.ReactNode;
  /** Live hero banners from the Banner Management module, fetched on the server. */
  banners?: PublicBanner[];
}

export default function HomePageClient({ children, banners }: HomePageClientProps) {
  const [featuredTractors, setFeaturedTractors] = useState<TractorModel[]>([]);
  const [popularTractors, setPopularTractors] = useState<TractorModel[]>([]);
  const [upcomingTractors, setUpcomingTractors] = useState<TractorModel[]>([]);
  const [latestTractors, setLatestTractors] = useState<TractorModel[]>([]);
  const [implementsList, setImplementsList] = useState<Implement[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [comparisons, setComparisons] = useState<CompareFrequencyRecord[]>([]);
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Horizontal scroll controls for brands
  const brandScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkBrandScroll = useCallback(() => {
    const el = brandScrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  const scrollBrands = (direction: 'left' | 'right') => {
    const el = brandScrollRef.current;
    if (!el) return;
    const scrollAmount = Math.max(280, el.clientWidth * 0.75);
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    checkBrandScroll();
    window.addEventListener('resize', checkBrandScroll);
    return () => window.removeEventListener('resize', checkBrandScroll);
  }, [brands, checkBrandScroll]);

  // Horizontal scroll controls for blogs & news
  const blogScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollBlogsLeft, setCanScrollBlogsLeft] = useState(false);
  const [canScrollBlogsRight, setCanScrollBlogsRight] = useState(true);

  const checkBlogScroll = useCallback(() => {
    const el = blogScrollRef.current;
    if (!el) return;
    setCanScrollBlogsLeft(el.scrollLeft > 10);
    setCanScrollBlogsRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  const scrollBlogs = (direction: 'left' | 'right') => {
    const el = blogScrollRef.current;
    if (!el) return;
    const scrollAmount = Math.max(300, el.clientWidth * 0.75);
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    checkBlogScroll();
    window.addEventListener('resize', checkBlogScroll);
    return () => window.removeEventListener('resize', checkBlogScroll);
  }, [posts, checkBlogScroll]);

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const [
          featuredRes,
          popularRes,
          upcomingRes,
          latestRes,
          implementsRes,
          brandsRes,
          compareRes,
          postsRes,
        ] = await Promise.all([
          tractorAPI.getAllTractors({ limit: 10 }),
          tractorAPI.getAllTractors({ limit: 10, launchStatus: LaunchStatus.POPULAR }).catch(() => null),
          tractorAPI.getAllTractors({ limit: 10, launchStatus: LaunchStatus.UPCOMING }).catch(() => null),
          tractorAPI.getAllTractors({ limit: 10, launchStatus: LaunchStatus.LATEST }).catch(() => null),
          implementAPI.getAllImplements({ limit: 10 }).catch(() => null),
          brandAPI.getAllBrands({ limit: 100, sortBy: 'sortOrder', sortOrder: 'asc' }),
          compareAPI.getFrequencyOfCompare({ limit: 3, sort: 'desc' }),
          cmsAPI.getPosts({ limit: 8, status: 'PUBLISHED' }).catch(() => null),
        ]);

        // Featured Tractors
        const allTractors = (featuredRes?.success
          ? featuredRes.data?.tractors || featuredRes.data?.data || []
          : []) as TractorModel[];
        setFeaturedTractors(allTractors);

        // Popular Tractors
        const popData = (popularRes?.success
          ? popularRes.data?.tractors || popularRes.data?.data || []
          : []) as TractorModel[];
        if (popData.length > 0) {
          setPopularTractors(popData);
        } else if (allTractors.length > 0) {
          setPopularTractors(allTractors.slice(0, 10));
        }

        // Upcoming Tractors
        const upData = (upcomingRes?.success
          ? upcomingRes.data?.tractors || upcomingRes.data?.data || []
          : []) as TractorModel[];
        if (upData.length > 0) {
          setUpcomingTractors(upData);
        } else if (allTractors.length > 2) {
          setUpcomingTractors(allTractors.slice(2, 12));
        } else {
          setUpcomingTractors(allTractors);
        }

        // Latest Tractors
        const latData = (latestRes?.success
          ? latestRes.data?.tractors || latestRes.data?.data || []
          : []) as TractorModel[];
        if (latData.length > 0) {
          setLatestTractors(latData);
        } else if (allTractors.length > 0) {
          setLatestTractors(allTractors);
        }

        // Farm Equipment (Implements)
        if (implementsRes?.success && implementsRes.data) {
          const impItems = (implementsRes.data.data || implementsRes.data.implements || []) as Implement[];
          setImplementsList(impItems);
        }

        // Brands
        if (brandsRes.success) {
          const bPayload = brandsRes.data as unknown as {
            brands?: Brand[];
            data?: Brand[];
          };
          const rawBrands = (bPayload?.brands || bPayload?.data || []) as Brand[];
          const sortedBrands = [...rawBrands].sort((a, b) => {
            const orderA = a.sortOrder ?? 0;
            const orderB = b.sortOrder ?? 0;
            if (orderA !== orderB) return orderA - orderB;
            return (a.id ?? 0) - (b.id ?? 0);
          });
          setBrands(sortedBrands);
        }

        // Comparisons
        if (compareRes.success) {
          const cPayload = compareRes.data as unknown as
            | CompareFrequencyRecord[]
            | { records?: CompareFrequencyRecord[] };
          setComparisons(
            Array.isArray(cPayload)
              ? cPayload
              : cPayload?.records || []
          );
        }

        // CMS Posts
        if (postsRes?.success && Array.isArray(postsRes?.data)) {
          setPosts(postsRes.data);
        } else {
          setPosts([]);
        }
      } catch (error) {
        console.error('Failed to load home data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const formatPrice = (price: number | null | undefined) => {
    if (!price) return 'Price on Request';
    if (price >= 100000) return `₹ ${(price / 100000).toFixed(2)} Lakh`;
    return `₹ ${price.toLocaleString()}`;
  };

  const maxFreq = comparisons.length > 0 ? Math.max(...comparisons.map((c) => c.frequency)) : 1;

  return (
    <div className="animate-fade-in flex w-full flex-col items-center justify-center">
      {/* =========================================
          HERO & SMART FINDER SLIDER SECTION (Full-Bleed, Edge-to-Edge)
          ========================================= */}
      <HeroSliderSection banners={banners} />

      {/* =========================================
          DYNAMIC MAIN CONTENT (Synced with Backend)
          ========================================= */}
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 sm:gap-14 lg:gap-16 px-3.5 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-4">
        {/* =========================================
            1. TOP BRANDS HORIZONTAL SCROLL CAROUSEL (Mobile & Desktop)
            ========================================= */}
        <section className="flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-wrap items-end justify-between gap-3 px-1 sm:px-2">
            <div className="flex flex-col gap-1 sm:gap-1.5">
              <h2 className="text-foreground text-2xl sm:text-3xl font-black tracking-tight md:text-4xl">
                Explore Top Brands
              </h2>
              <p className="text-muted text-xs sm:text-base font-semibold">
                Discover the most trusted manufacturers in India.
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/brands"
                className="flex shrink-0 items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-bold tracking-wider text-[var(--color-brand-green)] uppercase transition-colors hover:text-[var(--color-brand-orange)]"
              >
                View All <ChevronRight size={14} className="sm:size-4" />
              </Link>

              {/* Desktop / Tablet Scroll Navigation Arrows */}
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollBrands('left')}
                  disabled={!canScrollLeft}
                  aria-label="Previous Brands"
                  className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 ${
                    canScrollLeft
                      ? 'border-black/10 dark:border-white/10 bg-white dark:bg-card text-foreground hover:bg-[var(--color-brand-green)] hover:text-white hover:border-[var(--color-brand-green)] shadow-xs hover:shadow-md active:scale-95'
                      : 'border-black/5 dark:border-white/5 bg-foreground/5 text-muted opacity-30 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollBrands('right')}
                  disabled={!canScrollRight}
                  aria-label="Next Brands"
                  className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 ${
                    canScrollRight
                      ? 'border-black/10 dark:border-white/10 bg-white dark:bg-card text-foreground hover:bg-[var(--color-brand-green)] hover:text-white hover:border-[var(--color-brand-green)] shadow-xs hover:shadow-md active:scale-95'
                      : 'border-black/5 dark:border-white/5 bg-foreground/5 text-muted opacity-30 cursor-not-allowed'
                  }`}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Horizontal Scrolling Track (Edge-to-Edge Logos in Mobile & Desktop) */}
          <div
            ref={brandScrollRef}
            onScroll={checkBrandScroll}
            className="flex w-full items-start gap-3 sm:gap-4 lg:gap-5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory touch-pan-x py-2 px-3.5 -mx-3.5 sm:mx-0 sm:px-1 scroll-pl-3.5"
          >
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex w-[125px] sm:w-[140px] lg:w-[155px] shrink-0 snap-start flex-col items-center gap-2.5"
                >
                  <div className="bg-foreground/5 aspect-square w-full animate-pulse rounded-2xl" />
                  <div className="bg-foreground/5 h-3.5 w-16 animate-pulse rounded-md" />
                </div>
              ))
              : brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/tractors?brand=${brand.id}`}
                  className="group flex w-[125px] sm:w-[140px] lg:w-[155px] shrink-0 snap-start flex-col items-center gap-2.5 transition-transform duration-300 hover:-translate-y-1"
                >
                  {/* Edge-to-Edge Image Container */}
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-white shadow-xs transition-all duration-300 group-hover:border-[var(--color-brand-green)]/40 group-hover:shadow-lg dark:border-white/10 dark:bg-card">
                    {brand.logoUrl ? (
                      <img
                        src={brand.logoUrl}
                        alt={brand.name}
                        className="h-full w-full object-contain p-2.5 transition-transform duration-300 group-hover:scale-108"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--color-brand-green)]/15 to-[var(--color-brand-green)]/5 text-2xl font-black text-[var(--color-brand-green)]">
                        {brand.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Brand Name Below Image */}
                  <span className="text-foreground group-hover:text-[var(--color-brand-green)] text-center text-xs font-black tracking-wider uppercase transition-colors line-clamp-1 w-full px-1">
                    {brand.name}
                  </span>
                </Link>
              ))}
          </div>
        </section>

        {/* =========================================
            2. FEATURED TRACTORS HORIZONTAL CAROUSEL
            ========================================= */}
        <TractorCarouselSection
          badgeLabel="Premium Selection"
          badgeColor="orange"
          title="Featured Tractors"
          viewAllHref="/tractors"
          viewAllText="View All Tractors"
          tractors={featuredTractors}
          loading={loading}
          cardBadge="Premium"
        />

        {/* =========================================
            3. POPULAR TRACTORS HORIZONTAL CAROUSEL
            ========================================= */}
        <TractorCarouselSection
          badgeLabel="Farmer Favorites"
          badgeColor="green"
          title="Popular Tractors"
          viewAllHref="/tractors?status=POPULAR"
          viewAllText="View All Popular"
          tractors={popularTractors}
          loading={loading}
          cardBadge="Popular"
        />

        {/* =========================================
            4. UPCOMING TRACTORS HORIZONTAL CAROUSEL
            ========================================= */}
        <TractorCarouselSection
          badgeLabel="Coming Soon"
          badgeColor="orange"
          title="Upcoming Tractors"
          viewAllHref="/tractors?status=UPCOMING"
          viewAllText="View All Upcoming"
          tractors={upcomingTractors}
          loading={loading}
          cardBadge="Upcoming"
        />

        {/* =========================================
            5. LATEST TRACTORS HORIZONTAL CAROUSEL
            ========================================= */}
        <TractorCarouselSection
          badgeLabel="Fresh Arrivals"
          badgeColor="green"
          title="Latest Tractors"
          viewAllHref="/tractors?status=LATEST"
          viewAllText="View All Latest"
          tractors={latestTractors}
          loading={loading}
          cardBadge="New"
        />

        {/* =========================================
            6. FARM EQUIPMENT HORIZONTAL CAROUSEL
            ========================================= */}
        <FarmEquipmentCarousel
          implementsList={implementsList}
          loading={loading}
        />

        {/* =========================================
            3. LATEST BLOGS & TRACTOR NEWS (Horizontal Scroll Carousel - Only if real data exists)
            ========================================= */}
        {posts.length > 0 && (
          <section className="flex flex-col gap-4 sm:gap-6">
            <div className="flex flex-wrap items-end justify-between gap-3 px-1 sm:px-2">
              <div>
                <div className="mb-1.5 sm:mb-2 flex items-center gap-2.5 sm:gap-3">
                  <div className="h-1.5 sm:h-2 w-6 sm:w-8 rounded-full bg-[var(--color-brand-green)]" />
                  <p className="text-[11px] sm:text-xs font-black tracking-widest text-[var(--color-brand-green)] uppercase">
                    Agri Insights &amp; Updates
                  </p>
                </div>
                <h2 className="text-foreground text-2xl sm:text-3xl font-black tracking-tight md:text-4xl">
                  Latest Blogs &amp; News
                </h2>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  href="/blogs"
                  className="flex shrink-0 items-center gap-1 text-xs sm:text-sm font-bold text-[var(--color-brand-green)] whitespace-nowrap transition-colors hover:text-[var(--color-brand-orange)]"
                >
                  View All Articles <span>→</span>
                </Link>

                {/* Desktop / Tablet Scroll Navigation Arrows */}
                <div className="hidden sm:flex items-center gap-1.5">
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => scrollBlogs('left')}
                    disabled={!canScrollBlogsLeft}
                    aria-label="Previous Blogs"
                    className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 ${
                      canScrollBlogsLeft
                        ? 'border-black/10 dark:border-white/10 bg-white dark:bg-card text-foreground hover:bg-[var(--color-brand-green)] hover:text-white hover:border-[var(--color-brand-green)] shadow-xs hover:shadow-md active:scale-95'
                        : 'border-black/5 dark:border-white/5 bg-foreground/5 text-muted opacity-30 cursor-not-allowed'
                    }`}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => scrollBlogs('right')}
                    disabled={!canScrollBlogsRight}
                    aria-label="Next Blogs"
                    className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 ${
                      canScrollBlogsRight
                        ? 'border-black/10 dark:border-white/10 bg-white dark:bg-card text-foreground hover:bg-[var(--color-brand-green)] hover:text-white hover:border-[var(--color-brand-green)] shadow-xs hover:shadow-md active:scale-95'
                        : 'border-black/5 dark:border-white/5 bg-foreground/5 text-muted opacity-30 cursor-not-allowed'
                    }`}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div
              ref={blogScrollRef}
              onScroll={checkBlogScroll}
              className="flex w-full items-stretch gap-3.5 sm:gap-5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory touch-pan-x py-2 px-3.5 -mx-3.5 sm:mx-0 sm:px-1 scroll-pl-3.5"
            >
              {posts.map((post) => {
                const postHref = post.postType === 'NEWS' ? `/news/${post.slug}` : `/blogs/${post.slug}`;
                const formattedDate = post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Recent';

                return (
                  <Link
                    key={post.id}
                    href={postHref}
                    className="group bg-white dark:bg-card/90 relative flex shrink-0 w-[250px] sm:w-[290px] md:w-[320px] snap-start cursor-pointer flex-col overflow-hidden rounded-[1.75rem] border border-[var(--border-subtle)] p-3 sm:p-3.5 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[var(--color-brand-green)]/40 hover:shadow-lg"
                  >
                    <div className="group/img relative mb-3 h-40 sm:h-44 w-full overflow-hidden rounded-xl bg-foreground/5">
                      <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider backdrop-blur-md ${
                            post.postType === 'NEWS'
                              ? 'bg-[var(--color-brand-orange)]/90'
                              : 'bg-[var(--color-brand-green)]/90'
                          }`}
                        >
                          {post.postType}
                        </span>
                      </div>

                      {post.readTimeMinutes && (
                        <div className="bg-background/85 text-foreground absolute top-2.5 right-2.5 z-10 rounded-full border border-[var(--border-subtle)] px-2 py-0.5 text-[9px] font-bold shadow-xs backdrop-blur-md">
                          {post.readTimeMinutes} min read
                        </div>
                      )}

                      {post.featuredImage ? (
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--color-brand-green)]/10 to-transparent">
                          <BookOpen className="h-10 w-10 text-[var(--color-brand-green)]/40" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col justify-between gap-2 px-1">
                      <div>
                        <p className="text-muted text-[10px] font-semibold tracking-wider">
                          {formattedDate}
                        </p>
                        <h3 className="text-foreground mt-1 text-sm sm:text-base font-bold tracking-tight line-clamp-2 group-hover:text-[var(--color-brand-green)] transition-colors">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-muted mt-1 text-xs line-clamp-2 leading-relaxed">
                            {post.excerpt}
                          </p>
                        )}
                      </div>

                      <div className="mt-2.5 flex items-center justify-between border-t border-[var(--border-subtle)] pt-2.5 text-xs font-bold text-[var(--color-brand-green)]">
                        <span>Read Article</span>
                        <div className="group-hover:translate-x-1 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-brand-green)]/10 transition-transform">
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* 4. TRENDING COMPARISONS (HOT VS BATTLES) - Full Width Section */}
        <section className="bg-background/40 flex w-full flex-col gap-6 rounded-[2.5rem] border border-[var(--border-subtle)] p-6 backdrop-blur-sm sm:p-8 md:p-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-foreground/5 flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--border-subtle)]">
                <Handshake size={24} className="text-[var(--color-brand-orange)]" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-foreground text-2xl font-bold tracking-tight">
                  Popular Comparisons
                </h2>
                <p className="text-muted mt-1 text-sm font-medium">
                  Data-driven insights from farmer choices.
                </p>
              </div>
            </div>
            <Link
              href="/compare"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-bold tracking-wider text-[var(--color-brand-green)] uppercase transition-colors hover:text-[var(--color-brand-orange)]"
            >
              Compare All <ChevronRight size={14} className="sm:size-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-foreground/5 h-40 animate-pulse rounded-2xl" />
              ))
              : comparisons.map((comp, idx) => {
                const hotness = (comp.frequency / maxFreq) * 100;
                return (
                  <Link
                    key={idx}
                    href={`/compare?ids=${comp.tractorLeft?.id},${comp.tractorRight?.id}`}
                    className="bg-background group flex cursor-pointer flex-col gap-4 rounded-2xl border border-[var(--border-subtle)] p-5 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-[var(--border-brand-alt)] hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex w-5/12 flex-col items-center text-center">
                        <div className="bg-foreground/5 mb-2 flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl p-2 transition-colors">
                          {comp.tractorLeft?.primaryMedia?.url ? (
                            <img
                              src={comp.tractorLeft.primaryMedia.url}
                              alt="L"
                              className="h-full w-full object-contain transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <Tractor size={20} className="text-muted" />
                          )}
                        </div>
                        <span className="text-muted w-full truncate text-[9px] font-semibold tracking-wider uppercase">
                          {comp.tractorLeft?.brand?.name}
                        </span>
                        <span className="text-foreground mt-0.5 w-full truncate text-xs leading-tight font-bold">
                          {comp.tractorLeft?.modelName}
                        </span>
                      </div>

                      <div className="relative flex w-2/12 flex-col items-center justify-center">
                        <div className="bg-background text-muted z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-subtle)] text-[10px] font-bold">
                          VS
                        </div>
                        <div className="bg-foreground/5 absolute z-0 h-[1px] w-full" />
                      </div>

                      <div className="flex w-5/12 flex-col items-center text-center">
                        <div className="bg-foreground/5 mb-2 flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl p-2 transition-colors">
                          {comp.tractorRight?.primaryMedia?.url ? (
                            <img
                              src={comp.tractorRight.primaryMedia.url}
                              alt="R"
                              className="h-full w-full object-contain transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <Tractor size={20} className="text-muted" />
                          )}
                        </div>
                        <span className="text-muted w-full truncate text-[9px] font-semibold tracking-wider uppercase">
                          {comp.tractorRight?.brand?.name}
                        </span>
                        <span className="text-foreground mt-0.5 w-full truncate text-xs leading-tight font-bold">
                          {comp.tractorRight?.modelName}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-col gap-1.5">
                      <div className="text-muted flex justify-between text-[10px] font-medium">
                        <span>Match Rate</span>
                        <span className="text-foreground font-bold">
                          {Math.max(20, Math.round(hotness))}%
                        </span>
                      </div>
                      <div className="bg-foreground/5 h-1 w-full overflow-hidden rounded-full">
                        <div
                          className="h-full rounded-full bg-[var(--color-brand-green)]/80 transition-all duration-1000"
                          style={{ width: `${Math.max(20, hotness)}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
          </div>
        </section>
      </div>

      {/* Dynamic Sections (FAQ Section at the bottom above footer) */}
      {children}
    </div>
  );
}

/* =========================================
   CAROUSEL COMPONENTS (Horizontal Scrolling)
   ========================================= */

interface TractorCarouselSectionProps {
  badgeLabel: string;
  badgeColor?: 'orange' | 'green';
  title: string;
  viewAllHref: string;
  viewAllText?: string;
  tractors: TractorModel[];
  loading: boolean;
  cardBadge?: string;
}

function TractorCarouselSection({
  badgeLabel,
  badgeColor = 'orange',
  title,
  viewAllHref,
  viewAllText = 'View All',
  tractors,
  loading,
  cardBadge,
}: TractorCarouselSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = Math.max(300, el.clientWidth * 0.75);
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [tractors, checkScroll]);

  if (!loading && tractors.length === 0) return null;

  const formatTractorPrice = (price: number | null | undefined) => {
    if (!price) return 'Price on Request';
    if (price >= 100000) return `₹ ${(price / 100000).toFixed(2)} Lakh`;
    return `₹ ${price.toLocaleString()}`;
  };

  return (
    <section className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3 px-1 sm:px-2">
        <div>
          <div className="mb-1.5 sm:mb-2 flex items-center gap-2.5 sm:gap-3">
            <div
              className={`h-1.5 sm:h-2 w-6 sm:w-8 rounded-full ${
                badgeColor === 'green'
                  ? 'bg-[var(--color-brand-green)]'
                  : 'bg-[var(--color-brand-orange)]'
              }`}
            />
            <p
              className={`text-[11px] sm:text-xs font-black tracking-widest uppercase ${
                badgeColor === 'green'
                  ? 'text-[var(--color-brand-green)]'
                  : 'text-[var(--color-brand-orange)]'
              }`}
            >
              {badgeLabel}
            </p>
          </div>
          <h2 className="text-foreground text-2xl sm:text-3xl font-black tracking-tight md:text-4xl">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href={viewAllHref}
            className="flex shrink-0 items-center gap-1 text-xs sm:text-sm font-bold text-[var(--color-brand-green)] whitespace-nowrap transition-colors hover:text-[var(--color-brand-orange)]"
          >
            {viewAllText} <span>→</span>
          </Link>

          {/* Desktop / Tablet Scroll Navigation Arrows */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              aria-label={`Previous ${title}`}
              className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 ${
                canScrollLeft
                  ? 'border-black/10 dark:border-white/10 bg-white dark:bg-card text-foreground hover:bg-[var(--color-brand-green)] hover:text-white hover:border-[var(--color-brand-green)] shadow-xs hover:shadow-md active:scale-95'
                  : 'border-black/5 dark:border-white/5 bg-foreground/5 text-muted opacity-30 cursor-not-allowed'
              }`}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              aria-label={`Next ${title}`}
              className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 ${
                canScrollRight
                  ? 'border-black/10 dark:border-white/10 bg-white dark:bg-card text-foreground hover:bg-[var(--color-brand-green)] hover:text-white hover:border-[var(--color-brand-green)] shadow-xs hover:shadow-md active:scale-95'
                  : 'border-black/5 dark:border-white/5 bg-foreground/5 text-muted opacity-30 cursor-not-allowed'
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex w-full items-stretch gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory touch-pan-x py-2 px-3.5 -mx-3.5 sm:mx-0 sm:px-1 scroll-pl-3.5"
      >
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-foreground/5 h-[320px] w-[230px] sm:w-[250px] md:w-[270px] shrink-0 snap-start animate-pulse rounded-[1.5rem]"
              />
            ))
          : tractors.map((tractor) => {
              const primaryImage =
                tractor.media && tractor.media.length > 0
                  ? tractor.media.find((m: any) => m.isPrimary)?.url || tractor.media[0].url
                  : null;

              const badge =
                cardBadge ||
                (tractor.launchStatus === 'UPCOMING'
                  ? 'Upcoming'
                  : tractor.launchStatus === 'POPULAR'
                  ? 'Popular'
                  : 'Premium');

              return (
                <Link
                  key={tractor.id}
                  href={`/tractors/${tractor.id}`}
                  className="group bg-white dark:bg-card/90 relative flex shrink-0 w-[230px] sm:w-[250px] md:w-[270px] snap-start cursor-pointer flex-col overflow-hidden rounded-[1.5rem] border border-[var(--border-subtle)] p-3 sm:p-3.5 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[var(--color-brand-green)]/40 hover:shadow-lg"
                >
                  <div className="group/img relative mb-3 h-36 sm:h-40 w-full overflow-hidden rounded-xl bg-foreground/5">
                    <div className="bg-background/85 text-foreground absolute top-2.5 right-2.5 z-10 rounded-full border border-[var(--border-subtle)] px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase shadow-xs backdrop-blur-md">
                      {badge}
                    </div>

                    {primaryImage ? (
                      <img
                        src={primaryImage}
                        alt={tractor.modelName}
                        className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover/img:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Tractor
                          className="text-foreground/20 h-14 w-14 transition-all duration-500 group-hover/img:scale-105"
                          strokeWidth={1}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 px-1">
                    <div>
                      <p className="text-muted text-[10px] font-semibold tracking-wider uppercase line-clamp-1">
                        {tractor.brand?.name || 'Tractor'}
                      </p>
                      <h3 className="text-foreground mt-0.5 truncate text-base sm:text-lg font-bold tracking-tight">
                        {tractor.modelName}
                      </h3>
                    </div>

                    <div className="mt-0.5 flex flex-wrap gap-1.5 text-[10px] sm:text-[11px] font-medium">
                      <span className="bg-foreground/5 text-foreground/80 rounded-md px-2 py-0.5">
                        {tractor.hp || '--'} HP
                      </span>
                      <span className="bg-foreground/5 text-foreground/80 rounded-md px-2 py-0.5">
                        {tractor.driveType === 'FOUR_WD' ? '4WD' : '2WD'}
                      </span>
                      <span className="flex items-center gap-1 rounded-md border border-[var(--color-brand-orange)]/15 bg-[var(--color-brand-orange)]/5 px-2 py-0.5 text-[var(--color-brand-orange)]">
                        <Star size={10} fill="currentColor" /> 4.8
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-end justify-between border-t border-[var(--border-subtle)] pt-2.5">
                      <div>
                        <p className="text-muted mb-0.5 text-[9px] font-medium tracking-wider uppercase">
                          Starting Price
                        </p>
                        <p className="text-foreground text-base sm:text-lg font-black tracking-tight">
                          {formatTractorPrice(tractor.exShowroomPriceMin)}
                        </p>
                      </div>
                      <div className="group-hover:bg-[var(--color-brand-green)] group-hover:text-white group-hover:border-[var(--color-brand-green)] flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-subtle)] text-foreground/70 transition-all duration-300">
                        <ChevronRight size={15} strokeWidth={2.5} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
      </div>
    </section>
  );
}

interface FarmEquipmentCarouselProps {
  implementsList: Implement[];
  loading: boolean;
}

function FarmEquipmentCarousel({ implementsList, loading }: FarmEquipmentCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = Math.max(300, el.clientWidth * 0.75);
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [implementsList, checkScroll]);

  if (!loading && implementsList.length === 0) return null;

  const formatImplementPrice = (min?: number | null, max?: number | null) => {
    if (!min && !max) return 'Price on Request';
    const val = min || max || 0;
    if (val >= 100000) return `₹ ${(val / 100000).toFixed(2)} Lakh`;
    return `₹ ${val.toLocaleString('en-IN')}`;
  };

  return (
    <section className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3 px-1 sm:px-2">
        <div>
          <div className="mb-1.5 sm:mb-2 flex items-center gap-2.5 sm:gap-3">
            <div className="h-1.5 sm:h-2 w-6 sm:w-8 rounded-full bg-[var(--color-brand-green)]" />
            <p className="text-[11px] sm:text-xs font-black tracking-widest text-[var(--color-brand-green)] uppercase">
              High Performance Tools
            </p>
          </div>
          <h2 className="text-foreground text-2xl sm:text-3xl font-black tracking-tight md:text-4xl">
            Farm Equipment
          </h2>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/implements"
            className="flex shrink-0 items-center gap-1 text-xs sm:text-sm font-bold text-[var(--color-brand-green)] whitespace-nowrap transition-colors hover:text-[var(--color-brand-orange)]"
          >
            View All Equipment <span>→</span>
          </Link>

          {/* Desktop / Tablet Scroll Navigation Arrows */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              aria-label="Previous Farm Equipment"
              className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 ${
                canScrollLeft
                  ? 'border-black/10 dark:border-white/10 bg-white dark:bg-card text-foreground hover:bg-[var(--color-brand-green)] hover:text-white hover:border-[var(--color-brand-green)] shadow-xs hover:shadow-md active:scale-95'
                  : 'border-black/5 dark:border-white/5 bg-foreground/5 text-muted opacity-30 cursor-not-allowed'
              }`}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              aria-label="Next Farm Equipment"
              className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 ${
                canScrollRight
                  ? 'border-black/10 dark:border-white/10 bg-white dark:bg-card text-foreground hover:bg-[var(--color-brand-green)] hover:text-white hover:border-[var(--color-brand-green)] shadow-xs hover:shadow-md active:scale-95'
                  : 'border-black/5 dark:border-white/5 bg-foreground/5 text-muted opacity-30 cursor-not-allowed'
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex w-full items-stretch gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory touch-pan-x py-2 px-3.5 -mx-3.5 sm:mx-0 sm:px-1 scroll-pl-3.5"
      >
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-foreground/5 h-[320px] w-[230px] sm:w-[250px] md:w-[270px] shrink-0 snap-start animate-pulse rounded-[1.5rem]"
              />
            ))
          : implementsList.map((item) => {
              const primaryImage = item.videoThumbnailUrl || item.brand?.logoUrl || null;
              return (
                <Link
                  key={item.id}
                  href={`/implements/${item.slug || item.id}`}
                  className="group bg-white dark:bg-card/90 relative flex shrink-0 w-[230px] sm:w-[250px] md:w-[270px] snap-start cursor-pointer flex-col overflow-hidden rounded-[1.5rem] border border-[var(--border-subtle)] p-3 sm:p-3.5 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[var(--color-brand-green)]/40 hover:shadow-lg"
                >
                  <div className="group/img relative mb-3 h-36 sm:h-40 w-full overflow-hidden rounded-xl bg-foreground/5">
                    <div className="bg-background/85 text-foreground absolute top-2.5 right-2.5 z-10 rounded-full border border-[var(--border-subtle)] px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase shadow-xs backdrop-blur-md">
                      {item.category?.name || 'EQUIPMENT'}
                    </div>

                    {primaryImage ? (
                      <img
                        src={primaryImage}
                        alt={item.modelName}
                        className="h-full w-full object-contain p-2.5 transition-transform duration-500 group-hover/img:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Wrench
                          className="text-foreground/20 h-14 w-14 transition-all duration-500 group-hover/img:scale-105"
                          strokeWidth={1}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 px-1">
                    <div>
                      <p className="text-muted text-[10px] font-semibold tracking-wider uppercase line-clamp-1">
                        {item.brand?.name || 'Farm Tool'}
                      </p>
                      <h3 className="text-foreground mt-0.5 truncate text-base sm:text-lg font-bold tracking-tight">
                        {item.modelName}
                      </h3>
                    </div>

                    <div className="mt-0.5 flex flex-wrap gap-1.5 text-[10px] sm:text-[11px] font-medium">
                      {(item.compatibleHpMin || item.compatibleHpMax) && (
                        <span className="bg-foreground/5 text-foreground/80 rounded-md px-2 py-0.5">
                          {item.compatibleHpMin && item.compatibleHpMax
                            ? `${item.compatibleHpMin}-${item.compatibleHpMax} HP`
                            : `${item.compatibleHpMin || item.compatibleHpMax} HP`}
                        </span>
                      )}
                      {item.usageType && (
                        <span className="bg-foreground/5 text-foreground/80 rounded-md px-2 py-0.5">
                          {item.usageType}
                        </span>
                      )}
                      <span className="flex items-center gap-1 rounded-md border border-[var(--color-brand-orange)]/15 bg-[var(--color-brand-orange)]/5 px-2 py-0.5 text-[var(--color-brand-orange)]">
                        <Star size={10} fill="currentColor" /> 4.8
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-end justify-between border-t border-[var(--border-subtle)] pt-2.5">
                      <div>
                        <p className="text-muted mb-0.5 text-[9px] font-medium tracking-wider uppercase">
                          Starting Price
                        </p>
                        <p className="text-foreground text-base sm:text-lg font-black tracking-tight">
                          {formatImplementPrice(item.priceMin, item.priceMax)}
                        </p>
                      </div>
                      <div className="group-hover:bg-[var(--color-brand-green)] group-hover:text-white group-hover:border-[var(--color-brand-green)] flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-subtle)] text-foreground/70 transition-all duration-300">
                        <ChevronRight size={15} strokeWidth={2.5} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
      </div>
    </section>
  );
}
