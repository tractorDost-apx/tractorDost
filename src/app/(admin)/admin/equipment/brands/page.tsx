'use client';

import React, { useState, useEffect } from 'react';
import { equipmentBrandAPI, EquipmentBrand } from '@/lib/api/equipmentBrands';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Globe,
  Activity,
  Eye,
  X,
} from 'lucide-react';
import EquipmentBrandModal from './components/EquipmentBrandModal';
import Pagination from '@/components/shared/Pagination';

export default function EquipmentBrandsPage() {
  const [brands, setBrands] = useState<EquipmentBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [detailBrand, setDetailBrand] = useState<EquipmentBrand | null>(null);

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
  const [selectedBrand, setSelectedBrand] = useState<EquipmentBrand | null>(null);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const response = await equipmentBrandAPI.getAllEquipmentBrands({ page, limit, search });
      if (response.success) {
        const payload = response.data as any;
        setBrands(payload.data);
        setTotalPages(payload.pagination?.totalPages || 1);
        setTotalCount(payload.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch equipment brands', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBrands();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, page, limit]);

  const handleEdit = (brand: EquipmentBrand, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBrand(brand);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this equipment brand?')) {
      try {
        await equipmentBrandAPI.deleteEquipmentBrand(id);
        fetchBrands();
      } catch (error) {
        alert('Failed to delete equipment brand.');
      }
    }
  };

  const handleToggleActive = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await equipmentBrandAPI.toggleEquipmentBrandActive(id);
      fetchBrands();
    } catch (error) {
      alert('Failed to toggle status.');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedBrand(null);
    fetchBrands();
  };


  return (
    <div className="animate-fade-in flex flex-1 h-full w-full flex-col gap-6 pb-2">
      {/* Header section */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground text-3xl font-black tracking-tight">
            Equipment Brand Management
          </h1>
          <p className="text-muted mt-1 text-sm font-bold">
            Deep analysis & master view of equipment brands.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedBrand(null);
            setIsModalOpen(true);
          }}
          className="spatial-button flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm whitespace-nowrap shadow-lg"
        >
          <Plus size={16} /> Add New Equipment Brand
        </button>
      </div>

      {/* Stats and Search */}
      <div className="glass-panel flex flex-col items-center justify-between gap-4 rounded-2xl p-4 md:flex-row">
        <div className="flex w-full items-center gap-4 text-sm font-bold md:w-auto">
          <div className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)]/10 px-4 py-2 text-[var(--color-brand-green)]">
            <ShieldCheck size={18} />
            Total Equipment Brands: {totalCount}
          </div>
        </div>

        <div className="group relative w-full md:w-80">
          <div className="text-muted pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 transition-colors group-focus-within:text-[var(--color-brand-green)]">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search equipment brands by name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="bg-foreground/5 text-foreground placeholder:text-muted focus:bg-background w-full rounded-full border border-transparent py-2.5 pr-4 pl-10 text-sm font-medium transition-all focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel flex flex-1 flex-col overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-foreground/5 text-muted text-[11px] font-black tracking-wider uppercase">
              <tr>
                <th className="w-10 px-6 py-4"></th>
                <th className="px-6 py-4">Brand</th>
                <th className="px-6 py-4">Country</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-muted px-6 py-12 text-center font-bold">
                    Loading deep brand insights...
                  </td>
                </tr>
              ) : brands.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-muted px-6 py-12 text-center font-bold">
                    No equipment brands found matching your search.
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
                        title="Click to view equipment brand profile"
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
                              className="max-h-full max-w-full object-contain rounded-lg"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-brand-green)]/15 to-[var(--color-brand-green)]/5 text-xs font-black text-[var(--color-brand-green)]">
                              {brand.name.charAt(0)}
                            </div>
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
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          onClick={(e) => handleToggleActive(brand.id, e)}
                          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black tracking-widest uppercase ${brand.isActive ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] hover:bg-[var(--color-brand-green)]/20' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}
                        >
                          {brand.isActive ? 'Active' : 'Inactive'}
                        </span>
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
                          title="View Equipment Brand Profile"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={(e) => handleEdit(brand, e)}
                          className="text-foreground/70 rounded-xl p-2 transition-colors hover:bg-[var(--color-brand-orange)]/10 hover:text-[var(--color-brand-orange)] cursor-pointer"
                          title="Edit Equipment Brand"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(brand.id, e)}
                          className="text-foreground/70 rounded-xl p-2 transition-colors hover:bg-red-500/10 hover:text-red-500 cursor-pointer"
                          title="Delete Equipment Brand"
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

      {/* EQUIPMENT BRAND PROFILE POPUP MODAL */}
      {detailBrand && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 sm:p-6 backdrop-blur-md animate-fade-in">
          <div
            className="fixed inset-0 -z-10"
            onClick={() => setDetailBrand(null)}
          />

          <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-background shadow-2xl animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-foreground/[0.02] p-5 sm:p-6">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-white p-2 shadow-sm">
                  {detailBrand.logoUrl ? (
                    <img
                      src={detailBrand.logoUrl}
                      alt={detailBrand.name}
                      className="max-h-full max-w-full object-contain rounded-xl"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-brand-green)]/15 to-[var(--color-brand-green)]/5 text-lg font-black text-[var(--color-brand-green)]">
                      {detailBrand.name.charAt(0)}
                    </div>
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
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4">
                  <span className="text-muted block text-[10px] font-black tracking-wider uppercase">
                    Country of Origin
                  </span>
                  <div className="text-foreground text-base font-black mt-1 flex items-center gap-1.5">
                    <Globe size={14} className="text-muted" />
                    {detailBrand.country || 'Not specified'}
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4">
                  <span className="text-muted block text-[10px] font-black tracking-wider uppercase">
                    Database ID
                  </span>
                  <div className="text-foreground text-base font-black mt-1">
                    #{detailBrand.id}
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4">
                  <span className="text-muted block text-[10px] font-black tracking-wider uppercase">
                    Status
                  </span>
                  <div className={`text-base font-black mt-1 ${detailBrand.isActive ? 'text-[var(--color-brand-green)]' : 'text-red-500'}`}>
                    {detailBrand.isActive ? 'Active Brand' : 'Inactive Brand'}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-[var(--border-subtle)] bg-foreground/[0.02] p-4 sm:p-6">
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
                <Edit2 size={14} /> Edit Equipment Brand
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && <EquipmentBrandModal brand={selectedBrand} onClose={handleModalClose} />}
    </div>
  );
}
