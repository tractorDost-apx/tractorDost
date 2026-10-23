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
        const res = await brandAPI.getAllBrands({ limit: 200 }); // Fetch all brands
        if (res.success) {
          const payload = res.data as any;
          setBrands(payload.brands || payload.data || []);
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
    <div className="animate-fade-in mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-4 pt-8 pb-24 sm:px-6 lg:px-8">
      {/* HEADER / HERO SECTION */}
      <div className="relative mb-10 flex flex-col items-center justify-between overflow-hidden rounded-[2.5rem] border border-[var(--border-subtle)] bg-gradient-to-r from-[var(--color-brand-green)]/10 to-[var(--color-brand-orange)]/10 p-8 md:flex-row md:p-12">
        <div className="absolute top-0 right-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-brand-green)]/20 blur-[80px]" />
        <div className="z-10 flex flex-col gap-3">
          <h1 className="text-foreground text-4xl font-black tracking-tight md:text-5xl">
            Explore Top Brands
          </h1>
          <p className="text-muted max-w-2xl text-lg font-bold">
            Discover the most trusted tractor manufacturers in India. Find the perfect machine for
            your farm from top brands.
          </p>
        </div>

        {/* Total Count Badge */}
        <div className="bg-background/80 z-10 mt-6 flex flex-col items-center rounded-2xl border border-[var(--border-subtle)] px-6 py-4 backdrop-blur-md md:mt-0">
          <span className="text-3xl font-black text-[var(--color-brand-green)]">
            {brands.length}
          </span>
          <span className="text-muted text-[10px] font-black tracking-widest uppercase">
            Brands Found
          </span>
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
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-foreground/5 mb-6 flex h-24 w-24 items-center justify-center rounded-full">
            <Search className="text-muted h-10 w-10" />
          </div>
          <h3 className="text-foreground mb-2 text-2xl font-black">No brands found</h3>
          <p className="text-muted max-w-md font-medium">
            We couldn't find any brands matching "{searchQuery}". Try a different search term.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredBrands.map((brand) => (
            <Link
              key={brand.id}
              href={`/tractors?brand=${brand.id}`}
              className="group bg-white dark:bg-card relative flex cursor-pointer flex-col overflow-hidden rounded-[2rem] border border-[var(--border-subtle)] p-6 shadow-xs transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-[var(--color-brand-green)]/40 hover:shadow-lg dark:border-white/10"
            >
              {/* Logo Area */}
              <div className="relative mb-6 flex h-40 w-full items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-white p-6 shadow-xs transition-all duration-300 group-hover:shadow-md dark:border-white/10 dark:bg-white/95">
                {brand.isFeatured && (
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-yellow-500 px-2 py-1 text-[10px] font-bold tracking-widest text-white uppercase shadow-sm">
                    <Star size={10} className="fill-current" /> Featured
                  </div>
                )}
                {brand.logoUrl ? (
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="relative z-0 h-full w-full object-contain rounded-xl transition-transform duration-500 group-hover:scale-108"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-brand-green)]/15 to-[var(--color-brand-green)]/5 text-4xl font-black text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20 shadow-xs group-hover:scale-110 transition-transform duration-300">
                    {brand.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Brand Info */}
              <div className="flex flex-1 flex-col">
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
