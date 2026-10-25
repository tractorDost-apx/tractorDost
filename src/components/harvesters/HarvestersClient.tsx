'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wheat,
  Filter,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Phone,
  ShieldCheck,
  Search,
  BadgeDollarSign,
  Gauge,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { implementAPI, Implement } from '@/lib/api/implements';
import { leadAPI } from '@/lib/api/leads';
import { TractorLoader } from '@/components/ui/TractorLoader';

export interface HarvesterModel {
  id: number;
  modelName: string;
  brand: string;
  type: 'self-propelled' | 'tractor-mounted' | 'paddy' | 'multicrop';
  cutterBarWidthFt: number;
  engineHp: number;
  grainTankCapacityKg: number;
  priceMinLakh: number;
  priceMaxLakh: number;
  crops: string[];
  imageUrl: string;
  description: string;
}

const CURATED_HARVESTERS: HarvesterModel[] = [
  {
    id: 701,
    modelName: 'Preet 987 Self Propelled Combine Harvester',
    brand: 'Preet',
    type: 'self-propelled',
    cutterBarWidthFt: 14,
    engineHp: 101,
    grainTankCapacityKg: 2400,
    priceMinLakh: 25.5,
    priceMaxLakh: 28.0,
    crops: ['Wheat', 'Paddy', 'Soybean', 'Mustard', 'Sunflower'],
    imageUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=800&auto=format&fit=crop',
    description: 'India’s most trusted self-propelled combine harvester with Ashok Leyland 6-cylinder turbocharged engine and heavy-duty 5 straw walkers.',
  },
  {
    id: 702,
    modelName: 'Dasmesh 9100 Multi Crop Self-Propelled',
    brand: 'Dasmesh',
    type: 'multicrop',
    cutterBarWidthFt: 14.5,
    engineHp: 101,
    grainTankCapacityKg: 2500,
    priceMinLakh: 26.0,
    priceMaxLakh: 29.5,
    crops: ['Wheat', 'Paddy', 'Gram', 'Soybean', 'Pulses'],
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop',
    description: 'Engineered for zero grain loss and minimal straw breakage. Features power steering, hydraulic reel adjustment and high ground clearance.',
  },
  {
    id: 703,
    modelName: 'Kartar 4000 Tractor Mounted Combine Harvester',
    brand: 'Kartar',
    type: 'tractor-mounted',
    cutterBarWidthFt: 11,
    engineHp: 60,
    grainTankCapacityKg: 1200,
    priceMinLakh: 12.0,
    priceMaxLakh: 14.5,
    crops: ['Wheat', 'Paddy', 'Soybean'],
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop',
    description: 'Cost-effective tractor-mounted harvester compatible with 55-65 HP dual-clutch tractors. Easy mounting and demounting within 4 hours.',
  },
  {
    id: 704,
    modelName: 'Claas Crop Tiger 33 Rubber Track Paddy Harvester',
    brand: 'Claas',
    type: 'paddy',
    cutterBarWidthFt: 7,
    engineHp: 60,
    grainTankCapacityKg: 1100,
    priceMinLakh: 19.5,
    priceMaxLakh: 22.0,
    crops: ['Paddy (Basmati & Non-Basmati)', 'Wetland Crops'],
    imageUrl: 'https://images.unsplash.com/photo-1594771804886-a933bb2d609b?q=80&w=800&auto=format&fit=crop',
    description: 'Specialized rubber track combine for waterlogged, marshy rice paddies. High maneuverability with minimal soil compaction.',
  },
  {
    id: 705,
    modelName: 'John Deere W70 Multi-Crop Combine Harvester',
    brand: 'John Deere',
    type: 'self-propelled',
    cutterBarWidthFt: 14,
    engineHp: 100,
    grainTankCapacityKg: 2600,
    priceMinLakh: 28.5,
    priceMaxLakh: 32.0,
    crops: ['Wheat', 'Paddy', 'Barley', 'Soybean'],
    imageUrl: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=800&auto=format&fit=crop',
    description: 'Premium combine harvester with John Deere PowerTech turbocharged engine, Positorq transmission, and air-conditioned operator cabin.',
  },
  {
    id: 706,
    modelName: 'Balkar B-525 Tractor Mounted Combine',
    brand: 'Balkar',
    type: 'tractor-mounted',
    cutterBarWidthFt: 10.5,
    engineHp: 55,
    grainTankCapacityKg: 1000,
    priceMinLakh: 11.5,
    priceMaxLakh: 13.8,
    crops: ['Wheat', 'Paddy'],
    imageUrl: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?q=80&w=800&auto=format&fit=crop',
    description: 'Affordable mechanization for custom hiring contractors. Highly compatible with Swaraj 855, Farmtrac 60, and Mahindra 575/585 tractors.',
  },
];

