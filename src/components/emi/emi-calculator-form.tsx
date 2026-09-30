import React, { useEffect, useState } from 'react';
import { RotateCcw, Percent, Calendar, HelpCircle } from 'lucide-react';
import { EmiCalculatorInputs, EmiValidationErrors } from './emi-calculator.types';
import { EMI_LIMITS } from './emi-calculator.constants';
import { Brand } from '@/lib/api/brands';
import { Tractor } from '@/lib/api/tractors';

interface EmiCalculatorFormProps {
  inputs: EmiCalculatorInputs;
  onChange: (inputs: EmiCalculatorInputs) => void;
  onReset: () => void;
  errors: EmiValidationErrors;
  brands: Brand[];
  loadingBrands: boolean;
  tractors: Tractor[];
  loadingTractors: boolean;
  onBrandChange: (brandId: number | undefined) => void;
  onTractorChange: (tractorId: number | undefined) => void;
}

export const EmiCalculatorForm: React.FC<EmiCalculatorFormProps> = ({
  inputs,
  onChange,
  onReset,
  errors,
  brands,
  loadingBrands,
  tractors,
  loadingTractors,
  onBrandChange,
  onTractorChange,
}) => {
  const {
    vehiclePrice,
    downPayment,
    downPaymentPercent,
    interestRate,
    tenureValue,
    tenureUnit,
    selectedBrandId,
    selectedTractorId,
  } = inputs;

  const [activeTab, setActiveTab] = useState<'brand' | 'manual'>(
    selectedBrandId ? 'brand' : 'manual'
  );

  // Handle switching tabs
  const handleTabChange = (tab: 'brand' | 'manual') => {
    setActiveTab(tab);
    if (tab === 'manual') {
      onBrandChange(undefined);
      onTractorChange(undefined);
    }
  };

  // Synchronize down payment amount when vehicle price changes
  useEffect(() => {
    const updatedDownPayment = Math.floor(vehiclePrice * (downPaymentPercent / 100));
    // Make sure we only trigger change if there is a real difference to avoid infinite loops
    if (updatedDownPayment !== downPayment) {
      onChange({
        ...inputs,
        downPayment: updatedDownPayment,
      });
    }
  }, [vehiclePrice]);

  // Handle vehicle price input change manually
  const handlePriceChange = (val: number) => {
    const cleanVal = isNaN(val) ? 0 : val;
    // Recalculate down payment amount based on existing downPaymentPercent
    const updatedDownPayment = Math.floor(cleanVal * (downPaymentPercent / 100));
    onChange({
      ...inputs,
      vehiclePrice: cleanVal,
      downPayment: updatedDownPayment,
    });
  };

  // Handle down payment amount change
  const handleDownPaymentAmountChange = (val: number) => {
    const cleanVal = isNaN(val) ? 0 : val;
    // Calculate new percentage
    const newPercent = vehiclePrice > 0 ? Math.round((cleanVal / vehiclePrice) * 100) : 0;
    onChange({
      ...inputs,
      downPayment: cleanVal,
      downPaymentPercent: Math.min(newPercent, EMI_LIMITS.DOWN_PAYMENT_MAX_PERCENT),
    });
  };

  // Handle down payment percentage change
  const handleDownPaymentPercentChange = (val: number) => {
    const cleanVal = isNaN(val) ? 0 : val;
    const boundedPercent = Math.min(cleanVal, EMI_LIMITS.DOWN_PAYMENT_MAX_PERCENT);
    const updatedDownPayment = Math.floor(vehiclePrice * (boundedPercent / 100));
    onChange({
      ...inputs,
      downPayment: updatedDownPayment,
      downPaymentPercent: boundedPercent,
    });
  };

  // Quick preset updates
  const setQuickPrice = (amount: number) => {
    const updatedDownPayment = Math.floor(amount * (downPaymentPercent / 100));
    onChange({
      ...inputs,
      vehiclePrice: amount,
      downPayment: updatedDownPayment,
    });
  };

  return (
    <div className="relative flex w-full flex-col gap-6 overflow-hidden rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-[var(--card-shadow)] backdrop-blur-md md:p-8">
      {/* Background glow element */}
      <div className="pointer-events-none absolute top-0 left-0 h-24 w-24 rounded-full bg-[var(--color-brand-green)]/5 blur-2xl" />

      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
        <h2 className="text-foreground text-xl font-black tracking-tight uppercase md:text-2xl">
          Calculation Form
        </h2>
        <button
          onClick={onReset}
          className="bg-foreground/5 text-muted flex items-center gap-1.5 rounded-xl border border-transparent px-3 py-1.5 text-xs font-bold tracking-wider uppercase transition-all hover:border-[var(--color-brand-orange)]/20 hover:bg-[var(--color-brand-orange)]/10 hover:text-[var(--color-brand-orange)]"
          title="Reset calculations to default"
        >
          <RotateCcw size={13} /> Reset
        </button>
      </div>

      {/* TRACTOR PRICE SELECTOR TABS */}
      <div className="flex flex-col gap-3">
        <label className="text-muted text-xs font-black tracking-wider uppercase">
          Pricing Method
        </label>
        <div className="bg-foreground/5 grid grid-cols-2 rounded-2xl border border-[var(--border-subtle)] p-1">
          <button
            type="button"
            onClick={() => handleTabChange('manual')}
            className={`rounded-xl px-4 py-2 text-sm font-bold uppercase transition-all ${
              activeTab === 'manual'
                ? 'bg-background text-[var(--color-brand-green)] shadow-md'
                : 'text-muted hover:text-foreground'
            }`}
          >
            Manual Price
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('brand')}
            className={`rounded-xl px-4 py-2 text-sm font-bold uppercase transition-all ${
              activeTab === 'brand'
                ? 'bg-background text-[var(--color-brand-green)] shadow-md'
                : 'text-muted hover:text-foreground'
            }`}
          >
            Select Tractor
          </button>
        </div>
      </div>

      {/* BRAND & MODEL SELECTORS */}
      {activeTab === 'brand' && (
        <div className="bg-foreground/5 animate-fade-in grid grid-cols-1 gap-4 rounded-2xl border border-[var(--border-subtle)] p-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-muted text-[10px] font-black tracking-wider uppercase">
              Brand
            </label>
            <select
              value={selectedBrandId || ''}
              onChange={(e) => onBrandChange(e.target.value ? Number(e.target.value) : undefined)}
              className="bg-background text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2.5 text-sm font-bold transition-colors focus:border-[var(--color-brand-green)]/60 focus:outline-none"
              disabled={loadingBrands}
            >
              <option value="">{loadingBrands ? 'Loading Brands...' : 'Select Brand'}</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-muted text-[10px] font-black tracking-wider uppercase">
              Model
            </label>
            <select
              value={selectedTractorId || ''}
              onChange={(e) => onTractorChange(e.target.value ? Number(e.target.value) : undefined)}
              className="bg-background text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2.5 text-sm font-bold transition-colors focus:border-[var(--color-brand-green)]/60 focus:outline-none"
              disabled={!selectedBrandId || loadingTractors}
            >
              <option value="">
                {!selectedBrandId
                  ? 'First select a Brand'
                  : loadingTractors
                    ? 'Loading Models...'
                    : 'Select Model'}
              </option>
              {tractors.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.modelName} {t.hp ? `(${t.hp} HP)` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* TRACTOR PRICE INPUT */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="vehiclePrice"
            className="text-muted text-xs font-black tracking-wider uppercase"
          >
            Tractor Ex-Showroom Price
          </label>
          {errors.vehiclePrice && (
            <span className="text-[10px] font-bold text-red-500 uppercase">
              {errors.vehiclePrice}
            </span>
          )}
        </div>
        <div className="bg-background flex items-center rounded-2xl border border-[var(--border-subtle)] px-4 py-3 shadow-inner transition-colors focus-within:border-[var(--color-brand-green)]">
          <span className="text-muted mr-2 font-bold">₹</span>
          <input
            id="vehiclePrice"
            type="number"
            value={vehiclePrice || ''}
            onChange={(e) => handlePriceChange(parseInt(e.target.value, 10))}
            className="text-foreground w-full [appearance:textfield] border-none bg-transparent text-lg font-bold outline-none focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            placeholder="Enter price"
            min={EMI_LIMITS.VEHICLE_PRICE_MIN}
            max={EMI_LIMITS.VEHICLE_PRICE_MAX}
          />
        </div>
        <input
          type="range"
          min={EMI_LIMITS.VEHICLE_PRICE_MIN}
          max={EMI_LIMITS.VEHICLE_PRICE_MAX}
          step={EMI_LIMITS.VEHICLE_PRICE_STEP}
          value={vehiclePrice}
          onChange={(e) => handlePriceChange(parseInt(e.target.value, 10))}
          className="bg-foreground/10 mt-2 h-1 w-full cursor-pointer appearance-none rounded-lg accent-[var(--color-brand-green)]"
        />

        {/* Quick select presets for farmer convenience */}
        <div className="mt-1 flex flex-wrap gap-2">
          {[400000, 600000, 800000, 1200000].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setQuickPrice(amt)}
              className="bg-foreground/5 text-muted rounded-lg px-2.5 py-1 text-[10px] font-extrabold uppercase transition-all hover:bg-[var(--color-brand-green)]/10 hover:text-[var(--color-brand-green)]"
            >
              ₹ {(amt / 100000).toFixed(0)} Lakh
            </button>
          ))}
        </div>
      </div>

      {/* DOWN PAYMENT INPUTS */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="downPayment"
            className="text-muted text-xs font-black tracking-wider uppercase"
          >
            Down Payment
          </label>
          {errors.downPayment && (
            <span className="text-[10px] font-bold text-red-500 uppercase">
              {errors.downPayment}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          {/* Amount input */}
          <div className="bg-background flex items-center rounded-2xl border border-[var(--border-subtle)] px-4 py-3 shadow-inner transition-colors focus-within:border-[var(--color-brand-green)] md:col-span-3">
            <span className="text-muted mr-2 font-bold">₹</span>
            <input
              id="downPayment"
              type="number"
              value={downPayment || ''}
              onChange={(e) => handleDownPaymentAmountChange(parseInt(e.target.value, 10))}
              className="text-foreground w-full [appearance:textfield] border-none bg-transparent font-bold outline-none focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              placeholder="0"
              min={0}
              max={vehiclePrice}
            />
          </div>

          {/* Percentage input */}
          <div className="bg-background flex items-center rounded-2xl border border-[var(--border-subtle)] px-4 py-3 shadow-inner transition-colors focus-within:border-[var(--color-brand-green)] md:col-span-2">
            <input
              type="number"
              value={downPaymentPercent || ''}
              onChange={(e) => handleDownPaymentPercentChange(parseInt(e.target.value, 10))}
              className="text-foreground w-full [appearance:textfield] border-none bg-transparent pr-1 text-right font-bold outline-none focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              placeholder="0"
              min={0}
              max={EMI_LIMITS.DOWN_PAYMENT_MAX_PERCENT}
            />
            <Percent size={14} className="text-muted" />
          </div>
        </div>

        <input
          type="range"
          min={0}
          max={EMI_LIMITS.DOWN_PAYMENT_MAX_PERCENT}
          step={1}
          value={downPaymentPercent}
          onChange={(e) => handleDownPaymentPercentChange(parseInt(e.target.value, 10))}
          className="bg-foreground/10 mt-2 h-1 w-full cursor-pointer appearance-none rounded-lg accent-[var(--color-brand-green)]"
        />

        <div className="text-muted flex items-center justify-between text-[10px] font-bold">
          <span>Min: ₹0 (0%)</span>
          <span className="flex items-center gap-1">
            <HelpCircle size={10} /> Max down payment: {EMI_LIMITS.DOWN_PAYMENT_MAX_PERCENT}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* INTEREST RATE */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="interestRate"
              className="text-muted text-xs font-black tracking-wider uppercase"
            >
              Interest Rate (% P.A.)
            </label>
            {errors.interestRate && (
              <span className="text-[10px] font-bold text-red-500 uppercase">
                {errors.interestRate}
              </span>
            )}
          </div>
          <div className="bg-background flex items-center rounded-2xl border border-[var(--border-subtle)] px-4 py-3 shadow-inner transition-colors focus-within:border-[var(--color-brand-green)]">
            <input
              id="interestRate"
              type="number"
              step="0.1"
              value={interestRate ?? ''}
              onChange={(e) => onChange({ ...inputs, interestRate: parseFloat(e.target.value) })}
              className="text-foreground w-full [appearance:textfield] border-none bg-transparent font-bold outline-none focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              placeholder="0.0"
              min={EMI_LIMITS.INTEREST_RATE_MIN}
              max={EMI_LIMITS.INTEREST_RATE_MAX}
            />
            <Percent size={14} className="text-muted" />
          </div>
          <input
            type="range"
            min={EMI_LIMITS.INTEREST_RATE_MIN}
            max={EMI_LIMITS.INTEREST_RATE_MAX}
            step={EMI_LIMITS.INTEREST_RATE_STEP}
            value={interestRate}
            onChange={(e) => onChange({ ...inputs, interestRate: parseFloat(e.target.value) })}
            className="bg-foreground/10 mt-2 h-1 w-full cursor-pointer appearance-none rounded-lg accent-[var(--color-brand-green)]"
          />
        </div>

        {/* TENURE */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="tenureValue"
              className="text-muted text-xs font-black tracking-wider uppercase"
            >
              Loan Tenure
            </label>
            {errors.tenureValue && (
              <span className="text-[10px] font-bold text-red-500 uppercase">
                {errors.tenureValue}
              </span>
            )}
          </div>

          <div className="bg-background flex items-center rounded-2xl border border-[var(--border-subtle)] p-1 shadow-inner transition-colors focus-within:border-[var(--color-brand-green)]">
            <input
              id="tenureValue"
              type="number"
              value={tenureValue || ''}
              onChange={(e) => onChange({ ...inputs, tenureValue: parseInt(e.target.value, 10) })}
              className="text-foreground w-full [appearance:textfield] border-none bg-transparent px-3 py-2 font-bold outline-none focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              placeholder="0"
              min={
                tenureUnit === 'years' ? EMI_LIMITS.TENURE_YEARS_MIN : EMI_LIMITS.TENURE_MONTHS_MIN
              }
              max={
                tenureUnit === 'years' ? EMI_LIMITS.TENURE_YEARS_MAX : EMI_LIMITS.TENURE_MONTHS_MAX
              }
            />

            {/* Tenure Unit Select Tabs */}
            <div className="bg-foreground/5 flex shrink-0 rounded-xl p-1">
              <button
                type="button"
                onClick={() => {
                  const newTenureValue =
                    tenureUnit === 'months'
                      ? Math.max(1, Math.round(tenureValue / 12))
                      : tenureValue;
                  onChange({
                    ...inputs,
                    tenureUnit: 'years',
                    tenureValue: newTenureValue,
                  });
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase transition-all ${
                  tenureUnit === 'years'
                    ? 'bg-background text-[var(--color-brand-orange)] shadow-sm'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                Yrs
              </button>
              <button
                type="button"
                onClick={() => {
                  const newTenureValue = tenureUnit === 'years' ? tenureValue * 12 : tenureValue;
                  onChange({
                    ...inputs,
                    tenureUnit: 'months',
                    tenureValue: newTenureValue,
                  });
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase transition-all ${
                  tenureUnit === 'months'
                    ? 'bg-background text-[var(--color-brand-orange)] shadow-sm'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                Mths
              </button>
            </div>
          </div>

          <input
            type="range"
            min={
              tenureUnit === 'years' ? EMI_LIMITS.TENURE_YEARS_MIN : EMI_LIMITS.TENURE_MONTHS_MIN
            }
            max={
              tenureUnit === 'years' ? EMI_LIMITS.TENURE_YEARS_MAX : EMI_LIMITS.TENURE_MONTHS_MAX
            }
            step={
              tenureUnit === 'years' ? EMI_LIMITS.TENURE_YEARS_STEP : EMI_LIMITS.TENURE_MONTHS_STEP
            }
            value={tenureValue}
            onChange={(e) => onChange({ ...inputs, tenureValue: parseInt(e.target.value, 10) })}
            className="bg-foreground/10 mt-2 h-1 w-full cursor-pointer appearance-none rounded-lg accent-[var(--color-brand-green)]"
          />
        </div>
      </div>
    </div>
  );
};
