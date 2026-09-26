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
  ArrowUpDown
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
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [selectedHp, setSelectedHp] = useState<string>(hpQueryParam);
  const [selectedUsage, setSelectedUsage] = useState<string>(usageQueryParam);
  const [selectedPrice, setSelectedPrice] = useState<string>(priceQueryParam);
  const [sortBy, setSortBy] = useState<'newest' | 'priceLowHigh' | 'priceHighLow' | 'modelName'>(sortQueryParam);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(viewQueryParam);
  
  const [page, setPage] = useState(pageQueryParam);
  const [totalPages, setTotalPages] = useState(1);
  const [totalImplements, setTotalImplements] = useState(0);

  // Mobile filters toggle
  const [showFilters, setShowFilters] = useState(false);

  // 1. Helper to update URL query parameters without reloading
  const updateUrlParams = useCallback((newParams: Record<string, string | number | null | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '' || value === 1 && key === 'page') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    const queryString = params.toString();
    router.replace(`${pathname}${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [searchParams, pathname, router]);

  // 2. Fetch Brands and Categories metadata
  useEffect(() => {
    let isMounted = true;
    const fetchMetadata = async () => {
      try {
        const [brandsRes, categoriesRes] = await Promise.all([
          equipmentBrandAPI.getAllEquipmentBrands({ limit: 100, isActive: 'true' }),
          implementCategoryAPI.getAllActiveCategoriesFlat()
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
    return () => { isMounted = false; };
  }, []);

  // 3. Resolve Selected Brand & Category from URL query params
  useEffect(() => {
    if (equipmentBrands.length === 0) return;

    if (brandQuery) {
      const normalizedBrandQuery = brandQuery.trim().toLowerCase();
      const matchedBrand = equipmentBrands.find(
        b => b.slug.toLowerCase() === normalizedBrandQuery || String(b.id) === normalizedBrandQuery
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
        c => c.slug.toLowerCase() === categoryQuery.trim().toLowerCase() || String(c.id) === categoryQuery
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
  }, [searchQueryParam, hpQueryParam, usageQueryParam, priceQueryParam, sortQueryParam, pageQueryParam, viewQueryParam]);

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
              totalPages: payload.totalPages || 1
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
        console.error("Failed to load implements:", err);
        if (isMounted) {
          setApiError(err?.response?.data?.message || err?.message || 'Failed to fetch implements.');
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
  }, [page, searchQuery, selectedBrand, selectedCategory, selectedHp, selectedUsage, selectedPrice, sortBy]);

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
    const allSpecs = grouped.flatMap(g => g.specs);

    if (allSpecs.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {allSpecs.slice(0, 4).map((spec, idx) => (
          <span 
            key={idx} 
            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-foreground/5 text-muted border border-[var(--border-subtle)] truncate max-w-[170px]"
            title={`${spec.name}: ${spec.value}${spec.unit ? ` ${spec.unit}` : ''}`}
          >
            <span className="opacity-60 truncate">{spec.name}:</span>
            <span className="font-extrabold text-foreground truncate">
              {spec.value}{spec.unit ? ` ${spec.unit}` : ''}
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
    <div className="w-full max-w-[1440px] mx-auto min-h-screen flex flex-col pt-8 pb-24 px-4 sm:px-6 lg:px-8 animate-fade-in">
      
      {/* BREADCRUMBS */}
      <nav className="flex items-center gap-2 text-xs font-bold text-muted mb-6">
        <Link href="/" className="hover:text-[var(--color-brand-green)] transition-colors">Home</Link>
        <ChevronRight size={12} />
        <Link href="/implements" className="hover:text-[var(--color-brand-green)] transition-colors">Implements</Link>
        {activeBrandDetails && (
          <>
            <ChevronRight size={12} />
            <span className="text-foreground">{activeBrandDetails.name}</span>
          </>
        )}
      </nav>

      {/* INVALID BRAND SLUG WARNING */}
      {invalidBrandSlug && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-sm font-bold">
              Brand <span className="underline font-black">"{invalidBrandSlug}"</span> was not found in our catalog. Showing all available implements.
            </p>
          </div>
          <button 
            onClick={handleResetFilters}
            className="text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 transition-colors shrink-0"
          >
            Reset Brand Filter
          </button>
        </div>
      )}

      {/* HERO SECTION */}
      {activeBrandDetails ? (
        <div className="bg-gradient-to-r from-[var(--color-brand-green)]/10 to-[var(--color-brand-orange)]/10 rounded-[2.5rem] p-8 md:p-12 mb-10 flex flex-col items-start border border-[var(--border-subtle)] relative overflow-hidden gap-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-brand-green)]/20 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="z-10 flex flex-col md:flex-row items-center md:items-start gap-8 w-full">
            {/* Brand Logo */}
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] bg-background border border-[var(--border-subtle)] shadow-sm flex items-center justify-center p-6 shrink-0 relative overflow-hidden group">
              {activeBrandDetails.logoUrl ? (
                <img 
                  src={activeBrandDetails.logoUrl} 
                  alt={activeBrandDetails.name} 
                  className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <span className="font-black text-5xl text-foreground/30">{activeBrandDetails.name.charAt(0)}</span>
              )}
            </div>

            {/* Brand Details */}
            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-3 py-1 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] rounded-full text-[10px] font-black uppercase tracking-widest border border-[var(--color-brand-green)]/20">
                  Verified Brand
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-2">
                {activeBrandDetails.name} Implements
              </h1>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                {activeBrandDetails.country && (
                  <span className="px-3 py-1 bg-background/60 backdrop-blur-md rounded-full text-xs font-bold text-muted border border-[var(--border-subtle)] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-brand-orange)]"></span>
                    {activeBrandDetails.country}
                  </span>
                )}
                <span className="px-3 py-1 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] rounded-full text-xs font-bold border border-[var(--color-brand-green)]/20 uppercase tracking-wider">
                  {totalImplements} Implements Available
                </span>
              </div>

              <p className="text-muted font-medium text-sm md:text-base leading-relaxed max-w-4xl">
                Explore high-performance {activeBrandDetails.name} agricultural implements engineered for maximum durability, field efficiency, and high yield productivity.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-[var(--color-brand-green)]/10 to-[var(--color-brand-orange)]/10 rounded-[2.5rem] p-8 md:p-12 mb-10 flex flex-col md:flex-row items-center justify-between border border-[var(--border-subtle)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-brand-green)]/20 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="z-10 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] rounded-full text-[10px] font-black uppercase tracking-widest border border-[var(--color-brand-green)]/20 flex items-center gap-1.5">
                <Wrench size={12} /> Agricultural Machinery Catalog
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">Explore Farm Implements</h1>
            <p className="text-muted font-bold text-lg max-w-2xl">
              Discover top-rated rotavators, cultivators, plows, threshers, and specialized farm machinery to enhance your farming output.
            </p>
          </div>
          
          {/* Total Count Badge */}
          <div className="mt-6 md:mt-0 z-10 bg-background/80 backdrop-blur-md border border-[var(--border-subtle)] px-6 py-4 rounded-2xl flex flex-col items-center">
            <span className="text-3xl font-black text-[var(--color-brand-green)]">{totalImplements}</span>
            <span className="text-[10px] uppercase font-black tracking-widest text-muted">Implements Found</span>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER: SIDEBAR + CONTENT */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* MOBILE FILTER TOGGLE */}
        <button 
          className="lg:hidden w-full flex items-center justify-center gap-2 bg-foreground/5 py-4 rounded-2xl font-bold border border-[var(--border-subtle)]"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} /> {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>

        {/* SIDEBAR FILTERS */}
        <aside className={`w-full lg:w-72 flex-shrink-0 flex flex-col gap-6 ${showFilters ? 'flex' : 'hidden lg:flex'}`}>
          <div className="spatial-panel p-6 rounded-[2rem] flex flex-col gap-8 sticky top-24">
            
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                <Filter size={18} className="text-[var(--color-brand-green)]" /> Filters
              </h3>
              {(selectedBrand !== '' || selectedCategory !== '' || selectedHp !== '' || selectedUsage !== '' || selectedPrice !== '' || searchQuery !== '') && (
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
              <span className="text-xs font-black uppercase text-muted tracking-widest">Search Model</span>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
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
                  className="w-full bg-background border border-[var(--border-subtle)] rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:outline-none focus:border-[var(--color-brand-green)]/50 transition-colors"
                />
              </div>
            </div>

            {/* Filter: Equipment Brands */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-black uppercase text-muted tracking-widest">Brands</span>
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                <label 
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedBrand('');
                    setActiveBrandDetails(null);
                    setInvalidBrandSlug(null);
                    setPage(1);
                    updateUrlParams({ brand: null, page: 1 });
                  }}
                >
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedBrand === '' ? 'bg-[var(--color-brand-green)] border-[var(--color-brand-green)]' : 'border-[var(--border-subtle)] group-hover:border-[var(--color-brand-green)]'}`}>
                    {selectedBrand === '' && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                  </div>
                  <span className={`text-sm font-bold ${selectedBrand === '' ? 'text-foreground' : 'text-muted group-hover:text-foreground'}`}>All Brands</span>
                </label>
                
                {equipmentBrands.map(brand => (
                  <label 
                    key={brand.id} 
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedBrand(brand.id);
                      setActiveBrandDetails(brand);
                      setInvalidBrandSlug(null);
                      setPage(1);
                      updateUrlParams({ brand: brand.slug, page: 1 });
                    }}
                  >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedBrand === brand.id ? 'bg-[var(--color-brand-green)] border-[var(--color-brand-green)]' : 'border-[var(--border-subtle)] group-hover:border-[var(--color-brand-green)]'}`}>
                      {selectedBrand === brand.id && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                    </div>
                    <span className={`text-sm font-bold truncate ${selectedBrand === brand.id ? 'text-foreground' : 'text-muted group-hover:text-foreground'}`}>
                      {brand.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter: Categories */}
            {categories.length > 0 && (
              <div className="flex flex-col gap-3">
                <span className="text-xs font-black uppercase text-muted tracking-widest">Category</span>
                <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-2 custom-scrollbar">
                  <label 
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedCategory('');
                      setPage(1);
                      updateUrlParams({ category: null, page: 1 });
                    }}
                  >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedCategory === '' ? 'bg-[var(--color-brand-green)] border-[var(--color-brand-green)]' : 'border-[var(--border-subtle)] group-hover:border-[var(--color-brand-green)]'}`}>
                      {selectedCategory === '' && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                    </div>
                    <span className={`text-sm font-bold ${selectedCategory === '' ? 'text-foreground' : 'text-muted group-hover:text-foreground'}`}>All Categories</span>
                  </label>

                  {categories.map(cat => (
                    <label 
                      key={cat.id} 
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedCategory(cat.id);
                        setPage(1);
                        updateUrlParams({ category: cat.slug, page: 1 });
                      }}
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedCategory === cat.id ? 'bg-[var(--color-brand-green)] border-[var(--color-brand-green)]' : 'border-[var(--border-subtle)] group-hover:border-[var(--color-brand-green)]'}`}>
                        {selectedCategory === cat.id && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                      </div>
                      <span className={`text-sm font-bold truncate ${selectedCategory === cat.id ? 'text-foreground' : 'text-muted group-hover:text-foreground'}`}>
                        {cat.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Filter: Compatible HP Range */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-black uppercase text-muted tracking-widest">Compatible HP</span>
              <div className="flex flex-col gap-2">
                {[
                  { value: '', label: 'Any HP' },
                  { value: 'under30', label: 'Under 30 HP' },
                  { value: '30to50', label: '30 - 50 HP' },
                  { value: 'over50', label: 'Above 50 HP' },
                ].map((hp) => (
                   <label 
                      key={hp.value} 
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedHp(hp.value);
                        setPage(1);
                        updateUrlParams({ hp: hp.value || null, page: 1 });
                      }}
                    >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedHp === hp.value ? 'bg-[var(--color-brand-green)] border-[var(--color-brand-green)]' : 'border-[var(--border-subtle)] group-hover:border-[var(--color-brand-green)]'}`}>
                      {selectedHp === hp.value && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                    </div>
                    <span className={`text-sm font-bold ${selectedHp === hp.value ? 'text-foreground' : 'text-muted group-hover:text-foreground'}`}>{hp.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter: Usage Type */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-black uppercase text-muted tracking-widest">Usage Type</span>
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
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedUsage(usage.value);
                        setPage(1);
                        updateUrlParams({ usage: usage.value || null, page: 1 });
                      }}
                    >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedUsage === usage.value ? 'bg-[var(--color-brand-green)] border-[var(--color-brand-green)]' : 'border-[var(--border-subtle)] group-hover:border-[var(--color-brand-green)]'}`}>
                      {selectedUsage === usage.value && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                    </div>
                    <span className={`text-sm font-bold ${selectedUsage === usage.value ? 'text-foreground' : 'text-muted group-hover:text-foreground'}`}>{usage.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter: Price Range */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-black uppercase text-muted tracking-widest">Price Range</span>
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
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedPrice(price.value);
                        setPage(1);
                        updateUrlParams({ price: price.value || null, page: 1 });
                      }}
                    >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedPrice === price.value ? 'bg-[var(--color-brand-green)] border-[var(--color-brand-green)]' : 'border-[var(--border-subtle)] group-hover:border-[var(--color-brand-green)]'}`}>
                      {selectedPrice === price.value && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                    </div>
                    <span className={`text-sm font-bold ${selectedPrice === price.value ? 'text-foreground' : 'text-muted group-hover:text-foreground'}`}>{price.label}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col gap-6 w-full min-w-0">
          
          {/* Top Bar Actions & Filters Display */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-background/50 backdrop-blur-md p-4 border border-[var(--border-subtle)] rounded-[1.5rem]">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-bold text-muted">
                Showing <span className="text-foreground">{implementsList.length}</span> of <span className="text-foreground">{totalImplements}</span> implements
              </p>
              
              {/* Active Filter Chips */}
              {(selectedBrand !== '' || selectedCategory !== '' || selectedHp !== '' || selectedUsage !== '' || selectedPrice !== '' || searchQuery !== '') && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {searchQuery !== '' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-foreground/5 text-foreground text-xs font-bold rounded-full border border-[var(--border-subtle)]">
                      Search: "{searchQuery}"
                      <button onClick={() => { setSearchQuery(''); setPage(1); updateUrlParams({ search: null, page: 1 }); }} className="hover:text-[var(--color-brand-orange)]">
                        <X size={12} strokeWidth={3} />
                      </button>
                    </span>
                  )}
                  {selectedBrand !== '' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] text-xs font-bold rounded-full border border-[var(--color-brand-green)]/20">
                      Brand: {equipmentBrands.find(b => b.id === selectedBrand)?.name || 'Selected'}
                      <button onClick={() => { setSelectedBrand(''); setActiveBrandDetails(null); setPage(1); updateUrlParams({ brand: null, page: 1 }); }} className="hover:text-[var(--color-brand-orange)]">
                        <X size={12} strokeWidth={3} />
                      </button>
                    </span>
                  )}
                  {selectedCategory !== '' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] text-xs font-bold rounded-full border border-[var(--color-brand-green)]/20">
                      Category: {categories.find(c => c.id === selectedCategory)?.name || 'Selected'}
                      <button onClick={() => { setSelectedCategory(''); setPage(1); updateUrlParams({ category: null, page: 1 }); }} className="hover:text-[var(--color-brand-orange)]">
                        <X size={12} strokeWidth={3} />
                      </button>
                    </span>
                  )}
                  {selectedHp !== '' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] text-xs font-bold rounded-full border border-[var(--color-brand-green)]/20">
                      HP: {selectedHp === 'under30' ? 'Under 30 HP' : selectedHp === '30to50' ? '30 - 50 HP' : 'Above 50 HP'}
                      <button onClick={() => { setSelectedHp(''); setPage(1); updateUrlParams({ hp: null, page: 1 }); }} className="hover:text-[var(--color-brand-orange)]">
                        <X size={12} strokeWidth={3} />
                      </button>
                    </span>
                  )}
                  {selectedUsage !== '' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] text-xs font-bold rounded-full border border-[var(--color-brand-green)]/20">
                      Usage: {selectedUsage}
                      <button onClick={() => { setSelectedUsage(''); setPage(1); updateUrlParams({ usage: null, page: 1 }); }} className="hover:text-[var(--color-brand-orange)]">
                        <X size={12} strokeWidth={3} />
                      </button>
                    </span>
                  )}
                  {selectedPrice !== '' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] text-xs font-bold rounded-full border border-[var(--color-brand-green)]/20">
                      Price: {selectedPrice === 'under50k' ? '< ₹50k' : selectedPrice === '50kto1L' ? '₹50k - ₹1L' : selectedPrice === '1Lto2L' ? '₹1L - ₹2L' : '> ₹2L'}
                      <button onClick={() => { setSelectedPrice(''); setPage(1); updateUrlParams({ price: null, page: 1 }); }} className="hover:text-[var(--color-brand-orange)]">
                        <X size={12} strokeWidth={3} />
                      </button>
                    </span>
                  )}
                  <button onClick={handleResetFilters} className="text-xs font-bold text-muted hover:text-foreground ml-2 underline underline-offset-2">
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
                  className="bg-background border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-[var(--color-brand-green)] cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="priceLowHigh">Price: Low to High</option>
                  <option value="priceHighLow">Price: High to Low</option>
                  <option value="modelName">Model Name A-Z</option>
                </select>
              </div>

              {/* View Switcher */}
              <div className="flex items-center gap-1 border border-[var(--border-subtle)] rounded-xl p-1 bg-background">
                <button 
                  onClick={() => { setViewMode('grid'); updateUrlParams({ view: 'grid' }); }}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[var(--color-brand-green)] text-white' : 'text-muted hover:text-foreground'}`}
                  title="Grid View"
                >
                  <Grid3X3 size={18} />
                </button>
                <button 
                  onClick={() => { setViewMode('list'); updateUrlParams({ view: 'list' }); }}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[var(--color-brand-green)] text-white' : 'text-muted hover:text-foreground'}`}
                  title="List View"
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* API ERROR STATE */}
          {apiError && (
            <div className="p-6 rounded-[2rem] bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex flex-col items-center text-center gap-3">
              <AlertCircle size={32} />
              <h4 className="text-lg font-black">Failed to Load Implements</h4>
              <p className="text-sm font-medium max-w-md">{apiError}</p>
              <button 
                onClick={() => setPage(p => p)}
                className="mt-2 px-5 py-2.5 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-colors shadow-lg"
              >
                Try Again
              </button>
            </div>
          )}

          {/* LOADING SKELETON */}
          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {Array.from({ length: 6 }).map((_, i) => (
                 <div key={i} className="h-[420px] bg-foreground/5 rounded-[2.5rem] animate-pulse p-6 flex flex-col justify-between">
                   <div className="h-44 w-full bg-foreground/10 rounded-2xl mb-4" />
                   <div className="space-y-3">
                     <div className="h-4 w-1/3 bg-foreground/10 rounded-md" />
                     <div className="h-6 w-3/4 bg-foreground/10 rounded-md" />
                     <div className="h-4 w-1/2 bg-foreground/10 rounded-md" />
                   </div>
                   <div className="h-10 w-full bg-foreground/10 rounded-xl mt-4" />
                 </div>
               ))}
             </div>
          ) : implementsList.length === 0 ? (
            /* EMPTY STATE */
            <div className="flex flex-col items-center justify-center p-16 text-center bg-foreground/5 rounded-[2.5rem] border border-dashed border-[var(--border-subtle)] my-4">
              <Wrench size={64} className="text-muted mb-4 opacity-30" strokeWidth={1.2} />
              <h3 className="text-2xl font-black text-foreground mb-2">No implements found</h3>
              <p className="text-muted font-medium max-w-md">
                We couldn't find any implements matching your current filter choices or search query.
              </p>
              <button 
                onClick={handleResetFilters}
                className="mt-6 px-6 py-3 bg-[var(--color-brand-green)] text-white font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[var(--color-brand-green)]/30 text-sm"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            /* IMPLEMENTS PRESENTATION GRID / LIST */
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {implementsList.map((item) => {
                const primaryImage = item.videoThumbnailUrl || item.brand?.logoUrl || null;
                const priceFormatted = formatPrice(item.priceMin, item.priceMax);

                if (viewMode === 'list') {
                  return (
                     <Link 
                       key={item.id} 
                       href={`/implements/${item.slug || item.id}`} 
                       className="spatial-card flex flex-col sm:flex-row gap-6 p-6 rounded-[2.5rem] hover:border-[var(--color-brand-green)]/40 hover:shadow-xl transition-all duration-300 group bg-background relative overflow-hidden"
                     >
                       {/* Media Preview Box */}
                       <div className="w-full sm:w-64 h-48 bg-gradient-to-br from-foreground/5 to-transparent rounded-[1.5rem] p-4 flex items-center justify-center relative overflow-hidden group/img shrink-0 border border-[var(--border-subtle)]">
                         {item.brand?.name && (
                           <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-md text-foreground text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-[var(--border-subtle)] z-10">
                             {item.brand.name}
                           </div>
                         )}
                         {primaryImage ? (
                            <img 
                              src={primaryImage} 
                              alt={item.modelName} 
                              className="w-full h-full object-contain group-hover/img:scale-110 transition-transform duration-500 relative z-0" 
                            />
                          ) : (
                            <Wrench className="w-16 h-16 text-foreground/20 group-hover/img:scale-110 transition-all duration-500" strokeWidth={1} />
                          )}
                       </div>
                       
                       {/* Content Info */}
                       <div className="flex-1 flex flex-col py-1">
                         <div className="flex justify-between items-start mb-2 gap-4">
                           <div>
                             <p className="text-[10px] font-black text-[var(--color-brand-green)] uppercase tracking-[0.2em]">
                               {item.category?.name || 'Implement'}
                             </p>
                             <h3 className="text-2xl font-black text-foreground mt-1 group-hover:text-[var(--color-brand-green)] transition-colors tracking-tight">
                               {item.modelName}
                             </h3>
                           </div>
                           <div className="text-right shrink-0">
                             <p className="text-[11px] text-muted font-bold mb-1 uppercase tracking-wider">Estimated Price</p>
                             <p className="text-xl sm:text-2xl font-black text-foreground tracking-tight">{priceFormatted}</p>
                           </div>
                         </div>
                         
                         {item.description && (
                           <p className="text-xs text-muted line-clamp-2 max-w-xl mb-3 font-medium leading-relaxed">
                             {item.description}
                           </p>
                         )}

                         {/* Dynamic Specification Badges */}
                         {renderDynamicSpecs(item.additionalSpecs)}
                         
                         {/* Bottom Meta & Actions */}
                         <div className="mt-auto pt-4 flex flex-wrap items-center gap-2">
                            {(item.compatibleHpMin || item.compatibleHpMax) && (
                              <span className="bg-foreground/5 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-[var(--border-subtle)]">
                                <Gauge size={14} className="text-[var(--color-brand-green)]" />
                                {item.compatibleHpMin && item.compatibleHpMax 
                                  ? `${item.compatibleHpMin} - ${item.compatibleHpMax} HP`
                                  : item.compatibleHpMin ? `>= ${item.compatibleHpMin} HP` : `<= ${item.compatibleHpMax} HP`}
                              </span>
                            )}

                            {item.workingWidthFt && (
                              <span className="bg-foreground/5 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-[var(--border-subtle)]">
                                <Layers size={14} className="text-[var(--color-brand-orange)]" />
                                {item.workingWidthFt} Ft Width
                              </span>
                            )}

                            {item.weightKg && (
                              <span className="bg-foreground/5 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-[var(--border-subtle)]">
                                <Weight size={14} className="text-blue-500" />
                                {item.weightKg} Kg
                              </span>
                            )}

                            {item.usageType && (
                              <span className="bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] px-3 py-1.5 rounded-xl text-xs font-bold border border-[var(--color-brand-green)]/20">
                                {item.usageType}
                              </span>
                            )}

                            <div className="ml-auto flex items-center gap-2">
                              {item.brochureUrl && (
                                <a 
                                  href={item.brochureUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="p-2 bg-foreground/5 hover:bg-foreground/10 text-foreground rounded-xl transition-colors"
                                  title="Download Brochure"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <FileText size={16} />
                                </a>
                              )}
                              
                              <span className="flex items-center gap-2 text-xs font-black text-[var(--color-brand-green)] group-hover:text-[var(--color-brand-orange)] transition-colors uppercase tracking-widest bg-[var(--color-brand-green)]/10 px-4 py-2.5 rounded-xl border border-[var(--color-brand-green)]/20">
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
                    className="spatial-card flex flex-col overflow-hidden relative group cursor-pointer transition-all duration-500 rounded-[2.5rem] p-5 hover:border-[var(--color-brand-green)]/40 hover:shadow-[0_20px_40px_-10px_rgba(74,118,53,0.15)] hover:-translate-y-2 bg-background flex-1 justify-between border border-[var(--border-subtle)]"
                  >
                    <div>
                      {/* Top Brand & Category Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] font-black text-[var(--color-brand-green)] uppercase tracking-[0.2em] truncate">
                          {item.brand?.name || 'Equipment'}
                        </span>
                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-foreground/5 text-muted border border-[var(--border-subtle)] uppercase tracking-wider shrink-0">
                          {item.category?.name || 'Implement'}
                        </span>
                      </div>
                      
                      {/* Media Image Container */}
                      <div className="h-48 w-full rounded-2xl bg-gradient-to-br from-foreground/5 to-transparent border border-[var(--border-subtle)] flex items-center justify-center relative mb-5 overflow-hidden group/img p-4">
                        {primaryImage ? (
                          <img 
                            src={primaryImage} 
                            alt={item.modelName} 
                            className="w-full h-full object-contain group-hover/img:scale-110 transition-transform duration-500 relative z-0"
                          />
                        ) : (
                          <Wrench className="w-20 h-20 text-foreground/20 group-hover/img:scale-110 transition-all duration-500" strokeWidth={1} />
                        )}

                        {item.brochureUrl && (
                          <a 
                            href={item.brochureUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="absolute top-3 right-3 bg-background/80 backdrop-blur-md p-2 rounded-xl text-foreground hover:text-[var(--color-brand-green)] transition-colors border border-[var(--border-subtle)] shadow-sm z-10"
                            title="Download Brochure"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FileText size={14} />
                          </a>
                        )}
                      </div>

                      {/* Content Section */}
                      <div className="px-1 flex flex-col gap-2">
                        <h3 className="text-xl font-black text-foreground tracking-tight line-clamp-1 group-hover:text-[var(--color-brand-green)] transition-colors">
                          {item.modelName}
                        </h3>
                        
                        {/* Specifications Pills */}
                        <div className="flex flex-wrap gap-1.5 text-[11px] font-bold mt-1">
                          {(item.compatibleHpMin || item.compatibleHpMax) && (
                            <span className="bg-foreground/5 px-2.5 py-1 rounded-lg text-foreground flex items-center gap-1 border border-[var(--border-subtle)]">
                              <Gauge size={12} className="text-[var(--color-brand-green)]" />
                              {item.compatibleHpMin && item.compatibleHpMax 
                                ? `${item.compatibleHpMin}-${item.compatibleHpMax} HP`
                                : item.compatibleHpMin ? `>= ${item.compatibleHpMin} HP` : `<= ${item.compatibleHpMax} HP`}
                            </span>
                          )}
                          {item.workingWidthFt && (
                            <span className="bg-foreground/5 px-2.5 py-1 rounded-lg text-foreground border border-[var(--border-subtle)]">
                              {item.workingWidthFt} Ft
                            </span>
                          )}
                          {item.weightKg && (
                            <span className="bg-foreground/5 px-2.5 py-1 rounded-lg text-foreground border border-[var(--border-subtle)]">
                              {item.weightKg} kg
                            </span>
                          )}
                        </div>

                        {/* Dynamic Specifications */}
                        {renderDynamicSpecs(item.additionalSpecs)}
                      </div>
                    </div>

                    {/* Pricing & CTA */}
                    <div className="mt-6 border-t border-[var(--border-subtle)] pt-4 flex items-end justify-between">
                      <div>
                        <p className="text-[10px] text-muted font-black mb-0.5 uppercase tracking-wider">Estimated Price</p>
                        <p className="text-lg md:text-xl font-black text-foreground tracking-tight">{priceFormatted}</p>
                      </div>
                      <span className="h-11 w-11 rounded-full bg-[var(--color-brand-green)] text-white flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-transform shadow-lg shadow-[var(--color-brand-green)]/30">
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
            <div className="flex items-center justify-center gap-3 mt-12 mb-8">
              <button 
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${page === 1 ? 'bg-foreground/5 text-muted cursor-not-allowed' : 'bg-background border border-[var(--border-subtle)] hover:border-[var(--color-brand-green)] hover:text-[var(--color-brand-green)] hover:shadow-lg'}`}
              >
                <ChevronLeft size={18} strokeWidth={3} />
              </button>
              
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  if (totalPages > 7) {
                    if (pageNum !== 1 && pageNum !== totalPages && Math.abs(page - pageNum) > 1) {
                      if (pageNum === 2 || pageNum === totalPages - 1) return <span key={pageNum} className="text-muted px-1">...</span>;
                      return null;
                    }
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-11 h-11 rounded-full font-black text-xs transition-all ${page === pageNum ? 'bg-[var(--color-brand-green)] text-white shadow-lg shadow-[var(--color-brand-green)]/30 scale-105' : 'bg-transparent text-muted hover:bg-foreground/5 hover:text-foreground'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${page === totalPages ? 'bg-foreground/5 text-muted cursor-not-allowed' : 'bg-background border border-[var(--border-subtle)] hover:border-[var(--color-brand-green)] hover:text-[var(--color-brand-green)] hover:shadow-lg'}`}
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
    <Suspense fallback={
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[var(--color-brand-green)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ImplementsListingContent />
    </Suspense>
  );
}
