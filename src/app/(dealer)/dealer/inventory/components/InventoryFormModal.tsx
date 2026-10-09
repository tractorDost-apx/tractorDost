'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Tractor, Calendar, AlertCircle, Check, Sparkles } from 'lucide-react';
import { tractorAPI, Tractor as TractorModel } from '@/lib/api/tractors';
import {
  DealerInventoryItem,
  AddInventoryPayload,
  UpdateInventoryPayload,
} from '@/types/models/dealerInventory';

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
    itemToEdit?.expectedArrival
      ? new Date(itemToEdit.expectedArrival).toISOString().split('T')[0]
      : ''
  );
  const [isAvailable, setIsAvailable] = useState<boolean>(
    itemToEdit ? itemToEdit.isAvailable : true
  );

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
          const list =
            res.data.tractors || res.data.data || (Array.isArray(res.data) ? res.data : []);
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
        setFormError(
          'This tractor is already present in your inventory. You can edit its stock instead.'
        );
      } else {
        setFormError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4 dark:bg-black/60">
      {/* Modal Container: 100% Solid Opaque Theme-Adaptive Background */}
      <div className="text-foreground relative max-h-[80vh] overflow-y-auto flex w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--background)] shadow-2xl [backdrop-filter:none]">
        {/* Modal Header */}
        <div className="bg-foreground/[0.03] flex items-center justify-between border-b border-[var(--border-subtle)] p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 p-2.5 text-[var(--color-brand-green)]">
              <Tractor size={22} />
            </div>
            <div>
              <h3 className="text-foreground text-xl font-black tracking-tight">
                {isEdit ? 'Edit Inventory Item' : 'Add Tractor to Inventory'}
              </h3>
              <p className="text-muted mt-0.5 text-xs font-medium">
                {isEdit
                  ? `Update stock quantity & availability for ${itemToEdit?.tractorName || itemToEdit?.customModel}`
                  : 'Add stock details for a catalog tractor or custom dealership model.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-muted hover:text-foreground hover:bg-foreground/10 rounded-xl p-2 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {formError && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-bold text-rose-500">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Mode Selector (Catalog vs Custom) - Only editable on creation */}
          {!isEdit && (
            <div className="space-y-2">
              <label className="text-muted block text-xs font-bold tracking-wider uppercase">
                Inventory Source
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMode('CATALOG');
                    setFormError(null);
                  }}
                  className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-bold transition-all ${
                    mode === 'CATALOG'
                      ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] shadow-sm'
                      : 'bg-foreground/[0.03] text-muted hover:text-foreground hover:bg-foreground/[0.06] border-[var(--border-subtle)]'
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
                  className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-bold transition-all ${
                    mode === 'CUSTOM'
                      ? 'border-purple-500/30 bg-purple-500/10 text-purple-600 shadow-sm dark:text-purple-400'
                      : 'bg-foreground/[0.03] text-muted hover:text-foreground hover:bg-foreground/[0.06] border-[var(--border-subtle)]'
                  }`}
                >
                  <Sparkles size={16} /> Custom Model
                </button>
              </div>
            </div>
          )}

          {/* Field: Catalog Tractor Search Selection */}
          {mode === 'CATALOG' && !isEdit && (
            <div className="relative space-y-2">
              <label className="text-muted block text-xs font-bold">
                Select Tractor Model <span className="text-rose-500">*</span>
              </label>

              {selectedTractor ? (
                <div className="bg-foreground/[0.03] flex items-center justify-between rounded-2xl border border-[var(--color-brand-green)]/40 p-3.5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-brand-green)]/10 font-bold text-[var(--color-brand-green)]">
                      <Tractor size={20} />
                    </div>
                    <div>
                      <div className="text-foreground text-sm font-black">
                        {selectedTractor.modelName}
                      </div>
                      <div className="text-muted text-xs">
                        {selectedTractor.brand?.name || 'Unknown Brand'} •{' '}
                        {selectedTractor.hp || 'N/A'} HP
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedTractor(null)}
                    className="bg-foreground/10 text-muted rounded-lg p-1.5 text-xs font-bold transition-colors hover:bg-rose-500/20 hover:text-rose-500"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div>
                  <div className="relative">
                    <Search size={18} className="text-muted absolute top-3 left-3.5" />
                    <input
                      type="text"
                      placeholder="Search by brand or model name (e.g. Swaraj 855, Mahindra 575)..."
                      value={searchQuery}
                      onFocus={() => setShowDropdown(true)}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowDropdown(true);
                      }}
                      className="text-foreground w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--background)] py-2.5 pr-4 pl-10 text-sm font-medium shadow-sm transition-colors focus:border-[var(--color-brand-green)] focus:outline-none"
                    />
                  </div>

                  {showDropdown && (
                    <div className="text-foreground hidden-scrollbar absolute top-full right-0 left-0 z-20 mt-1 max-h-56 divide-y divide-[var(--border-subtle)] overflow-y-auto rounded-2xl border border-[var(--border-subtle)] bg-[var(--background)] shadow-2xl">
                      {searching && (
                        <div className="text-muted p-4 text-center text-xs font-bold">
                          Searching catalog...
                        </div>
                      )}

                      {!searching && searchResults.length === 0 && (
                        <div className="text-muted p-4 text-center text-xs font-bold">
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
                            className="hover:bg-foreground/5 group flex w-full items-center justify-between p-3 text-left transition-colors"
                          >
                            <div>
                              <div className="text-foreground text-sm font-bold transition-colors group-hover:text-[var(--color-brand-green)]">
                                {t.modelName}
                              </div>
                              <div className="text-muted text-xs">
                                {t.brand?.name || 'Brand'} • {t.hp ? `${t.hp} HP` : 'Standard HP'}
                              </div>
                            </div>
                            <span className="text-xs font-bold text-[var(--color-brand-green)] opacity-0 transition-opacity group-hover:opacity-100">
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
              <label className="text-muted block text-xs font-bold">
                Custom Model Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter custom tractor or model specification..."
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                className="text-foreground w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--background)] px-4 py-2.5 text-sm font-medium shadow-sm transition-colors focus:border-[var(--color-brand-green)] focus:outline-none"
              />
            </div>
          )}

          {/* Field: Stock Count */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-muted block text-xs font-bold">
                Stock Quantity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                max={1000}
                required
                value={stockCount}
                onChange={(e) => setStockCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="text-foreground w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--background)] px-4 py-2.5 font-mono text-sm font-bold shadow-sm transition-colors focus:border-[var(--color-brand-green)] focus:outline-none"
              />
              <span className="text-muted block text-[11px]">
                Set to 0 if incoming / out of stock.
              </span>
            </div>

            {/* Field: Expected Arrival Date */}
            <div className="space-y-2">
              <label className="text-muted block text-xs font-bold">Expected Arrival Date</label>
              <div className="relative">
                <Calendar
                  size={18}
                  className="text-muted pointer-events-none absolute top-3 left-3.5"
                />
                <input
                  type="date"
                  value={expectedArrival}
                  onChange={(e) => setExpectedArrival(e.target.value)}
                  className="text-foreground w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--background)] py-2.5 pr-4 pl-10 text-sm font-medium [color-scheme:light] shadow-sm transition-colors focus:border-[var(--color-brand-green)] focus:outline-none dark:[color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          {/* Field: Availability Switch */}
          <div className="bg-foreground/[0.03] flex items-center justify-between rounded-2xl border border-[var(--border-subtle)] p-4">
            <div>
              <div className="text-foreground text-sm font-bold">Stock Availability</div>
              <div className="text-muted text-xs">
                Enable to show this item in active dealership inventory listings.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsAvailable(!isAvailable)}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold tracking-wider uppercase transition-all ${
                isAvailable
                  ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-foreground/10 text-muted border border-[var(--border-subtle)]'
              }`}
            >
              {isAvailable ? <Check size={14} /> : <X size={14} />}
              {isAvailable ? 'Available' : 'Unavailable'}
            </button>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-[var(--border-subtle)] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="text-muted hover:text-foreground hover:bg-foreground/10 rounded-xl px-5 py-2.5 text-xs font-bold transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[var(--color-brand-green)] px-6 py-2.5 text-xs font-bold tracking-wider text-white uppercase shadow-md transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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
