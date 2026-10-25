'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Tractor,
  Sparkles,
  Search,
  ArrowRight,
  Filter,
  CheckCircle2,
  Gauge,
  Zap,
  SlidersHorizontal,
} from 'lucide-react';
import { tractorAPI, Tractor as TractorModel } from '@/lib/api/tractors';
import { TractorLoader } from '@/components/ui/TractorLoader';

interface TractorCategoryClientProps {
  title: string;
  subtitle: string;
  badge: string;
  driveType?: 'FOUR_WD' | 'TWO_WD';
  hpRange?: 'under30' | '30to50' | 'over50';
  fuelType?: 'DIESEL' | 'ELECTRIC' | 'CNG';
  categoryTag?: 'ac-cabin' | 'latest' | 'upcoming' | 'popular' | 'mini';
  seoContent?: string;
}

export function TractorCategoryClient({
  title,
  subtitle,
  badge,
  driveType,
  hpRange,
  fuelType,
  categoryTag,
  seoContent,
}: TractorCategoryClientProps) {
  const [tractors, setTractors] = useState<TractorModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const params: any = { limit: 24, page: 1 };
        if (driveType) params.driveType = driveType;
        if (fuelType) params.fuelType = fuelType;
        if (hpRange === 'under30') params.hpMax = 30;
        if (hpRange === '30to50') {
          params.hpMin = 30;
          params.hpMax = 50;
        }
        if (hpRange === 'over50') params.hpMin = 50;

        const res = await tractorAPI.getAllTractors(params);
        if (res.success && res.data) {
          const payload = res.data as any;
          const list: TractorModel[] = payload.tractors || payload.data || [];

          // Local refinement for special tags if any
          let filtered = list;
          if (categoryTag === 'ac-cabin') {
            filtered = list.filter((t) => (t.hp || 0) >= 50 || t.modelName.toLowerCase().includes('ac'));
          } else if (categoryTag === 'mini') {
            filtered = list.filter((t) => (t.hp || 0) <= 30);
          }
          setTractors(filtered);
        }
      } catch (err) {
        console.error('Failed to load categorized tractors:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [driveType, hpRange, fuelType, categoryTag]);

  const filteredTractors = tractors.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.modelName.toLowerCase().includes(q) ||
      t.brand?.name.toLowerCase().includes(q)
    );
  });

  const formatPrice = (price?: number | null) => {
    if (!price) return 'Price on Request';
    if (price >= 100000) return `₹ ${(price / 100000).toFixed(2)} Lakh`;
    return `₹ ${price.toLocaleString()}`;
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-4 pt-12 pb-24 sm:px-6 lg:px-8">
      {/* Hero Header */}
      <section className="relative flex flex-col items-center justify-center pt-8 pb-12 text-center">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 px-4 py-1.5 text-xs font-black tracking-widest text-[var(--color-brand-green)] uppercase">
            <Sparkles size={14} /> {badge}
          </div>
          <h1 className="text-foreground text-4xl leading-tight font-extrabold tracking-tight md:text-6xl">
            {title}
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            {subtitle}
          </p>
        </div>
        <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-brand-green)]/5 blur-[120px]" />
      </section>

      {/* Search and Filters Bar */}
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm font-bold text-muted-foreground">
          Showing <span className="text-foreground font-black">{filteredTractors.length}</span> models
        </div>

        <div className="relative min-w-[280px]">
          <Search size={16} className="text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search within this category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-card/60 border-border/50 text-foreground w-full rounded-full border py-2.5 pl-9 pr-4 text-xs font-medium focus:border-[var(--color-brand-green)] focus:outline-none"
          />
        </div>
      </div>

      {/* Tractors Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <TractorLoader size={48} />
          <p className="text-muted-foreground mt-4 text-sm font-semibold">Loading tractors...</p>
        </div>
      ) : filteredTractors.length === 0 ? (
        <div className="rounded-3xl border border-border/50 bg-card/40 p-12 text-center">
          <Tractor size={48} className="text-muted-foreground mx-auto mb-3" />
          <h3 className="text-foreground text-lg font-bold">No tractors matching criteria currently</h3>
          <p className="text-muted-foreground text-xs mt-1 mb-6">
            Explore our comprehensive all-tractor catalog to filter by other HP ranges and brands.
          </p>
          <Link
            href="/tractors"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-green)] px-6 py-2.5 text-xs font-bold text-white"
          >
            Browse All Tractors &rarr;
          </Link>
        </div>
      ) : (
        <div className="mb-20 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTractors.map((tractor) => (
            <div
              key={tractor.id}
              className="group flex flex-col overflow-hidden rounded-3xl border border-border/50 bg-card/40 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--color-brand-green)]/50 hover:shadow-xl"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/30">
                <img
                  src={
                    tractor.primaryMedia?.url ||
                    tractor.media?.[0]?.url ||
                    (tractor as any).primaryImage ||
                    'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=600&auto=format&fit=crop'
                  }
                  alt={tractor.modelName}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 rounded-full bg-black/75 px-3 py-1 text-[10px] font-black uppercase text-white backdrop-blur-md">
                  {tractor.brand?.name || 'Tractor'}
                </div>
                {tractor.hp && (
                  <div className="absolute top-3 right-3 rounded-full bg-[var(--color-brand-green)] px-2.5 py-0.5 text-[11px] font-black text-white shadow-md">
                    {tractor.hp} HP
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-foreground line-clamp-1 text-base font-black group-hover:text-[var(--color-brand-green)] transition-colors mb-1">
                  {tractor.modelName}
                </h3>

                <div className="text-sm font-extrabold text-[var(--color-brand-green)] mb-3">
                  {formatPrice(tractor.exShowroomPriceMin)}
                </div>

                {/* Quick specs */}
                <div className="space-y-1.5 border-t border-border/30 pt-3 text-xs text-muted-foreground mb-4">
                  <div className="flex justify-between">
                    <span>Drive:</span>
                    <span className="font-bold text-foreground">
                      {tractor.driveType === 'FOUR_WD' ? '4WD' : '2WD'}
                    </span>
                  </div>
                  {(tractor.spec?.cylinders || (tractor as any).engineCylinders) && (
                    <div className="flex justify-between">
                      <span>Cylinders:</span>
                      <span className="font-bold text-foreground">
                        {tractor.spec?.cylinders || (tractor as any).engineCylinders} Cylinders
                      </span>
                    </div>
                  )}
                  {(tractor.spec?.liftingCapacityKg || (tractor as any).liftingCapacityKg) && (
                    <div className="flex justify-between">
                      <span>Hydraulics:</span>
                      <span className="font-bold text-foreground">
                        {tractor.spec?.liftingCapacityKg || (tractor as any).liftingCapacityKg} kg
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-auto flex items-center gap-2 pt-2">
                  <Link
                    href={`/tractors/${tractor.slug}`}
                    className="flex-1 rounded-xl bg-foreground/5 py-2.5 text-center text-xs font-bold text-foreground transition-all hover:bg-[var(--color-brand-green)] hover:text-white"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/loan/new-tractor`}
                    className="rounded-xl border border-border/60 bg-card px-3 py-2.5 text-xs font-bold text-foreground hover:bg-secondary text-center"
                  >
                    EMI
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SEO / Guide Text */}
      {seoContent && (
        <section className="rounded-3xl border border-border/50 bg-card/40 p-8 md:p-12 text-sm leading-relaxed text-muted-foreground">
          <div dangerouslySetInnerHTML={{ __html: seoContent }} />
        </section>
      )}
    </div>
  );
}
