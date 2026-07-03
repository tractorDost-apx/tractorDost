'use client';

import React, { useState, useEffect } from 'react';
import { tractorAPI, Tractor, LaunchStatus, FuelType } from '@/lib/api/tractors';
import { Plus, Search, Edit2, Trash2, Tractor as TractorIcon, Settings2 } from 'lucide-react';
import Link from 'next/link';

export default function TractorsPage() {
  const [tractors, setTractors] = useState<Tractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchTractors = async () => {
    setLoading(true);
    try {
      const response = await tractorAPI.getAllTractors({ page, limit: 10, search });
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
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, page]);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this tractor?')) {
      try {
        await tractorAPI.deleteTractor(id);
        fetchTractors();
      } catch (error) {
        alert('Failed to delete tractor.');
      }
    }
  };

  const formatPrice = (price: number | null | undefined) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };

  const getStatusColor = (status: LaunchStatus) => {
    switch(status) {
      case LaunchStatus.LATEST: return 'bg-blue-500/10 text-blue-500';
      case LaunchStatus.POPULAR: return 'bg-[var(--color-brand-orange)]/10 text-[var(--color-brand-orange)]';
      case LaunchStatus.UPCOMING: return 'bg-purple-500/10 text-purple-500';
      case LaunchStatus.DISCONTINUED: return 'bg-red-500/10 text-red-500';
      default: return 'bg-foreground/10 text-foreground';
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 animate-fade-in pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Tractor Catalog</h1>
          <p className="text-sm font-bold text-muted mt-1">Manage all tractors, specs, and pricing details.</p>
        </div>
        <Link 
          href="/admin/tractors/new"
          className="spatial-button px-5 py-2.5 text-sm rounded-full shadow-lg flex items-center gap-2 whitespace-nowrap shrink-0"
        >
          <Plus size={16} /> Add New Tractor
        </Link>
      </div>

      {/* Stats and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-panel p-4 rounded-2xl">
        <div className="flex items-center gap-4 text-sm font-bold w-full md:w-auto">
          <div className="flex items-center gap-2 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] px-4 py-2 rounded-xl">
            <TractorIcon size={18} />
            Total Tractors: {totalCount}
          </div>
        </div>

        <div className="relative w-full md:w-80 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted group-focus-within:text-[var(--color-brand-green)] transition-colors">
            <Search size={16} />
          </div>
          <input 
            type="text" 
            placeholder="Search tractors by name..." 
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
                <th className="px-6 py-4">Tractor Name</th>
                <th className="px-6 py-4">HP</th>
                <th className="px-6 py-4">Fuel & Drive</th>
                <th className="px-6 py-4">Status & Visibility</th>
                <th className="px-6 py-4">Price Range</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted font-bold">
                    Loading tractors...
                  </td>
                </tr>
              ) : tractors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted font-bold">
                    No tractors found matching your search.
                  </td>
                </tr>
              ) : (
                tractors.map((tractor) => (
                  <tr key={tractor.id} className="hover:bg-foreground/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-foreground/5 flex items-center justify-center border border-foreground/10 shrink-0">
                          <TractorIcon size={20} className="text-muted" />
                        </div>
                        <div>
                          <div className="font-bold text-foreground text-base">
                            {tractor.brand?.name} {tractor.modelName}
                          </div>
                          <div className="text-xs text-muted">{tractor.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground/80">
                      {tractor.hp ? `${tractor.hp} HP` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-foreground/80">{tractor.fuelType}</span>
                        <span className="text-[10px] uppercase tracking-wider text-muted font-black">{tractor.driveType.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2 items-start">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide uppercase ${getStatusColor(tractor.launchStatus)}`}>
                          {tractor.launchStatus}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`inline-block w-2 h-2 rounded-full ${tractor.isActive ? 'bg-[var(--color-brand-green)]' : 'bg-red-500'}`} />
                          <span className="text-xs font-bold text-muted">{tractor.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground/80">
                      {tractor.exShowroomPriceMin ? (
                        <span>{formatPrice(tractor.exShowroomPriceMin)} - {formatPrice(tractor.exShowroomPriceMax)}</span>
                      ) : (
                        <span className="text-muted">Not Set</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/tractors/${tractor.id}`}
                          className="p-2 rounded-xl text-foreground/70 hover:text-[var(--color-brand-orange)] hover:bg-[var(--color-brand-orange)]/10 transition-colors"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(tractor.id)}
                          className="p-2 rounded-xl text-foreground/70 hover:text-red-500 hover:bg-red-500/10 transition-colors"
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
        {!loading && totalPages > 1 && (
          <div className="mt-auto p-4 border-t border-foreground/5 flex items-center justify-between">
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
    </div>
  );
}
