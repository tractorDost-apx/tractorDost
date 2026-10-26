'use client';

import React, { useState, useEffect } from 'react';
import { tractorFamilyAPI, TractorFamily } from '@/lib/api/tractorFamilies';
import { brandAPI, Brand } from '@/lib/api/brands';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileText,
  BarChart,
  Activity,
  Filter,
  X,
  FolderOpen,
  Tractor,
  Eye,
} from 'lucide-react';
import FamilyModal from './components/FamilyModal';
import { TractorLoader } from '@/components/ui/TractorLoader';
import Pagination from '@/components/shared/Pagination';
import { toast } from '@/components/ui/toast';

export default function TractorFamiliesPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [families, setFamilies] = useState<TractorFamily[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingFamilies, setLoadingFamilies] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [search, setSearch] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [detailFamily, setDetailFamily] = useState<TractorFamily | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDetailFamily(null);
      }
    };
    if (detailFamily) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [detailFamily]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<TractorFamily | null>(null);

  // Fetch all brands on mount for the selection dropdown
  useEffect(() => {
    const fetchBrands = async () => {
      setLoadingBrands(true);
      try {
        const response = await brandAPI.getAllBrands({
          page: 1,
          limit: 200,
          isActive: 'true', // Only show active brands to group families under
        });
        if (response.success) {
          const fetchedBrands = response.data.data;
          setBrands(fetchedBrands);
          if (fetchedBrands.length > 0) {
            setSelectedBrandId(fetchedBrands[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch brands for dropdown', error);
      } finally {
        setLoadingBrands(false);
      }
    };
    fetchBrands();
  }, []);

  // Fetch tractor families for the selected brand
  const fetchFamilies = async () => {
    if (!selectedBrandId) return;
    setLoadingFamilies(true);
    try {
      const response = await tractorFamilyAPI.getFamiliesByBrand(selectedBrandId, {
        page,
        limit,
        search,
        isActive: isActiveFilter || undefined,
        sortBy: 'sortOrder',
        sortOrder: 'asc',
      });
      if (response.success) {
        setFamilies(response.data.items);
        setTotalPages(response.data.meta.totalPages);
        setTotalCount(response.data.meta.total);
      }
    } catch (error) {
      console.error('Failed to fetch tractor families', error);
    } finally {
      setLoadingFamilies(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearch(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    if (selectedBrandId) {
      fetchFamilies();
    }
  }, [selectedBrandId, search, page, limit, isActiveFilter]);

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBrandId(Number(e.target.value));
    setPage(1);
    setDetailFamily(null);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSearch('');
    setIsActiveFilter('');
    setPage(1);
  };

  const handleEdit = (family: TractorFamily, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFamily(family);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this tractor family?')) {
      try {
        const response = await tractorFamilyAPI.deleteFamily(id);
        if (response.success) {
          toast.success('Tractor family deleted successfully');
          fetchFamilies();
        }
      } catch (error: any) {
        console.error('Failed to delete family', error);
        toast.error(
          error?.response?.data?.message ||
            'Failed to delete tractor family. Please make sure no tractors are linked to it.'
        );
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedFamily(null);
    fetchFamilies(); // Refresh after save
  };


  const activeBrand = brands.find((b) => b.id === selectedBrandId);

  return (
    <div className="animate-fade-in flex flex-1 h-full w-full flex-col gap-6 pb-2">
      {/* Header section */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground flex items-center gap-2 text-3xl font-black tracking-tight">
            <FolderOpen className="text-[var(--color-brand-green)]" />
            Tractor Families
          </h1>
          <p className="text-muted mt-1 text-sm font-bold">
            Manage families and model series of tractors categorized under specific brands.
          </p>
        </div>
        {selectedBrandId && (
          <button
            onClick={() => {
              setSelectedFamily(null);
              setIsModalOpen(true);
            }}
            className="spatial-button flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm whitespace-nowrap shadow-lg"
          >
            <Plus size={16} /> Add New Family
          </button>
        )}
      </div>

      {loadingBrands ? (
        <div className="text-muted flex flex-col items-center justify-center gap-3 py-20">
          <TractorLoader className="text-[var(--color-brand-green)]" size={48} />
          <span className="font-bold">Loading Brand Configurations...</span>
        </div>
      ) : brands.length === 0 ? (
        <div className="glass-panel text-muted rounded-2xl p-8 text-center">
          <p className="text-foreground mb-2 text-lg font-bold">No Active Brands Found</p>
          <p className="text-sm">
            Please create and activate at least one brand first before managing tractor families.
          </p>
        </div>
      ) : (
        <>
          {/* Brand Selector, Stats & Filters */}
          <div className="glass-panel flex flex-col gap-6 rounded-2xl p-6">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              {/* Brand Selector */}
              <div className="flex w-full flex-col gap-1.5 md:w-80">
                <label className="text-muted text-xs font-black tracking-wider uppercase">
                  Select Brand Namespace
                </label>
                <div className="relative">
                  <select
                    value={selectedBrandId || ''}
                    onChange={handleBrandChange}
                    className="bg-background text-foreground w-full cursor-pointer appearance-none rounded-xl border border-[var(--border-subtle)] py-3 pr-10 pl-4 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/20"
                  >
                    {brands.map((brand) => (
                      <option
                        key={brand.id}
                        value={brand.id}
                        className="bg-background text-foreground"
                      >
                        {brand.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="text-muted pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
                    size={16}
                  />
                </div>
              </div>

              {/* Stats */}
              {selectedBrandId && (
                <div className="flex items-center gap-4 self-end text-sm font-bold md:self-auto">
                  <div className="flex items-center gap-2 rounded-xl border border-[var(--color-brand-green)]/10 bg-[var(--color-brand-green)]/10 px-4 py-2.5 text-[var(--color-brand-green)]">
                    <ShieldCheck size={18} />
                    Families in {activeBrand?.name}: {totalCount}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-foreground/5 h-px w-full"></div>

            {/* Filter controls */}
            <div className="flex w-full flex-col flex-wrap items-center justify-between gap-4 sm:flex-row">
              {/* Left: Search input */}
              <div className="group relative w-full sm:w-80">
                <div className="text-muted pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 transition-colors group-focus-within:text-[var(--color-brand-green)]">
                  <Search size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Search families by name..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="bg-foreground/5 text-foreground placeholder:text-muted focus:bg-background w-full rounded-full border border-transparent py-2.5 pr-4 pl-10 text-sm font-medium shadow-inner transition-all focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 focus:outline-none"
                />
              </div>

              {/* Right: Active status filter & Reset */}
              <div className="flex w-full flex-wrap items-center justify-end gap-3 sm:w-auto">
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
                    className="bg-background text-foreground w-full cursor-pointer appearance-none rounded-xl border border-[var(--border-subtle)] py-2 pr-8 pl-9 text-xs font-bold shadow-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/20"
                  >
                    <option value="" className="bg-background text-foreground">
                      All Statuses
                    </option>
                    <option value="true" className="bg-background text-foreground">
                      Active Only
                    </option>
                    <option value="false" className="bg-background text-foreground">
                      Inactive Only
                    </option>
                  </select>
                  <ChevronDown
                    className="text-muted pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
                    size={14}
                  />
                </div>

                {(searchTerm || isActiveFilter) && (
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

          {/* Families Table */}
          <div className="glass-panel flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-2xl md:min-h-[530px]">
            <div className="min-h-[350px] flex-1 overflow-x-auto overflow-y-auto md:min-h-[460px]">
              <table className="relative w-full text-left text-xs">
                <thead className="bg-background/95 text-muted sticky top-0 z-10 border-b border-[var(--border-subtle)] text-[11px] font-black tracking-wider uppercase backdrop-blur-md">
                  <tr>
                    <th className="w-10 px-6 py-4"></th>
                    <th className="px-6 py-4">Family Info</th>
                    <th className="px-6 py-4">URL Slug</th>
                    <th className="px-6 py-4">Linked Tractors</th>
                    <th className="px-6 py-4">Sort Order</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {loadingFamilies ? (
                    <tr>
                      <td colSpan={7} className="text-muted px-6 py-12 text-center font-bold">
                        Fetching families details...
                      </td>
                    </tr>
                  ) : families.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-muted px-6 py-12 text-center font-bold">
                        No families found matching your selection.
                      </td>
                    </tr>
                  ) : (
                    families.map((family) => (
                      <tr
                        key={family.id}
                        className="hover:bg-[var(--color-brand-green)]/[0.04] group cursor-pointer transition-colors"
                        onClick={() => setDetailFamily(family)}
                      >
                        <td className="text-muted px-6 py-4">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground/5 text-muted transition-colors group-hover:bg-[var(--color-brand-green)]/15 group-hover:text-[var(--color-brand-green)]"
                            title="Click to view family details"
                          >
                            <Eye size={16} />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-white p-1.5 shadow-sm transition-transform group-hover:scale-105">
                              {family.logoUrl ? (
                                <img
                                  src={family.logoUrl}
                                  alt={family.name}
                                  className="max-h-full max-w-full object-contain"
                                />
                              ) : (
                                <FolderOpen size={20} className="text-muted" />
                              )}
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <div className="text-foreground text-base font-black tracking-tight transition-colors group-hover:text-[var(--color-brand-green)]">
                                {family.name}
                              </div>
                              <div className="text-muted/70 text-[10px] font-bold">
                                ID: #{family.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td
                          className="text-foreground/80 max-w-[200px] truncate px-6 py-4 text-sm font-medium"
                          title={family.slug}
                        >
                          {family.slug}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-foreground/5 text-foreground/80 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-black tracking-wide">
                            <Tractor size={12} className="text-muted" />
                            {family.tractorCount || 0} Tractors
                          </span>
                        </td>
                        <td className="text-foreground/80 px-6 py-4 font-bold">
                          {family.sortOrder}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black tracking-widest uppercase ${
                              family.isActive
                                ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]'
                                : 'bg-red-500/10 text-red-500'
                            }`}
                          >
                            {family.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDetailFamily(family);
                              }}
                              className="text-foreground/70 rounded-xl p-2 transition-colors hover:bg-[var(--color-brand-green)]/10 hover:text-[var(--color-brand-green)] cursor-pointer"
                              title="View Family Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={(e) => handleEdit(family, e)}
                              className="text-foreground/70 rounded-xl p-2 transition-colors hover:bg-[var(--color-brand-orange)]/10 hover:text-[var(--color-brand-orange)] cursor-pointer"
                              title="Edit Family"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={(e) => handleDelete(family.id, e)}
                              className="text-foreground/70 rounded-xl p-2 transition-colors hover:bg-red-500/10 hover:text-red-500 cursor-pointer"
                              title="Delete Family"
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

            {/* Pagination controls */}
            {!loadingFamilies && (
              <Pagination
                page={page}
                limit={limit}
                totalCount={totalCount}
                totalPages={totalPages}
                onPageChange={setPage}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
              />
            )}
          </div>
        </>
      )}

      {/* FAMILY PROFILE POPUP MODAL */}
      {detailFamily && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 sm:p-6 backdrop-blur-md animate-fade-in">
          <div
            className="fixed inset-0 -z-10"
            onClick={() => setDetailFamily(null)}
          />

          <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-background shadow-2xl animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-foreground/[0.02] p-5 sm:p-6">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-white p-2 shadow-sm">
                  {detailFamily.logoUrl ? (
                    <img
                      src={detailFamily.logoUrl}
                      alt={detailFamily.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <FolderOpen size={24} className="text-[var(--color-brand-green)]" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-foreground text-xl font-black tracking-tight truncate">
                      {detailFamily.name}
                    </h2>
                    <span className="rounded-full bg-foreground/5 px-2.5 py-0.5 text-xs font-bold text-foreground">
                      {activeBrand?.name || 'Tractor Series'}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                        detailFamily.isActive
                          ? 'bg-[var(--color-brand-green)]/15 text-[var(--color-brand-green)]'
                          : 'bg-red-500/15 text-red-500'
                      }`}
                    >
                      {detailFamily.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-muted text-xs font-semibold mt-0.5">
                    Slug: <code className="text-foreground/80 font-mono text-[11px]">{detailFamily.slug}</code> • ID: #{detailFamily.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDetailFamily(null)}
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
                    Brand Group
                  </span>
                  <div className="text-foreground text-base font-black mt-1 truncate">
                    {activeBrand?.name || 'Assigned Brand'}
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4">
                  <span className="text-muted block text-[10px] font-black tracking-wider uppercase">
                    Tractors in Family
                  </span>
                  <div className="text-[var(--color-brand-green)] text-base font-black mt-1 flex items-center gap-1.5">
                    <Tractor size={16} />
                    {detailFamily.tractorCount || 0} Models
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4">
                  <span className="text-muted block text-[10px] font-black tracking-wider uppercase">
                    Sort Order
                  </span>
                  <div className="text-foreground text-base font-black mt-1">
                    {detailFamily.sortOrder}
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4">
                  <span className="text-muted block text-[10px] font-black tracking-wider uppercase">
                    Series ID
                  </span>
                  <div className="text-foreground text-base font-black mt-1">
                    #{detailFamily.id}
                  </div>
                </div>
              </div>

              {/* Family Description */}
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-background p-5 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-[var(--color-brand-green)]">
                  <FileText size={16} />
                  <h3 className="text-xs font-black tracking-wider uppercase">
                    Family & Series Overview
                  </h3>
                </div>
                <p className="text-foreground/80 text-xs sm:text-sm font-medium leading-relaxed">
                  {detailFamily.description || 'No description provided for this family yet.'}
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
                      {detailFamily.seoTitle || <span className="text-muted/60 italic font-normal">Not configured</span>}
                    </p>
                  </div>
                  <div className="bg-foreground/5 h-px w-full" />
                  <div>
                    <span className="text-muted text-[10px] font-black tracking-wider uppercase block">
                      SEO Description
                    </span>
                    <p className="text-foreground/70 text-xs font-medium mt-1">
                      {detailFamily.seoDescription || <span className="text-muted/60 italic font-normal">Not configured</span>}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-[var(--border-subtle)] bg-foreground/[0.02] p-4 sm:p-6">
              <span className="text-muted text-xs font-bold">
                Tractors: <strong className="text-foreground">{detailFamily.tractorCount || 0} active models</strong>
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDetailFamily(null)}
                  className="rounded-xl border border-[var(--border-subtle)] bg-background px-4 py-2 text-xs font-bold text-foreground transition-colors hover:bg-foreground/5 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    const f = detailFamily;
                    setDetailFamily(null);
                    handleEdit(f, e);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-5 py-2 text-xs font-black tracking-wider text-white uppercase shadow-md transition-all hover:bg-[var(--color-brand-orange)] cursor-pointer"
                >
                  <Edit2 size={14} /> Edit Family
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <FamilyModal
          family={selectedFamily}
          brandId={selectedBrandId || 0}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
