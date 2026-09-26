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
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Sleek Admin Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20 shrink-0">
            <Layers size={26} />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Authorized Brands
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20 uppercase tracking-wider">
                {brands.length} {brands.length === 1 ? 'Brand' : 'Brands'} Assigned
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-muted mt-0.5">
              Official tractor brands associated with {user?.dealer?.businessName || 'your dealership'}.
            </p>
          </div>
        </div>

        {primaryBrand && (
          <div className="px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-3 shrink-0 self-start sm:self-auto">
            <Award size={20} className="text-amber-500 shrink-0" />
            <div>
              <span className="text-[9px] uppercase font-black tracking-wider text-amber-500 block">Primary Authorized Brand</span>
              <span className="text-xs sm:text-sm font-black text-foreground">{primaryBrand.name}</span>
            </div>
          </div>
        )}
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-panel p-6 rounded-3xl border border-[var(--border-subtle)] space-y-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-foreground/10" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-foreground/10 rounded-md w-3/4" />
                  <div className="h-3 bg-foreground/10 rounded-md w-1/2" />
                </div>
              </div>
              <div className="h-16 bg-foreground/5 rounded-2xl" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="glass-panel p-8 rounded-3xl border border-rose-500/20 bg-rose-500/10 text-center space-y-4 max-w-lg mx-auto">
          <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-foreground">Unable to Load Assigned Brands</h3>
          <p className="text-sm text-muted font-medium">{error}</p>
          <button
            onClick={() => fetchBrands()}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-foreground/10 text-foreground hover:bg-foreground/20 transition-colors inline-flex items-center gap-2"
          >
            <RefreshCw size={14} /> Retry Loading
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && brands.length === 0 && (
        <div className="glass-panel p-12 rounded-3xl border border-[var(--border-subtle)] text-center max-w-2xl mx-auto space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20 flex items-center justify-center mx-auto">
            <Building2 size={32} />
          </div>
          <h2 className="text-xl font-black text-foreground">
            No brands have been assigned to this dealer yet.
          </h2>
          <p className="text-sm text-muted font-medium leading-relaxed max-w-md mx-auto">
            Tractor brand partnerships and representations are managed by TractorDost administration. Once your dealership is assigned authorized brand partnerships, they will automatically appear here.
          </p>
          <div className="pt-2">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-foreground/5 text-muted border border-[var(--border-subtle)]">
              <Info size={14} className="text-[var(--color-brand-green)]" /> Contact Support for Brand Onboarding
            </span>
          </div>
        </div>
      )}

      {/* Brands Card Grid */}
      {!loading && !error && brands.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((b) => (
            <div
              key={b.id}
              className="glass-panel p-6 rounded-3xl border border-[var(--border-subtle)] space-y-5 hover:border-[var(--color-brand-green)]/30 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
            >
              {b.isPrimary && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-sm">
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
                      className="h-16 w-16 rounded-2xl object-contain bg-foreground/5 p-2 border border-[var(--border-subtle)] shrink-0 group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] flex items-center justify-center font-black text-2xl border border-[var(--color-brand-green)]/20 shrink-0">
                      {b.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="pr-16">
                    <h3 className="text-xl font-black text-foreground tracking-tight group-hover:text-[var(--color-brand-green)] transition-colors">
                      {b.name}
                    </h3>
                    <span className="text-xs font-mono text-muted">/{b.slug}</span>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-[var(--border-subtle)]">
                  {b.country && (
                    <div className="flex items-center gap-2 text-muted">
                      <Globe size={14} className="text-muted/70 shrink-0" />
                      <span className="truncate">{b.country}</span>
                    </div>
                  )}
                  {b.foundedYear && (
                    <div className="flex items-center gap-2 text-muted">
                      <Calendar size={14} className="text-muted/70 shrink-0" />
                      <span>Founded {b.foundedYear}</span>
                    </div>
                  )}
                  {b.totalModels !== undefined && (
                    <div className="flex items-center gap-2 text-muted col-span-2">
                      <Tractor size={14} className="text-muted/70 shrink-0" />
                      <span>{b.totalModels} Tractor Models in Catalog</span>
                    </div>
                  )}
                </div>

                {b.aboutBrand && (
                  <p className="text-xs text-muted/90 font-medium line-clamp-3 pt-1 border-t border-[var(--border-subtle)] leading-relaxed">
                    {b.aboutBrand}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[11px]">
                  <CheckCircle2 size={13} /> Active Partnership
                </span>
                <span className="text-[10px] font-mono text-muted/60">ID #{b.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
