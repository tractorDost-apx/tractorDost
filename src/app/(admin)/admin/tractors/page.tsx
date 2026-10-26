'use client';

import React, { useState, useEffect } from 'react';
import {
  tractorAPI,
  Tractor,
  LaunchStatus,
  FuelType,
  DriveType,
  GetTractorsParams,
} from '@/lib/api/tractors';
import { brandAPI, Brand } from '@/lib/api/brands';
import { tractorFamilyAPI, TractorFamily } from '@/lib/api/tractorFamilies';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Tractor as TractorIcon,
  Settings2,
  Info,
  Image as ImageIcon,
  CheckCircle,
  BarChart,
  Filter,
  RotateCcw,
  X,
  ChevronDown,
  SlidersHorizontal,
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import Pagination from '@/components/shared/Pagination';
import TractorBulkImport from '@/components/admin/tractor-bulk-import/tractor-bulk-import';
import { toast } from '@/components/ui/toast';

export default function TractorsPage() {
  const [tractors, setTractors] = useState<Tractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filter state
  const [search, setSearch] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>('');
  const [launchStatusFilter, setLaunchStatusFilter] = useState<string>('');
  const [fuelTypeFilter, setFuelTypeFilter] = useState<string>('');
  const [driveTypeFilter, setDriveTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'true' | 'false'>('all');

  // HP Range state
  const [hpPreset, setHpPreset] = useState<string>('all');
  const [customHpMin, setCustomHpMin] = useState<string>('');
  const [customHpMax, setCustomHpMax] = useState<string>('');

  // Price Range state
  const [pricePreset, setPricePreset] = useState<string>('all');
  const [customPriceMin, setCustomPriceMin] = useState<string>('');
  const [customPriceMax, setCustomPriceMax] = useState<string>('');

  // Dropdown options
  const [brands, setBrands] = useState<Brand[]>([]);
  const [families, setFamilies] = useState<TractorFamily[]>([]);
  const [loadingFamilies, setLoadingFamilies] = useState(false);

  // Toggle advanced filter panel
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Track which tractor is selected for the details popup modal
  const [selectedTractor, setSelectedTractor] = useState<Tractor | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedTractor(null);
      }
    };
    if (selectedTractor) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedTractor]);

  // Fetch brands on mount
  useEffect(() => {
    let isMounted = true;
    brandAPI
      .getAllBrands({ page: 1, limit: 200, isActive: 'true' })
      .then((res) => {
        if (isMounted && res.success) {
          setBrands(res.data.data || []);
        }
      })
      .catch((err) => {
        console.error('Failed to load brands', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch families when a brand is selected
  useEffect(() => {
    if (!selectedBrandId) {
      setFamilies([]);
      setSelectedFamilyId('');
      return;
    }

    let isMounted = true;
    setLoadingFamilies(true);
    tractorFamilyAPI
      .getFamiliesByBrand(Number(selectedBrandId), { limit: 100 })
      .then((res) => {
        if (isMounted && res.success) {
          setFamilies(res.data.items || []);
        }
      })
      .catch((err) => {
        console.error('Failed to load tractor families', err);
      })
      .finally(() => {
        if (isMounted) setLoadingFamilies(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedBrandId]);

  // Compute HP min & max
  const getHpRange = () => {
    let min: number | undefined;
    let max: number | undefined;

    if (hpPreset === '0-30') {
      max = 30;
    } else if (hpPreset === '31-45') {
      min = 31;
      max = 45;
    } else if (hpPreset === '46-60') {
      min = 46;
      max = 60;
    } else if (hpPreset === '61-75') {
      min = 61;
      max = 75;
    } else if (hpPreset === '76+') {
      min = 76;
    } else if (hpPreset === 'custom') {
      if (customHpMin.trim()) min = Number(customHpMin);
      if (customHpMax.trim()) max = Number(customHpMax);
    }

    if (min !== undefined && max !== undefined && min > max) {
      max = undefined;
    }

    return { min, max };
  };

  // Compute Price min & max
  const getPriceRange = () => {
    let min: number | undefined;
    let max: number | undefined;

    if (pricePreset === '0-500000') {
      max = 500000;
    } else if (pricePreset === '500000-800000') {
      min = 500000;
      max = 800000;
    } else if (pricePreset === '800000-1200000') {
      min = 800000;
      max = 1200000;
    } else if (pricePreset === '1200000+') {
      min = 1200000;
    } else if (pricePreset === 'custom') {
      if (customPriceMin.trim()) min = Number(customPriceMin);
      if (customPriceMax.trim()) max = Number(customPriceMax);
    }

    if (min !== undefined && max !== undefined && min > max) {
      max = undefined;
    }

    return { min, max };
  };

  const fetchTractors = async () => {
    setLoading(true);
    try {
      const { min: hpMin, max: hpMax } = getHpRange();
      const { min: priceMin, max: priceMax } = getPriceRange();

      const params: GetTractorsParams = {
        page,
        limit,
        search: search.trim() || undefined,
        brandId: selectedBrandId ? Number(selectedBrandId) : undefined,
        familyId: selectedFamilyId ? Number(selectedFamilyId) : undefined,
        launchStatus: launchStatusFilter || undefined,
        fuelType: fuelTypeFilter || undefined,
        driveType: driveTypeFilter || undefined,
        hpMin,
        hpMax,
        priceMin,
        priceMax,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'true',
      };

      const response = await tractorAPI.getAllTractors(params);
      if (response.success) {
        const payload = response.data as any;
        setTractors(payload.tractors || payload.data || []);
        setTotalPages(payload.pagination?.totalPages || payload.totalPages || 1);
        setTotalCount(payload.pagination?.total || payload.totalCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch tractors', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTractors();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [
    search,
    selectedBrandId,
    selectedFamilyId,
    launchStatusFilter,
    fuelTypeFilter,
    driveTypeFilter,
    statusFilter,
    hpPreset,
    customHpMin,
    customHpMax,
    pricePreset,
    customPriceMin,
    customPriceMax,
    page,
    limit,
  ]);

  const activeFiltersCount = [
    Boolean(search.trim()),
    Boolean(selectedBrandId),
    Boolean(selectedFamilyId),
    Boolean(launchStatusFilter),
    Boolean(fuelTypeFilter),
    Boolean(driveTypeFilter),
    Boolean(statusFilter !== 'all'),
    Boolean(hpPreset !== 'all' || customHpMin || customHpMax),
    Boolean(pricePreset !== 'all' || customPriceMin || customPriceMax),
  ].filter(Boolean).length;

  const hasActiveFilters = activeFiltersCount > 0;

  const resetFilters = () => {
    setSearch('');
    setSelectedBrandId('');
    setSelectedFamilyId('');
    setLaunchStatusFilter('');
    setFuelTypeFilter('');
    setDriveTypeFilter('');
    setStatusFilter('all');
    setHpPreset('all');
    setCustomHpMin('');
    setCustomHpMax('');
    setPricePreset('all');
    setCustomPriceMin('');
    setCustomPriceMax('');
    setPage(1);
  };


  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this tractor?')) {
      try {
        await tractorAPI.deleteTractor(id);
        toast.success('Tractor deleted successfully');
        fetchTractors();
      } catch (error) {
        toast.error('Failed to delete tractor.');
      }
    }
  };

  const formatPrice = (price: number | null | undefined) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: LaunchStatus) => {
    switch (status) {
      case LaunchStatus.LATEST:
        return 'bg-blue-500/10 text-blue-500';
      case LaunchStatus.POPULAR:
        return 'bg-[var(--color-brand-orange)]/10 text-[var(--color-brand-orange)]';
      case LaunchStatus.UPCOMING:
        return 'bg-purple-500/10 text-purple-500';
      case LaunchStatus.DISCONTINUED:
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-foreground/10 text-foreground';
    }
  };

  const getHpPresetLabel = (preset: string) => {
    switch (preset) {
      case '0-30':
        return '< 30 HP';
      case '31-45':
        return '31-45 HP';
      case '46-60':
        return '46-60 HP';
      case '61-75':
        return '61-75 HP';
      case '76+':
        return '> 75 HP';
      case 'custom':
        return `${customHpMin || 0}-${customHpMax || '∞'} HP`;
      default:
        return '';
    }
  };

  const getPricePresetLabel = (preset: string) => {
    switch (preset) {
      case '0-500000':
        return '< ₹5L';
      case '500000-800000':
        return '₹5L - ₹8L';
      case '800000-1200000':
        return '₹8L - ₹12L';
      case '1200000+':
        return '> ₹12L';
      case 'custom':
        return `₹${customPriceMin || 0} - ₹${customPriceMax || '∞'}`;
      default:
        return '';
    }
  };

  return (
    <div className="animate-fade-in flex flex-1 h-full w-full flex-col gap-4 sm:gap-5 pb-2">
      {/* Header section */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground text-3xl font-black tracking-tight">Tractor Catalog</h1>
          <p className="text-muted mt-1 text-sm font-bold">
            Deep analysis & master view of all tractors in the database.
          </p>
        </div>
        <div className="flex gap-3">
          <TractorBulkImport onImported={() => fetchTractors()} />
          <Link
            href="/admin/tractors/new"
            className="spatial-button flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm whitespace-nowrap shadow-lg"
          >
            <Plus size={16} /> Add New Tractor
          </Link>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="glass-panel flex flex-col gap-3 rounded-2xl p-4 sm:p-5">
        {/* Primary Controls Row */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 items-center">
          {/* Search box */}
          <div className="group relative sm:col-span-2 lg:col-span-2">
            <div className="text-muted pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 transition-colors group-focus-within:text-[var(--color-brand-green)]">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search by model, code, brand, or category..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 py-2.5 pr-8 pl-10 text-xs font-medium text-foreground placeholder:text-muted transition-all focus:border-[var(--color-brand-green)] focus:bg-background focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted hover:text-foreground cursor-pointer"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Brand Filter */}
          <div>
            <select
              value={selectedBrandId}
              onChange={(e) => {
                setSelectedBrandId(e.target.value);
                setSelectedFamilyId('');
                setPage(1);
              }}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2.5 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:bg-background focus:outline-none cursor-pointer"
            >
              <option value="">All Brands</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tractor Family Filter */}
          <div>
            <select
              value={selectedFamilyId}
              disabled={!selectedBrandId || loadingFamilies}
              onChange={(e) => {
                setSelectedFamilyId(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2.5 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:bg-background focus:outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">
                {!selectedBrandId
                  ? 'All Families (Select brand)'
                  : loadingFamilies
                    ? 'Loading families...'
                    : families.length === 0
                      ? 'No families found'
                      : 'All Families'}
              </option>
              {families.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Launch Status Filter */}
          <div>
            <select
              value={launchStatusFilter}
              onChange={(e) => {
                setLaunchStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2.5 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:bg-background focus:outline-none cursor-pointer"
            >
              <option value="">All Launch Statuses</option>
              <option value={LaunchStatus.LATEST}>Latest</option>
              <option value={LaunchStatus.POPULAR}>Popular</option>
              <option value={LaunchStatus.UPCOMING}>Upcoming</option>
              <option value={LaunchStatus.DISCONTINUED}>Discontinued</option>
            </select>
          </div>
        </div>

        {/* Action & Toggle Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-1.5 text-xs font-bold text-foreground hover:bg-foreground/10 transition-colors cursor-pointer"
          >
            <SlidersHorizontal size={14} className="text-[var(--color-brand-green)]" />
            <span>{showAdvancedFilters ? 'Fewer Filters' : 'More Filters (HP, Price, Fuel, Drive...)'}</span>
            {activeFiltersCount > 0 && !showAdvancedFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-brand-green)] text-[10px] font-black text-white">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${showAdvancedFilters ? 'rotate-180' : ''}`}
            />
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-500/10 dark:text-rose-400 transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        {/* Advanced Filters Expandable Grid */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 pt-3 border-t border-[var(--border-subtle)]">
            {/* Fuel Type Filter */}
            <div>
              <label className="text-muted mb-1 block text-[10px] font-black tracking-wider uppercase">
                Fuel Type
              </label>
              <select
                value={fuelTypeFilter}
                onChange={(e) => {
                  setFuelTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:bg-background focus:outline-none cursor-pointer"
              >
                <option value="">All Fuel Types</option>
                <option value={FuelType.DIESEL}>Diesel</option>
                <option value={FuelType.ELECTRIC}>Electric</option>
                <option value={FuelType.CNG}>CNG</option>
                <option value={FuelType.PETROL}>Petrol</option>
              </select>
            </div>

            {/* Drive Type Filter */}
            <div>
              <label className="text-muted mb-1 block text-[10px] font-black tracking-wider uppercase">
                Drive Type
              </label>
              <select
                value={driveTypeFilter}
                onChange={(e) => {
                  setDriveTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:bg-background focus:outline-none cursor-pointer"
              >
                <option value="">All Drive Types</option>
                <option value={DriveType.TWO_WD}>2WD (Two Wheel Drive)</option>
                <option value={DriveType.FOUR_WD}>4WD (Four Wheel Drive)</option>
              </select>
            </div>

            {/* Horsepower (HP) Range */}
            <div>
              <label className="text-muted mb-1 block text-[10px] font-black tracking-wider uppercase">
                Horsepower (HP)
              </label>
              <select
                value={hpPreset}
                onChange={(e) => {
                  setHpPreset(e.target.value);
                  if (e.target.value !== 'custom') {
                    setCustomHpMin('');
                    setCustomHpMax('');
                  }
                  setPage(1);
                }}
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:bg-background focus:outline-none cursor-pointer"
              >
                <option value="all">All HP</option>
                <option value="0-30">Under 30 HP</option>
                <option value="31-45">31 - 45 HP</option>
                <option value="46-60">46 - 60 HP</option>
                <option value="61-75">61 - 75 HP</option>
                <option value="76+">Above 75 HP</option>
                <option value="custom">Custom HP Range...</option>
              </select>
              {hpPreset === 'custom' && (
                <div className="mt-2 flex items-center gap-1.5">
                  <input
                    type="number"
                    placeholder="Min"
                    min={0}
                    max={1000}
                    value={customHpMin}
                    onChange={(e) => {
                      setCustomHpMin(e.target.value);
                      setPage(1);
                    }}
                    className="w-1/2 rounded-lg border border-[var(--border-subtle)] bg-foreground/5 px-2 py-1 text-xs text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
                  />
                  <span className="text-muted text-xs">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    min={0}
                    max={1000}
                    value={customHpMax}
                    onChange={(e) => {
                      setCustomHpMax(e.target.value);
                      setPage(1);
                    }}
                    className="w-1/2 rounded-lg border border-[var(--border-subtle)] bg-foreground/5 px-2 py-1 text-xs text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="text-muted mb-1 block text-[10px] font-black tracking-wider uppercase">
                Price Range
              </label>
              <select
                value={pricePreset}
                onChange={(e) => {
                  setPricePreset(e.target.value);
                  if (e.target.value !== 'custom') {
                    setCustomPriceMin('');
                    setCustomPriceMax('');
                  }
                  setPage(1);
                }}
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:bg-background focus:outline-none cursor-pointer"
              >
                <option value="all">All Prices</option>
                <option value="0-500000">Under ₹5 Lakh</option>
                <option value="500000-800000">₹5 Lakh - ₹8 Lakh</option>
                <option value="800000-1200000">₹8 Lakh - ₹12 Lakh</option>
                <option value="1200000+">Above ₹12 Lakh</option>
                <option value="custom">Custom (₹)...</option>
              </select>
              {pricePreset === 'custom' && (
                <div className="mt-2 flex items-center gap-1.5">
                  <input
                    type="number"
                    placeholder="Min ₹"
                    min={0}
                    value={customPriceMin}
                    onChange={(e) => {
                      setCustomPriceMin(e.target.value);
                      setPage(1);
                    }}
                    className="w-1/2 rounded-lg border border-[var(--border-subtle)] bg-foreground/5 px-2 py-1 text-xs text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
                  />
                  <span className="text-muted text-xs">-</span>
                  <input
                    type="number"
                    placeholder="Max ₹"
                    min={0}
                    value={customPriceMax}
                    onChange={(e) => {
                      setCustomPriceMax(e.target.value);
                      setPage(1);
                    }}
                    className="w-1/2 rounded-lg border border-[var(--border-subtle)] bg-foreground/5 px-2 py-1 text-xs text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Status / Visibility */}
            <div>
              <label className="text-muted mb-1 block text-[10px] font-black tracking-wider uppercase">
                Catalog Visibility
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:bg-background focus:outline-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="true">Active Only</option>
                <option value="false">Inactive Only</option>
              </select>
            </div>
          </div>
        )}

        {/* Status bar & Active Filter Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-3 text-xs font-bold">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg bg-[var(--color-brand-green)]/10 px-3 py-1.5 text-[var(--color-brand-green)]">
              <TractorIcon size={16} />
              <span>Total Tractors: {totalCount}</span>
            </div>
            {hasActiveFilters && (
              <span className="text-muted text-[11px] font-semibold">
                (Filtered view: {activeFiltersCount} active filter{activeFiltersCount > 1 ? 's' : ''})
              </span>
            )}
          </div>

          {/* Active filter pills */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5">
              {selectedBrandId && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-green)]/10 px-2.5 py-0.5 text-[11px] font-bold text-[var(--color-brand-green)]">
                  Brand: {brands.find((b) => b.id === Number(selectedBrandId))?.name || `#${selectedBrandId}`}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBrandId('');
                      setSelectedFamilyId('');
                      setPage(1);
                    }}
                    className="hover:opacity-75 cursor-pointer ml-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {selectedFamilyId && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-green)]/10 px-2.5 py-0.5 text-[11px] font-bold text-[var(--color-brand-green)]">
                  Family: {families.find((f) => f.id === Number(selectedFamilyId))?.name || `#${selectedFamilyId}`}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFamilyId('');
                      setPage(1);
                    }}
                    className="hover:opacity-75 cursor-pointer ml-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {launchStatusFilter && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-orange)]/10 px-2.5 py-0.5 text-[11px] font-bold text-[var(--color-brand-orange)]">
                  Status: {launchStatusFilter}
                  <button
                    type="button"
                    onClick={() => {
                      setLaunchStatusFilter('');
                      setPage(1);
                    }}
                    className="hover:opacity-75 cursor-pointer ml-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {fuelTypeFilter && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-bold text-blue-500">
                  Fuel: {fuelTypeFilter}
                  <button
                    type="button"
                    onClick={() => {
                      setFuelTypeFilter('');
                      setPage(1);
                    }}
                    className="hover:opacity-75 cursor-pointer ml-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {driveTypeFilter && (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-bold text-purple-500">
                  Drive: {driveTypeFilter === DriveType.TWO_WD ? '2WD' : '4WD'}
                  <button
                    type="button"
                    onClick={() => {
                      setDriveTypeFilter('');
                      setPage(1);
                    }}
                    className="hover:opacity-75 cursor-pointer ml-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {(hpPreset !== 'all' || customHpMin || customHpMax) && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  HP: {getHpPresetLabel(hpPreset)}
                  <button
                    type="button"
                    onClick={() => {
                      setHpPreset('all');
                      setCustomHpMin('');
                      setCustomHpMax('');
                      setPage(1);
                    }}
                    className="hover:opacity-75 cursor-pointer ml-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {(pricePreset !== 'all' || customPriceMin || customPriceMax) && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  Price: {getPricePresetLabel(pricePreset)}
                  <button
                    type="button"
                    onClick={() => {
                      setPricePreset('all');
                      setCustomPriceMin('');
                      setCustomPriceMax('');
                      setPage(1);
                    }}
                    className="hover:opacity-75 cursor-pointer ml-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-foreground/10 px-2.5 py-0.5 text-[11px] font-bold text-foreground">
                  {statusFilter === 'true' ? 'Active only' : 'Inactive only'}
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('all');
                      setPage(1);
                    }}
                    className="hover:opacity-75 cursor-pointer ml-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel flex flex-1 flex-col overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-foreground/5 text-muted text-[11px] font-black tracking-wider uppercase">
              <tr>
                <th className="px-6 py-4">Tractor Profile</th>
                <th className="px-6 py-4">Power & Engine</th>
                <th className="px-6 py-4">Categories</th>
                <th className="px-6 py-4">Status & Visibility</th>
                <th className="px-6 py-4">Price Range</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-foreground/5 divide-y">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-muted px-6 py-12 text-center font-bold">
                    Loading deep catalog insights...
                  </td>
                </tr>
              ) : tractors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-muted px-6 py-12 text-center font-bold">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <TractorIcon size={32} className="text-muted/40" />
                      <p className="text-foreground text-sm font-bold">
                        No tractors found matching your filters
                      </p>
                      <p className="text-muted text-xs font-normal">
                        Try clearing some filters or searching with a different term.
                      </p>
                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-foreground/5 px-3 py-1.5 text-xs font-bold text-[var(--color-brand-green)] hover:bg-foreground/10 transition-colors cursor-pointer"
                        >
                          <RotateCcw size={12} /> Reset all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                tractors.map((tractor) => {
                  const primaryImage =
                    tractor.media?.find((m) => m.isPrimary) || tractor.media?.[0];

                  return (
                    <tr
                      key={tractor.id}
                      className="hover:bg-[var(--color-brand-green)]/[0.04] group cursor-pointer transition-colors"
                      onClick={() => setSelectedTractor(tractor)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-white p-1 shadow-sm transition-transform group-hover:scale-105">
                            {primaryImage ? (
                              <img
                                src={primaryImage.url}
                                alt={tractor.modelName}
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <TractorIcon size={20} className="text-muted" />
                            )}
                          </div>
                          <div>
                            <div className="text-foreground text-base font-black transition-colors group-hover:text-[var(--color-brand-green)]">
                              {tractor.brand?.name} {tractor.modelName}
                            </div>
                            <div
                              className="text-muted/80 max-w-[150px] truncate text-xs font-bold sm:max-w-[200px]"
                              title={tractor.slug}
                            >
                              {tractor.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-foreground/80 font-black">
                            {tractor.hp ? `${tractor.hp} HP` : 'HP N/A'}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-muted bg-foreground/5 rounded px-1.5 py-0.5 text-[10px] font-bold">
                              {tractor.fuelType}
                            </span>
                            <span className="text-muted text-[10px] font-black tracking-wider uppercase">
                              {tractor.driveType?.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex max-w-[150px] flex-wrap gap-1">
                          {tractor.categories && tractor.categories.length > 0 ? (
                            tractor.categories.map((c, i) => (
                              <span
                                key={i}
                                className="bg-foreground/5 text-foreground/70 rounded-md px-2 py-0.5 text-[10px] font-bold"
                              >
                                {c.category?.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted text-xs">None</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black tracking-wide uppercase ${getStatusColor(tractor.launchStatus)}`}
                          >
                            {tractor.launchStatus}
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-block h-2 w-2 rounded-full ${tractor.isActive ? 'bg-[var(--color-brand-green)]' : 'bg-red-500'}`}
                            />
                            <span className="text-muted text-[10px] font-black tracking-wider uppercase">
                              {tractor.isActive ? 'Active' : 'Inactive'}
                            </span>
                            {tractor.isFeatured && (
                              <span className="text-[10px] font-black tracking-wider text-[var(--color-brand-orange)] uppercase">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-black text-[var(--color-brand-green)]">
                        {tractor.exShowroomPriceMin ? (
                          <span>
                            {formatPrice(tractor.exShowroomPriceMin)}{' '}
                            {tractor.exShowroomPriceMax
                              ? `- ${formatPrice(tractor.exShowroomPriceMax)}`
                              : ''}
                          </span>
                        ) : (
                          <span className="text-muted font-medium">Not Set</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTractor(tractor);
                            }}
                            className="text-foreground/70 rounded-xl p-2 transition-colors hover:bg-[var(--color-brand-green)]/10 hover:text-[var(--color-brand-green)]"
                            title="View Tractor Details Popup"
                          >
                            <Eye size={16} />
                          </button>
                          <Link
                            href={`/admin/tractors/${tractor.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-foreground/70 rounded-xl p-2 transition-colors hover:bg-[var(--color-brand-orange)]/10 hover:text-[var(--color-brand-orange)]"
                            title="Edit Tractor"
                          >
                            <Edit2 size={16} />
                          </Link>
                          <button
                            onClick={(e) => handleDelete(tractor.id, e)}
                            className="text-foreground/70 rounded-xl p-2 transition-colors hover:bg-red-500/10 hover:text-red-500"
                            title="Delete Tractor"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          limit={limit}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={setPage}
          onLimitChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
        />
      </div>

      {/* QUICK TRACTOR PROFILE POPUP MODAL */}
      {selectedTractor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 sm:p-6 backdrop-blur-md animate-fade-in">
          <div
            className="fixed inset-0 -z-10"
            onClick={() => setSelectedTractor(null)}
          />

          <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-background shadow-2xl animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-foreground/[0.02] p-5 sm:p-6">
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-white p-1.5 shadow-sm">
                  {selectedTractor.media?.find((m) => m.isPrimary)?.url || selectedTractor.media?.[0]?.url ? (
                    <img
                      src={
                        selectedTractor.media?.find((m) => m.isPrimary)?.url ||
                        selectedTractor.media?.[0]?.url
                      }
                      alt={selectedTractor.modelName}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <TractorIcon size={24} className="text-muted" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-foreground text-xl font-black tracking-tight truncate">
                      {selectedTractor.brand?.name} {selectedTractor.modelName}
                    </h2>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${getStatusColor(
                        selectedTractor.launchStatus
                      )}`}
                    >
                      {selectedTractor.launchStatus}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        selectedTractor.isActive
                          ? 'bg-[var(--color-brand-green)]/15 text-[var(--color-brand-green)]'
                          : 'bg-red-500/15 text-red-500'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          selectedTractor.isActive
                            ? 'bg-[var(--color-brand-green)]'
                            : 'bg-red-500'
                        }`}
                      />
                      {selectedTractor.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {selectedTractor.isFeatured && (
                      <span className="rounded-full bg-[var(--color-brand-orange)]/15 px-2 py-0.5 text-[10px] font-black text-[var(--color-brand-orange)] uppercase">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-muted text-xs font-semibold truncate mt-0.5">
                    Slug: <code className="text-foreground/80 font-mono text-[11px]">{selectedTractor.slug}</code> • ID: #{selectedTractor.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTractor(null)}
                className="text-muted hover:text-foreground hover:bg-foreground/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-all cursor-pointer"
                title="Close modal (Esc)"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Quick KPIs */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4">
                  <span className="text-muted block text-[10px] font-black tracking-wider uppercase">
                    Horsepower & Drive
                  </span>
                  <div className="text-foreground text-lg font-black mt-1">
                    {selectedTractor.hp ? `${selectedTractor.hp} HP` : 'N/A'}
                  </div>
                  <span className="text-muted text-xs font-semibold capitalize">
                    {selectedTractor.driveType?.replace('_', ' ') || '-'} • {selectedTractor.fuelType || '-'}
                  </span>
                </div>

                <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4">
                  <span className="text-muted block text-[10px] font-black tracking-wider uppercase">
                    Ex-Showroom Price
                  </span>
                  <div className="text-[var(--color-brand-green)] text-base sm:text-lg font-black mt-1 break-words">
                    {selectedTractor.exShowroomPriceMin ? (
                      `${formatPrice(selectedTractor.exShowroomPriceMin)} - ${formatPrice(selectedTractor.exShowroomPriceMax || selectedTractor.exShowroomPriceMin)}`
                    ) : (
                      <span className="text-muted text-sm font-medium">Not Set</span>
                    )}
                  </div>
                  <span className="text-muted text-xs font-semibold">Standard estimate</span>
                </div>

                <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4">
                  <span className="text-muted block text-[10px] font-black tracking-wider uppercase">
                    Total Views
                  </span>
                  <div className="text-foreground text-lg font-black mt-1">
                    {selectedTractor.viewsCount || 0}
                  </div>
                  <span className="text-muted text-xs font-semibold">Farmer impressions</span>
                </div>

                <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4">
                  <span className="text-muted block text-[10px] font-black tracking-wider uppercase">
                    Total Inquiries
                  </span>
                  <div className="text-[var(--color-brand-orange)] text-lg font-black mt-1">
                    {selectedTractor.leadsCount || 0}
                  </div>
                  <span className="text-muted text-xs font-semibold">Verified buyer leads</span>
                </div>
              </div>

              {/* Categories */}
              {selectedTractor.categories && selectedTractor.categories.length > 0 && (
                <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4">
                  <span className="text-muted mb-2 block text-[10px] font-black tracking-wider uppercase">
                    Assigned Categories
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedTractor.categories.map((c, i) => (
                      <span
                        key={i}
                        className="rounded-xl border border-[var(--border-subtle)] bg-background px-3 py-1 text-xs font-bold text-foreground"
                      >
                        {c.category?.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Specifications Highlights */}
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-background p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                  <div className="flex items-center gap-2 text-[var(--color-brand-green)]">
                    <Settings2 size={18} />
                    <h3 className="text-sm font-black tracking-wide uppercase">
                      Key Technical Specifications
                    </h3>
                  </div>
                  <Link
                    href={`/admin/tractors/specs?search=${encodeURIComponent(selectedTractor.modelName)}`}
                    className="text-xs font-bold text-[var(--color-brand-green)] hover:underline"
                  >
                    View All Specs →
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-3 text-center">
                    <span className="text-muted text-[10px] font-black tracking-wider uppercase">
                      Engine CC
                    </span>
                    <div className="text-foreground text-sm font-black mt-0.5">
                      {selectedTractor.spec?.engineCc ? `${selectedTractor.spec.engineCc} CC` : '-'}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-3 text-center">
                    <span className="text-muted text-[10px] font-black tracking-wider uppercase">
                      Cylinders
                    </span>
                    <div className="text-foreground text-sm font-black mt-0.5">
                      {selectedTractor.spec?.cylinders || '-'}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-3 text-center">
                    <span className="text-muted text-[10px] font-black tracking-wider uppercase">
                      PTO HP
                    </span>
                    <div className="text-foreground text-sm font-black mt-0.5">
                      {selectedTractor.spec?.ptoHp ? `${selectedTractor.spec.ptoHp} HP` : '-'}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-3 text-center">
                    <span className="text-muted text-[10px] font-black tracking-wider uppercase">
                      Lift Capacity
                    </span>
                    <div className="text-foreground text-sm font-black mt-0.5">
                      {selectedTractor.spec?.liftingCapacityKg
                        ? `${selectedTractor.spec.liftingCapacityKg} kg`
                        : '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Story / Description */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[var(--border-subtle)] bg-background p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-muted mb-2">
                    <Info size={16} />
                    <span className="text-[10px] font-black tracking-wider uppercase">
                      Product Overview
                    </span>
                  </div>
                  <p className="text-foreground/80 text-xs font-medium leading-relaxed">
                    {selectedTractor.overview || 'No overview has been added yet.'}
                  </p>
                </div>

                <div className="rounded-2xl border border-[var(--border-subtle)] bg-background p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-[var(--color-brand-green)] mb-2">
                    <CheckCircle size={16} />
                    <span className="text-[10px] font-black tracking-wider uppercase">
                      Why Buy This Tractor?
                    </span>
                  </div>
                  <p className="text-foreground/80 text-xs font-medium leading-relaxed">
                    {selectedTractor.whyBuy || 'No reasons provided yet.'}
                  </p>
                </div>
              </div>

              {/* SEO Details */}
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-background p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-[var(--color-brand-orange)] border-b border-[var(--border-subtle)] pb-2">
                  <BarChart size={16} />
                  <span className="text-[10px] font-black tracking-wider uppercase">
                    SEO & Meta Information
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <span className="text-muted text-[10px] font-black tracking-wider uppercase block">
                      Meta Title
                    </span>
                    <p className="text-foreground text-xs font-bold mt-1">
                      {selectedTractor.seoTitle || 'Not configured'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted text-[10px] font-black tracking-wider uppercase block">
                      Meta Description
                    </span>
                    <p className="text-foreground/70 text-xs font-medium mt-1">
                      {selectedTractor.seoDescription || 'Not configured'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Attached Media */}
              {selectedTractor.media && selectedTractor.media.length > 0 && (
                <div className="rounded-2xl border border-[var(--border-subtle)] bg-background p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-muted mb-3">
                    <ImageIcon size={16} />
                    <span className="text-[10px] font-black tracking-wider uppercase">
                      Attached Media ({selectedTractor.media.length} files)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {selectedTractor.media.map((med, idx) => (
                      <div
                        key={idx}
                        className="relative h-20 w-24 overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-white p-1"
                      >
                        <img
                          src={med.url}
                          alt={med.altText || `Media ${idx + 1}`}
                          className="h-full w-full object-contain"
                        />
                        {med.isPrimary && (
                          <span className="absolute bottom-1 right-1 rounded bg-[var(--color-brand-green)] px-1 py-0.5 text-[9px] font-black text-white uppercase">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] bg-foreground/[0.02] p-4 sm:p-6">
              <div className="text-muted flex items-center gap-2 text-xs font-bold">
                <ImageIcon size={14} />
                {selectedTractor.media?.length || 0} Media File(s)
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedTractor(null)}
                  className="rounded-xl border border-[var(--border-subtle)] bg-background px-4 py-2 text-xs font-bold text-foreground transition-colors hover:bg-foreground/5 cursor-pointer"
                >
                  Close
                </button>
                <Link
                  href={`/admin/tractors/${selectedTractor.id}`}
                  className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-5 py-2 text-xs font-black tracking-wider text-white uppercase shadow-md transition-all hover:bg-[var(--color-brand-orange)]"
                >
                  <Edit2 size={14} /> Edit Full Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
