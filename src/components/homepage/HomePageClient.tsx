'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Star,
  Tractor,
  Handshake,
  Landmark,
  CircleDollarSign,
  Wrench,
} from 'lucide-react';
import { tractorAPI, Tractor as TractorModel } from '@/lib/api/tractors';
import { brandAPI, Brand } from '@/lib/api/brands';
import { compareAPI, CompareFrequencyRecord } from '@/lib/api/compare';
import HeroSliderSection from '@/components/homepage/HeroSliderSection';

interface HomePageClientProps {
  children?: React.ReactNode;
}

export default function HomePageClient({ children }: HomePageClientProps) {
  const [tractors, setTractors] = useState<TractorModel[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [comparisons, setComparisons] = useState<CompareFrequencyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const [tractorsRes, brandsRes, compareRes] = await Promise.all([
          tractorAPI.getAllTractors({ limit: 6 }), // Fetch latest for featured
          brandAPI.getAllBrands({ limit: 8 }),
          compareAPI.getFrequencyOfCompare({ limit: 3, sort: 'desc' }),
        ]);

        if (tractorsRes.success) {
          const tPayload = tractorsRes.data as unknown as {
            tractors?: TractorModel[];
            data?: TractorModel[];
          };
          setTractors(tPayload?.tractors || tPayload?.data || []);
        }
        if (brandsRes.success) {
          const bPayload = brandsRes.data as unknown as {
            brands?: Brand[];
            data?: Brand[];
          };
          setBrands(bPayload?.brands || bPayload?.data || []);
        }
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
      <HeroSliderSection />

      {/* =========================================
          DYNAMIC MAIN CONTENT (Synced with Backend)
          ========================================= */}
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-16 px-4 pt-14 pb-4 sm:px-6 lg:px-8">
        {/* 1. TOP BRANDS CAROUSEL */}
        <section className="flex flex-col gap-8">
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-2">
              <h2 className="text-foreground text-3xl font-black tracking-tight md:text-4xl">
                Explore Top Brands
              </h2>
              <p className="text-muted font-bold">
                Discover the most trusted manufacturers in India.
              </p>
            </div>
            <Link
              href="/brands"
              className="hidden items-center gap-2 text-sm font-bold tracking-wider text-[var(--color-brand-green)] uppercase transition-colors hover:text-[var(--color-brand-orange)] md:flex"
            >
              View All Brands <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-foreground/5 aspect-square animate-pulse rounded-2xl"
                />
              ))
              : brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/tractors?brand=${brand.id}`}
                  className="bg-background/40 hover:bg-background group flex aspect-square flex-col items-center justify-center rounded-2xl border border-[var(--border-subtle)] p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--border-brand)] hover:shadow-md"
                >
                  <div className="relative mb-3 flex h-14 w-14 items-center justify-center">
                    {brand.logoUrl ? (
                      <img
                        src={brand.logoUrl}
                        alt={brand.name}
                        className="max-h-full max-w-full object-contain opacity-90 transition-transform duration-300 group-hover:scale-105 group-hover:opacity-100"
                      />
                    ) : (
                      <span className="text-foreground/30 text-2xl font-bold transition-colors group-hover:text-[var(--color-brand-green)]">
                        {brand.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className="text-muted group-hover:text-foreground text-center text-[10px] font-semibold tracking-widest uppercase transition-colors">
                    {brand.name}
                  </span>
                </Link>
              ))}
          </div>
        </section>

        <div className="flex w-full flex-col gap-10 lg:flex-row">
          {/* LEFT COLUMN: Featured Tractors */}
          <div className="flex min-w-0 flex-1 flex-col gap-12">
            <section>
              <div className="mb-8 flex items-end justify-between px-2">
                <div>
                  <div className="mb-2 flex items-center gap-3">
                    <div className="h-2 w-8 rounded-full bg-[var(--color-brand-orange)]" />
                    <p className="text-xs font-black tracking-widest text-[var(--color-brand-orange)] uppercase">
                      Premium Selection
                    </p>
                  </div>
                  <h2 className="text-foreground text-3xl font-black tracking-tight md:text-4xl">
                    Featured Tractors
                  </h2>
                </div>
                <Link
                  href="/tractors"
                  className="flex items-center gap-1 text-sm font-bold text-[var(--color-brand-green)] transition-colors hover:text-[var(--color-brand-orange)]"
                >
                  View All Catalog <span>→</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-foreground/5 h-[400px] animate-pulse rounded-[2.5rem]"
                    />
                  ))
                  : tractors.map((tractor) => {
                    const primaryImage =
                      tractor.media && tractor.media.length > 0
                        ? tractor.media.find((m) => m.isPrimary)?.url || tractor.media[0].url
                        : null;

                    return (
                      <Link
                        key={tractor.id}
                        href={`/tractors/${tractor.id}`}
                        className="group bg-background/50 relative flex cursor-pointer flex-col overflow-hidden rounded-[2rem] border border-[var(--border-subtle)] p-4 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-[var(--border-brand)] hover:shadow-lg"
                      >
                        <div className="bg-background/80 text-foreground absolute top-6 right-6 z-10 rounded-full border border-[var(--border-subtle)] px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase backdrop-blur-md">
                          Premium
                        </div>

                        <div className="bg-foreground/5 group/img relative mb-5 flex h-52 w-full items-center justify-center overflow-hidden rounded-2xl p-4">
                          {primaryImage ? (
                            <img
                              src={primaryImage}
                              alt={tractor.modelName}
                              className="relative z-0 h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover/img:scale-105 dark:mix-blend-normal"
                            />
                          ) : (
                            <Tractor
                              className="text-foreground/20 h-20 w-20 transition-all duration-500 group-hover/img:scale-105"
                              strokeWidth={1}
                            />
                          )}
                        </div>

                        <div className="flex flex-col gap-3 px-2">
                          <div>
                            <p className="text-muted text-[10px] font-semibold tracking-widest uppercase">
                              {tractor.brand?.name}
                            </p>
                            <h3 className="text-foreground mt-1 truncate text-xl font-bold tracking-tight md:text-2xl">
                              {tractor.modelName}
                            </h3>
                          </div>

                          <div className="mt-1 flex flex-wrap gap-2 text-[11px] font-medium">
                            <span className="bg-foreground/5 text-foreground/80 rounded-md px-2.5 py-1">
                              {tractor.hp || '--'} HP
                            </span>
                            <span className="bg-foreground/5 text-foreground/80 rounded-md px-2.5 py-1">
                              {tractor.driveType === 'FOUR_WD' ? '4WD' : '2WD'}
                            </span>
                            <span className="flex items-center gap-1 rounded-md border border-[var(--color-brand-orange)]/10 bg-[var(--color-brand-orange)]/5 px-2.5 py-1 text-[var(--color-brand-orange)]">
                              <Star size={10} fill="currentColor" /> 4.8
                            </span>
                          </div>

                          <div className="mt-4 flex items-end justify-between border-t border-[var(--border-subtle)] pt-4">
                            <div>
                              <p className="text-muted mb-1 text-[10px] font-medium tracking-wider uppercase">
                                Starting Price
                              </p>
                              <p className="text-foreground text-xl font-bold tracking-tight">
                                {formatPrice(tractor.exShowroomPriceMin)}
                              </p>
                            </div>
                            <div className="group-hover:bg-foreground group-hover:text-background group-hover:border-foreground flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-subtle)] transition-all duration-300">
                              <ChevronRight size={18} strokeWidth={2} />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Sidebar Widgets (Finance & Dealers) */}
          <div className="mt-16 flex w-full flex-shrink-0 flex-col gap-10 lg:mt-0 lg:w-[350px] xl:w-[400px]">
            {/* Finance & EMI Widget (Professional) */}
            <div className="group relative flex cursor-pointer flex-col gap-8 overflow-hidden rounded-[2.5rem] border border-[var(--border-subtle)] bg-[var(--color-spatial-bg-dark)] p-8 text-white transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-[var(--border-brand)] hover:shadow-2xl md:p-10">
              {/* Subtle Lighting */}
              <div className="pointer-events-none absolute top-0 right-0 h-[300px] w-[300px] rounded-full bg-[var(--color-brand-green)]/10 blur-[80px]" />

              <div className="z-10 flex items-center justify-between">
                <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/10 p-2.5 backdrop-blur-md">
                  <Landmark strokeWidth={2} className="h-5 w-5 text-white" />
                </div>
                <div className="rounded-full border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/20 px-3 py-1 text-[10px] font-bold text-[var(--color-brand-green)]">
                  Verified Partners
                </div>
              </div>

              <div className="z-10 mt-2">
                <h3 className="text-3xl leading-tight font-bold tracking-tight text-white">
                  Seamless <br />
                  Tractor Loans
                </h3>
                <p className="mt-2 text-sm font-medium text-white/60">
                  Quick approval, minimal documentation.
                </p>
              </div>

              <div className="z-10 flex items-center justify-between rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-5">
                <div>
                  <span className="mb-1 block text-[10px] font-medium tracking-wider text-white/50 uppercase">
                    Starting At
                  </span>
                  <span className="text-2xl font-bold text-white">
                    8.5<span className="text-base text-white/70">%</span>
                  </span>
                </div>
                <div className="h-8 w-[1px] bg-foreground/10"></div>
                <div>
                  <span className="mb-1 block text-[10px] font-medium tracking-wider text-white/50 uppercase">
                    Max Tenure
                  </span>
                  <span className="text-xl font-bold text-white">7 Yrs</span>
                </div>
              </div>

              <button
                className="z-10 mt-2 w-full rounded-xl bg-white py-4 text-sm font-semibold text-black transition-colors hover:bg-gray-100"
                suppressHydrationWarning
              >
                Check Eligibility
              </button>
            </div>

            {/* Top Dealers Sidebar */}
            <div className="bg-background/40 flex flex-col gap-6 rounded-[2.5rem] border border-[var(--border-subtle)] p-8 backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-5">
                <h3 className="text-foreground flex items-center gap-2 text-xl font-bold tracking-tight">
                  Premium Dealers
                </h3>
                <span className="text-muted text-[10px] font-medium tracking-wider uppercase">
                  Near You
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <DealerRow
                  name="Kisan Tractors"
                  type="BRAND_DEALER"
                  brands="Mahindra, Swaraj"
                  rating="4.9"
                />
                <DealerRow
                  name="Shetkari Auto"
                  type="USED_DEALER"
                  brands="Multi-Brand"
                  rating="4.6"
                />
                <DealerRow
                  name="Punjab Motors"
                  type="BRAND_DEALER"
                  brands="John Deere"
                  rating="4.8"
                />
              </div>

              <Link
                href="/dealers"
                className="mt-4 text-center text-sm font-bold text-[var(--color-brand-orange)] hover:underline"
              >
                Find More Dealers →
              </Link>
            </div>
          </div>
        </div>

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
              className="hidden items-center gap-2 text-sm font-bold tracking-wider text-[var(--color-brand-green)] uppercase transition-colors hover:text-[var(--color-brand-orange)] sm:flex"
            >
              Compare All <ChevronRight size={16} />
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
   COMPONENTS
   ========================================= */

function QuickAction({
  icon,
  label,
  href,
  brand = 'green',
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  brand?: 'green' | 'orange';
}) {
  const isGreen = brand === 'green';
  const iconColor = isGreen
    ? 'text-[var(--color-brand-green)]'
    : 'text-[var(--color-brand-orange)]';
  const defaultBorder = isGreen
    ? 'border-[var(--border-brand)]'
    : 'border-[var(--border-brand-alt)]';
  const hoverBorder = isGreen
    ? 'hover:border-[var(--color-brand-green)]/40'
    : 'hover:border-[var(--color-brand-orange)]/40';
  const hoverBg = isGreen
    ? 'hover:bg-[var(--color-brand-green)]/10'
    : 'hover:bg-[var(--color-brand-orange)]/10';
  const iconBg = isGreen ? 'bg-[var(--color-brand-green)]/10' : 'bg-[var(--color-brand-orange)]/10';

  return (
    <Link
      href={href}
      className={`bg-background/60 flex items-center gap-4 border px-6 py-4 backdrop-blur-md ${defaultBorder} group/action rounded-[1.2rem] transition-all duration-300 hover:shadow-sm ${hoverBorder} ${hoverBg}`}
    >
      <div
        className={`h-10 w-10 rounded-lg ${iconBg} border ${defaultBorder} flex items-center justify-center transition-all duration-300 ${iconColor}`}
      >
        {icon}
      </div>
      <span className={`text-foreground text-sm font-semibold tracking-wide transition-colors`}>
        {label}
      </span>
    </Link>
  );
}

interface DealerRowProps {
  name: string;
  type: string;
  brands: string;
  rating: number | string;
}

function DealerRow({ name, type, brands, rating }: DealerRowProps) {
  return (
    <div className="hover:bg-foreground/5 group flex cursor-pointer items-center gap-4 rounded-xl border-b border-[var(--border-subtle)] p-3 py-3 transition-colors last:border-0">
      <div className="bg-foreground/5 text-foreground/70 flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--border-subtle)] text-lg font-bold transition-transform duration-300">
        {name.charAt(0)}
      </div>
      <div className="flex-1">
        <h4 className="text-foreground text-base font-bold">{name}</h4>
        <p className="text-muted mt-0.5 text-[10px] font-medium tracking-wide">{brands}</p>
      </div>
      <div className="flex flex-col items-end text-right">
        <span className="text-foreground flex items-center gap-1 text-xs font-bold">
          <Star size={10} className="text-[var(--color-brand-orange)]" fill="currentColor" />{' '}
          {rating}
        </span>
        <p
          className={`mt-1.5 rounded px-2 py-0.5 text-[9px] font-semibold tracking-wider uppercase ${type === 'BRAND_DEALER' ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]' : 'bg-foreground/10 text-foreground/70'}`}
        >
          {type === 'BRAND_DEALER' ? 'Authorized' : 'Verified'}
        </p>
      </div>
    </div>
  );
}
