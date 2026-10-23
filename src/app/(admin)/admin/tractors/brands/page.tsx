'use client';

import React, { useState, useEffect } from 'react';
import { brandAPI, Brand } from '@/lib/api/brands';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Globe,
  FileText,
  BarChart,
  Tag,
  Activity,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';
import BrandModal from './components/BrandModal';
import BrandModelsModal from './components/BrandModelsModal';
import Pagination from '@/components/shared/Pagination';

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [search, setSearch] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState('');
  const [isFeaturedFilter, setIsFeaturedFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [detailBrand, setDetailBrand] = useState<Brand | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDetailBrand(null);
      }
    };
    if (detailBrand) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [detailBrand]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [modelsBrand, setModelsBrand] = useState<Brand | null>(null);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const response = await brandAPI.getAllBrands({
        page,
        limit,
        search,
        isActive: isActiveFilter || undefined,
        isFeatured: isFeaturedFilter || undefined,
      });
      if (response.success) {
        setBrands(response.data.data);
        setTotalPages(response.data.totalPages);
        setTotalCount(response.data.totalCount);
      }
    } catch (error) {
      console.error('Failed to fetch brands', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search slightly
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearch(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    fetchBrands();
  }, [search, page, limit, isActiveFilter, isFeaturedFilter]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSearch('');
    setIsActiveFilter('');
    setIsFeaturedFilter('');
    setPage(1);
    setLimit(10);
  };

  const handleEdit = (brand: Brand, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBrand(brand);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this brand?')) {
      try {
        await brandAPI.deleteBrand(id);
        fetchBrands();
      } catch (error) {
        alert('Failed to delete brand.');
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedBrand(null);
    fetchBrands(); // Refresh list after add/edit
  };


  return (
    <div className="animate-fade-in flex flex-1 h-full w-full flex-col gap-6 pb-2">
      {/* Header section */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground text-3xl font-black tracking-tight">Brand Management</h1>
          <p className="text-muted mt-1 text-sm font-bold">
            Deep analysis & master view of tractor and equipment brands.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedBrand(null);
            setIsModalOpen(true);
          }}
          className="spatial-button flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm whitespace-nowrap shadow-lg"
        >
          <Plus size={16} /> Add New Brand
        </button>
      </div>

      {/* Stats, Filters & Search */}
      <div className="glass-panel flex flex-col gap-4 rounded-2xl p-4">
        {/* Main container */}
        <div className="flex w-full flex-col items-center justify-between gap-4 lg:flex-row">
          {/* Left: Stats */}
          <div className="flex w-full shrink-0 items-center gap-4 text-sm font-bold lg:w-auto">
            <div className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)]/10 px-4 py-2 text-[var(--color-brand-green)]">
              <ShieldCheck size={18} />
              Total Brands: {totalCount}
            </div>
          </div>

          {/* Right: Search, Filters, Reset */}
          <div className="flex w-full flex-col flex-wrap items-center justify-end gap-3 sm:flex-row lg:w-auto">
            {/* Search Input */}
            <div className="group relative w-full sm:w-64 md:w-72">
              <div className="text-muted pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 transition-colors group-focus-within:text-[var(--color-brand-green)]">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Search brands by name or year..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="bg-foreground/5 text-foreground placeholder:text-muted focus:bg-background w-full rounded-full border border-transparent py-2.5 pr-4 pl-10 text-sm font-medium transition-all focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 focus:outline-none"
              />
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-foreground/5 hover:bg-foreground/10 text-foreground flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors sm:w-auto md:hidden"
            >
              <Filter size={16} /> Filters
            </button>

            {/* Desktop Filters (Always visible on md and above) */}
            <div
              className={`${showFilters ? 'flex' : 'hidden'} w-full flex-col items-center gap-3 sm:w-auto sm:flex-row md:flex`}
            >
              {/* Status Filter */}
              <div className="relative w-full sm:w-44">
                <Activity
                  className="text-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
                  size={14}
                />
                <select
                  value={isActiveFilter}
                  onChange={(e) => {
                    setIsActiveFilter(e.target.value);
                    setPage(1);
                  }}
                  className="bg-background text-foreground w-full cursor-pointer appearance-none rounded-xl border border-[var(--border-subtle)] py-2 pr-8 pl-9 text-xs font-bold outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/20"
                >
                  <option value="">All Statuses</option>
                  <option value="true">Active Only</option>
                  <option value="false">Inactive Only</option>
                </select>
                <ChevronDown
                  className="text-muted pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
                  size={14}
                />
              </div>

              {/* Featured Filter */}
              <div className="relative w-full sm:w-44">
                <Tag
                  className="text-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
                  size={14}
                />
                <select
                  value={isFeaturedFilter}
                  onChange={(e) => {
                    setIsFeaturedFilter(e.target.value);
                    setPage(1);
                  }}
                  className="bg-background text-foreground w-full cursor-pointer appearance-none rounded-xl border border-[var(--border-subtle)] py-2 pr-8 pl-9 text-xs font-bold outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/20"
                >
                  <option value="">All Types</option>
                  <option value="true">Featured Only</option>
                  <option value="false">Standard Only</option>
                </select>
                <ChevronDown
                  className="text-muted pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
                  size={14}
                />
              </div>
            </div>

            {/* Reset Button */}
            {(searchTerm || isActiveFilter || isFeaturedFilter) && (
              <button
                onClick={handleResetFilters}
                className="flex w-full items-center justify-center gap-1.5 rounded-full bg-red-500/10 px-4 py-2 text-xs font-bold text-red-500 transition-colors hover:bg-red-500/20 sm:w-auto"
              >
                <X size={14} /> Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-2xl md:min-h-[530px]">
        <div className="min-h-[350px] flex-1 overflow-x-auto overflow-y-auto md:min-h-[460px]">
          <table className="relative w-full text-left text-xs">
            <thead className="bg-background/95 text-muted sticky top-0 z-10 border-b border-[var(--border-subtle)] text-[11px] font-black tracking-wider uppercase backdrop-blur-md">
              <tr>
                <th className="w-10 px-6 py-4"></th>
                <th className="px-6 py-4">Brand</th>
                <th className="px-6 py-4">Founded / Country</th>
                <th className="px-6 py-4">Models</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-muted px-6 py-12 text-center font-bold">
                    Loading deep brand insights...
                  </td>
                </tr>
              ) : brands.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-muted px-6 py-12 text-center font-bold">
                    No brands found matching your search.
                  </td>
                </tr>
              ) : (
                brands.map((brand) => (
                  <tr
                    key={brand.id}
                    className="hover:bg-[var(--color-brand-green)]/[0.04] group cursor-pointer transition-colors"
                    onClick={() => setDetailBrand(brand)}
                  >
                    <td className="text-muted px-6 py-4">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground/5 text-muted transition-colors group-hover:bg-[var(--color-brand-green)]/15 group-hover:text-[var(--color-brand-green)]"
                        title="Click to view brand profile"
                      >
                        <Eye size={16} />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-white p-1.5 shadow-sm transition-transform group-hover:scale-105">
                          {brand.logoUrl ? (
                            <img
                              src={brand.logoUrl}
                              alt={brand.name}
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <span className="text-[10px] font-black text-muted uppercase">
                              N/A
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <div className="text-foreground text-base font-black tracking-tight transition-colors group-hover:text-[var(--color-brand-green)]">
                            {brand.name}
                          </div>
                          <div
                            className="text-muted/70 max-w-[150px] truncate text-[10px] font-bold tracking-wider uppercase sm:max-w-[200px]"
                            title={brand.slug}
                          >
                            {brand.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="text-foreground/80 flex items-center gap-1.5 font-bold">
                          <Globe size={12} className="text-muted" /> {brand.country || 'N/A'}
                        </span>
                        <span className="text-muted font-medium">
                          Est. {brand.foundedYear || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setModelsBrand(brand);
                        }}
                        className="bg-foreground/5 text-foreground/80 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-black tracking-wide transition-colors hover:bg-[var(--color-brand-green)]/10 hover:text-[var(--color-brand-green)] cursor-pointer"
                      >
                        {brand.totalModels || 0} Models
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black tracking-widest uppercase ${brand.isActive ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]' : 'bg-red-500/10 text-red-500'}`}
                        >
                          {brand.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {brand.isFeatured && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 text-[10px] font-black tracking-widest text-blue-500 uppercase">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailBrand(brand);
                          }}
                          className="text-foreground/70 rounded-xl p-2 transition-colors hover:bg-[var(--color-brand-green)]/10 hover:text-[var(--color-brand-green)] cursor-pointer"
                          title="View Brand Profile"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={(e) => handleEdit(brand, e)}
                          className="text-foreground/70 rounded-xl p-2 transition-colors hover:bg-[var(--color-brand-orange)]/10 hover:text-[var(--color-brand-orange)] cursor-pointer"
                          title="Edit Brand"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(brand.id, e)}
                          className="text-foreground/70 rounded-xl p-2 transition-colors hover:bg-red-500/10 hover:text-red-500 cursor-pointer"
                          title="Delete Brand"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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

      {/* BRAND QUICK PROFILE POPUP MODAL */}
      {detailBrand && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 sm:p-6 backdrop-blur-md animate-fade-in">
          <div
            className="fixed inset-0 -z-10"
            onClick={() => setDetailBrand(null)}
          />

          <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-background shadow-2xl animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-foreground/[0.02] p-5 sm:p-6">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-white p-2 shadow-sm">
                  {detailBrand.logoUrl ? (
                    <img
                      src={detailBrand.logoUrl}
                      alt={detailBrand.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs font-black text-muted uppercase">N/A</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-foreground text-xl font-black tracking-tight truncate">
                      {detailBrand.name}
                    </h2>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                        detailBrand.isActive
                          ? 'bg-[var(--color-brand-green)]/15 text-[var(--color-brand-green)]'
                          : 'bg-red-500/15 text-red-500'
                      }`}
                    >
                      {detailBrand.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {detailBrand.isFeatured && (
                      <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[10px] font-black text-blue-500 uppercase">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-muted text-xs font-semibold mt-0.5">
                    Slug: <code className="text-foreground/80 font-mono text-[11px]">{detailBrand.slug}</code> • ID: #{detailBrand.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDetailBrand(null)}
                className="text-muted hover:text-foreground hover:bg-foreground/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-all cursor-pointer"
                title="Close modal (Esc)"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Quick Metrics */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4">
                  <span className="text-muted block text-[10px] font-black tracking-wider uppercase">
                    Country of Origin
                  </span>
                  <div className="text-foreground text-base font-black mt-1 flex items-center gap-1.5">
                    <Globe size={14} className="text-muted" />
                    {detailBrand.country || 'N/A'}
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4">
                  <span className="text-muted block text-[10px] font-black tracking-wider uppercase">
                    Founded Year
                  </span>
                  <div className="text-foreground text-base font-black mt-1">
                    {detailBrand.foundedYear || 'Unknown'}
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4">
                  <span className="text-muted block text-[10px] font-black tracking-wider uppercase">
                    Total Models
                  </span>
                  <div className="text-[var(--color-brand-green)] text-base font-black mt-1">
                    {detailBrand.totalModels || 0} Models
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4">
                  <span className="text-muted block text-[10px] font-black tracking-wider uppercase">
                    Display Sort Order
                  </span>
                  <div className="text-foreground text-base font-black mt-1">
                    {detailBrand.sortOrder || 0}
                  </div>
                </div>
              </div>

              {/* Brand About / Story */}
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-background p-5 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-[var(--color-brand-green)]">
                  <FileText size={16} />
                  <h3 className="text-xs font-black tracking-wider uppercase">
                    Brand Identity & Heritage
                  </h3>
                </div>
                <p className="text-foreground/80 text-xs sm:text-sm font-medium leading-relaxed">
                  {detailBrand.aboutBrand || 'No detailed background story provided for this brand yet.'}
                </p>
              </div>

              {/* SEO Meta Information */}
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-background p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-[var(--color-brand-orange)] border-b border-[var(--border-subtle)] pb-2.5">
                  <BarChart size={16} />
                  <h3 className="text-xs font-black tracking-wider uppercase">
                    SEO & Meta Configuration
                  </h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-muted text-[10px] font-black tracking-wider uppercase block">
                      SEO Title
                    </span>
                    <p className="text-foreground text-xs font-bold mt-1">
                      {detailBrand.seoTitle || <span className="text-muted/60 italic font-normal">Not configured</span>}
                    </p>
                  </div>
                  <div className="bg-foreground/5 h-px w-full" />
                  <div>
                    <span className="text-muted text-[10px] font-black tracking-wider uppercase block">
                      SEO Description
                    </span>
                    <p className="text-foreground/70 text-xs font-medium mt-1">
                      {detailBrand.seoDescription || <span className="text-muted/60 italic font-normal">Not configured</span>}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-[var(--border-subtle)] bg-foreground/[0.02] p-4 sm:p-6">
              <button
                type="button"
                onClick={() => {
                  const b = detailBrand;
                  setDetailBrand(null);
                  setModelsBrand(b);
                }}
                className="text-xs font-bold text-[var(--color-brand-green)] hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                Browse Models ({detailBrand.totalModels || 0}) →
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDetailBrand(null)}
                  className="rounded-xl border border-[var(--border-subtle)] bg-background px-4 py-2 text-xs font-bold text-foreground transition-colors hover:bg-foreground/5 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    const b = detailBrand;
                    setDetailBrand(null);
                    handleEdit(b, e);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-5 py-2 text-xs font-black tracking-wider text-white uppercase shadow-md transition-all hover:bg-[var(--color-brand-orange)] cursor-pointer"
                >
                  <Edit2 size={14} /> Edit Brand Master
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && <BrandModal brand={selectedBrand} onClose={handleModalClose} />}

      {modelsBrand && <BrandModelsModal brand={modelsBrand} onClose={() => setModelsBrand(null)} />}
    </div>
  );
}
