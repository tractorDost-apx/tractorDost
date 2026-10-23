'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  ChevronRight,
  ChevronLeft,
  Star,
  Tractor,
  Filter,
  X,
  Grid3X3,
  List,
  SlidersHorizontal,
  Gauge,
  Zap,
  Fuel,
  ArrowUpDown,
  Sparkles,
  Check,
  RotateCcw,
} from 'lucide-react';
import { tractorAPI, Tractor as TractorModel } from '@/lib/api/tractors';
import { brandAPI, Brand } from '@/lib/api/brands';

function TractorsListingContent() {
  const searchParams = useSearchParams();
  const brandQuery = searchParams.get('brand');
  const familyQuery = searchParams.get('family');
  const searchQueryParam = searchParams.get('search');
  const hpQueryParam = searchParams.get('hp');
  const priceQueryParam = searchParams.get('price');

  const [tractors, setTractors] = useState<TractorModel[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [activeBrandDetails, setActiveBrandDetails] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);

  // Filtering & Pagination State
  const [searchQuery, setSearchQuery] = useState(searchQueryParam || '');
  const [selectedBrand, setSelectedBrand] = useState<number | ''>('');
  const [selectedFamily, setSelectedFamily] = useState<number | ''>('');
  const [selectedHp, setSelectedHp] = useState<string>(hpQueryParam || '');
  const [selectedDrive, setSelectedDrive] = useState<string>('');
  const [selectedFuel, setSelectedFuel] = useState<string>('');
  const [selectedPrice, setSelectedPrice] = useState<string>(priceQueryParam || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'hp_desc' | 'hp_asc'>('featured');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTractors, setTotalTractors] = useState(0);

  // Mobile filters toggle
  const [showFilters, setShowFilters] = useState(false);

  // Synchronize state with URL query parameters
  useEffect(() => {
    if (brandQuery !== null) {
      setSelectedBrand(brandQuery ? parseInt(brandQuery) : '');
    } else {
      setSelectedBrand('');
    }
    if (familyQuery !== null) {
      setSelectedFamily(familyQuery ? parseInt(familyQuery) : '');
    } else {
      setSelectedFamily('');
    }
    if (searchQueryParam !== null) {
      setSearchQuery(searchQueryParam || '');
    }
    if (hpQueryParam !== null) {
      setSelectedHp(hpQueryParam || '');
    }
    if (priceQueryParam !== null) {
      setSelectedPrice(priceQueryParam || '');
    }
    setPage(1);
  }, [brandQuery, familyQuery, searchQueryParam, hpQueryParam, priceQueryParam]);

  // 1. Fetch Brands for Sidebar
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await brandAPI.getAllBrands({ limit: 50 });
        if (res.success) {
          const payload = res.data as any;
          setBrands(payload.brands || payload.data || []);
        }
      } catch (err) {
        console.error('Failed to load brands', err);
      }
    };
    fetchBrands();
  }, []);

  // 1.5 Fetch selected Brand Details for the Hero Section
  useEffect(() => {
    const fetchBrandDetails = async () => {
      if (!selectedBrand) {
        setActiveBrandDetails(null);
        return;
      }
      try {
        const res = await brandAPI.getBrandById(selectedBrand as number);
        if (res.success && res.data) {
          setActiveBrandDetails(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch brand details', err);
      }
    };
    fetchBrandDetails();
  }, [selectedBrand]);

  // 2. Fetch Tractors based on filters
  useEffect(() => {
    const fetchTractors = async () => {
      setLoading(true);
      try {
        const params: any = {
          page,
          limit: 12,
          search: searchQuery,
        };

        if (selectedBrand !== '') params.brandId = selectedBrand;
        if (selectedFamily !== '') params.familyId = selectedFamily;

        if (selectedHp === 'under30') {
          params.hpMax = 30;
        } else if (selectedHp === '30to50') {
          params.hpMin = 30;
          params.hpMax = 50;
        } else if (selectedHp === 'over50') {
          params.hpMin = 50;
        }

        if (selectedDrive !== '') params.driveType = selectedDrive;
        if (selectedFuel !== '') params.fuelType = selectedFuel;

        if (selectedPrice === 'under5') {
          params.priceMax = 500000;
        } else if (selectedPrice === '5to10') {
          params.priceMin = 500000;
          params.priceMax = 1000000;
        } else if (selectedPrice === 'over10') {
          params.priceMin = 1000000;
        }

        const res = await tractorAPI.getAllTractors(params);
        if (res.success) {
          const payload = res.data as any;
          setTractors(payload.tractors || payload.data || []);
          setTotalPages(payload.pagination?.totalPages || 1);
          setTotalTractors(payload.pagination?.total || 0);
        }
      } catch (err) {
        console.error('Failed to load tractors', err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchTractors();
    }, 350);
    return () => clearTimeout(debounce);
  }, [
    page,
    searchQuery,
    selectedBrand,
    selectedFamily,
    selectedHp,
    selectedDrive,
    selectedFuel,
    selectedPrice,
  ]);

  // Sorting
  const sortedTractors = useMemo(() => {
    const list = [...tractors];
    if (sortBy === 'price_asc') {
      return list.sort((a, b) => (a.exShowroomPriceMin || 0) - (b.exShowroomPriceMin || 0));
    }
    if (sortBy === 'price_desc') {
      return list.sort((a, b) => (b.exShowroomPriceMin || 0) - (a.exShowroomPriceMin || 0));
    }
    if (sortBy === 'hp_desc') {
      return list.sort((a, b) => (b.hp || 0) - (a.hp || 0));
    }
    if (sortBy === 'hp_asc') {
      return list.sort((a, b) => (a.hp || 0) - (b.hp || 0));
    }
    return list;
  }, [tractors, sortBy]);

  const activeFiltersCount = useMemo(() => {
    return [
      selectedBrand !== '',
      selectedHp !== '',
      selectedDrive !== '',
      selectedFuel !== '',
      selectedPrice !== '',
      searchQuery.trim() !== '',
    ].filter(Boolean).length;
  }, [selectedBrand, selectedHp, selectedDrive, selectedFuel, selectedPrice, searchQuery]);

  const handleClearAll = () => {
    setSelectedBrand('');
    setSelectedFamily('');
    setSelectedHp('');
    setSelectedDrive('');
    setSelectedFuel('');
    setSelectedPrice('');
    setSearchQuery('');
    setPage(1);
  };

  const formatPrice = (price: number | null | undefined) => {
    if (!price) return 'Price on Request';
    if (price >= 100000) return `₹ ${(price / 100000).toFixed(2)} Lakh`;
    return `₹ ${price.toLocaleString()}`;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="animate-fade-in mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-4 pt-6 pb-24 sm:px-6 lg:px-8">
      {/* ===================== HERO / BANNER SECTION ===================== */}
      {activeBrandDetails ? (
        <div className="relative mb-10 overflow-hidden rounded-[2.5rem] border border-black/10 dark:border-white/10 bg-gradient-to-br from-emerald-500/10 via-white/80 to-amber-500/10 dark:from-emerald-950/40 dark:via-[#111713]/90 dark:to-amber-950/30 p-8 shadow-xl dark:shadow-2xl backdrop-blur-xl md:p-12">
          {/* Ambient Glows */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[var(--color-brand-green)]/20 dark:bg-[var(--color-brand-green)]/25 blur-[90px]" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[var(--color-brand-orange)]/15 dark:bg-[var(--color-brand-orange)]/20 blur-[80px]" />

          <div className="relative z-10 flex flex-col items-center gap-8 md:flex-row md:items-start">
            {/* Brand Logo Box */}
            <div className="group relative flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-[2rem] border border-black/10 dark:border-white/10 bg-white/95 dark:bg-[#151c17] p-5 shadow-md md:h-40 md:w-40">
              {activeBrandDetails.logoUrl ? (
                <img
                  src={activeBrandDetails.logoUrl}
                  alt={activeBrandDetails.name}
                  className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <span className="text-foreground/30 text-5xl font-black">
                  {activeBrandDetails.name.charAt(0)}
                </span>
              )}
            </div>

            {/* Brand Details */}
            <div className="flex flex-1 flex-col items-center text-center md:items-start md:text-left">
              <div className="mb-2 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 px-3 py-1 text-xs font-black tracking-wider text-[var(--color-brand-green)] uppercase">
                  <Sparkles size={12} /> Official Brand Partner
                </span>
                {activeBrandDetails.isFeatured && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-black tracking-wider text-amber-600 uppercase dark:text-amber-400">
                    <Star size={12} className="fill-current" /> Featured
                  </span>
                )}
                {activeBrandDetails.country && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-1 text-xs font-bold text-foreground/80 uppercase">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-brand-orange)]" />
                    {activeBrandDetails.country}
                  </span>
                )}
                {activeBrandDetails.foundedYear && (
                  <span className="inline-flex items-center rounded-full border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-1 text-xs font-bold text-foreground/80">
                    Est. {activeBrandDetails.foundedYear}
                  </span>
                )}
              </div>

              <h1 className="text-foreground text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                {activeBrandDetails.name} Tractors
              </h1>

              {activeBrandDetails.aboutBrand && (
                <div
                  className="text-muted custom-scrollbar mt-3 max-h-24 max-w-3xl overflow-y-auto pr-2 text-sm leading-relaxed font-medium md:text-base"
                  dangerouslySetInnerHTML={{ __html: activeBrandDetails.aboutBrand }}
                />
              )}

              <div className="mt-5 flex items-center gap-3">
                <span className="rounded-full bg-[var(--color-brand-green)] px-3.5 py-1 text-xs font-black text-white shadow-sm">
                  {totalTractors} Models Available
                </span>
                <button
                  onClick={() => {
                    setSelectedBrand('');
                    setPage(1);
                  }}
                  className="inline-flex items-center gap-1 rounded-full border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/10 px-3 py-1 text-xs font-bold text-foreground/80 hover:bg-black/5 dark:hover:bg-white/15 transition-colors"
                >
                  <X size={13} /> View All Brands
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative mb-10 overflow-hidden rounded-[2.5rem] border border-black/10 dark:border-white/10 bg-gradient-to-br from-emerald-500/10 via-white/80 to-amber-500/10 dark:from-emerald-950/40 dark:via-[#111713]/90 dark:to-amber-950/30 p-8 shadow-xl dark:shadow-2xl backdrop-blur-xl md:p-12">
          {/* Ambient Glows */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[var(--color-brand-green)]/20 dark:bg-[var(--color-brand-green)]/25 blur-[90px]" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[var(--color-brand-orange)]/15 dark:bg-[var(--color-brand-orange)]/20 blur-[80px]" />

          <div className="relative z-10 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            {/* Left Content */}
            <div className="flex max-w-3xl flex-col gap-3">
              <div className="inline-flex items-center gap-2 self-start rounded-full border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 px-3.5 py-1 text-xs font-black tracking-wider text-[var(--color-brand-green)] uppercase">
                <Sparkles size={13} /> Official Tractor Directory 2026
              </div>

              <h1 className="text-foreground text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Explore{' '}
                <span className="bg-gradient-to-r from-[var(--color-brand-green)] via-emerald-600 to-[var(--color-brand-orange)] bg-clip-text text-transparent">
                  Tractors
                </span>
              </h1>

              <p className="text-muted text-base font-medium leading-relaxed sm:text-lg">
                Discover India's most powerful, reliable tractors. Compare horsepower, drive types,
                and transparent ex-showroom pricing for your farmland.
              </p>

              {/* Quick Filter Shortcuts */}
              <div className="mt-2 flex flex-wrap items-center gap-2 pt-2">
                <span className="text-muted text-xs font-bold tracking-wider uppercase">
                  Quick Filters:
                </span>
                <button
                  onClick={() => {
                    setSelectedPrice(selectedPrice === 'under5' ? '' : 'under5');
                    setPage(1);
                  }}
                  className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all ${
                    selectedPrice === 'under5'
                      ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
                      : 'border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 text-foreground/80 hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  ⚡ Under ₹5 Lakh
                </button>
                <button
                  onClick={() => {
                    setSelectedHp(selectedHp === 'over50' ? '' : 'over50');
                    setPage(1);
                  }}
                  className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all ${
                    selectedHp === 'over50'
                      ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
                      : 'border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 text-foreground/80 hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  💪 50+ HP Heavy
                </button>
                <button
                  onClick={() => {
                    setSelectedDrive(selectedDrive === 'FOUR_WD' ? '' : 'FOUR_WD');
                    setPage(1);
                  }}
                  className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all ${
                    selectedDrive === 'FOUR_WD'
                      ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
                      : 'border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 text-foreground/80 hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  🚜 4WD Drive
                </button>
                <button
                  onClick={() => {
                    setSelectedHp(selectedHp === '30to50' ? '' : '30to50');
                    setPage(1);
                  }}
                  className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all ${
                    selectedHp === '30to50'
                      ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
                      : 'border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 text-foreground/80 hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  🌾 30-50 HP Utility
                </button>
              </div>
            </div>

            {/* Right Metric Box */}
            <div className="z-10 flex shrink-0 items-center gap-4 rounded-3xl border border-black/8 dark:border-white/10 bg-white/80 dark:bg-[#151c17]/90 p-5 shadow-lg backdrop-blur-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-brand-green)]/15 text-[var(--color-brand-green)]">
                <Tractor size={32} strokeWidth={1.8} />
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-black tracking-tight text-foreground">
                  {totalTractors}
                </span>
                <span className="text-muted text-[10px] font-black tracking-widest uppercase">
                  Tractors Found
                </span>
                <span className="mt-0.5 text-[11px] font-bold text-[var(--color-brand-green)]">
                  ✓ Verified Specs
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MAIN CONTENT & SIDEBAR ===================== */}
      <div className="flex flex-col items-start gap-8 lg:flex-row">
        {/* MOBILE FILTER BUTTON */}
        <button
          className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#121814]/80 py-4 text-sm font-black text-foreground shadow-sm backdrop-blur-md lg:hidden"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={18} className="text-[var(--color-brand-green)]" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
          {activeFiltersCount > 0 && (
            <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-brand-green)] text-[11px] font-black text-white">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* ===================== SIDEBAR FILTERS ===================== */}
        <aside
          className={`w-full flex-shrink-0 lg:w-72 ${
            showFilters ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="sticky top-28 flex flex-col gap-6 rounded-[2rem] border border-black/8 dark:border-white/10 bg-white/90 dark:bg-[#121814]/90 p-6 shadow-xl backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-[var(--color-brand-green)]" />
                <h3 className="text-lg font-black tracking-tight text-foreground">Filters</h3>
                {activeFiltersCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-brand-green)] px-1.5 text-[10px] font-black text-white">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-1 text-xs font-bold text-[var(--color-brand-orange)] transition-colors hover:underline"
                >
                  <RotateCcw size={12} /> Clear All
                </button>
              )}
            </div>

            {/* Filter: Search */}
            <div className="flex flex-col gap-2">
              <span className="text-muted text-[11px] font-black tracking-widest uppercase">
                Search Model
              </span>
              <div className="relative">
                <Search size={15} className="text-muted absolute top-1/2 left-3 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Swaraj 855, 575 DI..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] py-2.5 pr-8 pl-9 text-sm font-bold text-foreground placeholder:text-muted/60 focus:border-[var(--color-brand-green)] focus:ring-2 focus:ring-[var(--color-brand-green)]/20 focus:outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setPage(1);
                    }}
                    className="text-muted hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Filter: Brands */}
            <div className="flex flex-col gap-2.5">
              <span className="text-muted text-[11px] font-black tracking-widest uppercase">
                Brand
              </span>
              <div className="custom-scrollbar flex max-h-56 flex-col gap-1 overflow-y-auto pr-1">
                <button
                  onClick={() => {
                    setSelectedBrand('');
                    setSelectedFamily('');
                    setPage(1);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-bold transition-all ${
                    selectedBrand === ''
                      ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
                      : 'text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <span>All Brands</span>
                  {selectedBrand === '' && <Check size={15} strokeWidth={2.5} />}
                </button>

                {brands.map((brand) => {
                  const isSelected = selectedBrand === brand.id;
                  return (
                    <button
                      key={brand.id}
                      onClick={() => {
                        setSelectedBrand(isSelected ? '' : brand.id);
                        setSelectedFamily('');
                        setPage(1);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-bold transition-all ${
                        isSelected
                          ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
                          : 'text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      <span className="truncate">{brand.name}</span>
                      {isSelected && <Check size={15} strokeWidth={2.5} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter: HP Range */}
            <div className="flex flex-col gap-2.5 border-t border-black/5 dark:border-white/5 pt-4">
              <span className="text-muted text-[11px] font-black tracking-widest uppercase">
                Horsepower (HP)
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { value: '', label: 'All HP Range' },
                  { value: 'under30', label: '< 30 HP (Mini / Orchard)' },
                  { value: '30to50', label: '30 - 50 HP (Utility)' },
                  { value: 'over50', label: '> 50 HP (Heavy Duty)' },
                ].map((hp) => {
                  const isSelected = selectedHp === hp.value;
                  return (
                    <button
                      key={hp.value}
                      onClick={() => {
                        setSelectedHp(isSelected && hp.value !== '' ? '' : hp.value);
                        setPage(1);
                      }}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
                          : 'border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.03] text-foreground/80 hover:bg-black/5 dark:hover:bg-white/10'
                      }`}
                    >
                      <span>{hp.label}</span>
                      {isSelected && <Check size={13} strokeWidth={2.5} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter: Drive Type */}
            <div className="flex flex-col gap-2.5 border-t border-black/5 dark:border-white/5 pt-4">
              <span className="text-muted text-[11px] font-black tracking-widest uppercase">
                Drive Type
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { value: '', label: 'All' },
                  { value: 'TWO_WD', label: '2WD' },
                  { value: 'FOUR_WD', label: '4WD' },
                ].map((drive) => {
                  const isSelected = selectedDrive === drive.value;
                  return (
                    <button
                      key={drive.value}
                      onClick={() => {
                        setSelectedDrive(isSelected && drive.value !== '' ? '' : drive.value);
                        setPage(1);
                      }}
                      className={`rounded-xl py-2 text-center text-xs font-black transition-all ${
                        isSelected
                          ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
                          : 'border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.03] text-foreground/80 hover:bg-black/5 dark:hover:bg-white/10'
                      }`}
                    >
                      {drive.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter: Fuel Type */}
            <div className="flex flex-col gap-2.5 border-t border-black/5 dark:border-white/5 pt-4">
              <span className="text-muted text-[11px] font-black tracking-widest uppercase">
                Fuel Type
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { value: '', label: 'All Fuel' },
                  { value: 'DIESEL', label: 'Diesel' },
                  { value: 'ELECTRIC', label: 'Electric' },
                  { value: 'CNG', label: 'CNG' },
                ].map((fuel) => {
                  const isSelected = selectedFuel === fuel.value;
                  return (
                    <button
                      key={fuel.value}
                      onClick={() => {
                        setSelectedFuel(isSelected && fuel.value !== '' ? '' : fuel.value);
                        setPage(1);
                      }}
                      className={`rounded-xl py-2 text-center text-xs font-black transition-all ${
                        isSelected
                          ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
                          : 'border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.03] text-foreground/80 hover:bg-black/5 dark:hover:bg-white/10'
                      }`}
                    >
                      {fuel.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter: Price Range */}
            <div className="flex flex-col gap-2.5 border-t border-black/5 dark:border-white/5 pt-4">
              <span className="text-muted text-[11px] font-black tracking-widest uppercase">
                Budget / Price
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { value: '', label: 'All Price Ranges' },
                  { value: 'under5', label: 'Under ₹ 5 Lakh' },
                  { value: '5to10', label: '₹ 5 - 10 Lakh' },
                  { value: 'over10', label: 'Above ₹ 10 Lakh' },
                ].map((price) => {
                  const isSelected = selectedPrice === price.value;
                  return (
                    <button
                      key={price.value}
                      onClick={() => {
                        setSelectedPrice(isSelected && price.value !== '' ? '' : price.value);
                        setPage(1);
                      }}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
                          : 'border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.03] text-foreground/80 hover:bg-black/5 dark:hover:bg-white/10'
                      }`}
                    >
                      <span>{price.label}</span>
                      {isSelected && <Check size={13} strokeWidth={2.5} />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* ===================== MAIN LISTING AREA ===================== */}
        <div className="flex w-full min-w-0 flex-1 flex-col gap-6">
          {/* Top Bar: Results Count, Active Filter Chips, Sort & View Mode */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.75rem] border border-black/8 dark:border-white/10 bg-white/85 dark:bg-[#121814]/90 p-4 shadow-sm backdrop-blur-xl">
            {/* Left: Count & Chips */}
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-bold text-muted">
                Showing{' '}
                <span className="font-black text-foreground">{sortedTractors.length}</span> results{' '}
                {totalTractors > 0 && (
                  <span>
                    of <span className="font-black text-[var(--color-brand-green)]">{totalTractors}</span>
                  </span>
                )}
              </p>

              {/* Active Filter Chips */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {selectedBrand !== '' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-green)]/10 px-2.5 py-0.5 text-xs font-bold text-[var(--color-brand-green)]">
                      {brands.find((b) => b.id === selectedBrand)?.name || 'Brand'}
                      <button
                        onClick={() => {
                          setSelectedBrand('');
                          setPage(1);
                        }}
                        className="hover:text-[var(--color-brand-orange)]"
                      >
                        <X size={12} strokeWidth={2.5} />
                      </button>
                    </span>
                  )}
                  {selectedHp !== '' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-green)]/10 px-2.5 py-0.5 text-xs font-bold text-[var(--color-brand-green)]">
                      {selectedHp === 'under30'
                        ? '< 30 HP'
                        : selectedHp === '30to50'
                        ? '30-50 HP'
                        : '> 50 HP'}
                      <button
                        onClick={() => {
                          setSelectedHp('');
                          setPage(1);
                        }}
                        className="hover:text-[var(--color-brand-orange)]"
                      >
                        <X size={12} strokeWidth={2.5} />
                      </button>
                    </span>
                  )}
                  {selectedDrive !== '' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-green)]/10 px-2.5 py-0.5 text-xs font-bold text-[var(--color-brand-green)]">
                      {selectedDrive === 'TWO_WD' ? '2WD' : '4WD'}
                      <button
                        onClick={() => {
                          setSelectedDrive('');
                          setPage(1);
                        }}
                        className="hover:text-[var(--color-brand-orange)]"
                      >
                        <X size={12} strokeWidth={2.5} />
                      </button>
                    </span>
                  )}
                  {selectedFuel !== '' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-green)]/10 px-2.5 py-0.5 text-xs font-bold text-[var(--color-brand-green)]">
                      {selectedFuel}
                      <button
                        onClick={() => {
                          setSelectedFuel('');
                          setPage(1);
                        }}
                        className="hover:text-[var(--color-brand-orange)]"
                      >
                        <X size={12} strokeWidth={2.5} />
                      </button>
                    </span>
                  )}
                  {selectedPrice !== '' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-green)]/10 px-2.5 py-0.5 text-xs font-bold text-[var(--color-brand-green)]">
                      {selectedPrice === 'under5'
                        ? '< ₹5L'
                        : selectedPrice === '5to10'
                        ? '₹5-10L'
                        : '> ₹10L'}
                      <button
                        onClick={() => {
                          setSelectedPrice('');
                          setPage(1);
                        }}
                        className="hover:text-[var(--color-brand-orange)]"
                      >
                        <X size={12} strokeWidth={2.5} />
                      </button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/5 dark:bg-white/10 px-2.5 py-0.5 text-xs font-bold text-foreground">
                      "{searchQuery}"
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setPage(1);
                        }}
                        className="hover:text-[var(--color-brand-orange)]"
                      >
                        <X size={12} strokeWidth={2.5} />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={handleClearAll}
                    className="text-muted hover:text-foreground ml-1 text-xs font-bold underline underline-offset-2"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Right: Sort & View Toggle */}
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] px-3 py-1.5">
                <ArrowUpDown size={14} className="text-muted shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs font-bold text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="featured" className="bg-background text-foreground">
                    Featured
                  </option>
                  <option value="price_asc" className="bg-background text-foreground">
                    Price: Low to High
                  </option>
                  <option value="price_desc" className="bg-background text-foreground">
                    Price: High to Low
                  </option>
                  <option value="hp_desc" className="bg-background text-foreground">
                    HP: High to Low
                  </option>
                  <option value="hp_asc" className="bg-background text-foreground">
                    HP: Low to High
                  </option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.04] p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                  className={`rounded-lg p-1.5 transition-all ${
                    viewMode === 'grid'
                      ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  <Grid3X3 size={17} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  title="List View"
                  className={`rounded-lg p-1.5 transition-all ${
                    viewMode === 'list'
                      ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  <List size={17} />
                </button>
              </div>
            </div>
          </div>

          {/* ===================== LISTINGS / CARDS ===================== */}
          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex h-[380px] animate-pulse flex-col rounded-[2.25rem] border border-black/5 dark:border-white/5 bg-black/[0.03] dark:bg-white/[0.03] p-5"
                >
                  <div className="h-48 w-full rounded-2xl bg-black/5 dark:bg-white/5" />
                  <div className="mt-4 h-5 w-3/4 rounded-lg bg-black/5 dark:bg-white/5" />
                  <div className="mt-3 flex gap-2">
                    <div className="h-6 w-16 rounded-lg bg-black/5 dark:bg-white/5" />
                    <div className="h-6 w-16 rounded-lg bg-black/5 dark:bg-white/5" />
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="h-6 w-24 rounded-lg bg-black/5 dark:bg-white/5" />
                    <div className="h-10 w-20 rounded-full bg-black/5 dark:bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : sortedTractors.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-black/10 dark:border-white/10 bg-white/40 dark:bg-[#121814]/40 p-16 text-center backdrop-blur-md">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
                <Tractor size={40} strokeWidth={1.5} />
              </div>
              <h3 className="text-foreground text-2xl font-black">No Tractors Found</h3>
              <p className="text-muted mt-1 max-w-md text-sm font-medium">
                We couldn't find any tractors matching your current filters. Try resetting filters or
                adjusting search keywords.
              </p>
              <button
                onClick={handleClearAll}
                className="mt-6 flex items-center gap-2 rounded-full bg-[var(--color-brand-green)] px-6 py-3 text-sm font-black text-white shadow-lg shadow-[var(--color-brand-green)]/25 transition-all hover:scale-105 active:scale-95"
              >
                <RotateCcw size={15} /> Clear All Filters
              </button>
            </div>
          ) : (
            <div
              className={`grid gap-6 ${
                viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
              }`}
            >
              {sortedTractors.map((tractor) => {
                const primaryImage =
                  tractor.media && tractor.media.length > 0
                    ? tractor.media.find((m) => m.isPrimary)?.url || tractor.media[0].url
                    : null;

                // ================= LIST VIEW =================
                if (viewMode === 'list') {
                  return (
                    <Link
                      key={tractor.id}
                      href={`/tractors/${tractor.id}`}
                      className="group relative flex flex-col gap-6 overflow-hidden rounded-[2.25rem] border border-black/8 dark:border-white/10 bg-white/90 dark:bg-[#121814]/90 p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-brand-green)]/40 hover:shadow-xl sm:flex-row"
                    >
                      {/* Image Box */}
                      <div className="group/img relative flex h-52 w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-black/5 dark:border-white/5 bg-foreground/5 sm:w-72">
                        {tractor.brand?.name && (
                          <div className="absolute top-3 left-3 z-10 rounded-full border border-black/5 dark:border-white/10 bg-white/95 dark:bg-black/80 px-2.5 py-0.5 text-[10px] font-black tracking-wider text-[var(--color-brand-green)] uppercase shadow-xs backdrop-blur-md">
                            {tractor.brand.name}
                          </div>
                        )}
                        {tractor.isFeatured && (
                          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-gradient-to-r from-[var(--color-brand-orange)] to-amber-600 px-2.5 py-0.5 text-[9px] font-black tracking-widest text-white uppercase shadow-md">
                            <Sparkles size={10} /> Featured
                          </div>
                        )}

                        {primaryImage ? (
                          <img
                            src={primaryImage}
                            alt={tractor.modelName}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover/img:scale-108"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-2">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
                              <Tractor size={32} strokeWidth={1.5} />
                            </div>
                            <span className="text-[10px] font-black tracking-wider text-muted uppercase">
                              {tractor.brand?.name || 'Verified'} Model
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex flex-1 flex-col justify-between py-1">
                        <div>
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="text-[11px] font-black tracking-widest text-[var(--color-brand-green)] uppercase">
                                {tractor.brand?.name}
                              </p>
                              <h3 className="text-foreground text-2xl font-black tracking-tight transition-colors group-hover:text-[var(--color-brand-green)]">
                                {tractor.modelName}
                              </h3>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-bold tracking-wider text-muted uppercase">
                                Ex-Showroom Price
                              </p>
                              <p className="text-foreground text-2xl font-black tracking-tight">
                                {formatPrice(tractor.exShowroomPriceMin)}
                              </p>
                            </div>
                          </div>

                          <p className="text-muted mt-2 line-clamp-2 text-sm font-medium leading-relaxed">
                            {tractor.overview ||
                              'Engineered for maximum reliability, fuel efficiency, and heavy-duty agricultural operations.'}
                          </p>
                        </div>

                        {/* Specs & CTA */}
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-black/5 dark:border-white/5 pt-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="flex items-center gap-1.5 rounded-lg border border-black/5 dark:border-white/5 bg-foreground/[0.04] px-3 py-1.5 text-xs font-bold text-foreground">
                              <Gauge size={13} className="text-[var(--color-brand-green)]" />
                              {tractor.hp || '--'} HP
                            </span>
                            <span className="flex items-center gap-1.5 rounded-lg border border-black/5 dark:border-white/5 bg-foreground/[0.04] px-3 py-1.5 text-xs font-bold text-foreground">
                              <Zap size={13} className="text-[var(--color-brand-orange)]" />
                              {tractor.driveType === 'FOUR_WD' ? '4WD' : '2WD'}
                            </span>
                            <span className="flex items-center gap-1.5 rounded-lg border border-black/5 dark:border-white/5 bg-foreground/[0.04] px-3 py-1.5 text-xs font-bold text-foreground">
                              <Fuel size={13} className="text-blue-500" />
                              {tractor.fuelType === 'DIESEL' ? 'Diesel' : tractor.fuelType}
                            </span>
                            <span className="flex items-center gap-1 rounded-lg border border-amber-500/10 bg-amber-500/10 px-2.5 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                              <Star size={12} className="fill-current" /> 4.8
                            </span>
                          </div>

                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-green)] px-5 py-2 text-xs font-black text-white shadow-md shadow-[var(--color-brand-green)]/25 transition-all group-hover:bg-[var(--color-brand-green-dark)] group-hover:scale-105">
                            View Details <ChevronRight size={14} strokeWidth={3} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                }

                // ================= GRID VIEW =================
                return (
                  <Link
                    key={tractor.id}
                    href={`/tractors/${tractor.id}`}
                    className="group relative flex flex-col overflow-hidden rounded-[2.25rem] border border-black/8 dark:border-white/10 bg-white/90 dark:bg-[#121814]/90 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--color-brand-green)]/40 hover:shadow-2xl hover:shadow-[var(--color-brand-green)]/10"
                  >
                    {/* Image Area */}
                    <div className="group/img relative mb-4 flex h-52 w-full items-center justify-center overflow-hidden rounded-2xl border border-black/5 dark:border-white/5 bg-foreground/5">
                      {/* Floating Brand Badge */}
                      {tractor.brand?.name && (
                        <div className="absolute top-3 left-3 z-10 rounded-full border border-black/5 dark:border-white/10 bg-white/95 dark:bg-black/80 px-2.5 py-0.5 text-[10px] font-black tracking-wider text-[var(--color-brand-green)] uppercase shadow-xs backdrop-blur-md">
                          {tractor.brand.name}
                        </div>
                      )}

                      {/* Featured Badge */}
                      {tractor.isFeatured && (
                        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-gradient-to-r from-[var(--color-brand-orange)] to-amber-600 px-2.5 py-0.5 text-[9px] font-black tracking-widest text-white uppercase shadow-md">
                          <Sparkles size={10} /> Featured
                        </div>
                      )}

                      {primaryImage ? (
                        <img
                          src={primaryImage}
                          alt={tractor.modelName}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover/img:scale-108"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] shadow-inner transition-transform duration-500 group-hover/img:scale-110">
                            <Tractor size={38} strokeWidth={1.5} />
                          </div>
                          <span className="text-[10px] font-black tracking-wider text-muted uppercase">
                            {tractor.brand?.name || 'Verified'} Tractor
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="flex flex-1 flex-col">
                      <div>
                        <p className="text-[10px] font-black tracking-[0.2em] text-[var(--color-brand-green)] uppercase">
                          {tractor.brand?.name}
                        </p>
                        <h3 className="text-foreground mt-1 truncate text-lg font-black tracking-tight transition-colors group-hover:text-[var(--color-brand-green)] sm:text-xl">
                          {tractor.modelName}
                        </h3>
                      </div>

                      {/* Specs Row */}
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <span className="flex items-center gap-1.5 rounded-lg border border-black/5 dark:border-white/5 bg-foreground/[0.04] px-2.5 py-1 text-xs font-bold text-foreground">
                          <Gauge size={12} className="text-[var(--color-brand-green)]" />
                          {tractor.hp || '--'} HP
                        </span>
                        <span className="flex items-center gap-1.5 rounded-lg border border-black/5 dark:border-white/5 bg-foreground/[0.04] px-2.5 py-1 text-xs font-bold text-foreground">
                          <Zap size={12} className="text-[var(--color-brand-orange)]" />
                          {tractor.driveType === 'FOUR_WD' ? '4WD' : '2WD'}
                        </span>
                        <span className="flex items-center gap-1 rounded-lg border border-amber-500/10 bg-amber-500/10 px-2 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                          <Star size={11} className="fill-current" /> 4.8
                        </span>
                      </div>

                      {/* Price & CTA */}
                      <div className="mt-5 flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-4">
                        <div>
                          <p className="text-[10px] font-bold tracking-wider text-muted uppercase">
                            Ex-Showroom Price
                          </p>
                          <p className="text-foreground text-lg font-black tracking-tight sm:text-xl">
                            {formatPrice(tractor.exShowroomPriceMin)}
                          </p>
                        </div>
                        <span className="flex items-center gap-1 rounded-full bg-[var(--color-brand-green)] px-3.5 py-2 text-xs font-black text-white shadow-md shadow-[var(--color-brand-green)]/25 transition-all duration-300 group-hover:bg-[var(--color-brand-green-dark)] group-hover:scale-105">
                          View <ChevronRight size={13} strokeWidth={3} />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* ===================== PAGINATION ===================== */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-3">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all ${
                  page === 1
                    ? 'border-transparent bg-foreground/5 text-muted cursor-not-allowed opacity-50'
                    : 'border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 text-foreground hover:border-[var(--color-brand-green)] hover:text-[var(--color-brand-green)] shadow-sm hover:scale-105'
                }`}
              >
                <ChevronLeft size={18} strokeWidth={2.5} />
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  if (totalPages > 7) {
                    if (pageNum !== 1 && pageNum !== totalPages && Math.abs(page - pageNum) > 1) {
                      if (pageNum === 2 || pageNum === totalPages - 1)
                        return (
                          <span key={pageNum} className="text-muted px-1.5 text-xs">
                            •••
                          </span>
                        );
                      return null;
                    }
                  }

                  const isActive = page === pageNum;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`h-11 w-11 rounded-full text-xs font-black transition-all ${
                        isActive
                          ? 'bg-[var(--color-brand-green)] text-white shadow-md shadow-[var(--color-brand-green)]/30 scale-105'
                          : 'border border-black/5 dark:border-white/5 bg-white/60 dark:bg-white/5 text-foreground/80 hover:bg-black/5 dark:hover:bg-white/10'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all ${
                  page === totalPages
                    ? 'border-transparent bg-foreground/5 text-muted cursor-not-allowed opacity-50'
                    : 'border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 text-foreground hover:border-[var(--color-brand-green)] hover:text-[var(--color-brand-green)] shadow-sm hover:scale-105'
                }`}
              >
                <ChevronRight size={18} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TractorsListingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-full items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-brand-green)] border-t-transparent" />
        </div>
      }
    >
      <TractorsListingContent />
    </Suspense>
  );
}
