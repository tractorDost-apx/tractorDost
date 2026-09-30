'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { usedTractorListingAPI } from '@/lib/api/used-listings';
import { usedTractorEnquiryAPI } from '@/lib/api/used-enquiries';
import { UsedTractorListing, ConditionGrade, UrgencyLevel } from '@/lib/api/usedTractors';
import type {
  ListingFilters,
  ListingSortBy,
  LoanClearanceStatus,
} from '@/types/models/used-listing';
import { brandAPI, Brand } from '@/lib/api/brands';
import {
  Search,
  MapPin,
  Filter,
  LayoutList,
  LayoutGrid,
  Calendar,
  Gauge,
  User,
  CheckCircle2,
  CircleDollarSign,
  X,
  MessageCircle,
  Info,
  ShieldCheck,
  ChevronRight,
  Eye,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  FileCheck,
  Building2,
  Clock,
  ArrowUpDown,
  Phone,
  Check,
  AlertCircle,
} from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';
import Link from 'next/link';
import Pagination from '@/components/shared/Pagination';

// Major Indian States List
const INDIAN_STATES = [
  'Maharashtra',
  'Punjab',
  'Haryana',
  'Uttar Pradesh',
  'Madhya Pradesh',
  'Rajasthan',
  'Gujarat',
  'Karnataka',
  'Andhra Pradesh',
  'Tamil Nadu',
  'Bihar',
  'West Bengal',
  'Telangana',
  'Odisha',
  'Chhattisgarh',
];

