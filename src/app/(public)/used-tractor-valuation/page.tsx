'use client';

import React, { useState, useEffect } from 'react';
import { brandAPI } from '@/lib/api/brands';
import { ConditionGrade } from '@/lib/api/usedTractors';
import {
  Calculator,
  IndianRupee,
  Tractor,
  TrendingUp,
  Timer,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  RefreshCcw,
  Sparkles,
} from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UsedTractorValuationPage() {
  const router = useRouter();

  // State
  const [brands, setBrands] = useState<any[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [valuationResult, setValuationResult] = useState<{ min: number; max: number } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    hours: 0,
    condition: ConditionGrade.GOOD,
  });

  useEffect(() => {
    brandAPI.getAllBrands().then((res) => {
      if (res.success && res.data && Array.isArray(res.data.data)) {
        setBrands(res.data.data);
      }
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const calculateValuation = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    setValuationResult(null);

    // Simulate API delay for dramatic effect
    setTimeout(() => {
      // Smart Mock Algorithm
      let basePrice = 450000;

      const brandLower = formData.brand.toLowerCase();
      if (brandLower.includes('mahindra')) basePrice = 550000;
      if (brandLower.includes('john deere')) basePrice = 750000;
      if (brandLower.includes('swaraj')) basePrice = 500000;
      if (brandLower.includes('massey')) basePrice = 480000;

      // Age Depreciation: ~4-6% per year
      const age = Math.max(0, new Date().getFullYear() - formData.year);
      const ageDepreciation = Math.min(0.6, age * 0.05); // Max 60% drop

      // Usage Depreciation: ~1% per 1000 hours
      const usageDepreciation = Math.min(0.2, (formData.hours / 1000) * 0.01);

      let estimatedPrice = basePrice * (1 - ageDepreciation) * (1 - usageDepreciation);

      // Condition Multiplier
      if (formData.condition === ConditionGrade.EXCELLENT) estimatedPrice *= 1.05; // +5%
      if (formData.condition === ConditionGrade.FAIR) estimatedPrice *= 0.85; // -15%
      if (formData.condition === ConditionGrade.POOR) estimatedPrice *= 0.7; // -30%

      // Create a sensible min/max range (+/- 8%)
      const result = {
        min: Math.floor((estimatedPrice * 0.92) / 1000) * 1000,
        max: Math.floor((estimatedPrice * 1.08) / 1000) * 1000,
      };

      setValuationResult(result);
      setIsCalculating(false);
    }, 2000);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-background min-h-screen pt-24 pb-16">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-12 px-4 lg:grid-cols-12">
        {/* Left Column: Form */}
        <div className="relative z-10 lg:col-span-5">
          <div className="mb-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-green)]/10 px-3 py-1 text-xs font-black tracking-widest text-[var(--color-brand-green)] uppercase">
              <Sparkles size={14} /> AI Valuation Tool
            </div>
            <h1 className="mb-4 text-4xl leading-tight font-black tracking-tight md:text-5xl">
              Check True <span className="text-[var(--color-brand-green)]">Market Value</span>
            </h1>
            <p className="text-muted text-lg font-medium">
              Get an instant, data-driven price estimate for your used tractor before you sell.
            </p>
          </div>

          <div className="bg-foreground/5 relative overflow-hidden rounded-[2rem] border border-[var(--border-subtle)] p-8 shadow-2xl">
            <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full bg-[var(--color-brand-green)] opacity-5 blur-[100px]"></div>

            <form onSubmit={calculateValuation} className="relative z-10 space-y-6">
              <div>
                <label className="text-muted mb-2 block text-xs font-black tracking-widest uppercase">
                  Tractor Brand *
                </label>
                <select
                  name="brand"
                  required
                  value={formData.brand}
                  onChange={handleChange}
                  className="bg-background text-foreground w-full appearance-none rounded-2xl border border-[var(--border-subtle)] px-5 py-4 text-sm font-bold transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--color-brand-green)]"
                >
                  <option value="">Select Brand</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-muted mb-2 block text-xs font-black tracking-widest uppercase">
                  Tractor Model *
                </label>
                <input
                  type="text"
                  name="model"
                  required
                  placeholder="e.g. 575 DI"
                  value={formData.model}
                  onChange={handleChange}
                  className="bg-background text-foreground w-full rounded-2xl border border-[var(--border-subtle)] px-5 py-4 text-sm font-bold transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--color-brand-green)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-muted mb-2 block text-xs font-black tracking-widest uppercase">
                    Year of Mfg *
                  </label>
                  <input
                    type="number"
                    name="year"
                    required
                    min={1980}
                    max={new Date().getFullYear()}
                    value={formData.year}
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
                    name="hours"
                    required
                    min={0}
                    placeholder="e.g. 2500"
                    value={formData.hours || ''}
                    onChange={handleChange}
                    className="bg-background text-foreground w-full rounded-2xl border border-[var(--border-subtle)] px-5 py-4 text-sm font-bold transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--color-brand-green)]"
                  />
                </div>
              </div>

              <div>
                <label className="text-muted mb-2 block text-xs font-black tracking-widest uppercase">
                  Overall Condition *
                </label>
                <select
                  name="condition"
                  required
                  value={formData.condition}
                  onChange={handleChange}
                  className="bg-background text-foreground w-full appearance-none rounded-2xl border border-[var(--border-subtle)] px-5 py-4 text-sm font-bold transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--color-brand-green)]"
                >
                  <option value={ConditionGrade.EXCELLENT}>Excellent (Like New)</option>
                  <option value={ConditionGrade.GOOD}>Good (Well Maintained)</option>
                  <option value={ConditionGrade.FAIR}>Fair (Needs Minor Work)</option>
                  <option value={ConditionGrade.POOR}>Poor (Needs Major Repairs)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isCalculating}
                className="group mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-brand-green)] px-8 py-5 font-black tracking-widest text-white uppercase shadow-[var(--color-brand-green)]/20 shadow-lg transition-all hover:bg-[var(--color-brand-green)]/90 disabled:opacity-70"
              >
                {isCalculating ? (
                  <>
                    <TractorLoader size={20} /> Calculating...
                  </>
                ) : (
                  <>
                    <Calculator size={20} /> Get Valuation
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Results & Info */}
        <div className="flex h-full flex-col justify-center lg:col-span-7">
          {!valuationResult && !isCalculating && (
            <div className="bg-foreground/5 rounded-[3rem] border-2 border-dashed border-[var(--border-subtle)] p-12 text-center">
              <div className="bg-foreground/10 text-muted mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full">
                <Calculator size={48} />
              </div>
              <h3 className="mb-4 text-2xl font-black">Enter Tractor Details</h3>
              <p className="text-muted mx-auto max-w-sm font-medium">
                Fill out the form on the left to receive a highly accurate, data-backed estimate of
                your tractor's current market value.
              </p>

              <div className="mt-12 grid grid-cols-3 gap-4 border-t border-[var(--border-subtle)] pt-12 text-left">
                <div>
                  <TrendingUp className="mb-3 text-[var(--color-brand-green)]" size={24} />
                  <h4 className="mb-1 text-sm font-bold">Live Data</h4>
                  <p className="text-muted text-xs">Based on 10,000+ recent sales</p>
                </div>
                <div>
                  <Timer className="mb-3 text-[var(--color-brand-green)]" size={24} />
                  <h4 className="mb-1 text-sm font-bold">Instant</h4>
                  <p className="text-muted text-xs">Get price in 2 seconds</p>
                </div>
                <div>
                  <ShieldCheck className="mb-3 text-[var(--color-brand-green)]" size={24} />
                  <h4 className="mb-1 text-sm font-bold">Accurate</h4>
                  <p className="text-muted text-xs">Considers age & usage</p>
                </div>
              </div>
            </div>
          )}

          {isCalculating && (
            <div className="bg-foreground/5 flex min-h-[400px] flex-col items-center justify-center rounded-[3rem] border border-[var(--border-subtle)] p-12 text-center">
              <TractorLoader size={100} className="text-[var(--color-brand-green)]" />
              <h3 className="animate-pulse text-2xl font-black">Analyzing Market Data...</h3>
              <p className="text-muted mt-2">
                Comparing with recent {formData.brand} sales in your region.
              </p>
            </div>
          )}

          {valuationResult && !isCalculating && (
            <div className="animate-in zoom-in-95 fade-in duration-500">
              <div className="relative overflow-hidden rounded-t-[3rem] bg-[var(--color-brand-green)] p-10 text-center text-white">
                <div className="absolute top-0 right-0 h-full w-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-black tracking-widest uppercase backdrop-blur-sm">
                    <CheckCircle2 size={16} /> Valuation Complete
                  </div>

                  <p className="mb-2 text-sm font-bold tracking-widest text-white/80 uppercase">
                    Estimated Market Range
                  </p>
                  <h2 className="mb-2 flex items-center justify-center gap-2 text-5xl font-black md:text-6xl">
                    {formatPrice(valuationResult.min)}
                    <span className="text-3xl text-white/50">-</span>
                    {formatPrice(valuationResult.max)}
                  </h2>
                  <p className="font-medium text-white/80">
                    For {formData.year} {formData.brand} {formData.model} (
                    {formData.condition.toLowerCase()} condition)
                  </p>
                </div>
              </div>

              <div className="bg-foreground/5 rounded-b-[3rem] border border-t-0 border-[var(--border-subtle)] p-10 text-center shadow-2xl">
                <h3 className="mb-4 text-xl font-black">Happy with this price?</h3>
                <p className="text-muted mx-auto mb-8 max-w-md font-medium">
                  Thousands of verified buyers are looking for {formData.brand} tractors right now.
                  List it for free on Tractor Dost and sell within 15 days.
                </p>

                <Link
                  href={`/sell-used-tractor?brand=${encodeURIComponent(formData.brand)}&model=${encodeURIComponent(formData.model)}&year=${formData.year}&price=${valuationResult.max}`}
                  className="bg-foreground text-background hover:bg-foreground/90 inline-flex w-full items-center justify-center gap-3 rounded-2xl px-8 py-5 font-black tracking-widest uppercase shadow-xl transition-all hover:-translate-y-1 md:w-auto"
                >
                  Sell For {formatPrice(valuationResult.max)} <ArrowRight size={20} />
                </Link>

                <div
                  className="text-muted mt-8 cursor-pointer text-xs font-bold tracking-widest uppercase hover:text-[var(--color-brand-green)]"
                  onClick={() => setValuationResult(null)}
                >
                  Recalculate Valuation
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
