'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, Globe, Calendar, Tractor, Star } from 'lucide-react';
import { brandAPI, Brand } from '@/lib/api/brands';

export default function BrandsListingPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Brands on mount
  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      try {
        const res = await brandAPI.getAllBrands({ limit: 200, sortBy: 'sortOrder', sortOrder: 'asc' }); // Fetch all brands
        if (res.success) {
          const payload = res.data as { brands?: Brand[]; data?: Brand[] };
          const list = (payload.brands || payload.data || []) as Brand[];
          setBrands(
            [...list].sort((a, b) => {
              const orderA = a.sortOrder ?? 0;
              const orderB = b.sortOrder ?? 0;
              if (orderA !== orderB) return orderA - orderB;
              return (a.id ?? 0) - (b.id ?? 0);
            })
          );
        }
      } catch (err) {
        console.error('Failed to load brands', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  // Filter brands based on search
  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-3.5 pt-0 sm:pt-1 lg:pt-2 pb-24 sm:px-6 lg:px-8">
      {/* HEADER / HERO SECTION (Matching /tractors design) */}
      <div className="relative mb-5 sm:mb-8 md:mb-10 overflow-hidden rounded-[24px] sm:rounded-[30px] md:rounded-[2.5rem] border border-black/10 dark:border-white/10 bg-gradient-to-br from-emerald-500/10 via-white/80 to-amber-500/10 dark:from-emerald-950/40 dark:via-[#111713]/90 dark:to-amber-950/30 p-4 sm:p-6 md:p-10 lg:p-12 shadow-lg dark:shadow-2xl backdrop-blur-xl">
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 sm:h-96 w-72 sm:w-96 rounded-full bg-[var(--color-brand-green)]/20 dark:bg-[var(--color-brand-green)]/25 blur-[90px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-60 sm:h-80 w-60 sm:w-80 rounded-full bg-[var(--color-brand-orange)]/15 dark:bg-[var(--color-brand-orange)]/20 blur-[80px]" />

        <div className="relative z-10 flex flex-col items-start justify-between gap-4 sm:gap-6 lg:flex-row lg:items-center">
          <div className="flex w-full max-w-3xl flex-col gap-2 sm:gap-3">
            {/* Top Row: Badge + Mobile Metric Pill */}
            <div className="flex w-full items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 px-2.5 py-0.5 sm:px-3.5 sm:py-1 text-[10px] sm:text-xs font-black tracking-wider text-[var(--color-brand-green)] uppercase">
                <Star size={11} className="sm:size-[13px] fill-current" /> Leading Manufacturers
              </span>
              {/* Mobile-only compact metric pill */}
              <span className="inline-flex lg:hidden items-center gap-1 rounded-full bg-[var(--color-brand-green)]/15 border border-[var(--color-brand-green)]/30 px-2.5 py-0.5 text-[10.5px] font-black text-[var(--color-brand-green)] shrink-0">
                <Tractor size={12} /> {brands.length} Brands
              </span>
            </div>

            <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-4xl lg:text-5xl leading-tight">
              Explore{' '}
              <span className="bg-gradient-to-r from-[var(--color-brand-green)] via-emerald-600 to-[var(--color-brand-orange)] bg-clip-text text-transparent">
                Top Brands
              </span>
            </h1>

            <p className="text-muted text-xs sm:text-base font-medium leading-relaxed sm:text-lg line-clamp-2 md:line-clamp-none">
              Discover the most trusted tractor manufacturers in India. Find the perfect machine for
              your farm with official warranty and nationwide dealer support.
            </p>
          </div>

          {/* Desktop Right Metric Box */}
          <div className="z-10 hidden lg:flex shrink-0 items-center gap-4 rounded-3xl border border-black/8 dark:border-white/10 bg-white/80 dark:bg-[#151c17]/90 p-5 shadow-lg backdrop-blur-md">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-brand-green)]/15 text-[var(--color-brand-green)]">
              <Tractor size={32} strokeWidth={1.8} />
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black tracking-tight text-foreground">
                {brands.length}
              </span>
              <span className="text-muted text-[10px] font-black tracking-widest uppercase">
                Brands Found
              </span>
              <span className="mt-0.5 text-[11px] font-bold text-[var(--color-brand-green)]">
                ✓ Verified OEM Partners
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="mb-8 flex w-full justify-end">
        <div className="relative w-full md:w-96">
          <Search size={20} className="text-muted absolute top-1/2 left-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search brands by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-background w-full rounded-[1.5rem] border border-[var(--border-subtle)] py-4 pr-4 pl-12 text-base font-bold shadow-sm transition-all focus:border-[var(--color-brand-green)]/50 focus:shadow-[0_4px_20px_rgba(74,118,53,0.1)] focus:outline-none"
          />
        </div>
      </div>

      {/* BRANDS GRID */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-foreground/5 h-64 animate-pulse rounded-[2rem]" />
          ))}
        </div>
      ) : filteredBrands.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 sm:py-16 text-center">
          <div className="bg-foreground/5 mb-3 sm:mb-4 flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-full">
            <Search className="text-muted h-6 w-6 sm:h-9 sm:w-9" />
          </div>
          <h3 className="text-foreground mb-1.5 text-lg sm:text-2xl font-black">No brands found</h3>
          <p className="text-muted max-w-sm text-xs sm:text-sm font-medium leading-relaxed">
            We couldn't find any brands matching "{searchQuery}". Try a different search term.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredBrands.map((brand) => (
            <Link
              key={brand.id}
              href={`/tractors?brand=${brand.id}`}
              className="group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-black/8 dark:border-white/10 bg-white dark:bg-[#151c18] shadow-sm transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-[var(--color-brand-green)]/40 hover:shadow-xl"
            >
              {/* Logo Stage */}
              <div className="relative flex h-48 sm:h-52 w-full items-center justify-center bg-white dark:bg-white/95 p-3 sm:p-4 border-b border-black/5 dark:border-white/5 overflow-hidden">
                {brand.isFeatured && (
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-yellow-500 px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-white uppercase shadow-sm">
                    <Star size={10} className="fill-current" /> Featured
                  </div>
                )}
                {brand.logoUrl ? (
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="h-full w-full object-contain p-2 sm:p-3 transition-transform duration-500 group-hover:scale-108"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-brand-green)]/15 to-[var(--color-brand-green)]/5 text-4xl font-black text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20 shadow-xs group-hover:scale-110 transition-transform duration-300">
                    {brand.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Brand Info */}
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <h3 className="text-foreground mb-3 line-clamp-1 text-xl font-black transition-colors group-hover:text-[var(--color-brand-green)]">
                  {brand.name}
                </h3>

                <div className="mb-4 flex flex-wrap items-center gap-2">
                  {brand.country && (
                    <span className="text-muted bg-foreground/5 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold">
                      <Globe size={12} /> {brand.country}
                    </span>
                  )}
                  {brand.foundedYear && (
                    <span className="text-muted bg-foreground/5 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold">
                      <Calendar size={12} /> Est. {brand.foundedYear}
                    </span>
                  )}
                </div>

                {brand.aboutBrand ? (
                  <div
                    className="text-muted mb-4 line-clamp-2 flex-1 text-sm font-medium"
                    dangerouslySetInnerHTML={{ __html: brand.aboutBrand }}
                  />
                ) : (
                  <div className="flex-1" />
                )}

                <div className="mt-auto flex items-center justify-between border-t border-[var(--border-subtle)] pt-4">
                  <span className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-[var(--color-brand-green)] uppercase">
                    <Tractor size={14} /> {brand.totalModels || 0} Models
                  </span>
                  <div className="bg-foreground/5 flex h-8 w-8 items-center justify-center rounded-full transition-colors group-hover:bg-[var(--color-brand-green)] group-hover:text-white">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
