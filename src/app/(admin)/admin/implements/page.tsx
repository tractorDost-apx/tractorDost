'use client';

import React, { useState, useEffect } from 'react';
import { implementAPI, Implement } from '@/lib/api/implements';
import { Plus, Search, Edit2, Trash2, Wrench } from 'lucide-react';
import Link from 'next/link';
import Pagination from '@/components/shared/Pagination';
import ImplementBulkImport from '@/components/admin/implement-bulk-import/implement-bulk-import';


export default function ImplementsPage() {
  const [implementsList, setImplementsList] = useState<Implement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchImplements = async () => {
    setLoading(true);
    try {
      const response = await implementAPI.getAllImplements({ page, limit, search });
      if (response.success) {
        const payload = response.data as any;
        setImplementsList(payload.data);
        setTotalPages(payload.pagination?.totalPages || 1);
        setTotalCount(payload.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch implements', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchImplements();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, page, limit]);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this implement?')) {
      try {
        await implementAPI.deleteImplement(id);
        fetchImplements();
      } catch (error) {
        alert('Failed to delete implement.');
      }
    }
  };

  const formatPrice = (price: number | null | undefined) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 animate-fade-in pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Implement Catalog</h1>
          <p className="text-sm font-bold text-muted mt-1">Manage all implements, categories, and pricing details.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ImplementBulkImport onImported={() => fetchImplements()} />
          <Link
            href="/admin/implements/new"
            className="spatial-button px-5 py-2.5 text-sm rounded-full shadow-lg flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <Plus size={16} /> Add New Implement
          </Link>
        </div>
      </div>

      {/* Stats and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-panel p-4 rounded-2xl">
        <div className="flex items-center gap-4 text-sm font-bold w-full md:w-auto">
          <div className="flex items-center gap-2 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] px-4 py-2 rounded-xl">
            <Wrench size={18} />
            Total Implements: {totalCount}
          </div>
        </div>

        <div className="relative w-full md:w-80 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted group-focus-within:text-[var(--color-brand-green)] transition-colors">
            <Search size={16} />
          </div>
          <input 
            type="text" 
            placeholder="Search implements by name..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-foreground/5 border border-transparent rounded-full py-2.5 pl-10 pr-4 text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-foreground/5 text-muted uppercase text-[11px] font-black tracking-wider">
              <tr>
                <th className="px-6 py-4">Implement Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Weight/Width</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Price Range</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted font-bold">
                    Loading implements...
                  </td>
                </tr>
              ) : implementsList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted font-bold">
                    No implements found matching your search.
                  </td>
                </tr>
              ) : (
                implementsList.map((item) => (
                  <tr key={item.id} className="hover:bg-foreground/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-foreground/5 flex items-center justify-center border border-foreground/10 shrink-0">
                          <Wrench size={20} className="text-muted" />
                        </div>
                        <div>
                          <div className="font-bold text-foreground text-base">
                            {item.brand?.name} {item.modelName}
                          </div>
                          <div className="text-xs text-muted truncate max-w-[150px] sm:max-w-[200px]" title={item.slug}>{item.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground/80">
                      {item.category?.name || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-foreground/80">{item.weightKg ? `${item.weightKg} kg` : '-'}</span>
                        <span className="text-[10px] uppercase tracking-wider text-muted font-black">{item.workingWidthFt ? `${item.workingWidthFt} ft` : '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block w-2 h-2 rounded-full ${item.isActive ? 'bg-[var(--color-brand-green)]' : 'bg-red-500'}`} />
                        <span className="text-xs font-bold text-muted">{item.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground/80">
                      {item.priceMin ? (
                        <span>{formatPrice(item.priceMin)} - {formatPrice(item.priceMax)}</span>
                      ) : (
                        <span className="text-muted">Not Set</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/implements/${item.id}`}
                          className="p-2 rounded-xl text-foreground/70 hover:text-[var(--color-brand-orange)] hover:bg-[var(--color-brand-orange)]/10 transition-colors"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(item.id)}
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
        <Pagination
          page={page}
          limit={limit}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={setPage}
          onLimitChange={(l) => { setLimit(l); setPage(1); }}
        />
      </div>
    </div>
  );
}
