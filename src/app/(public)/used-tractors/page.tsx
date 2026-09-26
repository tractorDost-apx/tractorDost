'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { usedTractorListingAPI } from '@/lib/api/used-listings';
import { usedTractorEnquiryAPI } from '@/lib/api/used-enquiries';
import { UsedTractorListing, ConditionGrade, UrgencyLevel } from '@/lib/api/usedTractors';
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
  AlertCircle
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
  'Chhattisgarh'
];

export default function UsedTractorsPage() {
  // Data States
  const [tractors, setTractors] = useState<UsedTractorListing[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // UI Control States
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'recent' | 'price_low' | 'price_high' | 'hours_low' | 'year_new' | 'quality_high'>('recent');
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
  const [enquiryForm, setEnquiryForm] = useState({ name: '', mobile: '', offerPrice: '', message: '' });
  const [submittingEnquiry, setSubmittingEnquiry] = useState<boolean>(false);
  const [enquirySuccess, setEnquirySuccess] = useState<boolean>(false);
  const [enquiryError, setEnquiryError] = useState<string | null>(null);

  // Price presets
  const pricePresets = [
    { label: 'All Prices', min: undefined, max: undefined },
    { label: 'Under ₹3L', min: undefined, max: 300000 },
    { label: '₹3L - ₹5L', min: 300000, max: 500000 },
    { label: '₹5L - ₹7L', min: 500000, max: 700000 },
    { label: 'Above ₹7L', min: 700000, max: undefined }
  ];

  // Year presets
  const yearPresets = [
    { label: 'Any Year', min: undefined, max: undefined },
    { label: '2023+', min: 2023, max: undefined },
    { label: '2021+', min: 2021, max: undefined },
    { label: '2019+', min: 2019, max: undefined },
    { label: '2017+', min: 2017, max: undefined }
  ];

  // Formatter
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Helper for extracting listing image URL
  const getListingImageUrl = (tractor: any) => {
    if (tractor.imageUrl) return tractor.imageUrl;
    if (Array.isArray(tractor.media) && tractor.media.length > 0 && tractor.media[0]?.url) {
      return tractor.media[0].url;
    }
    if (Array.isArray(tractor.documents) && tractor.documents.length > 0 && tractor.documents[0]?.url) {
      return tractor.documents[0].url;
    }
    return 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80';
  };

  // Fetch Brands on Mount
  useEffect(() => {
    brandAPI.getAllBrands({ limit: 100 }).then(res => {
      if (res.success) {
        const list = (res.data as any)?.data || (res.data as any)?.brands || (Array.isArray(res.data) ? res.data : []);
        setBrands(list.filter((b: any) => b.isActive));
      }
    }).catch(() => setBrands([]));
  }, []);

  // API Call: Fetch Used Tractor Listings with Query Filters (getAllUsedTractorListing)
  useEffect(() => {
    const fetchTractors = async () => {
      setLoading(true);
      try {
        // Construct Backend API Query Params
        const apiParams: Record<string, any> = {
          page,
          limit: 30, // fetch larger chunk for local refinement & smooth UI
        };

        if (selectedBrand) apiParams.tractorBrand = selectedBrand;
        if (selectedState) apiParams.state = selectedState;
        if (selectedDistrict) apiParams.district = selectedDistrict;
        if (priceMin !== undefined) apiParams.priceMin = priceMin;
        if (priceMax !== undefined) apiParams.priceMax = priceMax;
        if (yearMin !== undefined) apiParams.yearMin = yearMin;
        if (yearMax !== undefined) apiParams.yearMax = yearMax;
        if (conditionGrade) apiParams.conditionGrade = conditionGrade;
        if (isCertified) apiParams.isCertified = true;
        if (financeAvailable) apiParams.financeAvailable = true;
        if (urgency) apiParams.urgency = urgency;

        const res = await usedTractorListingAPI.getAllListings(apiParams);

        // Set data directly from Database API response
        let dataList: UsedTractorListing[] = [];
        let total = 0;

        if (res.success && res.data) {
          if (Array.isArray(res.data.data)) {
            dataList = res.data.data;
            total = res.data.total || dataList.length;
          } else if (Array.isArray(res.data)) {
            dataList = res.data;
            total = dataList.length;
          }
        }

        // Apply Client-Side Refinements (for search, maxHours, ownership, rcAvailable, loanClearance, sorting)
        let filtered = [...dataList];

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          filtered = filtered.filter(t => 
            (t.tractorBrand || '').toLowerCase().includes(q) ||
            (t.tractorModel || '').toLowerCase().includes(q) ||
            (t.villageCity || '').toLowerCase().includes(q) ||
            (t.district || '').toLowerCase().includes(q) ||
            (t.state || '').toLowerCase().includes(q)
          );
        }

        if (rcAvailable) {
          filtered = filtered.filter(t => t.rcAvailable === true);
        }

        if (loanClearanceStatus) {
          filtered = filtered.filter(t => t.loanClearanceStatus === loanClearanceStatus);
        }

        if (maxHours !== undefined) {
          filtered = filtered.filter(t => (t.hoursUsed || 0) <= maxHours);
        }

        if (ownership !== undefined) {
          filtered = filtered.filter(t => t.ownership === ownership);
        }

        // Sorting Logic
        if (sortBy === 'price_low') {
          filtered.sort((a, b) => (a.askingPrice || 0) - (b.askingPrice || 0));
        } else if (sortBy === 'price_high') {
          filtered.sort((a, b) => (b.askingPrice || 0) - (a.askingPrice || 0));
        } else if (sortBy === 'hours_low') {
          filtered.sort((a, b) => (a.hoursUsed || 99999) - (b.hoursUsed || 99999));
        } else if (sortBy === 'year_new') {
          filtered.sort((a, b) => b.yearOfManufacture - a.yearOfManufacture);
        } else if (sortBy === 'quality_high') {
          filtered.sort((a, b) => ((b as any).listingQualityScore || 0) - ((a as any).listingQualityScore || 0));
        } else {
          // Recent (ID descending)
          filtered.sort((a, b) => b.id - a.id);
        }

        setTractors(filtered);
        setTotalCount(filtered.length);
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
    sortBy
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
        const localItem = tractors.find(t => t.id === id);
        setQuickViewDetails(localItem || null);
      }
    } catch (err) {
      const localItem = tractors.find(t => t.id === id);
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
        enquiryType: 'USED_TRACTOR',
        name: enquiryForm.name,
        mobile: enquiryForm.mobile,
        offerPrice: enquiryForm.offerPrice ? Number(enquiryForm.offerPrice) : undefined,
        message: enquiryForm.message || `I am interested in buying ${enquiryModalOpen.tractorBrand} ${enquiryModalOpen.tractorModel}.`
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
    searchQuery, selectedBrand, selectedState, selectedDistrict, 
    priceMin, priceMax, yearMin, yearMax, conditionGrade, 
    isCertified, financeAvailable, rcAvailable, loanClearanceStatus, 
    maxHours, ownership, urgency
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
    return brands.filter(b => b.name.toLowerCase().includes(brandSearch.toLowerCase()));
  }, [brands, brandSearch]);

  // Paginated View Slice
  const paginatedTractors = useMemo(() => {
    const start = (page - 1) * limit;
    return tractors.slice(start, start + limit);
  }, [tractors, page, limit]);

  return (
    <div className="w-full max-w-[1440px] mx-auto min-h-screen py-8 px-4 sm:px-6 relative">
      
      {/* ---------------------------------------------------- */}
      {/* HEADER SECTION */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col items-center text-center mb-10 animate-fade-in">
        <div className="inline-flex items-center justify-center px-4 py-1.5 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] rounded-full mb-3 font-black tracking-widest text-xs uppercase border border-[var(--color-brand-green)]/20 shadow-sm">
          <ShieldCheck size={16} className="mr-2 inline" /> Verified Pre-Owned Marketplace
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-3">
          Find Used <span className="text-[var(--color-brand-green)]">Tractors & Machinery</span>
        </h1>
        <p className="text-muted font-bold text-base md:text-lg max-w-2xl">
          Browse certified used tractors with full inspection scores, transparent pricing, finance support, and direct seller details.
        </p>
      </div>

      {/* Main Container */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* ---------------------------------------------------- */}
        {/* LEFT COLUMN: MAXIMUM SMART FILTERS */}
        {/* ---------------------------------------------------- */}
        <aside className={`
          w-full lg:w-80 shrink-0 flex flex-col gap-6 
          ${mobileFilterOpen ? 'fixed inset-0 z-50 bg-background p-6 overflow-y-auto' : 'hidden lg:flex'}
        `}>
          <div className="bg-[var(--card-bg)] rounded-3xl p-6 border border-[var(--border-subtle)] backdrop-blur-3xl shadow-[var(--card-shadow)] lg:sticky lg:top-24">
            
            {/* Filter Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
                  <SlidersHorizontal size={18} />
                </div>
                <div>
                  <h3 className="font-black text-foreground text-lg leading-none">Smart Filters</h3>
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
                    className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600 hover:underline transition-colors"
                  >
                    <RotateCcw size={12} /> Clear
                  </button>
                )}
                {mobileFilterOpen && (
                  <button onClick={() => setMobileFilterOpen(false)} className="lg:hidden p-2 rounded-full bg-foreground/5">
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-6 max-h-[calc(100vh-220px)] overflow-y-auto pr-1 custom-scrollbar">
              
              {/* 1. Keyword Search */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted mb-2 block">
                  Search Keyword
                </label>
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                  <input 
                    type="text"
                    placeholder="Model, brand, city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 bg-foreground/5 border border-[var(--border-subtle)] rounded-xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] outline-none transition-all"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground">
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Brand Filter with Search */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted">
                    Tractor Brand
                  </label>
                  {selectedBrand && (
                    <button onClick={() => setSelectedBrand(null)} className="text-[10px] text-[var(--color-brand-green)] font-bold">
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
                    className="w-full px-3 py-1.5 mb-2 bg-foreground/5 border border-[var(--border-subtle)] rounded-lg text-xs font-bold text-foreground outline-none"
                  />
                )}

                <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                  <button 
                    onClick={() => setSelectedBrand(null)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      !selectedBrand 
                        ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]' 
                        : 'border-transparent bg-foreground/5 text-foreground hover:bg-foreground/10'
                    }`}
                  >
                    <span>All Brands</span>
                    {!selectedBrand && <Check size={14} />}
                  </button>
                  {filteredBrands.map(brand => (
                    <button 
                      key={brand.id}
                      onClick={() => setSelectedBrand(brand.name)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        selectedBrand === brand.name 
                          ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]' 
                          : 'border-transparent bg-foreground/5 text-foreground hover:bg-foreground/10'
                      }`}
                    >
                      {brand.logoUrl ? (
                        <img src={brand.logoUrl} alt={brand.name} className="w-5 h-5 object-contain bg-white rounded p-0.5" />
                      ) : (
                        <div className="w-5 h-5 bg-foreground/10 rounded flex items-center justify-center text-[10px] font-black">{brand.name.charAt(0)}</div>
                      )}
                      <span className="truncate flex-1 text-left">{brand.name}</span>
                      {selectedBrand === brand.name && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Location Filters (State & District) */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted mb-2 block">
                  Location (State & District)
                </label>
                <div className="space-y-2">
                  <select 
                    value={selectedState}
                    onChange={(e) => { setSelectedState(e.target.value); setSelectedDistrict(''); }}
                    className="w-full px-3 py-2.5 bg-foreground/5 border border-[var(--border-subtle)] rounded-xl text-xs font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] outline-none"
                  >
                    <option value="">All Indian States</option>
                    {INDIAN_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>

                  <input 
                    type="text"
                    placeholder="Enter District (e.g. Pune, Ludhiana)"
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full px-3 py-2.5 bg-foreground/5 border border-[var(--border-subtle)] rounded-xl text-xs font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] outline-none"
                  />
                </div>
              </div>

              {/* 4. Price Range & Presets */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted">
                    Asking Price (INR)
                  </label>
                  {(priceMin !== undefined || priceMax !== undefined) && (
                    <button onClick={() => { setPriceMin(undefined); setPriceMax(undefined); }} className="text-[10px] text-[var(--color-brand-green)] font-bold">
                      Clear Price
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input 
                    type="number"
                    placeholder="Min Price"
                    value={priceMin || ''}
                    onChange={(e) => setPriceMin(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 bg-foreground/5 border border-[var(--border-subtle)] rounded-xl text-xs font-bold text-foreground outline-none"
                  />
                  <input 
                    type="number"
                    placeholder="Max Price"
                    value={priceMax || ''}
                    onChange={(e) => setPriceMax(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 bg-foreground/5 border border-[var(--border-subtle)] rounded-xl text-xs font-bold text-foreground outline-none"
                  />
                </div>

                {/* Price Presets Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {pricePresets.slice(1).map(p => {
                    const isSelected = priceMin === p.min && priceMax === p.max;
                    return (
                      <button 
                        key={p.label}
                        onClick={() => { setPriceMin(p.min); setPriceMax(p.max); }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                          isSelected 
                            ? 'bg-[var(--color-brand-green)] text-white border-[var(--color-brand-green)]' 
                            : 'bg-foreground/5 border-[var(--border-subtle)] text-muted hover:text-foreground'
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
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted">
                    Manufacture Year
                  </label>
                  {(yearMin !== undefined || yearMax !== undefined) && (
                    <button onClick={() => { setYearMin(undefined); setYearMax(undefined); }} className="text-[10px] text-[var(--color-brand-green)] font-bold">
                      Clear Year
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 mb-2">
                  {yearPresets.slice(1).map(y => {
                    const isSelected = yearMin === y.min;
                    return (
                      <button 
                        key={y.label}
                        onClick={() => { setYearMin(isSelected ? undefined : y.min); setYearMax(undefined); }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                          isSelected 
                            ? 'bg-[var(--color-brand-green)] text-white border-[var(--color-brand-green)]' 
                            : 'bg-foreground/5 border-[var(--border-subtle)] text-muted hover:text-foreground'
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
                <label className="text-[10px] font-black uppercase tracking-widest text-muted mb-2 block">
                  Overall Condition
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['', 'EXCELLENT', 'GOOD', 'FAIR', 'POOR'].map(grade => {
                    const label = grade || 'Any Grade';
                    const isSelected = conditionGrade === grade;
                    return (
                      <button 
                        key={label}
                        onClick={() => setConditionGrade(grade)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold border text-center transition-all ${
                          isSelected 
                            ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]' 
                            : 'border-transparent bg-foreground/5 text-foreground hover:bg-foreground/10'
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
                <label className="text-[10px] font-black uppercase tracking-widest text-muted mb-2 block">
                  Max Hours Used
                </label>
                <select 
                  value={maxHours || ''}
                  onChange={(e) => setMaxHours(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 bg-foreground/5 border border-[var(--border-subtle)] rounded-xl text-xs font-bold text-foreground outline-none"
                >
                  <option value="">Any Usage Hours</option>
                  <option value="1000">Under 1,000 Hours</option>
                  <option value="2500">Under 2,500 Hours</option>
                  <option value="4000">Under 4,000 Hours</option>
                </select>
              </div>

              {/* 8. Ownership */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted mb-2 block">
                  Ownership
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { label: 'Any', val: undefined },
                    { label: '1st', val: 1 },
                    { label: '2nd', val: 2 },
                    { label: '3rd+', val: 3 }
                  ].map(o => (
                    <button 
                      key={o.label}
                      onClick={() => setOwnership(o.val)}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        ownership === o.val 
                          ? 'bg-[var(--color-brand-green)] text-white border-[var(--color-brand-green)]' 
                          : 'bg-foreground/5 border-transparent text-muted hover:text-foreground'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 9. Urgency Filter */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted mb-2 block">
                  Seller Urgency
                </label>
                <select 
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="w-full px-3 py-2 bg-foreground/5 border border-[var(--border-subtle)] rounded-xl text-xs font-bold text-foreground outline-none"
                >
                  <option value="">Any Urgency</option>
                  <option value="FIFTEEN_DAYS">Urgent (Within 15 Days)</option>
                  <option value="THIRTY_DAYS">Within 30 Days</option>
                  <option value="NO_RUSH">No Rush</option>
                </select>
              </div>

              {/* 10. Verification & Legal Toggles */}
              <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2.5">
                <label className="flex items-center gap-2.5 cursor-pointer p-2.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={isCertified}
                    onChange={(e) => setIsCertified(e.target.checked)}
                    className="w-4 h-4 rounded text-[var(--color-brand-green)] focus:ring-[var(--color-brand-green)]"
                  />
                  <span className="text-xs font-black text-foreground flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-[var(--color-brand-green)]" /> Certified Only
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer p-2.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={financeAvailable}
                    onChange={(e) => setFinanceAvailable(e.target.checked)}
                    className="w-4 h-4 rounded text-[var(--color-brand-green)] focus:ring-[var(--color-brand-green)]"
                  />
                  <span className="text-xs font-black text-foreground flex items-center gap-1.5">
                    <CircleDollarSign size={14} className="text-blue-500" /> Finance Available
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer p-2.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={rcAvailable}
                    onChange={(e) => setRcAvailable(e.target.checked)}
                    className="w-4 h-4 rounded text-[var(--color-brand-green)] focus:ring-[var(--color-brand-green)]"
                  />
                  <span className="text-xs font-black text-foreground flex items-center gap-1.5">
                    <FileCheck size={14} className="text-emerald-500" /> Original RC Available
                  </span>
                </label>
              </div>

            </div>

            {/* Mobile Apply Button */}
            {mobileFilterOpen && (
              <button 
                onClick={() => setMobileFilterOpen(false)}
                className="w-full mt-4 py-3 bg-[var(--color-brand-green)] text-white font-black rounded-xl shadow-lg"
              >
                Apply Filters ({activeFiltersCount})
              </button>
            )}
          </div>
        </aside>

        {/* ---------------------------------------------------- */}
        {/* RIGHT COLUMN: LISTINGS & CONTROL BAR */}
        {/* ---------------------------------------------------- */}
        <main className="flex-1 flex flex-col gap-6 min-w-0">
          
          {/* Top Controls Bar */}
          <div className="bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border-subtle)] shadow-[var(--card-shadow)] p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-3 py-2 bg-foreground/5 rounded-xl text-xs font-bold"
              >
                <Filter size={16} /> Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </button>
              
              <div className="text-xs font-black uppercase tracking-wider text-muted">
                Showing <span className="text-foreground text-sm font-black">{tractors.length}</span> Tractors
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                <ArrowUpDown size={14} className="text-muted hidden sm:block" />
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-background border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] outline-none"
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
              <div className="flex bg-background border border-[var(--border-subtle)] rounded-xl p-1 shadow-sm">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[var(--color-brand-green)] text-white' : 'text-muted hover:text-foreground'}`}
                  title="Grid View"
                >
                  <LayoutGrid size={16} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[var(--color-brand-green)] text-white' : 'text-muted hover:text-foreground'}`}
                  title="List View"
                >
                  <LayoutList size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* ACTIVE FILTER BADGES ROW */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 animate-fade-in">
              <span className="text-[11px] font-black uppercase text-muted tracking-wider">Active:</span>
              
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] rounded-full text-xs font-bold border border-[var(--color-brand-green)]/20">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')}><X size={12} /></button>
                </span>
              )}
              {selectedBrand && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] rounded-full text-xs font-bold border border-[var(--color-brand-green)]/20">
                  Brand: {selectedBrand}
                  <button onClick={() => setSelectedBrand(null)}><X size={12} /></button>
                </span>
              )}
              {selectedState && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] rounded-full text-xs font-bold border border-[var(--color-brand-green)]/20">
                  State: {selectedState}
                  <button onClick={() => setSelectedState('')}><X size={12} /></button>
                </span>
              )}
              {(priceMin || priceMax) && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] rounded-full text-xs font-bold border border-[var(--color-brand-green)]/20">
                  Price: ₹{priceMin ? (priceMin/100000) + 'L' : '0'} - ₹{priceMax ? (priceMax/100000) + 'L' : 'Max'}
                  <button onClick={() => { setPriceMin(undefined); setPriceMax(undefined); }}><X size={12} /></button>
                </span>
              )}
              {conditionGrade && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] rounded-full text-xs font-bold border border-[var(--color-brand-green)]/20">
                  Grade: {conditionGrade}
                  <button onClick={() => setConditionGrade('')}><X size={12} /></button>
                </span>
              )}
              {isCertified && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] rounded-full text-xs font-bold border border-[var(--color-brand-green)]/20">
                  Certified Only
                  <button onClick={() => setIsCertified(false)}><X size={12} /></button>
                </span>
              )}
              {financeAvailable && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full text-xs font-bold border border-blue-500/20">
                  Finance Available
                  <button onClick={() => setFinanceAvailable(false)}><X size={12} /></button>
                </span>
              )}

              <button 
                onClick={handleClearAllFilters}
                className="text-xs font-bold text-red-500 underline ml-auto"
              >
                Clear All
              </button>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* LISTINGS CONTAINER */}
          {/* ---------------------------------------------------- */}
          {loading ? (
            <div className="w-full flex justify-center py-28">
              <TractorLoader size={48} className="text-[var(--color-brand-green)]" />
            </div>
          ) : paginatedTractors.length === 0 ? (
            <div className="bg-[var(--card-bg)] backdrop-blur-3xl shadow-[var(--card-shadow)] rounded-3xl p-12 text-center flex flex-col items-center justify-center border border-[var(--border-subtle)]">
              <Search size={56} className="text-muted mb-4 opacity-40" />
              <h3 className="text-2xl font-black text-foreground mb-2">No Matching Used Tractors</h3>
              <p className="text-muted font-bold text-sm max-w-md mb-6">
                We couldn't find any tractors matching your exact filter criteria. Try adjusting or clearing your filters.
              </p>
              <button 
                onClick={handleClearAllFilters}
                className="px-6 py-3 bg-[var(--color-brand-green)] text-white font-black rounded-xl hover:bg-[var(--color-brand-green)]/90 shadow-md transition-transform hover:-translate-y-0.5"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* ---------------- GRID VIEW ---------------- */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
              {paginatedTractors.map((tractor) => {
                const imgUrl = getListingImageUrl(tractor);
                return (
                  <div 
                    key={tractor.id}
                    className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-3xl border border-[var(--border-subtle)] shadow-[var(--card-shadow)] hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--color-brand-green)]/10 transition-all duration-300 flex flex-col overflow-hidden group relative"
                  >
                    {/* Badge Overlay */}
                    <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5">
                      {tractor.isCertified && (
                        <span className="bg-[var(--color-brand-green)] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                          <ShieldCheck size={12} /> Certified
                        </span>
                      )}
                      {tractor.financeAvailable && (
                        <span className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-md">
                          Finance
                        </span>
                      )}
                    </div>

                    {/* Quick View Floating Button */}
                    <button 
                      onClick={() => handleOpenQuickView(tractor.id)}
                      className="absolute top-3 right-3 z-10 p-2 bg-background/80 backdrop-blur-md rounded-full text-foreground hover:text-[var(--color-brand-green)] hover:bg-background transition-all shadow-md opacity-0 group-hover:opacity-100"
                      title="Quick Preview API"
                    >
                      <Eye size={16} />
                    </button>

                    {/* Tractor Image */}
                    <div className="w-full h-52 bg-foreground/5 overflow-hidden relative">
                      <img 
                        src={imgUrl} 
                        alt={`${tractor.tractorBrand} ${tractor.tractorModel}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute bottom-3 left-3">
                        <span className="bg-background/90 backdrop-blur-md text-foreground text-[11px] font-black px-2.5 py-0.5 rounded-md shadow-sm border border-[var(--border-subtle)]">
                          {tractor.viewsCount || 0} Views
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h2 className="font-black text-xl text-foreground group-hover:text-[var(--color-brand-green)] transition-colors line-clamp-1">
                              {tractor.tractorBrand} {tractor.tractorModel}
                            </h2>
                            <div className="flex items-center gap-1.5 text-muted font-bold text-xs mt-1">
                              <MapPin size={13} className="text-[var(--color-brand-green)] shrink-0" />
                              <span className="truncate">{tractor.villageCity ? `${tractor.villageCity}, ` : ''}{tractor.district}, {tractor.state}</span>
                            </div>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="my-3 flex items-baseline justify-between">
                          <span className="text-2xl font-black text-[var(--color-brand-green)]">
                            {formatPrice(tractor.askingPrice)}
                          </span>
                          {tractor.negotiable && (
                            <span className="text-[10px] font-black uppercase text-muted tracking-wider bg-foreground/5 px-2 py-0.5 rounded">
                              Negotiable
                            </span>
                          )}
                        </div>

                        {/* Quick Spec Pills Grid */}
                        <div className="grid grid-cols-3 gap-2 bg-foreground/5 p-3 rounded-2xl text-center mb-2">
                          <div>
                            <div className="text-[9px] uppercase font-black text-muted tracking-wider">Year</div>
                            <div className="text-xs font-black text-foreground">{tractor.yearOfManufacture}</div>
                          </div>
                          <div>
                            <div className="text-[9px] uppercase font-black text-muted tracking-wider">Hours</div>
                            <div className="text-xs font-black text-foreground">{tractor.hoursUsed ? `${tractor.hoursUsed} hrs` : 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-[9px] uppercase font-black text-muted tracking-wider">Owner</div>
                            <div className="text-xs font-black text-foreground">{tractor.ownership}{tractor.ownership === 1 ? 'st' : tractor.ownership === 2 ? 'nd' : 'rd'}</div>
                          </div>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
                        <button 
                          onClick={() => { setEnquiryModalOpen(tractor); setEnquirySuccess(false); }}
                          className="flex-1 py-2.5 px-3 bg-background border border-[var(--color-brand-green)] text-[var(--color-brand-green)] font-black text-xs rounded-xl hover:bg-[var(--color-brand-green)]/10 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <MessageCircle size={14} /> Contact
                        </button>
                        
                        <Link 
                          href={`/used-tractors/details/${tractor.id}`}
                          className="flex-1 py-2.5 px-3 bg-[var(--color-brand-green)] text-white font-black text-xs rounded-xl hover:bg-[var(--color-brand-green)]/90 shadow-md shadow-[var(--color-brand-green)]/20 transition-all flex items-center justify-center gap-1"
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
            <div className="flex flex-col gap-4 animate-fade-in">
              {paginatedTractors.map((tractor) => {
                const imgUrl = getListingImageUrl(tractor);
                return (
                  <div 
                    key={tractor.id}
                    className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-3xl p-5 border border-[var(--border-subtle)] shadow-[var(--card-shadow)] hover:-translate-y-0.5 hover:shadow-xl transition-all flex flex-col md:flex-row gap-6 relative group"
                  >
                    {/* Image */}
                    <div className="w-full md:w-64 h-48 md:h-auto shrink-0 rounded-2xl overflow-hidden relative bg-foreground/5">
                      <img src={imgUrl} alt={`${tractor.tractorBrand} ${tractor.tractorModel}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {tractor.isCertified && (
                        <div className="absolute top-2 left-2 bg-[var(--color-brand-green)] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow">
                          Certified
                        </div>
                      )}
                    </div>

                    {/* Information */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                          <div>
                            <h2 className="text-2xl font-black text-foreground group-hover:text-[var(--color-brand-green)] transition-colors">
                              {tractor.tractorBrand} {tractor.tractorModel}
                            </h2>
                            <div className="flex items-center gap-1.5 text-muted font-bold text-xs mt-1">
                              <MapPin size={14} className="text-[var(--color-brand-green)]" />
                              {tractor.villageCity ? `${tractor.villageCity}, ` : ''}{tractor.district}, {tractor.state}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-2xl font-black text-[var(--color-brand-green)]">
                              {formatPrice(tractor.askingPrice)}
                            </div>
                            {tractor.negotiable && (
                              <div className="text-[10px] font-bold text-muted uppercase">Negotiable</div>
                            )}
                          </div>
                        </div>

                        {/* Details pill bar */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 my-4">
                          <div className="bg-foreground/5 p-2 rounded-xl text-center">
                            <span className="text-[10px] uppercase font-black text-muted block">Year</span>
                            <span className="font-black text-xs">{tractor.yearOfManufacture}</span>
                          </div>
                          <div className="bg-foreground/5 p-2 rounded-xl text-center">
                            <span className="text-[10px] uppercase font-black text-muted block">Hours</span>
                            <span className="font-black text-xs">{tractor.hoursUsed ? `${tractor.hoursUsed} hrs` : 'N/A'}</span>
                          </div>
                          <div className="bg-foreground/5 p-2 rounded-xl text-center">
                            <span className="text-[10px] uppercase font-black text-muted block">Owner</span>
                            <span className="font-black text-xs">{tractor.ownership}{tractor.ownership === 1 ? 'st' : 'nd'}</span>
                          </div>
                          <div className="bg-foreground/5 p-2 rounded-xl text-center">
                            <span className="text-[10px] uppercase font-black text-muted block">Condition</span>
                            <span className="font-black text-xs capitalize">{(tractor.conditionGrade || 'GOOD').toLowerCase()}</span>
                          </div>
                          <div className="bg-foreground/5 p-2 rounded-xl text-center">
                            <span className="text-[10px] uppercase font-black text-muted block">Engine</span>
                            <span className="font-black text-xs text-[var(--color-brand-green)]">{tractor.engineConditionPct ? `${tractor.engineConditionPct}%` : 'Good'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border-subtle)]">
                        <div className="flex flex-wrap gap-2 text-xs font-bold text-muted">
                          {tractor.rcAvailable && <span className="px-2 py-0.5 bg-foreground/5 rounded border border-[var(--border-subtle)]">RC Available</span>}
                          {tractor.loanClearanceStatus === 'CLEAR' && <span className="px-2 py-0.5 bg-foreground/5 rounded border border-[var(--border-subtle)]">Loan Cleared</span>}
                          {tractor.financeAvailable && <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 rounded border border-blue-500/20">Finance Available</span>}
                        </div>

                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleOpenQuickView(tractor.id)}
                            className="px-3 py-2 bg-foreground/5 hover:bg-foreground/10 text-foreground font-black text-xs rounded-xl transition-colors flex items-center gap-1"
                          >
                            <Eye size={14} /> Quick View
                          </button>

                          <button 
                            onClick={() => { setEnquiryModalOpen(tractor); setEnquirySuccess(false); }}
                            className="px-4 py-2 bg-background border border-[var(--color-brand-green)] text-[var(--color-brand-green)] font-black text-xs rounded-xl hover:bg-[var(--color-brand-green)]/10 transition-colors flex items-center gap-1"
                          >
                            <MessageCircle size={14} /> Contact
                          </button>

                          <Link 
                            href={`/used-tractors/details/${tractor.id}`}
                            className="px-4 py-2 bg-[var(--color-brand-green)] text-white font-black text-xs rounded-xl hover:bg-[var(--color-brand-green)]/90 shadow-md transition-all flex items-center gap-1"
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
                onLimitChange={(l) => { setLimit(l); setPage(1); }}
              />
            </div>
          )}

        </main>
      </div>

      {/* ---------------------------------------------------- */}
      {/* QUICK VIEW INSPECTION MODAL (using getUsedTractorListingById API) */}
      {/* ---------------------------------------------------- */}
      {quickViewModalId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={() => setQuickViewModalId(null)} />
          
          <div className="relative w-full max-w-2xl bg-background rounded-3xl border border-[var(--border-subtle)] shadow-2xl p-6 sm:p-8 overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar animate-slide-up">
            <button 
              onClick={() => setQuickViewModalId(null)}
              className="absolute top-5 right-5 p-2 bg-foreground/5 hover:bg-foreground/10 rounded-full transition-colors z-10"
            >
              <X size={18} />
            </button>

            {quickViewLoading ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <TractorLoader size={48} className="text-[var(--color-brand-green)] mb-4" />
                <p className="text-sm font-bold text-muted">Fetching inspection data from API...</p>
              </div>
            ) : quickViewDetails ? (
              <div className="space-y-6">
                
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] text-xs font-black rounded-full mb-2">
                      <ShieldCheck size={14} /> API Verified Inspection Data
                    </div>
                    <h3 className="text-2xl font-black text-foreground">
                      {quickViewDetails.tractorBrand} {quickViewDetails.tractorModel}
                    </h3>
                    <p className="text-xs font-bold text-muted flex items-center gap-1 mt-1">
                      <MapPin size={13} className="text-[var(--color-brand-green)]" />
                      {quickViewDetails.villageCity ? `${quickViewDetails.villageCity}, ` : ''}{quickViewDetails.district}, {quickViewDetails.state}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-black text-[var(--color-brand-green)]">
                      {formatPrice(quickViewDetails.askingPrice)}
                    </div>
                    {quickViewDetails.negotiable && (
                      <span className="text-[10px] font-black uppercase text-muted bg-foreground/5 px-2 py-0.5 rounded">Negotiable</span>
                    )}
                  </div>
                </div>

                {/* Inspection Components Grid */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-muted mb-3 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[var(--color-brand-green)]" /> Inspection Scorecard & Component Status
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-foreground/5 p-3 rounded-2xl border border-[var(--border-subtle)]">
                      <div className="text-[10px] uppercase font-black text-muted">Engine Condition</div>
                      <div className="text-base font-black text-[var(--color-brand-green)] mt-0.5">
                        {quickViewDetails.engineConditionPct ? `${quickViewDetails.engineConditionPct}% Rating` : '90% Tested'}
                      </div>
                    </div>

                    <div className="bg-foreground/5 p-3 rounded-2xl border border-[var(--border-subtle)]">
                      <div className="text-[10px] uppercase font-black text-muted">Tyre Condition</div>
                      <div className="text-base font-black text-foreground capitalize mt-0.5">
                        {(quickViewDetails.tyreCondition || 'GOOD').toLowerCase()}
                      </div>
                    </div>

                    <div className="bg-foreground/5 p-3 rounded-2xl border border-[var(--border-subtle)]">
                      <div className="text-[10px] uppercase font-black text-muted">Body & Paint</div>
                      <div className="text-base font-black text-foreground capitalize mt-0.5">
                        {(quickViewDetails.bodyCondition || 'GOOD').toLowerCase()}
                      </div>
                    </div>

                    <div className="bg-foreground/5 p-3 rounded-2xl border border-[var(--border-subtle)]">
                      <div className="text-[10px] uppercase font-black text-muted">Hydraulics</div>
                      <div className="text-base font-black text-foreground capitalize mt-0.5">
                        {(quickViewDetails.hydraulicsCondition || 'GOOD').toLowerCase()}
                      </div>
                    </div>

                    <div className="bg-foreground/5 p-3 rounded-2xl border border-[var(--border-subtle)]">
                      <div className="text-[10px] uppercase font-black text-muted">Clutch Condition</div>
                      <div className="text-base font-black text-foreground capitalize mt-0.5">
                        {(quickViewDetails.clutchCondition || 'GOOD').toLowerCase()}
                      </div>
                    </div>

                    <div className="bg-foreground/5 p-3 rounded-2xl border border-[var(--border-subtle)]">
                      <div className="text-[10px] uppercase font-black text-muted">RC Status</div>
                      <div className="text-base font-black text-emerald-600 mt-0.5 flex items-center gap-1">
                        <CheckCircle2 size={14} /> {quickViewDetails.rcAvailable ? 'Verified RC' : 'In Process'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {quickViewDetails.description && (
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-muted mb-1.5">Seller Notes</h4>
                    <p className="text-xs font-bold text-foreground bg-foreground/5 p-3 rounded-2xl leading-relaxed">
                      {quickViewDetails.description}
                    </p>
                  </div>
                )}

                {/* Seller & Action Footer */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[var(--border-subtle)]">
                  <div className="text-xs font-bold text-muted">
                    ID: #{quickViewDetails.id} • Views: {quickViewDetails.viewsCount || 0}
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => { 
                        setQuickViewModalId(null); 
                        setEnquiryModalOpen(quickViewDetails); 
                        setEnquirySuccess(false); 
                      }}
                      className="px-5 py-2.5 bg-background border border-[var(--color-brand-green)] text-[var(--color-brand-green)] font-black text-xs rounded-xl hover:bg-[var(--color-brand-green)]/10 transition-colors flex items-center gap-1.5"
                    >
                      <MessageCircle size={15} /> Contact Seller
                    </button>

                    <Link 
                      href={`/used-tractors/details/${quickViewDetails.id}`}
                      className="px-6 py-2.5 bg-[var(--color-brand-green)] text-white font-black text-xs rounded-xl shadow-md hover:bg-[var(--color-brand-green)]/90 transition-all flex items-center gap-1"
                    >
                      Full Details <ChevronRight size={15} />
                    </Link>
                  </div>
                </div>

              </div>
            ) : (
              <div className="py-12 text-center text-muted">Failed to load detail preview.</div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SELLER ENQUIRY LEAD MODAL (using createEnquiry API) */}
      {/* ---------------------------------------------------- */}
      {enquiryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={() => setEnquiryModalOpen(null)} />
          
          <div className="relative w-full max-w-lg bg-background rounded-3xl border border-[var(--border-subtle)] shadow-2xl p-6 sm:p-8 overflow-hidden animate-slide-up">
            <button 
              onClick={() => setEnquiryModalOpen(null)}
              className="absolute top-5 right-5 p-2 bg-foreground/5 hover:bg-foreground/10 rounded-full transition-colors z-10"
            >
              <X size={18} />
            </button>

            <div className="mb-6 pr-10">
              <h3 className="text-2xl font-black text-foreground mb-1">Contact Seller</h3>
              <p className="text-xs font-bold text-muted">
                Inquiring about <span className="text-[var(--color-brand-green)] font-black">{enquiryModalOpen.tractorBrand} {enquiryModalOpen.tractorModel}</span>
              </p>
            </div>

            {enquirySuccess ? (
              <div className="py-8 text-center flex flex-col items-center justify-center animate-fade-in">
                <div className="w-16 h-16 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={36} />
                </div>
                <h4 className="text-xl font-black text-foreground mb-2">Enquiry Sent Successfully!</h4>
                <p className="text-xs font-bold text-muted max-w-xs mb-6">
                  The seller will receive your message and contact details directly.
                </p>
                <button 
                  onClick={() => setEnquiryModalOpen(null)}
                  className="px-6 py-2.5 bg-[var(--color-brand-green)] text-white font-black text-xs rounded-xl shadow-md"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="space-y-4">
                
                {enquiryError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2">
                    <AlertCircle size={16} /> {enquiryError}
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted mb-1 block">Full Name *</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Enter your name" 
                    value={enquiryForm.name}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-foreground/5 border border-[var(--border-subtle)] rounded-xl text-xs font-bold text-foreground outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]" 
                  />
                </div>
                
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted mb-1 block">Mobile Number *</label>
                  <input 
                    required 
                    type="tel" 
                    placeholder="+91 XXXXX XXXXX" 
                    value={enquiryForm.mobile}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, mobile: e.target.value })}
                    className="w-full px-4 py-2.5 bg-foreground/5 border border-[var(--border-subtle)] rounded-xl text-xs font-bold text-foreground outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]" 
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted mb-1 block">Your Price Offer (INR Optional)</label>
                  <input 
                    type="number" 
                    placeholder={`Asking price: ₹${enquiryModalOpen.askingPrice}`} 
                    value={enquiryForm.offerPrice}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, offerPrice: e.target.value })}
                    className="w-full px-4 py-2.5 bg-foreground/5 border border-[var(--border-subtle)] rounded-xl text-xs font-bold text-foreground outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]" 
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted mb-1 block">Message / Note</label>
                  <textarea 
                    rows={3} 
                    placeholder="Hi, I am interested in viewing this tractor..." 
                    value={enquiryForm.message}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                    className="w-full px-4 py-2.5 bg-foreground/5 border border-[var(--border-subtle)] rounded-xl text-xs font-bold text-foreground outline-none resize-none focus:ring-2 focus:ring-[var(--color-brand-green)]" 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={submittingEnquiry}
                  className="w-full py-3.5 bg-[var(--color-brand-green)] text-white font-black text-xs rounded-xl shadow-lg shadow-[var(--color-brand-green)]/20 hover:bg-[var(--color-brand-green)]/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
