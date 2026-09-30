'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { ShieldCheck, HelpCircle } from 'lucide-react';

import { EmiCalculatorInputs } from './emi-calculator.types';
import { EMI_DEFAULTS, FINANCING_PRESETS, FinancingPreset } from './emi-calculator.constants';
import { validateEmiInputs } from './emi-calculator.validation';
import {
  calculateEmiResults,
  generateAmortizationSchedule,
  generateYearlySummary,
} from './emi-calculator.utils';

import { EmiCalculatorForm } from './emi-calculator-form';
import { EmiCalculatorResult } from './emi-calculator-result';
import { EmiBreakdownChart } from './emi-breakdown-chart';
import { EmiAmortizationTable } from './emi-amortization-table';

import { brandAPI, Brand } from '@/lib/api/brands';
import { tractorAPI, Tractor } from '@/lib/api/tractors';
import { emiAPI } from '@/lib/api/emi';

function EmiCalculatorContent() {
  const searchParams = useSearchParams();

  // Unified State representing single source of truth
  const [inputs, setInputs] = useState<EmiCalculatorInputs>({
    vehiclePrice: EMI_DEFAULTS.VEHICLE_PRICE,
    downPayment: Math.floor(EMI_DEFAULTS.VEHICLE_PRICE * (EMI_DEFAULTS.DOWN_PAYMENT_PERCENT / 100)),
    downPaymentPercent: EMI_DEFAULTS.DOWN_PAYMENT_PERCENT,
    interestRate: EMI_DEFAULTS.INTEREST_RATE,
    tenureValue: EMI_DEFAULTS.TENURE_VALUE,
    tenureUnit: EMI_DEFAULTS.TENURE_UNIT,
  });

  // Brands and Models listing API state
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [tractors, setTractors] = useState<Tractor[]>([]);
  const [loadingTractors, setLoadingTractors] = useState(false);

  // API Auto-registration State
  const [registering, setRegistering] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Fetch all brands on mount
  useEffect(() => {
    const fetchBrands = async () => {
      setLoadingBrands(true);
      try {
        const response = await brandAPI.getAllBrands({ limit: 100, isActive: 'true' });
        const brandsList = response.data?.data || (response.data as any)?.brands || [];
        if (response.success) {
          setBrands(brandsList);
        }
      } catch (error) {
        console.error('Failed to fetch brands for EMI calculator', error);
      } finally {
        setLoadingBrands(false);
      }
    };
    fetchBrands();
  }, []);

  // Fetch tractors when brand selection changes
  const fetchTractorsForBrand = async (brandId: number) => {
    setLoadingTractors(true);
    try {
      const response = await tractorAPI.getAllTractors({ brandId, limit: 100 });
      const tractorsList = (response.data as any)?.tractors || (response.data as any)?.data || [];
      if (response.success) {
        setTractors(tractorsList);
      }
    } catch (error) {
      console.error(`Failed to fetch models for brand ID ${brandId}`, error);
    } finally {
      setLoadingTractors(false);
    }
  };

  // Pre-fill fields from URL query params (price, tractorId)
  useEffect(() => {
    const priceParam = searchParams.get('price');
    const tractorIdParam = searchParams.get('tractorId');

    const loadInitialQuery = async () => {
      // 1. If tractorId query parameter exists, fetch details
      if (tractorIdParam) {
        const tractorId = parseInt(tractorIdParam, 10);
        if (!isNaN(tractorId)) {
          try {
            setLoadingTractors(true);
            const res = await tractorAPI.getTractorById(tractorId);
            if (res.success && res.data) {
              const tractor = res.data;
              const price = Number(
                tractor.offerPrice || tractor.exShowroomPriceMin || EMI_DEFAULTS.VEHICLE_PRICE
              );
              const brandId = tractor.brandId;

              // Pre-fill inputs state
              setInputs((prev) => {
                const initialDownPayment = Math.floor(price * (prev.downPaymentPercent / 100));
                return {
                  ...prev,
                  vehiclePrice: price,
                  downPayment: initialDownPayment,
                  selectedBrandId: brandId,
                  selectedTractorId: tractor.id,
                };
              });

              // Pre-fetch tractor models of this brand so dropdown is populated
              if (brandId) {
                const response = await tractorAPI.getAllTractors({ brandId, limit: 100 });
                const tractorsList =
                  (response.data as any)?.tractors || (response.data as any)?.data || [];
                if (response.success) {
                  setTractors(tractorsList);
                }
              }
            }
          } catch (error) {
            console.error('Failed to load pre-filled tractor by ID', error);
          } finally {
            setLoadingTractors(false);
          }
          return; // Skip price query parsing if tractor fetch was handled
        }
      }

      // 2. If just manual price parameter exists
      if (priceParam) {
        const price = parseInt(priceParam, 10);
        if (!isNaN(price) && price > 0) {
          setInputs((prev) => {
            const initialDownPayment = Math.floor(price * (prev.downPaymentPercent / 100));
            return {
              ...prev,
              vehiclePrice: price,
              downPayment: initialDownPayment,
            };
          });
        }
      }
    };

    loadInitialQuery();
  }, [searchParams]);

  // Handle manual Brand Selector changes
  const handleBrandChange = (brandId: number | undefined) => {
    if (brandId) {
      setInputs((prev) => ({
        ...prev,
        selectedBrandId: brandId,
        selectedTractorId: undefined, // Reset model when brand changes
      }));
      fetchTractorsForBrand(brandId);
    } else {
      setInputs((prev) => ({
        ...prev,
        selectedBrandId: undefined,
        selectedTractorId: undefined,
      }));
      setTractors([]);
    }
  };

  // Handle Model Selector changes
  const handleTractorChange = (tractorId: number | undefined) => {
    if (tractorId) {
      const selectedTractor = tractors.find((t) => t.id === tractorId);
      if (selectedTractor) {
        const price = Number(
          selectedTractor.offerPrice ||
            selectedTractor.exShowroomPriceMin ||
            EMI_DEFAULTS.VEHICLE_PRICE
        );
        setInputs((prev) => {
          const updatedDownPayment = Math.floor(price * (prev.downPaymentPercent / 100));
          return {
            ...prev,
            selectedTractorId: tractorId,
            vehiclePrice: price,
            downPayment: updatedDownPayment,
          };
        });
      }
    } else {
      setInputs((prev) => ({
        ...prev,
        selectedTractorId: undefined,
      }));
    }
  };

  // Perform computations
  const errors = validateEmiInputs(inputs);
  const hasErrors = Object.keys(errors).length > 0;

  // Calculate results if inputs are mathematically usable
  const results = calculateEmiResults(inputs);
  const schedule = generateAmortizationSchedule(inputs);
  const yearlySummary = generateYearlySummary(schedule);

  const handleReset = () => {
    setInputs({
      vehiclePrice: EMI_DEFAULTS.VEHICLE_PRICE,
      downPayment: Math.floor(
        EMI_DEFAULTS.VEHICLE_PRICE * (EMI_DEFAULTS.DOWN_PAYMENT_PERCENT / 100)
      ),
      downPaymentPercent: EMI_DEFAULTS.DOWN_PAYMENT_PERCENT,
      interestRate: EMI_DEFAULTS.INTEREST_RATE,
      tenureValue: EMI_DEFAULTS.TENURE_VALUE,
      tenureUnit: EMI_DEFAULTS.TENURE_UNIT,
      selectedBrandId: undefined,
      selectedTractorId: undefined,
    });
    setTractors([]);
  };

  const applyPreset = (preset: FinancingPreset) => {
    const updatedDownPayment = Math.floor(inputs.vehiclePrice * (preset.downPaymentPercent / 100));
    setInputs((prev) => ({
      ...prev,
      downPaymentPercent: preset.downPaymentPercent,
      downPayment: updatedDownPayment,
      interestRate: preset.interestRate,
      tenureValue: preset.tenureValue,
      tenureUnit: preset.tenureUnit,
    }));
  };

  const lastSavedRef = useRef<string | null>(null);

  // Background Auto-registration effect
  useEffect(() => {
    // 1. If there are validation errors or price is out of bounds, do not save
    const validationErrors = validateEmiInputs(inputs);
    if (Object.keys(validationErrors).length > 0) return;
    if (inputs.vehiclePrice < 50000 || inputs.vehiclePrice > 5000000) return;

    const tenureMonths =
      inputs.tenureUnit === 'years' ? inputs.tenureValue * 12 : inputs.tenureValue;

    // 2. Prepare payload
    const payload = {
      tractorId: inputs.selectedTractorId || undefined,
      tractorPrice: inputs.vehiclePrice,
      downPayment: inputs.downPayment,
      interestRatePct: inputs.interestRate,
      tenureMonths,
      repaymentInterval: 'monthly',
    };

    const payloadString = JSON.stringify(payload);

    // 3. Prevent duplicate requests for unchanged calculation parameters
    if (lastSavedRef.current === payloadString) {
      return;
    }

    setRegistering(true);
    setRegisterSuccess(false);

    // 4. Start 10-second debounce timer
    const timer = setTimeout(async () => {
      try {
        const response = await emiAPI.saveCalculation({
          tractorId: payload.tractorId,
          tractorPrice: payload.tractorPrice,
          downPayment: payload.downPayment,
          interestRatePct: payload.interestRatePct,
          tenureMonths: payload.tenureMonths,
          repaymentInterval: 'monthly',
        });

        if (response.success) {
          lastSavedRef.current = payloadString;
          setRegisterSuccess(true);
        }
      } catch (err) {
        console.error('Failed to auto-register EMI calculation:', err);
      } finally {
        setRegistering(false);
      }
    }, 10000); // 10-second delay

    // 5. Cleanup timer on subsequent changes
    return () => {
      clearTimeout(timer);
    };
  }, [
    inputs.vehiclePrice,
    inputs.downPayment,
    inputs.interestRate,
    inputs.tenureValue,
    inputs.tenureUnit,
    inputs.selectedTractorId,
  ]);

  return (
    <div className="flex w-full flex-col gap-10">
      {/* HEADER SECTION */}
      <div className="relative flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-black tracking-widest text-[var(--color-brand-green)] uppercase">
          <ShieldCheck size={14} /> Smart Finance Tool
        </div>
        <h1 className="text-foreground text-3xl font-black tracking-tight uppercase md:text-5xl">
          Tractor EMI Calculator
        </h1>
        <p className="text-muted max-w-2xl text-sm font-bold md:text-base">
          Estimate monthly EMIs, total interest, and visualize your amortization schedule for easy
          agricultural and commercial vehicle loans.
        </p>
      </div>

      {/* MAIN LAYOUT GRID */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Left column - inputs (Form) */}
        <div className="flex flex-col gap-8 lg:col-span-7">
          <EmiCalculatorForm
            inputs={inputs}
            onChange={setInputs}
            onReset={handleReset}
            errors={errors}
            brands={brands}
            loadingBrands={loadingBrands}
            tractors={tractors}
            loadingTractors={loadingTractors}
            onBrandChange={handleBrandChange}
            onTractorChange={handleTractorChange}
          />

          {/* Quick presets helper */}
          <div className="flex flex-col gap-4 rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-[var(--card-shadow)] md:p-8">
            <h3 className="text-foreground text-sm font-black tracking-wider uppercase">
              Quick Financing Presets
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {FINANCING_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="bg-foreground/5 group flex flex-col gap-1 rounded-2xl border border-[var(--border-subtle)] p-4 text-left transition-all hover:border-[var(--color-brand-orange)]/20 hover:bg-[var(--color-brand-orange)]/5 hover:shadow-md"
                >
                  <span className="text-foreground text-xs font-black tracking-wide uppercase transition-colors group-hover:text-[var(--color-brand-orange)]">
                    {preset.name}
                  </span>
                  <span className="text-muted text-[10px] leading-normal font-bold">
                    {preset.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column - outputs (Charts, Results) */}
        <div className="flex flex-col gap-8 lg:col-span-5">
          <div className="relative">
            <EmiCalculatorResult inputs={inputs} results={results} />
            {/* Subtle background status indicator */}
            <div className="text-muted absolute right-4 bottom-2 text-[10px] font-bold transition-all">
              {registering ? (
                <span className="flex items-center gap-1 text-[var(--color-brand-orange)]">
                  <span className="h-1.5 w-1.5 animate-ping rounded-full bg-[var(--color-brand-orange)]" />
                  Auto-registering...
                </span>
              ) : registerSuccess ? (
                <span className="text-[var(--color-brand-green)]">✓ Registered</span>
              ) : null}
            </div>
          </div>

          <EmiBreakdownChart
            loanAmount={results.loanAmount}
            totalInterest={results.totalInterest}
            principalPercent={results.principalPercent}
            interestPercent={results.interestPercent}
          />
        </div>
      </div>

      {/* AMORTIZATION TABLE SCHEDULE SECTION */}
      <div className="w-full">
        <EmiAmortizationTable schedule={schedule} yearlySummary={yearlySummary} />
      </div>
    </div>
  );
}

export function EmiCalculator() {
  return (
    <Suspense
      fallback={
        <div className="text-muted flex h-96 items-center justify-center font-bold tracking-wider uppercase">
          Loading Calculator...
        </div>
      }
    >
      <EmiCalculatorContent />
    </Suspense>
  );
}
