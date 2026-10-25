'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CircleDot,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
  Layers,
  Wrench,
  X,
  Phone,
  Building2,
} from 'lucide-react';
import { leadAPI } from '@/lib/api/leads';
import { TractorLoader } from '@/components/ui/TractorLoader';

interface TyreItem {
  id: number;
  brand: string;
  model: string;
  position: 'FRONT' | 'REAR';
  size: string;
  plyRating: string;
  suitableHp: string;
  patternType: string;
  soilSuitability: string;
  priceEst: string;
  warrantyYears: number;
  features: string[];
}

const TYRES_DATA: TyreItem[] = [
  // Front Tyres
  {
    id: 1,
    brand: 'BKT',
    model: 'BKT Farm 2000 3-Rib',
    position: 'FRONT',
    size: '6.00-16',
    plyRating: '8 PR',
    suitableHp: '35 - 50 HP',
    patternType: '3-Rib Steering Pattern',
    soilSuitability: 'All-Terrain & Haulage',
    priceEst: '₹4,200 - ₹4,800',
    warrantyYears: 7,
    features: ['High-resistance rubber compound against stubble puncture', 'Self-cleaning rib grooves for accurate steering in wet clay'],
  },
  {
    id: 2,
    brand: 'Apollo',
    model: 'Apollo Krishak Premium Steer',
    position: 'FRONT',
    size: '6.50-16',
    plyRating: '8 PR',
    suitableHp: '45 - 60 HP',
    patternType: 'Multi-Rib High Shoulder',
    soilSuitability: 'Plowing & Road Haulage',
    priceEst: '₹4,600 - ₹5,200',
    warrantyYears: 5,
    features: ['Reinforced center rib reduces highway rolling resistance', 'Uniform contact patch prevents uneven tread shoulder wear'],
  },
  {
    id: 3,
    brand: 'MRF',
    model: 'MRF Shakti Life Front',
    position: 'FRONT',
    size: '7.50-16',
    plyRating: '8 PR',
    suitableHp: '50 - 75 HP (4WD Front)',
    patternType: 'Heavy Duty 3-Rib',
    soilSuitability: 'Heavy Agricultural & Front Loader',
    priceEst: '₹5,800 - ₹6,400',
    warrantyYears: 5,
    features: ['Designed for heavy front loader and front-axle weights', 'Cut-and-chip resistant tread compound'],
  },
  // Rear Tyres
  {
    id: 4,
    brand: 'BKT',
    model: 'BKT Agrimax RT 855 Radial',
    position: 'REAR',
    size: '13.6-28',
    plyRating: '12 PR Equivalent',
    suitableHp: '40 - 50 HP',
    patternType: 'Deep 45° Curved Traction Lugs',
    soilSuitability: 'Soft Clay & Puddling',
    priceEst: '₹28,500 - ₹31,000',
    warrantyYears: 7,
    features: ['Radial construction provides 15% larger footprint reducing soil compaction', 'High lug depth for unbeatable pulling power in wet fields'],
  },
  {
    id: 5,
    brand: 'Apollo',
    model: 'Apollo FX 515 Farm Muscler',
    position: 'REAR',
    size: '14.9-28',
    plyRating: '12 PR',
    suitableHp: '50 - 65 HP',
    patternType: 'Dual-Angle Interlocking Lugs',
    soilSuitability: 'Hardpan Soil, Plowing & Haulage',
    priceEst: '₹34,000 - ₹37,500',
    warrantyYears: 5,
    features: ['Dual-angle lug geometry delivers maximum traction in fields and smooth road transit', 'Tie-bars between lugs prevent lug tearing under extreme torque'],
  },
  {
    id: 6,
    brand: 'MRF',
    model: 'MRF Farm Muscler Premium Rear',
    position: 'REAR',
    size: '14.9-28',
    plyRating: '12 PR',
    suitableHp: '50 - 65 HP',
    patternType: 'Deep Curved Rice & Cane Lugs',
    soilSuitability: 'Sugarcane & Heavy Haulage',
    priceEst: '₹35,500 - ₹38,500',
    warrantyYears: 5,
    features: ['Reinforced sidewall protects against stone cuts and thorny stubbles', 'Exceptional retreadability for long economic service life'],
  },
  {
    id: 7,
    brand: 'CEAT',
    model: 'CEAT Vardhan High-Traction',
    position: 'REAR',
    size: '16.9-28',
    plyRating: '12 PR',
    suitableHp: '60 - 75+ HP',
    patternType: 'Wide Space Open Shoulder Lugs',
    soilSuitability: 'Heavy Tillage & MB Plowing',
    priceEst: '₹42,000 - ₹46,000',
    warrantyYears: 7,
    features: ['Wider lug profile for heavy 60+ HP tractors pulling multi-bottom ploughs', 'Self-cleaning shoulder ejects sticky black cotton soil effortlessly'],
  },
  {
    id: 8,
    brand: 'Goodyear',
    model: 'Goodyear Sampurna Farm Rear',
    position: 'REAR',
    size: '12.4-28',
    plyRating: '12 PR',
    suitableHp: '35 - 45 HP',
    patternType: 'Classic 23° Open Lug',
    soilSuitability: 'General Farm & Inter-Cultivation',
    priceEst: '₹24,000 - ₹27,000',
    warrantyYears: 5,
    features: ['Classic 23-degree lug angle engineered for optimal fuel economy', 'Even ground pressure minimizes crop root damage in orchards'],
  },
];

