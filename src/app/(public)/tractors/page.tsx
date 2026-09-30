'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  ChevronRight,
  Star,
  Tractor,
  Filter,
  X,
  Grid3X3,
  List,
  ChevronLeft,
} from 'lucide-react';
import { tractorAPI, Tractor as TractorModel } from '@/lib/api/tractors';
import { brandAPI, Brand } from '@/lib/api/brands';
import Pagination from '@/components/shared/Pagination';

function TractorsListingContent() {
  const searchParams = useSearchParams();
  const brandQuery = searchParams.get('brand');
  const familyQuery = searchParams.get('family');

  const [tractors, setTractors] = useState<TractorModel[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [activeBrandDetails, setActiveBrandDetails] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);

  // Filtering & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<number | ''>('');
  const [selectedFamily, setSelectedFamily] = useState<number | ''>('');
  const [selectedHp, setSelectedHp] = useState<string>('');
  const [selectedDrive, setSelectedDrive] = useState<string>('');
  const [selectedFuel, setSelectedFuel] = useState<string>('');
  const [selectedPrice, setSelectedPrice] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
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
    setPage(1);
  }, [brandQuery, familyQuery]);

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
    }, 400); // 400ms debounce
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
    <div className="animate-fade-in mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-4 pt-8 pb-24 sm:px-6 lg:px-8">
      {/* HEADER / HERO COMPACT */}
      {activeBrandDetails ? (
        <div className="relative mb-10 flex flex-col items-start gap-8 overflow-hidden rounded-[2.5rem] border border-[var(--border-subtle)] bg-gradient-to-r from-[var(--color-brand-green)]/10 to-[var(--color-brand-orange)]/10 p-8 md:p-12">
          <div className="absolute top-0 right-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-brand-green)]/20 blur-[80px]" />

          <div className="z-10 flex w-full flex-col items-center gap-8 md:flex-row md:items-start">
            {/* Brand Logo */}
            <div className="bg-background group relative flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-[2rem] border border-[var(--border-subtle)] p-6 shadow-sm md:h-40 md:w-40">
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
              <h1 className="text-foreground mb-2 text-4xl font-black tracking-tight md:text-5xl">
                {activeBrandDetails.name} Tractors
              </h1>

              <div className="mb-4 flex flex-wrap items-center justify-center gap-4 md:justify-start">
                {activeBrandDetails.isFeatured && (
                  <span className="flex items-center gap-1 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-bold tracking-wider text-yellow-600 uppercase dark:text-yellow-400">
                    <Star size={12} className="fill-current" /> Featured
                  </span>
                )}
                {activeBrandDetails.foundedYear && (
                  <span className="bg-background/60 text-muted rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs font-bold tracking-wider uppercase backdrop-blur-md">
                    Est. {activeBrandDetails.foundedYear}
                  </span>
                )}
                {activeBrandDetails.country && (
                  <span className="bg-background/60 text-muted flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs font-bold tracking-wider uppercase backdrop-blur-md">
                    <span className="h-2 w-2 rounded-full bg-[var(--color-brand-orange)]"></span>
                    {activeBrandDetails.country}
                  </span>
                )}
                <span className="rounded-full border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-3 py-1 text-xs font-bold tracking-wider text-[var(--color-brand-green)] uppercase">
                  {totalTractors} Tractors Found
                </span>
              </div>

              {activeBrandDetails.aboutBrand && (
                <div
                  className="text-muted custom-scrollbar max-h-24 max-w-4xl overflow-y-auto pr-2 text-sm leading-relaxed font-medium md:text-base"
                  dangerouslySetInnerHTML={{ __html: activeBrandDetails.aboutBrand }}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative mb-10 flex flex-col items-center justify-between overflow-hidden rounded-[2.5rem] border border-[var(--border-subtle)] bg-gradient-to-r from-[var(--color-brand-green)]/10 to-[var(--color-brand-orange)]/10 p-8 md:flex-row md:p-12">
          <div className="absolute top-0 right-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-brand-green)]/20 blur-[80px]" />
          <div className="z-10 flex flex-col gap-3">
            <h1 className="text-foreground text-4xl font-black tracking-tight md:text-5xl">
              Explore Tractors
            </h1>
            <p className="text-muted max-w-2xl text-lg font-bold">
              Find the most reliable and powerful machines for your farm. Browse through our premium
              catalog of tractors.
            </p>
          </div>

          {/* Total Count Badge */}
          <div className="bg-background/80 z-10 mt-6 flex flex-col items-center rounded-2xl border border-[var(--border-subtle)] px-6 py-4 backdrop-blur-md md:mt-0">
            <span className="text-3xl font-black text-[var(--color-brand-green)]">
              {totalTractors}
            </span>
            <span className="text-muted text-[10px] font-black tracking-widest uppercase">
              Tractors Found
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col items-start gap-8 lg:flex-row">
        {/* MOBILE FILTER TOGGLE */}
        <button
          className="bg-foreground/5 flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--border-subtle)] py-4 font-bold lg:hidden"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} /> {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>

        {/* SIDEBAR FILTERS */}
        <aside
          className={`flex w-full flex-shrink-0 flex-col gap-6 lg:w-72 ${showFilters ? 'flex' : 'hidden lg:flex'}`}
        >
          <div className="spatial-panel sticky top-24 flex flex-col gap-8 rounded-[2rem] p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black tracking-tight">Filters</h3>
              {(selectedBrand !== '' ||
                selectedFamily !== '' ||
                selectedHp !== '' ||
                selectedDrive !== '' ||
                selectedFuel !== '' ||
                selectedPrice !== '' ||
                searchQuery !== '') && (
                <button
                  onClick={() => {
                    setSelectedBrand('');
                    setSelectedFamily('');
                    setSelectedHp('');
                    setSelectedDrive('');
                    setSelectedFuel('');
                    setSelectedPrice('');
                    setSearchQuery('');
                    setPage(1);
                  }}
                  className="text-xs font-bold text-[var(--color-brand-orange)] hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Filter: Search */}
            <div className="flex flex-col gap-3">
              <span className="text-muted text-xs font-black tracking-widest uppercase">
                Search
              </span>
              <div className="relative">
                <Search size={16} className="text-muted absolute top-1/2 left-3 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Model name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="bg-background w-full rounded-xl border border-[var(--border-subtle)] py-3 pr-4 pl-10 text-sm font-bold transition-colors focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                />
              </div>
            </div>

            {/* Filter: Brands */}
            <div className="flex flex-col gap-3">
              <span className="text-muted text-xs font-black tracking-widest uppercase">
                Brands
              </span>
              <div className="custom-scrollbar flex max-h-60 flex-col gap-2 overflow-y-auto pr-2">
                <label
                  className="group flex cursor-pointer items-center gap-3"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedBrand('');
                    setSelectedFamily('');
                    setPage(1);
                  }}
                >
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${selectedBrand === '' ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]' : 'border-[var(--border-subtle)] group-hover:border-[var(--color-brand-green)]'}`}
                  >
                    {selectedBrand === '' && <div className="h-2.5 w-2.5 rounded-sm bg-white" />}
                  </div>
                  <span
                    className={`text-sm font-bold ${selectedBrand === '' ? 'text-foreground' : 'text-muted group-hover:text-foreground'}`}
                  >
                    All Brands
                  </span>
                </label>

                {brands.map((brand) => (
                  <label
                    key={brand.id}
                    className="group flex cursor-pointer items-center gap-3"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedBrand(brand.id);
                      setSelectedFamily('');
                      setPage(1);
                    }}
                  >
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${selectedBrand === brand.id ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]' : 'border-[var(--border-subtle)] group-hover:border-[var(--color-brand-green)]'}`}
                    >
                      {selectedBrand === brand.id && (
                        <div className="h-2.5 w-2.5 rounded-sm bg-white" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-bold ${selectedBrand === brand.id ? 'text-foreground' : 'text-muted group-hover:text-foreground'}`}
                    >
                      {brand.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter: HP Range */}
            <div className="flex flex-col gap-3">
              <span className="text-muted text-xs font-black tracking-widest uppercase">
                HP Range
              </span>
              <div className="flex flex-col gap-2">
                {[
                  { value: '', label: 'Any HP' },
                  { value: 'under30', label: 'Under 30 HP (Mini)' },
                  { value: '30to50', label: '30 - 50 HP (Utility)' },
                  { value: 'over50', label: 'Above 50 HP (Heavy)' },
                ].map((hp) => (
                  <label
                    key={hp.value}
                    className="group flex cursor-pointer items-center gap-3"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedHp(hp.value);
                      setPage(1);
                    }}
                  >
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${selectedHp === hp.value ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]' : 'border-[var(--border-subtle)] group-hover:border-[var(--color-brand-green)]'}`}
                    >
                      {selectedHp === hp.value && (
                        <div className="h-2.5 w-2.5 rounded-sm bg-white" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-bold ${selectedHp === hp.value ? 'text-foreground' : 'text-muted group-hover:text-foreground'}`}
                    >
                      {hp.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter: Drive Type */}
            <div className="flex flex-col gap-3">
              <span className="text-muted text-xs font-black tracking-widest uppercase">
                Drive Type
              </span>
              <div className="flex flex-col gap-2">
                {[
                  { value: '', label: 'All Types' },
                  { value: 'TWO_WD', label: '2WD' },
                  { value: 'FOUR_WD', label: '4WD' },
                ].map((drive) => (
                  <label
                    key={drive.value}
                    className="group flex cursor-pointer items-center gap-3"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedDrive(drive.value);
                      setPage(1);
                    }}
                  >
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${selectedDrive === drive.value ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]' : 'border-[var(--border-subtle)] group-hover:border-[var(--color-brand-green)]'}`}
                    >
                      {selectedDrive === drive.value && (
                        <div className="h-2.5 w-2.5 rounded-sm bg-white" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-bold ${selectedDrive === drive.value ? 'text-foreground' : 'text-muted group-hover:text-foreground'}`}
                    >
                      {drive.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter: Fuel Type */}
            <div className="flex flex-col gap-3">
              <span className="text-muted text-xs font-black tracking-widest uppercase">
                Fuel Type
              </span>
              <div className="flex flex-col gap-2">
                {[
                  { value: '', label: 'All Fuel' },
                  { value: 'DIESEL', label: 'Diesel' },
                  { value: 'ELECTRIC', label: 'Electric' },
                  { value: 'CNG', label: 'CNG' },
                ].map((fuel) => (
                  <label
                    key={fuel.value}
                    className="group flex cursor-pointer items-center gap-3"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedFuel(fuel.value);
                      setPage(1);
                    }}
                  >
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${selectedFuel === fuel.value ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]' : 'border-[var(--border-subtle)] group-hover:border-[var(--color-brand-green)]'}`}
                    >
                      {selectedFuel === fuel.value && (
                        <div className="h-2.5 w-2.5 rounded-sm bg-white" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-bold ${selectedFuel === fuel.value ? 'text-foreground' : 'text-muted group-hover:text-foreground'}`}
                    >
                      {fuel.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter: Price Range */}
            <div className="flex flex-col gap-3">
              <span className="text-muted text-xs font-black tracking-widest uppercase">
                Price Range
              </span>
              <div className="flex flex-col gap-2">
                {[
                  { value: '', label: 'Any Price' },
                  { value: 'under5', label: 'Under ₹ 5 Lakh' },
                  { value: '5to10', label: '₹ 5 - 10 Lakh' },
                  { value: 'over10', label: 'Above ₹ 10 Lakh' },
                ].map((price) => (
                  <label
                    key={price.value}
                    className="group flex cursor-pointer items-center gap-3"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedPrice(price.value);
                      setPage(1);
                    }}
                  >
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${selectedPrice === price.value ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]' : 'border-[var(--border-subtle)] group-hover:border-[var(--color-brand-green)]'}`}
                    >
                      {selectedPrice === price.value && (
                        <div className="h-2.5 w-2.5 rounded-sm bg-white" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-bold ${selectedPrice === price.value ? 'text-foreground' : 'text-muted group-hover:text-foreground'}`}
                    >
                      {price.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex w-full min-w-0 flex-1 flex-col gap-6">
          {/* Top Bar Actions */}
          <div className="bg-background/50 flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-[var(--border-subtle)] p-4 backdrop-blur-md">
            <div className="flex flex-col gap-2">
              <p className="text-muted text-sm font-bold">
                Showing <span className="text-foreground">{tractors.length}</span> results on this
                page
              </p>

              {/* Active Filter Chips */}
              {(selectedBrand !== '' ||
                selectedHp !== '' ||
                selectedDrive !== '' ||
                selectedFuel !== '' ||
                selectedPrice !== '') && (
                <div className="mt-1 flex flex-wrap gap-2">
                  {selectedBrand !== '' && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-green)]/10 px-3 py-1 text-xs font-bold text-[var(--color-brand-green)]">
                      {brands.find((b) => b.id === selectedBrand)?.name || 'Brand'}
                      <button
                        onClick={() => {
                          setSelectedBrand('');
                          setPage(1);
                        }}
                        className="hover:text-[var(--color-brand-orange)]"
                      >
                        <X size={12} strokeWidth={3} />
                      </button>
                    </span>
                  )}
                  {selectedHp !== '' && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-green)]/10 px-3 py-1 text-xs font-bold text-[var(--color-brand-green)]">
                      {selectedHp === 'under30'
                        ? 'Under 30 HP'
                        : selectedHp === '30to50'
                          ? '30 - 50 HP'
                          : 'Above 50 HP'}
                      <button
                        onClick={() => {
                          setSelectedHp('');
                          setPage(1);
                        }}
                        className="hover:text-[var(--color-brand-orange)]"
                      >
                        <X size={12} strokeWidth={3} />
                      </button>
                    </span>
                  )}
                  {selectedDrive !== '' && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-green)]/10 px-3 py-1 text-xs font-bold text-[var(--color-brand-green)]">
                      {selectedDrive === 'TWO_WD' ? '2WD' : '4WD'}
                      <button
                        onClick={() => {
                          setSelectedDrive('');
                          setPage(1);
                        }}
                        className="hover:text-[var(--color-brand-orange)]"
                      >
                        <X size={12} strokeWidth={3} />
                      </button>
                    </span>
                  )}
                  {selectedFuel !== '' && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-green)]/10 px-3 py-1 text-xs font-bold text-[var(--color-brand-green)]">
                      {selectedFuel === 'DIESEL'
                        ? 'Diesel'
                        : selectedFuel === 'ELECTRIC'
                          ? 'Electric'
                          : 'CNG'}
                      <button
                        onClick={() => {
                          setSelectedFuel('');
                          setPage(1);
                        }}
                        className="hover:text-[var(--color-brand-orange)]"
                      >
                        <X size={12} strokeWidth={3} />
                      </button>
                    </span>
                  )}
                  {selectedPrice !== '' && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-green)]/10 px-3 py-1 text-xs font-bold text-[var(--color-brand-green)]">
                      {selectedPrice === 'under5'
                        ? 'Under ₹ 5L'
                        : selectedPrice === '5to10'
                          ? '₹ 5L - 10L'
                          : 'Above ₹ 10L'}
                      <button
                        onClick={() => {
                          setSelectedPrice('');
                          setPage(1);
                        }}
                        className="hover:text-[var(--color-brand-orange)]"
                      >
                        <X size={12} strokeWidth={3} />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setSelectedBrand('');
                      setSelectedHp('');
                      setSelectedDrive('');
                      setSelectedFuel('');
                      setSelectedPrice('');
                      setSearchQuery('');
                      setPage(1);
                    }}
                    className="text-muted hover:text-foreground ml-2 text-xs font-bold underline underline-offset-2"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-xl p-2 transition-colors ${viewMode === 'grid' ? 'bg-[var(--color-brand-green)] text-white' : 'bg-foreground/5 text-muted hover:text-foreground'}`}
              >
                <Grid3X3 size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-xl p-2 transition-colors ${viewMode === 'list' ? 'bg-[var(--color-brand-green)] text-white' : 'bg-foreground/5 text-muted hover:text-foreground'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>

          {/* Grid Layout */}
          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-foreground/5 h-[400px] animate-pulse rounded-[2.5rem]" />
              ))}
            </div>
          ) : tractors.length === 0 ? (
            <div className="bg-foreground/5 flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-[var(--border-subtle)] p-20 text-center">
              <Tractor size={64} className="text-muted mb-4 opacity-30" strokeWidth={1} />
              <h3 className="text-foreground mb-2 text-2xl font-black">No tractors found</h3>
              <p className="text-muted font-medium">Try adjusting your filters or search query.</p>
              <button
                onClick={() => {
                  setSelectedBrand('');
                  setSelectedHp('');
                  setSelectedDrive('');
                  setSelectedFuel('');
                  setSelectedPrice('');
                  setSearchQuery('');
                  setPage(1);
                }}
                className="mt-6 rounded-xl bg-[var(--color-brand-green)] px-6 py-3 font-bold text-white shadow-[var(--color-brand-green)]/30 shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div
              className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
            >
              {tractors.map((tractor) => {
                const primaryImage =
                  tractor.media && tractor.media.length > 0
                    ? tractor.media.find((m) => m.isPrimary)?.url || tractor.media[0].url
                    : null;

                if (viewMode === 'list') {
                  return (
                    <Link
                      key={tractor.id}
                      href={`/tractors/${tractor.id}`}
                      className="spatial-card group bg-background flex flex-col gap-6 rounded-[2rem] p-6 transition-all duration-300 hover:border-[var(--color-brand-green)]/30 hover:shadow-xl sm:flex-row"
                    >
                      <div className="from-foreground/5 group/img relative flex h-48 w-full shrink-0 items-center justify-center overflow-hidden rounded-[1.5rem] bg-gradient-to-br to-transparent p-4 sm:w-64">
                        {tractor.isFeatured && (
                          <div className="absolute top-3 left-3 z-10 rounded-full bg-[var(--color-brand-orange)] px-2 py-1 text-[9px] font-black tracking-widest text-white uppercase">
                            Featured
                          </div>
                        )}
                        {primaryImage ? (
                          <img
                            src={primaryImage}
                            alt={tractor.modelName}
                            className="relative z-0 h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover/img:scale-110 dark:mix-blend-normal"
                          />
                        ) : (
                          <Tractor
                            className="text-foreground/20 h-16 w-16 transition-all duration-500 group-hover/img:scale-110"
                            strokeWidth={1}
                          />
                        )}
                      </div>

                      <div className="flex flex-1 flex-col py-2">
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            <p className="text-[10px] font-black tracking-[0.2em] text-[var(--color-brand-green)] uppercase">
                              {tractor.brand?.name}
                            </p>
                            <h3 className="text-foreground mt-1 text-2xl font-black transition-colors group-hover:text-[var(--color-brand-green)]">
                              {tractor.modelName}
                            </h3>
                          </div>
                          <div className="text-right">
                            <p className="text-muted mb-1 text-[11px] font-bold tracking-wider uppercase">
                              Starting Price
                            </p>
                            <p className="text-foreground text-2xl font-black tracking-tight">
                              {formatPrice(tractor.exShowroomPriceMin)}
                            </p>
                          </div>
                        </div>

                        <p className="text-muted mb-4 line-clamp-2 max-w-xl text-sm font-medium">
                          {tractor.overview ||
                            "Explore this premium tractor's massive capability, powerful engine, and unmatched reliability."}
                        </p>

                        <div className="mt-auto flex flex-wrap items-center gap-3">
                          <span className="bg-foreground/5 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold">
                            <div className="h-2 w-2 rounded-full bg-[var(--color-brand-green)]" />{' '}
                            {tractor.hp || '--'} HP
                          </span>
                          <span className="bg-foreground/5 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold">
                            <div className="h-2 w-2 rounded-full bg-[var(--color-brand-orange)]" />{' '}
                            {tractor.driveType === 'FOUR_WD' ? '4WD' : '2WD'}
                          </span>
                          <span className="bg-foreground/5 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold">
                            <div className="h-2 w-2 rounded-full bg-blue-500" />{' '}
                            {tractor.fuelType === 'DIESEL' ? 'Diesel' : tractor.fuelType}
                          </span>

                          <button className="ml-auto flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)]/10 px-5 py-2.5 text-sm font-black tracking-widest text-[var(--color-brand-green)] uppercase transition-colors hover:text-[var(--color-brand-orange)]">
                            View Details <ChevronRight size={16} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    </Link>
                  );
                }

                // Grid View
                return (
                  <Link
                    key={tractor.id}
                    href={`/tractors/${tractor.id}`}
                    className="spatial-card group bg-background relative flex cursor-pointer flex-col overflow-hidden rounded-[2.5rem] p-5 transition-all duration-500 hover:-translate-y-2 hover:border-[var(--color-brand-green)]/30 hover:shadow-[0_20px_40px_-10px_rgba(74,118,53,0.15)]"
                  >
                    {tractor.isFeatured && (
                      <div className="absolute top-7 right-7 z-10 rounded-full bg-[var(--color-brand-orange)] px-3 py-1.5 text-[9px] font-black tracking-widest text-white uppercase shadow-md">
                        Featured
                      </div>
                    )}

                    <div className="from-foreground/5 group/img relative mb-6 flex h-48 w-full items-center justify-center overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-gradient-to-br to-transparent p-4">
                      {primaryImage ? (
                        <img
                          src={primaryImage}
                          alt={tractor.modelName}
                          className="relative z-0 h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover/img:scale-110 dark:mix-blend-normal"
                        />
                      ) : (
                        <Tractor
                          className="text-foreground/20 h-24 w-24 transition-all duration-500 group-hover/img:scale-110"
                          strokeWidth={1}
                        />
                      )}
                    </div>

                    <div className="flex flex-col gap-3 px-2">
                      <div>
                        <p className="text-[10px] font-black tracking-[0.2em] text-[var(--color-brand-green)] uppercase">
                          {tractor.brand?.name}
                        </p>
                        <h3 className="text-foreground mt-1 truncate text-xl font-black tracking-tight md:text-2xl">
                          {tractor.modelName}
                        </h3>
                      </div>

                      <div className="mt-1 flex flex-wrap gap-2 text-[11px] font-bold">
                        <span className="bg-foreground/5 text-foreground rounded-md px-3 py-1.5">
                          {tractor.hp || '--'} HP
                        </span>
                        <span className="bg-foreground/5 text-foreground rounded-md px-3 py-1.5">
                          {tractor.driveType === 'FOUR_WD' ? '4WD' : '2WD'}
                        </span>
                        <span className="flex items-center gap-1 rounded-md bg-[var(--color-brand-orange)]/10 px-3 py-1.5 text-[var(--color-brand-orange)]">
                          ★ 4.8
                        </span>
                      </div>

                      <div className="mt-5 flex items-end justify-between border-t border-[var(--panel-border)] pt-5">
                        <div>
                          <p className="text-muted mb-1 text-[11px] font-bold tracking-wider uppercase">
                            Starting Price
                          </p>
                          <p className="text-foreground text-xl font-black tracking-tight md:text-[22px]">
                            {formatPrice(tractor.exShowroomPriceMin)}
                          </p>
                        </div>
                        <button className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-brand-green)] text-white shadow-[var(--color-brand-green)]/30 shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-12">
                          <ChevronRight size={20} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-12 mb-8 flex items-center justify-center gap-4">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${page === 1 ? 'bg-foreground/5 text-muted cursor-not-allowed' : 'bg-background border border-[var(--border-subtle)] hover:border-[var(--color-brand-green)] hover:text-[var(--color-brand-green)] hover:shadow-lg'}`}
              >
                <ChevronLeft size={20} strokeWidth={3} />
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  // Extremely simple logic for large number of pages
                  if (totalPages > 7) {
                    if (pageNum !== 1 && pageNum !== totalPages && Math.abs(page - pageNum) > 1) {
                      if (pageNum === 2 || pageNum === totalPages - 1)
                        return (
                          <span key={pageNum} className="text-muted px-1">
                            ...
                          </span>
                        );
                      return null;
                    }
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`h-12 w-12 rounded-full text-sm font-black transition-all ${page === pageNum ? 'scale-110 bg-[var(--color-brand-green)] text-white shadow-[var(--color-brand-green)]/30 shadow-lg' : 'text-muted hover:bg-foreground/5 hover:text-foreground bg-transparent'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${page === totalPages ? 'bg-foreground/5 text-muted cursor-not-allowed' : 'bg-background border border-[var(--border-subtle)] hover:border-[var(--color-brand-green)] hover:text-[var(--color-brand-green)] hover:shadow-lg'}`}
              >
                <ChevronRight size={20} strokeWidth={3} />
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
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-brand-green)] border-t-transparent"></div>
        </div>
      }
    >
      <TractorsListingContent />
    </Suspense>
  );
}
