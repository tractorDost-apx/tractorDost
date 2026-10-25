'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usedTractorListingAPI } from '@/lib/api/used-listings';
import { usedTractorDocumentAPI } from '@/lib/api/used-documents';
import { ConditionGrade, UrgencyLevel } from '@/lib/api/usedTractors';
import type { CreateListingInput } from '@/types/models/used-listing';
import { brandAPI } from '@/lib/api/brands';
import { useAuth } from '@/store/AuthContext';
import { INDIAN_STATES, STATE_DISTRICTS } from '@/lib/constants/states-districts';
import { TractorLoader } from '@/components/ui/TractorLoader';
import {
  Tractor,
  MapPin,
  Wrench,
  IndianRupee,
  FileText,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  UploadCloud,
  ShieldCheck,
  AlertCircle,
  Image as ImageIcon,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';

const STEPS = [
  { id: 1, title: 'Basics & Location', icon: <Tractor size={20} /> },
  { id: 2, title: 'Condition Details', icon: <Wrench size={20} /> },
  { id: 3, title: 'Pricing & Docs', icon: <IndianRupee size={20} /> },
  { id: 4, title: 'Description & Photos', icon: <FileText size={20} /> },
];

function SellUsedTractorForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const { isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const [tractorPhotos, setTractorPhotos] = useState<File[]>([]);

  // Form Data
  const [formData, setFormData] = useState<CreateListingInput>({
    tractorBrand: '',
    tractorModel: '',
    yearOfManufacture: new Date().getFullYear(),
    hoursUsed: 0,
    ownership: 1,
    state: '',
    district: '',
    villageCity: '',

    conditionGrade: ConditionGrade.GOOD,
    tyreCondition: ConditionGrade.GOOD,
    engineConditionPct: 90,
    hydraulicsCondition: ConditionGrade.GOOD,
    bodyCondition: ConditionGrade.GOOD,

    askingPrice: 0,
    negotiable: true,
    financeAvailable: false,
    rcAvailable: true,
    loanClearanceStatus: 'CLEAR',
    urgency: UrgencyLevel.NO_RUSH,

    description: '',
    majorRepairs: '',
  });

  const [brands, setBrands] = useState<any[]>([]);

  useEffect(() => {
    brandAPI.getAllBrands().then((res) => {
      if (res.success && res.data && Array.isArray(res.data.data)) {
        setBrands(res.data.data);
      }
    });
  }, []);

  useEffect(() => {
    const brand = searchParams.get('brand');
    const model = searchParams.get('model');
    const year = searchParams.get('year');
    const price = searchParams.get('price');

    if (brand || model || year || price) {
      setFormData((prev) => ({
        ...prev,
        ...(brand ? { tractorBrand: brand } : {}),
        ...(model ? { tractorModel: model } : {}),
        ...(year && !isNaN(Number(year)) ? { yearOfManufacture: Number(year) } : {}),
        ...(price && !isNaN(Number(price)) ? { askingPrice: Number(price) } : {}),
      }));
    }
  }, [searchParams]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    let parsedValue: any = value;

    if (type === 'number' || type === 'range' || name === 'ownership') {
      parsedValue = Number(value);
    } else if (type === 'checkbox') {
      parsedValue = (e.target as HTMLInputElement).checked;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  const validateStep = (step: number): string | null => {
    if (step === 1) {
      if (!formData.tractorBrand?.trim()) {
        return 'Please select a tractor brand.';
      }
      if (!formData.tractorModel?.trim()) {
        return 'Please enter the tractor model.';
      }
      const currentYear = new Date().getFullYear();
      if (
        !formData.yearOfManufacture ||
        formData.yearOfManufacture < 1980 ||
        formData.yearOfManufacture > currentYear
      ) {
        return `Please enter a valid Year of Manufacture (1980 - ${currentYear}).`;
      }
      if (
        formData.hoursUsed === undefined ||
        formData.hoursUsed === null ||
        isNaN(Number(formData.hoursUsed)) ||
        Number(formData.hoursUsed) < 0
      ) {
        return 'Please enter a valid number of hours used (0 or more).';
      }
      if (
        formData.ownership === undefined ||
        formData.ownership === null ||
        formData.ownership < 1
      ) {
        return 'Please select ownership details.';
      }
      if (!formData.state?.trim()) {
        return 'Please enter the state.';
      }
      if (!formData.district?.trim()) {
        return 'Please enter the district.';
      }
      if (!formData.villageCity?.trim()) {
        return 'Please enter the village/city.';
      }
    }

    if (step === 2) {
      if (!formData.conditionGrade) {
        return 'Please select the overall condition grade.';
      }
      if (
        formData.engineConditionPct === undefined ||
        formData.engineConditionPct === null ||
        isNaN(Number(formData.engineConditionPct)) ||
        Number(formData.engineConditionPct) < 10 ||
        Number(formData.engineConditionPct) > 100
      ) {
        return 'Please select a valid engine condition percentage (10% - 100%).';
      }
      if (!formData.tyreCondition) {
        return 'Please select the tyre condition.';
      }
      if (!formData.hydraulicsCondition) {
        return 'Please select the hydraulics condition.';
      }
      if (!formData.bodyCondition) {
        return 'Please select the body/paint condition.';
      }
    }

    if (step === 3) {
      if (
        formData.askingPrice === undefined ||
        formData.askingPrice === null ||
        isNaN(Number(formData.askingPrice)) ||
        Number(formData.askingPrice) < 10000
      ) {
        return 'Please enter a valid asking price (minimum ₹10,000).';
      }
      if (!formData.loanClearanceStatus) {
        return 'Please select the loan clearance status.';
      }
      if (!formData.urgency) {
        return 'Please select the selling urgency level.';
      }
    }

    if (step === 4) {
      if (!formData.description?.trim()) {
        return 'Please enter a description for your tractor.';
      }
      if (tractorPhotos.length === 0) {
        return 'Please upload at least one photo of your tractor.';
      }
    }

    return null;
  };

  const handleNext = () => {
    setError('');

    const validationError = validateStep(currentStep);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (currentStep < 4) setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setError('');
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (currentStep < 4) {
      handleNext();
      return;
    }

    // Strict validation across all steps before final submission
    for (let step = 1; step <= 4; step++) {
      const validationError = validateStep(step);
      if (validationError) {
        setError(validationError);
        setCurrentStep(step);
        return;
      }
    }

    if (!isAuthenticated) {
      setError('You must be logged in to submit a listing. Please go to the login page first.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await usedTractorListingAPI.createListing(formData);
      if (res.success && res.data) {
        if (tractorPhotos.length > 0) {
          try {
            for (let i = 0; i < tractorPhotos.length; i++) {
              const photoData = new FormData();
              photoData.append('listingId', String(res.data.id));
              photoData.append('docType', 'TRACTOR_IMAGE');
              photoData.append('document', tractorPhotos[i]);
              await usedTractorDocumentAPI.uploadDocument(photoData);
            }
          } catch (err) {
            console.error('Photo upload failed:', err);
          }
        }

        setIsSuccess(true);
      } else {
        console.error('Submission failed:', res);
        setError(res.message || 'Failed to submit listing. Please try again.');
      }
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center px-4 pt-24 pb-16">
        <div className="bg-foreground/5 relative w-full max-w-md overflow-hidden rounded-3xl border border-[var(--border-subtle)] p-10 text-center shadow-xl">
          <div className="absolute top-0 left-0 h-2 w-full bg-[var(--color-brand-green)]"></div>

          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
            <CheckCircle2 size={48} />
          </div>

          <h1 className="mb-4 text-3xl font-black">Listing Submitted!</h1>
          <p className="text-muted mb-8 font-medium">
            Your tractor has been successfully submitted for review. Our team will verify the
            details and activate your listing within 24 hours.
          </p>
          <p className="text-muted -mt-4 mb-8 text-sm">
            Listing details can no longer be changed. You can still add photos and papers, or switch
            the listing off, from My Listings.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/dashboard/my-listings"
              className="rounded-xl bg-[var(--color-brand-green)] px-6 py-4 font-black text-white shadow-[var(--color-brand-green)]/20 shadow-lg transition-transform hover:-translate-y-1"
            >
              Go to My Listings
            </Link>
            <Link
              href="/used-tractors"
              className="bg-foreground/10 text-foreground hover:bg-foreground/20 rounded-xl px-6 py-4 font-black transition-colors"
            >
              View All Used Tractors
            </Link>
            <button
              onClick={() => {
                setIsSuccess(false);
                setCurrentStep(1);
                setFormData({
                  ...formData,
                  tractorModel: '',
                  hoursUsed: 0,
                  askingPrice: 0,
                  description: '',
                });
              }}
              className="bg-foreground/10 text-foreground hover:bg-foreground/20 rounded-xl px-6 py-4 font-black transition-colors"
            >
              List Another Tractor
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="mb-4 text-4xl font-black tracking-tight uppercase md:text-5xl">
            Sell Your <span className="text-[var(--color-brand-green)]">Tractor</span>
          </h1>
          <p className="text-muted mx-auto max-w-2xl font-medium">
            Get the best price for your used tractor. Fill in the details below to list it on
            Tractor Dost, India's largest tractor marketplace.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="relative mb-12">
          <div className="bg-foreground/10 absolute top-1/2 left-0 z-0 h-1 w-full -translate-y-1/2 rounded-full"></div>
          <div
            className="absolute top-1/2 left-0 z-0 h-1 -translate-y-1/2 rounded-full bg-[var(--color-brand-green)] transition-all duration-500 ease-out"
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
          ></div>

          <div className="relative z-10 flex justify-between">
            {STEPS.map((step) => (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full font-black shadow-lg transition-colors duration-300 ${
                    currentStep >= step.id
                      ? 'bg-[var(--color-brand-green)] text-white shadow-[var(--color-brand-green)]/20'
                      : 'bg-background text-muted border-2 border-[var(--border-subtle)]'
                  }`}
                >
                  {currentStep > step.id ? <CheckCircle2 size={24} /> : step.icon}
                </div>
                <div className="mt-3 hidden text-xs font-bold tracking-wider uppercase sm:block">
                  <span
                    className={
                      currentStep >= step.id ? 'text-[var(--color-brand-green)]' : 'text-muted'
                    }
                  >
                    {step.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-foreground/5 relative overflow-hidden rounded-[2rem] border border-[var(--border-subtle)] p-6 shadow-2xl md:p-10">
          {/* Decorative element */}
          <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full bg-[var(--color-brand-green)] opacity-5 blur-[100px]"></div>

          <form onSubmit={handleSubmit} className="relative z-10">
            {/* STEP 1: BASICS */}
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-8 duration-500">
                <div className="mb-6 flex items-center gap-3 border-b border-[var(--border-subtle)] pb-4">
                  <Tractor className="text-[var(--color-brand-green)]" size={28} />
                  <h2 className="text-2xl font-black uppercase">Tractor Details</h2>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="text-muted mb-2 block text-xs font-black tracking-widest uppercase">
                      Brand *
                    </label>
                    <select
                      name="tractorBrand"
                      required
                      value={formData.tractorBrand}
                      onChange={handleChange}
                      className="bg-background text-foreground w-full appearance-none rounded-2xl border border-[var(--border-subtle)] px-5 py-4 text-sm font-bold transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--color-brand-green)]"
                    >
                      <option value="">Select Brand</option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-muted mb-2 block text-xs font-black tracking-widest uppercase">
                      Model *
                    </label>
                    <input
                      type="text"
                      name="tractorModel"
                      required
                      placeholder="e.g. 575 DI XP Plus"
                      value={formData.tractorModel}
                      onChange={handleChange}
                      className="bg-background text-foreground w-full rounded-2xl border border-[var(--border-subtle)] px-5 py-4 text-sm font-bold transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--color-brand-green)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div>
                    <label className="text-muted mb-2 block text-xs font-black tracking-widest uppercase">
                      Year of Mfg *
                    </label>
                    <input
                      type="number"
                      name="yearOfManufacture"
                      required
                      min={1980}
                      max={new Date().getFullYear()}
                      value={formData.yearOfManufacture}
                      onChange={handleChange}
                      className="bg-background text-foreground w-full rounded-2xl border border-[var(--border-subtle)] px-5 py-4 text-sm font-bold transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--color-brand-green)]"
                    />
                  </div>
                  <div>
                    <label className="text-muted mb-2 block text-xs font-black tracking-widest uppercase">
                      Hours Used *
                    </label>
                    <input
                      type="number"
                      name="hoursUsed"
                      required
                      min={0}
                      placeholder="e.g. 1500"
                      value={formData.hoursUsed || ''}
                      onChange={handleChange}
                      className="bg-background text-foreground w-full rounded-2xl border border-[var(--border-subtle)] px-5 py-4 text-sm font-bold transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--color-brand-green)]"
                    />
                  </div>
                  <div>
                    <label className="text-muted mb-2 block text-xs font-black tracking-widest uppercase">
                      Ownership *
                    </label>
                    <select
                      name="ownership"
                      required
                      value={formData.ownership}
                      onChange={handleChange}
                      className="bg-background text-foreground w-full appearance-none rounded-2xl border border-[var(--border-subtle)] px-5 py-4 text-sm font-bold transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--color-brand-green)]"
                    >
                      <option value={1}>1st Owner</option>
                      <option value={2}>2nd Owner</option>
                      <option value={3}>3rd Owner</option>
                      <option value={4}>4th Owner or more</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="mb-6 flex items-center gap-3 border-b border-[var(--border-subtle)] pb-4">
                    <MapPin className="text-[var(--color-brand-green)]" size={28} />
                    <h2 className="text-2xl font-black uppercase">Location</h2>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div>
                      <label className="text-muted mb-2 block text-xs font-black tracking-widest uppercase">
                        State *
                      </label>
                      <select
                        name="state"
                        required
                        value={formData.state}
                        onChange={(e) => {
                          handleChange(e);
                          setFormData((prev) => ({ ...prev, district: '' }));
                        }}
                        className="bg-background text-foreground w-full appearance-none rounded-2xl border border-[var(--border-subtle)] px-5 py-4 text-sm font-bold transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--color-brand-green)]"
                      >
                        <option value="">Select State</option>
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-muted mb-2 block text-xs font-black tracking-widest uppercase">
                        District *
                      </label>
                      {formData.state && STATE_DISTRICTS[formData.state] ? (
                        <select
                          name="district"
                          required
                          value={formData.district}
                          onChange={handleChange}
                          className="bg-background text-foreground w-full appearance-none rounded-2xl border border-[var(--border-subtle)] px-5 py-4 text-sm font-bold transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--color-brand-green)]"
                        >
                          <option value="">Select District</option>
                          {STATE_DISTRICTS[formData.state].map((dist) => (
                            <option key={dist} value={dist}>
                              {dist}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          name="district"
                          required
                          placeholder="e.g. Pune"
                          value={formData.district}
                          onChange={handleChange}
                          className="bg-background text-foreground w-full rounded-2xl border border-[var(--border-subtle)] px-5 py-4 text-sm font-bold transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--color-brand-green)]"
                        />
                      )}
                    </div>
                    <div>
                      <label className="text-muted mb-2 block text-xs font-black tracking-widest uppercase">
                        Village/City *
                      </label>
                      <input
                        type="text"
                        name="villageCity"
                        required
                        placeholder="e.g. Baramati"
                        value={formData.villageCity || ''}
                        onChange={handleChange}
                        className="bg-background text-foreground w-full rounded-2xl border border-[var(--border-subtle)] px-5 py-4 text-sm font-bold transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--color-brand-green)]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: CONDITION */}
            {currentStep === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-8 duration-500">
                <div className="mb-6 flex items-center gap-3 border-b border-[var(--border-subtle)] pb-4">
                  <Wrench className="text-[var(--color-brand-green)]" size={28} />
                  <h2 className="text-2xl font-black uppercase">Detailed Condition</h2>
                </div>

                <div className="bg-background mb-8 rounded-2xl border border-[var(--border-subtle)] p-6">
                  <label className="mb-4 block flex items-center justify-between text-sm font-black tracking-widest uppercase">
                    <span>Engine Condition</span>
                    <span className="text-2xl text-[var(--color-brand-green)]">
                      {formData.engineConditionPct}%
                    </span>
                  </label>
                  <input
                    type="range"
                    name="engineConditionPct"
                    min="10"
                    max="100"
                    step="5"
                    value={formData.engineConditionPct}
                    onChange={handleChange}
                    className="bg-foreground/10 h-2 w-full cursor-pointer appearance-none rounded-lg accent-[var(--color-brand-green)]"
                  />
                  <div className="text-muted mt-2 flex justify-between text-xs font-bold tracking-wider uppercase">
                    <span>Needs Work</span>
                    <span>Like New</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="text-muted mb-2 block text-xs font-black tracking-widest uppercase">
                      Overall Condition *
                    </label>
                    <select
                      name="conditionGrade"
                      value={formData.conditionGrade}
                      onChange={handleChange}
                      className="bg-background text-foreground w-full appearance-none rounded-2xl border border-[var(--border-subtle)] px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]"
                    >
                      {Object.values(ConditionGrade).map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-muted mb-2 block text-xs font-black tracking-widest uppercase">
                      Tyres Condition
                    </label>
                    <select
                      name="tyreCondition"
                      value={formData.tyreCondition}
                      onChange={handleChange}
                      className="bg-background text-foreground w-full appearance-none rounded-2xl border border-[var(--border-subtle)] px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]"
                    >
                      {Object.values(ConditionGrade).map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-muted mb-2 block text-xs font-black tracking-widest uppercase">
                      Hydraulics
                    </label>
                    <select
                      name="hydraulicsCondition"
                      value={formData.hydraulicsCondition}
                      onChange={handleChange}
                      className="bg-background text-foreground w-full appearance-none rounded-2xl border border-[var(--border-subtle)] px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]"
                    >
                      {Object.values(ConditionGrade).map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-muted mb-2 block text-xs font-black tracking-widest uppercase">
                      Body / Paint
                    </label>
                    <select
                      name="bodyCondition"
                      value={formData.bodyCondition}
                      onChange={handleChange}
                      className="bg-background text-foreground w-full appearance-none rounded-2xl border border-[var(--border-subtle)] px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]"
                    >
                      {Object.values(ConditionGrade).map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: PRICING */}
            {currentStep === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-8 duration-500">
                <div className="mb-6 flex items-center gap-3 border-b border-[var(--border-subtle)] pb-4">
                  <IndianRupee className="text-[var(--color-brand-green)]" size={28} />
                  <h2 className="text-2xl font-black uppercase">Pricing & Docs</h2>
                </div>

                <div className="bg-background mb-8 rounded-2xl border border-[var(--color-brand-green)]/20 p-6 shadow-[var(--color-brand-green)]/5 shadow-lg">
                  <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
                    <div>
                      <label className="text-muted mb-2 block text-xs font-black tracking-widest uppercase">
                        Asking Price (₹) *
                      </label>
                      <div className="relative">
                        <IndianRupee
                          className="text-muted absolute top-1/2 left-5 -translate-y-1/2"
                          size={20}
                        />
                        <input
                          type="number"
                          name="askingPrice"
                          required
                          min={10000}
                          placeholder="e.g. 450000"
                          value={formData.askingPrice || ''}
                          onChange={handleChange}
                          className="bg-foreground/5 w-full rounded-2xl border border-transparent py-5 pr-5 pl-12 text-2xl font-black text-[var(--color-brand-green)] transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--color-brand-green)]"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      <label className="group flex cursor-pointer items-center gap-4">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            name="negotiable"
                            checked={formData.negotiable}
                            onChange={handleChange}
                            className="bg-background peer h-6 w-6 rounded-md border-gray-300 text-[var(--color-brand-green)] focus:ring-[var(--color-brand-green)]"
                          />
                        </div>
                        <span className="text-lg font-black transition-colors group-hover:text-[var(--color-brand-green)]">
                          Price is Negotiable
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="text-muted mb-4 border-b border-[var(--border-subtle)] pb-2 text-sm font-black tracking-widest uppercase">
                      Documents
                    </h3>

                    <label className="bg-background flex cursor-pointer items-center gap-4 rounded-2xl border border-[var(--border-subtle)] p-4 transition-colors hover:border-[var(--color-brand-green)]">
                      <input
                        type="checkbox"
                        name="rcAvailable"
                        checked={formData.rcAvailable}
                        onChange={handleChange}
                        className="h-5 w-5 rounded border-gray-300 text-[var(--color-brand-green)] focus:ring-[var(--color-brand-green)]"
                      />
                      <span className="font-bold">RC Book Available</span>
                    </label>

                    <div>
                      <label className="text-muted mb-2 block text-xs font-black tracking-widest uppercase">
                        Loan Clearance
                      </label>
                      <select
                        name="loanClearanceStatus"
                        value={formData.loanClearanceStatus}
                        onChange={handleChange}
                        className="bg-background text-foreground w-full appearance-none rounded-2xl border border-[var(--border-subtle)] px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]"
                      >
                        <option value="CLEAR">Loan Cleared (NOC Available)</option>
                        <option value="UNDER_HYPOTHECATION">
                          Active Loan (Under Hypothecation)
                        </option>
                        <option value="NO_LOAN">Never Taken Loan</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-muted mb-4 border-b border-[var(--border-subtle)] pb-2 text-sm font-black tracking-widest uppercase">
                      Sales Info
                    </h3>

                    <label className="bg-background flex cursor-pointer items-center gap-4 rounded-2xl border border-[var(--border-subtle)] p-4 transition-colors hover:border-[var(--color-brand-green)]">
                      <input
                        type="checkbox"
                        name="financeAvailable"
                        checked={formData.financeAvailable}
                        onChange={handleChange}
                        className="h-5 w-5 rounded border-gray-300 text-[var(--color-brand-green)] focus:ring-[var(--color-brand-green)]"
                      />
                      <span className="flex items-center gap-2 font-bold">
                        <ShieldCheck className="text-blue-500" size={18} />
                        Can Arrange Finance for Buyer
                      </span>
                    </label>

                    <div>
                      <label className="text-muted mb-2 block text-xs font-black tracking-widest uppercase">
                        How Urgently do you want to sell?
                      </label>
                      <select
                        name="urgency"
                        value={formData.urgency}
                        onChange={handleChange}
                        className="bg-background text-foreground w-full appearance-none rounded-2xl border border-[var(--border-subtle)] px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]"
                      >
                        <option value={UrgencyLevel.NO_RUSH}>
                          No Rush (Whenever I get a good price)
                        </option>
                        <option value={UrgencyLevel.THIRTY_DAYS}>Within 30 Days</option>
                        <option value={UrgencyLevel.FIFTEEN_DAYS}>Urgent (Within 15 Days)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: DESCRIPTION & PHOTOS */}
            {currentStep === 4 && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-8 duration-500">
                <div className="mb-6 flex items-center gap-3 border-b border-[var(--border-subtle)] pb-4">
                  <FileText className="text-[var(--color-brand-green)]" size={28} />
                  <h2 className="text-2xl font-black uppercase">Final Details</h2>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="text-muted mb-2 block text-xs font-black tracking-widest uppercase">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        rows={4}
                        placeholder="Tell buyers why they should buy your tractor... e.g., 'Single hand driven, mostly used for light trolley work. Company serviced.'"
                        value={formData.description || ''}
                        onChange={handleChange}
                        className="bg-background text-foreground w-full resize-none rounded-2xl border border-[var(--border-subtle)] px-5 py-4 text-sm font-bold transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--color-brand-green)]"
                      />
                    </div>

                    <div>
                      <label className="text-muted mb-2 block text-xs font-black tracking-widest uppercase">
                        Major Repairs (If Any)
                      </label>
                      <textarea
                        name="majorRepairs"
                        rows={2}
                        placeholder="e.g., Engine overhauled at 4000 hours, Clutch plate changed recently."
                        value={formData.majorRepairs || ''}
                        onChange={handleChange}
                        className="bg-background text-foreground w-full resize-none rounded-2xl border border-[var(--border-subtle)] px-5 py-4 text-sm font-bold transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--color-brand-green)]"
                      />
                    </div>
                  </div>

                  {/* Photos Upload Section */}
                  <div className="space-y-4">
                    <h3 className="text-muted border-b border-[var(--border-subtle)] pb-2 text-sm font-black tracking-widest uppercase">
                      Photos *
                    </h3>
                    <div className="bg-foreground/5 rounded-2xl border border-dashed border-[var(--border-subtle)] p-6">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files) {
                            setTractorPhotos(Array.from(e.target.files));
                          }
                        }}
                        className="text-muted file:text-background block w-full cursor-pointer text-sm file:mr-4 file:rounded-xl file:border-0 file:bg-[var(--color-brand-green)] file:px-6 file:py-2.5 file:text-sm file:font-black file:tracking-widest file:uppercase hover:file:bg-[var(--color-brand-green)]/90"
                      />
                      <p className="text-muted mt-3 text-xs font-medium">
                        Tip: Good photos (Front, Back, Dashboard, Tyres) help sell your tractor up
                        to 3x faster.
                      </p>

                      {tractorPhotos.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {tractorPhotos.map((file, idx) => (
                            <div
                              key={idx}
                              className="bg-background flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-bold"
                            >
                              <span className="max-w-[120px] truncate">{file.name}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setTractorPhotos((prev) => prev.filter((_, i) => i !== idx))
                                }
                                className="text-red-500 hover:text-red-600"
                              >
                                <XCircle size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="animate-in fade-in mt-8 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 font-bold text-red-500">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-12 flex items-center justify-between border-t border-[var(--border-subtle)] pt-6">
              <button
                type="button"
                onClick={handlePrev}
                className={`flex items-center gap-2 rounded-xl px-6 py-4 text-sm font-black tracking-wider uppercase transition-all ${
                  currentStep === 1
                    ? 'pointer-events-none opacity-0'
                    : 'bg-background hover:bg-foreground/5 border border-[var(--border-subtle)]'
                }`}
              >
                <ChevronLeft size={18} /> Back
              </button>

              {currentStep === 4 && (
                <p className="text-muted max-w-xs text-right text-xs font-bold">
                  Please review carefully: listing details cannot be edited after submission.
                </p>
              )}
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-8 py-4 font-black tracking-wider text-white uppercase shadow-[var(--color-brand-green)]/20 shadow-lg transition-transform hover:-translate-y-1"
                >
                  Next Step <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-10 py-4 font-black tracking-wider text-white uppercase shadow-[var(--color-brand-green)]/20 shadow-lg transition-transform hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Listing'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function SellUsedTractorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <TractorLoader />
        </div>
      }
    >
      <SellUsedTractorForm />
    </Suspense>
  );
}
