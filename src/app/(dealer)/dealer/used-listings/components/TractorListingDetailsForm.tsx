'use client';

import React, { useState } from 'react';
import {
  Loader2,
  AlertCircle,
  Sparkles,
  IndianRupee,
  Wrench,
  MapPin,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { Tractor } from '@/lib/api/tractors';
import { usedTractorListingAPI } from '@/lib/api/used-listings';
import { SpatialButton } from '@/components/ui/spatial-button';
import type { CreateListingInput } from '@/types/models/used-listing';
import {
  ListingStatus,
  ConditionGrade,
  UrgencyLevel,
  type LoanClearanceStatus,
} from '@/types/models/used-listing';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

interface TractorListingDetailsFormProps {
  selectedTractor: Tractor;
  dealerName?: string | null;
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
  onBackClick: () => void;
}

const CONDITION_OPTIONS: { label: string; value: ConditionGrade }[] = [
  { label: 'EXCELLENT', value: ConditionGrade.EXCELLENT },
  { label: 'GOOD', value: ConditionGrade.GOOD },
  { label: 'FAIR', value: ConditionGrade.FAIR },
  { label: 'POOR', value: ConditionGrade.POOR },
];

export function TractorListingDetailsForm({
  selectedTractor,
  dealerName,
  onSuccess,
  onError,
  onBackClick,
}: TractorListingDetailsFormProps) {
  const currentYear = new Date().getFullYear();

  // Manual fields
  const [yearOfManufacture, setYearOfManufacture] = useState<number>(currentYear - 3);
  const [ownership, setOwnership] = useState<number>(1);
  const [hoursUsed, setHoursUsed] = useState<number>(1200);

  // Condition & Inspection
  const [conditionGrade, setConditionGrade] = useState<ConditionGrade>(ConditionGrade.GOOD);
  const [tyreCondition, setTyreCondition] = useState<ConditionGrade>(ConditionGrade.GOOD);
  const [engineConditionPct, setEngineConditionPct] = useState<number>(85);
  const [hydraulicsCondition, setHydraulicsCondition] = useState<ConditionGrade>(ConditionGrade.GOOD);
  const [bodyCondition, setBodyCondition] = useState<ConditionGrade>(ConditionGrade.GOOD);

  // Documents & Legal
  const [rcAvailable, setRcAvailable] = useState<boolean>(true);
  const [insuranceValidity, setInsuranceValidity] = useState<string>('');
  const [loanClearanceStatus, setLoanClearanceStatus] = useState<LoanClearanceStatus>('CLEAR' as const);

  // Major Repairs
  const [hasMajorRepairs, setHasMajorRepairs] = useState<boolean>(false);
  const [majorRepairs, setMajorRepairs] = useState<string>('');

  // Pricing & Options
  const [askingPrice, setAskingPrice] = useState<string>('');
  const [negotiable, setNegotiable] = useState<boolean>(true);
  const [financeAvailable, setFinanceAvailable] = useState<boolean>(true);

  // Location
  const [state, setState] = useState<string>('Maharashtra');
  const [district, setDistrict] = useState<string>('');
  const [villageCity, setVillageCity] = useState<string>('');
  const [pincode, setPincode] = useState<string>('');

  // Description
  const [description, setDescription] = useState<string>('');

  // Urgency & Status
  const [urgency, setUrgency] = useState<UrgencyLevel>(UrgencyLevel.NO_RUSH);

  // UI State
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [confirmAction, setConfirmAction] = useState<'draft' | 'publish' | null>(null);

  const handleValidation = (): boolean => {
    if (!yearOfManufacture) {
      setError('Please specify the Year of Manufacture.');
      return false;
    }
    if (!ownership) {
      setError('Please specify the Number of Previous Owners.');
      return false;
    }
    if (!conditionGrade) {
      setError('Please select the Condition Grade.');
      return false;
    }
    const priceNum = parseFloat(askingPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid asking price greater than 0.');
      return false;
    }
    if (!state.trim()) {
      setError('Please select a state.');
      return false;
    }
    if (!district.trim()) {
      setError('Please enter the district.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (listingStatus: ListingStatus) => {
    setError(null);

    if (!handleValidation()) return;

    try {
      setSubmitting(true);

      const payload: CreateListingInput & { listingStatus?: ListingStatus } = {
        tractorId: selectedTractor.id,
        tractorBrand: selectedTractor.brand?.name || 'Unknown Brand',
        tractorModel: selectedTractor.modelName,
        yearOfManufacture: Number(yearOfManufacture),
        ownership: Number(ownership),
        hoursUsed: Number(hoursUsed) || 0,
        conditionGrade,
        tyreCondition,
        engineConditionPct: Number(engineConditionPct),
        hydraulicsCondition,
        bodyCondition,
        rcAvailable,
        insuranceValidity: insuranceValidity ? new Date(insuranceValidity).toISOString() : undefined,
        loanClearanceStatus,
        askingPrice: parseFloat(askingPrice),
        negotiable,
        financeAvailable,
        description: description.trim() || undefined,
        majorRepairs: hasMajorRepairs ? majorRepairs.trim() || undefined : undefined,
        state: state.trim(),
        district: district.trim(),
        villageCity: villageCity.trim() || undefined,
        pincode: pincode.trim() || undefined,
        urgency,
        listingStatus,
      };

      const res = await usedTractorListingAPI.createListing(payload as any);

      if (!res.success) {
        setError(res.message || 'Failed to create listing.');
        setSubmitting(false);
        return;
      }

      onSuccess(
        `${selectedTractor.modelName} listing saved as ${listingStatus === 'DRAFT' ? 'draft' : 'published'} successfully!`
      );
    } catch (err: any) {
      console.error('Error submitting listing:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to create listing.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDraftClick = () => {
    setConfirmAction('draft');
    setShowConfirmDialog(true);
  };

  const handlePublishClick = () => {
    setConfirmAction('publish');
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    setShowConfirmDialog(false);
    if (confirmAction === 'draft') {
      handleSubmit(ListingStatus.DRAFT);
    } else if (confirmAction === 'publish') {
      handleSubmit(ListingStatus.ACTIVE);
    }
  };

  return (
    <form className="space-y-6 p-6 pb-28">
      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-medium text-rose-500">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Auto-filled Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[var(--color-brand-green)]">
          <Sparkles size={14} />
          Auto-filled from Catalog
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {selectedTractor.brand?.name && (
            <div className="rounded-xl bg-foreground/5 border border-[var(--border-subtle)] p-3">
              <p className="text-[11px] font-bold text-muted uppercase tracking-wide mb-1">
                Brand Name
              </p>
              <p className="text-sm font-bold text-foreground">{selectedTractor.brand.name}</p>
            </div>
          )}
          <div className="rounded-xl bg-foreground/5 border border-[var(--border-subtle)] p-3">
            <p className="text-[11px] font-bold text-muted uppercase tracking-wide mb-1">
              Model Name
            </p>
            <p className="text-sm font-bold text-foreground">{selectedTractor.modelName}</p>
          </div>
          {selectedTractor.hp && (
            <div className="rounded-xl bg-foreground/5 border border-[var(--border-subtle)] p-3">
              <p className="text-[11px] font-bold text-muted uppercase tracking-wide mb-1">HP</p>
              <p className="text-sm font-bold text-foreground">{selectedTractor.hp}</p>
            </div>
          )}
          {selectedTractor.spec?.engineCc && (
            <div className="rounded-xl bg-foreground/5 border border-[var(--border-subtle)] p-3">
              <p className="text-[11px] font-bold text-muted uppercase tracking-wide mb-1">
                Engine CC
              </p>
              <p className="text-sm font-bold text-foreground">{selectedTractor.spec.engineCc}</p>
            </div>
          )}
          {selectedTractor.spec?.cylinders && (
            <div className="rounded-xl bg-foreground/5 border border-[var(--border-subtle)] p-3">
              <p className="text-[11px] font-bold text-muted uppercase tracking-wide mb-1">
                Cylinders
              </p>
              <p className="text-sm font-bold text-foreground">{selectedTractor.spec.cylinders}</p>
            </div>
          )}
          {selectedTractor.fuelType && (
            <div className="rounded-xl bg-foreground/5 border border-[var(--border-subtle)] p-3">
              <p className="text-[11px] font-bold text-muted uppercase tracking-wide mb-1">
                Fuel Type
              </p>
              <p className="text-sm font-bold text-foreground">{selectedTractor.fuelType}</p>
            </div>
          )}
          {selectedTractor.driveType && (
            <div className="rounded-xl bg-foreground/5 border border-[var(--border-subtle)] p-3">
              <p className="text-[11px] font-bold text-muted uppercase tracking-wide mb-1">
                Drive Type
              </p>
              <p className="text-sm font-bold text-foreground">{selectedTractor.driveType}</p>
            </div>
          )}
          {selectedTractor.spec?.ptoHp && (
            <div className="rounded-xl bg-foreground/5 border border-[var(--border-subtle)] p-3">
              <p className="text-[11px] font-bold text-muted uppercase tracking-wide mb-1">
                PTO HP
              </p>
              <p className="text-sm font-bold text-foreground">{selectedTractor.spec.ptoHp}</p>
            </div>
          )}
          {selectedTractor.spec?.liftingCapacityKg && (
            <div className="rounded-xl bg-foreground/5 border border-[var(--border-subtle)] p-3">
              <p className="text-[11px] font-bold text-muted uppercase tracking-wide mb-1">
                Lifting Capacity
              </p>
              <p className="text-sm font-bold text-foreground">
                {selectedTractor.spec.liftingCapacityKg} kg
              </p>
            </div>
          )}
          {selectedTractor.spec?.gearboxType && (
            <div className="rounded-xl bg-foreground/5 border border-[var(--border-subtle)] p-3">
              <p className="text-[11px] font-bold text-muted uppercase tracking-wide mb-1">
                Transmission Type
              </p>
              <p className="text-sm font-bold text-foreground">{selectedTractor.spec.gearboxType}</p>
            </div>
          )}
          {selectedTractor.spec?.steeringType && (
            <div className="rounded-xl bg-foreground/5 border border-[var(--border-subtle)] p-3">
              <p className="text-[11px] font-bold text-muted uppercase tracking-wide mb-1">
                Steering Type
              </p>
              <p className="text-sm font-bold text-foreground">{selectedTractor.spec.steeringType}</p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-[var(--border-subtle)]" />

      {/* Manual Fields Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-foreground">
          <Calendar size={14} />
          Fill Manually
        </div>

        {/* Year, Ownership, Hours */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5">
              Year of Manufacture <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              min={1991}
              max={currentYear}
              value={yearOfManufacture}
              onChange={(e) => setYearOfManufacture(parseInt(e.target.value) || currentYear)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-xs font-medium text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5">
              Number of Previous Owners <span className="text-rose-500">*</span>
            </label>
            <select
              value={ownership}
              onChange={(e) => setOwnership(parseInt(e.target.value))}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-xs font-medium text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4+</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5">
              Hours Used (optional)
            </label>
            <input
              type="number"
              min={0}
              step={100}
              value={hoursUsed}
              onChange={(e) => setHoursUsed(parseInt(e.target.value) || 0)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-xs font-medium text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
            />
          </div>
        </div>

        {/* Condition Grades */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-muted">
            Condition Grade <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CONDITION_OPTIONS.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => setConditionGrade(value)}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                  conditionGrade === value
                    ? 'bg-[var(--color-brand-green)] text-white'
                    : 'border border-[var(--border-subtle)] bg-foreground/5 text-foreground hover:border-[var(--color-brand-green)]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tyre & Engine Conditions */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-muted">Tyre Condition</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CONDITION_OPTIONS.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTyreCondition(value)}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                  tyreCondition === value
                    ? 'bg-blue-500 text-white'
                    : 'border border-[var(--border-subtle)] bg-foreground/5 text-foreground hover:border-blue-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Engine Condition Slider */}
        <div>
          <label className="block text-xs font-semibold text-muted mb-2">
            Engine Condition %: <span className="text-[var(--color-brand-green)]">{engineConditionPct}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={engineConditionPct}
            onChange={(e) => setEngineConditionPct(parseInt(e.target.value))}
            className="w-full accent-[var(--color-brand-green)]"
          />
        </div>

        {/* Hydraulics & Body Conditions */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-muted">Hydraulics Condition</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CONDITION_OPTIONS.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => setHydraulicsCondition(value)}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                  hydraulicsCondition === value
                    ? 'bg-purple-500 text-white'
                    : 'border border-[var(--border-subtle)] bg-foreground/5 text-foreground hover:border-purple-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-muted">Body Condition</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CONDITION_OPTIONS.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => setBodyCondition(value)}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                  bodyCondition === value
                    ? 'bg-orange-500 text-white'
                    : 'border border-[var(--border-subtle)] bg-foreground/5 text-foreground hover:border-orange-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--border-subtle)]" />

      {/* Documents & Legal Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-foreground">
          <Wrench size={14} />
          Documents & Legal
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="flex items-center gap-2.5 rounded-lg border border-[var(--border-subtle)] bg-foreground/5 p-3 cursor-pointer hover:bg-foreground/10">
            <input
              type="checkbox"
              checked={rcAvailable}
              onChange={(e) => setRcAvailable(e.target.checked)}
              className="w-4 h-4 rounded accent-[var(--color-brand-green)]"
            />
            <span className="text-xs font-semibold text-foreground">RC Available</span>
          </label>

          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5">
              Insurance Validity (optional)
            </label>
            <input
              type="date"
              value={insuranceValidity}
              onChange={(e) => setInsuranceValidity(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-xs font-medium text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5">
              Loan Clearance Status
            </label>
            <select
              value={loanClearanceStatus}
              onChange={(e) => setLoanClearanceStatus(e.target.value as LoanClearanceStatus)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-xs font-medium text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
            >
              <option value="CLEAR">Clear</option>
              <option value="UNDER_HYPOTHECATION">Under Hypothecation</option>
            </select>
          </div>
        </div>

        {/* Major Repairs Toggle & Textarea */}
        <label className="flex items-center gap-2.5 rounded-lg border border-[var(--border-subtle)] bg-foreground/5 p-3 cursor-pointer hover:bg-foreground/10">
          <input
            type="checkbox"
            checked={hasMajorRepairs}
            onChange={(e) => setHasMajorRepairs(e.target.checked)}
            className="w-4 h-4 rounded accent-[var(--color-brand-green)]"
          />
          <span className="text-xs font-semibold text-foreground">Major Repairs Done?</span>
        </label>
        {hasMajorRepairs && (
          <textarea
            placeholder="Describe the major repairs..."
            value={majorRepairs}
            onChange={(e) => setMajorRepairs(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-xs font-medium text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
          />
        )}
      </div>

      <div className="border-t border-[var(--border-subtle)]" />

      {/* Pricing Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-foreground">
          <IndianRupee size={14} />
          Pricing
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5">
              Asking Price (₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-muted font-bold">₹</span>
              <input
                type="number"
                required
                min={0}
                step={1000}
                placeholder="e.g. 450000"
                value={askingPrice}
                onChange={(e) => setAskingPrice(e.target.value)}
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 pl-8 pr-3.5 py-2.5 text-xs font-medium text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
              />
            </div>
          </div>

          <label className="flex items-center gap-2.5 rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-3 cursor-pointer hover:bg-foreground/10 mt-auto">
            <input
              type="checkbox"
              checked={negotiable}
              onChange={(e) => setNegotiable(e.target.checked)}
              className="w-4 h-4 rounded accent-[var(--color-brand-green)]"
            />
            <span className="text-xs font-semibold text-foreground">Price Negotiable</span>
          </label>

          <label className="flex items-center gap-2.5 rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-3 cursor-pointer hover:bg-foreground/10 mt-auto">
            <input
              type="checkbox"
              checked={financeAvailable}
              onChange={(e) => setFinanceAvailable(e.target.checked)}
              className="w-4 h-4 rounded accent-[var(--color-brand-green)]"
            />
            <span className="text-xs font-semibold text-foreground">Finance Available</span>
          </label>
        </div>
      </div>

      <div className="border-t border-[var(--border-subtle)]" />

      {/* Location Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-foreground">
          <MapPin size={14} />
          Location
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5">
              State <span className="text-rose-500">*</span>
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-xs font-medium text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
            >
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5">
              District <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Pune"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-xs font-medium text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5">
              Village/City (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Hadapsar"
              value={villageCity}
              onChange={(e) => setVillageCity(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-xs font-medium text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5">Pincode (optional)</label>
            <input
              type="text"
              placeholder="e.g. 411028"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-xs font-medium text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Description & Urgency */}
      <div className="space-y-4">
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-xs font-medium text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
        />

        <div>
          <label className="block text-xs font-semibold text-muted mb-2">Urgency</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'No Rush', value: 'NO_RUSH' as UrgencyLevel },
              { label: '30 Days', value: 'THIRTY_DAYS' as UrgencyLevel },
              { label: '15 Days', value: 'FIFTEEN_DAYS' as UrgencyLevel },
            ].map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => setUrgency(value)}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                  urgency === value
                    ? 'bg-amber-500 text-white'
                    : 'border border-[var(--border-subtle)] bg-foreground/5 text-foreground hover:border-amber-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] p-6 max-w-sm shadow-xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-brand-green)]/10">
                <CheckCircle2 size={20} className="text-[var(--color-brand-green)]" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground">
                  {confirmAction === 'draft' ? 'Save as Draft?' : 'Publish Listing?'}
                </h3>
                <p className="text-xs text-muted mt-1">
                  {confirmAction === 'draft'
                    ? 'You can edit this listing later before publishing.'
                    : 'This listing will be live on the marketplace immediately.'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 rounded-lg border border-[var(--border-subtle)] px-4 py-2 text-xs font-bold text-foreground hover:bg-foreground/5"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="flex-1 rounded-lg bg-[var(--color-brand-green)] px-4 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="animate-spin inline mr-1" size={14} /> : ''}
                {confirmAction === 'draft' ? 'Save Draft' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Footer Buttons */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-[var(--border-subtle)] bg-[var(--background)] p-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackClick}
          disabled={submitting}
          className="rounded-lg border border-[var(--border-subtle)] px-4 py-2.5 text-xs font-bold text-foreground hover:bg-foreground/5 disabled:opacity-50"
        >
          Back
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleDraftClick}
            disabled={submitting}
            className="rounded-lg border border-[var(--border-subtle)] px-4 py-2.5 text-xs font-bold text-foreground hover:bg-foreground/5 disabled:opacity-50"
          >
            Save as Draft
          </button>
          <SpatialButton
            type="button"
            onClick={handlePublishClick}
            disabled={submitting}
            className="gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={14} /> Publishing...
              </>
            ) : (
              <>
                <Sparkles size={14} /> Save & Publish
              </>
            )}
          </SpatialButton>
        </div>
      </div>
    </form>
  );
}
