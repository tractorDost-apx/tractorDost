'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  X,
  Grid3X3,
  List,
  Tractor,
  ShieldCheck,
  Sparkles,
  MapPin,
  ArrowUpDown,
  Plus,
  RotateCcw,
  Loader2,
  SlidersHorizontal,
} from 'lucide-react';
import { usedTractorListingAPI } from '@/lib/api/used-listings';
import { brandAPI, Brand } from '@/lib/api/brands';
import { PublicUsedTractorCard } from '@/components/used-tractors/PublicUsedTractorCard';
import { PublicUsedEnquiryModal } from '@/components/used-tractors/PublicUsedEnquiryModal';
import { PublicUsedQuickViewModal } from '@/components/used-tractors/PublicUsedQuickViewModal';
import Pagination from '@/components/shared/Pagination';
import type {
  UsedTractorListing,
  ListingFilters,
  ListingSortBy,
  ConditionGrade,
} from '@/types/models/used-listing';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

function UsedTractorsListingContent() {
  const searchParams = useSearchParams();
  const brandQuery = searchParams.get('brand');
  const stateQuery = searchParams.get('state');

  // Listings & Brand state
  const [tractors, setTractors] = useState<UsedTractorListing[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalTractors, setTotalTractors] = useState(0);

  // Layout & View state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedPrice, setSelectedPrice] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedHours, setSelectedHours] = useState<string>('');
  const [selectedOwnership, setSelectedOwnership] = useState<string>('');
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [isCertifiedOnly, setIsCertifiedOnly] = useState<boolean>(false);
  const [financeOnly, setFinanceOnly] = useState<boolean>(false);
  const [rcOnly, setRcOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<ListingSortBy>('newest');

  // Modals state
  const [quickViewId, setQuickViewId] = useState<number | null>(null);
  const [enquiryListing, setEnquiryListing] = useState<UsedTractorListing | null>(null);

  // Sync initial query params
  useEffect(() => {
    if (brandQuery) setSelectedBrand(brandQuery);
    if (stateQuery) setSelectedState(stateQuery);
  }, [brandQuery, stateQuery]);

  // Fetch Brands list
  useEffect(() => {
    brandAPI
      .getAllBrands({ limit: 100 })
      .then((res) => {
        if (res.success) {
          const list =
            (res.data as any)?.brands ||
            (res.data as any)?.data ||
            (Array.isArray(res.data) ? res.data : []);
          setBrands(list.filter((b: any) => b.isActive));
        }
      })
      .catch(() => setBrands([]));
  }, []);

  // Fetch Used Tractors based on filters
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const params: ListingFilters = {
          page,
          limit,
          sortBy,
          ...(searchQuery.trim() && { search: searchQuery.trim() }),
          ...(selectedBrand && { tractorBrand: selectedBrand }),
          ...(selectedState && { state: selectedState }),
          ...(selectedDistrict && { district: selectedDistrict }),
          ...(isCertifiedOnly && { isCertified: true }),
          ...(financeOnly && { financeAvailable: true }),
          ...(rcOnly && { rcAvailable: true }),
          ...(selectedCondition && { conditionGrade: selectedCondition as ConditionGrade }),
        };

        // Price mapping
        if (selectedPrice === 'under3') {
          params.priceMax = 300000;
        } else if (selectedPrice === '3to5') {
          params.priceMin = 300000;
          params.priceMax = 500000;
        } else if (selectedPrice === '5to7') {
          params.priceMin = 500000;
          params.priceMax = 700000;
        } else if (selectedPrice === 'over7') {
          params.priceMin = 700000;
        }

        // Year mapping
        if (selectedYear === '2023') {
          params.yearMin = 2023;
        } else if (selectedYear === '2021') {
          params.yearMin = 2021;
        } else if (selectedYear === '2019') {
          params.yearMin = 2019;
        } else if (selectedYear === '2017') {
          params.yearMin = 2017;
        }

        // Hours mapping
        if (selectedHours === 'under1000') {
          params.maxHours = 1000;
        } else if (selectedHours === 'under2500') {
          params.maxHours = 2500;
        } else if (selectedHours === 'under5000') {
          params.maxHours = 5000;
        }

        // Ownership mapping
        if (selectedOwnership) {
          params.ownership = Number(selectedOwnership);
        }

        const res = await usedTractorListingAPI.getAllListings(params);
        if (res.success && res.data) {
          setTractors(res.data.data || []);
          setTotalTractors(res.data.total || 0);
          setTotalPages(res.data.totalPages || 1);
        } else {
          setTractors([]);
          setTotalTractors(0);
          setTotalPages(1);
        }
      } catch (err) {
        console.error('Failed to load used tractor listings', err);
        setTractors([]);
        setTotalTractors(0);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchListings, 300);
    return () => clearTimeout(debounce);
  }, [
    page,
    limit,
    searchQuery,
    selectedBrand,
    selectedState,
    selectedDistrict,
    selectedPrice,
    selectedYear,
    selectedHours,
    selectedOwnership,
    selectedCondition,
    isCertifiedOnly,
    financeOnly,
    rcOnly,
    sortBy,
  ]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedBrand('');
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedPrice('');
    setSelectedYear('');
    setSelectedHours('');
    setSelectedOwnership('');
    setSelectedCondition('');
    setIsCertifiedOnly(false);
    setFinanceOnly(false);
    setRcOnly(false);
    setPage(1);
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedBrand !== '' ||
    selectedState !== '' ||
    selectedDistrict !== '' ||
    selectedPrice !== '' ||
    selectedYear !== '' ||
    selectedHours !== '' ||
    selectedOwnership !== '' ||
    selectedCondition !== '' ||
    isCertifiedOnly ||
    financeOnly ||
    rcOnly;

  return (
    <div className="container mx-auto px-3.5 pb-16 max-w-7xl">
      {/* HERO BANNER SECTION (Matching /tractors design) */}
      <div className="relative mb-5 sm:mb-8 md:mb-10 overflow-hidden rounded-[24px] sm:rounded-[30px] md:rounded-[2.5rem] border border-black/10 dark:border-white/10 bg-gradient-to-br from-emerald-500/10 via-white/80 to-amber-500/10 dark:from-emerald-950/40 dark:via-[#111713]/90 dark:to-amber-950/30 p-4 sm:p-6 md:p-10 lg:p-12 shadow-lg dark:shadow-2xl backdrop-blur-xl">
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 sm:h-96 w-72 sm:w-96 rounded-full bg-[var(--color-brand-green)]/20 dark:bg-[var(--color-brand-green)]/25 blur-[90px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-60 sm:h-80 w-60 sm:w-80 rounded-full bg-[var(--color-brand-orange)]/15 dark:bg-[var(--color-brand-orange)]/20 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col items-start justify-between gap-4 sm:gap-6 lg:flex-row lg:items-center">
          <div className="flex w-full max-w-3xl flex-col gap-2 sm:gap-3">
            {/* Top Row: Badge + Mobile Metric Pill */}
            <div className="flex w-full items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-lime-400/30 bg-lime-400/10 px-2.5 py-0.5 sm:px-3.5 sm:py-1 text-[10px] sm:text-xs font-black tracking-wider text-lime-500 uppercase">
                <ShieldCheck size={11} className="sm:size-[13px]" /> Verified Pre-Owned Marketplace
              </span>
              {/* Mobile-only compact metric pill */}
              <span className="inline-flex lg:hidden items-center gap-1 rounded-full bg-[var(--color-brand-green)]/15 border border-[var(--color-brand-green)]/30 px-2.5 py-0.5 text-[10.5px] font-black text-[var(--color-brand-green)] shrink-0">
                <Tractor size={12} /> {totalTractors} Tractors
              </span>
            </div>

            <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-4xl lg:text-5xl leading-tight">
              Explore{' '}
              <span className="bg-gradient-to-r from-[var(--color-brand-green)] via-emerald-600 to-[var(--color-brand-orange)] bg-clip-text text-transparent">
                Used Tractors
              </span>
            </h1>

            <p className="text-muted text-xs sm:text-base font-medium leading-relaxed sm:text-lg line-clamp-2 md:line-clamp-none">
              Find certified, reliable pre-owned tractors across India at genuine market prices with verified documentation and direct seller connection.
            </p>

            {/* Mobile Action Pill Bar */}
            <div className="mt-1 flex items-center gap-2 sm:hidden">
              <Link
                href="/sell-used-tractor"
                className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-orange)] px-3.5 py-1 text-xs font-bold text-white shadow-sm"
              >
                <Plus size={13} /> Sell Your Tractor
              </Link>
            </div>
          </div>

          {/* Desktop Metric Box & Sell Button */}
          <div className="z-10 hidden lg:flex shrink-0 items-center gap-4">
            <div className="flex items-center gap-4 rounded-3xl border border-black/8 dark:border-white/10 bg-white/80 dark:bg-[#151c17]/90 p-5 shadow-lg backdrop-blur-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-brand-green)]/15 text-[var(--color-brand-green)]">
                <Tractor size={32} strokeWidth={1.8} />
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-black tracking-tight text-foreground">
                  {totalTractors}
                </span>
                <span className="text-muted text-[10px] font-black tracking-widest uppercase">
                  Tractors Available
                </span>
                <span className="mt-0.5 text-[11px] font-bold text-[var(--color-brand-green)]">
                  ✓ Verified Sellers
                </span>
              </div>
            </div>

            <Link
              href="/sell-used-tractor"
              className="bg-[var(--color-brand-orange)] hover:opacity-90 text-white flex items-center gap-2 rounded-2xl px-6 py-4 font-black text-sm shadow-lg shadow-[var(--color-brand-orange)]/20 transition-all whitespace-nowrap"
            >
              <Plus size={18} /> Sell Tractor
            </Link>
          </div>
        </div>
      </div>

      {/* ===================== MOBILE QUICK FILTERS STRIP (Sticky & True Edge-to-Edge) ===================== */}
      <div className="sticky top-[4.25rem] sm:top-[4.75rem] z-20 w-[calc(100%+1.75rem)] -mx-3.5 px-3.5 py-2 mb-4 bg-background/95 dark:bg-[#0c100e]/95 backdrop-blur-xl border-b border-[var(--border-subtle)] shadow-xs flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth overscroll-x-contain lg:hidden">
        {/* Toggle Filters Button */}
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-black/10 dark:border-white/15 bg-white/95 dark:bg-[#151c17] px-3.5 py-2 text-xs font-black text-foreground shadow-sm backdrop-blur-md active:scale-95 transition-all cursor-pointer"
        >
          <SlidersHorizontal size={14} className="text-[var(--color-brand-green)]" />
          <span>{showFilters ? 'Hide Filters' : 'Filters'}</span>
          {hasActiveFilters && (
            <span className="flex h-2 w-2 rounded-full bg-[var(--color-brand-green)]" />
          )}
        </button>

        {/* Certified Badge Pill */}
        <button
          type="button"
          onClick={() => {
            setIsCertifiedOnly(!isCertifiedOnly);
            setPage(1);
          }}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            isCertifiedOnly
              ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
              : 'border border-black/8 dark:border-white/10 bg-white/80 dark:bg-white/5 text-foreground/80'
          }`}
        >
          <ShieldCheck size={13} className={isCertifiedOnly ? 'text-white' : 'text-emerald-500'} />
          <span>Verified</span>
          {isCertifiedOnly && <X size={12} strokeWidth={2.5} />}
        </button>

        {/* Quick Budget Pills */}
        <button
          type="button"
          onClick={() => {
            setSelectedPrice(selectedPrice === 'under3' ? '' : 'under3');
            setPage(1);
          }}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            selectedPrice === 'under3'
              ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
              : 'border border-black/8 dark:border-white/10 bg-white/80 dark:bg-white/5 text-foreground/80'
          }`}
        >
          <span>&lt; ₹3 Lakh</span>
          {selectedPrice === 'under3' && <X size={12} strokeWidth={2.5} />}
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedPrice(selectedPrice === '3to5' ? '' : '3to5');
            setPage(1);
          }}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            selectedPrice === '3to5'
              ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
              : 'border border-black/8 dark:border-white/10 bg-white/80 dark:bg-white/5 text-foreground/80'
          }`}
        >
          <span>₹3 - 5 Lakh</span>
          {selectedPrice === '3to5' && <X size={12} strokeWidth={2.5} />}
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedPrice(selectedPrice === 'over5' ? '' : 'over5');
            setPage(1);
          }}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            selectedPrice === 'over5'
              ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
              : 'border border-black/8 dark:border-white/10 bg-white/80 dark:bg-white/5 text-foreground/80'
          }`}
        >
          <span>&gt; ₹5 Lakh</span>
          {selectedPrice === 'over5' && <X size={12} strokeWidth={2.5} />}
        </button>

        {/* Quick Year Pill */}
        <button
          type="button"
          onClick={() => {
            setSelectedYear(selectedYear === '2021' ? '' : '2021');
            setPage(1);
          }}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            selectedYear === '2021'
              ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
              : 'border border-black/8 dark:border-white/10 bg-white/80 dark:bg-white/5 text-foreground/80'
          }`}
        >
          <span>2021+ Models</span>
          {selectedYear === '2021' && <X size={12} strokeWidth={2.5} />}
        </button>

        {/* Clear All pill on Mobile if any filters active */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-500/10 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <RotateCcw size={12} /> Clear
          </button>
        )}
        <div className="w-2 shrink-0" aria-hidden="true" />
      </div>

      <div className="flex flex-col items-start gap-8 lg:flex-row">
        {/* MOBILE FILTER TOGGLE */}
        <button
          className="bg-foreground/5 flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--border-subtle)] py-4 font-bold lg:hidden"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} /> {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>

        {/* SIDEBAR FILTERS (Matching /tractors layout & PRD) */}
        <aside
          className={`flex w-full flex-shrink-0 flex-col gap-6 lg:w-72 ${showFilters ? 'flex' : 'hidden lg:flex'}`}
        >
          <div className="spatial-panel lg:sticky lg:top-24 flex flex-col gap-6 rounded-[2rem] p-6 lg:max-h-[80vh] lg:overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-[var(--color-brand-green)]" /> Filters
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-bold text-[var(--color-brand-orange)] hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Filter: Search */}
            <div className="flex flex-col gap-2">
              <span className="text-muted text-xs font-black tracking-widest uppercase">
                Search
              </span>
              <div className="relative">
                <Search size={16} className="text-muted absolute top-1/2 left-3 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Model or City..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="bg-background w-full rounded-xl border border-[var(--border-subtle)] py-2.5 pr-4 pl-9 text-xs font-bold transition-colors focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                />
              </div>
            </div>

            {/* Filter: Location (State) */}
            <div className="flex flex-col gap-2">
              <span className="text-muted text-xs font-black tracking-widest uppercase">
                State Location
              </span>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setPage(1);
                }}
                className="bg-background w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2.5 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)]/50 focus:outline-none"
              >
                <option value="">All States</option>
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter: Trust & Verification Toggles */}
            <div className="flex flex-col gap-2.5 border-t border-[var(--border-subtle)] pt-4">
              <span className="text-muted text-xs font-black tracking-widest uppercase">
                Trust & Verification
              </span>
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-foreground">
                <input
                  type="checkbox"
                  checked={isCertifiedOnly}
                  onChange={(e) => {
                    setIsCertifiedOnly(e.target.checked);
                    setPage(1);
                  }}
                  className="h-4 w-4 rounded accent-lime-400"
                />
                <span className="flex items-center gap-1 text-lime-400">
                  <ShieldCheck size={14} /> Certified Only
                </span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-foreground">
                <input
                  type="checkbox"
                  checked={financeOnly}
                  onChange={(e) => {
                    setFinanceOnly(e.target.checked);
                    setPage(1);
                  }}
                  className="h-4 w-4 rounded accent-purple-400"
                />
                <span>Loan Available</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-foreground">
                <input
                  type="checkbox"
                  checked={rcOnly}
                  onChange={(e) => {
                    setRcOnly(e.target.checked);
                    setPage(1);
                  }}
                  className="h-4 w-4 rounded accent-emerald-400"
                />
                <span>RC Book Available</span>
              </label>
            </div>

            {/* Filter: Brands */}
            <div className="flex flex-col gap-2.5 border-t border-[var(--border-subtle)] pt-4">
              <span className="text-muted text-xs font-black tracking-widest uppercase">
                Brands
              </span>
              <div className="custom-scrollbar flex max-h-48 flex-col gap-1.5 overflow-y-auto pr-1">
                <label
                  className="group flex cursor-pointer items-center gap-2.5"
                  onClick={() => {
                    setSelectedBrand('');
                    setPage(1);
                  }}
                >
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                      selectedBrand === ''
                        ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]'
                        : 'border-[var(--border-subtle)]'
                    }`}
                  >
                    {selectedBrand === '' && <div className="h-2 w-2 rounded-sm bg-white" />}
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      selectedBrand === '' ? 'text-foreground' : 'text-muted group-hover:text-foreground'
                    }`}
                  >
                    All Brands
                  </span>
                </label>

                {brands.map((brand) => (
                  <label
                    key={brand.id}
                    className="group flex cursor-pointer items-center gap-2.5"
                    onClick={() => {
                      setSelectedBrand(brand.name);
                      setPage(1);
                    }}
                  >
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                        selectedBrand === brand.name
                          ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]'
                          : 'border-[var(--border-subtle)]'
                      }`}
                    >
                      {selectedBrand === brand.name && <div className="h-2 w-2 rounded-sm bg-white" />}
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        selectedBrand === brand.name ? 'text-foreground' : 'text-muted group-hover:text-foreground'
                      }`}
                    >
                      {brand.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter: Price Range */}
            <div className="flex flex-col gap-2.5 border-t border-[var(--border-subtle)] pt-4">
              <span className="text-muted text-xs font-black tracking-widest uppercase">
                Budget / Price
              </span>
              <div className="flex flex-col gap-1.5">
                {[
                  { value: '', label: 'All Prices' },
                  { value: 'under3', label: 'Under ₹ 3 Lakh' },
                  { value: '3to5', label: '₹ 3 - 5 Lakh' },
                  { value: '5to7', label: '₹ 5 - 7 Lakh' },
                  { value: 'over7', label: 'Above ₹ 7 Lakh' },
                ].map((p) => (
                  <label
                    key={p.value}
                    className="group flex cursor-pointer items-center gap-2.5"
                    onClick={() => {
                      setSelectedPrice(p.value);
                      setPage(1);
                    }}
                  >
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                        selectedPrice === p.value
                          ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]'
                          : 'border-[var(--border-subtle)]'
                      }`}
                    >
                      {selectedPrice === p.value && <div className="h-2 w-2 rounded-sm bg-white" />}
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        selectedPrice === p.value ? 'text-foreground' : 'text-muted group-hover:text-foreground'
                      }`}
                    >
                      {p.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter: Year of Manufacture */}
            <div className="flex flex-col gap-2.5 border-t border-[var(--border-subtle)] pt-4">
              <span className="text-muted text-xs font-black tracking-widest uppercase">
                Manufacturing Year
              </span>
              <div className="flex flex-col gap-1.5">
                {[
                  { value: '', label: 'Any Year' },
                  { value: '2023', label: '2023 or Newer' },
                  { value: '2021', label: '2021 or Newer' },
                  { value: '2019', label: '2019 or Newer' },
                  { value: '2017', label: '2017 or Newer' },
                ].map((y) => (
                  <label
                    key={y.value}
                    className="group flex cursor-pointer items-center gap-2.5"
                    onClick={() => {
                      setSelectedYear(y.value);
                      setPage(1);
                    }}
                  >
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                        selectedYear === y.value
                          ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]'
                          : 'border-[var(--border-subtle)]'
                      }`}
                    >
                      {selectedYear === y.value && <div className="h-2 w-2 rounded-sm bg-white" />}
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        selectedYear === y.value ? 'text-foreground' : 'text-muted group-hover:text-foreground'
                      }`}
                    >
                      {y.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter: Usage / Hours Run */}
            <div className="flex flex-col gap-2.5 border-t border-[var(--border-subtle)] pt-4">
              <span className="text-muted text-xs font-black tracking-widest uppercase">
                Hours Run (Meter)
              </span>
              <div className="flex flex-col gap-1.5">
                {[
                  { value: '', label: 'Any Usage' },
                  { value: 'under1000', label: 'Under 1,000 hrs' },
                  { value: 'under2500', label: 'Under 2,500 hrs' },
                  { value: 'under5000', label: 'Under 5,000 hrs' },
                ].map((h) => (
                  <label
                    key={h.value}
                    className="group flex cursor-pointer items-center gap-2.5"
                    onClick={() => {
                      setSelectedHours(h.value);
                      setPage(1);
                    }}
                  >
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                        selectedHours === h.value
                          ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]'
                          : 'border-[var(--border-subtle)]'
                      }`}
                    >
                      {selectedHours === h.value && <div className="h-2 w-2 rounded-sm bg-white" />}
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        selectedHours === h.value ? 'text-foreground' : 'text-muted group-hover:text-foreground'
                      }`}
                    >
                      {h.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter: Ownership */}
            <div className="flex flex-col gap-2.5 border-t border-[var(--border-subtle)] pt-4">
              <span className="text-muted text-xs font-black tracking-widest uppercase">
                Ownership
              </span>
              <div className="flex flex-col gap-1.5">
                {[
                  { value: '', label: 'All Owners' },
                  { value: '1', label: '1st Owner Only' },
                  { value: '2', label: '2nd Owner' },
                  { value: '3', label: '3rd+ Owner' },
                ].map((o) => (
                  <label
                    key={o.value}
                    className="group flex cursor-pointer items-center gap-2.5"
                    onClick={() => {
                      setSelectedOwnership(o.value);
                      setPage(1);
                    }}
                  >
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                        selectedOwnership === o.value
                          ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]'
                          : 'border-[var(--border-subtle)]'
                      }`}
                    >
                      {selectedOwnership === o.value && <div className="h-2 w-2 rounded-sm bg-white" />}
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        selectedOwnership === o.value ? 'text-foreground' : 'text-muted group-hover:text-foreground'
                      }`}
                    >
                      {o.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex w-full min-w-0 flex-1 flex-col gap-6">
          {/* Top Bar Actions (Matching /tractors) */}
          <div className="bg-background/50 flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-[var(--border-subtle)] p-4 backdrop-blur-md">
            <div className="flex flex-col gap-2">
              <p className="text-muted text-sm font-bold">
                Showing <span className="text-foreground">{tractors.length}</span> tractors on this page
              </p>

              {/* Active Filter Chips */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedBrand && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-green)]/10 px-2.5 py-0.5 text-xs font-bold text-[var(--color-brand-green)]">
                      {selectedBrand}
                      <button onClick={() => setSelectedBrand('')}>
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {selectedState && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-green)]/10 px-2.5 py-0.5 text-xs font-bold text-[var(--color-brand-green)]">
                      {selectedState}
                      <button onClick={() => setSelectedState('')}>
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {selectedPrice && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-green)]/10 px-2.5 py-0.5 text-xs font-bold text-[var(--color-brand-green)]">
                      Price Filter
                      <button onClick={() => setSelectedPrice('')}>
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {isCertifiedOnly && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-lime-400/10 px-2.5 py-0.5 text-xs font-bold text-lime-400">
                      Certified
                      <button onClick={() => setIsCertifiedOnly(false)}>
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {financeOnly && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-bold text-purple-400">
                      Loan
                      <button onClick={() => setFinanceOnly(false)}>
                        <X size={12} />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* View Mode & Sort */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <ArrowUpDown size={14} className="text-muted" />
                <select
                  suppressHydrationWarning
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as ListingSortBy);
                    setPage(1);
                  }}
                  className="bg-background rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="year_desc">Year: Newest</option>
                  <option value="hours_asc">Lowest Hours</option>
                </select>
              </div>

              <div className="bg-foreground/5 flex items-center rounded-xl border border-[var(--border-subtle)] p-1">
                <button
                  suppressHydrationWarning
                  onClick={() => setViewMode('grid')}
                  className={`rounded-lg p-1.5 transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted hover:text-foreground'
                  }`}
                  title="Grid View"
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  suppressHydrationWarning
                  onClick={() => setViewMode('list')}
                  className={`rounded-lg p-1.5 transition-colors ${
                    viewMode === 'list'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted hover:text-foreground'
                  }`}
                  title="List View"
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* LISTINGS CONTENT */}
          {loading ? (
            <div className="flex flex-1 flex-col items-center justify-center py-24">
              <Loader2 className="animate-spin text-[var(--color-brand-green)]" size={40} />
              <p className="text-muted mt-3 text-xs font-bold">Finding matching pre-owned tractors...</p>
            </div>
          ) : tractors.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-2xl sm:rounded-3xl border border-dashed border-[var(--border-subtle)] bg-background/50 p-6 sm:p-10 md:p-12 text-center backdrop-blur-md">
              <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] mb-3 sm:mb-4">
                <Tractor size={24} className="sm:size-8" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-foreground">No Used Tractors Match Your Filters</h3>
              <p className="text-muted text-xs max-w-sm mt-1 mb-4 sm:mb-6">
                Try widening your price range, location, or brand selection to discover more tractors.
              </p>
              <button
                onClick={clearAllFilters}
                className="bg-[var(--color-brand-green)] text-white rounded-xl px-4 py-2 sm:px-5 sm:py-2.5 text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-md"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3'
                    : 'flex flex-col gap-4'
                }
              >
                {tractors.map((listing) => (
                  <PublicUsedTractorCard
                    key={listing.id}
                    listing={listing}
                    viewMode={viewMode}
                    onQuickView={(id) => setQuickViewId(id)}
                    onEnquiry={(item) => setEnquiryListing(item)}
                  />
                ))}
              </div>

              {/* Shared Pagination Component */}
              <Pagination
                page={page}
                limit={limit}
                totalCount={totalTractors}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
                onLimitChange={(l) => {
                  setLimit(l);
                  setPage(1);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* QUICK VIEW INSPECTION MODAL */}
      <PublicUsedQuickViewModal
        listingId={quickViewId}
        onClose={() => setQuickViewId(null)}
        onContactSeller={(item) => setEnquiryListing(item)}
      />

      {/* SECURE ENQUIRY / CONTACT SELLER MODAL */}
      <PublicUsedEnquiryModal
        listing={enquiryListing}
        onClose={() => setEnquiryListing(null)}
      />
    </div>
  );
}

export default function UsedTractorsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="animate-spin text-[var(--color-brand-green)]" size={40} />
        </div>
      }
    >
      <UsedTractorsListingContent />
    </Suspense>
  );
}
