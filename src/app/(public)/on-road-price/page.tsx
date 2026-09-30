'use client';

import React, { useState, useEffect } from 'react';
import { brandAPI, Brand } from '@/lib/api/brands';
import { tractorAPI, Tractor, TractorPriceByState } from '@/lib/api/tractors';
import {
  ChevronRight,
  ArrowLeft,
  MapPin,
  Calculator,
  ShieldCheck,
  Tractor as TractorIcon,
} from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';
import Link from 'next/link';

export default function OnRoadPricePage() {
  const [step, setStep] = useState(1);

  // Data
  const [brands, setBrands] = useState<Brand[]>([]);
  const [tractors, setTractors] = useState<Tractor[]>([]);

  // Selections
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedTractor, setSelectedTractor] = useState<Tractor | null>(null);
  const [tractorDetails, setTractorDetails] = useState<Tractor | null>(null);
  const [selectedStatePrice, setSelectedStatePrice] = useState<TractorPriceByState | null>(null);

  // Loading States
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingTractors, setLoadingTractors] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Step 1: Load Brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await brandAPI.getAllBrands({ limit: 50 });
        if (res.success) {
          const payload = res.data as any;
          const list = payload.data || payload.brands || [];
          setBrands(list.filter((b: any) => b.isActive));
        }
      } catch (err) {
        console.error('Error fetching brands', err);
      } finally {
        setLoadingBrands(false);
      }
    };
    fetchBrands();
  }, []);

  // Step 2: Load Tractors when Brand changes
  useEffect(() => {
    if (!selectedBrand) return;
    const fetchTractors = async () => {
      setLoadingTractors(true);
      try {
        const res = await tractorAPI.getAllTractors({ brandId: selectedBrand.id, limit: 100 });
        if (res.success) {
          const payload = res.data as any;
          const list = payload.data || payload.tractors || [];
          setTractors(list.filter((t: any) => t.isActive));
        }
      } catch (err) {
        console.error('Error fetching tractors', err);
      } finally {
        setLoadingTractors(false);
      }
    };
    fetchTractors();
  }, [selectedBrand]);

  // Step 3: Load Tractor Details when Tractor changes
  useEffect(() => {
    if (!selectedTractor) return;
    const fetchDetails = async () => {
      setLoadingDetails(true);
      try {
        const res = await tractorAPI.getTractorById(selectedTractor.id);
        if (res.success) {
          setTractorDetails(res.data);
          // Auto-select first state if available
          if (res.data.priceByState && res.data.priceByState.length > 0) {
            setSelectedStatePrice(res.data.priceByState[0]);
          } else {
            setSelectedStatePrice(null);
          }
        }
      } catch (err) {
        console.error('Error fetching details', err);
      } finally {
        setLoadingDetails(false);
      }
    };
    fetchDetails();
  }, [selectedTractor]);

  const handleBrandSelect = (brand: Brand) => {
    setSelectedBrand(brand);
    setSelectedTractor(null);
    setTractorDetails(null);
    setSelectedStatePrice(null);
    setStep(2);
  };

  const handleTractorSelect = (tractor: Tractor) => {
    setSelectedTractor(tractor);
    setTractorDetails(null);
    setSelectedStatePrice(null);
    setStep(3);
  };

  const formatPrice = (price: number | null | undefined) => {
    if (!price) return 'N/A';
    return `₹ ${price.toLocaleString('en-IN')}`;
  };

  return (
    <div className="animate-fade-in mx-auto min-h-screen w-full max-w-[1200px] px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-foreground mb-4 text-4xl font-black tracking-tight md:text-5xl">
          Check <span className="text-[var(--color-brand-green)]">On-Road Price</span>
        </h1>
        <p className="text-muted mx-auto max-w-2xl text-lg font-bold">
          Get the exact price breakdown including Ex-Showroom, RTO, and Insurance for your state.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-12 flex items-center justify-center">
        <div className="flex w-full max-w-2xl items-center">
          <StepIndicator currentStep={step} stepNumber={1} label="Brand" />
          <div
            className={`mx-2 h-1 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-[var(--color-brand-green)]' : 'bg-foreground/10'}`}
          />
          <StepIndicator currentStep={step} stepNumber={2} label="Model" />
          <div
            className={`mx-2 h-1 flex-1 rounded-full transition-colors ${step >= 3 ? 'bg-[var(--color-brand-green)]' : 'bg-foreground/10'}`}
          />
          <StepIndicator currentStep={step} stepNumber={3} label="State" />
        </div>
      </div>

      {/* Main Card */}
      <div className="relative min-h-[400px] overflow-hidden rounded-[2.5rem] border border-[var(--border-subtle)] bg-[var(--card-bg)] p-8 shadow-[var(--card-shadow)] backdrop-blur-3xl md:p-12">
        {/* Back Button */}
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="text-muted hover:text-foreground absolute top-8 left-8 z-10 flex items-center gap-2 text-sm font-black transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
        )}

        <div className="mt-8">
          {/* STEP 1: BRANDS */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="mb-8 text-center text-2xl font-black">Select a Tractor Brand</h2>
              {loadingBrands ? (
                <Loader />
              ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
                  {brands.map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => handleBrandSelect(brand)}
                      className="bg-background/50 group flex flex-col items-center justify-center rounded-[2rem] border border-[var(--border-subtle)] p-6 transition-all duration-300 hover:border-[var(--color-brand-green)] hover:bg-[var(--color-brand-green)]/5 hover:shadow-[var(--card-shadow)]"
                    >
                      {brand.logoUrl ? (
                        <img
                          src={brand.logoUrl}
                          alt={brand.name}
                          className="mb-3 h-16 w-16 object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110 dark:mix-blend-normal"
                        />
                      ) : (
                        <div className="bg-foreground/5 mb-3 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-black">
                          {brand.name.charAt(0)}
                        </div>
                      )}
                      <span className="text-foreground text-center text-sm font-black transition-colors group-hover:text-[var(--color-brand-green)]">
                        {brand.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: MODELS */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="mb-2 text-center text-2xl font-black">
                Select a {selectedBrand?.name} Tractor
              </h2>
              <p className="text-muted mb-8 text-center text-sm font-bold">
                Choose the exact model you are interested in.
              </p>

              {loadingTractors ? (
                <Loader />
              ) : tractors.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {tractors.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleTractorSelect(t)}
                      className="bg-background/50 group flex items-center gap-4 rounded-[1.5rem] border border-[var(--border-subtle)] p-4 text-left transition-all duration-300 hover:border-[var(--color-brand-green)] hover:bg-[var(--color-brand-green)]/5 hover:shadow-[var(--card-shadow)]"
                    >
                      <div className="bg-foreground/5 flex h-16 w-16 shrink-0 items-center justify-center rounded-[1rem] border border-[var(--border-subtle)] p-2">
                        {t.media && t.media.length > 0 ? (
                          <img
                            src={t.media.find((m) => m.isPrimary)?.url || t.media[0].url}
                            alt={t.modelName}
                            className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110 dark:mix-blend-normal"
                          />
                        ) : (
                          <TractorIcon size={24} className="text-muted" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-foreground truncate font-black transition-colors group-hover:text-[var(--color-brand-green)]">
                          {t.modelName}
                        </h3>
                        <p className="text-muted text-[11px] font-bold tracking-wider uppercase">
                          {t.hp || '--'} HP • {t.driveType === 'FOUR_WD' ? '4WD' : '2WD'}
                        </p>
                      </div>
                      <div className="bg-foreground/5 flex h-8 w-8 items-center justify-center rounded-full transition-colors group-hover:bg-[var(--color-brand-green)] group-hover:text-white">
                        <ChevronRight size={16} strokeWidth={3} />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-muted py-12 text-center font-bold">
                  No tractors found for this brand.
                </div>
              )}
            </div>
          )}

          {/* STEP 3 & 4: STATE SELECTION & PRICE BREAKDOWN */}
          {step === 3 && (
            <div className="animate-fade-in">
              {loadingDetails ? (
                <Loader />
              ) : tractorDetails ? (
                <div className="flex flex-col gap-10 lg:flex-row">
                  {/* Left Column - Selection */}
                  <div className="flex w-full flex-col gap-6 lg:w-1/3">
                    <div className="bg-background/80 group relative overflow-hidden rounded-[2rem] border border-[var(--border-subtle)] p-6 text-center shadow-[var(--card-shadow)] backdrop-blur-md">
                      <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-[var(--color-brand-green)]/10 blur-[40px] transition-all duration-500 group-hover:bg-[var(--color-brand-green)]/20" />
                      <h3 className="text-foreground relative z-10 mb-1 text-xl font-black">
                        {tractorDetails.brand?.name} {tractorDetails.modelName}
                      </h3>
                      <p className="text-muted relative z-10 text-xs font-bold tracking-widest uppercase">
                        {tractorDetails.hp || '--'} HP
                      </p>
                      <Link
                        href={`/tractors/${tractorDetails.id}`}
                        className="relative z-10 mt-6 inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-green)] px-4 py-2 text-xs font-black tracking-widest text-white uppercase shadow-md transition-colors hover:bg-[var(--color-brand-green-dark)]"
                      >
                        View Details <ChevronRight size={14} />
                      </Link>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-muted flex items-center gap-2 text-xs font-black tracking-widest uppercase">
                        <MapPin size={14} /> Select Your State
                      </label>
                      {tractorDetails.priceByState && tractorDetails.priceByState.length > 0 ? (
                        <select
                          value={selectedStatePrice?.state || ''}
                          onChange={(e) => {
                            const found = tractorDetails.priceByState?.find(
                              (p) => p.state === e.target.value
                            );
                            setSelectedStatePrice(found || null);
                          }}
                          className="bg-foreground/5 text-foreground w-full cursor-pointer appearance-none rounded-2xl border-none px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]"
                        >
                          {tractorDetails.priceByState.map((p) => (
                            <option key={p.id} value={p.state}>
                              {p.state}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-500">
                          Pricing data not available for this model yet.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column - Receipt Breakdown */}
                  <div className="w-full lg:w-2/3">
                    <div className="relative overflow-hidden rounded-[2rem] border border-[var(--border-subtle)] bg-[var(--panel-bg)] p-8 shadow-[var(--card-shadow)] backdrop-blur-3xl md:p-10">
                      {/* Decorative elements */}
                      <div className="pointer-events-none absolute top-0 right-0 -z-10 h-64 w-64 rounded-full bg-[var(--color-brand-green)]/10 blur-[80px]" />

                      <div className="mb-8 flex items-center gap-3 border-b border-[var(--border-subtle)] pb-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] shadow-inner">
                          <Calculator size={24} />
                        </div>
                        <h3 className="text-foreground text-2xl font-black tracking-tight">
                          Estimated Price Breakdown
                        </h3>
                      </div>

                      {selectedStatePrice ? (
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center justify-between py-2">
                            <span className="text-muted font-bold">Ex-Showroom Price</span>
                            <span className="text-foreground text-lg font-black">
                              {formatPrice(selectedStatePrice.exShowroom)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between py-2">
                            <span className="text-muted font-bold">RTO & Registration</span>
                            <span className="text-foreground font-black">
                              {formatPrice(selectedStatePrice.rtoCharges)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between py-2">
                            <span className="text-muted font-bold">Insurance (Estimated)</span>
                            <span className="text-foreground font-black">
                              {formatPrice(selectedStatePrice.insuranceEst)}
                            </span>
                          </div>

                          {selectedStatePrice.dealerCharges &&
                            selectedStatePrice.dealerCharges > 0 && (
                              <div className="flex items-center justify-between py-2">
                                <span className="text-muted font-bold">Other Charges</span>
                                <span className="text-foreground font-black">
                                  {formatPrice(selectedStatePrice.dealerCharges)}
                                </span>
                              </div>
                            )}

                          <div className="bg-foreground/10 my-4 h-px w-full" />

                          <div className="bg-background/50 flex items-end justify-between rounded-[1.5rem] border border-[var(--border-subtle)] p-6 shadow-sm">
                            <div>
                              <span className="text-muted mb-2 block text-[10px] font-black tracking-widest uppercase">
                                Total Estimated
                              </span>
                              <span className="text-foreground text-2xl font-black tracking-tight md:text-3xl">
                                On-Road Price
                              </span>
                            </div>
                            <span className="text-3xl font-black tracking-tight text-[var(--color-brand-orange)] md:text-4xl">
                              {formatPrice(
                                selectedStatePrice.onRoadPrice ||
                                  Number(selectedStatePrice.exShowroom) +
                                    Number(selectedStatePrice.rtoCharges || 0) +
                                    Number(selectedStatePrice.insuranceEst || 0) +
                                    Number(selectedStatePrice.dealerCharges || 0)
                              )}
                            </span>
                          </div>

                          <div className="mt-8 flex items-start gap-3 rounded-xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 p-4">
                            <ShieldCheck
                              size={20}
                              className="mt-0.5 shrink-0 text-[var(--color-brand-green)]"
                            />
                            <p className="text-muted text-xs leading-relaxed font-bold">
                              * The on-road price displayed is an estimate and may vary based on
                              exact location, dealer negotiations, and changing RTO/Insurance
                              structures.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
                          <MapPin size={48} className="mb-4" />
                          <p className="font-bold">Select a state to view the breakdown</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StepIndicator({
  currentStep,
  stepNumber,
  label,
}: {
  currentStep: number;
  stepNumber: number;
  label: string;
}) {
  const isActive = currentStep >= stepNumber;
  const isCurrent = currentStep === stepNumber;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black transition-all duration-300 ${
          isActive
            ? 'bg-[var(--color-brand-green)] text-white shadow-[var(--color-brand-green)]/30 shadow-lg'
            : 'bg-foreground/5 text-muted'
        } ${isCurrent ? 'ring-4 ring-[var(--color-brand-green)]/20' : ''}`}
      >
        {stepNumber}
      </div>
      <span
        className={`text-[10px] font-black tracking-widest uppercase transition-colors ${isActive ? 'text-foreground' : 'text-muted'}`}
      >
        {label}
      </span>
    </div>
  );
}

function Loader() {
  return (
    <div className="flex w-full justify-center py-20">
      <TractorLoader size={48} className="text-[var(--color-brand-green)]" />
    </div>
  );
}