const BRANDS = ['All Brands', 'BKT', 'Apollo', 'MRF', 'CEAT', 'Goodyear'];
const SIZES = ['All Sizes', '6.00-16', '6.50-16', '7.50-16', '12.4-28', '13.6-28', '14.9-28', '16.9-28'];

export function TyresClient() {
  const [selectedPosition, setSelectedPosition] = useState<'ALL' | 'FRONT' | 'REAR'>('ALL');
  const [selectedBrand, setSelectedBrand] = useState('All Brands');
  const [selectedSize, setSelectedSize] = useState('All Sizes');
  const [searchQuery, setSearchQuery] = useState('');

  // Inquiry modal state
  const [selectedTyre, setSelectedTyre] = useState<TyreItem | null>(null);
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    mobile: '',
    state: '',
    district: '',
    quantity: 2,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const filteredTyres = TYRES_DATA.filter((item) => {
    if (selectedPosition !== 'ALL' && item.position !== selectedPosition) return false;
    if (selectedBrand !== 'All Brands' && item.brand !== selectedBrand) return false;
    if (selectedSize !== 'All Sizes' && item.size !== selectedSize) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.brand.toLowerCase().includes(q) ||
        item.model.toLowerCase().includes(q) ||
        item.size.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTyre) return;

    setSubmitting(true);
    setErrorMsg('');

    try {
      const cleanMobile = inquiryForm.mobile.replace(/\s+/g, '').replace(/^\+91/, '');
      await leadAPI.createLead({
        leadType: 'GET_PRICE',
        name: inquiryForm.name.trim(),
        mobile: cleanMobile,
        state: inquiryForm.state.trim() || 'Maharashtra',
        district: inquiryForm.district?.trim() || undefined,
        interestedBrand: selectedTyre.brand,
        message: `Tyre Quote Request: ${selectedTyre.brand} ${selectedTyre.model} (Size: ${selectedTyre.size}, Qty: ${inquiryForm.quantity}, Est. Price: ${selectedTyre.priceEst})`.slice(0, 1000),
        sourcePage: '/tyres',
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error('Failed to submit tyre inquiry:', err);
      setErrorMsg(
        err?.response?.data?.message || 'Failed to submit inquiry. Please check your details.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-4 pt-12 pb-24 sm:px-6 lg:px-8">
      {/* Hero Header */}
      <section className="relative flex flex-col items-center justify-center pt-8 pb-12 text-center">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 px-4 py-1.5 text-xs font-black tracking-widest text-[var(--color-brand-green)] uppercase">
            <CircleDot size={14} /> Tractor Tyres Guide & Pricing
          </div>
          <h1 className="text-foreground text-4xl leading-tight font-extrabold tracking-tight md:text-6xl">
            Tractor Tyres from <span className="text-[var(--color-brand-green)]">Top Brands</span>
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Compare front & rear tractor tyres from BKT, Apollo, MRF, CEAT, and Goodyear. Check sizes, ply ratings, warranty, and best dealer prices.
          </p>
        </div>
        <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-brand-green)]/5 blur-[120px]" />
      </section>

      {/* Filter Control Bar */}
      <div className="mb-10 rounded-3xl border border-border/50 bg-card/60 p-6 shadow-xl backdrop-blur-xl">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Position Selector */}
          <div>
            <label className="text-muted-foreground mb-1.5 block text-xs font-bold uppercase tracking-wider">
              Position
            </label>
            <div className="flex rounded-xl bg-secondary/40 p-1">
              {(['ALL', 'FRONT', 'REAR'] as const).map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setSelectedPosition(pos)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
                    selectedPosition === pos
                      ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {pos === 'ALL' ? 'All' : pos === 'FRONT' ? 'Front' : 'Rear'}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div>
            <label className="text-muted-foreground mb-1.5 block text-xs font-bold uppercase tracking-wider">
              Brand
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-3 py-2 text-xs font-medium focus:border-[var(--color-brand-green)] focus:outline-none"
            >
              {BRANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Size Filter */}
          <div>
            <label className="text-muted-foreground mb-1.5 block text-xs font-bold uppercase tracking-wider">
              Tyre Size
            </label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-3 py-2 text-xs font-medium focus:border-[var(--color-brand-green)] focus:outline-none"
            >
              {SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="text-muted-foreground mb-1.5 block text-xs font-bold uppercase tracking-wider">
              Search
            </label>
            <div className="relative">
              <Search size={14} className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search model name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border py-2 pl-8 pr-3 text-xs font-medium focus:border-[var(--color-brand-green)] focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tyres Grid */}
      <div className="mb-20 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {filteredTyres.map((tyre) => (
          <div
            key={tyre.id}
            className="group flex flex-col rounded-3xl border border-border/50 bg-card/40 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--color-brand-green)]/50 hover:shadow-xl"
          >
            {/* Header / Badges */}
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-full bg-secondary/80 px-2.5 py-0.5 text-[10px] font-black uppercase text-foreground">
                {tyre.brand}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                  tyre.position === 'FRONT'
                    ? 'bg-blue-500/10 text-blue-500'
                    : 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]'
                }`}
              >
                {tyre.position}
              </span>
            </div>

            {/* Model & Size */}
            <h3 className="text-foreground text-lg font-black leading-snug mb-1">
              {tyre.model}
            </h3>
            <div className="text-xl font-extrabold text-[var(--color-brand-green)] mb-3">
              Size: {tyre.size}
            </div>

            {/* Specs */}
            <div className="space-y-1.5 border-t border-border/30 pt-3 text-xs text-muted-foreground mb-4">
              <div className="flex justify-between">
                <span>Ply Rating:</span>
                <span className="font-bold text-foreground">{tyre.plyRating}</span>
              </div>
              <div className="flex justify-between">
                <span>Tractor HP:</span>
                <span className="font-bold text-foreground">{tyre.suitableHp}</span>
              </div>
              <div className="flex justify-between">
                <span>Warranty:</span>
                <span className="font-bold text-foreground">{tyre.warrantyYears} Years</span>
              </div>
              <div className="flex justify-between">
                <span>Est. Price:</span>
                <span className="font-bold text-[var(--color-brand-green)]">{tyre.priceEst}</span>
              </div>
            </div>

            {/* Feature bullets */}
            <div className="mt-auto space-y-1.5 pt-2 text-[11px] text-muted-foreground">
              {tyre.features.map((f, fIdx) => (
                <div key={fIdx} className="flex items-start gap-1.5">
                  <CheckCircle2 size={12} className="text-[var(--color-brand-green)] mt-0.5 shrink-0" />
                  <span className="line-clamp-2">{f}</span>
                </div>
              ))}
            </div>

            {/* Action */}
            <button
              type="button"
              onClick={() => {
                setSelectedTyre(tyre);
                setSubmitted(false);
                setErrorMsg('');
              }}
              className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-foreground/5 py-2.5 text-xs font-bold text-foreground transition-all group-hover:bg-[var(--color-brand-green)] group-hover:text-white"
            >
              Get Dealer Quote <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Tyre Care & Inflation Pressure Guide */}
      <section className="rounded-3xl border border-border/50 bg-card/40 p-8 md:p-12 mb-16">
        <h2 className="text-foreground text-3xl font-black mb-8 text-center">
          Tractor Tyre Care & Recommended Air Pressure
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="rounded-2xl bg-secondary/30 p-6 border border-border/40">
            <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
              <Wrench size={18} className="text-[var(--color-brand-green)]" />
              Front Tyres (28 - 34 PSI)
            </h4>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Maintain 28-32 PSI for normal field tasks. For heavy front-loader or dozer attachments, increase inflation to 34-36 PSI to prevent bead unseating and sidewall pinching.
            </p>
          </div>

          <div className="rounded-2xl bg-secondary/30 p-6 border border-border/40">
            <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
              <CircleDot size={18} className="text-[var(--color-brand-green)]" />
              Rear Tyres (12 - 16 PSI)
            </h4>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Rear drive tyres require lower pressure (12-14 PSI in wet soil/puddling) for a wider contact footprint and reduced wheel slippage. For heavy road haulage, increase to 18-20 PSI.
            </p>
          </div>

          <div className="rounded-2xl bg-secondary/30 p-6 border border-border/40">
            <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
              <ShieldCheck size={18} className="text-[var(--color-brand-green)]" />
              Water Ballasting
            </h4>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Filling rear tyres up to 75% with water adds 200-300 kg ballast per wheel. This dramatically lowers the center of gravity and boosts drawbar pull during heavy plowing.
            </p>
          </div>
        </div>
      </section>

      {/* Quote Inquiry Modal */}
      {selectedTyre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border/60 bg-card p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedTyre(null)}
              className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>

            {submitted ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-brand-green)]/20 text-[var(--color-brand-green)]">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-foreground text-2xl font-black mb-2">Quote Request Sent!</h3>
                <p className="text-muted-foreground text-xs mx-auto max-w-xs mb-6">
                  Authorized <span className="font-bold text-foreground">{selectedTyre.brand}</span> dealers in your district will contact you with wholesale pricing and doorstep fitment options.
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedTyre(null)}
                  className="rounded-full bg-[var(--color-brand-green)] px-6 py-2.5 text-xs font-bold text-white"
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-6 border-b border-border/40 pb-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-brand-green)]">
                    Official Tyre Dealer Pricing
                  </span>
                  <h3 className="text-foreground text-xl font-black mt-1">
                    {selectedTyre.model}
                  </h3>
                  <p className="text-muted-foreground text-xs mt-1">
                    Size: {selectedTyre.size} | Est. Price: {selectedTyre.priceEst} per tyre
                  </p>
                </div>

                {errorMsg && (
                  <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-500">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  <div>
                    <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dnyaneshwar More"
                      value={inquiryForm.name}
                      onChange={(e) => setInquiryForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-medium focus:border-[var(--color-brand-green)] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="10-digit mobile"
                        value={inquiryForm.mobile}
                        onChange={(e) => setInquiryForm((prev) => ({ ...prev, mobile: e.target.value }))}
                        className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-medium focus:border-[var(--color-brand-green)] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                        Quantity Needed
                      </label>
                      <select
                        value={inquiryForm.quantity}
                        onChange={(e) => setInquiryForm((prev) => ({ ...prev, quantity: Number(e.target.value) }))}
                        className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-medium focus:border-[var(--color-brand-green)] focus:outline-none"
                      >
                        <option value={1}>1 Tyre</option>
                        <option value={2}>2 Tyres (1 Pair)</option>
                        <option value={4}>4 Tyres (Full Set)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                        State *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Maharashtra"
                        value={inquiryForm.state}
                        onChange={(e) => setInquiryForm((prev) => ({ ...prev, state: e.target.value }))}
                        className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-medium focus:border-[var(--color-brand-green)] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                        District
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Pune"
                        value={inquiryForm.district}
                        onChange={(e) => setInquiryForm((prev) => ({ ...prev, district: e.target.value }))}
                        className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-medium focus:border-[var(--color-brand-green)] focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-brand-green)] py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg transition-all hover:bg-[var(--color-brand-green)]/90 disabled:opacity-70"
                  >
                    {submitting ? (
                      <>
                        <TractorLoader size={16} /> Submitting Request...
                      </>
                    ) : (
                      <>
                        Request Best Dealer Quote &rarr;
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
