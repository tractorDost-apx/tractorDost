'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  Search,
  ChevronRight,
  Filter,
  X,
  Grid3X3,
  List,
  ChevronLeft,
  Wrench,
  FileText,
  Video,
  Sparkles,
  AlertCircle,
  Tag,
  Gauge,
  Weight,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { implementAPI, Implement } from '@/lib/api/implements';
import { equipmentBrandAPI, EquipmentBrand } from '@/lib/api/equipmentBrands';
import { implementCategoryAPI, ImplementCategory } from '@/lib/api/implementCategories';
import { parseAdditionalSpecs } from './[id]/ImplementDetailsClient';

function ImplementsListingContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL Query Parameters
  const brandQuery = searchParams.get('brand');
  const categoryQuery = searchParams.get('category');
  const familyQuery = searchParams.get('family');
  const searchQueryParam = searchParams.get('search') || '';
  const hpQueryParam = searchParams.get('hp') || '';
  const usageQueryParam = searchParams.get('usage') || '';
  const priceQueryParam = searchParams.get('price') || '';
  const sortQueryParam = (searchParams.get('sort') as any) || 'newest';
  const pageQueryParam = parseInt(searchParams.get('page') || '1', 10);
  const viewQueryParam = (searchParams.get('view') as 'grid' | 'list') || 'grid';

  // Data States
  const [implementsList, setImplementsList] = useState<Implement[]>([]);
  const [equipmentBrands, setEquipmentBrands] = useState<EquipmentBrand[]>([]);
  const [categories, setCategories] = useState<ImplementCategory[]>([]);
  const [activeBrandDetails, setActiveBrandDetails] = useState<EquipmentBrand | null>(null);

  // UI & Loading States
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [invalidBrandSlug, setInvalidBrandSlug] = useState<string | null>(null);

  // Local Filter & Pagination States synchronized with URL
  const [searchQuery, setSearchQuery] = useState(searchQueryParam);
  const [selectedBrand, setSelectedBrand] = useState<number | ''>('');
  const [selectedFamily, setSelectedFamily] = useState<number | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [selectedHp, setSelectedHp] = useState<string>(hpQueryParam);
  const [selectedUsage, setSelectedUsage] = useState<string>(usageQueryParam);
  const [selectedPrice, setSelectedPrice] = useState<string>(priceQueryParam);
  const [sortBy, setSortBy] = useState<'newest' | 'priceLowHigh' | 'priceHighLow' | 'modelName'>(
    sortQueryParam
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(viewQueryParam);

  const [page, setPage] = useState(pageQueryParam);
  const [totalPages, setTotalPages] = useState(1);
  const [totalImplements, setTotalImplements] = useState(0);

  // Mobile filters toggle
  const [showFilters, setShowFilters] = useState(false);

  // 1. Helper to update URL query parameters without reloading
  const updateUrlParams = useCallback(
    (newParams: Record<string, string | number | null | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, value]) => {
        if (
          value === null ||
          value === undefined ||
          value === '' ||
          (value === 1 && key === 'page')
        ) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      const queryString = params.toString();
      router.replace(`${pathname}${queryString ? `?${queryString}` : ''}`, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  // 2. Fetch Brands and Categories metadata
  useEffect(() => {
    let isMounted = true;
    const fetchMetadata = async () => {
      try {
        const [brandsRes, categoriesRes] = await Promise.all([
          equipmentBrandAPI.getAllEquipmentBrands({ limit: 100, isActive: 'true' }),
          implementCategoryAPI.getAllActiveCategoriesFlat(),
        ]);

        if (isMounted) {
          if (brandsRes.success && brandsRes.data) {
            const loadedBrands = Array.isArray(brandsRes.data)
              ? brandsRes.data
              : (brandsRes.data as any).data || [];
            setEquipmentBrands(loadedBrands);
          }

          if (categoriesRes.success && categoriesRes.data) {
            setCategories(categoriesRes.data || []);
          }
        }
      } catch (err) {
        console.error('Failed to load implement metadata:', err);
      }
    };
    fetchMetadata();
    return () => {
      isMounted = false;
    };
  }, []);

  // 3. Resolve Selected Brand & Category from URL query params
  useEffect(() => {
    if (equipmentBrands.length === 0) return;

    if (brandQuery) {
      const normalizedBrandQuery = brandQuery.trim().toLowerCase();
      const matchedBrand = equipmentBrands.find(
        (b) =>
          b.slug.toLowerCase() === normalizedBrandQuery || String(b.id) === normalizedBrandQuery
      );

      if (matchedBrand) {
        setSelectedBrand(matchedBrand.id);
        setActiveBrandDetails(matchedBrand);
        setInvalidBrandSlug(null);
      } else {
        setSelectedBrand('');
        setActiveBrandDetails(null);
        setInvalidBrandSlug(brandQuery);
      }
    } else {
      setSelectedBrand('');
      setActiveBrandDetails(null);
      setInvalidBrandSlug(null);
    }
  }, [brandQuery, equipmentBrands]);

  useEffect(() => {
    if (categoryQuery) {
      const matchedCat = categories.find(
        (c) =>
          c.slug.toLowerCase() === categoryQuery.trim().toLowerCase() ||
          String(c.id) === categoryQuery
      );
      if (matchedCat) {
        setSelectedCategory(matchedCat.id);
      }
    } else {
      setSelectedCategory('');
    }
  }, [categoryQuery, categories]);

  // Sync state changes with URL query parameters
  useEffect(() => {
    setSearchQuery(searchQueryParam);
    setSelectedHp(hpQueryParam);
    setSelectedUsage(usageQueryParam);
    setSelectedPrice(priceQueryParam);
    setSortBy(sortQueryParam);
    setPage(pageQueryParam);
    setViewMode(viewQueryParam);

    if (familyQuery) {
      const parsedFamily = parseInt(familyQuery, 10);
      setSelectedFamily(!isNaN(parsedFamily) ? parsedFamily : '');
    } else {
      setSelectedFamily('');
    }
  }, [
    searchQueryParam,
    familyQuery,
    hpQueryParam,
    usageQueryParam,
    priceQueryParam,
    sortQueryParam,
    pageQueryParam,
    viewQueryParam,
  ]);

  // 4. Fetch Implements based on combined active criteria
  useEffect(() => {
    let isMounted = true;
    const fetchImplementsData = async () => {
      setLoading(true);
      setApiError(null);

      try {
        const params: any = {
          page,
          limit: 12,
          search: searchQuery,
          sortBy,
        };

        if (selectedBrand !== '') params.brandId = selectedBrand;
        if (selectedCategory !== '') params.categoryId = selectedCategory;
        if (selectedFamily !== '') params.familyId = selectedFamily;

        // HP Range logic
        if (selectedHp === 'under30') {
          params.hpMax = 30;
        } else if (selectedHp === '30to50') {
          params.hpMin = 30;
          params.hpMax = 50;
        } else if (selectedHp === 'over50') {
          params.hpMin = 50;
        }

        // Price Range logic
        if (selectedPrice === 'under50k') {
          params.priceMax = 50000;
        } else if (selectedPrice === '50kto1L') {
          params.priceMin = 50000;
          params.priceMax = 100000;
        } else if (selectedPrice === '1Lto2L') {
          params.priceMin = 100000;
          params.priceMax = 200000;
        } else if (selectedPrice === 'over2L') {
          params.priceMin = 200000;
        }

        if (selectedUsage !== '') {
          params.usageType = selectedUsage;
        }

        const res = await implementAPI.getAllImplements(params);

        if (isMounted) {
          if (res.success && res.data) {
            const payload = res.data;
            const items = payload.data || [];
            const pagination = payload.pagination || {
              total: payload.totalCount || items.length,
              page: payload.currentPage || page,
              totalPages: payload.totalPages || 1,
            };

            setImplementsList(items);
            setTotalPages(pagination.totalPages || 1);
            setTotalImplements(pagination.total || 0);
          } else {
            setImplementsList([]);
            setTotalPages(1);
            setTotalImplements(0);
          }
        }
      } catch (err: any) {
        console.error('Failed to load implements:', err);
        if (isMounted) {
          setApiError(
            err?.response?.data?.message || err?.message || 'Failed to fetch implements.'
          );
          setImplementsList([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchImplementsData();
    }, 350);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [
    page,
    searchQuery,
    selectedBrand,
    selectedCategory,
    selectedFamily,
    selectedHp,
    selectedUsage,
    selectedPrice,
    sortBy,
  ]);

  // Price Formatter Helper
  const formatPrice = (min?: number | null, max?: number | null) => {
    if (!min && !max) return 'Price on Request';

    const formatValue = (val: number) => {
      if (val >= 100000) return `₹ ${(val / 100000).toFixed(2)} Lakh`;
      return `₹ ${val.toLocaleString('en-IN')}`;
    };

    if (min && max && min !== max) {
      return `${formatValue(min)} - ${formatValue(max)}`;
    }
    return formatValue(min || max || 0);
  };

  // Helper to safely render dynamic additionalSpecs JSON on cards
  const renderDynamicSpecs = (additionalSpecs?: Record<string, any> | null) => {
    if (!additionalSpecs || typeof additionalSpecs !== 'object') return null;

    const grouped = parseAdditionalSpecs(additionalSpecs);
    const allSpecs = grouped.flatMap((g) => g.specs);

    if (allSpecs.length === 0) return null;

    return (
      <div className="mt-2 flex flex-wrap gap-1.5">
        {allSpecs.slice(0, 4).map((spec, idx) => (
          <span
            key={idx}
            className="bg-foreground/5 text-muted inline-flex max-w-[170px] items-center gap-1 truncate rounded-md border border-[var(--border-subtle)] px-2 py-0.5 text-[10px] font-bold"
            title={`${spec.name}: ${spec.value}${spec.unit ? ` ${spec.unit}` : ''}`}
          >
            <span className="truncate opacity-60">{spec.name}:</span>
            <span className="text-foreground truncate font-extrabold">
              {spec.value}
              {spec.unit ? ` ${spec.unit}` : ''}
            </span>
          </span>
        ))}
      </div>
    );
  };

  // Filter Reset Handler
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedBrand('');
    setSelectedFamily('');
    setSelectedCategory('');
    setSelectedHp('');
    setSelectedUsage('');
    setSelectedPrice('');
    setSortBy('newest');
    setPage(1);
    setInvalidBrandSlug(null);
    setActiveBrandDetails(null);

    router.replace(pathname, { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      updateUrlParams({ page: newPage });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="animate-fade-in mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-4 pt-8 pb-24 sm:px-6 lg:px-8">
      {/* BREADCRUMBS */}
      <nav className="text-muted mb-6 flex items-center gap-2 text-xs font-bold">
        <Link href="/" className="transition-colors hover:text-[var(--color-brand-green)]">
          Home
        </Link>
        <ChevronRight size={12} />
        <Link
          href="/implements"
          className="transition-colors hover:text-[var(--color-brand-green)]"
        >
          Implements
        </Link>
        {activeBrandDetails && (
          <>
            <ChevronRight size={12} />
            <span className="text-foreground">{activeBrandDetails.name}</span>
          </>
        )}
      </nav>

      {/* INVALID BRAND SLUG WARNING */}
      {invalidBrandSlug && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-600 dark:text-amber-400">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-sm font-bold">
              Brand <span className="font-black underline">"{invalidBrandSlug}"</span> was not found
              in our catalog. Showing all available implements.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="shrink-0 rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-black tracking-wider uppercase transition-colors hover:bg-amber-500/30"
          >
            Reset Brand Filter
          </button>
        </div>
      )}

      {/* HERO SECTION */}
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
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded-full border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-3 py-1 text-[10px] font-black tracking-widest text-[var(--color-brand-green)] uppercase">
                  Verified Brand
                </span>
              </div>
              <h1 className="text-foreground mb-2 text-4xl font-black tracking-tight md:text-5xl">
                {activeBrandDetails.name} Implements
              </h1>

              <div className="mb-4 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                {activeBrandDetails.country && (
                  <span className="bg-background/60 text-muted flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs font-bold tracking-wider uppercase backdrop-blur-md">
                    <span className="h-2 w-2 rounded-full bg-[var(--color-brand-orange)]"></span>
                    {activeBrandDetails.country}
                  </span>
                )}
                <span className="rounded-full border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-3 py-1 text-xs font-bold tracking-wider text-[var(--color-brand-green)] uppercase">
                  {totalImplements} Implements Available
                </span>
              </div>

              <p className="text-muted max-w-4xl text-sm leading-relaxed font-medium md:text-base">
                Explore high-performance {activeBrandDetails.name} agricultural implements
                engineered for maximum durability, field efficiency, and high yield productivity.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative mb-10 flex flex-col items-center justify-between overflow-hidden rounded-[2.5rem] border border-[var(--border-subtle)] bg-gradient-to-r from-[var(--color-brand-green)]/10 to-[var(--color-brand-orange)]/10 p-8 md:flex-row md:p-12">
          <div className="absolute top-0 right-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-brand-green)]/20 blur-[80px]" />

          <div className="z-10 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-3 py-1 text-[10px] font-black tracking-widest text-[var(--color-brand-green)] uppercase">
                <Wrench size={12} /> Agricultural Machinery Catalog
              </span>
            </div>
            <h1 className="text-foreground text-4xl font-black tracking-tight md:text-5xl">
              Explore Farm Implements
            </h1>
            <p className="text-muted max-w-2xl text-lg font-bold">
              Discover top-rated rotavators, cultivators, plows, threshers, and specialized farm
              machinery to enhance your farming output.
            </p>
          </div>

          {/* Total Count Badge */}
          <div className="bg-background/80 z-10 mt-6 flex flex-col items-center rounded-2xl border border-[var(--border-subtle)] px-6 py-4 backdrop-blur-md md:mt-0">
            <span className="text-3xl font-black text-[var(--color-brand-green)]">
              {totalImplements}
            </span>
            <span className="text-muted text-[10px] font-black tracking-widest uppercase">
              Implements Found
            </span>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER: SIDEBAR + CONTENT */}
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
              <h3 className="flex items-center gap-2 text-xl font-black tracking-tight">
                <Filter size={18} className="text-[var(--color-brand-green)]" /> Filters
              </h3>
              {(selectedBrand !== '' ||
                selectedFamily !== '' ||
                selectedCategory !== '' ||
                selectedHp !== '' ||
                selectedUsage !== '' ||
                selectedPrice !== '' ||
                searchQuery !== '') && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-[var(--color-brand-orange)] hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Filter: Search */}
            <div className="flex flex-col gap-3">
              <span className="text-muted text-xs font-black tracking-widest uppercase">
                Search Model
              </span>
              <div className="relative">
                <Search size={16} className="text-muted absolute top-1/2 left-3 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rotavator, Cultivator..."
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchQuery(val);
                    setPage(1);
                    updateUrlParams({ search: val, page: 1 });
                  }}
                  className="bg-background w-full rounded-xl border border-[var(--border-subtle)] py-3 pr-4 pl-10 text-sm font-bold transition-colors focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                />
              </div>
            </div>

            {/* Filter: Equipment Brands */}
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
                    setActiveBrandDetails(null);
                    setInvalidBrandSlug(null);
                    setPage(1);
                    updateUrlParams({ brand: null, page: 1 });
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

                {equipmentBrands.map((brand) => (
                  <label
                    key={brand.id}
                    className="group flex cursor-pointer items-center gap-3"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedBrand(brand.id);
                      setActiveBrandDetails(brand);
                      setInvalidBrandSlug(null);
                      setPage(1);
                      updateUrlParams({ brand: brand.slug, page: 1 });
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
                      className={`truncate text-sm font-bold ${selectedBrand === brand.id ? 'text-foreground' : 'text-muted group-hover:text-foreground'}`}
                    >
                      {brand.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter: Categories */}
            {categories.length > 0 && (
              <div className="flex flex-col gap-3">
                <span className="text-muted text-xs font-black tracking-widest uppercase">
                  Category
                </span>
                <div className="custom-scrollbar flex max-h-52 flex-col gap-2 overflow-y-auto pr-2">
                  <label
                    className="group flex cursor-pointer items-center gap-3"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedCategory('');
                      setPage(1);
                      updateUrlParams({ category: null, page: 1 });
                    }}
                  >
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${selectedCategory === '' ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]' : 'border-[var(--border-subtle)] group-hover:border-[var(--color-brand-green)]'}`}
                    >
                      {selectedCategory === '' && (
                        <div className="h-2.5 w-2.5 rounded-sm bg-white" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-bold ${selectedCategory === '' ? 'text-foreground' : 'text-muted group-hover:text-foreground'}`}
                    >
                      All Categories
                    </span>
                  </label>

                  {categories.map((cat) => (
                    <label
                      key={cat.id}
                      className="group flex cursor-pointer items-center gap-3"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedCategory(cat.id);
                        setPage(1);
                        updateUrlParams({ category: cat.slug, page: 1 });
                      }}
                    >
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${selectedCategory === cat.id ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]' : 'border-[var(--border-subtle)] group-hover:border-[var(--color-brand-green)]'}`}
                      >
                        {selectedCategory === cat.id && (
                          <div className="h-2.5 w-2.5 rounded-sm bg-white" />
                        )}
                      </div>
                      <span
                        className={`truncate text-sm font-bold ${selectedCategory === cat.id ? 'text-foreground' : 'text-muted group-hover:text-foreground'}`}
                      >
                        {cat.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Filter: Compatible HP Range */}
            <div className="flex flex-col gap-3">
              <span className="text-muted text-xs font-black tracking-widest uppercase">
                Compatible HP
              </span>
              <div className="flex flex-col gap-2">
                {[
                  { value: '', label: 'Any HP' },
                  { value: 'under30', label: 'Under 30 HP' },
                  { value: '30to50', label: '30 - 50 HP' },
                  { value: 'over50', label: 'Above 50 HP' },
                ].map((hp) => (
                  <label
                    key={hp.value}
                    className="group flex cursor-pointer items-center gap-3"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedHp(hp.value);
                      setPage(1);
                      updateUrlParams({ hp: hp.value || null, page: 1 });
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

            {/* Filter: Usage Type */}
            <div className="flex flex-col gap-3">
              <span className="text-muted text-xs font-black tracking-widest uppercase">
                Usage Type
              </span>
              <div className="flex flex-col gap-2">
                {[
                  { value: '', label: 'All Usages' },
                  { value: 'Land Preparation', label: 'Land Preparation' },
                  { value: 'Tillage', label: 'Tillage' },
                  { value: 'Seeding & Planting', label: 'Seeding & Planting' },
                  { value: 'Harvesting', label: 'Harvesting' },
                ].map((usage) => (
                  <label
                    key={usage.value}
                    className="group flex cursor-pointer items-center gap-3"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedUsage(usage.value);
                      setPage(1);
                      updateUrlParams({ usage: usage.value || null, page: 1 });
                    }}
                  >
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${selectedUsage === usage.value ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]' : 'border-[var(--border-subtle)] group-hover:border-[var(--color-brand-green)]'}`}
                    >
                      {selectedUsage === usage.value && (
                        <div className="h-2.5 w-2.5 rounded-sm bg-white" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-bold ${selectedUsage === usage.value ? 'text-foreground' : 'text-muted group-hover:text-foreground'}`}
                    >
                      {usage.label}
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
                  { value: 'under50k', label: 'Under ₹ 50,000' },
                  { value: '50kto1L', label: '₹ 50,000 - ₹ 1 Lakh' },
                  { value: '1Lto2L', label: '₹ 1 Lakh - ₹ 2 Lakh' },
                  { value: 'over2L', label: 'Above ₹ 2 Lakh' },
                ].map((price) => (
                  <label
                    key={price.value}
                    className="group flex cursor-pointer items-center gap-3"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedPrice(price.value);
                      setPage(1);
                      updateUrlParams({ price: price.value || null, page: 1 });
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
          {/* Top Bar Actions & Filters Display */}
          <div className="bg-background/50 flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-[var(--border-subtle)] p-4 backdrop-blur-md">
            <div className="flex flex-col gap-2">
              <p className="text-muted text-sm font-bold">
                Showing <span className="text-foreground">{implementsList.length}</span> of{' '}
                <span className="text-foreground">{totalImplements}</span> implements
              </p>

              {/* Active Filter Chips */}
              {(selectedBrand !== '' ||
                selectedFamily !== '' ||
                selectedCategory !== '' ||
                selectedHp !== '' ||
                selectedUsage !== '' ||
                selectedPrice !== '' ||
                searchQuery !== '') && (
                <div className="mt-1 flex flex-wrap gap-2">
                  {searchQuery !== '' && (
                    <span className="bg-foreground/5 text-foreground inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs font-bold">
                      Search: "{searchQuery}"
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setPage(1);
                          updateUrlParams({ search: null, page: 1 });
                        }}
                        className="hover:text-[var(--color-brand-orange)]"
                      >
                        <X size={12} strokeWidth={3} />
                      </button>
                    </span>
                  )}
                  {selectedFamily !== '' && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-500">
                      Series Filter
                      <button
                        onClick={() => {
                          setSelectedFamily('');
                          setPage(1);
                          updateUrlParams({ family: null, page: 1 });
                        }}
                        className="hover:text-[var(--color-brand-orange)]"
                      >
                        <X size={12} strokeWidth={3} />
                      </button>
                    </span>
                  )}
                  {selectedBrand !== '' && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-3 py-1 text-xs font-bold text-[var(--color-brand-green)]">
                      Brand:{' '}
                      {equipmentBrands.find((b) => b.id === selectedBrand)?.name || 'Selected'}
                      <button
                        onClick={() => {
                          setSelectedBrand('');
                          setActiveBrandDetails(null);
                          setPage(1);
                          updateUrlParams({ brand: null, page: 1 });
                        }}
                        className="hover:text-[var(--color-brand-orange)]"
                      >
                        <X size={12} strokeWidth={3} />
                      </button>
                    </span>
                  )}
                  {selectedCategory !== '' && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-3 py-1 text-xs font-bold text-[var(--color-brand-green)]">
                      Category:{' '}
                      {categories.find((c) => c.id === selectedCategory)?.name || 'Selected'}
                      <button
                        onClick={() => {
                          setSelectedCategory('');
                          setPage(1);
                          updateUrlParams({ category: null, page: 1 });
                        }}
                        className="hover:text-[var(--color-brand-orange)]"
                      >
                        <X size={12} strokeWidth={3} />
                      </button>
                    </span>
                  )}
                  {selectedHp !== '' && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-3 py-1 text-xs font-bold text-[var(--color-brand-green)]">
                      HP:{' '}
                      {selectedHp === 'under30'
                        ? 'Under 30 HP'
                        : selectedHp === '30to50'
                          ? '30 - 50 HP'
                          : 'Above 50 HP'}
                      <button
                        onClick={() => {
                          setSelectedHp('');
                          setPage(1);
                          updateUrlParams({ hp: null, page: 1 });
                        }}
                        className="hover:text-[var(--color-brand-orange)]"
                      >
                        <X size={12} strokeWidth={3} />
                      </button>
                    </span>
                  )}
                  {selectedUsage !== '' && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-3 py-1 text-xs font-bold text-[var(--color-brand-green)]">
                      Usage: {selectedUsage}
                      <button
                        onClick={() => {
                          setSelectedUsage('');
                          setPage(1);
                          updateUrlParams({ usage: null, page: 1 });
                        }}
                        className="hover:text-[var(--color-brand-orange)]"
                      >
                        <X size={12} strokeWidth={3} />
                      </button>
                    </span>
                  )}
                  {selectedPrice !== '' && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-3 py-1 text-xs font-bold text-[var(--color-brand-green)]">
                      Price:{' '}
                      {selectedPrice === 'under50k'
                        ? '< ₹50k'
                        : selectedPrice === '50kto1L'
                          ? '₹50k - ₹1L'
                          : selectedPrice === '1Lto2L'
                            ? '₹1L - ₹2L'
                            : '> ₹2L'}
                      <button
                        onClick={() => {
                          setSelectedPrice('');
                          setPage(1);
                          updateUrlParams({ price: null, page: 1 });
                        }}
                        className="hover:text-[var(--color-brand-orange)]"
                      >
                        <X size={12} strokeWidth={3} />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={handleResetFilters}
                    className="text-muted hover:text-foreground ml-2 text-xs font-bold underline underline-offset-2"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Right Controls: Sort & View Mode */}
            <div className="flex items-center gap-3">
              {/* Sort Control */}
              <div className="relative flex items-center">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    const newSort = e.target.value as any;
                    setSortBy(newSort);
                    updateUrlParams({ sort: newSort });
                  }}
                  className="bg-background cursor-pointer rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-bold focus:border-[var(--color-brand-green)] focus:outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="priceLowHigh">Price: Low to High</option>
                  <option value="priceHighLow">Price: High to Low</option>
                  <option value="modelName">Model Name A-Z</option>
                </select>
              </div>

              {/* View Switcher */}
              <div className="bg-background flex items-center gap-1 rounded-xl border border-[var(--border-subtle)] p-1">
                <button
                  onClick={() => {
                    setViewMode('grid');
                    updateUrlParams({ view: 'grid' });
                  }}
                  className={`rounded-lg p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-[var(--color-brand-green)] text-white' : 'text-muted hover:text-foreground'}`}
                  title="Grid View"
                >
                  <Grid3X3 size={18} />
                </button>
                <button
                  onClick={() => {
                    setViewMode('list');
                    updateUrlParams({ view: 'list' });
                  }}
                  className={`rounded-lg p-1.5 transition-colors ${viewMode === 'list' ? 'bg-[var(--color-brand-green)] text-white' : 'text-muted hover:text-foreground'}`}
                  title="List View"
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* API ERROR STATE */}
          {apiError && (
            <div className="flex flex-col items-center gap-3 rounded-[2rem] border border-red-500/20 bg-red-500/10 p-6 text-center text-red-600 dark:text-red-400">
              <AlertCircle size={32} />
              <h4 className="text-lg font-black">Failed to Load Implements</h4>
              <p className="max-w-md text-sm font-medium">{apiError}</p>
              <button
                onClick={() => setPage((p) => p)}
                className="mt-2 rounded-xl bg-red-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg transition-colors hover:bg-red-600"
              >
                Try Again
              </button>
            </div>
          )}

          {/* LOADING SKELETON */}
          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-foreground/5 flex h-[420px] animate-pulse flex-col justify-between rounded-[2.5rem] p-6"
                >
                  <div className="bg-foreground/10 mb-4 h-44 w-full rounded-2xl" />
                  <div className="space-y-3">
                    <div className="bg-foreground/10 h-4 w-1/3 rounded-md" />
                    <div className="bg-foreground/10 h-6 w-3/4 rounded-md" />
                    <div className="bg-foreground/10 h-4 w-1/2 rounded-md" />
                  </div>
                  <div className="bg-foreground/10 mt-4 h-10 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : implementsList.length === 0 ? (
            /* EMPTY STATE */
            <div className="bg-foreground/5 my-4 flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-[var(--border-subtle)] p-16 text-center">
              <Wrench size={64} className="text-muted mb-4 opacity-30" strokeWidth={1.2} />
              <h3 className="text-foreground mb-2 text-2xl font-black">No implements found</h3>
              <p className="text-muted max-w-md font-medium">
                We couldn't find any implements matching your current filter choices or search
                query.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-6 rounded-xl bg-[var(--color-brand-green)] px-6 py-3 text-sm font-bold text-white shadow-[var(--color-brand-green)]/30 shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            /* IMPLEMENTS PRESENTATION GRID / LIST */
            <div
              className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
            >
              {implementsList.map((item) => {
                const primaryImage = item.videoThumbnailUrl || item.brand?.logoUrl || null;
                const priceFormatted = formatPrice(item.priceMin, item.priceMax);

                if (viewMode === 'list') {
                  return (
                    <Link
                      key={item.id}
                      href={`/implements/${item.slug || item.id}`}
                      className="spatial-card group bg-background relative flex flex-col gap-6 overflow-hidden rounded-[2.5rem] p-6 transition-all duration-300 hover:border-[var(--color-brand-green)]/40 hover:shadow-xl sm:flex-row"
                    >
                      {/* Media Preview Box */}
                      <div className="from-foreground/5 group/img relative flex h-48 w-full shrink-0 items-center justify-center overflow-hidden rounded-[1.5rem] border border-[var(--border-subtle)] bg-gradient-to-br to-transparent p-4 sm:w-64">
                        {item.brand?.name && (
                          <div className="bg-background/80 text-foreground absolute top-3 left-3 z-10 rounded-full border border-[var(--border-subtle)] px-2.5 py-1 text-[9px] font-black tracking-wider uppercase backdrop-blur-md">
                            {item.brand.name}
                          </div>
                        )}
                        {primaryImage ? (
                          <img
                            src={primaryImage}
                            alt={item.modelName}
                            className="relative z-0 h-full w-full object-contain transition-transform duration-500 group-hover/img:scale-110"
                          />
                        ) : (
                          <Wrench
                            className="text-foreground/20 h-16 w-16 transition-all duration-500 group-hover/img:scale-110"
                            strokeWidth={1}
                          />
                        )}
                      </div>

                      {/* Content Info */}
                      <div className="flex flex-1 flex-col py-1">
                        <div className="mb-2 flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[10px] font-black tracking-[0.2em] text-[var(--color-brand-green)] uppercase">
                              {item.category?.name || 'Implement'}
                            </p>
                            <h3 className="text-foreground mt-1 text-2xl font-black tracking-tight transition-colors group-hover:text-[var(--color-brand-green)]">
                              {item.modelName}
                            </h3>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-muted mb-1 text-[11px] font-bold tracking-wider uppercase">
                              Estimated Price
                            </p>
                            <p className="text-foreground text-xl font-black tracking-tight sm:text-2xl">
                              {priceFormatted}
                            </p>
                          </div>
                        </div>

                        {item.description && (
                          <p className="text-muted mb-3 line-clamp-2 max-w-xl text-xs leading-relaxed font-medium">
                            {item.description}
                          </p>
                        )}

                        {/* Dynamic Specification Badges */}
                        {renderDynamicSpecs(item.additionalSpecs)}

                        {/* Bottom Meta & Actions */}
                        <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                          {(item.compatibleHpMin || item.compatibleHpMax) && (
                            <span className="bg-foreground/5 flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-bold">
                              <Gauge size={14} className="text-[var(--color-brand-green)]" />
                              {item.compatibleHpMin && item.compatibleHpMax
                                ? `${item.compatibleHpMin} - ${item.compatibleHpMax} HP`
                                : item.compatibleHpMin
                                  ? `>= ${item.compatibleHpMin} HP`
                                  : `<= ${item.compatibleHpMax} HP`}
                            </span>
                          )}

                          {item.workingWidthFt && (
                            <span className="bg-foreground/5 flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-bold">
                              <Layers size={14} className="text-[var(--color-brand-orange)]" />
                              {item.workingWidthFt} Ft Width
                            </span>
                          )}

                          {item.weightKg && (
                            <span className="bg-foreground/5 flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-bold">
                              <Weight size={14} className="text-blue-500" />
                              {item.weightKg} Kg
                            </span>
                          )}

                          {item.usageType && (
                            <span className="rounded-xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-3 py-1.5 text-xs font-bold text-[var(--color-brand-green)]">
                              {item.usageType}
                            </span>
                          )}

                          <div className="ml-auto flex items-center gap-2">
                            {item.brochureUrl && (
                              <a
                                href={item.brochureUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-foreground/5 hover:bg-foreground/10 text-foreground rounded-xl p-2 transition-colors"
                                title="Download Brochure"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <FileText size={16} />
                              </a>
                            )}

                            <span className="flex items-center gap-2 rounded-xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-4 py-2.5 text-xs font-black tracking-widest text-[var(--color-brand-green)] uppercase transition-colors group-hover:text-[var(--color-brand-orange)]">
                              Details <ChevronRight size={14} strokeWidth={3} />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                }

                // Grid Card Presentation
                return (
                  <Link
                    key={item.id}
                    href={`/implements/${item.slug || item.id}`}
                    className="spatial-card group bg-background relative flex flex-1 cursor-pointer flex-col justify-between overflow-hidden rounded-[2.5rem] border border-[var(--border-subtle)] p-5 transition-all duration-500 hover:-translate-y-2 hover:border-[var(--color-brand-green)]/40 hover:shadow-[0_20px_40px_-10px_rgba(74,118,53,0.15)]"
                  >
                    <div>
                      {/* Top Brand & Category Badges */}
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span className="truncate text-[10px] font-black tracking-[0.2em] text-[var(--color-brand-green)] uppercase">
                          {item.brand?.name || 'Equipment'}
                        </span>
                        <span className="bg-foreground/5 text-muted shrink-0 rounded-full border border-[var(--border-subtle)] px-2.5 py-1 text-[10px] font-extrabold tracking-wider uppercase">
                          {item.category?.name || 'Implement'}
                        </span>
                      </div>

                      {/* Media Image Container */}
                      <div className="from-foreground/5 group/img relative mb-5 flex h-48 w-full items-center justify-center overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-gradient-to-br to-transparent p-4">
                        {primaryImage ? (
                          <img
                            src={primaryImage}
                            alt={item.modelName}
                            className="relative z-0 h-full w-full object-contain transition-transform duration-500 group-hover/img:scale-110"
                          />
                        ) : (
                          <Wrench
                            className="text-foreground/20 h-20 w-20 transition-all duration-500 group-hover/img:scale-110"
                            strokeWidth={1}
                          />
                        )}

                        {item.brochureUrl && (
                          <a
                            href={item.brochureUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-background/80 text-foreground absolute top-3 right-3 z-10 rounded-xl border border-[var(--border-subtle)] p-2 shadow-sm backdrop-blur-md transition-colors hover:text-[var(--color-brand-green)]"
                            title="Download Brochure"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FileText size={14} />
                          </a>
                        )}
                      </div>

                      {/* Content Section */}
                      <div className="flex flex-col gap-2 px-1">
                        <h3 className="text-foreground line-clamp-1 text-xl font-black tracking-tight transition-colors group-hover:text-[var(--color-brand-green)]">
                          {item.modelName}
                        </h3>

                        {/* Specifications Pills */}
                        <div className="mt-1 flex flex-wrap gap-1.5 text-[11px] font-bold">
                          {(item.compatibleHpMin || item.compatibleHpMax) && (
                            <span className="bg-foreground/5 text-foreground flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] px-2.5 py-1">
                              <Gauge size={12} className="text-[var(--color-brand-green)]" />
                              {item.compatibleHpMin && item.compatibleHpMax
                                ? `${item.compatibleHpMin}-${item.compatibleHpMax} HP`
                                : item.compatibleHpMin
                                  ? `>= ${item.compatibleHpMin} HP`
                                  : `<= ${item.compatibleHpMax} HP`}
                            </span>
                          )}
                          {item.workingWidthFt && (
                            <span className="bg-foreground/5 text-foreground rounded-lg border border-[var(--border-subtle)] px-2.5 py-1">
                              {item.workingWidthFt} Ft
                            </span>
                          )}
                          {item.weightKg && (
                            <span className="bg-foreground/5 text-foreground rounded-lg border border-[var(--border-subtle)] px-2.5 py-1">
                              {item.weightKg} kg
                            </span>
                          )}
                        </div>

                        {/* Dynamic Specifications */}
                        {renderDynamicSpecs(item.additionalSpecs)}
                      </div>
                    </div>

                    {/* Pricing & CTA */}
                    <div className="mt-6 flex items-end justify-between border-t border-[var(--border-subtle)] pt-4">
                      <div>
                        <p className="text-muted mb-0.5 text-[10px] font-black tracking-wider uppercase">
                          Estimated Price
                        </p>
                        <p className="text-foreground text-lg font-black tracking-tight md:text-xl">
                          {priceFormatted}
                        </p>
                      </div>
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-brand-green)] text-white shadow-[var(--color-brand-green)]/30 shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-12">
                        <ChevronRight size={18} strokeWidth={3} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="mt-12 mb-8 flex items-center justify-center gap-3">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={`flex h-11 w-11 items-center justify-center rounded-full transition-all ${page === 1 ? 'bg-foreground/5 text-muted cursor-not-allowed' : 'bg-background border border-[var(--border-subtle)] hover:border-[var(--color-brand-green)] hover:text-[var(--color-brand-green)] hover:shadow-lg'}`}
              >
                <ChevronLeft size={18} strokeWidth={3} />
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
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
                      className={`h-11 w-11 rounded-full text-xs font-black transition-all ${page === pageNum ? 'scale-105 bg-[var(--color-brand-green)] text-white shadow-[var(--color-brand-green)]/30 shadow-lg' : 'text-muted hover:bg-foreground/5 hover:text-foreground bg-transparent'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className={`flex h-11 w-11 items-center justify-center rounded-full transition-all ${page === totalPages ? 'bg-foreground/5 text-muted cursor-not-allowed' : 'bg-background border border-[var(--border-subtle)] hover:border-[var(--color-brand-green)] hover:text-[var(--color-brand-green)] hover:shadow-lg'}`}
              >
                <ChevronRight size={18} strokeWidth={3} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ImplementsListingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-full items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-brand-green)] border-t-transparent"></div>
        </div>
      }
    >
      <ImplementsListingContent />
    </Suspense>
  );
}
