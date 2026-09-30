'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/store/AuthContext';
import { dealerBrandAPI, AssignedDealerBrand } from '@/lib/api/dealerBrands';
import { dealerAPI } from '@/lib/api/dealers';
import {
  Layers,
  Award,
  Globe,
  Calendar,
  Tractor,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Info,
  Building2,
} from 'lucide-react';

export default function DealerBrandsPage() {
  const { user } = useAuth();
  const [brands, setBrands] = useState<AssignedDealerBrand[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError(null);

      let targetDealerId: number | null = user?.dealer?.id || null;

      // Fallback: If user.dealer is not loaded yet, find dealerId via getAllDealers
      if (!targetDealerId && user?.id) {
        const res = await dealerAPI.getAllDealers({ limit: 100 });
        if (res.success && res.data?.data) {
          const matched = res.data.data.find((d) => d.userId === user.id);
          if (matched) {
            targetDealerId = matched.id;
          }
        }
      }

      if (!targetDealerId) {
        setError('No dealer profile linked to your user account.');
        setLoading(false);
        return;
      }

      const res = await dealerBrandAPI.getDealerBrands(targetDealerId);
      if (res.success && res.data) {
        setBrands(res.data.brands || []);
      } else {
        setError(res.message || 'Failed to fetch dealer brands');
      }
    } catch (err: any) {
      console.error('Error fetching dealer brands:', err);
      setError(err?.response?.data?.message || err?.message || 'Error loading assigned brands');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBrands();
    }
  }, [user?.id, user?.dealer?.id]);

  const primaryBrand = brands.find((b) => b.isPrimary);

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      {/* Sleek Admin Header Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="shrink-0 rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 p-2.5 text-[var(--color-brand-green)]">
            <Layers size={26} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                Authorized Brands
              </h1>
              <span className="rounded-full border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-3 py-1 text-xs font-black tracking-wider text-[var(--color-brand-green)] uppercase">
                {brands.length} {brands.length === 1 ? 'Brand' : 'Brands'} Assigned
              </span>
            </div>
            <p className="text-muted mt-0.5 text-xs font-bold sm:text-sm">
              Official tractor brands associated with{' '}
              {user?.dealer?.businessName || 'your dealership'}.
            </p>
          </div>
        </div>

        {primaryBrand && (
          <div className="flex shrink-0 items-center gap-3 self-start rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-xs font-bold text-amber-600 sm:self-auto dark:text-amber-400">
            <Award size={20} className="shrink-0 text-amber-500" />
            <div>
              <span className="block text-[9px] font-black tracking-wider text-amber-500 uppercase">
                Primary Authorized Brand
              </span>
              <span className="text-foreground text-xs font-black sm:text-sm">
                {primaryBrand.name}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="glass-panel animate-pulse space-y-4 rounded-3xl border border-[var(--border-subtle)] p-6"
            >
              <div className="flex items-center gap-4">
                <div className="bg-foreground/10 h-14 w-14 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <div className="bg-foreground/10 h-5 w-3/4 rounded-md" />
                  <div className="bg-foreground/10 h-3 w-1/2 rounded-md" />
                </div>
              </div>
              <div className="bg-foreground/5 h-16 rounded-2xl" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="glass-panel mx-auto max-w-lg space-y-4 rounded-3xl border border-rose-500/20 bg-rose-500/10 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-500">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-foreground text-lg font-bold">Unable to Load Assigned Brands</h3>
          <p className="text-muted text-sm font-medium">{error}</p>
          <button
            onClick={() => fetchBrands()}
            className="bg-foreground/10 text-foreground hover:bg-foreground/20 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-colors"
          >
            <RefreshCw size={14} /> Retry Loading
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && brands.length === 0 && (
        <div className="glass-panel mx-auto max-w-2xl space-y-4 rounded-3xl border border-[var(--border-subtle)] p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
            <Building2 size={32} />
          </div>
          <h2 className="text-foreground text-xl font-black">
            No brands have been assigned to this dealer yet.
          </h2>
          <p className="text-muted mx-auto max-w-md text-sm leading-relaxed font-medium">
            Tractor brand partnerships and representations are managed by TractorDost
            administration. Once your dealership is assigned authorized brand partnerships, they
            will automatically appear here.
          </p>
          <div className="pt-2">
            <span className="bg-foreground/5 text-muted inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] px-3.5 py-1.5 text-xs font-bold">
              <Info size={14} className="text-[var(--color-brand-green)]" /> Contact Support for
              Brand Onboarding
            </span>
          </div>
        </div>
      )}

      {/* Brands Card Grid */}
      {!loading && !error && brands.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {brands.map((b) => (
            <div
              key={b.id}
              className="glass-panel group relative flex flex-col justify-between space-y-5 overflow-hidden rounded-3xl border border-[var(--border-subtle)] p-6 transition-all duration-300 hover:border-[var(--color-brand-green)]/30"
            >
              {b.isPrimary && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-black tracking-wider text-amber-600 uppercase shadow-sm dark:text-amber-400">
                    <Award size={12} className="text-amber-500" />
                    Primary Brand
                  </span>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {b.logoUrl ? (
                    <img
                      src={b.logoUrl}
                      alt={b.name}
                      className="bg-foreground/5 h-16 w-16 shrink-0 rounded-2xl border border-[var(--border-subtle)] object-contain p-2 transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 text-2xl font-black text-[var(--color-brand-green)]">
                      {b.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="pr-16">
                    <h3 className="text-foreground text-xl font-black tracking-tight transition-colors group-hover:text-[var(--color-brand-green)]">
                      {b.name}
                    </h3>
                    <span className="text-muted font-mono text-xs">/{b.slug}</span>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-3 border-t border-[var(--border-subtle)] pt-2 text-xs">
                  {b.country && (
                    <div className="text-muted flex items-center gap-2">
                      <Globe size={14} className="text-muted/70 shrink-0" />
                      <span className="truncate">{b.country}</span>
                    </div>
                  )}
                  {b.foundedYear && (
                    <div className="text-muted flex items-center gap-2">
                      <Calendar size={14} className="text-muted/70 shrink-0" />
                      <span>Founded {b.foundedYear}</span>
                    </div>
                  )}
                  {b.totalModels !== undefined && (
                    <div className="text-muted col-span-2 flex items-center gap-2">
                      <Tractor size={14} className="text-muted/70 shrink-0" />
                      <span>{b.totalModels} Tractor Models in Catalog</span>
                    </div>
                  )}
                </div>

                {b.aboutBrand && (
                  <p className="text-muted/90 line-clamp-3 border-t border-[var(--border-subtle)] pt-1 text-xs leading-relaxed font-medium">
                    {b.aboutBrand}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-4 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={13} /> Active Partnership
                </span>
                <span className="text-muted/60 font-mono text-[10px]">ID #{b.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
