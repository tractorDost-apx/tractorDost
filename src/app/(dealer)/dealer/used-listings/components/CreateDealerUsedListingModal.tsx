'use client';

import React, { useState } from 'react';
import {
  X,
  Tractor,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MapPin,
  FileText,
  Wrench,
  Calendar,
  Layers,
  UploadCloud,
  Loader2,
  Paperclip,
  FileCheck,
  Camera,
  Trash2,
} from 'lucide-react';
import { SpatialButton } from '@/components/ui/spatial-button';
import { usedTractorListingAPI } from '@/lib/api/used-listings';
import { usedTractorDocumentAPI } from '@/lib/api/used-documents';
import type { DocType } from '@/types/models/used-listing';

interface CreateDealerUsedListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  initialData?: {
    brand?: string | null;
    tractorName?: string | null;
    customModel?: string | null;
    hp?: number | null;
  };
}

const POPULAR_BRANDS = [
  'Mahindra',
  'Swaraj',
  'Sonalika',
  'Massey Ferguson',
  'John Deere',
  'New Holland',
  'Powertrac',
  'Farmtrac',
  'Kubota',
  'Eicher',
  'Captain',
  'Preet',
  'Indo Farm',
  'ACE',
];

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

export function CreateDealerUsedListingModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: CreateDealerUsedListingModalProps) {
  const currentYear = new Date().getFullYear();

  // Basic Details
  const [tractorBrand, setTractorBrand] = useState(initialData?.brand || '');
  const [tractorModel, setTractorModel] = useState(
    initialData?.tractorName || initialData?.customModel || ''
  );
  const [yearOfManufacture, setYearOfManufacture] = useState<number>(currentYear - 3);
  const [ownership, setOwnership] = useState<number>(1);
  const [hoursUsed, setHoursUsed] = useState<number>(1200);

  React.useEffect(() => {
    if (isOpen && initialData) {
      if (initialData.brand) setTractorBrand(initialData.brand);
      if (initialData.tractorName || initialData.customModel) {
        setTractorModel(initialData.tractorName || initialData.customModel || '');
      }
    }
  }, [isOpen, initialData]);

  // Pricing
  const [askingPrice, setAskingPrice] = useState<string>('');
  const [negotiable, setNegotiable] = useState<boolean>(true);
  const [financeAvailable, setFinanceAvailable] = useState<boolean>(true);

  // Condition & Self-Inspection (Dealer certified)
  const [conditionGrade, setConditionGrade] = useState<'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'>('GOOD');
  const [tyreCondition, setTyreCondition] = useState<'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'>('GOOD');
  const [engineConditionPct, setEngineConditionPct] = useState<number>(85);
  const [hydraulicsCondition, setHydraulicsCondition] = useState<'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'>('GOOD');
  const [clutchCondition, setClutchCondition] = useState<'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'>('GOOD');
  const [bodyCondition, setBodyCondition] = useState<'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'>('GOOD');

  // Documents & Legal Info
  const [rcAvailable, setRcAvailable] = useState<boolean>(true);
  const [insuranceValidity, setInsuranceValidity] = useState<string>('');
  const [loanClearanceStatus, setLoanClearanceStatus] = useState<'CLEAR' | 'UNDER_HYPOTHECATION'>('CLEAR');

  // Paperwork Document Files
  const [rcDocumentFile, setRcDocumentFile] = useState<File | null>(null);
  const [insuranceDocumentFile, setInsuranceDocumentFile] = useState<File | null>(null);
  const [loanNocDocumentFile, setLoanNocDocumentFile] = useState<File | null>(null);
  const [otherDocumentFile, setOtherDocumentFile] = useState<File | null>(null);

  // Multi-angle Tractor Photos
  const [frontPhoto, setFrontPhoto] = useState<File | null>(null);
  const [rearPhoto, setRearPhoto] = useState<File | null>(null);
  const [leftPhoto, setLeftPhoto] = useState<File | null>(null);
  const [rightPhoto, setRightPhoto] = useState<File | null>(null);
  const [meterPhoto, setMeterPhoto] = useState<File | null>(null);
  const [extraPhotos, setExtraPhotos] = useState<File[]>([]);

  // Location
  const [state, setState] = useState<string>('Maharashtra');
  const [district, setDistrict] = useState<string>('Pune');
  const [villageCity, setVillageCity] = useState<string>('');
  const [pincode, setPincode] = useState<string>('');

  // Description & History
  const [description, setDescription] = useState<string>('');
  const [majorRepairs, setMajorRepairs] = useState<string>('');

  // UI state
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [uploadProgressText, setUploadProgressText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExtraPhotosSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setExtraPhotos((prev) => [...prev, ...filesArray].slice(0, 6));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!tractorBrand.trim()) {
      setError('Please specify or select a Tractor Brand.');
      return;
    }
    if (!tractorModel.trim()) {
      setError('Please enter the Tractor Model name.');
      return;
    }

    const priceNum = parseFloat(askingPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid asking price greater than 0.');
      return;
    }

    if (!state.trim() || !district.trim()) {
      setError('Please enter both state and district for the listing location.');
      return;
    }

    try {
      setSubmitting(true);
      setUploadProgressText('Creating marketplace listing...');

      const payload = {
        tractorBrand: tractorBrand.trim(),
        tractorModel: tractorModel.trim(),
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
        majorRepairs: majorRepairs.trim() || undefined,
      };

      const res = await usedTractorListingAPI.createListing(payload as any);

      if (!res.success || !res.data) {
        setError(res.message || 'Failed to create used tractor listing.');
        setSubmitting(false);
        return;
      }

      const createdListing = res.data;
      const listingId = createdListing.id;

      // Queue of documents and photos to upload
      const uploadQueue: { file: File; docType: DocType; label: string }[] = [];

      // Papers
      if (rcDocumentFile) uploadQueue.push({ file: rcDocumentFile, docType: 'RC_COPY', label: 'RC Document' });
      if (insuranceDocumentFile) uploadQueue.push({ file: insuranceDocumentFile, docType: 'INSURANCE_COPY', label: 'Insurance Policy' });
      if (loanNocDocumentFile) uploadQueue.push({ file: loanNocDocumentFile, docType: 'LOAN_NOC', label: 'Loan NOC' });
      if (otherDocumentFile) uploadQueue.push({ file: otherDocumentFile, docType: 'OTHER_DOCUMENT', label: 'Other Document' });

      // Photos
      if (frontPhoto) uploadQueue.push({ file: frontPhoto, docType: 'FRONT_VIEW', label: 'Front Photo' });
      if (rearPhoto) uploadQueue.push({ file: rearPhoto, docType: 'REAR_VIEW', label: 'Rear Photo' });
      if (leftPhoto) uploadQueue.push({ file: leftPhoto, docType: 'LEFT_VIEW', label: 'Left Side Photo' });
      if (rightPhoto) uploadQueue.push({ file: rightPhoto, docType: 'RIGHT_VIEW', label: 'Right Side Photo' });
      if (meterPhoto) uploadQueue.push({ file: meterPhoto, docType: 'DASHBOARD_VIEW', label: 'Hours Meter Photo' });
      extraPhotos.forEach((file, idx) => {
        uploadQueue.push({ file, docType: 'TRACTOR_IMAGE', label: `Extra Photo ${idx + 1}` });
      });

      if (uploadQueue.length > 0) {
        for (let i = 0; i < uploadQueue.length; i++) {
          const item = uploadQueue[i];
          setUploadProgressText(`Uploading ${item.label} (${i + 1}/${uploadQueue.length})...`);
          try {
            const formData = new FormData();
            formData.append('document', item.file);
            formData.append('listingId', String(listingId));
            formData.append('docType', item.docType);
            await usedTractorDocumentAPI.uploadDocument(formData);
          } catch (uploadErr) {
            console.warn(`Failed to upload ${item.label}:`, uploadErr);
          }
        }
      }

      onSuccess(`Used tractor "${tractorBrand} ${tractorModel}" and documents uploaded & verified successfully!`);
      onClose();
    } catch (err: any) {
      console.error('Error submitting dealer used tractor listing:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to create used tractor listing.');
    } finally {
      setSubmitting(false);
      setUploadProgressText('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative max-h-[80vh] overflow-y-auto w-full max-w-4xl rounded-2xl border border-lime-400/20 bg-[var(--background)] p-6 shadow-2xl md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lime-400/10 text-lime-400">
              <Tractor size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-foreground md:text-2xl">
                  List Used Tractor for Sale
                </h2>
                <span className="flex items-center gap-1 rounded-full border border-lime-400/30 bg-lime-400/10 px-2.5 py-0.5 text-xs font-bold text-lime-400">
                  <ShieldCheck size={12} /> Dealer Direct
                </span>
              </div>
              <p className="text-xs text-muted font-medium md:text-sm">
                Dedicated Used Tractor Marketplace &bull; Auto-verified with Certified Dealer status (No Agent required)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted hover:bg-foreground/5 hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Informational Banner */}
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-lime-400/30 bg-lime-950/20 p-3.5 text-xs text-lime-300">
          <Sparkles className="h-5 w-5 shrink-0 text-lime-400 mt-0.5" />
          <div>
            <span className="font-bold">Instant Dealer Publishing:</span> As an authorized dealer, this used tractor is separate from inventory and will be published live immediately on the marketplace with your uploaded verification documents without waiting for agent inspection.
          </div>
        </div>

        {/* Error notice */}
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-medium text-red-400">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          {/* Section 1: Tractor Information */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-lime-400">
              <Tractor size={16} /> 1. Tractor Model & Details
            </h3>

            {/* Brand Quick Chips */}
            <div>
              <label className="text-xs font-semibold text-muted">Popular Brands</label>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {POPULAR_BRANDS.map((b) => (
                  <button
                    type="button"
                    key={b}
                    onClick={() => setTractorBrand(b)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                      tractorBrand === b
                        ? 'bg-lime-400 text-black shadow-md shadow-lime-400/20'
                        : 'border border-[var(--border-subtle)] bg-foreground/5 text-muted hover:border-[var(--border-brand)]'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">
                  Brand Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahindra"
                  value={tractorBrand}
                  onChange={(e) => setTractorBrand(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-sm font-medium text-foreground focus:border-lime-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">
                  Model Name / Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 575 DI XP Plus"
                  value={tractorModel}
                  onChange={(e) => setTractorModel(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-sm font-medium text-foreground focus:border-lime-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">
                  Year of Manufacture <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1990}
                  max={currentYear}
                  value={yearOfManufacture}
                  onChange={(e) => setYearOfManufacture(parseInt(e.target.value) || currentYear)}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-sm font-medium text-foreground focus:border-lime-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">
                  Ownership (Owners) <span className="text-red-400">*</span>
                </label>
                <select
                  value={ownership}
                  onChange={(e) => setOwnership(parseInt(e.target.value))}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-sm font-medium text-foreground focus:border-lime-400 focus:outline-none"
                >
                  <option value={1}>1st Owner (Single hand)</option>
                  <option value={2}>2nd Owner</option>
                  <option value={3}>3rd Owner</option>
                  <option value={4}>4th+ Owner</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">
                  Hours Used / Meter Run (hrs)
                </label>
                <input
                  type="number"
                  min={0}
                  step={10}
                  placeholder="e.g. 1200"
                  value={hoursUsed}
                  onChange={(e) => setHoursUsed(parseInt(e.target.value) || 0)}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-sm font-medium text-foreground focus:border-lime-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">
                  Overall Condition Grade <span className="text-red-400">*</span>
                </label>
                <select
                  value={conditionGrade}
                  onChange={(e) => setConditionGrade(e.target.value as any)}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-sm font-medium text-foreground focus:border-lime-400 focus:outline-none"
                >
                  <option value="EXCELLENT">Excellent (Like New)</option>
                  <option value="GOOD">Good (Well Maintained)</option>
                  <option value="FAIR">Fair (Needs Minor Work)</option>
                  <option value="POOR">Poor (Requires Overhaul)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Options */}
          <div className="space-y-4 border-t border-[var(--border-subtle)] pt-5">
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-lime-400">
              <IndianRupee size={16} /> 2. Pricing & Commercials
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">
                  Asking Price (₹) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-muted font-bold">₹</span>
                  <input
                    type="number"
                    required
                    min={10000}
                    step={1000}
                    placeholder="e.g. 450000"
                    value={askingPrice}
                    onChange={(e) => setAskingPrice(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 pl-8 pr-3.5 py-2.5 text-sm font-medium text-foreground focus:border-lime-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-3 mt-auto">
                <input
                  type="checkbox"
                  id="negotiable"
                  checked={negotiable}
                  onChange={(e) => setNegotiable(e.target.checked)}
                  className="h-4 w-4 rounded accent-lime-400"
                />
                <label htmlFor="negotiable" className="cursor-pointer text-xs font-semibold text-slate-200">
                  Price Negotiable
                </label>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-3 mt-auto">
                <input
                  type="checkbox"
                  id="financeAvailable"
                  checked={financeAvailable}
                  onChange={(e) => setFinanceAvailable(e.target.checked)}
                  className="h-4 w-4 rounded accent-lime-400"
                />
                <label htmlFor="financeAvailable" className="cursor-pointer text-xs font-semibold text-slate-200">
                  Loan / Finance Available
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Dealer Self-Inspection & Condition */}
          <div className="space-y-4 border-t border-[var(--border-subtle)] pt-5">
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-lime-400">
              <Wrench size={16} /> 3. Dealer Inspection & Condition Assessment
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">
                  Engine Health Score: {engineConditionPct}%
                </label>
                <input
                  type="range"
                  min={30}
                  max={100}
                  step={5}
                  value={engineConditionPct}
                  onChange={(e) => setEngineConditionPct(parseInt(e.target.value))}
                  className="w-full accent-lime-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">Tyre Condition</label>
                <select
                  value={tyreCondition}
                  onChange={(e) => setTyreCondition(e.target.value as any)}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-sm font-medium text-foreground focus:border-lime-400 focus:outline-none"
                >
                  <option value="EXCELLENT">Excellent (75-100% Grip)</option>
                  <option value="GOOD">Good (50-75% Grip)</option>
                  <option value="FAIR">Fair (25-50% Grip)</option>
                  <option value="POOR">Poor (Needs Replacement)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">Hydraulics Condition</label>
                <select
                  value={hydraulicsCondition}
                  onChange={(e) => setHydraulicsCondition(e.target.value as any)}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-sm font-medium text-foreground focus:border-lime-400 focus:outline-none"
                >
                  <option value="EXCELLENT">Excellent (Smooth lifting)</option>
                  <option value="GOOD">Good (Working fine)</option>
                  <option value="FAIR">Fair (Minor delay)</option>
                  <option value="POOR">Poor (Leakage / weak)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">Clutch & Transmission</label>
                <select
                  value={clutchCondition}
                  onChange={(e) => setClutchCondition(e.target.value as any)}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-sm font-medium text-foreground focus:border-lime-400 focus:outline-none"
                >
                  <option value="EXCELLENT">Excellent (Crisp gear shift)</option>
                  <option value="GOOD">Good (Normal play)</option>
                  <option value="FAIR">Fair (Slight slippage)</option>
                  <option value="POOR">Poor (Heavy wear)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">Body & Paint Condition</label>
                <select
                  value={bodyCondition}
                  onChange={(e) => setBodyCondition(e.target.value as any)}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-sm font-medium text-foreground focus:border-lime-400 focus:outline-none"
                >
                  <option value="EXCELLENT">Original / Spotless Paint</option>
                  <option value="GOOD">Good / Minor Scratches</option>
                  <option value="FAIR">Fair / Repainted Parts</option>
                  <option value="POOR">Rust / Dented</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Documents & Legal Clearance (WITH DIRECT FILE UPLOAD FIELDS) */}
          <div className="space-y-4 border-t border-[var(--border-subtle)] pt-5">
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-lime-400">
              <FileText size={16} /> 4. Papers & Registration (Upload Documents)
            </h3>

            {/* Statuses and Dates */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-3">
                <input
                  type="checkbox"
                  id="rcAvailable"
                  checked={rcAvailable}
                  onChange={(e) => setRcAvailable(e.target.checked)}
                  className="h-4 w-4 rounded accent-lime-400"
                />
                <label htmlFor="rcAvailable" className="cursor-pointer text-xs font-semibold text-slate-200">
                  Original RC Book Available
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">
                  Insurance Validity Date
                </label>
                <input
                  type="date"
                  value={insuranceValidity}
                  onChange={(e) => setInsuranceValidity(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-sm font-medium text-foreground focus:border-lime-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">
                  Loan / Hypothecation Status
                </label>
                <select
                  value={loanClearanceStatus}
                  onChange={(e) => setLoanClearanceStatus(e.target.value as any)}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-sm font-medium text-foreground focus:border-lime-400 focus:outline-none"
                >
                  <option value="CLEAR">Clear (No Loan / NOC Available)</option>
                  <option value="UNDER_HYPOTHECATION">Under Hypothecation</option>
                </select>
              </div>
            </div>

            {/* Document File Upload Fields */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* RC Copy Upload */}
              <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <FileCheck size={14} className="text-lime-400" /> Registration Certificate (RC Copy)
                  </label>
                  {rcDocumentFile && (
                    <button
                      type="button"
                      onClick={() => setRcDocumentFile(null)}
                      className="text-red-400 hover:text-red-300 text-[11px] font-bold"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-muted mb-2">Upload front/back scan or photo of RC book (PDF/PNG/JPEG)</p>
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={(e) => setRcDocumentFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-muted file:mr-2 file:rounded-lg file:border-0 file:bg-lime-400/10 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-lime-400 hover:file:bg-lime-400/20"
                />
                {rcDocumentFile && (
                  <p className="mt-1.5 text-[11px] text-emerald-400 font-semibold truncate flex items-center gap-1">
                    <CheckCircle2 size={12} /> {rcDocumentFile.name} ({(rcDocumentFile.size / 1024).toFixed(0)} KB)
                  </p>
                )}
              </div>

              {/* Insurance Policy Upload */}
              <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Paperclip size={14} className="text-lime-400" /> Insurance Policy Copy
                  </label>
                  {insuranceDocumentFile && (
                    <button
                      type="button"
                      onClick={() => setInsuranceDocumentFile(null)}
                      className="text-red-400 hover:text-red-300 text-[11px] font-bold"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-muted mb-2">Upload active insurance policy paper (PDF/PNG/JPEG)</p>
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={(e) => setInsuranceDocumentFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-muted file:mr-2 file:rounded-lg file:border-0 file:bg-lime-400/10 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-lime-400 hover:file:bg-lime-400/20"
                />
                {insuranceDocumentFile && (
                  <p className="mt-1.5 text-[11px] text-emerald-400 font-semibold truncate flex items-center gap-1">
                    <CheckCircle2 size={12} /> {insuranceDocumentFile.name} ({(insuranceDocumentFile.size / 1024).toFixed(0)} KB)
                  </p>
                )}
              </div>

              {/* Loan NOC Upload */}
              <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <FileText size={14} className="text-purple-400" /> Bank Loan NOC / Clearance Letter
                  </label>
                  {loanNocDocumentFile && (
                    <button
                      type="button"
                      onClick={() => setLoanNocDocumentFile(null)}
                      className="text-red-400 hover:text-red-300 text-[11px] font-bold"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-muted mb-2">Upload Bank NOC or hypothecation termination certificate</p>
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={(e) => setLoanNocDocumentFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-muted file:mr-2 file:rounded-lg file:border-0 file:bg-purple-500/10 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-purple-300 hover:file:bg-purple-500/20"
                />
                {loanNocDocumentFile && (
                  <p className="mt-1.5 text-[11px] text-emerald-400 font-semibold truncate flex items-center gap-1">
                    <CheckCircle2 size={12} /> {loanNocDocumentFile.name} ({(loanNocDocumentFile.size / 1024).toFixed(0)} KB)
                  </p>
                )}
              </div>

              {/* Other Document Upload */}
              <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <FileText size={14} className="text-muted" /> Other Verification Paperwork
                  </label>
                  {otherDocumentFile && (
                    <button
                      type="button"
                      onClick={() => setOtherDocumentFile(null)}
                      className="text-red-400 hover:text-red-300 text-[11px] font-bold"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-muted mb-2">Optional: Tax receipt, fitness certificate, or chassis invoice</p>
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={(e) => setOtherDocumentFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-muted file:mr-2 file:rounded-lg file:border-0 file:bg-foreground/10 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-muted hover:file:bg-slate-700"
                />
                {otherDocumentFile && (
                  <p className="mt-1.5 text-[11px] text-emerald-400 font-semibold truncate flex items-center gap-1">
                    <CheckCircle2 size={12} /> {otherDocumentFile.name} ({(otherDocumentFile.size / 1024).toFixed(0)} KB)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 5: Location */}
          <div className="space-y-4 border-t border-[var(--border-subtle)] pt-5">
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-lime-400">
              <MapPin size={16} /> 5. Location & Dealership Yard
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">
                  State <span className="text-red-400">*</span>
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-sm font-medium text-foreground focus:border-lime-400 focus:outline-none"
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
                  District / City <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pune"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-sm font-medium text-foreground focus:border-lime-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">
                  Tehsil / Village / Area
                </label>
                <input
                  type="text"
                  placeholder="e.g. Haveli / Hadapsar"
                  value={villageCity}
                  onChange={(e) => setVillageCity(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-sm font-medium text-foreground focus:border-lime-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">Pincode</label>
                <input
                  type="text"
                  placeholder="e.g. 411028"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-sm font-medium text-foreground focus:border-lime-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Photos & Description */}
          <div className="space-y-4 border-t border-[var(--border-subtle)] pt-5">
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-lime-400">
              <Camera size={16} /> 6. Tractor Photos (Multi-Angle Marketplace Shots)
            </h3>

            {/* Multi-angle specific slots */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {/* Front View */}
              <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-3">
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  1. Front View Photo
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => setFrontPhoto(e.target.files?.[0] || null)}
                  className="w-full text-xs text-muted file:mr-2 file:rounded-lg file:border-0 file:bg-lime-400/10 file:px-2.5 file:py-1 file:text-xs file:font-bold file:text-lime-400 hover:file:bg-lime-400/20"
                />
                {frontPhoto && (
                  <span className="text-[10px] text-emerald-400 mt-1 block truncate">
                    Selected: {frontPhoto.name}
                  </span>
                )}
              </div>

              {/* Rear View */}
              <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-3">
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  2. Rear View Photo
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => setRearPhoto(e.target.files?.[0] || null)}
                  className="w-full text-xs text-muted file:mr-2 file:rounded-lg file:border-0 file:bg-lime-400/10 file:px-2.5 file:py-1 file:text-xs file:font-bold file:text-lime-400 hover:file:bg-lime-400/20"
                />
                {rearPhoto && (
                  <span className="text-[10px] text-emerald-400 mt-1 block truncate">
                    Selected: {rearPhoto.name}
                  </span>
                )}
              </div>

              {/* Left Side */}
              <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-3">
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  3. Left Side Photo
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => setLeftPhoto(e.target.files?.[0] || null)}
                  className="w-full text-xs text-muted file:mr-2 file:rounded-lg file:border-0 file:bg-lime-400/10 file:px-2.5 file:py-1 file:text-xs file:font-bold file:text-lime-400 hover:file:bg-lime-400/20"
                />
                {leftPhoto && (
                  <span className="text-[10px] text-emerald-400 mt-1 block truncate">
                    Selected: {leftPhoto.name}
                  </span>
                )}
              </div>

              {/* Right Side */}
              <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-3">
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  4. Right Side Photo
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => setRightPhoto(e.target.files?.[0] || null)}
                  className="w-full text-xs text-muted file:mr-2 file:rounded-lg file:border-0 file:bg-lime-400/10 file:px-2.5 file:py-1 file:text-xs file:font-bold file:text-lime-400 hover:file:bg-lime-400/20"
                />
                {rightPhoto && (
                  <span className="text-[10px] text-emerald-400 mt-1 block truncate">
                    Selected: {rightPhoto.name}
                  </span>
                )}
              </div>

              {/* Hours Meter */}
              <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-3">
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  5. Hours Meter / Dashboard
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => setMeterPhoto(e.target.files?.[0] || null)}
                  className="w-full text-xs text-muted file:mr-2 file:rounded-lg file:border-0 file:bg-lime-400/10 file:px-2.5 file:py-1 file:text-xs file:font-bold file:text-lime-400 hover:file:bg-lime-400/20"
                />
                {meterPhoto && (
                  <span className="text-[10px] text-emerald-400 mt-1 block truncate">
                    Selected: {meterPhoto.name}
                  </span>
                )}
              </div>

              {/* Additional Gallery Photos */}
              <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-3">
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  6. Extra Photos ({extraPhotos.length})
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png"
                  onChange={handleExtraPhotosSelect}
                  className="w-full text-xs text-muted file:mr-2 file:rounded-lg file:border-0 file:bg-lime-400/10 file:px-2.5 file:py-1 file:text-xs file:font-bold file:text-lime-400 hover:file:bg-lime-400/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">
                  Dealer Description / Highlights
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Single owner driven, serviced on time at authorized showroom, new rear tyres fitted, clean papers."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-sm font-medium text-foreground focus:border-lime-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">
                  Major Repairs / Replacement History
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Engine oil changed last month, new clutch plates installed at 1000 hrs."
                  value={majorRepairs}
                  onChange={(e) => setMajorRepairs(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2.5 text-sm font-medium text-foreground focus:border-lime-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-5">
            <span className="text-xs text-lime-400 font-semibold animate-pulse">
              {uploadProgressText}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-5 py-2.5 text-sm font-bold text-muted hover:bg-foreground/10 transition-colors"
              >
                Cancel
              </button>
              <SpatialButton
                type="submit"
                disabled={submitting}
                variant="primary"
                className="gap-2 px-6 shadow-lg shadow-lime-400/20"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> {uploadProgressText || 'Publishing Listing...'}
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Publish Used Tractor
                  </>
                )}
              </SpatialButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
