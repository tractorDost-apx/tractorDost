'use client';

import React, { useState } from 'react';
import { X, Tractor, IndianRupee, Tag, ShieldCheck, FileText, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
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
  const [conditionGrade, setConditionGrade] = useState<'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'>('GOOD');
  const [tyreCondition, setTyreCondition] = useState<'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'>('GOOD');
  const [engineConditionPct, setEngineConditionPct] = useState<number>(85);
  const [hydraulicsCondition, setHydraulicsCondition] = useState<'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'>('GOOD');
  const [clutchCondition, setClutchCondition] = useState<'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'>('GOOD');
  const [bodyCondition, setBodyCondition] = useState<'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'>('GOOD');

  // Legal & Documents
  const [rcAvailable, setRcAvailable] = useState<boolean>(true);
  const [insuranceValidity, setInsuranceValidity] = useState<string>('');
  const [loanClearanceStatus, setLoanClearanceStatus] = useState<'CLEAR' | 'HYPOTHECATED' | 'PENDING_NOC'>('CLEAR');

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
        insuranceValidity: insuranceValidity ? new Date(insuranceValidity).toISOString() : undefined,
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/30 flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-[var(--background)] text-foreground border border-[var(--border-subtle)] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-8 relative [backdrop-filter:none]">
        {/* Header Banner */}
        <div className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-between bg-foreground/[0.03]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20">
              <Tag size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-foreground tracking-tight">
                  List Tractor for Sale
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20">
                  Dealer Listing
                </span>
              </div>
              <p className="text-xs font-medium text-muted mt-0.5">
                Publish a used tractor marketplace listing directly from your stock inventory.
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

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs max-h-[80vh] overflow-y-auto hidden-scrollbar">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold flex items-start gap-2.5">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Pre-filled Inventory Context Card */}
          <div className="p-4 rounded-2xl bg-[var(--color-brand-green)]/5 border border-[var(--color-brand-green)]/20 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-muted uppercase tracking-wider">
              <span>Inventory Stock Context</span>
              <span className="text-[var(--color-brand-green)]">Pre-filled Catalog Info</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <span className="text-muted block text-[10px]">Brand</span>
                <span className="font-black text-foreground text-sm">{item.brand || 'Catalog Brand'}</span>
              </div>
              <div>
                <span className="text-muted block text-[10px]">Model Name</span>
                <span className="font-black text-foreground text-sm">{modelTitle}</span>
              </div>
              <div>
                <span className="text-muted block text-[10px]">Dealership Seller</span>
                <span className="font-bold text-foreground">{dealerName || 'Authorized Dealer'}</span>
              </div>
            </div>
          </div>

          {/* Pricing & Years */}
          <div className="space-y-4">
            <h4 className="font-black text-foreground text-sm border-b border-[var(--border-subtle)] pb-2 flex items-center gap-2">
              <IndianRupee size={16} className="text-[var(--color-brand-green)]" /> Pricing & Basic Usage
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-muted block">Asking Price (₹) *</label>
                <input
                  type="number"
                  required
                  min={10000}
                  placeholder="e.g. 450000"
                  value={askingPrice}
                  onChange={(e) => setAskingPrice(e.target.value)}
                  className="w-full bg-[var(--background)] border border-[var(--border-subtle)] rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-foreground focus:outline-none focus:border-[var(--color-brand-green)] shadow-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted block">Manufacturing Year *</label>
                <input
                  type="number"
                  required
                  min={1990}
                  max={currentYear}
                  value={yearOfManufacture}
                  onChange={(e) => setYearOfManufacture(parseInt(e.target.value) || currentYear)}
                  className="w-full bg-[var(--background)] border border-[var(--border-subtle)] rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-foreground focus:outline-none focus:border-[var(--color-brand-green)] shadow-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted block">Hours Used (Engine)</label>
                <input
                  type="number"
                  min={0}
                  value={hoursUsed}
                  onChange={(e) => setHoursUsed(parseInt(e.target.value) || 0)}
                  className="w-full bg-[var(--background)] border border-[var(--border-subtle)] rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-foreground focus:outline-none focus:border-[var(--color-brand-green)] shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-muted block">Ownership</label>
                <select
                  value={ownership}
                  onChange={(e) => setOwnership(parseInt(e.target.value))}
                  className="w-full bg-[var(--background)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-foreground font-bold focus:outline-none focus:border-[var(--color-brand-green)]"
                >
                  <option value={1}>1st Owner</option>
                  <option value={2}>2nd Owner</option>
                  <option value={3}>3rd Owner</option>
                  <option value={4}>4th+ Owner</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-foreground/[0.03] border border-[var(--border-subtle)] flex items-center justify-between">
                <span className="font-bold text-foreground">Price Negotiable</span>
                <input
                  type="checkbox"
                  checked={negotiable}
                  onChange={(e) => setNegotiable(e.target.checked)}
                  className="h-4 w-4 accent-[var(--color-brand-green)] cursor-pointer"
                />
              </div>

              <div className="p-3 rounded-xl bg-foreground/[0.03] border border-[var(--border-subtle)] flex items-center justify-between col-span-2 sm:col-span-1">
                <span className="font-bold text-foreground">Finance Available</span>
                <input
                  type="checkbox"
                  checked={financeAvailable}
                  onChange={(e) => setFinanceAvailable(e.target.checked)}
                  className="h-4 w-4 accent-[var(--color-brand-green)] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Tractor Condition Grades */}
          <div className="space-y-4">
            <h4 className="font-black text-foreground text-sm border-b border-[var(--border-subtle)] pb-2 flex items-center gap-2">
              <Sparkles size={16} className="text-[var(--color-brand-green)]" /> Tractor Condition Rating
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-muted block">Overall Condition</label>
                <select
                  value={conditionGrade}
                  onChange={(e) => setConditionGrade(e.target.value as any)}
                  className="w-full bg-[var(--background)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-foreground font-bold focus:outline-none"
                >
                  <option value="EXCELLENT">Excellent</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="POOR">Poor</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted block">Tyre Condition</label>
                <select
                  value={tyreCondition}
                  onChange={(e) => setTyreCondition(e.target.value as any)}
                  className="w-full bg-[var(--background)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-foreground font-bold focus:outline-none"
                >
                  <option value="EXCELLENT">Excellent (80-100%)</option>
                  <option value="GOOD">Good (60-80%)</option>
                  <option value="FAIR">Fair (40-60%)</option>
                  <option value="POOR">Poor (&lt; 40%)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted block">Engine Health %</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={engineConditionPct}
                  onChange={(e) => setEngineConditionPct(parseInt(e.target.value) || 0)}
                  className="w-full bg-[var(--background)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-foreground font-mono font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted block">Hydraulics Condition</label>
                <select
                  value={hydraulicsCondition}
                  onChange={(e) => setHydraulicsCondition(e.target.value as any)}
                  className="w-full bg-[var(--background)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-foreground font-bold focus:outline-none"
                >
                  <option value="EXCELLENT">Excellent</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="POOR">Poor</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted block">Clutch Condition</label>
                <select
                  value={clutchCondition}
                  onChange={(e) => setClutchCondition(e.target.value as any)}
                  className="w-full bg-[var(--background)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-foreground font-bold focus:outline-none"
                >
                  <option value="EXCELLENT">Excellent</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="POOR">Poor</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted block">Body & Paint Condition</label>
                <select
                  value={bodyCondition}
                  onChange={(e) => setBodyCondition(e.target.value as any)}
                  className="w-full bg-[var(--background)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-foreground font-bold focus:outline-none"
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
            <h4 className="font-black text-foreground text-sm border-b border-[var(--border-subtle)] pb-2 flex items-center gap-2">
              <ShieldCheck size={16} className="text-[var(--color-brand-green)]" /> Legal & RC Documents
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-foreground/[0.03] border border-[var(--border-subtle)] flex items-center justify-between">
                <span className="font-bold text-foreground">RC Available</span>
                <input
                  type="checkbox"
                  checked={rcAvailable}
                  onChange={(e) => setRcAvailable(e.target.checked)}
                  className="h-4 w-4 accent-[var(--color-brand-green)] cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted block">Loan Clearance Status</label>
                <select
                  value={loanClearanceStatus}
                  onChange={(e) => setLoanClearanceStatus(e.target.value as any)}
                  className="w-full bg-[var(--background)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-foreground font-bold focus:outline-none"
                >
                  <option value="CLEAR">NOC Clear</option>
                  <option value="HYPOTHECATED">Hypothecated</option>
                  <option value="PENDING_NOC">Pending NOC</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted block">Insurance Valid Till</label>
                <input
                  type="date"
                  value={insuranceValidity}
                  onChange={(e) => setInsuranceValidity(e.target.value)}
                  className="w-full bg-[var(--background)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-foreground font-medium focus:outline-none [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          {/* Location & Summary */}
          <div className="space-y-4">
            <h4 className="font-black text-foreground text-sm border-b border-[var(--border-subtle)] pb-2 flex items-center gap-2">
              <FileText size={16} className="text-[var(--color-brand-green)]" /> Listing Location & Details
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-muted block">State *</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-[var(--background)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-foreground font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted block">District *</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-[var(--background)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-foreground font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted block">City / Village</label>
                <input
                  type="text"
                  value={villageCity}
                  onChange={(e) => setVillageCity(e.target.value)}
                  className="w-full bg-[var(--background)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-foreground font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted block">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full bg-[var(--background)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-foreground font-mono font-bold focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-muted block">Listing Description / Highlights</label>
              <textarea
                rows={3}
                placeholder="Mention single-hand usage, recent servicing, battery condition, attached implements, etc..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--border-subtle)] rounded-xl p-3 text-foreground text-xs font-medium focus:outline-none focus:border-[var(--color-brand-green)] resize-y"
              />
            </div>
          </div>

          {/* Actions */}
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
              className="px-6 py-2.5 bg-[var(--color-brand-green)] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
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
