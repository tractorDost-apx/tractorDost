'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, ChevronRight, Star, Tractor, Filter, X, Grid3X3, List, ChevronLeft } from 'lucide-react';
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
        console.error("Failed to load brands", err);
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
        console.error("Failed to fetch brand details", err);
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
        console.error("Failed to load tractors", err);
      } finally {
        setLoading(false);
      }
    };
    
    const debounce = setTimeout(() => {
      fetchTractors();
    }, 400); // 400ms debounce
    return () => clearTimeout(debounce);
  }, [page, searchQuery, selectedBrand, selectedFamily, selectedHp, selectedDrive, selectedFuel, selectedPrice]);

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
    <div className="w-full max-w-[1440px] mx-auto min-h-screen flex flex-col pt-8 pb-24 px-4 sm:px-6 lg:px-8 animate-fade-in">
      
      {/* HEADER / HERO COMPACT */}
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
              <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-2">
                {activeBrandDetails.name} Tractors
              </h1>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                {activeBrandDetails.isFeatured && (
                  <span className="px-3 py-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-full text-xs font-bold border border-yellow-500/20 uppercase tracking-wider flex items-center gap-1">
                    <Star size={12} className="fill-current" /> Featured
                  </span>
                )}
                {activeBrandDetails.foundedYear && (
                  <span className="px-3 py-1 bg-background/60 backdrop-blur-md rounded-full text-xs font-bold text-muted border border-[var(--border-subtle)] uppercase tracking-wider">
                    Est. {activeBrandDetails.foundedYear}
                  </span>
                )}
                {activeBrandDetails.country && (
                  <span className="px-3 py-1 bg-background/60 backdrop-blur-md rounded-full text-xs font-bold text-muted border border-[var(--border-subtle)] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-brand-orange)]"></span>
                    {activeBrandDetails.country}
                  </span>
                )}
                <span className="px-3 py-1 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] rounded-full text-xs font-bold border border-[var(--color-brand-green)]/20 uppercase tracking-wider">
                  {totalTractors} Tractors Found
                </span>
              </div>

              {activeBrandDetails.aboutBrand && (
                <div 
                  className="text-muted font-medium text-sm md:text-base leading-relaxed max-w-4xl max-h-24 overflow-y-auto custom-scrollbar pr-2"
                  dangerouslySetInnerHTML={{ __html: activeBrandDetails.aboutBrand }}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-[var(--color-brand-green)]/10 to-[var(--color-brand-orange)]/10 rounded-[2.5rem] p-8 md:p-12 mb-10 flex flex-col md:flex-row items-center justify-between border border-[var(--border-subtle)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-brand-green)]/20 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="z-10 flex flex-col gap-3">
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">Explore Tractors</h1>
            <p className="text-muted font-bold text-lg max-w-2xl">Find the most reliable and powerful machines for your farm. Browse through our premium catalog of tractors.</p>
          </div>
          
          {/* Total Count Badge */}
          <div className="mt-6 md:mt-0 z-10 bg-background/80 backdrop-blur-md border border-[var(--border-subtle)] px-6 py-4 rounded-2xl flex flex-col items-center">
            <span className="text-3xl font-black text-[var(--color-brand-green)]">{totalTractors}</span>
            <span className="text-[10px] uppercase font-black tracking-widest text-muted">Tractors Found</span>
          </div>
        </div>
      )}

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
              <h3 className="text-xl font-black tracking-tight">Filters</h3>
              {(selectedBrand !== '' || selectedFamily !== '' || selectedHp !== '' || selectedDrive !== '' || selectedFuel !== '' || selectedPrice !== '' || searchQuery !== '') && (
                <button 
                  onClick={() => { setSelectedBrand(''); setSelectedFamily(''); setSelectedHp(''); setSelectedDrive(''); setSelectedFuel(''); setSelectedPrice(''); setSearchQuery(''); setPage(1); }}
                  className="text-xs font-bold text-[var(--color-brand-orange)] hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Filter: Search */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-black uppercase text-muted tracking-widest">Search</span>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input 
                  type="text"
                  placeholder="Model name..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  className="w-full bg-background border border-[var(--border-subtle)] rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:outline-none focus:border-[var(--color-brand-green)]/50 transition-colors"
                />
              </div>
            </div>

            {/* Filter: Brands */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-black uppercase text-muted tracking-widest">Brands</span>
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                <label 
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedBrand('');
                    setSelectedFamily('');
                    setPage(1);
                  }}
                >
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedBrand === '' ? 'bg-[var(--color-brand-green)] border-[var(--color-brand-green)]' : 'border-[var(--border-subtle)] group-hover:border-[var(--color-brand-green)]'}`}>
                    {selectedBrand === '' && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                  </div>
                  <span className={`text-sm font-bold ${selectedBrand === '' ? 'text-foreground' : 'text-muted group-hover:text-foreground'}`}>All Brands</span>
                </label>
                
                {brands.map(brand => (
                  <label 
                    key={brand.id} 
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedBrand(brand.id);
                      setSelectedFamily('');
                      setPage(1);
                    }}
                  >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedBrand === brand.id ? 'bg-[var(--color-brand-green)] border-[var(--color-brand-green)]' : 'border-[var(--border-subtle)] group-hover:border-[var(--color-brand-green)]'}`}>
                      {selectedBrand === brand.id && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                    </div>
                    <span className={`text-sm font-bold ${selectedBrand === brand.id ? 'text-foreground' : 'text-muted group-hover:text-foreground'}`}>{brand.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter: HP Range */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-black uppercase text-muted tracking-widest">HP Range</span>
              <div className="flex flex-col gap-2">
                {[
                  { value: '', label: 'Any HP' },
                  { value: 'under30', label: 'Under 30 HP (Mini)' },
                  { value: '30to50', label: '30 - 50 HP (Utility)' },
                  { value: 'over50', label: 'Above 50 HP (Heavy)' },
                ].map((hp) => (
                   <label 
                      key={hp.value} 
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedHp(hp.value);
                        setPage(1);
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

            {/* Filter: Drive Type */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-black uppercase text-muted tracking-widest">Drive Type</span>
              <div className="flex flex-col gap-2">
                {[
                  { value: '', label: 'All Types' },
                  { value: 'TWO_WD', label: '2WD' },
                  { value: 'FOUR_WD', label: '4WD' },
                ].map((drive) => (
                   <label 
                      key={drive.value} 
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedDrive(drive.value);
                        setPage(1);
                      }}
                    >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedDrive === drive.value ? 'bg-[var(--color-brand-green)] border-[var(--color-brand-green)]' : 'border-[var(--border-subtle)] group-hover:border-[var(--color-brand-green)]'}`}>
                      {selectedDrive === drive.value && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                    </div>
                    <span className={`text-sm font-bold ${selectedDrive === drive.value ? 'text-foreground' : 'text-muted group-hover:text-foreground'}`}>{drive.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter: Fuel Type */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-black uppercase text-muted tracking-widest">Fuel Type</span>
              <div className="flex flex-col gap-2">
                {[
                  { value: '', label: 'All Fuel' },
                  { value: 'DIESEL', label: 'Diesel' },
                  { value: 'ELECTRIC', label: 'Electric' },
                  { value: 'CNG', label: 'CNG' },
                ].map((fuel) => (
                   <label 
                      key={fuel.value} 
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedFuel(fuel.value);
                        setPage(1);
                      }}
                    >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedFuel === fuel.value ? 'bg-[var(--color-brand-green)] border-[var(--color-brand-green)]' : 'border-[var(--border-subtle)] group-hover:border-[var(--color-brand-green)]'}`}>
                      {selectedFuel === fuel.value && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                    </div>
                    <span className={`text-sm font-bold ${selectedFuel === fuel.value ? 'text-foreground' : 'text-muted group-hover:text-foreground'}`}>{fuel.label}</span>
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
                  { value: 'under5', label: 'Under ₹ 5 Lakh' },
                  { value: '5to10', label: '₹ 5 - 10 Lakh' },
                  { value: 'over10', label: 'Above ₹ 10 Lakh' },
                ].map((price) => (
                   <label 
                      key={price.value} 
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedPrice(price.value);
                        setPage(1);
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
          
          {/* Top Bar Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-background/50 backdrop-blur-md p-4 border border-[var(--border-subtle)] rounded-[1.5rem]">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-bold text-muted">Showing <span className="text-foreground">{tractors.length}</span> results on this page</p>
              
              {/* Active Filter Chips */}
              {(selectedBrand !== '' || selectedHp !== '' || selectedDrive !== '' || selectedFuel !== '' || selectedPrice !== '') && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedBrand !== '' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] text-xs font-bold rounded-full">
                      {brands.find(b => b.id === selectedBrand)?.name || 'Brand'}
                      <button onClick={() => { setSelectedBrand(''); setPage(1); }} className="hover:text-[var(--color-brand-orange)]"><X size={12} strokeWidth={3} /></button>
                    </span>
                  )}
                  {selectedHp !== '' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] text-xs font-bold rounded-full">
                      {selectedHp === 'under30' ? 'Under 30 HP' : selectedHp === '30to50' ? '30 - 50 HP' : 'Above 50 HP'}
                      <button onClick={() => { setSelectedHp(''); setPage(1); }} className="hover:text-[var(--color-brand-orange)]"><X size={12} strokeWidth={3} /></button>
                    </span>
                  )}
                  {selectedDrive !== '' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] text-xs font-bold rounded-full">
                      {selectedDrive === 'TWO_WD' ? '2WD' : '4WD'}
                      <button onClick={() => { setSelectedDrive(''); setPage(1); }} className="hover:text-[var(--color-brand-orange)]"><X size={12} strokeWidth={3} /></button>
                    </span>
                  )}
                  {selectedFuel !== '' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] text-xs font-bold rounded-full">
                      {selectedFuel === 'DIESEL' ? 'Diesel' : selectedFuel === 'ELECTRIC' ? 'Electric' : 'CNG'}
                      <button onClick={() => { setSelectedFuel(''); setPage(1); }} className="hover:text-[var(--color-brand-orange)]"><X size={12} strokeWidth={3} /></button>
                    </span>
                  )}
                  {selectedPrice !== '' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] text-xs font-bold rounded-full">
                      {selectedPrice === 'under5' ? 'Under ₹ 5L' : selectedPrice === '5to10' ? '₹ 5L - 10L' : 'Above ₹ 10L'}
                      <button onClick={() => { setSelectedPrice(''); setPage(1); }} className="hover:text-[var(--color-brand-orange)]"><X size={12} strokeWidth={3} /></button>
                    </span>
                  )}
                  <button onClick={() => { setSelectedBrand(''); setSelectedHp(''); setSelectedDrive(''); setSelectedFuel(''); setSelectedPrice(''); setSearchQuery(''); setPage(1); }} className="text-xs font-bold text-muted hover:text-foreground ml-2 underline underline-offset-2">
                    Clear All
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-colors ${viewMode === 'grid' ? 'bg-[var(--color-brand-green)] text-white' : 'bg-foreground/5 text-muted hover:text-foreground'}`}
              >
                <Grid3X3 size={20} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl transition-colors ${viewMode === 'list' ? 'bg-[var(--color-brand-green)] text-white' : 'bg-foreground/5 text-muted hover:text-foreground'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>

          {/* Grid Layout */}
          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {Array.from({ length: 6 }).map((_, i) => (
                 <div key={i} className="h-[400px] bg-foreground/5 rounded-[2.5rem] animate-pulse" />
               ))}
             </div>
          ) : tractors.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-center bg-foreground/5 rounded-[2.5rem] border border-dashed border-[var(--border-subtle)]">
              <Tractor size={64} className="text-muted mb-4 opacity-30" strokeWidth={1} />
              <h3 className="text-2xl font-black text-foreground mb-2">No tractors found</h3>
              <p className="text-muted font-medium">Try adjusting your filters or search query.</p>
              <button 
                onClick={() => { setSelectedBrand(''); setSelectedHp(''); setSelectedDrive(''); setSelectedFuel(''); setSelectedPrice(''); setSearchQuery(''); setPage(1); }}
                className="mt-6 px-6 py-3 bg-[var(--color-brand-green)] text-white font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[var(--color-brand-green)]/30"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {tractors.map((tractor) => {
                const primaryImage = tractor.media && tractor.media.length > 0 
                  ? (tractor.media.find(m => m.isPrimary)?.url || tractor.media[0].url) 
                  : null;

                if (viewMode === 'list') {
                  return (
                     <Link key={tractor.id} href={`/tractors/${tractor.id}`} className="spatial-card flex flex-col sm:flex-row gap-6 p-6 rounded-[2rem] hover:border-[var(--color-brand-green)]/30 hover:shadow-xl transition-all duration-300 group bg-background">
                       <div className="w-full sm:w-64 h-48 bg-gradient-to-br from-foreground/5 to-transparent rounded-[1.5rem] p-4 flex items-center justify-center relative overflow-hidden group/img shrink-0">
                         {tractor.isFeatured && (
                            <div className="absolute top-3 left-3 bg-[var(--color-brand-orange)] text-white text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest z-10">Featured</div>
                         )}
                         {primaryImage ? (
                            <img src={primaryImage} alt={tractor.modelName} className="w-full h-full object-contain group-hover/img:scale-110 transition-transform duration-500 relative z-0 mix-blend-multiply dark:mix-blend-normal" />
                          ) : (
                            <Tractor className="w-16 h-16 text-foreground/20 group-hover/img:scale-110 transition-all duration-500" strokeWidth={1} />
                          )}
                       </div>
                       
                       <div className="flex-1 flex flex-col py-2">
                         <div className="flex justify-between items-start mb-2">
                           <div>
                             <p className="text-[10px] font-black text-[var(--color-brand-green)] uppercase tracking-[0.2em]">{tractor.brand?.name}</p>
                             <h3 className="text-2xl font-black text-foreground mt-1 group-hover:text-[var(--color-brand-green)] transition-colors">{tractor.modelName}</h3>
                           </div>
                           <div className="text-right">
                             <p className="text-[11px] text-muted font-bold mb-1 uppercase tracking-wider">Starting Price</p>
                             <p className="text-2xl font-black text-foreground tracking-tight">{formatPrice(tractor.exShowroomPriceMin)}</p>
                           </div>
                         </div>
                         
                         <p className="text-sm text-muted line-clamp-2 max-w-xl mb-4 font-medium">{tractor.overview || "Explore this premium tractor's massive capability, powerful engine, and unmatched reliability."}</p>
                         
                         <div className="mt-auto flex flex-wrap items-center gap-3">
                            <span className="bg-foreground/5 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[var(--color-brand-green)]"/> {tractor.hp || '--'} HP</span>
                            <span className="bg-foreground/5 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[var(--color-brand-orange)]"/> {tractor.driveType === 'FOUR_WD' ? '4WD' : '2WD'}</span>
                            <span className="bg-foreground/5 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"/> {tractor.fuelType === 'DIESEL' ? 'Diesel' : tractor.fuelType}</span>
                            
                            <button className="ml-auto flex items-center gap-2 text-sm font-black text-[var(--color-brand-green)] hover:text-[var(--color-brand-orange)] transition-colors uppercase tracking-widest bg-[var(--color-brand-green)]/10 px-5 py-2.5 rounded-xl">
                              View Details <ChevronRight size={16} strokeWidth={3} />
                            </button>
                         </div>
                       </div>
                     </Link>
                  )
                }
                
                // Grid View
                return (
                  <Link key={tractor.id} href={`/tractors/${tractor.id}`} className="spatial-card flex flex-col overflow-hidden relative group cursor-pointer transition-all duration-500 rounded-[2.5rem] p-5 hover:border-[var(--color-brand-green)]/30 hover:shadow-[0_20px_40px_-10px_rgba(74,118,53,0.15)] hover:-translate-y-2 bg-background">
                    {tractor.isFeatured && (
                      <div className="absolute top-7 right-7 z-10 bg-[var(--color-brand-orange)] text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-md">
                        Featured
                      </div>
                    )}
                    
                    <div className="h-48 w-full rounded-2xl bg-gradient-to-br from-foreground/5 to-transparent border border-[var(--border-subtle)] flex items-center justify-center relative mb-6 overflow-hidden group/img p-4">
                      {primaryImage ? (
                        <img 
                          src={primaryImage} 
                          alt={tractor.modelName} 
                          className="w-full h-full object-contain group-hover/img:scale-110 transition-transform duration-500 relative z-0 mix-blend-multiply dark:mix-blend-normal"
                        />
                      ) : (
                        <Tractor className="w-24 h-24 text-foreground/20 group-hover/img:scale-110 transition-all duration-500" strokeWidth={1} />
                      )}
                    </div>

                    <div className="px-2 flex flex-col gap-3">
                      <div>
                        <p className="text-[10px] font-black text-[var(--color-brand-green)] uppercase tracking-[0.2em]">{tractor.brand?.name}</p>
                        <h3 className="text-xl md:text-2xl font-black text-foreground mt-1 tracking-tight truncate">{tractor.modelName}</h3>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 text-[11px] font-bold mt-1">
                        <span className="bg-foreground/5 px-3 py-1.5 rounded-md text-foreground">{tractor.hp || '--'} HP</span>
                        <span className="bg-foreground/5 px-3 py-1.5 rounded-md text-foreground">{tractor.driveType === 'FOUR_WD' ? '4WD' : '2WD'}</span>
                        <span className="bg-[var(--color-brand-orange)]/10 text-[var(--color-brand-orange)] px-3 py-1.5 rounded-md flex items-center gap-1">★ 4.8</span>
                      </div>
                      
                      <div className="mt-5 border-t border-[var(--panel-border)] pt-5 flex items-end justify-between">
                        <div>
                          <p className="text-[11px] text-muted font-bold mb-1 uppercase tracking-wider">Starting Price</p>
                          <p className="text-xl md:text-[22px] font-black text-foreground tracking-tight">{formatPrice(tractor.exShowroomPriceMin)}</p>
                        </div>
                        <button className="h-12 w-12 rounded-full bg-[var(--color-brand-green)] text-white flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-transform shadow-lg shadow-[var(--color-brand-green)]/30">
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
            <div className="flex items-center justify-center gap-4 mt-12 mb-8">
              <button 
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${page === 1 ? 'bg-foreground/5 text-muted cursor-not-allowed' : 'bg-background border border-[var(--border-subtle)] hover:border-[var(--color-brand-green)] hover:text-[var(--color-brand-green)] hover:shadow-lg'}`}
              >
                <ChevronLeft size={20} strokeWidth={3} />
              </button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  // Extremely simple logic for large number of pages
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
                      className={`w-12 h-12 rounded-full font-black text-sm transition-all ${page === pageNum ? 'bg-[var(--color-brand-green)] text-white shadow-lg shadow-[var(--color-brand-green)]/30 scale-110' : 'bg-transparent text-muted hover:bg-foreground/5 hover:text-foreground'}`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <button 
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${page === totalPages ? 'bg-foreground/5 text-muted cursor-not-allowed' : 'bg-background border border-[var(--border-subtle)] hover:border-[var(--color-brand-green)] hover:text-[var(--color-brand-green)] hover:shadow-lg'}`}
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
    <Suspense fallback={<div className="w-full min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-[var(--color-brand-green)] border-t-transparent rounded-full animate-spin"></div></div>}>
      <TractorsListingContent />
    </Suspense>
  );
}
