'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, Layers, Search, Check, Trash2, CheckCircle2, AlertCircle, Save, Award, MapPin } from 'lucide-react';
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
    return allMasterBrands.filter((b) => b.name.toLowerCase().includes(q) || b.slug.toLowerCase().includes(q));
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
      .map((id) => allMasterBrands.find((b) => b.id === id) || assignedBrands.find((b) => b.id === id))
      .filter(Boolean) as Array<{ id: number; name: string }>;
  }, [selectedBrandIds, allMasterBrands, assignedBrands]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-zinc-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-lime-400/10 text-lime-400 border border-lime-400/20">
              <Layers size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-foreground">
                Assign Brands to Dealer
              </h2>
              <p className="text-xs font-bold text-muted mt-0.5 flex items-center gap-1.5">
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
            className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSaveChanges} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Currently Assigned Brands Pill Tags */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-lime-400 tracking-wider block">
              Assigned Brands ({selectedBrandsList.length})
            </label>

            {loading ? (
              <div className="p-4 bg-white/5 rounded-2xl animate-pulse text-xs text-muted font-bold">
                Loading dealer brand assignments...
              </div>
            ) : selectedBrandsList.length === 0 ? (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs text-muted font-bold text-center">
                No brands assigned yet.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-2xl border border-white/5">
                {selectedBrandsList.map((b) => {
                  const isPrimary = primaryBrandId === b.id;
                  return (
                    <span
                      key={b.id}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        isPrimary
                          ? 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                          : 'bg-white/10 text-foreground border-white/10'
                      }`}
                    >
                      {isPrimary && <Award size={12} className="text-amber-400" />}
                      <span>{b.name}</span>
                      <button
                        type="button"
                        onClick={() => removeBrandTag(b.id)}
                        className="hover:text-rose-400 transition-colors p-0.5 rounded"
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
            <label className="text-xs font-black uppercase text-muted tracking-wider block">
              Select Brands from Master Catalog
            </label>

            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-3 text-muted pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search brands..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-foreground focus:outline-none focus:border-lime-400/50"
              />
            </div>

            {/* Multi-Select Checkbox List */}
            <div className="max-h-60 overflow-y-auto rounded-2xl bg-white/5 border border-white/5 p-2 space-y-1 divide-y divide-white/5 scrollbar-thin scrollbar-thumb-white/10">
              {loading ? (
                <div className="p-6 text-center text-xs font-bold text-muted animate-pulse">
                  Loading catalog brands...
                </div>
              ) : filteredMasterBrands.length === 0 ? (
                <div className="p-6 text-center text-xs font-medium text-muted">
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
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all select-none ${
                        isChecked
                          ? 'bg-lime-400/10 border border-lime-400/20 text-foreground font-bold'
                          : 'hover:bg-white/5 text-muted hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-5 w-5 rounded-md flex items-center justify-center border transition-all ${
                            isChecked
                              ? 'bg-lime-400 border-lime-400 text-black'
                              : 'border-white/20 bg-white/5'
                          }`}
                        >
                          {isChecked && <Check size={14} className="stroke-[3]" />}
                        </div>

                        {brand.logoUrl ? (
                          <img
                            src={brand.logoUrl}
                            alt={brand.name}
                            className="h-7 w-7 object-contain rounded bg-white/5 p-0.5 border border-white/5 shrink-0"
                          />
                        ) : (
                          <div className="h-7 w-7 rounded bg-white/10 text-foreground font-black text-xs flex items-center justify-center shrink-0">
                            {brand.name.charAt(0)}
                          </div>
                        )}

                        <div>
                          <span className="font-bold text-foreground text-sm block">{brand.name}</span>
                          <span className="text-[10px] text-muted font-normal">
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
                          className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider transition-all ${
                            isPrimary
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                              : 'bg-white/5 text-muted hover:text-foreground hover:bg-white/10'
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
        <div className="p-4 border-t border-white/10 bg-zinc-900/50 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-muted hover:text-foreground hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={submitting}
            className="px-6 py-2.5 bg-[var(--color-brand-green)] text-black font-black text-xs uppercase tracking-wider rounded-xl hover:opacity-90 transition-all shadow-lg shadow-lime-400/10 disabled:opacity-50 flex items-center gap-2"
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