export default function UsedTractorsPage() {
  // Data States
  const [tractors, setTractors] = useState<UsedTractorListing[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // UI Control States
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<
    'recent' | 'price_low' | 'price_high' | 'hours_low' | 'year_new' | 'quality_high'
  >('recent');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Modals
  const [enquiryModalOpen, setEnquiryModalOpen] = useState<UsedTractorListing | null>(null);
  const [quickViewModalId, setQuickViewModalId] = useState<number | null>(null);
  const [quickViewDetails, setQuickViewDetails] = useState<any>(null);
  const [quickViewLoading, setQuickViewLoading] = useState<boolean>(false);

  // Pagination State
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(9);

  // ----------------------------------------------------
  // MAXIMUM FILTERS STATE
  // ----------------------------------------------------
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [brandSearch, setBrandSearch] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');

  // Price Filters
  const [priceMin, setPriceMin] = useState<number | undefined>(undefined);
  const [priceMax, setPriceMax] = useState<number | undefined>(undefined);

  // Year Filters
  const [yearMin, setYearMin] = useState<number | undefined>(undefined);
  const [yearMax, setYearMax] = useState<number | undefined>(undefined);

  // Condition & Verification
  const [conditionGrade, setConditionGrade] = useState<string>('');
  const [isCertified, setIsCertified] = useState<boolean>(false);
  const [financeAvailable, setFinanceAvailable] = useState<boolean>(false);
  const [rcAvailable, setRcAvailable] = useState<boolean>(false);
  const [loanClearanceStatus, setLoanClearanceStatus] = useState<string>('');

  // Usage & Ownership
  const [maxHours, setMaxHours] = useState<number | undefined>(undefined);
  const [ownership, setOwnership] = useState<number | undefined>(undefined);
  const [urgency, setUrgency] = useState<string>('');

  // Enquiry Form State
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    mobile: '',
    offerPrice: '',
    message: '',
  });
  const [submittingEnquiry, setSubmittingEnquiry] = useState<boolean>(false);
  const [enquirySuccess, setEnquirySuccess] = useState<boolean>(false);
  const [enquiryError, setEnquiryError] = useState<string | null>(null);

  // Price presets
  const pricePresets = [
    { label: 'All Prices', min: undefined, max: undefined },
    { label: 'Under ₹3L', min: undefined, max: 300000 },
    { label: '₹3L - ₹5L', min: 300000, max: 500000 },
    { label: '₹5L - ₹7L', min: 500000, max: 700000 },
    { label: 'Above ₹7L', min: 700000, max: undefined },
  ];

  // Year presets
  const yearPresets = [
    { label: 'Any Year', min: undefined, max: undefined },
    { label: '2023+', min: 2023, max: undefined },
    { label: '2021+', min: 2021, max: undefined },
    { label: '2019+', min: 2019, max: undefined },
    { label: '2017+', min: 2017, max: undefined },
  ];

  // Formatter
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper for extracting listing image URL
  const getListingImageUrl = (tractor: any) => {
    if (tractor.imageUrl) return tractor.imageUrl;
    if (Array.isArray(tractor.media) && tractor.media.length > 0 && tractor.media[0]?.url) {
      return tractor.media[0].url;
    }
    if (
      Array.isArray(tractor.documents) &&
      tractor.documents.length > 0 &&
      tractor.documents[0]?.url
    ) {
      return tractor.documents[0].url;
    }
    return 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80';
  };

  // Fetch Brands on Mount
  useEffect(() => {
    brandAPI
      .getAllBrands({ limit: 100 })
      .then((res) => {
        if (res.success) {
          const list =
            (res.data as any)?.data ||
            (res.data as any)?.brands ||
            (Array.isArray(res.data) ? res.data : []);
          setBrands(list.filter((b: any) => b.isActive));
        }
      })
      .catch(() => setBrands([]));
  }, []);

  // Any filter or sort change starts again from the first server page
  useEffect(() => {
    setPage(1);
  }, [
    searchQuery,
    selectedBrand,
    selectedState,
    selectedDistrict,
    priceMin,
    priceMax,
    yearMin,
    yearMax,
    conditionGrade,
    isCertified,
    financeAvailable,
    rcAvailable,
    loanClearanceStatus,
    maxHours,
    ownership,
    urgency,
    sortBy,
  ]);

  // API Call: Fetch Used Tractor Listings with Query Filters (getAllUsedTractorListing)
  useEffect(() => {
    const fetchTractors = async () => {
      setLoading(true);
      try {
        // All filtering, sorting and paging happens on the server
        const serverSort: Record<typeof sortBy, ListingSortBy> = {
          recent: 'newest',
          price_low: 'price_asc',
          price_high: 'price_desc',
          hours_low: 'hours_asc',
          year_new: 'year_desc',
          quality_high: 'newest', // no server-side quality sort; re-ordered within the page below
        };

        const apiParams: ListingFilters = {
          page,
          limit,
          sortBy: serverSort[sortBy],
          ...(searchQuery.trim() && { search: searchQuery.trim() }),
          ...(selectedBrand && { tractorBrand: selectedBrand }),
          ...(selectedState && { state: selectedState }),
          ...(selectedDistrict && { district: selectedDistrict }),
          ...(priceMin !== undefined && { priceMin }),
          ...(priceMax !== undefined && { priceMax }),
          ...(yearMin !== undefined && { yearMin }),
          ...(yearMax !== undefined && { yearMax }),
          ...(conditionGrade && { conditionGrade: conditionGrade as ConditionGrade }),
          ...(isCertified && { isCertified: true }),
          ...(financeAvailable && { financeAvailable: true }),
          ...(rcAvailable && { rcAvailable: true }),
          ...(loanClearanceStatus && {
            loanClearanceStatus: loanClearanceStatus as LoanClearanceStatus,
          }),
          ...(maxHours !== undefined && { maxHours }),
          ...(ownership !== undefined && { ownership }),
          ...(urgency && { urgency: urgency as UrgencyLevel }),
        };

        const res = await usedTractorListingAPI.getAllListings(apiParams);

        const dataList = res.success && res.data ? res.data.data : [];
        const total = res.success && res.data ? res.data.total : 0;

        if (sortBy === 'quality_high') {
          dataList.sort((a, b) => (b.listingQualityScore || 0) - (a.listingQualityScore || 0));
        }

        setTractors(dataList);
        setTotalCount(total);
      } catch (err) {
        console.error('Failed to fetch database used tractors', err);
        setTractors([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchTractors, 250);
    return () => clearTimeout(debounceTimer);
  }, [
    page,
    limit,
    searchQuery,
    selectedBrand,
    selectedState,
    selectedDistrict,
    priceMin,
    priceMax,
    yearMin,
    yearMax,
    conditionGrade,
    isCertified,
    financeAvailable,
    rcAvailable,
    loanClearanceStatus,
    maxHours,
    ownership,
    urgency,
    sortBy,
  ]);

  // Fetch Quick View Details using getUsedTractorListingById API (`/used-listings/get/:id`)
  const handleOpenQuickView = async (id: number) => {
    setQuickViewModalId(id);
    setQuickViewLoading(true);
    try {
      const res = await usedTractorListingAPI.getListingById(id);
      if (res.success && res.data) {
        setQuickViewDetails(res.data);
      } else {
        // Fallback to local item if backend single fetch fails
        const localItem = tractors.find((t) => t.id === id);
        setQuickViewDetails(localItem || null);
      }
    } catch (err) {
      const localItem = tractors.find((t) => t.id === id);
      setQuickViewDetails(localItem || null);
    } finally {
      setQuickViewLoading(false);
    }
  };

  // Submit Enquiry Lead API Call
  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryModalOpen) return;

    setSubmittingEnquiry(true);
    setEnquiryError(null);

    try {
      const res = await usedTractorEnquiryAPI.createEnquiry({
        listingId: enquiryModalOpen.id,
        name: enquiryForm.name.trim(),
        mobile: enquiryForm.mobile.trim(),
        // The API has no offer field, so an offer travels inside the message
        message: [
          enquiryForm.message.trim() ||
            `I am interested in buying ${enquiryModalOpen.tractorBrand} ${enquiryModalOpen.tractorModel}.`,
          enquiryForm.offerPrice ? `My offer: ${formatPrice(Number(enquiryForm.offerPrice))}` : '',
        ]
          .filter(Boolean)
          .join(' '),
      });

      if (res.success) {
        setEnquirySuccess(true);
      } else {
        setEnquiryError(res.message || 'Failed to submit enquiry. Please try again.');
      }
    } catch (err: any) {
      setEnquiryError('Network error. Unable to send enquiry.');
    } finally {
      setSubmittingEnquiry(false);
    }
  };

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedBrand) count++;
    if (selectedState) count++;
    if (selectedDistrict) count++;
    if (priceMin !== undefined || priceMax !== undefined) count++;
    if (yearMin !== undefined || yearMax !== undefined) count++;
    if (conditionGrade) count++;
    if (isCertified) count++;
    if (financeAvailable) count++;
    if (rcAvailable) count++;
    if (loanClearanceStatus) count++;
    if (maxHours !== undefined) count++;
    if (ownership !== undefined) count++;
    if (urgency) count++;
    return count;
  }, [
    searchQuery,
    selectedBrand,
    selectedState,
    selectedDistrict,
    priceMin,
    priceMax,
    yearMin,
    yearMax,
    conditionGrade,
    isCertified,
    financeAvailable,
    rcAvailable,
    loanClearanceStatus,
    maxHours,
    ownership,
    urgency,
  ]);

  // Clear all filters
  const handleClearAllFilters = () => {
    setSearchQuery('');
    setBrandSearch('');
    setSelectedBrand(null);
    setSelectedState('');
    setSelectedDistrict('');
    setPriceMin(undefined);
    setPriceMax(undefined);
    setYearMin(undefined);
    setYearMax(undefined);
    setConditionGrade('');
    setIsCertified(false);
    setFinanceAvailable(false);
    setRcAvailable(false);
    setLoanClearanceStatus('');
    setMaxHours(undefined);
    setOwnership(undefined);
    setUrgency('');
    setPage(1);
  };

  // Filtered Brand List for Brand Selector
  const filteredBrands = useMemo(() => {
    if (!brandSearch) return brands;
    return brands.filter((b) => b.name.toLowerCase().includes(brandSearch.toLowerCase()));
  }, [brands, brandSearch]);

  // The server already returns exactly one page
  const paginatedTractors = tractors;

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[1440px] px-4 py-8 sm:px-6">
      {/* ---------------------------------------------------- */}
      {/* HEADER SECTION */}
      {/* ---------------------------------------------------- */}
      <div className="animate-fade-in mb-10 flex flex-col items-center text-center">
        <div className="mb-3 inline-flex items-center justify-center rounded-full border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-4 py-1.5 text-xs font-black tracking-widest text-[var(--color-brand-green)] uppercase shadow-sm">
          <ShieldCheck size={16} className="mr-2 inline" /> Verified Pre-Owned Marketplace
        </div>
        <h1 className="text-foreground mb-3 text-4xl font-black tracking-tight md:text-5xl">
          Find Used <span className="text-[var(--color-brand-green)]">Tractors & Machinery</span>
        </h1>
        <p className="text-muted max-w-2xl text-base font-bold md:text-lg">
          Browse certified used tractors with full inspection scores, transparent pricing, finance
          support, and direct seller details.
        </p>
      </div>

      {/* Main Container */}
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* ---------------------------------------------------- */}
        {/* LEFT COLUMN: MAXIMUM SMART FILTERS */}
        {/* ---------------------------------------------------- */}
        <aside
          className={`flex w-full shrink-0 flex-col gap-6 lg:w-80 ${mobileFilterOpen ? 'bg-background fixed inset-0 z-50 overflow-y-auto p-6' : 'hidden lg:flex'} `}
        >
          <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--card-bg)] p-6 shadow-[var(--card-shadow)] backdrop-blur-3xl lg:sticky lg:top-24">
            {/* Filter Header */}
            <div className="mb-6 flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-[var(--color-brand-green)]/10 p-2 text-[var(--color-brand-green)]">
                  <SlidersHorizontal size={18} />
                </div>
                <div>
                  <h3 className="text-foreground text-lg leading-none font-black">Smart Filters</h3>
                  {activeFiltersCount > 0 && (
                    <span className="text-[10px] font-bold text-[var(--color-brand-green)]">
                      {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleClearAllFilters}
                    className="flex items-center gap-1 text-xs font-bold text-red-500 transition-colors hover:text-red-600 hover:underline"
                  >
                    <RotateCcw size={12} /> Clear
                  </button>
                )}
                {mobileFilterOpen && (
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="bg-foreground/5 rounded-full p-2 lg:hidden"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            <div className="custom-scrollbar max-h-[calc(100vh-220px)] space-y-6 overflow-y-auto pr-1">
              {/* 1. Keyword Search */}
              <div>
                <label className="text-muted mb-2 block text-[10px] font-black tracking-widest uppercase">
                  Search Keyword
                </label>
                <div className="relative">
                  <Search
                    size={16}
                    className="text-muted absolute top-1/2 left-3.5 -translate-y-1/2"
                  />
                  <input
                    type="text"
                    placeholder="Model, brand, city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] py-2.5 pr-8 pl-10 text-sm font-bold transition-all outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-muted hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Brand Filter with Search */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-muted text-[10px] font-black tracking-widest uppercase">
                    Tractor Brand
                  </label>
                  {selectedBrand && (
                    <button
                      onClick={() => setSelectedBrand(null)}
                      className="text-[10px] font-bold text-[var(--color-brand-green)]"
                    >
                      Reset Brand
                    </button>
                  )}
                </div>

                {brands.length > 5 && (
                  <input
                    type="text"
                    placeholder="Search brand..."
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    className="bg-foreground/5 text-foreground mb-2 w-full rounded-lg border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-bold outline-none"
                  />
                )}

                <div className="custom-scrollbar flex max-h-40 flex-col gap-1.5 overflow-y-auto pr-1">
                  <button
                    onClick={() => setSelectedBrand(null)}
                    className={`flex items-center justify-between rounded-xl border p-2.5 text-xs font-bold transition-all ${
                      !selectedBrand
                        ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]'
                        : 'bg-foreground/5 text-foreground hover:bg-foreground/10 border-transparent'
                    }`}
                  >
                    <span>All Brands</span>
                    {!selectedBrand && <Check size={14} />}
                  </button>
                  {filteredBrands.map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => setSelectedBrand(brand.name)}
                      className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-xs font-bold transition-all ${
                        selectedBrand === brand.name
                          ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]'
                          : 'bg-foreground/5 text-foreground hover:bg-foreground/10 border-transparent'
                      }`}
                    >
                      {brand.logoUrl ? (
                        <img
                          src={brand.logoUrl}
                          alt={brand.name}
                          className="h-5 w-5 rounded bg-white object-contain p-0.5"
                        />
                      ) : (
                        <div className="bg-foreground/10 flex h-5 w-5 items-center justify-center rounded text-[10px] font-black">
                          {brand.name.charAt(0)}
                        </div>
                      )}
                      <span className="flex-1 truncate text-left">{brand.name}</span>
                      {selectedBrand === brand.name && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Location Filters (State & District) */}
              <div>
                <label className="text-muted mb-2 block text-[10px] font-black tracking-widest uppercase">
                  Location (State & District)
                </label>
                <div className="space-y-2">
                  <select
                    value={selectedState}
                    onChange={(e) => {
                      setSelectedState(e.target.value);
                      setSelectedDistrict('');
                    }}
                    className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]"
                  >
                    <option value="">All Indian States</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Enter District (e.g. Pune, Ludhiana)"
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]"
                  />
                </div>
              </div>

              {/* 4. Price Range & Presets */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-muted text-[10px] font-black tracking-widest uppercase">
                    Asking Price (INR)
                  </label>
                  {(priceMin !== undefined || priceMax !== undefined) && (
                    <button
                      onClick={() => {
                        setPriceMin(undefined);
                        setPriceMax(undefined);
                      }}
                      className="text-[10px] font-bold text-[var(--color-brand-green)]"
                    >
                      Clear Price
                    </button>
                  )}
                </div>

                <div className="mb-2 grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={priceMin || ''}
                    onChange={(e) =>
                      setPriceMin(e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-bold outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={priceMax || ''}
                    onChange={(e) =>
                      setPriceMax(e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-bold outline-none"
                  />
                </div>

                {/* Price Presets Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {pricePresets.slice(1).map((p) => {
                    const isSelected = priceMin === p.min && priceMax === p.max;
                    return (
                      <button
                        key={p.label}
                        onClick={() => {
                          setPriceMin(p.min);
                          setPriceMax(p.max);
                        }}
                        className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-all ${
                          isSelected
                            ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)] text-white'
                            : 'bg-foreground/5 text-muted hover:text-foreground border-[var(--border-subtle)]'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Year Range & Presets */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-muted text-[10px] font-black tracking-widest uppercase">
                    Manufacture Year
                  </label>
                  {(yearMin !== undefined || yearMax !== undefined) && (
                    <button
                      onClick={() => {
                        setYearMin(undefined);
                        setYearMax(undefined);
                      }}
                      className="text-[10px] font-bold text-[var(--color-brand-green)]"
                    >
                      Clear Year
                    </button>
                  )}
                </div>

                <div className="mb-2 flex flex-wrap gap-1.5">
                  {yearPresets.slice(1).map((y) => {
                    const isSelected = yearMin === y.min;
                    return (
                      <button
                        key={y.label}
                        onClick={() => {
                          setYearMin(isSelected ? undefined : y.min);
                          setYearMax(undefined);
                        }}
                        className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-all ${
                          isSelected
                            ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)] text-white'
                            : 'bg-foreground/5 text-muted hover:text-foreground border-[var(--border-subtle)]'
                        }`}
                      >
                        {y.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 6. Condition Grade Filter */}
              <div>
                <label className="text-muted mb-2 block text-[10px] font-black tracking-widest uppercase">
                  Overall Condition
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['', 'EXCELLENT', 'GOOD', 'FAIR', 'POOR'].map((grade) => {
                    const label = grade || 'Any Grade';
                    const isSelected = conditionGrade === grade;
                    return (
                      <button
                        key={label}
                        onClick={() => setConditionGrade(grade)}
                        className={`rounded-xl border px-2.5 py-2 text-center text-xs font-bold transition-all ${
                          isSelected
                            ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]'
                            : 'bg-foreground/5 text-foreground hover:bg-foreground/10 border-transparent'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 7. Usage (Max Hours Used) */}
              <div>
                <label className="text-muted mb-2 block text-[10px] font-black tracking-widest uppercase">
                  Max Hours Used
                </label>
                <select
                  value={maxHours || ''}
                  onChange={(e) => setMaxHours(e.target.value ? Number(e.target.value) : undefined)}
                  className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-bold outline-none"
                >
                  <option value="">Any Usage Hours</option>
                  <option value="1000">Under 1,000 Hours</option>
                  <option value="2500">Under 2,500 Hours</option>
                  <option value="4000">Under 4,000 Hours</option>
                </select>
              </div>

              {/* 8. Ownership */}
              <div>
                <label className="text-muted mb-2 block text-[10px] font-black tracking-widest uppercase">
                  Ownership
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { label: 'Any', val: undefined },
                    { label: '1st', val: 1 },
                    { label: '2nd', val: 2 },
                    { label: '3rd+', val: 3 },
                  ].map((o) => (
                    <button
                      key={o.label}
                      onClick={() => setOwnership(o.val)}
                      className={`rounded-lg border py-1.5 text-xs font-bold transition-all ${
                        ownership === o.val
                          ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)] text-white'
                          : 'bg-foreground/5 text-muted hover:text-foreground border-transparent'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 9. Urgency Filter */}
              <div>
                <label className="text-muted mb-2 block text-[10px] font-black tracking-widest uppercase">
                  Seller Urgency
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-bold outline-none"
                >
                  <option value="">Any Urgency</option>
                  <option value="FIFTEEN_DAYS">Urgent (Within 15 Days)</option>
                  <option value="THIRTY_DAYS">Within 30 Days</option>
                  <option value="NO_RUSH">No Rush</option>
                </select>
              </div>

              {/* 10. Verification & Legal Toggles */}
              <div className="space-y-2.5 border-t border-[var(--border-subtle)] pt-2">
                <label className="bg-foreground/5 hover:bg-foreground/10 flex cursor-pointer items-center gap-2.5 rounded-xl p-2.5 transition-colors">
                  <input
                    type="checkbox"
                    checked={isCertified}
                    onChange={(e) => setIsCertified(e.target.checked)}
                    className="h-4 w-4 rounded text-[var(--color-brand-green)] focus:ring-[var(--color-brand-green)]"
                  />
                  <span className="text-foreground flex items-center gap-1.5 text-xs font-black">
                    <ShieldCheck size={14} className="text-[var(--color-brand-green)]" /> Certified
                    Only
                  </span>
                </label>

                <label className="bg-foreground/5 hover:bg-foreground/10 flex cursor-pointer items-center gap-2.5 rounded-xl p-2.5 transition-colors">
                  <input
                    type="checkbox"
                    checked={financeAvailable}
                    onChange={(e) => setFinanceAvailable(e.target.checked)}
                    className="h-4 w-4 rounded text-[var(--color-brand-green)] focus:ring-[var(--color-brand-green)]"
                  />
                  <span className="text-foreground flex items-center gap-1.5 text-xs font-black">
                    <CircleDollarSign size={14} className="text-blue-500" /> Finance Available
                  </span>
                </label>

                <label className="bg-foreground/5 hover:bg-foreground/10 flex cursor-pointer items-center gap-2.5 rounded-xl p-2.5 transition-colors">
                  <input
                    type="checkbox"
                    checked={rcAvailable}
                    onChange={(e) => setRcAvailable(e.target.checked)}
                    className="h-4 w-4 rounded text-[var(--color-brand-green)] focus:ring-[var(--color-brand-green)]"
                  />
                  <span className="text-foreground flex items-center gap-1.5 text-xs font-black">
                    <FileCheck size={14} className="text-emerald-500" /> Original RC Available
                  </span>
                </label>
              </div>
            </div>

            {/* Mobile Apply Button */}
            {mobileFilterOpen && (
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="mt-4 w-full rounded-xl bg-[var(--color-brand-green)] py-3 font-black text-white shadow-lg"
              >
                Apply Filters ({activeFiltersCount})
              </button>
            )}
          </div>
        </aside>

        {/* ---------------------------------------------------- */}
        {/* RIGHT COLUMN: LISTINGS & CONTROL BAR */}
        {/* ---------------------------------------------------- */}
        <main className="flex min-w-0 flex-1 flex-col gap-6">
          {/* Top Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--card-bg)] p-4 shadow-[var(--card-shadow)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="bg-foreground/5 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold lg:hidden"
              >
                <Filter size={16} /> Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </button>

              <div className="text-muted text-xs font-black tracking-wider uppercase">
                Showing{' '}
                <span className="text-foreground text-sm font-black">{tractors.length}</span>{' '}
                Tractors
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                <ArrowUpDown size={14} className="text-muted hidden sm:block" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-background text-foreground rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]"
                >
                  <option value="recent">Sort: Recently Added</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="hours_low">Hours: Low to High</option>
                  <option value="year_new">Year: Newest First</option>
                  <option value="quality_high">Quality Score: Highest</option>
                </select>
              </div>

              {/* View Layout Toggle */}
              <div className="bg-background flex rounded-xl border border-[var(--border-subtle)] p-1 shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`rounded-lg p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-[var(--color-brand-green)] text-white' : 'text-muted hover:text-foreground'}`}
                  title="Grid View"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`rounded-lg p-1.5 transition-colors ${viewMode === 'list' ? 'bg-[var(--color-brand-green)] text-white' : 'text-muted hover:text-foreground'}`}
                  title="List View"
                >
                  <LayoutList size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* ACTIVE FILTER BADGES ROW */}
          {activeFiltersCount > 0 && (
            <div className="animate-fade-in flex flex-wrap items-center gap-2">
              <span className="text-muted text-[11px] font-black tracking-wider uppercase">
                Active:
              </span>

              {searchQuery && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-3 py-1 text-xs font-bold text-[var(--color-brand-green)]">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {selectedBrand && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-3 py-1 text-xs font-bold text-[var(--color-brand-green)]">
                  Brand: {selectedBrand}
                  <button onClick={() => setSelectedBrand(null)}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {selectedState && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-3 py-1 text-xs font-bold text-[var(--color-brand-green)]">
                  State: {selectedState}
                  <button onClick={() => setSelectedState('')}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {(priceMin || priceMax) && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-3 py-1 text-xs font-bold text-[var(--color-brand-green)]">
                  Price: ₹{priceMin ? priceMin / 100000 + 'L' : '0'} - ₹
                  {priceMax ? priceMax / 100000 + 'L' : 'Max'}
                  <button
                    onClick={() => {
                      setPriceMin(undefined);
                      setPriceMax(undefined);
                    }}
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {conditionGrade && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-3 py-1 text-xs font-bold text-[var(--color-brand-green)]">
                  Grade: {conditionGrade}
                  <button onClick={() => setConditionGrade('')}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {isCertified && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-3 py-1 text-xs font-bold text-[var(--color-brand-green)]">
                  Certified Only
                  <button onClick={() => setIsCertified(false)}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {financeAvailable && (
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600">
                  Finance Available
                  <button onClick={() => setFinanceAvailable(false)}>
                    <X size={12} />
                  </button>
                </span>
              )}

              <button
                onClick={handleClearAllFilters}
                className="ml-auto text-xs font-bold text-red-500 underline"
              >
                Clear All
              </button>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* LISTINGS CONTAINER */}
          {/* ---------------------------------------------------- */}
          {loading ? (
            <div className="flex w-full justify-center py-28">
              <TractorLoader size={48} className="text-[var(--color-brand-green)]" />
            </div>
          ) : paginatedTractors.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-[var(--border-subtle)] bg-[var(--card-bg)] p-12 text-center shadow-[var(--card-shadow)] backdrop-blur-3xl">
              <Search size={56} className="text-muted mb-4 opacity-40" />
              <h3 className="text-foreground mb-2 text-2xl font-black">
                No Matching Used Tractors
              </h3>
              <p className="text-muted mb-6 max-w-md text-sm font-bold">
                We couldn't find any tractors matching your exact filter criteria. Try adjusting or
                clearing your filters.
              </p>
              <button
                onClick={handleClearAllFilters}
                className="rounded-xl bg-[var(--color-brand-green)] px-6 py-3 font-black text-white shadow-md transition-transform hover:-translate-y-0.5 hover:bg-[var(--color-brand-green)]/90"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* ---------------- GRID VIEW ---------------- */
            <div className="animate-fade-in grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {paginatedTractors.map((tractor) => {
                const imgUrl = getListingImageUrl(tractor);
                return (
                  <div
                    key={tractor.id}
                    className="group relative flex flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--card-bg)] shadow-[var(--card-shadow)] backdrop-blur-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--color-brand-green)]/10 hover:shadow-xl"
                  >
                    {/* Badge Overlay */}
                    <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5">
                      {tractor.isCertified && (
                        <span className="flex items-center gap-1 rounded-lg bg-[var(--color-brand-green)] px-2.5 py-1 text-[10px] font-black tracking-wider text-white uppercase shadow-md">
                          <ShieldCheck size={12} /> Certified
                        </span>
                      )}
                      {tractor.financeAvailable && (
                        <span className="rounded-lg bg-blue-600 px-2.5 py-1 text-[10px] font-black tracking-wider text-white uppercase shadow-md">
                          Finance
                        </span>
                      )}
                    </div>

                    {/* Quick View Floating Button */}
                    <button
                      onClick={() => handleOpenQuickView(tractor.id)}
                      className="bg-background/80 text-foreground hover:bg-background absolute top-3 right-3 z-10 rounded-full p-2 opacity-0 shadow-md backdrop-blur-md transition-all group-hover:opacity-100 hover:text-[var(--color-brand-green)]"
                      title="Quick Preview API"
                    >
                      <Eye size={16} />
                    </button>

                    {/* Tractor Image */}
                    <div className="bg-foreground/5 relative h-52 w-full overflow-hidden">
                      <img
                        src={imgUrl}
                        alt={`${tractor.tractorBrand} ${tractor.tractorModel}`}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute bottom-3 left-3">
                        <span className="bg-background/90 text-foreground rounded-md border border-[var(--border-subtle)] px-2.5 py-0.5 text-[11px] font-black shadow-sm backdrop-blur-md">
                          {tractor.viewsCount || 0} Views
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="flex flex-1 flex-col justify-between gap-4 p-5">
                      <div>
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div>
                            <h2 className="text-foreground line-clamp-1 text-xl font-black transition-colors group-hover:text-[var(--color-brand-green)]">
                              {tractor.tractorBrand} {tractor.tractorModel}
                            </h2>
                            <div className="text-muted mt-1 flex items-center gap-1.5 text-xs font-bold">
                              <MapPin
                                size={13}
                                className="shrink-0 text-[var(--color-brand-green)]"
                              />
                              <span className="truncate">
                                {tractor.villageCity ? `${tractor.villageCity}, ` : ''}
                                {tractor.district}, {tractor.state}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="my-3 flex items-baseline justify-between">
                          <span className="text-2xl font-black text-[var(--color-brand-green)]">
                            {formatPrice(tractor.askingPrice)}
                          </span>
                          {tractor.negotiable && (
                            <span className="text-muted bg-foreground/5 rounded px-2 py-0.5 text-[10px] font-black tracking-wider uppercase">
                              Negotiable
                            </span>
                          )}
                        </div>

                        {/* Quick Spec Pills Grid */}
                        <div className="bg-foreground/5 mb-2 grid grid-cols-3 gap-2 rounded-2xl p-3 text-center">
                          <div>
                            <div className="text-muted text-[9px] font-black tracking-wider uppercase">
                              Year
                            </div>
                            <div className="text-foreground text-xs font-black">
                              {tractor.yearOfManufacture}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted text-[9px] font-black tracking-wider uppercase">
                              Hours
                            </div>
                            <div className="text-foreground text-xs font-black">
                              {tractor.hoursUsed ? `${tractor.hoursUsed} hrs` : 'N/A'}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted text-[9px] font-black tracking-wider uppercase">
                              Owner
                            </div>
                            <div className="text-foreground text-xs font-black">
                              {tractor.ownership}
                              {tractor.ownership === 1
                                ? 'st'
                                : tractor.ownership === 2
                                  ? 'nd'
                                  : 'rd'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="flex items-center gap-2 border-t border-[var(--border-subtle)] pt-2">
                        <button
                          onClick={() => {
                            setEnquiryModalOpen(tractor);
                            setEnquirySuccess(false);
                          }}
                          className="bg-background flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--color-brand-green)] px-3 py-2.5 text-xs font-black text-[var(--color-brand-green)] transition-colors hover:bg-[var(--color-brand-green)]/10"
                        >
                          <MessageCircle size={14} /> Contact
                        </button>

                        <Link
                          href={`/used-tractors/details/${tractor.id}`}
                          className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-[var(--color-brand-green)] px-3 py-2.5 text-xs font-black text-white shadow-[var(--color-brand-green)]/20 shadow-md transition-all hover:bg-[var(--color-brand-green)]/90"
                        >
                          Details <ChevronRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ---------------- LIST VIEW ---------------- */
            <div className="animate-fade-in flex flex-col gap-4">
              {paginatedTractors.map((tractor) => {
                const imgUrl = getListingImageUrl(tractor);
                return (
                  <div
                    key={tractor.id}
                    className="group relative flex flex-col gap-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--card-bg)] p-5 shadow-[var(--card-shadow)] backdrop-blur-3xl transition-all hover:-translate-y-0.5 hover:shadow-xl md:flex-row"
                  >
                    {/* Image */}
                    <div className="bg-foreground/5 relative h-48 w-full shrink-0 overflow-hidden rounded-2xl md:h-auto md:w-64">
                      <img
                        src={imgUrl}
                        alt={`${tractor.tractorBrand} ${tractor.tractorModel}`}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {tractor.isCertified && (
                        <div className="absolute top-2 left-2 rounded bg-[var(--color-brand-green)] px-2 py-0.5 text-[10px] font-black tracking-wider text-white uppercase shadow">
                          Certified
                        </div>
                      )}
                    </div>

                    {/* Information */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h2 className="text-foreground text-2xl font-black transition-colors group-hover:text-[var(--color-brand-green)]">
                              {tractor.tractorBrand} {tractor.tractorModel}
                            </h2>
                            <div className="text-muted mt-1 flex items-center gap-1.5 text-xs font-bold">
                              <MapPin size={14} className="text-[var(--color-brand-green)]" />
                              {tractor.villageCity ? `${tractor.villageCity}, ` : ''}
                              {tractor.district}, {tractor.state}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-black text-[var(--color-brand-green)]">
                              {formatPrice(tractor.askingPrice)}
                            </div>
                            {tractor.negotiable && (
                              <div className="text-muted text-[10px] font-bold uppercase">
                                Negotiable
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Details pill bar */}
                        <div className="my-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                          <div className="bg-foreground/5 rounded-xl p-2 text-center">
                            <span className="text-muted block text-[10px] font-black uppercase">
                              Year
                            </span>
                            <span className="text-xs font-black">{tractor.yearOfManufacture}</span>
                          </div>
                          <div className="bg-foreground/5 rounded-xl p-2 text-center">
                            <span className="text-muted block text-[10px] font-black uppercase">
                              Hours
                            </span>
                            <span className="text-xs font-black">
                              {tractor.hoursUsed ? `${tractor.hoursUsed} hrs` : 'N/A'}
                            </span>
                          </div>
                          <div className="bg-foreground/5 rounded-xl p-2 text-center">
                            <span className="text-muted block text-[10px] font-black uppercase">
                              Owner
                            </span>
                            <span className="text-xs font-black">
                              {tractor.ownership}
                              {tractor.ownership === 1 ? 'st' : 'nd'}
                            </span>
                          </div>
                          <div className="bg-foreground/5 rounded-xl p-2 text-center">
                            <span className="text-muted block text-[10px] font-black uppercase">
                              Condition
                            </span>
                            <span className="text-xs font-black capitalize">
                              {(tractor.conditionGrade || 'GOOD').toLowerCase()}
                            </span>
                          </div>
                          <div className="bg-foreground/5 rounded-xl p-2 text-center">
                            <span className="text-muted block text-[10px] font-black uppercase">
                              Engine
                            </span>
                            <span className="text-xs font-black text-[var(--color-brand-green)]">
                              {tractor.engineConditionPct
                                ? `${tractor.engineConditionPct}%`
                                : 'Good'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-3">
                        <div className="text-muted flex flex-wrap gap-2 text-xs font-bold">
                          {tractor.rcAvailable && (
                            <span className="bg-foreground/5 rounded border border-[var(--border-subtle)] px-2 py-0.5">
                              RC Available
                            </span>
                          )}
                          {tractor.loanClearanceStatus === 'CLEAR' && (
                            <span className="bg-foreground/5 rounded border border-[var(--border-subtle)] px-2 py-0.5">
                              Loan Cleared
                            </span>
                          )}
                          {tractor.financeAvailable && (
                            <span className="rounded border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-blue-600">
                              Finance Available
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenQuickView(tractor.id)}
                            className="bg-foreground/5 hover:bg-foreground/10 text-foreground flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-black transition-colors"
                          >
                            <Eye size={14} /> Quick View
                          </button>

                          <button
                            onClick={() => {
                              setEnquiryModalOpen(tractor);
                              setEnquirySuccess(false);
                            }}
                            className="bg-background flex items-center gap-1 rounded-xl border border-[var(--color-brand-green)] px-4 py-2 text-xs font-black text-[var(--color-brand-green)] transition-colors hover:bg-[var(--color-brand-green)]/10"
                          >
                            <MessageCircle size={14} /> Contact
                          </button>

                          <Link
                            href={`/used-tractors/details/${tractor.id}`}
                            className="flex items-center gap-1 rounded-xl bg-[var(--color-brand-green)] px-4 py-2 text-xs font-black text-white shadow-md transition-all hover:bg-[var(--color-brand-green)]/90"
                          >
                            Details <ChevronRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* PAGINATION COMPONENT */}
          {/* ---------------------------------------------------- */}
          {!loading && tractors.length > 0 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                page={page}
                limit={limit}
                totalCount={totalCount}
                totalPages={Math.ceil(totalCount / limit)}
                onPageChange={setPage}
                onLimitChange={(l) => {
                  setLimit(l);
                  setPage(1);
                }}
              />
            </div>
          )}
        </main>
      </div>

      {/* ---------------------------------------------------- */}
      {/* QUICK VIEW INSPECTION MODAL (using getUsedTractorListingById API) */}
      {/* ---------------------------------------------------- */}
      {quickViewModalId !== null && (
        <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="bg-background/80 absolute inset-0 backdrop-blur-xl"
            onClick={() => setQuickViewModalId(null)}
          />

          <div className="bg-background custom-scrollbar animate-slide-up relative max-h-[90vh] w-full max-w-2xl overflow-hidden overflow-y-auto rounded-3xl border border-[var(--border-subtle)] p-6 shadow-2xl sm:p-8">
            <button
              onClick={() => setQuickViewModalId(null)}
              className="bg-foreground/5 hover:bg-foreground/10 absolute top-5 right-5 z-10 rounded-full p-2 transition-colors"
            >
              <X size={18} />
            </button>

            {quickViewLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <TractorLoader size={48} className="mb-4 text-[var(--color-brand-green)]" />
                <p className="text-muted text-sm font-bold">Fetching inspection data from API...</p>
              </div>
            ) : quickViewDetails ? (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
                  <div>
                    <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-green)]/10 px-3 py-1 text-xs font-black text-[var(--color-brand-green)]">
                      <ShieldCheck size={14} /> API Verified Inspection Data
                    </div>
                    <h3 className="text-foreground text-2xl font-black">
                      {quickViewDetails.tractorBrand} {quickViewDetails.tractorModel}
                    </h3>
                    <p className="text-muted mt-1 flex items-center gap-1 text-xs font-bold">
                      <MapPin size={13} className="text-[var(--color-brand-green)]" />
                      {quickViewDetails.villageCity ? `${quickViewDetails.villageCity}, ` : ''}
                      {quickViewDetails.district}, {quickViewDetails.state}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-black text-[var(--color-brand-green)]">
                      {formatPrice(quickViewDetails.askingPrice)}
                    </div>
                    {quickViewDetails.negotiable && (
                      <span className="text-muted bg-foreground/5 rounded px-2 py-0.5 text-[10px] font-black uppercase">
                        Negotiable
                      </span>
                    )}
                  </div>
                </div>

                {/* Inspection Components Grid */}
                <div>
                  <h4 className="text-muted mb-3 flex items-center gap-1.5 text-xs font-black tracking-widest uppercase">
                    <Sparkles size={14} className="text-[var(--color-brand-green)]" /> Inspection
                    Scorecard & Component Status
                  </h4>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="bg-foreground/5 rounded-2xl border border-[var(--border-subtle)] p-3">
                      <div className="text-muted text-[10px] font-black uppercase">
                        Engine Condition
                      </div>
                      <div className="mt-0.5 text-base font-black text-[var(--color-brand-green)]">
                        {quickViewDetails.engineConditionPct
                          ? `${quickViewDetails.engineConditionPct}% Rating`
                          : '90% Tested'}
                      </div>
                    </div>

                    <div className="bg-foreground/5 rounded-2xl border border-[var(--border-subtle)] p-3">
                      <div className="text-muted text-[10px] font-black uppercase">
                        Tyre Condition
                      </div>
                      <div className="text-foreground mt-0.5 text-base font-black capitalize">
                        {(quickViewDetails.tyreCondition || 'GOOD').toLowerCase()}
                      </div>
                    </div>

                    <div className="bg-foreground/5 rounded-2xl border border-[var(--border-subtle)] p-3">
                      <div className="text-muted text-[10px] font-black uppercase">
                        Body & Paint
                      </div>
                      <div className="text-foreground mt-0.5 text-base font-black capitalize">
                        {(quickViewDetails.bodyCondition || 'GOOD').toLowerCase()}
                      </div>
                    </div>

                    <div className="bg-foreground/5 rounded-2xl border border-[var(--border-subtle)] p-3">
                      <div className="text-muted text-[10px] font-black uppercase">Hydraulics</div>
                      <div className="text-foreground mt-0.5 text-base font-black capitalize">
                        {(quickViewDetails.hydraulicsCondition || 'GOOD').toLowerCase()}
                      </div>
                    </div>

                    <div className="bg-foreground/5 rounded-2xl border border-[var(--border-subtle)] p-3">
                      <div className="text-muted text-[10px] font-black uppercase">
                        Clutch Condition
                      </div>
                      <div className="text-foreground mt-0.5 text-base font-black capitalize">
                        {(quickViewDetails.clutchCondition || 'GOOD').toLowerCase()}
                      </div>
                    </div>

                    <div className="bg-foreground/5 rounded-2xl border border-[var(--border-subtle)] p-3">
                      <div className="text-muted text-[10px] font-black uppercase">RC Status</div>
                      <div className="mt-0.5 flex items-center gap-1 text-base font-black text-emerald-600">
                        <CheckCircle2 size={14} />{' '}
                        {quickViewDetails.rcAvailable ? 'Verified RC' : 'In Process'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {quickViewDetails.description && (
                  <div>
                    <h4 className="text-muted mb-1.5 text-xs font-black tracking-widest uppercase">
                      Seller Notes
                    </h4>
                    <p className="text-foreground bg-foreground/5 rounded-2xl p-3 text-xs leading-relaxed font-bold">
                      {quickViewDetails.description}
                    </p>
                  </div>
                )}

                {/* Seller & Action Footer */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border-subtle)] pt-4">
                  <div className="text-muted text-xs font-bold">
                    ID: #{quickViewDetails.id} • Views: {quickViewDetails.viewsCount || 0}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setQuickViewModalId(null);
                        setEnquiryModalOpen(quickViewDetails);
                        setEnquirySuccess(false);
                      }}
                      className="bg-background flex items-center gap-1.5 rounded-xl border border-[var(--color-brand-green)] px-5 py-2.5 text-xs font-black text-[var(--color-brand-green)] transition-colors hover:bg-[var(--color-brand-green)]/10"
                    >
                      <MessageCircle size={15} /> Contact Seller
                    </button>

                    <Link
                      href={`/used-tractors/details/${quickViewDetails.id}`}
                      className="flex items-center gap-1 rounded-xl bg-[var(--color-brand-green)] px-6 py-2.5 text-xs font-black text-white shadow-md transition-all hover:bg-[var(--color-brand-green)]/90"
                    >
                      Full Details <ChevronRight size={15} />
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-muted py-12 text-center">Failed to load detail preview.</div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SELLER ENQUIRY LEAD MODAL (using createEnquiry API) */}
      {/* ---------------------------------------------------- */}
      {enquiryModalOpen && (
        <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="bg-background/80 absolute inset-0 backdrop-blur-xl"
            onClick={() => setEnquiryModalOpen(null)}
          />

          <div className="bg-background animate-slide-up relative w-full max-w-lg overflow-hidden rounded-3xl border border-[var(--border-subtle)] p-6 shadow-2xl sm:p-8">
            <button
              onClick={() => setEnquiryModalOpen(null)}
              className="bg-foreground/5 hover:bg-foreground/10 absolute top-5 right-5 z-10 rounded-full p-2 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="mb-6 pr-10">
              <h3 className="text-foreground mb-1 text-2xl font-black">Contact Seller</h3>
              <p className="text-muted text-xs font-bold">
                Inquiring about{' '}
                <span className="font-black text-[var(--color-brand-green)]">
                  {enquiryModalOpen.tractorBrand} {enquiryModalOpen.tractorModel}
                </span>
              </p>
            </div>

            {enquirySuccess ? (
              <div className="animate-fade-in flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
                  <CheckCircle2 size={36} />
                </div>
                <h4 className="text-foreground mb-2 text-xl font-black">
                  Enquiry Sent Successfully!
                </h4>
                <p className="text-muted mb-6 max-w-xs text-xs font-bold">
                  The seller will receive your message and contact details directly.
                </p>
                <button
                  onClick={() => setEnquiryModalOpen(null)}
                  className="rounded-xl bg-[var(--color-brand-green)] px-6 py-2.5 text-xs font-black text-white shadow-md"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="space-y-4">
                {enquiryError && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-bold text-red-600">
                    <AlertCircle size={16} /> {enquiryError}
                  </div>
                )}

                <div>
                  <label className="text-muted mb-1 block text-[10px] font-black tracking-widest uppercase">
                    Full Name *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Enter your name"
                    value={enquiryForm.name}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                    className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]"
                  />
                </div>

                <div>
                  <label className="text-muted mb-1 block text-[10px] font-black tracking-widest uppercase">
                    Mobile Number *
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={enquiryForm.mobile}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, mobile: e.target.value })}
                    className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]"
                  />
                </div>

                <div>
                  <label className="text-muted mb-1 block text-[10px] font-black tracking-widest uppercase">
                    Your Price Offer (INR Optional)
                  </label>
                  <input
                    type="number"
                    placeholder={`Asking price: ₹${enquiryModalOpen.askingPrice}`}
                    value={enquiryForm.offerPrice}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, offerPrice: e.target.value })}
                    className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]"
                  />
                </div>

                <div>
                  <label className="text-muted mb-1 block text-[10px] font-black tracking-widest uppercase">
                    Message / Note
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Hi, I am interested in viewing this tractor..."
                    value={enquiryForm.message}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                    className="bg-foreground/5 text-foreground w-full resize-none rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingEnquiry}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-green)] py-3.5 text-xs font-black text-white shadow-[var(--color-brand-green)]/20 shadow-lg transition-all hover:bg-[var(--color-brand-green)]/90 disabled:opacity-50"
                >
                  {submittingEnquiry ? (
                    <TractorLoader size={18} className="text-white" />
                  ) : (
                    <>
                      <MessageCircle size={16} /> Send Direct Enquiry
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
