'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Tractor as TractorIcon,
  Search,
  Sparkles,
  MapPin,
  ChevronRight,
  ArrowLeft,
  Building2,
  Calendar,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';
import { brandAPI, Brand } from '@/lib/api/brands';
import { tractorAPI, Tractor } from '@/lib/api/tractors';
import { TractorLoader } from '@/components/ui/TractorLoader';
import { formatCurrencyINR } from '@/lib/utils/format-number';
import { unslugify } from '@/lib/utils/slug';

export default function SingleBrandPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const rawSlug = decodeURIComponent(resolvedParams.slug);

  const [brand, setBrand] = useState<Brand | null>(null);
  const [tractors, setTractors] = useState<Tractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadBrandAndTractors() {
      try {
        setLoading(true);
        // 1. Fetch all brands to locate this brand by slug or id
        const brandsRes = await brandAPI.getAllBrands({ limit: 100 });
        let matchedBrand: Brand | undefined;

        if (brandsRes.success && brandsRes.data?.data) {
          const list = brandsRes.data.data;
          matchedBrand = list.find(
            (b) =>
              b.slug?.toLowerCase() === rawSlug.toLowerCase() ||
              b.name?.toLowerCase() === rawSlug.toLowerCase() ||
              String(b.id) === rawSlug
          );
        }

        if (matchedBrand) {
          setBrand(matchedBrand);
          // 2. Fetch tractors for this brand
          const tractorsRes = await tractorAPI.getTractors({
            brandId: matchedBrand.id,
            limit: 40,
          });
          if (tractorsRes.success && tractorsRes.data) {
            setTractors(tractorsRes.data.tractors || tractorsRes.data.data || []);
          }
        } else {
          // Fallback search tractors directly with brand name
          const fallbackRes = await tractorAPI.getTractors({
            search: unslugify(rawSlug),
            limit: 40,
          });
          if (fallbackRes.success && fallbackRes.data) {
            setTractors(fallbackRes.data.tractors || fallbackRes.data.data || []);
          }
        }
      } catch (err) {
        console.error('Error loading brand tractors:', err);
      } finally {
        setLoading(false);
      }
    }

    loadBrandAndTractors();
  }, [rawSlug]);

  const displayName = brand?.name || unslugify(rawSlug);

  const filteredTractors = tractors.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.modelName?.toLowerCase().includes(q) ||
      String(t.hp || '').includes(q) ||
      t.fuelType?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <TractorLoader />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight size={14} />
        <Link href="/brands" className="hover:text-foreground">
          Brands
        </Link>
        <ChevronRight size={14} />
        <span className="text-foreground font-semibold">{displayName}</span>
      </div>

      {/* Brand Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-background p-6 sm:p-10 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {brand?.logoUrl ? (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-white p-3 shadow-md">
                <img src={brand.logoUrl} alt={displayName} className="max-h-full max-w-full object-contain" />
              </div>
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                <TractorIcon size={36} />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                  {displayName} Tractors
                </h1>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                  {tractors.length} Models
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                {brand?.aboutBrand ||
                  `Explore all latest and popular ${displayName} tractor models in India. Compare HP specifications, check ex-showroom & on-road pricing, and locate authorized dealerships.`}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-medium">
                {brand?.country && (
                  <span className="flex items-center gap-1.5">
                    <Globe size={13} className="text-emerald-500" /> Origin: {brand.country}
                  </span>
                )}
                {brand?.foundedYear && (
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-emerald-500" /> Est: {brand.foundedYear}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={`/dealers?search=${encodeURIComponent(displayName)}`}
              className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 px-4 py-2.5 text-xs font-bold text-foreground transition-all hover:bg-muted active:scale-95"
            >
              <Building2 size={14} className="text-emerald-500" />
              <span>Find Dealers</span>
            </Link>
            <Link
              href="/loan"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-emerald-500 active:scale-95 shadow-md shadow-emerald-600/20"
            >
              <span>Get Loan</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-foreground">
          All {displayName} Models ({filteredTractors.length})
        </h2>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${displayName} models...`}
            className="w-full rounded-xl border border-border/60 bg-card/60 pl-10 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Tractor Grid */}
      {filteredTractors.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 p-12 text-center">
          <TractorIcon size={48} className="text-muted-foreground/40 mb-3" />
          <p className="text-sm font-semibold text-foreground">No tractor models found matching your search</p>
          <p className="mt-1 text-xs text-muted-foreground">Try searching another model or clearing your search filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTractors.map((tractor) => (
            <div
              key={tractor.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/60 p-4 backdrop-blur-md transition-all duration-300 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5"
            >
              {/* Image Preview */}
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-background/50 flex items-center justify-center">
                <TractorIcon size={48} className="text-muted-foreground/30 group-hover:scale-105 transition-transform duration-300" />
                <span className="absolute top-2 left-2 rounded-full border border-border/40 bg-background/80 px-2 py-0.5 text-[10px] font-bold text-foreground backdrop-blur-md">
                  {tractor.driveType === 'FOUR_WD' ? '4WD' : '2WD'}
                </span>
                {tractor.hp && (
                  <span className="absolute top-2 right-2 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black text-emerald-400 backdrop-blur-md">
                    {tractor.hp} HP
                  </span>
                )}
              </div>

              {/* Title & Brand */}
              <div className="mt-4 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">
                  {displayName}
                </p>
                <h3 className="text-base font-extrabold text-foreground group-hover:text-emerald-400 transition-colors">
                  {tractor.modelName}
                </h3>

                {/* Specs row */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                  <div className="rounded-lg bg-background/40 p-1.5 border border-border/30">
                    <span className="block text-[10px] uppercase text-muted-foreground">Fuel</span>
                    <span className="font-bold text-foreground">{tractor.fuelType}</span>
                  </div>
                  <div className="rounded-lg bg-background/40 p-1.5 border border-border/30">
                    <span className="block text-[10px] uppercase text-muted-foreground">Drive</span>
                    <span className="font-bold text-foreground">{tractor.driveType === 'FOUR_WD' ? '4x4' : '4x2'}</span>
                  </div>
                </div>

                {/* Price */}
                <div className="mt-4 border-t border-border/40 pt-3 flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Ex-Showroom Price</span>
                    <span className="text-sm font-extrabold text-foreground">
                      {tractor.exShowroomPriceMin
                        ? `₹${(Number(tractor.exShowroomPriceMin) / 100000).toFixed(2)} Lakh*`
                        : 'Price on Request'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-3 border-t border-border/40 flex items-center gap-2">
                <Link
                  href={`/tractors/${tractor.slug || tractor.id}`}
                  className="flex-1 text-center rounded-xl bg-emerald-600/15 border border-emerald-500/30 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all active:scale-95"
                >
                  View Details
                </Link>
                <Link
                  href={`/compare?tractor1=${tractor.id}`}
                  className="rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-xs font-bold text-foreground hover:bg-muted transition-all active:scale-95"
                >
                  Compare
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
