'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Layers,
  Search,
  Check,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
  Award,
  MapPin,
} from 'lucide-react';
import { Dealer } from '@/types/models/dealer';
import { dealerBrandAPI, AssignedDealerBrand } from '@/lib/api/dealerBrands';
import { brandAPI, Brand } from '@/lib/api/brands';

interface DealerBrandManagementModalProps {
  dealer: Dealer;
  onClose: () => void;
  onSuccess: () => void;
}

export function DealerBrandManagementModal({
  dealer,
  onClose,
  onSuccess,
}: DealerBrandManagementModalProps) {
  const [assignedBrands, setAssignedBrands] = useState<AssignedDealerBrand[]>([]);
  const [allMasterBrands, setAllMasterBrands] = useState<Brand[]>([]);
  const [selectedBrandIds, setSelectedBrandIds] = useState<number[]>([]);
  const [primaryBrandId, setPrimaryBrandId] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [assignedRes, masterRes] = await Promise.allSettled([
        dealerBrandAPI.getDealerBrands(dealer.id),
        brandAPI.getAllBrands({ limit: 100 }),
      ]);

      let assigned: AssignedDealerBrand[] = [];
      if (assignedRes.status === 'fulfilled' && assignedRes.value.success) {
        assigned = assignedRes.value.data.brands || [];
        setAssignedBrands(assigned);
      } else {
        setError('Failed to load assigned dealer brands');
      }

      if (masterRes.status === 'fulfilled' && masterRes.value.success) {
        setAllMasterBrands(masterRes.value.data.data || []);
      }

      // Initialize selectedBrandIds and primaryBrandId from current assigned brands
      const currentIds = assigned.map((b) => b.id);
      setSelectedBrandIds(currentIds);
      const primary = assigned.find((b) => b.isPrimary);
      setPrimaryBrandId(primary ? primary.id : currentIds[0] || null);
    } catch (err: any) {
      console.error('Error loading brand management data:', err);
      setError(err?.response?.data?.message || 'Error loading brand data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dealer.id]);

  // Filter master brands by search term
  const filteredMasterBrands = useMemo(() => {
    if (!searchQuery.trim()) return allMasterBrands;
    const q = searchQuery.toLowerCase().trim();
    return allMasterBrands.filter(
      (b) => b.name.toLowerCase().includes(q) || b.slug.toLowerCase().includes(q)
    );
  }, [allMasterBrands, searchQuery]);

  const toggleBrandSelection = (brandId: number) => {
    setSelectedBrandIds((prev) => {
      if (prev.includes(brandId)) {
        const next = prev.filter((id) => id !== brandId);
        if (primaryBrandId === brandId) {
          setPrimaryBrandId(next[0] || null);
        }
        return next;
      } else {
        const next = [...prev, brandId];
        if (!primaryBrandId) setPrimaryBrandId(brandId);
        return next;
      }
    });
  };

  const removeBrandTag = (brandId: number) => {
    setSelectedBrandIds((prev) => {
      const next = prev.filter((id) => id !== brandId);
      if (primaryBrandId === brandId) {
        setPrimaryBrandId(next[0] || null);
      }
      return next;
    });
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    try {
      setSubmitting(true);

      const payload = {
        brandIds: selectedBrandIds,
        primaryBrandId: primaryBrandId || selectedBrandIds[0] || undefined,
      };

      const res = await dealerBrandAPI.replaceDealerBrands(dealer.id, payload);

      if (res.success) {
        setSuccessMsg('Brand assignments updated successfully!');
        setTimeout(() => {
          onSuccess();
        }, 600);
      } else {
        setError(res.message || 'Failed to update brand assignments');
      }
    } catch (err: any) {
      console.error('Error saving dealer brand assignment:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to save brand assignment');
    } finally {
      setSubmitting(false);
    }
  };

  // Map selected IDs to Brand objects for rendering tags
  const selectedBrandsList = useMemo(() => {
    return selectedBrandIds
      .map(
        (id) => allMasterBrands.find((b) => b.id === id) || assignedBrands.find((b) => b.id === id)
      )
      .filter(Boolean) as Array<{ id: number; name: string }>;
  }, [selectedBrandIds, allMasterBrands, assignedBrands]);

  return (
    <div className="animate-fade-in fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md sm:p-6">
      <div className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--background)] shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--border-subtle)] bg-foreground/5 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-lime-400/20 bg-lime-400/10 p-2.5 text-lime-400">
              <Layers size={20} />
            </div>
            <div>
              <h2 className="text-foreground text-xl font-black tracking-tight">
                Assign Brands to Dealer
              </h2>
              <p className="text-muted mt-0.5 flex items-center gap-1.5 text-xs font-bold">
                <span className="text-foreground">{dealer.businessName}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin size={11} className="text-lime-400" />
                  {dealer.district}, {dealer.state}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-muted hover:text-foreground rounded-xl p-2 transition-colors hover:bg-foreground/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSaveChanges} className="flex-1 space-y-6 overflow-y-auto p-6">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-bold text-rose-400">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-400">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Currently Assigned Brands Pill Tags */}
          <div className="space-y-2">
            <label className="block text-xs font-black tracking-wider text-lime-400 uppercase">
              Assigned Brands ({selectedBrandsList.length})
            </label>

            {loading ? (
              <div className="text-muted animate-pulse rounded-2xl bg-foreground/5 p-4 text-xs font-bold">
                Loading dealer brand assignments...
              </div>
            ) : selectedBrandsList.length === 0 ? (
              <div className="text-muted rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-4 text-center text-xs font-bold">
                No brands assigned yet.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-3">
                {selectedBrandsList.map((b) => {
                  const isPrimary = primaryBrandId === b.id;
                  return (
                    <span
                      key={b.id}
                      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                        isPrimary
                          ? 'border-amber-400/30 bg-amber-400/20 text-amber-300'
                          : 'text-foreground border-[var(--border-subtle)] bg-foreground/10'
                      }`}
                    >
                      {isPrimary && <Award size={12} className="text-amber-400" />}
                      <span>{b.name}</span>
                      <button
                        type="button"
                        onClick={() => removeBrandTag(b.id)}
                        className="rounded p-0.5 transition-colors hover:text-rose-400"
                        title={`Remove ${b.name}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Search Input Bar */}
          <div className="space-y-3">
            <label className="text-muted block text-xs font-black tracking-wider uppercase">
              Select Brands from Master Catalog
            </label>

            <div className="relative">
              <Search
                size={16}
                className="text-muted pointer-events-none absolute top-3 left-3.5"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search brands..."
                className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 py-2.5 pr-4 pl-10 text-xs font-bold focus:border-lime-400/50 focus:outline-none"
              />
            </div>

            {/* Multi-Select Checkbox List */}
            <div className="scrollbar-thin scrollbar-thumb-white/10 max-h-60 space-y-1 divide-y divide-white/5 overflow-y-auto rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-2">
              {loading ? (
                <div className="text-muted animate-pulse p-6 text-center text-xs font-bold">
                  Loading catalog brands...
                </div>
              ) : filteredMasterBrands.length === 0 ? (
                <div className="text-muted p-6 text-center text-xs font-medium">
                  No matching brands found for &quot;{searchQuery}&quot;.
                </div>
              ) : (
                filteredMasterBrands.map((brand) => {
                  const isChecked = selectedBrandIds.includes(brand.id);
                  const isPrimary = primaryBrandId === brand.id;

                  return (
                    <div
                      key={brand.id}
                      onClick={() => toggleBrandSelection(brand.id)}
                      className={`flex cursor-pointer items-center justify-between rounded-xl p-3 transition-all select-none ${
                        isChecked
                          ? 'text-foreground border border-lime-400/20 bg-lime-400/10 font-bold'
                          : 'text-muted hover:text-foreground hover:bg-foreground/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all ${
                            isChecked
                              ? 'border-lime-400 bg-lime-400 text-black'
                              : 'border-white/20 bg-foreground/5'
                          }`}
                        >
                          {isChecked && <Check size={14} className="stroke-[3]" />}
                        </div>

                        {brand.logoUrl ? (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md border border-black/5 bg-white p-0.5 shadow-2xs">
                            <img
                              src={brand.logoUrl}
                              alt={brand.name}
                              className="h-full w-full object-contain rounded-xs"
                            />
                          </div>
                        ) : (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[var(--color-brand-green)]/15 to-[var(--color-brand-green)]/5 text-xs font-black text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20">
                            {brand.name.charAt(0)}
                          </div>
                        )}

                        <div>
                          <span className="text-foreground block text-sm font-bold">
                            {brand.name}
                          </span>
                          <span className="text-muted text-[10px] font-normal">
                            {brand.country ? `${brand.country} • ` : ''}
                            {brand.totalModels ? `${brand.totalModels} models` : 'Catalog Brand'}
                          </span>
                        </div>
                      </div>

                      {isChecked && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPrimaryBrandId(brand.id);
                          }}
                          className={`rounded px-2.5 py-1 text-[10px] font-black tracking-wider uppercase transition-all ${
                            isPrimary
                              ? 'border border-amber-400/30 bg-amber-400/20 text-amber-300'
                              : 'text-muted hover:text-foreground bg-foreground/5 hover:bg-foreground/10'
                          }`}
                        >
                          {isPrimary ? 'Primary Brand' : 'Set as Primary'}
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[var(--border-subtle)] bg-foreground/5 p-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-muted hover:text-foreground rounded-xl px-5 py-2.5 text-xs font-bold transition-colors hover:bg-foreground/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-6 py-2.5 text-xs font-black tracking-wider text-black uppercase shadow-lg shadow-lime-400/10 transition-all hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? (
              <span>Saving Changes...</span>
            ) : (
              <>
                <Save size={16} /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
