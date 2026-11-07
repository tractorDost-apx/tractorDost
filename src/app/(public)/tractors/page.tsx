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
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { tractorAPI, Tractor as TractorModel } from '@/lib/api/tractors';
import { brandAPI, Brand } from '@/lib/api/brands';
import { tractorFamilyAPI, TractorFamily } from '@/lib/api/tractorFamilies';

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
  const [families, setFamilies] = useState<TractorFamily[]>([]);
  const [loadingFamilies, setLoadingFamilies] = useState(false);
  const [isFamiliesExpanded, setIsFamiliesExpanded] = useState(true);
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
  const [showMobileFilterModal, setShowMobileFilterModal] = useState(false);
  const [showMobileSortModal, setShowMobileSortModal] = useState(false);
  const [brandSearchInput, setBrandSearchInput] = useState('');

  // Lock body scroll when mobile modals are active
  useEffect(() => {
    if (showMobileFilterModal || showMobileSortModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showMobileFilterModal, showMobileSortModal]);

  // Escape key closes modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowMobileFilterModal(false);
        setShowMobileSortModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  // 1.75 Fetch Families for Selected Brand
  useEffect(() => {
    if (!selectedBrand) {
      setFamilies([]);
      setSelectedFamily('');
      return;
    }

    let isMounted = true;
    const fetchFamilies = async () => {
      setLoadingFamilies(true);
      try {
        const res = await tractorFamilyAPI.getFamiliesByBrand(selectedBrand as number, {
          isActive: 'true',
          limit: 100,
        });
        if (isMounted && res.success) {
          const items = res.data?.items || [];
          setFamilies(items);
        }
      } catch (err) {
        console.error('Failed to load tractor families', err);
        if (isMounted) setFamilies([]);
      } finally {
        if (isMounted) setLoadingFamilies(false);
      }
    };

    fetchFamilies();
    return () => {
      isMounted = false;
    };
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
      selectedFamily !== '',
      selectedHp !== '',
      selectedDrive !== '',
      selectedFuel !== '',
      selectedPrice !== '',
      searchQuery.trim() !== '',
    ].filter(Boolean).length;
  }, [selectedBrand, selectedFamily, selectedHp, selectedDrive, selectedFuel, selectedPrice, searchQuery]);

  const currentSortLabel = useMemo(() => {
    switch (sortBy) {
      case 'price_asc':
        return 'Price: Low to High';
      case 'price_desc':
        return 'Price: High to Low';
      case 'hp_desc':
        return 'HP: High to Low';
      case 'hp_asc':
        return 'HP: Low to High';
      default:
        return 'Featured';
    }
  }, [sortBy]);

  const handleSelectFamily = (familyId: number | '') => {
    const nextFamily = selectedFamily === familyId ? '' : familyId;
    setSelectedFamily(nextFamily);
    setPage(1);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (nextFamily !== '') {
        url.searchParams.set('family', String(nextFamily));
      } else {
        url.searchParams.delete('family');
      }
      window.history.replaceState(null, '', url.pathname + (url.search ? url.search : ''));
    }
  };

  const handleClearAll = () => {
    setSelectedBrand('');
    setSelectedFamily('');
    setSelectedHp('');
    setSelectedDrive('');
    setSelectedFuel('');
    setSelectedPrice('');
    setSearchQuery('');
    setPage(1);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.pathname);
    }
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
    <div className="animate-fade-in mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-3.5 pt-0 sm:pt-1 lg:pt-2 pb-24 sm:px-6 lg:px-8">
      {/* ===================== HERO / BANNER SECTION ===================== */}
      {activeBrandDetails ? (
        <div className="relative mb-5 sm:mb-8 md:mb-10 overflow-hidden rounded-[24px] sm:rounded-[30px] md:rounded-[2.5rem] border border-black/10 dark:border-white/10 bg-gradient-to-br from-emerald-500/10 via-white/80 to-amber-500/10 dark:from-emerald-950/40 dark:via-[#111713]/90 dark:to-amber-950/30 p-4 sm:p-6 md:p-10 lg:p-12 shadow-lg dark:shadow-2xl backdrop-blur-xl">
          {/* Ambient Glows */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 sm:h-96 w-72 sm:w-96 rounded-full bg-[var(--color-brand-green)]/20 dark:bg-[var(--color-brand-green)]/25 blur-[90px]" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-60 sm:h-80 w-60 sm:w-80 rounded-full bg-[var(--color-brand-orange)]/15 dark:bg-[var(--color-brand-orange)]/20 blur-[80px]" />

          <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-6 md:flex-row md:items-start">
            {/* Brand Logo Box */}
            <div className="group relative flex h-20 w-20 sm:h-28 sm:w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl md:rounded-[2rem] border border-black/10 dark:border-white/10 bg-white/95 dark:bg-[#151c17] p-3 sm:p-4 shadow-md md:h-40 md:w-40">
              {activeBrandDetails.logoUrl ? (
                <img
                  src={activeBrandDetails.logoUrl}
                  alt={activeBrandDetails.name}
                  className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <span className="text-foreground/30 text-3xl sm:text-4xl md:text-5xl font-black">
                  {activeBrandDetails.name.charAt(0)}
                </span>
              )}
            </div>

            {/* Brand Details */}
            <div className="flex flex-1 flex-col items-center text-center md:items-start md:text-left">
              <div className="mb-1.5 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 md:justify-start">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-black tracking-wider text-[var(--color-brand-green)] uppercase">
                  <Sparkles size={11} className="sm:size-[12px]" /> Official Partner
                </span>
                {activeBrandDetails.isFeatured && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-black tracking-wider text-amber-600 uppercase dark:text-amber-400">
                    <Star size={11} className="fill-current sm:size-[12px]" /> Featured
                  </span>
                )}
                {activeBrandDetails.country && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold text-foreground/80 uppercase">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-brand-orange)]" />
                    {activeBrandDetails.country}
                  </span>
                )}
                {activeBrandDetails.foundedYear && (
                  <span className="inline-flex items-center rounded-full border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold text-foreground/80">
                    Est. {activeBrandDetails.foundedYear}
                  </span>
                )}
              </div>

              <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                {activeBrandDetails.name} Tractors
              </h1>

              {activeBrandDetails.aboutBrand && (
                <div
                  className="text-muted custom-scrollbar mt-2 max-h-20 sm:max-h-24 max-w-3xl overflow-y-auto pr-2 text-xs sm:text-sm leading-relaxed font-medium md:text-base line-clamp-2 md:line-clamp-none"
                  dangerouslySetInnerHTML={{ __html: activeBrandDetails.aboutBrand }}
                />
              )}

              <div className="mt-3 sm:mt-5 flex items-center gap-2.5 sm:gap-3">
                <span className="rounded-full bg-[var(--color-brand-green)] px-3 py-0.5 sm:px-3.5 sm:py-1 text-[11px] sm:text-xs font-black text-white shadow-sm">
                  {totalTractors} Models Available
                </span>
                <button
                  onClick={() => {
                    setSelectedBrand('');
                    setPage(1);
                  }}
                  className="inline-flex items-center gap-1 rounded-full border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/10 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs font-bold text-foreground/80 hover:bg-black/5 dark:hover:bg-white/15 transition-colors"
                >
                  <X size={12} className="sm:size-[13px]" /> View All Brands
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative mb-5 sm:mb-8 md:mb-10 overflow-hidden rounded-[24px] sm:rounded-[30px] md:rounded-[2.5rem] border border-black/10 dark:border-white/10 bg-gradient-to-br from-emerald-500/10 via-white/80 to-amber-500/10 dark:from-emerald-950/40 dark:via-[#111713]/90 dark:to-amber-950/30 p-4 sm:p-6 md:p-10 lg:p-12 shadow-lg dark:shadow-2xl backdrop-blur-xl">
          {/* Ambient Glows */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 sm:h-96 w-72 sm:w-96 rounded-full bg-[var(--color-brand-green)]/20 dark:bg-[var(--color-brand-green)]/25 blur-[90px]" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-60 sm:h-80 w-60 sm:w-80 rounded-full bg-[var(--color-brand-orange)]/15 dark:bg-[var(--color-brand-orange)]/20 blur-[80px]" />

          <div className="relative z-10 flex flex-col items-start justify-between gap-4 sm:gap-6 lg:flex-row lg:items-center">
            {/* Left Content */}
            <div className="flex w-full max-w-3xl flex-col gap-2 sm:gap-3">
              {/* Top Row: Official Badge + Mobile Metric Pill */}
              <div className="flex w-full items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 self-start rounded-full border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 px-2.5 py-0.5 sm:px-3.5 sm:py-1 text-[10px] sm:text-xs font-black tracking-wider text-[var(--color-brand-green)] uppercase">
                  <Sparkles size={11} className="sm:size-[13px]" /> Official Tractor Directory 2026
                </div>
                {/* Mobile-only compact metric pill */}
                <span className="inline-flex lg:hidden items-center gap-1 rounded-full bg-[var(--color-brand-green)]/15 border border-[var(--color-brand-green)]/30 px-2.5 py-0.5 text-[10.5px] font-black text-[var(--color-brand-green)] shrink-0">
                  <Tractor size={12} /> {totalTractors} Tractors
                </span>
              </div>

              <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-4xl lg:text-5xl leading-tight">
                Explore{' '}
                <span className="bg-gradient-to-r from-[var(--color-brand-green)] via-emerald-600 to-[var(--color-brand-orange)] bg-clip-text text-transparent">
                  Tractors
                </span>
              </h1>

              <p className="text-muted text-xs sm:text-base font-medium leading-relaxed sm:text-lg line-clamp-2 md:line-clamp-none">
                Discover India's most powerful, reliable tractors. Compare horsepower, drive types,
                and transparent ex-showroom pricing for your farmland.
              </p>

              {/* Quick Filter Shortcuts (Horizontal scrollable on mobile, wrapping on desktop) */}
              <div className="mt-1 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5 max-w-full -mx-1 px-1 sm:mx-0 sm:px-0 sm:flex-wrap">
                <span className="text-muted text-[10px] sm:text-xs font-bold tracking-wider uppercase shrink-0">
                  Quick Filters:
                </span>
                <button
                  onClick={() => {
                    setSelectedPrice(selectedPrice === 'under5' ? '' : 'under5');
                    setPage(1);
                  }}
                  className={`shrink-0 whitespace-nowrap rounded-full px-2.5 sm:px-3.5 py-1 text-[11px] sm:text-xs font-bold transition-all ${
                    selectedPrice === 'under5'
                      ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
                      : 'border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 text-foreground/80 hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5"><Zap size={12} className="text-amber-500 shrink-0" /> Under ₹5 Lakh</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedHp(selectedHp === 'over50' ? '' : 'over50');
                    setPage(1);
                  }}
                  className={`shrink-0 whitespace-nowrap rounded-full px-2.5 sm:px-3.5 py-1 text-[11px] sm:text-xs font-bold transition-all ${
                    selectedHp === 'over50'
                      ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
                      : 'border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 text-foreground/80 hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5"><Gauge size={12} className="text-blue-500 shrink-0" /> 50+ HP Heavy</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedDrive(selectedDrive === 'FOUR_WD' ? '' : 'FOUR_WD');
                    setPage(1);
                  }}
                  className={`shrink-0 whitespace-nowrap rounded-full px-2.5 sm:px-3.5 py-1 text-[11px] sm:text-xs font-bold transition-all ${
                    selectedDrive === 'FOUR_WD'
                      ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
                      : 'border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 text-foreground/80 hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5"><Tractor size={12} className="text-[var(--color-brand-green)] shrink-0" /> 4WD Drive</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedHp(selectedHp === '30to50' ? '' : '30to50');
                    setPage(1);
                  }}
                  className={`shrink-0 whitespace-nowrap rounded-full px-2.5 sm:px-3.5 py-1 text-[11px] sm:text-xs font-bold transition-all ${
                    selectedHp === '30to50'
                      ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
                      : 'border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 text-foreground/80 hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5"><SlidersHorizontal size={12} className="text-emerald-500 shrink-0" /> 30-50 HP Utility</span>
                </button>
              </div>
            </div>

            {/* Right Metric Box: Shown on Desktop, seamlessly complements layout */}
            <div className="z-10 hidden lg:flex shrink-0 items-center gap-4 rounded-3xl border border-black/8 dark:border-white/10 bg-white/80 dark:bg-[#151c17]/90 p-5 shadow-lg backdrop-blur-md">
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

      {/* ===================== BRAND SERIES & FAMILIES STRIP ===================== */}
      {selectedBrand !== '' && (loadingFamilies || families.length > 0) && (
        <div className="animate-fade-in mb-6 flex flex-col gap-3 rounded-[24px] sm:rounded-[2rem] border border-black/8 dark:border-white/10 bg-white/85 dark:bg-[#121814]/90 p-4 sm:p-5 shadow-sm backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-brand-green)]/15 text-[var(--color-brand-green)]">
                <Layers size={17} />
              </div>
              <h2 className="text-sm sm:text-base font-black text-foreground">
                {activeBrandDetails?.name ? `${activeBrandDetails.name} Series & Families` : 'Tractor Families'}
              </h2>
              {families.length > 0 && (
                <span className="rounded-full bg-[var(--color-brand-green)]/10 px-2.5 py-0.5 text-[11px] font-black text-[var(--color-brand-green)]">
                  {families.length} Series
                </span>
              )}
            </div>

            {selectedFamily !== '' && (
              <button
                type="button"
                onClick={() => handleSelectFamily('')}
                className="text-xs font-bold text-muted hover:text-[var(--color-brand-orange)] transition-colors underline underline-offset-2 cursor-pointer"
              >
                View All {activeBrandDetails?.name || ''} Models
              </button>
            )}
          </div>

          {/* Horizontal Scrollable Families Pills (Touch-optimized for Mobile) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-1 px-1 sm:mx-0 sm:px-0">
            {loadingFamilies ? (
              <div className="flex items-center gap-2 py-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-9 w-28 animate-pulse rounded-full bg-black/5 dark:bg-white/5 shrink-0" />
                ))}
              </div>
            ) : families.length > 0 ? (
              <>
                {/* All Models Pill */}
                <button
                  type="button"
                  onClick={() => handleSelectFamily('')}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    selectedFamily === ''
                      ? 'bg-[var(--color-brand-green)] text-white shadow-md shadow-[var(--color-brand-green)]/20 ring-2 ring-[var(--color-brand-green)]/40'
                      : 'border border-black/8 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] text-foreground/80 hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  <span>All {activeBrandDetails?.name || 'Brand'} Models</span>
                  {selectedFamily === '' && <Check size={13} strokeWidth={2.5} />}
                </button>

                {/* Individual Families */}
                {families.map((family) => {
                  const isSelected = selectedFamily === family.id;
                  return (
                    <button
                      key={family.id}
                      type="button"
                      onClick={() => handleSelectFamily(family.id)}
                      className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? 'bg-[var(--color-brand-green)] text-white shadow-md shadow-[var(--color-brand-green)]/20 ring-2 ring-[var(--color-brand-green)]/40'
                          : 'border border-black/8 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] text-foreground/80 hover:bg-black/5 dark:hover:bg-white/10 hover:border-[var(--color-brand-green)]/40'
                      }`}
                    >
                      {family.logoUrl && (
                        <img src={family.logoUrl} alt="" className="h-4 w-4 object-contain rounded-full bg-white/80" />
                      )}
                      <span>{family.name}</span>
                      {family.tractorCount !== undefined && family.tractorCount > 0 && (
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-black/5 dark:bg-white/10 text-muted'
                          }`}
                        >
                          {family.tractorCount}
                        </span>
                      )}
                      {isSelected && <Check size={13} strokeWidth={2.5} />}
                    </button>
                  );
                })}
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* ===================== MOBILE QUICK FILTERS STRIP (Visible only on Mobile) ===================== */}
      <div className="mb-4 flex w-full items-center gap-2 overflow-x-auto no-scrollbar py-1 lg:hidden">
        {/* All Filters Button */}
        <button
          type="button"
          onClick={() => setShowMobileFilterModal(true)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-black/10 dark:border-white/15 bg-white/95 dark:bg-[#151c17] px-3.5 py-2 text-xs font-black text-foreground shadow-sm backdrop-blur-md active:scale-95 transition-all cursor-pointer"
        >
          <SlidersHorizontal size={14} className="text-[var(--color-brand-green)]" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-brand-green)] px-1 text-[10px] font-black text-white">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* HP Pills */}
        <button
          type="button"
          onClick={() => {
            setSelectedHp(selectedHp === 'under30' ? '' : 'under30');
            setPage(1);
          }}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            selectedHp === 'under30'
              ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
              : 'border border-black/8 dark:border-white/10 bg-white/80 dark:bg-white/5 text-foreground/80'
          }`}
        >
          <span>&lt; 30 HP</span>
          {selectedHp === 'under30' && <X size={12} strokeWidth={2.5} />}
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedHp(selectedHp === '30to50' ? '' : '30to50');
            setPage(1);
          }}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            selectedHp === '30to50'
              ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
              : 'border border-black/8 dark:border-white/10 bg-white/80 dark:bg-white/5 text-foreground/80'
          }`}
        >
          <span>30-50 HP</span>
          {selectedHp === '30to50' && <X size={12} strokeWidth={2.5} />}
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedHp(selectedHp === 'over50' ? '' : 'over50');
            setPage(1);
          }}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            selectedHp === 'over50'
              ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
              : 'border border-black/8 dark:border-white/10 bg-white/80 dark:bg-white/5 text-foreground/80'
          }`}
        >
          <span>&gt; 50 HP</span>
          {selectedHp === 'over50' && <X size={12} strokeWidth={2.5} />}
        </button>

        {/* Drive Type Pills */}
        <button
          type="button"
          onClick={() => {
            setSelectedDrive(selectedDrive === 'TWO_WD' ? '' : 'TWO_WD');
            setPage(1);
          }}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            selectedDrive === 'TWO_WD'
              ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
              : 'border border-black/8 dark:border-white/10 bg-white/80 dark:bg-white/5 text-foreground/80'
          }`}
        >
          <span>2WD</span>
          {selectedDrive === 'TWO_WD' && <X size={12} strokeWidth={2.5} />}
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedDrive(selectedDrive === 'FOUR_WD' ? '' : 'FOUR_WD');
            setPage(1);
          }}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            selectedDrive === 'FOUR_WD'
              ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
              : 'border border-black/8 dark:border-white/10 bg-white/80 dark:bg-white/5 text-foreground/80'
          }`}
        >
          <span>4WD</span>
          {selectedDrive === 'FOUR_WD' && <X size={12} strokeWidth={2.5} />}
        </button>

        {/* Budget Pills */}
        <button
          type="button"
          onClick={() => {
            setSelectedPrice(selectedPrice === 'under5' ? '' : 'under5');
            setPage(1);
          }}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            selectedPrice === 'under5'
              ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
              : 'border border-black/8 dark:border-white/10 bg-white/80 dark:bg-white/5 text-foreground/80'
          }`}
        >
          <span>&lt; ₹5 Lakh</span>
          {selectedPrice === 'under5' && <X size={12} strokeWidth={2.5} />}
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedPrice(selectedPrice === '5to10' ? '' : '5to10');
            setPage(1);
          }}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            selectedPrice === '5to10'
              ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
              : 'border border-black/8 dark:border-white/10 bg-white/80 dark:bg-white/5 text-foreground/80'
          }`}
        >
          <span>₹5 - 10 Lakh</span>
          {selectedPrice === '5to10' && <X size={12} strokeWidth={2.5} />}
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedPrice(selectedPrice === 'over10' ? '' : 'over10');
            setPage(1);
          }}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            selectedPrice === 'over10'
              ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
              : 'border border-black/8 dark:border-white/10 bg-white/80 dark:bg-white/5 text-foreground/80'
          }`}
        >
          <span>&gt; ₹10 Lakh</span>
          {selectedPrice === 'over10' && <X size={12} strokeWidth={2.5} />}
        </button>

        {/* Clear All pill on Mobile if any filters active */}
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-500/10 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <RotateCcw size={12} /> Clear
          </button>
        )}
      </div>

      {/* ===================== MAIN CONTENT & SIDEBAR ===================== */}
      <div className="flex flex-col items-start gap-8 lg:flex-row w-full">
        {/* ===================== DESKTOP SIDEBAR FILTERS ===================== */}
        <aside className="hidden lg:block w-full flex-shrink-0 lg:w-72">
          <div className="lg:sticky lg:top-28 flex flex-col gap-6 rounded-[2rem] border border-black/8 dark:border-white/10 bg-white/90 dark:bg-[#121814]/90 p-6 shadow-xl backdrop-blur-xl">
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

            {/* Filter: Series / Families (when brand is selected) */}
            {selectedBrand !== '' && families.length > 0 && (
              <div className="flex flex-col gap-2.5 border-t border-black/5 dark:border-white/5 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted text-[11px] font-black tracking-widest uppercase">
                    Series / Family
                  </span>
                  {selectedFamily !== '' && (
                    <button
                      onClick={() => handleSelectFamily('')}
                      className="text-[10px] font-bold text-[var(--color-brand-orange)] hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="custom-scrollbar flex max-h-48 flex-col gap-1 overflow-y-auto pr-1">
                  <button
                    onClick={() => handleSelectFamily('')}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-bold transition-all ${
                      selectedFamily === ''
                        ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
                        : 'text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <span>All Families</span>
                    {selectedFamily === '' && <Check size={15} strokeWidth={2.5} />}
                  </button>

                  {families.map((family) => {
                    const isSelected = selectedFamily === family.id;
                    return (
                      <button
                        key={family.id}
                        onClick={() => handleSelectFamily(family.id)}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-bold transition-all ${
                          isSelected
                            ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
                            : 'text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                      >
                        <span className="truncate">{family.name}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {family.tractorCount !== undefined && family.tractorCount > 0 && (
                            <span className={`text-xs font-bold ${isSelected ? 'text-white/80' : 'text-muted'}`}>
                              ({family.tractorCount})
                            </span>
                          )}
                          {isSelected && <Check size={15} strokeWidth={2.5} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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
                          setSelectedFamily('');
                          setPage(1);
                          if (typeof window !== 'undefined') {
                            const url = new URL(window.location.href);
                            url.searchParams.delete('brand');
                            url.searchParams.delete('family');
                            window.history.replaceState(null, '', url.pathname + (url.search ? url.search : ''));
                          }
                        }}
                        className="hover:text-[var(--color-brand-orange)]"
                      >
                        <X size={12} strokeWidth={2.5} />
                      </button>
                    </span>
                  )}
                  {selectedFamily !== '' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-green)]/10 px-2.5 py-0.5 text-xs font-bold text-[var(--color-brand-green)]">
                      {families.find((f) => f.id === selectedFamily)?.name || 'Series'}
                      <button
                        onClick={() => handleSelectFamily('')}
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
                  suppressHydrationWarning
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
                  suppressHydrationWarning
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
                  suppressHydrationWarning
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
            <div className="flex flex-col items-center justify-center rounded-2xl sm:rounded-3xl border border-dashed border-black/10 dark:border-white/10 bg-white/40 dark:bg-[#121814]/40 p-6 sm:p-10 md:p-14 text-center backdrop-blur-md">
              <div className="mb-3 sm:mb-4 flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
                <Tractor size={28} className="sm:size-10" strokeWidth={1.5} />
              </div>
              <h3 className="text-foreground text-lg sm:text-2xl font-black">No Tractors Found</h3>
              <p className="text-muted mt-1 max-w-sm text-xs sm:text-sm font-medium">
                We couldn't find any tractors matching your current filters. Try resetting filters or
                adjusting search keywords.
              </p>
              <button
                onClick={handleClearAll}
                className="mt-4 sm:mt-6 flex items-center gap-2 rounded-full bg-[var(--color-brand-green)] px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-black text-white shadow-lg shadow-[var(--color-brand-green)]/25 transition-all hover:scale-105 active:scale-95"
              >
                <RotateCcw size={14} className="sm:size-4" /> Clear All Filters
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
                            className="h-full w-full object-contain p-2.5 transition-transform duration-500 group-hover/img:scale-108"
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
                          className="h-full w-full object-contain p-2.5 transition-transform duration-500 group-hover/img:scale-108"
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

      {/* ===================== MOBILE FILTER MODAL (DRAWER / BOTTOM SHEET) ===================== */}
      {showMobileFilterModal && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end lg:hidden animate-fade-in">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm -z-10"
            onClick={() => setShowMobileFilterModal(false)}
          />
          <div className="relative flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-[2.25rem] border-t border-black/10 dark:border-white/10 bg-background shadow-2xl animate-slide-up">
            {/* Grab Handle */}
            <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-foreground/20" />

            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-black/5 dark:border-white/5 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-brand-green)]/15 text-[var(--color-brand-green)]">
                  <SlidersHorizontal size={16} />
                </div>
                <h3 className="text-lg font-black tracking-tight text-foreground">Filters</h3>
                {activeFiltersCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-brand-green)] px-1.5 text-[10px] font-black text-white">
                    {activeFiltersCount}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-xs font-bold text-[var(--color-brand-orange)] hover:underline px-2 py-1 cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowMobileFilterModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/5 text-muted hover:text-foreground cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Scrollable Filter Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
              {/* SECTION 1: Series / Family */}
              {selectedBrand !== '' && families.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-muted text-[11px] font-black tracking-widest uppercase">
                      {activeBrandDetails?.name || 'Brand'} Series / Family
                    </span>
                    {selectedFamily !== '' && (
                      <button
                        type="button"
                        onClick={() => handleSelectFamily('')}
                        className="text-[11px] font-bold text-[var(--color-brand-orange)]"
                      >
                        Clear Family
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectFamily('')}
                      className={`flex items-center justify-between rounded-xl p-3 text-left text-xs font-bold transition-all cursor-pointer ${
                        selectedFamily === ''
                          ? 'border-2 border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]'
                          : 'border border-black/8 dark:border-white/10 bg-foreground/[0.02] text-foreground/80'
                      }`}
                    >
                      <span>All Models</span>
                      {selectedFamily === '' && <Check size={14} className="text-[var(--color-brand-green)]" />}
                    </button>

                    {families.map((family) => {
                      const isSelected = selectedFamily === family.id;
                      return (
                        <button
                          key={family.id}
                          type="button"
                          onClick={() => handleSelectFamily(family.id)}
                          className={`flex items-center justify-between rounded-xl p-3 text-left text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'border-2 border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] shadow-sm'
                              : 'border border-black/8 dark:border-white/10 bg-foreground/[0.02] text-foreground/80'
                          }`}
                        >
                          <div className="flex flex-col truncate pr-1">
                            <span className="truncate">{family.name}</span>
                            {family.tractorCount !== undefined && family.tractorCount > 0 && (
                              <span className="text-[10px] text-muted font-normal">
                                {family.tractorCount} Models
                              </span>
                            )}
                          </div>
                          {isSelected && <Check size={14} className="text-[var(--color-brand-green)] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION 2: Horsepower (HP) */}
              <div className="space-y-2.5">
                <span className="text-muted text-[11px] font-black tracking-widest uppercase">
                  Horsepower (HP Range)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: '', label: 'All HP Range', desc: 'Any Horsepower' },
                    { value: 'under30', label: '< 30 HP', desc: 'Mini & Orchard' },
                    { value: '30to50', label: '30 - 50 HP', desc: 'Utility & Farm' },
                    { value: 'over50', label: '> 50 HP', desc: 'Heavy Duty' },
                  ].map((hp) => {
                    const isSelected = selectedHp === hp.value;
                    return (
                      <button
                        key={hp.value}
                        type="button"
                        onClick={() => {
                          setSelectedHp(isSelected && hp.value !== '' ? '' : hp.value);
                          setPage(1);
                        }}
                        className={`flex flex-col rounded-xl p-3 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-2 border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] shadow-sm'
                            : 'border border-black/8 dark:border-white/10 bg-foreground/[0.02] text-foreground/80'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-black">{hp.label}</span>
                          {isSelected && <Check size={14} className="text-[var(--color-brand-green)]" />}
                        </div>
                        <span className="text-[10px] text-muted mt-0.5">{hp.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 3: Drive Type */}
              <div className="space-y-2.5">
                <span className="text-muted text-[11px] font-black tracking-widest uppercase">
                  Drive Type
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: '', label: 'All' },
                    { value: 'TWO_WD', label: '2WD' },
                    { value: 'FOUR_WD', label: '4WD' },
                  ].map((drive) => {
                    const isSelected = selectedDrive === drive.value;
                    return (
                      <button
                        key={drive.value}
                        type="button"
                        onClick={() => {
                          setSelectedDrive(isSelected && drive.value !== '' ? '' : drive.value);
                          setPage(1);
                        }}
                        className={`rounded-xl py-3 text-center text-xs font-black transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
                            : 'border border-black/8 dark:border-white/10 bg-foreground/[0.02] text-foreground/80'
                        }`}
                      >
                        {drive.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 4: Budget / Price Range */}
              <div className="space-y-2.5">
                <span className="text-muted text-[11px] font-black tracking-widest uppercase">
                  Budget / Price Range
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: '', label: 'All Price Ranges' },
                    { value: 'under5', label: 'Under ₹5 Lakh' },
                    { value: '5to10', label: '₹5 - 10 Lakh' },
                    { value: 'over10', label: 'Above ₹10 Lakh' },
                  ].map((price) => {
                    const isSelected = selectedPrice === price.value;
                    return (
                      <button
                        key={price.value}
                        type="button"
                        onClick={() => {
                          setSelectedPrice(isSelected && price.value !== '' ? '' : price.value);
                          setPage(1);
                        }}
                        className={`flex items-center justify-between rounded-xl p-3 text-left text-xs font-black transition-all cursor-pointer ${
                          isSelected
                            ? 'border-2 border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] shadow-sm'
                            : 'border border-black/8 dark:border-white/10 bg-foreground/[0.02] text-foreground/80'
                        }`}
                      >
                        <span>{price.label}</span>
                        {isSelected && <Check size={14} className="text-[var(--color-brand-green)]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 5: Brand Filter */}
              <div className="space-y-2.5">
                <span className="text-muted text-[11px] font-black tracking-widest uppercase">
                  Brand Selection
                </span>
                <div className="relative">
                  <Search size={14} className="text-muted absolute top-1/2 left-3 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search brand (Mahindra, Swaraj, etc.)..."
                    value={brandSearchInput}
                    onChange={(e) => setBrandSearchInput(e.target.value)}
                    className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-foreground/[0.03] py-2 pr-8 pl-9 text-xs font-bold text-foreground focus:outline-none focus:border-[var(--color-brand-green)]"
                  />
                  {brandSearchInput && (
                    <button
                      type="button"
                      onClick={() => setBrandSearchInput('')}
                      className="text-muted absolute top-1/2 right-2.5 -translate-y-1/2"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                <div className="custom-scrollbar max-h-40 overflow-y-auto space-y-1 pr-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBrand('');
                      setSelectedFamily('');
                      setPage(1);
                      if (typeof window !== 'undefined') {
                        const url = new URL(window.location.href);
                        url.searchParams.delete('brand');
                        url.searchParams.delete('family');
                        window.history.replaceState(null, '', url.pathname + (url.search ? url.search : ''));
                      }
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-bold transition-all cursor-pointer ${
                      selectedBrand === ''
                        ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
                        : 'text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <span>All Brands</span>
                    {selectedBrand === '' && <Check size={13} strokeWidth={2.5} />}
                  </button>

                  {brands
                    .filter((b) =>
                      !brandSearchInput || b.name.toLowerCase().includes(brandSearchInput.toLowerCase())
                    )
                    .map((b) => {
                      const isSelected = selectedBrand === b.id;
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => {
                            const nextBrand = isSelected ? '' : b.id;
                            setSelectedBrand(nextBrand);
                            setSelectedFamily('');
                            setPage(1);
                            if (typeof window !== 'undefined') {
                              const url = new URL(window.location.href);
                              if (nextBrand !== '') {
                                url.searchParams.set('brand', String(nextBrand));
                              } else {
                                url.searchParams.delete('brand');
                              }
                              url.searchParams.delete('family');
                              window.history.replaceState(null, '', url.pathname + (url.search ? url.search : ''));
                            }
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
                              : 'text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5'
                          }`}
                        >
                          <span className="truncate">{b.name}</span>
                          {isSelected && <Check size={13} strokeWidth={2.5} />}
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* SECTION 6: Fuel Type */}
              <div className="space-y-2.5">
                <span className="text-muted text-[11px] font-black tracking-widest uppercase">
                  Fuel Type
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: '', label: 'All Fuel Types' },
                    { value: 'DIESEL', label: 'Diesel' },
                    { value: 'ELECTRIC', label: 'Electric' },
                    { value: 'CNG', label: 'CNG' },
                  ].map((fuel) => {
                    const isSelected = selectedFuel === fuel.value;
                    return (
                      <button
                        key={fuel.value}
                        type="button"
                        onClick={() => {
                          setSelectedFuel(isSelected && fuel.value !== '' ? '' : fuel.value);
                          setPage(1);
                        }}
                        className={`rounded-xl py-2.5 text-center text-xs font-black transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
                            : 'border border-black/8 dark:border-white/10 bg-foreground/[0.02] text-foreground/80'
                        }`}
                      >
                        {fuel.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="flex shrink-0 items-center gap-3 border-t border-black/10 dark:border-white/10 bg-background/95 backdrop-blur-md p-4">
              <button
                type="button"
                onClick={handleClearAll}
                className="flex-1 rounded-full border border-black/10 dark:border-white/15 bg-foreground/5 py-3 text-xs font-black text-foreground hover:bg-foreground/10 transition-colors cursor-pointer"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setShowMobileFilterModal(false)}
                className="flex-[2] rounded-full bg-[var(--color-brand-green)] py-3 text-xs font-black text-white shadow-lg shadow-[var(--color-brand-green)]/25 hover:bg-[var(--color-brand-green-dark)] transition-all cursor-pointer"
              >
                Apply Filters ({totalTractors} Tractors)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MOBILE SORT MODAL ===================== */}
      {showMobileSortModal && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end lg:hidden animate-fade-in">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm -z-10"
            onClick={() => setShowMobileSortModal(false)}
          />
          <div className="relative flex w-full flex-col overflow-hidden rounded-t-[2.25rem] border-t border-black/10 dark:border-white/10 bg-background shadow-2xl animate-slide-up p-5 space-y-4">
            <div className="mx-auto h-1.5 w-12 rounded-full bg-foreground/20" />
            <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/5">
              <h3 className="text-base font-black text-foreground">Sort Tractors</h3>
              <button
                type="button"
                onClick={() => setShowMobileSortModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/5 text-muted hover:text-foreground cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-1">
              {[
                { value: 'featured', label: 'Featured (Default)' },
                { value: 'price_asc', label: 'Price: Low to High' },
                { value: 'price_desc', label: 'Price: High to Low' },
                { value: 'hp_desc', label: 'Horsepower: High to Low' },
                { value: 'hp_asc', label: 'Horsepower: Low to High' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setSortBy(opt.value as any);
                    setShowMobileSortModal(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl p-3 text-xs font-bold transition-all cursor-pointer ${
                    sortBy === opt.value
                      ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] font-black'
                      : 'text-foreground/80 hover:bg-foreground/5'
                  }`}
                >
                  <span>{opt.label}</span>
                  {sortBy === opt.value && <Check size={14} className="text-[var(--color-brand-green)]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================== MOBILE FLOATING ACTION BAR ===================== */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white/95 dark:bg-[#151c17]/95 px-5 py-2.5 shadow-2xl backdrop-blur-xl lg:hidden">
        <button
          type="button"
          onClick={() => setShowMobileFilterModal(true)}
          className="flex items-center gap-1.5 text-xs font-black text-foreground hover:text-[var(--color-brand-green)] transition-colors cursor-pointer"
        >
          <SlidersHorizontal size={15} className="text-[var(--color-brand-green)]" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-brand-green)] px-1 text-[10px] font-black text-white">
              {activeFiltersCount}
            </span>
          )}
        </button>

        <span className="h-4 w-px bg-foreground/15" />

        <button
          type="button"
          onClick={() => setShowMobileSortModal(true)}
          className="flex items-center gap-1.5 text-xs font-black text-foreground hover:text-[var(--color-brand-green)] transition-colors cursor-pointer"
        >
          <ArrowUpDown size={14} className="text-muted" />
          <span className="max-w-[120px] truncate">{currentSortLabel}</span>
        </button>
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
