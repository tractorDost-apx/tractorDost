'use client';

import React, { useState, useEffect } from 'react';
import { brandAPI, Brand } from '@/lib/api/brands';
import { tractorAPI, Tractor, TractorPriceByState } from '@/lib/api/tractors';
import { ChevronRight, ArrowLeft, MapPin, Calculator, ShieldCheck, Tractor as TractorIcon } from 'lucide-react';
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
    <div className="w-full max-w-[1200px] mx-auto min-h-screen py-12 px-4 sm:px-6 animate-fade-in">
      
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-4">
          Check <span className="text-[var(--color-brand-green)]">On-Road Price</span>
        </h1>
        <p className="text-muted font-bold text-lg max-w-2xl mx-auto">
          Get the exact price breakdown including Ex-Showroom, RTO, and Insurance for your state.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-12">
        <div className="flex items-center w-full max-w-2xl">
           <StepIndicator currentStep={step} stepNumber={1} label="Brand" />
           <div className={`flex-1 h-1 mx-2 rounded-full transition-colors ${step >= 2 ? 'bg-[var(--color-brand-green)]' : 'bg-foreground/10'}`} />
           <StepIndicator currentStep={step} stepNumber={2} label="Model" />
           <div className={`flex-1 h-1 mx-2 rounded-full transition-colors ${step >= 3 ? 'bg-[var(--color-brand-green)]' : 'bg-foreground/10'}`} />
           <StepIndicator currentStep={step} stepNumber={3} label="State" />
        </div>
      </div>

      {/* Main Card */}
      <div className="spatial-panel rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden min-h-[400px]">
        
        {/* Back Button */}
        {step > 1 && (
          <button 
            onClick={() => setStep(step - 1)}
            className="absolute top-8 left-8 flex items-center gap-2 text-sm font-black text-muted hover:text-foreground transition-colors z-10"
          >
            <ArrowLeft size={16} /> Back
          </button>
        )}

        <div className="mt-8">
          {/* STEP 1: BRANDS */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-black text-center mb-8">Select a Tractor Brand</h2>
              {loadingBrands ? (
                <Loader />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {brands.map((brand) => (
                    <button 
                      key={brand.id}
                      onClick={() => handleBrandSelect(brand)}
                      className="flex flex-col items-center justify-center p-6 rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 hover:border-[var(--color-brand-green)]/50 hover:bg-[var(--color-brand-green)]/5 transition-all group"
                    >
                      {brand.logoUrl ? (
                        <img src={brand.logoUrl} alt={brand.name} className="w-16 h-16 object-contain mb-3 group-hover:scale-110 transition-transform mix-blend-multiply dark:mix-blend-normal" />
                      ) : (
                        <div className="w-16 h-16 bg-foreground/10 rounded-full flex items-center justify-center mb-3 text-2xl font-black">
                          {brand.name.charAt(0)}
                        </div>
                      )}
                      <span className="font-black text-sm text-center">{brand.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: MODELS */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-black text-center mb-2">Select a {selectedBrand?.name} Tractor</h2>
              <p className="text-center text-muted font-bold text-sm mb-8">Choose the exact model you are interested in.</p>
              
              {loadingTractors ? (
                <Loader />
              ) : tractors.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tractors.map((t) => (
                    <button 
                      key={t.id}
                      onClick={() => handleTractorSelect(t)}
                      className="flex items-center gap-4 p-4 rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 hover:border-[var(--color-brand-green)]/50 hover:bg-[var(--color-brand-green)]/5 transition-all text-left group"
                    >
                      <div className="w-16 h-16 rounded-xl bg-background flex items-center justify-center p-2 shrink-0 border border-[var(--border-subtle)]">
                         {t.media && t.media.length > 0 ? (
                           <img src={t.media.find(m => m.isPrimary)?.url || t.media[0].url} alt={t.modelName} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-transform" />
                         ) : (
                           <TractorIcon size={24} className="text-muted" />
                         )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-foreground truncate">{t.modelName}</h3>
                        <p className="text-xs font-bold text-muted">{t.hp || '--'} HP • {t.driveType === 'FOUR_WD' ? '4WD' : '2WD'}</p>
                      </div>
                      <ChevronRight size={18} className="text-muted group-hover:text-[var(--color-brand-green)] transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted font-bold py-12">No tractors found for this brand.</div>
              )}
            </div>
          )}

          {/* STEP 3 & 4: STATE SELECTION & PRICE BREAKDOWN */}
          {step === 3 && (
            <div className="animate-fade-in">
              {loadingDetails ? (
                <Loader />
              ) : tractorDetails ? (
                <div className="flex flex-col lg:flex-row gap-10">
                  
                  {/* Left Column - Selection */}
                  <div className="w-full lg:w-1/3 flex flex-col gap-6">
                    <div className="bg-gradient-to-br from-[var(--color-brand-green)]/10 to-transparent p-6 rounded-[2rem] border border-[var(--color-brand-green)]/20 text-center">
                       <h3 className="font-black text-lg mb-1">{tractorDetails.brand?.name} {tractorDetails.modelName}</h3>
                       <p className="text-sm font-bold text-muted">{tractorDetails.hp || '--'} HP</p>
                       <Link href={`/tractors/${tractorDetails.id}`} className="inline-block mt-4 text-xs font-black text-[var(--color-brand-green)] hover:underline uppercase tracking-widest">
                         View Details
                       </Link>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted flex items-center gap-2">
                        <MapPin size={14} /> Select Your State
                      </label>
                      {tractorDetails.priceByState && tractorDetails.priceByState.length > 0 ? (
                        <select 
                          value={selectedStatePrice?.state || ''}
                          onChange={(e) => {
                            const found = tractorDetails.priceByState?.find(p => p.state === e.target.value);
                            setSelectedStatePrice(found || null);
                          }}
                          className="w-full bg-foreground/5 border-none rounded-2xl px-5 py-4 text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] outline-none cursor-pointer appearance-none"
                        >
                          {tractorDetails.priceByState.map(p => (
                            <option key={p.id} value={p.state}>{p.state}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="p-4 bg-red-500/10 text-red-500 rounded-xl text-sm font-bold border border-red-500/20">
                          Pricing data not available for this model yet.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column - Receipt Breakdown */}
                  <div className="w-full lg:w-2/3">
                    <div className="bg-foreground/[0.03] border border-[var(--border-subtle)] rounded-[2rem] p-8 md:p-10 relative overflow-hidden">
                      {/* Decorative elements */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-brand-green)]/5 rounded-full blur-[60px] -z-10" />
                      
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-brand-green)]/20 flex items-center justify-center text-[var(--color-brand-green)]">
                          <Calculator size={20} />
                        </div>
                        <h3 className="text-xl font-black text-foreground">Estimated Price Breakdown</h3>
                      </div>

                      {selectedStatePrice ? (
                        <div className="flex flex-col gap-4">
                          <div className="flex justify-between items-center py-2">
                            <span className="text-muted font-bold">Ex-Showroom Price</span>
                            <span className="font-black text-foreground text-lg">{formatPrice(selectedStatePrice.exShowroom)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center py-2">
                            <span className="text-muted font-bold">RTO & Registration</span>
                            <span className="font-black text-foreground">{formatPrice(selectedStatePrice.rtoCharges)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center py-2">
                            <span className="text-muted font-bold">Insurance (Estimated)</span>
                            <span className="font-black text-foreground">{formatPrice(selectedStatePrice.insuranceEst)}</span>
                          </div>
                          
                          {selectedStatePrice.dealerCharges && selectedStatePrice.dealerCharges > 0 && (
                            <div className="flex justify-between items-center py-2">
                              <span className="text-muted font-bold">Other Charges</span>
                              <span className="font-black text-foreground">{formatPrice(selectedStatePrice.dealerCharges)}</span>
                            </div>
                          )}

                          <div className="w-full h-px bg-foreground/10 my-4" />
                          
                          <div className="flex justify-between items-end">
                            <div>
                              <span className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-brand-green)] mb-1">Total Estimated</span>
                              <span className="text-3xl font-black text-foreground">On-Road Price</span>
                            </div>
                            <span className="text-4xl font-black text-[var(--color-brand-orange)] tracking-tight">
                              {formatPrice(selectedStatePrice.onRoadPrice || (
                                Number(selectedStatePrice.exShowroom) + 
                                Number(selectedStatePrice.rtoCharges || 0) + 
                                Number(selectedStatePrice.insuranceEst || 0) + 
                                Number(selectedStatePrice.dealerCharges || 0)
                              ))}
                            </span>
                          </div>

                          <div className="mt-8 bg-[var(--color-brand-green)]/10 border border-[var(--color-brand-green)]/20 rounded-xl p-4 flex items-start gap-3">
                            <ShieldCheck size={20} className="text-[var(--color-brand-green)] shrink-0 mt-0.5" />
                            <p className="text-xs font-bold text-muted leading-relaxed">
                              * The on-road price displayed is an estimate and may vary based on exact location, dealer negotiations, and changing RTO/Insurance structures.
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

function StepIndicator({ currentStep, stepNumber, label }: { currentStep: number; stepNumber: number; label: string }) {
  const isActive = currentStep >= stepNumber;
  const isCurrent = currentStep === stepNumber;
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all duration-300 ${
        isActive ? 'bg-[var(--color-brand-green)] text-white shadow-lg shadow-[var(--color-brand-green)]/30' : 'bg-foreground/5 text-muted'
      } ${isCurrent ? 'ring-4 ring-[var(--color-brand-green)]/20' : ''}`}>
        {stepNumber}
      </div>
      <span className={`text-[10px] uppercase tracking-widest font-black transition-colors ${isActive ? 'text-foreground' : 'text-muted'}`}>
        {label}
      </span>
    </div>
  );
}

function Loader() {
  return (
    <div className="w-full flex justify-center py-20">
      <div className="w-12 h-12 border-4 border-[var(--border-subtle)] border-t-[var(--color-brand-green)] rounded-full animate-spin" />
    </div>
  );
}
