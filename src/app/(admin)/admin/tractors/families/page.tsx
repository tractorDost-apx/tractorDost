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
} from 'lucide-react';
import FamilyModal from './components/FamilyModal';
import { TractorLoader } from '@/components/ui/TractorLoader';
import Pagination from '@/components/shared/Pagination';


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
  const [expandedId, setExpandedId] = useState<number | null>(null);

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
        limit: 10,
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
  }, [selectedBrandId, search, page, isActiveFilter]);

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBrandId(Number(e.target.value));
    setPage(1);
    setExpandedId(null);
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
          fetchFamilies();
        }
      } catch (error: any) {
        console.error('Failed to delete family', error);
        alert(
          error?.response?.data?.message || 'Failed to delete tractor family. Please make sure no tractors are linked to it.'
        );
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedFamily(null);
    fetchFamilies(); // Refresh after save
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const activeBrand = brands.find((b) => b.id === selectedBrandId);

  return (
    <div className="w-full h-full flex flex-col gap-6 animate-fade-in pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <FolderOpen className="text-[var(--color-brand-green)]" />
            Tractor Families
          </h1>
          <p className="text-sm font-bold text-muted mt-1">
            Manage families and model series of tractors categorized under specific brands.
          </p>
        </div>
        {selectedBrandId && (
          <button
            onClick={() => {
              setSelectedFamily(null);
              setIsModalOpen(true);
            }}
            className="spatial-button px-5 py-2.5 text-sm rounded-full shadow-lg flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <Plus size={16} /> Add New Family
          </button>
        )}
      </div>

      {loadingBrands ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted gap-3">
          <TractorLoader className="text-[var(--color-brand-green)]" size={48} />
          <span className="font-bold">Loading Brand Configurations...</span>
        </div>
      ) : brands.length === 0 ? (
        <div className="glass-panel p-8 rounded-2xl text-center text-muted">
          <p className="font-bold text-lg text-foreground mb-2">No Active Brands Found</p>
          <p className="text-sm">Please create and activate at least one brand first before managing tractor families.</p>
        </div>
      ) : (
        <>
          {/* Brand Selector, Stats & Filters */}
          <div className="flex flex-col gap-6 glass-panel p-6 rounded-2xl">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              {/* Brand Selector */}
              <div className="flex flex-col gap-1.5 w-full md:w-80">
                <label className="text-xs font-black uppercase text-muted tracking-wider">Select Brand Namespace</label>
                <div className="relative">
                  <select
                    value={selectedBrandId || ''}
                    onChange={handleBrandChange}
                    className="w-full pl-4 pr-10 py-3 bg-background border border-[var(--border-subtle)] rounded-xl text-sm font-bold text-foreground outline-none cursor-pointer focus:ring-2 focus:ring-[var(--color-brand-green)]/20 appearance-none shadow-sm"
                  >
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id} className="bg-background text-foreground">
                        {brand.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={16} />
                </div>
              </div>

              {/* Stats */}
              {selectedBrandId && (
                <div className="flex items-center gap-4 text-sm font-bold self-end md:self-auto">
                  <div className="flex items-center gap-2 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] px-4 py-2.5 rounded-xl border border-[var(--color-brand-green)]/10">
                    <ShieldCheck size={18} />
                    Families in {activeBrand?.name}: {totalCount}
                  </div>
                </div>
              )}
            </div>

            <div className="w-full h-px bg-foreground/5"></div>

            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-center justify-between w-full">
              {/* Left: Search input */}
              <div className="relative w-full sm:w-80 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted group-focus-within:text-[var(--color-brand-green)] transition-colors">
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
                  className="w-full bg-foreground/5 border border-transparent rounded-full py-2.5 pl-10 pr-4 text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all shadow-inner"
                />
              </div>

              {/* Right: Active status filter & Reset */}
              <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto justify-end">
                <div className="relative w-full sm:w-44">
                  <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={14} />
                  <select
                    value={isActiveFilter}
                    onChange={(e) => {
                      setIsActiveFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-9 pr-8 py-2 bg-background border border-[var(--border-subtle)] rounded-xl text-xs font-bold text-foreground outline-none cursor-pointer focus:ring-2 focus:ring-[var(--color-brand-green)]/20 appearance-none shadow-sm"
                  >
                    <option value="" className="bg-background text-foreground">All Statuses</option>
                    <option value="true" className="bg-background text-foreground">Active Only</option>
                    <option value="false" className="bg-background text-foreground">Inactive Only</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={14} />
                </div>

                {(searchTerm || isActiveFilter) && (
                  <button
                    onClick={handleResetFilters}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold text-xs rounded-full transition-colors"
                  >
                    <X size={14} /> Reset Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Families Table */}
          <div className="glass-panel rounded-2xl overflow-hidden flex-1 flex flex-col min-h-[420px] md:min-h-[530px]">
            <div className="overflow-y-auto overflow-x-auto flex-1 min-h-[350px] md:min-h-[460px]">
              <table className="w-full text-left text-sm relative">
                <thead className="sticky top-0 bg-background/95 backdrop-blur-md z-10 text-muted uppercase text-[11px] font-black tracking-wider border-b border-[var(--border-subtle)]">
                  <tr>
                    <th className="px-6 py-4 w-10"></th>
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
                      <td colSpan={7} className="px-6 py-12 text-center text-muted font-bold">
                        Fetching families details...
                      </td>
                    </tr>
                  ) : families.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-muted font-bold">
                        No families found matching your selection.
                      </td>
                    </tr>
                  ) : (
                    families.map((family) => (
                      <React.Fragment key={family.id}>
                        <tr
                          className={`hover:bg-foreground/5 transition-colors cursor-pointer ${
                            expandedId === family.id ? 'bg-foreground/5' : ''
                          }`}
                          onClick={() => toggleExpand(family.id)}
                        >
                          <td className="px-6 py-4 text-muted">
                            {expandedId === family.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center p-1.5 border border-[var(--border-subtle)] shrink-0 shadow-sm">
                                {family.logoUrl ? (
                                  <img
                                    src={family.logoUrl}
                                    alt={family.name}
                                    className="max-h-full max-w-full object-contain"
                                  />
                                ) : (
                                  <span className="text-gray-400 font-black text-[10px] uppercase">N/A</span>
                                )}
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <div className="font-black text-foreground text-base tracking-tight">{family.name}</div>
                                <div className="text-[10px] font-bold text-muted/70">ID: #{family.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-foreground/80 max-w-[200px] truncate" title={family.slug}>{family.slug}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black tracking-wide bg-foreground/5 text-foreground/80">
                              <Tractor size={12} className="text-muted" />
                              {family.tractorCount || 0} Tractors
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-foreground/80">{family.sortOrder}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
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
                                onClick={(e) => handleEdit(family, e)}
                                className="p-2 rounded-xl text-foreground/70 hover:text-[var(--color-brand-orange)] hover:bg-[var(--color-brand-orange)]/10 transition-colors"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={(e) => handleDelete(family.id, e)}
                                className="p-2 rounded-xl text-foreground/70 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* EXPANDED DETAILS */}
                        {expandedId === family.id && (
                          <tr>
                            <td colSpan={7} className="px-0 py-0 bg-foreground/[0.02]">
                              <div className="p-6 md:p-8 flex flex-col gap-6 animate-fade-in border-b-2 border-[var(--color-brand-green)]">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full whitespace-normal">
                                  {/* Left Column - General Info */}
                                  <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-2 text-[var(--color-brand-green)] border-b border-[var(--border-subtle)] pb-2">
                                      <FileText size={18} />
                                      <h3 className="font-black text-sm uppercase tracking-wide">Family Identity & About</h3>
                                    </div>
                                    <p className="text-sm text-foreground/80 font-medium leading-relaxed bg-background p-4 rounded-xl border border-[var(--border-subtle)] shadow-sm">
                                      {family.description || 'No description provided for this family yet.'}
                                    </p>
                                  </div>

                                  {/* Right Column - SEO Info */}
                                  <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-2 text-[var(--color-brand-orange)] border-b border-[var(--border-subtle)] pb-2">
                                      <BarChart size={18} />
                                      <h3 className="font-black text-sm uppercase tracking-wide">SEO & Meta Configuration</h3>
                                    </div>

                                    <div className="flex flex-col gap-4 bg-background p-4 rounded-xl border border-[var(--border-subtle)] shadow-sm">
                                      <div className="flex flex-col gap-1.5">
                                        <span className="text-[10px] font-black uppercase text-muted tracking-wider">SEO Title</span>
                                        <span className="text-sm font-bold text-foreground">
                                          {family.seoTitle || (
                                            <span className="text-muted/50 italic font-medium">Not configured</span>
                                          )}
                                        </span>
                                      </div>

                                      <div className="w-full h-px bg-foreground/5"></div>

                                      <div className="flex flex-col gap-1.5">
                                        <span className="text-[10px] font-black uppercase text-muted tracking-wider">SEO Description</span>
                                        <span className="text-sm font-medium text-foreground/80 leading-relaxed">
                                          {family.seoDescription || (
                                            <span className="text-muted/50 italic font-medium">Not configured</span>
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                  <button
                                    onClick={(e) => handleEdit(family, e)}
                                    className="px-6 py-2.5 bg-[var(--color-brand-green)] text-white font-black text-sm uppercase tracking-wider rounded-xl hover:bg-[var(--color-brand-orange)] transition-colors shadow-lg shadow-[var(--color-brand-green)]/20 flex items-center gap-2"
                                  >
                                    <Edit2 size={16} /> Edit Family Configuration
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            {!loadingFamilies && totalPages > 1 && (
              <div className="mt-auto p-4 border-t border-[var(--border-subtle)] flex items-center justify-between bg-background z-10 relative">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 text-sm font-bold rounded-xl bg-foreground/5 hover:bg-foreground/10 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm font-bold text-muted">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 text-sm font-bold rounded-xl bg-foreground/5 hover:bg-foreground/10 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </>
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