const HARVESTER_TYPES = [
  { key: 'all', label: 'All Harvesters' },
  { key: 'self-propelled', label: 'Self-Propelled' },
  { key: 'tractor-mounted', label: 'Tractor Mounted' },
  { key: 'paddy', label: 'Paddy / Track Harvester' },
  { key: 'multicrop', label: 'Multi-Crop' },
];

export function HarvestersClient({ initialType }: { initialType?: string }) {
  const [activeType, setActiveType] = useState<string>(initialType || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [harvesters, setHarvesters] = useState<HarvesterModel[]>(CURATED_HARVESTERS);
  const [loading, setLoading] = useState(false);

  // Quote modal state
  const [selectedModel, setSelectedModel] = useState<HarvesterModel | null>(null);
  const [quoteForm, setQuoteForm] = useState({
    name: '',
    mobile: '',
    state: '',
    district: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Try to load implements from backend if any matching harvest/combine category
  useEffect(() => {
    async function loadData() {
      try {
        const res = await implementAPI.getAllImplements({ limit: 20 });
        if (res.data?.data && res.data.data.length > 0) {
          const apiHarvesters = res.data.data.filter(
            (imp) =>
              imp.category?.name.toLowerCase().includes('harvest') ||
              imp.modelName.toLowerCase().includes('harvester') ||
              imp.modelName.toLowerCase().includes('combine')
          );
          if (apiHarvesters.length > 0) {
            const mapped: HarvesterModel[] = apiHarvesters.map((imp) => ({
              id: imp.id,
              modelName: imp.modelName,
              brand: imp.brand?.name || 'Equipment',
              type: imp.modelName.toLowerCase().includes('tractor')
                ? 'tractor-mounted'
                : imp.modelName.toLowerCase().includes('paddy')
                ? 'paddy'
                : 'self-propelled',
              cutterBarWidthFt: imp.workingWidthFt || 12,
              engineHp: imp.engineHp || imp.tractorHPMin || 75,
              grainTankCapacityKg: 1800,
              priceMinLakh: imp.priceMin ? imp.priceMin / 100000 : 15,
              priceMaxLakh: imp.priceMax ? imp.priceMax / 100000 : 25,
              crops: ['Wheat', 'Paddy', 'Soybean'],
              imageUrl: imp.videoThumbnailUrl || CURATED_HARVESTERS[0].imageUrl,
              description: imp.description || 'Heavy-duty agricultural combine harvester.',
            }));
            setHarvesters(mapped);
          }
        }
      } catch (err) {
        console.warn('Using curated harvesters catalog:', err);
      }
    }
    loadData();
  }, []);

  const filteredHarvesters = harvesters.filter((item) => {
    const matchesSearch =
      item.modelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.crops.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (activeType === 'all') return true;
    return item.type === activeType;
  });

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModel) return;

    setSubmitting(true);
    setErrorMsg('');

    try {
      const cleanMobile = quoteForm.mobile.replace(/\s+/g, '').replace(/^\+91/, '');
      await leadAPI.createLead({
        leadType: 'GET_PRICE',
        name: quoteForm.name.trim(),
        mobile: cleanMobile,
        state: quoteForm.state.trim() || 'Maharashtra',
        district: quoteForm.district?.trim() || undefined,
        interestedBrand: selectedModel.brand,
        interestedModel: selectedModel.modelName,
        message: `Harvester Quote Request: ${selectedModel.brand} ${selectedModel.modelName} (Price Range: ₹${selectedModel.priceMinLakh} - ₹${selectedModel.priceMaxLakh} Lakhs)`.slice(0, 1000),
        sourcePage: '/harvesters',
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error('Failed to submit quote request:', err);
      setErrorMsg(
        err?.response?.data?.message || 'Failed to submit quote inquiry. Please check your details.'
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
            <Wheat size={14} /> Combine Harvesters Portal
          </div>
          <h1 className="text-foreground text-4xl leading-tight font-extrabold tracking-tight md:text-6xl">
            Compare Top <span className="text-[var(--color-brand-green)]">Harvesters & Combines</span>
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Discover self-propelled, tractor-mounted, and rubber-track paddy combine harvesters. Check specifications, prices, and government subsidy benefits.
          </p>
        </div>
        <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-brand-green)]/5 blur-[120px]" />
      </section>

      {/* Filter and Search Bar */}
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Type Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {HARVESTER_TYPES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveType(t.key)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                activeType === t.key
                  ? 'bg-[var(--color-brand-green)] text-white shadow-md'
                  : 'bg-card/60 text-muted-foreground hover:bg-secondary border border-border/40'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search size={16} className="text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search harvester model or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-card/60 border-border/50 text-foreground w-full rounded-full border py-2 pl-9 pr-4 text-xs font-medium focus:border-[var(--color-brand-green)] focus:outline-none"
          />
        </div>
      </div>

      {/* Harvesters Grid */}
      <div className="mb-20 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filteredHarvesters.map((item) => (
          <div
            key={item.id}
            className="group flex flex-col overflow-hidden rounded-3xl border border-border/50 bg-card/40 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--color-brand-green)]/50 hover:shadow-xl"
          >
            {/* Image Header */}
            <div className="relative aspect-video w-full overflow-hidden bg-black/40">
              <img
                src={item.imageUrl}
                alt={item.modelName}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-3 left-3 rounded-full bg-black/75 px-3 py-1 text-[11px] font-black text-white uppercase backdrop-blur-md">
                {item.brand}
              </div>
              <div className="absolute top-3 right-3 rounded-full bg-[var(--color-brand-green)] px-3 py-1 text-[11px] font-black text-white uppercase shadow-md">
                {item.type.replace('-', ' ')}
              </div>
            </div>

            {/* Content Body */}
            <div className="flex flex-1 flex-col p-6">
              <h3 className="text-foreground text-xl font-black mb-2 leading-snug">
                {item.modelName}
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2 mb-4">
                {item.description}
              </p>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-2.5 rounded-2xl bg-secondary/30 p-3.5 text-xs mb-4">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Engine HP</span>
                  <span className="text-foreground font-black">{item.engineHp} HP</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Cutter Bar</span>
                  <span className="text-foreground font-black">{item.cutterBarWidthFt} Feet</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Grain Tank</span>
                  <span className="text-foreground font-black">{item.grainTankCapacityKg} Kg</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Price Est.</span>
                  <span className="text-[var(--color-brand-green)] font-black">
                    ₹{item.priceMinLakh} - {item.priceMaxLakh} L
                  </span>
                </div>
              </div>

              {/* Compatible Crops */}
              <div className="mb-5 flex flex-wrap gap-1.5">
                {item.crops.map((crop, cIdx) => (
                  <span
                    key={cIdx}
                    className="rounded-md bg-secondary/60 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
                  >
                    {crop}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-auto flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedModel(item);
                    setSubmitted(false);
                    setErrorMsg('');
                  }}
                  className="flex-1 rounded-xl bg-[var(--color-brand-green)] py-2.5 text-xs font-black text-white uppercase tracking-wider shadow-md transition-all hover:bg-[var(--color-brand-green)]/90"
                >
                  Get Best Price
                </button>
                <Link
                  href="/loan/implement"
                  className="rounded-xl border border-border/60 bg-card/60 px-3.5 py-2.5 text-xs font-bold text-foreground transition-all hover:bg-secondary text-center"
                >
                  Loan
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Combine Harvester Subsidy & Finance Info */}
      <section className="rounded-3xl border border-border/50 bg-card/40 p-8 md:p-12">
        <h2 className="text-foreground text-3xl font-black mb-6 text-center">
          Combine Harvester Subsidies & Custom Hiring Scheme
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="rounded-2xl bg-secondary/30 p-6 border border-border/40">
            <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[var(--color-brand-green)]" />
              SMAM Scheme Subsidy
            </h4>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Under the Sub-Mission on Agricultural Mechanization (SMAM), farmers and FPOs can receive between 40% to 50% government subsidy (up to ₹10-12 Lakhs) on certified combine harvesters.
            </p>
          </div>

          <div className="rounded-2xl bg-secondary/30 p-6 border border-border/40">
            <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[var(--color-brand-green)]" />
              Custom Hiring Centers (CHC)
            </h4>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Combine harvesters are high-yield assets for agri-entrepreneurs. Establishing a CHC allows operators to charge hourly harvesting rates of ₹1,800 to ₹2,500/acre during peak season.
            </p>
          </div>

          <div className="rounded-2xl bg-secondary/30 p-6 border border-border/40">
            <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[var(--color-brand-green)]" />
              Equipment Loans up to 85%
            </h4>
            <p className="text-muted-foreground text-xs leading-relaxed">
              TractorDost connects combine buyers with SBI, HDFC, Kotak, and Mahindra Finance with specialized agricultural term loans spread over 5 years.
            </p>
          </div>
        </div>
      </section>

      {/* Quote Inquiry Modal */}
      {selectedModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border/60 bg-card p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedModel(null)}
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
                  Authorized dealers for <span className="font-bold text-foreground">{selectedModel.modelName}</span> will send official pricing and subsidy quotations to your phone.
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedModel(null)}
                  className="rounded-full bg-[var(--color-brand-green)] px-6 py-2.5 text-xs font-bold text-white"
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-6 border-b border-border/40 pb-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-brand-green)]">
                    Official Dealer Price Quote
                  </span>
                  <h3 className="text-foreground text-xl font-black mt-1">
                    {selectedModel.modelName}
                  </h3>
                  <p className="text-muted-foreground text-xs mt-1">
                    Estimated Price: ₹{selectedModel.priceMinLakh} - {selectedModel.priceMaxLakh} Lakhs
                  </p>
                </div>

                {errorMsg && (
                  <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-500">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleQuoteSubmit} className="space-y-4">
                  <div>
                    <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Suresh Shinde"
                      value={quoteForm.name}
                      onChange={(e) => setQuoteForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-medium focus:border-[var(--color-brand-green)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="10-digit mobile"
                      value={quoteForm.mobile}
                      onChange={(e) => setQuoteForm((prev) => ({ ...prev, mobile: e.target.value }))}
                      className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-medium focus:border-[var(--color-brand-green)] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                        State *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Punjab"
                        value={quoteForm.state}
                        onChange={(e) => setQuoteForm((prev) => ({ ...prev, state: e.target.value }))}
                        className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-medium focus:border-[var(--color-brand-green)] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                        District
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Ludhiana"
                        value={quoteForm.district}
                        onChange={(e) => setQuoteForm((prev) => ({ ...prev, district: e.target.value }))}
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
                        Get Best Price & Subsidy Offers &rarr;
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
