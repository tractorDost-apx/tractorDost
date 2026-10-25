'use client';

import React, { useState, useEffect } from 'react';
import { dealerAPI, Dealer } from '@/lib/api/dealers';
import { brandAPI, Brand } from '@/lib/api/brands';
import { leadAPI } from '@/lib/api/leads';
import { INDIAN_STATES } from '@/lib/constants/states-districts';
import {
  Search,
  MapPin,
  Map,
  Phone,
  MessageSquare,
  Navigation,
  Star,
  ShieldCheck,
  Filter,
  Wrench,
  Store,
  LayoutList,
  CheckCircle,
  Clock,
  X,
  Send,
  Loader2,
} from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';
import Link from 'next/link';
import Pagination from '@/components/shared/Pagination';

export default function DealersPage() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Advanced UI States
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [sortBy, setSortBy] = useState<'rating' | 'reviews'>('rating');
  const [inquiryModalOpen, setInquiryModalOpen] = useState<Dealer | null>(null);

  // Inquiry form states
  const [inquiryForm, setInquiryForm] = useState({ name: '', mobile: '', message: '' });
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryError, setInquiryError] = useState('');

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [selectedState, setSelectedState] = useState('');
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);

  useEffect(() => {
    // Fetch brands for filter
    brandAPI.getAllBrands({ limit: 50 }).then((res) => {
      if (res.success) {
        const list = (res.data as any).data || (res.data as any).brands || [];
        setBrands(list.filter((b: any) => b.isActive));
      }
    });
  }, []);

  useEffect(() => {
    const fetchDealers = async () => {
      setLoading(true);
      try {
        const res = await dealerAPI.getAllDealers({
          search: searchQuery,
          brandId: selectedBrand || undefined,
          state: selectedState || undefined,
        });

        if (res.success && res.data) {
          let data: Dealer[] = Array.isArray(res.data) ? [...res.data] : [...(res.data.data || [])];

          // Apply Frontend Sort
          if (sortBy === 'rating') {
            data = data.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          } else {
            data = data.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
          }

          // Apply Open Now filter (mocking it randomly based on id for demo)
          if (showOnlyOpen) {
            data = data.filter((d) => d.id % 2 !== 0); // Mock logic for "Open Now"
          }

          setDealers(data);
        }
      } catch (err) {
        console.error('Failed to fetch dealers', err);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchDealers, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, selectedBrand, selectedState, sortBy, showOnlyOpen]);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryModalOpen) return;

    if (!inquiryForm.name || inquiryForm.name.trim().length < 2) {
      setInquiryError('Please enter your full name (at least 2 characters).');
      return;
    }
    const cleanMobile = inquiryForm.mobile.replace(/\s+/g, '').replace(/^\+91/, '');
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setInquiryError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setSubmittingInquiry(true);
    setInquiryError('');

    try {
      await leadAPI.createLead({
        leadType: 'DEALER',
        dealerId: inquiryModalOpen.id,
        name: inquiryForm.name.trim(),
        mobile: cleanMobile,
        message: inquiryForm.message.trim() || `Inquiry for dealer: ${inquiryModalOpen.businessName}`,
        state: selectedState || inquiryModalOpen.state || 'Maharashtra',
        district: inquiryModalOpen.district,
        sourcePage: '/dealers',
      });

      setInquirySuccess(true);
      setTimeout(() => {
        setInquiryModalOpen(null);
        setInquirySuccess(false);
        setInquiryForm({ name: '', mobile: '', message: '' });
      }, 2000);
    } catch (err: any) {
      console.error('Failed to submit dealer inquiry:', err);
      setInquiryError(
        err?.response?.data?.message || 'Failed to submit inquiry. Please try again or call the dealer directly.'
      );
    } finally {
      setSubmittingInquiry(false);
    }
  };

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[1400px] px-4 py-10 sm:px-6">
      {/* Header Section */}
      <div className="animate-fade-in mb-12 flex flex-col items-center text-center">
        <div className="mb-4 inline-flex items-center justify-center rounded-2xl bg-[var(--color-brand-green)]/10 p-3 text-[var(--color-brand-green)]">
          <Store size={28} />
        </div>
        <h1 className="text-foreground mb-4 text-4xl font-black tracking-tight md:text-5xl">
          Find a <span className="text-[var(--color-brand-green)]">Tractor Dealer</span>
        </h1>
        <p className="text-muted max-w-2xl text-lg font-bold">
          Locate certified showrooms, authorized service centers, and trusted used tractor dealers
          across India.
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Left Column: Filters */}
        <div className="animate-slide-in flex w-full flex-col gap-6 lg:w-1/4">
          <div className="spatial-panel bg-background/50 sticky top-24 rounded-3xl border border-[var(--border-subtle)] p-6 backdrop-blur-xl">
            <div className="text-foreground mb-6 flex items-center justify-between font-black">
              <div className="flex items-center gap-2">
                <Filter size={18} />
                <h3>Advanced Filters</h3>
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedBrand(null);
                  setSelectedState('');
                  setShowOnlyOpen(false);
                }}
                className="text-muted text-xs underline hover:text-[var(--color-brand-green)]"
              >
                Clear All
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <label className="text-muted mb-2 block text-[10px] font-black tracking-widest uppercase">
                Search Dealership
              </label>
              <div className="relative">
                <Search size={18} className="text-muted absolute top-1/2 left-4 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Dealer name or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-foreground/5 text-foreground w-full rounded-xl border-none py-3 pr-4 pl-12 text-sm font-bold outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]"
                />
              </div>
            </div>

            {/* State Filter */}
            <div className="mb-6">
              <label className="text-muted mb-2 block text-[10px] font-black tracking-widest uppercase">
                Location
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-foreground/5 text-foreground w-full appearance-none rounded-xl border-none px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]"
              >
                <option value="">All States</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Open Now Toggle */}
            <div className="mb-6">
              <label className="bg-foreground/5 hover:bg-foreground/10 flex cursor-pointer items-center gap-3 rounded-xl border border-transparent p-3 transition-colors">
                <input
                  type="checkbox"
                  checked={showOnlyOpen}
                  onChange={(e) => setShowOnlyOpen(e.target.checked)}
                  className="bg-background h-5 w-5 rounded border-gray-300 text-[var(--color-brand-green)] focus:ring-[var(--color-brand-green)]"
                />
                <span className="text-foreground flex items-center gap-2 text-sm font-bold">
                  <Clock size={16} className="text-green-500" /> Open Now
                </span>
              </label>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="text-muted mb-3 block text-[10px] font-black tracking-widest uppercase">
                Authorized Brands
              </label>
              <div className="custom-scrollbar flex max-h-60 flex-col gap-2 overflow-y-auto pr-2">
                <button
                  onClick={() => setSelectedBrand(null)}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${!selectedBrand ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] shadow-inner' : 'bg-foreground/5 text-foreground hover:bg-foreground/10 border-transparent'}`}
                >
                  <span className="text-sm font-bold">All Brands</span>
                </button>
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => setSelectedBrand(brand.id)}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${selectedBrand === brand.id ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] shadow-inner' : 'bg-foreground/5 text-foreground hover:bg-foreground/10 border-transparent'}`}
                  >
                    {brand.logoUrl ? (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-black/5 bg-white p-0.5 shadow-xs dark:border-white/10">
                        <img
                          src={brand.logoUrl}
                          alt={brand.name}
                          className="h-full w-full object-contain rounded-xs"
                        />
                      </div>
                    ) : (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-brand-green)]/20 to-[var(--color-brand-green)]/5 text-[10px] font-black text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20">
                        {brand.name.charAt(0)}
                      </div>
                    )}
                    <span className="truncate text-sm font-bold">{brand.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dealer List */}
        <div className="w-full lg:w-3/4">
          {/* Top Control Bar */}
          <div className="animate-fade-in bg-foreground/5 mb-6 flex flex-col items-center justify-between gap-4 rounded-2xl p-2 sm:flex-row">
            <div className="flex w-full items-center gap-2 px-4 sm:w-auto">
              <span className="text-muted text-sm font-black tracking-widest uppercase">
                <span className="text-foreground text-lg">{dealers.length}</span> Dealerships Found
              </span>
            </div>

            <div className="flex w-full items-center gap-2 sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-background text-foreground appearance-none rounded-xl border-none px-4 py-2.5 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]"
              >
                <option value="rating">Highest Rated</option>
                <option value="reviews">Most Reviewed</option>
              </select>

              <div className="bg-background flex rounded-xl p-1 shadow-sm">
                <button
                  onClick={() => setViewMode('list')}
                  className={`rounded-lg p-2 transition-colors ${viewMode === 'list' ? 'bg-foreground/10 text-foreground' : 'text-muted hover:text-foreground'}`}
                >
                  <LayoutList size={18} />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`rounded-lg p-2 transition-colors ${viewMode === 'map' ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]' : 'text-muted hover:text-[var(--color-brand-green)]'}`}
                >
                  <Map size={18} />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex w-full justify-center py-32">
              <TractorLoader size={48} className="text-[var(--color-brand-green)]" />
            </div>
          ) : dealers.length === 0 ? (
            <div className="spatial-panel animate-fade-in bg-background/50 flex flex-col items-center justify-center rounded-3xl border border-[var(--border-subtle)] p-16 text-center backdrop-blur-xl">
              <Store size={64} className="text-muted mb-6 opacity-40" />
              <h3 className="text-foreground mb-3 text-2xl font-black">No Dealerships Found</h3>
              <p className="text-muted mb-8 max-w-md text-base font-bold">
                Try adjusting your advanced filters or searching for a different area to find
                authorized dealers near you.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedBrand(null);
                  setSelectedState('');
                  setShowOnlyOpen(false);
                }}
                className="rounded-2xl bg-[var(--color-brand-green)] px-8 py-4 font-black text-white shadow-[var(--color-brand-green)]/20 shadow-lg transition-transform hover:-translate-y-1 hover:bg-[var(--color-brand-green)]/90"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'map' ? (
            // MAP VIEW MOCKUP
            <div className="spatial-panel bg-foreground/5 animate-fade-in relative flex h-[600px] items-center justify-center overflow-hidden rounded-3xl border border-[var(--border-subtle)]">
              <div
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 2px 2px, var(--color-foreground) 1px, transparent 0)',
                  backgroundSize: '32px 32px',
                }}
              />
              <div className="bg-background/80 z-10 max-w-sm rounded-3xl border border-[var(--border-subtle)] p-8 text-center shadow-2xl backdrop-blur-md">
                <Map size={48} className="mx-auto mb-4 text-[var(--color-brand-green)]" />
                <h3 className="mb-2 text-xl font-black">Interactive Map Integration</h3>
                <p className="text-muted mb-6 text-sm font-bold">
                  This section is architected to inject Google Maps or Mapbox SDK to render{' '}
                  {dealers.length} active pins instantly.
                </p>
                <button
                  onClick={() => setViewMode('list')}
                  className="w-full rounded-xl bg-[var(--border-subtle)] py-3 text-sm font-black transition-colors hover:border-[var(--border-brand)]"
                >
                  Return to List View
                </button>
              </div>
            </div>
          ) : (
            // LIST VIEW
            <div className="animate-fade-in flex flex-col gap-6">
              {dealers.slice((page - 1) * limit, page * limit).map((dealer) => (
                <div
                  key={dealer.id}
                  className="spatial-panel bg-background/50 hover:bg-foreground/[0.02] group flex flex-col gap-6 rounded-[2rem] border border-[var(--border-subtle)] p-6 backdrop-blur-xl transition-all duration-300 hover:shadow-[var(--color-brand-green)]/5 hover:shadow-2xl sm:p-8 md:flex-row md:gap-8"
                >
                  {/* Info Section */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="mb-3 flex flex-wrap items-center gap-3">
                        <h2 className="text-foreground text-2xl font-black transition-colors group-hover:text-[var(--color-brand-green)]">
                          {dealer.businessName}
                        </h2>
                        {dealer.isCertified && (
                          <div className="flex items-center gap-1 rounded-lg border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-xs font-black tracking-wider text-green-600 uppercase">
                            <ShieldCheck size={14} /> TractorDost Assured
                          </div>
                        )}
                        <div className="flex items-center gap-1 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-black text-amber-600">
                          <Star size={14} className="fill-amber-500" /> {dealer.rating} (
                          {dealer.reviewsCount})
                        </div>
                      </div>

                      <div className="text-muted mb-4 flex max-w-lg items-start gap-3 text-sm font-bold">
                        <div className="bg-foreground/5 mt-0.5 rounded-full p-2">
                          <MapPin size={14} className="text-[var(--color-brand-green)]" />
                        </div>
                        <p className="leading-relaxed">
                          {dealer.address}, {dealer.district}, {dealer.state} - {dealer.pincode}
                        </p>
                      </div>

                      {/* Badges */}
                      <div className="mb-6 flex flex-wrap gap-2">
                        {(dealer.hasShowroom || !!dealer.showroom) && (
                          <span className="flex items-center gap-1.5 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-black text-blue-600">
                            <Store size={14} /> Sales Showroom
                          </span>
                        )}
                        {(dealer.hasServiceCenter || !!dealer.serviceCenter) && (
                          <span className="flex items-center gap-1.5 rounded-xl border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-xs font-black text-purple-600">
                            <Wrench size={14} /> Service & Spares
                          </span>
                        )}
                        {/* Mock Open Now Badge */}
                        {dealer.id % 2 !== 0 && (
                          <span className="flex items-center gap-1.5 rounded-xl border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-xs font-black text-green-600">
                            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" /> Open
                            Now
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Authorized Brands */}
                    {dealer.brands && dealer.brands.length > 0 && (
                      <div className="mt-auto">
                        <p className="text-muted mb-2 text-[10px] font-black tracking-widest uppercase">
                          Authorized Dealer For
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {dealer.brands.map((b) => (
                            <div
                              key={b.brandId}
                              className="bg-background flex cursor-default items-center gap-2 rounded-xl border border-[var(--border-subtle)] px-3 py-2 shadow-sm transition-colors hover:border-[var(--color-brand-green)]/50"
                            >
                              {b.brand.logoUrl && (
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-md border border-black/5 bg-white p-0.5 shadow-2xs">
                                  <img
                                    src={b.brand.logoUrl}
                                    alt={b.brand.name}
                                    className="h-full w-full object-contain rounded-xs"
                                  />
                                </div>
                              )}
                              <span className="text-foreground text-xs font-black">
                                {b.brand.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Section */}
                  <div className="flex w-full shrink-0 flex-col justify-center gap-3 md:w-52">
                    <button
                      onClick={() => setInquiryModalOpen(dealer)}
                      className="group-hover:animate-pulse-subtle flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-brand-green)] py-4 font-black text-white shadow-[var(--color-brand-green)]/20 shadow-xl transition-all hover:-translate-y-1 hover:bg-[var(--color-brand-green)]/90 active:translate-y-0"
                    >
                      <Send size={18} />
                      Request Callback
                    </button>

                    <a
                      href={`tel:${dealer.phone}`}
                      className="bg-foreground/5 hover:bg-foreground/10 text-foreground flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-black transition-colors"
                    >
                      <Phone size={18} />
                      Call {dealer.phone.split(' ')[0]}***
                    </a>

                    {dealer.whatsapp && (
                      <a
                        href={`https://wa.me/${dealer.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#25D366]/20 bg-[#25D366]/10 py-3.5 font-black text-[#25D366] transition-colors hover:bg-[#25D366]/20"
                      >
                        <MessageSquare size={18} />
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && dealers.length > 0 && viewMode === 'list' && (
            <div className="mt-6">
              <Pagination
                page={page}
                limit={limit}
                totalCount={dealers.length}
                totalPages={Math.ceil(dealers.length / limit)}
                onPageChange={setPage}
                onLimitChange={(l) => {
                  setLimit(l);
                  setPage(1);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* INQUIRY MODAL */}
      {inquiryModalOpen && (
        <div className="animate-fade-in fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-all dark:bg-black/75"
            onClick={() => setInquiryModalOpen(null)}
          />
          <div className="animate-slide-up relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-zinc-200 bg-white p-8 shadow-2xl dark:border-white/10 dark:bg-[#121814]">
            <button
              onClick={() => setInquiryModalOpen(null)}
              className="absolute top-6 right-6 rounded-full border border-zinc-200 bg-zinc-100 p-2 text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-900 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="mb-6 pr-12">
              <h3 className="mb-2 text-2xl font-black text-zinc-900 dark:text-white">Request Callback</h3>
              <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">
                A representative from{' '}
                <span className="text-[var(--color-brand-green)]">
                  {inquiryModalOpen.businessName}
                </span>{' '}
                will contact you shortly.
              </p>
            </div>

            {inquirySuccess ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-emerald-500/10 p-6 text-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle size={40} className="animate-bounce" />
                <h4 className="text-lg font-black">Inquiry Submitted!</h4>
                <p className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                  Your inquiry has been successfully sent to {inquiryModalOpen.businessName}. Their sales advisor will call you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="flex flex-col gap-4">
                {inquiryError && (
                  <div className="rounded-xl bg-red-500/10 p-3 text-xs font-bold text-red-600 dark:text-red-400">
                    {inquiryError}
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-xs font-black tracking-widest uppercase text-zinc-500 dark:text-zinc-400">
                    Your Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={inquiryForm.name}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                    placeholder="Enter your full name"
                    disabled={submittingInquiry}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-900 outline-none transition-all focus:border-[var(--color-brand-green)] focus:bg-white focus:ring-2 focus:ring-[var(--color-brand-green)]/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-lime-400 dark:focus:ring-lime-400/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-black tracking-widest uppercase text-zinc-500 dark:text-zinc-400">
                    Mobile Number *
                  </label>
                  <input
                    required
                    type="tel"
                    maxLength={10}
                    value={inquiryForm.mobile}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, mobile: e.target.value })}
                    placeholder="10-digit mobile number"
                    disabled={submittingInquiry}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-900 outline-none transition-all focus:border-[var(--color-brand-green)] focus:bg-white focus:ring-2 focus:ring-[var(--color-brand-green)]/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-lime-400 dark:focus:ring-lime-400/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-black tracking-widest uppercase text-zinc-500 dark:text-zinc-400">
                    Interest / Message (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={inquiryForm.message}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                    placeholder="I am looking to buy a tractor / want a price quote..."
                    disabled={submittingInquiry}
                    className="w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-900 outline-none transition-all focus:border-[var(--color-brand-green)] focus:bg-white focus:ring-2 focus:ring-[var(--color-brand-green)]/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-lime-400 dark:focus:ring-lime-400/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingInquiry}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-brand-green)] py-3.5 font-black text-white shadow-lg shadow-[var(--color-brand-green)]/30 transition-all hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 disabled:opacity-60"
                >
                  {submittingInquiry ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Submit Inquiry
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
