'use client';

import React, { useState, useEffect } from 'react';
import { equipmentBrandAPI, EquipmentBrand } from '@/lib/api/equipmentBrands';
import { Plus, Search, Edit2, Trash2, ShieldCheck, ChevronDown, ChevronUp, Globe, Activity } from 'lucide-react';
import EquipmentBrandModal from './components/EquipmentBrandModal';

export default function EquipmentBrandsPage() {
  const [brands, setBrands] = useState<EquipmentBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<EquipmentBrand | null>(null);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const response = await equipmentBrandAPI.getAllEquipmentBrands({ page, limit: 10, search });
      if (response.success) {
        setBrands(response.data.data);
        setTotalPages(response.data.totalPages);
        setTotalCount(response.data.totalCount);
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
  }, [search, page]);

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
    <div className="w-full h-full flex flex-col gap-6 animate-fade-in pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Equipment Brand Management</h1>
          <p className="text-sm font-bold text-muted mt-1">Deep analysis & master view of equipment brands.</p>
        </div>
        <button 
          onClick={() => { setSelectedBrand(null); setIsModalOpen(true); }}
          className="spatial-button px-5 py-2.5 text-sm rounded-full shadow-lg flex items-center gap-2 whitespace-nowrap shrink-0"
        >
          <Plus size={16} /> Add New Equipment Brand
        </button>
      </div>

      {/* Stats and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-panel p-4 rounded-2xl">
        <div className="flex items-center gap-4 text-sm font-bold w-full md:w-auto">
          <div className="flex items-center gap-2 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] px-4 py-2 rounded-xl">
            <ShieldCheck size={18} />
            Total Equipment Brands: {totalCount}
          </div>
        </div>

        <div className="relative w-full md:w-80 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted group-focus-within:text-[var(--color-brand-green)] transition-colors">
            <Search size={16} />
          </div>
          <input 
            type="text" 
            placeholder="Search equipment brands by name..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-foreground/5 border border-transparent rounded-full py-2.5 pl-10 pr-4 text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-foreground/5 text-muted uppercase text-[11px] font-black tracking-wider">
              <tr>
                <th className="px-6 py-4 w-10"></th>
                <th className="px-6 py-4">Brand</th>
                <th className="px-6 py-4">Country</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted font-bold">
                    Loading deep brand insights...
                  </td>
                </tr>
              ) : brands.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted font-bold">
                    No equipment brands found matching your search.
                  </td>
                </tr>
              ) : (
                brands.map((brand) => (
                  <React.Fragment key={brand.id}>
                    <tr 
                      className={`hover:bg-foreground/5 transition-colors cursor-pointer ${expandedId === brand.id ? 'bg-foreground/5' : ''}`}
                      onClick={() => toggleExpand(brand.id)}
                    >
                      <td className="px-6 py-4 text-muted">
                        {expandedId === brand.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center p-1.5 border border-[var(--border-subtle)] shrink-0 shadow-sm">
                            {brand.logoUrl ? (
                              <img src={brand.logoUrl} alt={brand.name} className="max-h-full max-w-full object-contain" />
                            ) : (
                              <span className="text-gray-400 font-black text-[10px] uppercase">N/A</span>
                            )}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <div className="font-black text-foreground text-base tracking-tight">{brand.name}</div>
                            <div className="text-[10px] font-bold text-muted/70 uppercase tracking-wider">{brand.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex flex-col gap-1 text-xs">
                          <span className="font-bold text-foreground/80 flex items-center gap-1.5">
                            <Globe size={12} className="text-muted"/> {brand.country || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 items-center">
                          <span 
                            onClick={(e) => handleToggleActive(brand.id, e)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase cursor-pointer ${brand.isActive ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] hover:bg-[var(--color-brand-green)]/20' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}>
                            {brand.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={(e) => handleEdit(brand, e)}
                            className="p-2 rounded-xl text-foreground/70 hover:text-[var(--color-brand-orange)] hover:bg-[var(--color-brand-orange)]/10 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={(e) => handleDelete(brand.id, e)}
                            className="p-2 rounded-xl text-foreground/70 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* EXPANDED VIEW */}
                    {expandedId === brand.id && (
                      <tr>
                        <td colSpan={5} className="px-0 py-0 bg-foreground/[0.02]">
                          <div className="p-6 md:p-8 flex flex-col gap-6 animate-fade-in border-b-2 border-[var(--color-brand-green)]">
                            <div className="flex justify-end pt-4">
                               <button 
                                  onClick={(e) => handleEdit(brand, e)}
                                  className="px-6 py-2.5 bg-[var(--color-brand-green)] text-white font-black text-sm uppercase tracking-wider rounded-xl hover:bg-[var(--color-brand-orange)] transition-colors shadow-lg shadow-[var(--color-brand-green)]/20 flex items-center gap-2"
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
        {!loading && totalPages > 1 && (
          <div className="mt-auto p-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 text-sm font-bold rounded-xl bg-foreground/5 hover:bg-foreground/10 disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              Previous
            </button>
            <span className="text-sm font-bold text-muted">Page {page} of {totalPages}</span>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 text-sm font-bold rounded-xl bg-foreground/5 hover:bg-foreground/10 disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <EquipmentBrandModal brand={selectedBrand} onClose={handleModalClose} />
      )}
    </div>
  );
}
