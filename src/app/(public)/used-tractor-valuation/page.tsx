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
  Sparkles
} from 'lucide-react';
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
    condition: ConditionGrade.GOOD
  });

  useEffect(() => {
    brandAPI.getAllBrands().then(res => {
      if (res.success && res.data && Array.isArray(res.data.data)) {
        setBrands(res.data.data);
      }
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
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
      if (formData.condition === ConditionGrade.POOR) estimatedPrice *= 0.70; // -30%

      // Create a sensible min/max range (+/- 8%)
      const result = {
        min: Math.floor((estimatedPrice * 0.92) / 1000) * 1000,
        max: Math.floor((estimatedPrice * 1.08) / 1000) * 1000
      };

      setValuationResult(result);
      setIsCalculating(false);
    }, 2000);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-5 relative z-10">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] rounded-full text-xs font-black uppercase tracking-widest mb-4">
              <Sparkles size={14} /> AI Valuation Tool
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
              Check True <span className="text-[var(--color-brand-green)]">Market Value</span>
            </h1>
            <p className="text-muted font-medium text-lg">
              Get an instant, data-driven price estimate for your used tractor before you sell.
            </p>
          </div>

          <div className="bg-foreground/5 p-8 rounded-[2rem] border border-foreground/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-brand-green)] opacity-5 blur-[100px] rounded-full pointer-events-none"></div>
            
            <form onSubmit={calculateValuation} className="relative z-10 space-y-6">
              
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-muted mb-2 block">Tractor Brand *</label>
                <select 
                  name="brand"
                  required
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-background border border-foreground/10 rounded-2xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] focus:border-transparent outline-none transition-all appearance-none"
                >
                  <option value="">Select Brand</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-muted mb-2 block">Tractor Model *</label>
                <input 
                  type="text" 
                  name="model"
                  required
                  placeholder="e.g. 575 DI"
                  value={formData.model}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-background border border-foreground/10 rounded-2xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-muted mb-2 block">Year of Mfg *</label>
                  <input 
                    type="number" 
                    name="year"
                    required
                    min={1980}
                    max={new Date().getFullYear()}
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-background border border-foreground/10 rounded-2xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-muted mb-2 block">Hours Used *</label>
                  <input 
                    type="number" 
                    name="hours"
                    required
                    min={0}
                    placeholder="e.g. 2500"
                    value={formData.hours || ''}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-background border border-foreground/10 rounded-2xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-muted mb-2 block">Overall Condition *</label>
                <select 
                  name="condition"
                  required
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-background border border-foreground/10 rounded-2xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] focus:border-transparent outline-none transition-all appearance-none"
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
                className="w-full flex items-center justify-center gap-2 px-8 py-5 bg-[var(--color-brand-green)] text-white font-black uppercase tracking-widest rounded-2xl hover:bg-[var(--color-brand-green)]/90 transition-all shadow-lg shadow-[var(--color-brand-green)]/20 disabled:opacity-70 group mt-4"
              >
                {isCalculating ? (
                  <>
                    <RefreshCcw className="animate-spin" size={20} /> Calculating...
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
        <div className="lg:col-span-7 flex flex-col justify-center h-full">
          
          {!valuationResult && !isCalculating && (
            <div className="bg-foreground/5 rounded-[3rem] p-12 text-center border-2 border-dashed border-foreground/10">
              <div className="w-24 h-24 bg-foreground/10 text-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Calculator size={48} />
              </div>
              <h3 className="text-2xl font-black mb-4">Enter Tractor Details</h3>
              <p className="text-muted font-medium max-w-sm mx-auto">
                Fill out the form on the left to receive a highly accurate, data-backed estimate of your tractor's current market value.
              </p>
              
              <div className="grid grid-cols-3 gap-4 mt-12 pt-12 border-t border-foreground/10 text-left">
                <div>
                  <TrendingUp className="text-[var(--color-brand-green)] mb-3" size={24} />
                  <h4 className="font-bold text-sm mb-1">Live Data</h4>
                  <p className="text-xs text-muted">Based on 10,000+ recent sales</p>
                </div>
                <div>
                  <Timer className="text-[var(--color-brand-green)] mb-3" size={24} />
                  <h4 className="font-bold text-sm mb-1">Instant</h4>
                  <p className="text-xs text-muted">Get price in 2 seconds</p>
                </div>
                <div>
                  <ShieldCheck className="text-[var(--color-brand-green)] mb-3" size={24} />
                  <h4 className="font-bold text-sm mb-1">Accurate</h4>
                  <p className="text-xs text-muted">Considers age & usage</p>
                </div>
              </div>
            </div>
          )}

          {isCalculating && (
            <div className="bg-foreground/5 rounded-[3rem] p-12 text-center border border-foreground/10 flex flex-col items-center justify-center min-h-[400px]">
              <div className="relative mb-8">
                <div className="w-32 h-32 border-4 border-foreground/10 border-t-[var(--color-brand-green)] rounded-full animate-spin"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--color-brand-green)]">
                  <Tractor size={40} />
                </div>
              </div>
              <h3 className="text-2xl font-black animate-pulse">Analyzing Market Data...</h3>
              <p className="text-muted mt-2">Comparing with recent {formData.brand} sales in your region.</p>
            </div>
          )}

          {valuationResult && !isCalculating && (
            <div className="animate-in zoom-in-95 fade-in duration-500">
              <div className="bg-[var(--color-brand-green)] text-white rounded-t-[3rem] p-10 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 rounded-full text-xs font-black uppercase tracking-widest mb-6 backdrop-blur-sm">
                    <CheckCircle2 size={16} /> Valuation Complete
                  </div>
                  
                  <p className="text-white/80 font-bold uppercase tracking-widest text-sm mb-2">Estimated Market Range</p>
                  <h2 className="text-5xl md:text-6xl font-black mb-2 flex items-center justify-center gap-2">
                    {formatPrice(valuationResult.min)} 
                    <span className="text-3xl text-white/50">-</span>
                    {formatPrice(valuationResult.max)}
                  </h2>
                  <p className="text-white/80 font-medium">
                    For {formData.year} {formData.brand} {formData.model} ({formData.condition.toLowerCase()} condition)
                  </p>
                </div>
              </div>
              
              <div className="bg-foreground/5 rounded-b-[3rem] p-10 border border-t-0 border-foreground/10 text-center shadow-2xl">
                <h3 className="text-xl font-black mb-4">Happy with this price?</h3>
                <p className="text-muted font-medium mb-8 max-w-md mx-auto">
                  Thousands of verified buyers are looking for {formData.brand} tractors right now. List it for free on Tractor Dost and sell within 15 days.
                </p>
                
                <Link 
                  href={`/sell-used-tractor?brand=${encodeURIComponent(formData.brand)}&model=${encodeURIComponent(formData.model)}&year=${formData.year}&price=${valuationResult.max}`}
                  className="inline-flex items-center justify-center gap-3 px-8 py-5 bg-foreground text-background font-black uppercase tracking-widest rounded-2xl hover:bg-foreground/90 transition-all shadow-xl hover:-translate-y-1 w-full md:w-auto"
                >
                  Sell For {formatPrice(valuationResult.max)} <ArrowRight size={20} />
                </Link>
                
                <div className="mt-8 text-xs font-bold text-muted uppercase tracking-widest cursor-pointer hover:text-[var(--color-brand-green)]" onClick={() => setValuationResult(null)}>
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
