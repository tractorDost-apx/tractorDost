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

  const [activeTab, setActiveTab] = useState<'brand' | 'manual'>(selectedBrandId ? 'brand' : 'manual');

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
    <div className="w-full flex flex-col gap-6 bg-[var(--card-bg)] border border-[var(--card-border)] p-6 md:p-8 rounded-3xl shadow-[var(--card-shadow)] relative overflow-hidden backdrop-blur-md">
      {/* Background glow element */}
      <div className="absolute top-0 left-0 w-24 h-24 bg-[var(--color-brand-green)]/5 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
        <h2 className="text-xl md:text-2xl font-black uppercase text-foreground tracking-tight">
          Calculation Form
        </h2>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-foreground/5 hover:bg-[var(--color-brand-orange)]/10 text-xs font-bold text-muted hover:text-[var(--color-brand-orange)] border border-transparent hover:border-[var(--color-brand-orange)]/20 transition-all uppercase tracking-wider"
          title="Reset calculations to default"
        >
          <RotateCcw size={13} /> Reset
        </button>
      </div>

      {/* TRACTOR PRICE SELECTOR TABS */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-black uppercase tracking-wider text-muted">
          Pricing Method
        </label>
        <div className="grid grid-cols-2 bg-foreground/5 p-1 rounded-2xl border border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => handleTabChange('manual')}
            className={`py-2 px-4 rounded-xl text-sm font-bold uppercase transition-all ${
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
            className={`py-2 px-4 rounded-xl text-sm font-bold uppercase transition-all ${
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-foreground/5 p-4 rounded-2xl border border-[var(--border-subtle)] animate-fade-in">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-muted">Brand</label>
            <select
              value={selectedBrandId || ''}
              onChange={(e) => onBrandChange(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-background border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:border-[var(--color-brand-green)]/60 transition-colors"
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
            <label className="text-[10px] font-black uppercase tracking-wider text-muted">Model</label>
            <select
              value={selectedTractorId || ''}
              onChange={(e) => onTractorChange(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-background border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:border-[var(--color-brand-green)]/60 transition-colors"
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
        <div className="flex justify-between items-center">
          <label htmlFor="vehiclePrice" className="text-xs font-black uppercase tracking-wider text-muted">
            Tractor Ex-Showroom Price
          </label>
          {errors.vehiclePrice && (
            <span className="text-[10px] font-bold text-red-500 uppercase">{errors.vehiclePrice}</span>
          )}
        </div>
        <div className="flex items-center bg-background border border-[var(--border-subtle)] focus-within:border-[var(--color-brand-green)] rounded-2xl px-4 py-3 shadow-inner transition-colors">
          <span className="text-muted font-bold mr-2">₹</span>
          <input
            id="vehiclePrice"
            type="number"
            value={vehiclePrice || ''}
            onChange={(e) => handlePriceChange(parseInt(e.target.value, 10))}
            className="w-full bg-transparent border-none outline-none font-bold text-lg text-foreground focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
          className="w-full h-1 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-[var(--color-brand-green)] mt-2"
        />
        
        {/* Quick select presets for farmer convenience */}
        <div className="flex flex-wrap gap-2 mt-1">
          {[400000, 600000, 800000, 1200000].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setQuickPrice(amt)}
              className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg bg-foreground/5 hover:bg-[var(--color-brand-green)]/10 text-muted hover:text-[var(--color-brand-green)] transition-all"
            >
              ₹ {(amt / 100000).toFixed(0)} Lakh
            </button>
          ))}
        </div>
      </div>

      {/* DOWN PAYMENT INPUTS */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label htmlFor="downPayment" className="text-xs font-black uppercase tracking-wider text-muted">
            Down Payment
          </label>
          {errors.downPayment && (
            <span className="text-[10px] font-bold text-red-500 uppercase">{errors.downPayment}</span>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Amount input */}
          <div className="md:col-span-3 flex items-center bg-background border border-[var(--border-subtle)] focus-within:border-[var(--color-brand-green)] rounded-2xl px-4 py-3 shadow-inner transition-colors">
            <span className="text-muted font-bold mr-2">₹</span>
            <input
              id="downPayment"
              type="number"
              value={downPayment || ''}
              onChange={(e) => handleDownPaymentAmountChange(parseInt(e.target.value, 10))}
              className="w-full bg-transparent border-none outline-none font-bold text-foreground focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0"
              min={0}
              max={vehiclePrice}
            />
          </div>
          
          {/* Percentage input */}
          <div className="md:col-span-2 flex items-center bg-background border border-[var(--border-subtle)] focus-within:border-[var(--color-brand-green)] rounded-2xl px-4 py-3 shadow-inner transition-colors">
            <input
              type="number"
              value={downPaymentPercent || ''}
              onChange={(e) => handleDownPaymentPercentChange(parseInt(e.target.value, 10))}
              className="w-full bg-transparent border-none outline-none font-bold text-foreground focus:ring-0 text-right pr-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
          className="w-full h-1 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-[var(--color-brand-green)] mt-2"
        />

        <div className="flex justify-between items-center text-[10px] font-bold text-muted">
          <span>Min: ₹0 (0%)</span>
          <span className="flex items-center gap-1">
            <HelpCircle size={10} /> Max down payment: {EMI_LIMITS.DOWN_PAYMENT_MAX_PERCENT}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* INTEREST RATE */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label htmlFor="interestRate" className="text-xs font-black uppercase tracking-wider text-muted">
              Interest Rate (% P.A.)
            </label>
            {errors.interestRate && (
              <span className="text-[10px] font-bold text-red-500 uppercase">{errors.interestRate}</span>
            )}
          </div>
          <div className="flex items-center bg-background border border-[var(--border-subtle)] focus-within:border-[var(--color-brand-green)] rounded-2xl px-4 py-3 shadow-inner transition-colors">
            <input
              id="interestRate"
              type="number"
              step="0.1"
              value={interestRate ?? ''}
              onChange={(e) => onChange({ ...inputs, interestRate: parseFloat(e.target.value) })}
              className="w-full bg-transparent border-none outline-none font-bold text-foreground focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
            className="w-full h-1 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-[var(--color-brand-green)] mt-2"
          />
        </div>

        {/* TENURE */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label htmlFor="tenureValue" className="text-xs font-black uppercase tracking-wider text-muted">
              Loan Tenure
            </label>
            {errors.tenureValue && (
              <span className="text-[10px] font-bold text-red-500 uppercase">{errors.tenureValue}</span>
            )}
          </div>

          <div className="flex items-center bg-background border border-[var(--border-subtle)] focus-within:border-[var(--color-brand-green)] rounded-2xl p-1 shadow-inner transition-colors">
            <input
              id="tenureValue"
              type="number"
              value={tenureValue || ''}
              onChange={(e) => onChange({ ...inputs, tenureValue: parseInt(e.target.value, 10) })}
              className="w-full bg-transparent border-none outline-none font-bold text-foreground px-3 py-2 focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0"
              min={tenureUnit === 'years' ? EMI_LIMITS.TENURE_YEARS_MIN : EMI_LIMITS.TENURE_MONTHS_MIN}
              max={tenureUnit === 'years' ? EMI_LIMITS.TENURE_YEARS_MAX : EMI_LIMITS.TENURE_MONTHS_MAX}
            />
            
            {/* Tenure Unit Select Tabs */}
            <div className="flex bg-foreground/5 p-1 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => {
                  const newTenureValue = tenureUnit === 'months' 
                    ? Math.max(1, Math.round(tenureValue / 12)) 
                    : tenureValue;
                  onChange({
                    ...inputs,
                    tenureUnit: 'years',
                    tenureValue: newTenureValue,
                  });
                }}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold uppercase transition-all ${
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
                  const newTenureValue = tenureUnit === 'years'
                    ? tenureValue * 12
                    : tenureValue;
                  onChange({
                    ...inputs,
                    tenureUnit: 'months',
                    tenureValue: newTenureValue,
                  });
                }}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold uppercase transition-all ${
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
            min={tenureUnit === 'years' ? EMI_LIMITS.TENURE_YEARS_MIN : EMI_LIMITS.TENURE_MONTHS_MIN}
            max={tenureUnit === 'years' ? EMI_LIMITS.TENURE_YEARS_MAX : EMI_LIMITS.TENURE_MONTHS_MAX}
            step={tenureUnit === 'years' ? EMI_LIMITS.TENURE_YEARS_STEP : EMI_LIMITS.TENURE_MONTHS_STEP}
            value={tenureValue}
            onChange={(e) => onChange({ ...inputs, tenureValue: parseInt(e.target.value, 10) })}
            className="w-full h-1 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-[var(--color-brand-green)] mt-2"
          />
        </div>
      </div>
    </div>
  );
};
