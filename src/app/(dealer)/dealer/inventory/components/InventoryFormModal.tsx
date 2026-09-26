'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Tractor, Calendar, AlertCircle, Check, Sparkles } from 'lucide-react';
import { tractorAPI, Tractor as TractorModel } from '@/lib/api/tractors';
import { DealerInventoryItem, AddInventoryPayload, UpdateInventoryPayload } from '@/types/models/dealerInventory';

interface InventoryFormModalProps {
  itemToEdit: DealerInventoryItem | null;
  onClose: () => void;
  onSubmitAdd: (payload: AddInventoryPayload) => Promise<any>;
  onSubmitUpdate: (inventoryId: number, payload: UpdateInventoryPayload) => Promise<any>;
}

export function InventoryFormModal({
  itemToEdit,
  onClose,
  onSubmitAdd,
  onSubmitUpdate,
}: InventoryFormModalProps) {
  const isEdit = Boolean(itemToEdit);

  // Form Mode: CATALOG vs CUSTOM
  const [mode, setMode] = useState<'CATALOG' | 'CUSTOM'>(
    itemToEdit?.customModel && !itemToEdit?.tractorId ? 'CUSTOM' : 'CATALOG'
  );

  // Form Fields
  const [selectedTractor, setSelectedTractor] = useState<TractorModel | null>(null);
  const [customModel, setCustomModel] = useState<string>(itemToEdit?.customModel || '');
  const [stockCount, setStockCount] = useState<number>(itemToEdit ? itemToEdit.stockCount : 1);
  const [expectedArrival, setExpectedArrival] = useState<string>(
    itemToEdit?.expectedArrival ? new Date(itemToEdit.expectedArrival).toISOString().split('T')[0] : ''
  );
  const [isAvailable, setIsAvailable] = useState<boolean>(itemToEdit ? itemToEdit.isAvailable : true);

  // Tractor Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<TractorModel[]>([]);
  const [searching, setSearching] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  // UI / Error state
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Search catalog tractors
  useEffect(() => {
    if (mode !== 'CATALOG' || isEdit) return;

    let isCurrent = true;
    const fetchTractors = async () => {
      try {
        setSearching(true);
        const res = await tractorAPI.getAllTractors({
          search: searchQuery,
          limit: 20,
        });
        if (isCurrent && res.success && res.data) {
          const list = res.data.tractors || res.data.data || (Array.isArray(res.data) ? res.data : []);
          setSearchResults(list);
        }
      } catch (err) {
        console.error('Error fetching catalog tractors:', err);
      } finally {
        if (isCurrent) setSearching(false);
      }
    };

    const timer = setTimeout(fetchTractors, 250);
    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [searchQuery, mode, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (stockCount < 0 || !Number.isInteger(stockCount)) {
      setFormError('Stock count must be a non-negative integer (0 or greater).');
      return;
    }

    if (!isEdit) {
      if (mode === 'CATALOG' && !selectedTractor) {
        setFormError('Please select a tractor model from the catalog.');
        return;
      }
      if (mode === 'CUSTOM' && (!customModel || customModel.trim().length < 3)) {
        setFormError('Custom model name must be at least 3 characters long.');
        return;
      }
    }

    try {
      setSubmitting(true);

      const formattedArrival = expectedArrival ? new Date(expectedArrival).toISOString() : null;

      if (isEdit && itemToEdit) {
        const updatePayload: UpdateInventoryPayload = {
          stockCount,
          isAvailable,
          expectedArrival: formattedArrival,
          customModel: mode === 'CUSTOM' ? customModel : itemToEdit.customModel,
        };
        await onSubmitUpdate(itemToEdit.inventoryId, updatePayload);
      } else {
        const addPayload: AddInventoryPayload = {
          tractorId: mode === 'CATALOG' ? selectedTractor?.id || null : null,
          customModel: mode === 'CUSTOM' ? customModel.trim() : null,
          stockCount,
          expectedArrival: formattedArrival,
          isAvailable,
        };
        await onSubmitAdd(addPayload);
      }

      onClose();
    } catch (err: any) {
      console.error('Error submitting inventory form:', err);
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.message || 'Failed to save inventory item.';

      if (status === 409 || msg.toLowerCase().includes('already in dealer inventory')) {
        setFormError('This tractor is already present in your inventory. You can edit its stock instead.');
      } else {
        setFormError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/25 dark:bg-black/60 flex items-center justify-center p-4 animate-fade-in">
      {/* Modal Container: 100% Solid Opaque Theme-Adaptive Background */}
      <div className="w-full max-w-xl bg-[var(--background)] text-foreground border border-[var(--border-subtle)] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-8 relative [backdrop-filter:none]">
        {/* Modal Header */}
        <div className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-between bg-foreground/[0.03]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20">
              <Tractor size={22} />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground tracking-tight">
                {isEdit ? 'Edit Inventory Item' : 'Add Tractor to Inventory'}
              </h3>
              <p className="text-xs font-medium text-muted mt-0.5">
                {isEdit
                  ? `Update stock quantity & availability for ${itemToEdit?.tractorName || itemToEdit?.customModel}`
                  : 'Add stock details for a catalog tractor or custom dealership model.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-foreground/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {formError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold flex items-start gap-2.5">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Mode Selector (Catalog vs Custom) - Only editable on creation */}
          {!isEdit && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted uppercase tracking-wider block">
                Inventory Source
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMode('CATALOG');
                    setFormError(null);
                  }}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    mode === 'CATALOG'
                      ? 'bg-[var(--color-brand-green)]/10 border-[var(--color-brand-green)] text-[var(--color-brand-green)] shadow-sm'
                      : 'bg-foreground/[0.03] border-[var(--border-subtle)] text-muted hover:text-foreground hover:bg-foreground/[0.06]'
                  }`}
                >
                  <Tractor size={16} /> Catalog Tractor
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('CUSTOM');
                    setFormError(null);
                  }}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    mode === 'CUSTOM'
                      ? 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400 shadow-sm'
                      : 'bg-foreground/[0.03] border-[var(--border-subtle)] text-muted hover:text-foreground hover:bg-foreground/[0.06]'
                  }`}
                >
                  <Sparkles size={16} /> Custom Model
                </button>
              </div>
            </div>
          )}

          {/* Field: Catalog Tractor Search Selection */}
          {mode === 'CATALOG' && !isEdit && (
            <div className="space-y-2 relative">
              <label className="text-xs font-bold text-muted block">
                Select Tractor Model <span className="text-rose-500">*</span>
              </label>

              {selectedTractor ? (
                <div className="p-3.5 rounded-2xl bg-foreground/[0.03] border border-[var(--color-brand-green)]/40 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] flex items-center justify-center font-bold">
                      <Tractor size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-black text-foreground">
                        {selectedTractor.modelName}
                      </div>
                      <div className="text-xs text-muted">
                        {selectedTractor.brand?.name || 'Unknown Brand'} • {selectedTractor.hp || 'N/A'} HP
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedTractor(null)}
                    className="p-1.5 rounded-lg bg-foreground/10 hover:bg-rose-500/20 text-muted hover:text-rose-500 text-xs font-bold transition-colors"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div>
                  <div className="relative">
                    <Search size={18} className="absolute left-3.5 top-3 text-muted" />
                    <input
                      type="text"
                      placeholder="Search by brand or model name (e.g. Swaraj 855, Mahindra 575)..."
                      value={searchQuery}
                      onFocus={() => setShowDropdown(true)}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowDropdown(true);
                      }}
                      className="w-full bg-[var(--background)] border border-[var(--border-subtle)] rounded-2xl pl-10 pr-4 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-[var(--color-brand-green)] transition-colors shadow-sm"
                    />
                  </div>

                  {showDropdown && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-[var(--background)] text-foreground border border-[var(--border-subtle)] rounded-2xl shadow-2xl divide-y divide-[var(--border-subtle)] hidden-scrollbar">
                      {searching && (
                        <div className="p-4 text-xs font-bold text-muted text-center">
                          Searching catalog...
                        </div>
                      )}

                      {!searching && searchResults.length === 0 && (
                        <div className="p-4 text-xs font-bold text-muted text-center">
                          No catalog tractors found matching &quot;{searchQuery}&quot;.
                        </div>
                      )}

                      {!searching &&
                        searchResults.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              setSelectedTractor(t);
                              setShowDropdown(false);
                            }}
                            className="w-full p-3 text-left hover:bg-foreground/5 flex items-center justify-between transition-colors group"
                          >
                            <div>
                              <div className="text-sm font-bold text-foreground group-hover:text-[var(--color-brand-green)] transition-colors">
                                {t.modelName}
                              </div>
                              <div className="text-xs text-muted">
                                {t.brand?.name || 'Brand'} • {t.hp ? `${t.hp} HP` : 'Standard HP'}
                              </div>
                            </div>
                            <span className="text-xs text-[var(--color-brand-green)] opacity-0 group-hover:opacity-100 font-bold transition-opacity">
                              Select
                            </span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Field: Custom Model Name */}
          {mode === 'CUSTOM' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted block">
                Custom Model Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter custom tractor or model specification..."
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--border-subtle)] rounded-2xl px-4 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-[var(--color-brand-green)] transition-colors shadow-sm"
              />
            </div>
          )}

          {/* Field: Stock Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted block">
                Stock Quantity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                max={1000}
                required
                value={stockCount}
                onChange={(e) => setStockCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-[var(--background)] border border-[var(--border-subtle)] rounded-2xl px-4 py-2.5 text-sm font-mono font-bold text-foreground focus:outline-none focus:border-[var(--color-brand-green)] transition-colors shadow-sm"
              />
              <span className="text-[11px] text-muted block">
                Set to 0 if incoming / out of stock.
              </span>
            </div>

            {/* Field: Expected Arrival Date */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted block">
                Expected Arrival Date
              </label>
              <div className="relative">
                <Calendar size={18} className="absolute left-3.5 top-3 text-muted pointer-events-none" />
                <input
                  type="date"
                  value={expectedArrival}
                  onChange={(e) => setExpectedArrival(e.target.value)}
                  className="w-full bg-[var(--background)] border border-[var(--border-subtle)] rounded-2xl pl-10 pr-4 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-[var(--color-brand-green)] transition-colors shadow-sm [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          {/* Field: Availability Switch */}
          <div className="p-4 rounded-2xl bg-foreground/[0.03] border border-[var(--border-subtle)] flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-foreground">
                Stock Availability
              </div>
              <div className="text-xs text-muted">
                Enable to show this item in active dealership inventory listings.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsAvailable(!isAvailable)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                isAvailable
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-foreground/10 text-muted border border-[var(--border-subtle)]'
              }`}
            >
              {isAvailable ? <Check size={14} /> : <X size={14} />}
              {isAvailable ? 'Available' : 'Unavailable'}
            </button>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-muted hover:text-foreground hover:bg-foreground/10 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[var(--color-brand-green)] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? isEdit
                  ? 'Saving...'
                  : 'Adding...'
                : isEdit
                ? 'Save Changes'
                : 'Add to Inventory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
