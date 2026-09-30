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
  const [expandedId, setExpandedId] = useState<number | null>(null);

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

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="animate-fade-in flex h-full w-full flex-col gap-6 pb-12">
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
          <table className="w-full text-left text-sm">
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
                  <React.Fragment key={brand.id}>
                    <tr
                      className={`hover:bg-foreground/5 cursor-pointer transition-colors ${expandedId === brand.id ? 'bg-foreground/5' : ''}`}
                      onClick={() => toggleExpand(brand.id)}
                    >
                      <td className="text-muted px-6 py-4">
                        {expandedId === brand.id ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-white p-1.5 shadow-sm">
                            {brand.logoUrl ? (
                              <img
                                src={brand.logoUrl}
                                alt={brand.name}
                                className="max-h-full max-w-full object-contain"
                              />
                            ) : (
                              <span className="text-[10px] font-black text-gray-400 uppercase">
                                N/A
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <div className="text-foreground text-base font-black tracking-tight">
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
                            onClick={(e) => handleEdit(brand, e)}
                            className="text-foreground/70 rounded-xl p-2 transition-colors hover:bg-[var(--color-brand-orange)]/10 hover:text-[var(--color-brand-orange)]"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={(e) => handleDelete(brand.id, e)}
                            className="text-foreground/70 rounded-xl p-2 transition-colors hover:bg-red-500/10 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* EXPANDED VIEW */}
                    {expandedId === brand.id && (
                      <tr>
                        <td colSpan={5} className="bg-foreground/[0.02] px-0 py-0">
                          <div className="animate-fade-in flex flex-col gap-6 border-b-2 border-[var(--color-brand-green)] p-6 md:p-8">
                            <div className="flex justify-end pt-4">
                              <button
                                onClick={(e) => handleEdit(brand, e)}
                                className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-6 py-2.5 text-sm font-black tracking-wider text-white uppercase shadow-[var(--color-brand-green)]/20 shadow-lg transition-colors hover:bg-[var(--color-brand-orange)]"
                              >
                                <Edit2 size={16} /> Edit Equipment Brand
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

      {isModalOpen && <EquipmentBrandModal brand={selectedBrand} onClose={handleModalClose} />}
    </div>
  );
}
