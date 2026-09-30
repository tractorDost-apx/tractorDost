'use client';

import React, { useState } from 'react';
import {
  X,
  Tractor,
  IndianRupee,
  Tag,
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { DealerInventoryItem } from '@/types/models/dealerInventory';
import { usedTractorListingAPI } from '@/lib/api/used-listings';

interface CreateUsedListingModalProps {
  item: DealerInventoryItem;
  dealerName?: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function CreateUsedListingModal({
  item,
  dealerName,
  onClose,
  onSuccess,
}: CreateUsedListingModalProps) {
  const currentYear = new Date().getFullYear();

  // Form Fields
  const [yearOfManufacture, setYearOfManufacture] = useState<number>(currentYear - 2);
  const [ownership, setOwnership] = useState<number>(1);
  const [hoursUsed, setHoursUsed] = useState<number>(1200);
  const [askingPrice, setAskingPrice] = useState<string>('');
  const [negotiable, setNegotiable] = useState<boolean>(true);
  const [financeAvailable, setFinanceAvailable] = useState<boolean>(false);

  // Condition Grades
  const [conditionGrade, setConditionGrade] = useState<'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'>(
    'GOOD'
  );
  const [tyreCondition, setTyreCondition] = useState<'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'>(
    'GOOD'
  );
  const [engineConditionPct, setEngineConditionPct] = useState<number>(85);
  const [hydraulicsCondition, setHydraulicsCondition] = useState<
    'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'
  >('GOOD');
  const [clutchCondition, setClutchCondition] = useState<'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'>(
    'GOOD'
  );
  const [bodyCondition, setBodyCondition] = useState<'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'>(
    'GOOD'
  );

  // Legal & Documents
  const [rcAvailable, setRcAvailable] = useState<boolean>(true);
  const [insuranceValidity, setInsuranceValidity] = useState<string>('');
  const [loanClearanceStatus, setLoanClearanceStatus] = useState<
    'CLEAR' | 'HYPOTHECATED' | 'PENDING_NOC'
  >('CLEAR');

  // Location & Details
  const [state, setState] = useState<string>('Maharashtra');
  const [district, setDistrict] = useState<string>('Pune');
  const [villageCity, setVillageCity] = useState<string>('');
  const [pincode, setPincode] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  // UI State
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const modelTitle = item.tractorName || item.customModel || 'Catalog Model';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const priceNum = parseFloat(askingPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid asking price greater than 0.');
      return;
    }

    if (!state || !district) {
      setError('Please enter state and district for the listing location.');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        dealerInventoryId: item.inventoryId,
        tractorId: item.tractorId || undefined,
        tractorBrand: item.brand || 'Catalog Brand',
        tractorModel: modelTitle,
        yearOfManufacture: Number(yearOfManufacture),
        ownership: Number(ownership),
        hoursUsed: Number(hoursUsed) || 0,
        askingPrice: priceNum,
        negotiable,
        financeAvailable,
        conditionGrade,
        tyreCondition,
        engineConditionPct: Number(engineConditionPct),
        hydraulicsCondition,
        clutchCondition,
        bodyCondition,
        rcAvailable,
        insuranceValidity: insuranceValidity
          ? new Date(insuranceValidity).toISOString()
          : undefined,
        loanClearanceStatus,
        state: state.trim(),
        district: district.trim(),
        villageCity: villageCity.trim() || undefined,
        pincode: pincode.trim() || undefined,
        description: description.trim() || undefined,
      };

      const res = await usedTractorListingAPI.createListing(payload as any);

      if (res.success) {
        onSuccess(`Marketplace listing created for "${modelTitle}"! Sent for approval.`);
        onClose();
      } else {
        setError(res.message || 'Failed to create marketplace listing.');
      }
    } catch (err: any) {
      console.error('Error creating used tractor listing:', err);
      setError(err?.response?.data?.message || err?.message || 'Error submitting listing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/30 p-4">
      <div className="text-foreground relative my-8 flex w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--background)] shadow-2xl [backdrop-filter:none]">
        {/* Header Banner */}
        <div className="bg-foreground/[0.03] flex items-center justify-between border-b border-[var(--border-subtle)] p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 p-2.5 text-[var(--color-brand-green)]">
              <Tag size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-foreground text-xl font-black tracking-tight">
                  List Tractor for Sale
                </h3>
                <span className="rounded-full border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-2.5 py-0.5 text-[10px] font-black tracking-wider text-[var(--color-brand-green)] uppercase">
                  Dealer Listing
                </span>
              </div>
              <p className="text-muted mt-0.5 text-xs font-medium">
                Publish a used tractor marketplace listing directly from your stock inventory.
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

        {/* Form Content */}
        <form
          onSubmit={handleSubmit}
          className="hidden-scrollbar max-h-[80vh] space-y-6 overflow-y-auto p-6 text-xs"
        >
          {error && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-bold text-rose-500">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Pre-filled Inventory Context Card */}
          <div className="space-y-2 rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/5 p-4">
            <div className="text-muted flex items-center justify-between text-[11px] font-bold tracking-wider uppercase">
              <span>Inventory Stock Context</span>
              <span className="text-[var(--color-brand-green)]">Pre-filled Catalog Info</span>
            </div>
            <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-3">
              <div>
                <span className="text-muted block text-[10px]">Brand</span>
                <span className="text-foreground text-sm font-black">
                  {item.brand || 'Catalog Brand'}
                </span>
              </div>
              <div>
                <span className="text-muted block text-[10px]">Model Name</span>
                <span className="text-foreground text-sm font-black">{modelTitle}</span>
              </div>
              <div>
                <span className="text-muted block text-[10px]">Dealership Seller</span>
                <span className="text-foreground font-bold">
                  {dealerName || 'Authorized Dealer'}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing & Years */}
          <div className="space-y-4">
            <h4 className="text-foreground flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 text-sm font-black">
              <IndianRupee size={16} className="text-[var(--color-brand-green)]" /> Pricing & Basic
              Usage
            </h4>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="text-muted block font-bold">Asking Price (₹) *</label>
                <input
                  type="number"
                  required
                  min={10000}
                  placeholder="e.g. 450000"
                  value={askingPrice}
                  onChange={(e) => setAskingPrice(e.target.value)}
                  className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] px-3.5 py-2.5 font-mono text-sm font-bold shadow-sm focus:border-[var(--color-brand-green)] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted block font-bold">Manufacturing Year *</label>
                <input
                  type="number"
                  required
                  min={1990}
                  max={currentYear}
                  value={yearOfManufacture}
                  onChange={(e) => setYearOfManufacture(parseInt(e.target.value) || currentYear)}
                  className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] px-3.5 py-2.5 font-mono text-sm font-bold shadow-sm focus:border-[var(--color-brand-green)] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted block font-bold">Hours Used (Engine)</label>
                <input
                  type="number"
                  min={0}
                  value={hoursUsed}
                  onChange={(e) => setHoursUsed(parseInt(e.target.value) || 0)}
                  className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] px-3.5 py-2.5 font-mono text-sm font-bold shadow-sm focus:border-[var(--color-brand-green)] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="text-muted block font-bold">Ownership</label>
                <select
                  value={ownership}
                  onChange={(e) => setOwnership(parseInt(e.target.value))}
                  className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] px-3 py-2 font-bold focus:border-[var(--color-brand-green)] focus:outline-none"
                >
                  <option value={1}>1st Owner</option>
                  <option value={2}>2nd Owner</option>
                  <option value={3}>3rd Owner</option>
                  <option value={4}>4th+ Owner</option>
                </select>
              </div>

              <div className="bg-foreground/[0.03] flex items-center justify-between rounded-xl border border-[var(--border-subtle)] p-3">
                <span className="text-foreground font-bold">Price Negotiable</span>
                <input
                  type="checkbox"
                  checked={negotiable}
                  onChange={(e) => setNegotiable(e.target.checked)}
                  className="h-4 w-4 cursor-pointer accent-[var(--color-brand-green)]"
                />
              </div>

              <div className="bg-foreground/[0.03] col-span-2 flex items-center justify-between rounded-xl border border-[var(--border-subtle)] p-3 sm:col-span-1">
                <span className="text-foreground font-bold">Finance Available</span>
                <input
                  type="checkbox"
                  checked={financeAvailable}
                  onChange={(e) => setFinanceAvailable(e.target.checked)}
                  className="h-4 w-4 cursor-pointer accent-[var(--color-brand-green)]"
                />
              </div>
            </div>
          </div>

          {/* Tractor Condition Grades */}
          <div className="space-y-4">
            <h4 className="text-foreground flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 text-sm font-black">
              <Sparkles size={16} className="text-[var(--color-brand-green)]" /> Tractor Condition
              Rating
            </h4>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="text-muted block font-bold">Overall Condition</label>
                <select
                  value={conditionGrade}
                  onChange={(e) => setConditionGrade(e.target.value as any)}
                  className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] px-3 py-2 font-bold focus:outline-none"
                >
                  <option value="EXCELLENT">Excellent</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="POOR">Poor</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-muted block font-bold">Tyre Condition</label>
                <select
                  value={tyreCondition}
                  onChange={(e) => setTyreCondition(e.target.value as any)}
                  className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] px-3 py-2 font-bold focus:outline-none"
                >
                  <option value="EXCELLENT">Excellent (80-100%)</option>
                  <option value="GOOD">Good (60-80%)</option>
                  <option value="FAIR">Fair (40-60%)</option>
                  <option value="POOR">Poor (&lt; 40%)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-muted block font-bold">Engine Health %</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={engineConditionPct}
                  onChange={(e) => setEngineConditionPct(parseInt(e.target.value) || 0)}
                  className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] px-3 py-2 font-mono font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted block font-bold">Hydraulics Condition</label>
                <select
                  value={hydraulicsCondition}
                  onChange={(e) => setHydraulicsCondition(e.target.value as any)}
                  className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] px-3 py-2 font-bold focus:outline-none"
                >
                  <option value="EXCELLENT">Excellent</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="POOR">Poor</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-muted block font-bold">Clutch Condition</label>
                <select
                  value={clutchCondition}
                  onChange={(e) => setClutchCondition(e.target.value as any)}
                  className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] px-3 py-2 font-bold focus:outline-none"
                >
                  <option value="EXCELLENT">Excellent</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="POOR">Poor</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-muted block font-bold">Body & Paint Condition</label>
                <select
                  value={bodyCondition}
                  onChange={(e) => setBodyCondition(e.target.value as any)}
                  className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] px-3 py-2 font-bold focus:outline-none"
                >
                  <option value="EXCELLENT">Excellent</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="POOR">Poor</option>
                </select>
              </div>
            </div>
          </div>

          {/* Legal Documents */}
          <div className="space-y-4">
            <h4 className="text-foreground flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 text-sm font-black">
              <ShieldCheck size={16} className="text-[var(--color-brand-green)]" /> Legal & RC
              Documents
            </h4>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="bg-foreground/[0.03] flex items-center justify-between rounded-xl border border-[var(--border-subtle)] p-3">
                <span className="text-foreground font-bold">RC Available</span>
                <input
                  type="checkbox"
                  checked={rcAvailable}
                  onChange={(e) => setRcAvailable(e.target.checked)}
                  className="h-4 w-4 cursor-pointer accent-[var(--color-brand-green)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted block font-bold">Loan Clearance Status</label>
                <select
                  value={loanClearanceStatus}
                  onChange={(e) => setLoanClearanceStatus(e.target.value as any)}
                  className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] px-3 py-2 font-bold focus:outline-none"
                >
                  <option value="CLEAR">NOC Clear</option>
                  <option value="HYPOTHECATED">Hypothecated</option>
                  <option value="PENDING_NOC">Pending NOC</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-muted block font-bold">Insurance Valid Till</label>
                <input
                  type="date"
                  value={insuranceValidity}
                  onChange={(e) => setInsuranceValidity(e.target.value)}
                  className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] px-3 py-2 font-medium [color-scheme:light] focus:outline-none dark:[color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          {/* Location & Summary */}
          <div className="space-y-4">
            <h4 className="text-foreground flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 text-sm font-black">
              <FileText size={16} className="text-[var(--color-brand-green)]" /> Listing Location &
              Details
            </h4>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="space-y-1">
                <label className="text-muted block font-bold">State *</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] px-3 py-2 font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted block font-bold">District *</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] px-3 py-2 font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted block font-bold">City / Village</label>
                <input
                  type="text"
                  value={villageCity}
                  onChange={(e) => setVillageCity(e.target.value)}
                  className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] px-3 py-2 font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted block font-bold">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] px-3 py-2 font-mono font-bold focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-muted block font-bold">Listing Description / Highlights</label>
              <textarea
                rows={3}
                placeholder="Mention single-hand usage, recent servicing, battery condition, attached implements, etc..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-foreground w-full resize-y rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] p-3 text-xs font-medium focus:border-[var(--color-brand-green)] focus:outline-none"
              />
            </div>
          </div>

          {/* Actions */}
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
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-6 py-2.5 text-xs font-bold tracking-wider text-white uppercase shadow-md transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Tag size={16} />
              {submitting ? 'Publishing Listing...' : 'Publish Listing for Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
