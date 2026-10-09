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
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="animate-fade-in flex h-full w-full flex-col gap-6 pb-12">
      {/* Header section */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground text-3xl font-black tracking-tight">Implement Catalog</h1>
          <p className="text-muted mt-1 text-sm font-bold">
            Manage all implements, categories, and pricing details.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ImplementBulkImport onImported={() => fetchImplements()} />
          <Link
            href="/admin/implements/new"
            className="spatial-button flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm whitespace-nowrap shadow-lg"
          >
            <Plus size={16} /> Add New Implement
          </Link>
        </div>
      </div>

      {/* Stats and Search */}
      <div className="glass-panel flex flex-col items-center justify-between gap-4 rounded-2xl p-4 md:flex-row">
        <div className="flex w-full items-center gap-4 text-sm font-bold md:w-auto">
          <div className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)]/10 px-4 py-2 text-[var(--color-brand-green)]">
            <Wrench size={18} />
            Total Implements: {totalCount}
          </div>
        </div>

        <div className="group relative w-full md:w-80">
          <div className="text-muted pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 transition-colors group-focus-within:text-[var(--color-brand-green)]">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search implements by name..."
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
                <th className="px-6 py-4">Implement Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Weight/Width</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Price Range</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-foreground/5 divide-y">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-muted px-6 py-12 text-center font-bold">
                    Loading implements...
                  </td>
                </tr>
              ) : implementsList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-muted px-6 py-12 text-center font-bold">
                    No implements found matching your search.
                  </td>
                </tr>
              ) : (
                implementsList.map((item) => (
                  <tr key={item.id} className="hover:bg-foreground/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-foreground/5 border-[var(--border-subtle)] flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border">
                          <Wrench size={20} className="text-muted" />
                        </div>
                        <div>
                          <div className="text-foreground text-base font-bold">
                            {item.brand?.name} {item.modelName}
                          </div>
                          <div
                            className="text-muted max-w-[150px] truncate text-xs sm:max-w-[200px]"
                            title={item.slug}
                          >
                            {item.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-foreground/80 px-6 py-4 font-bold">
                      {item.category?.name || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-foreground/80 text-xs font-bold">
                          {item.weightKg ? `${item.weightKg} kg` : '-'}
                        </span>
                        <span className="text-muted text-[10px] font-black tracking-wider uppercase">
                          {item.workingWidthFt ? `${item.workingWidthFt} ft` : '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block h-2 w-2 rounded-full ${item.isActive ? 'bg-[var(--color-brand-green)]' : 'bg-red-500'}`}
                        />
                        <span className="text-muted text-xs font-bold">
                          {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="text-foreground/80 px-6 py-4 font-bold">
                      {item.priceMin ? (
                        <span>
                          {formatPrice(item.priceMin)} - {formatPrice(item.priceMax)}
                        </span>
                      ) : (
                        <span className="text-muted">Not Set</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/implements/${item.id}`}
                          className="text-foreground/70 rounded-xl p-2 transition-colors hover:bg-[var(--color-brand-orange)]/10 hover:text-[var(--color-brand-orange)]"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-foreground/70 rounded-xl p-2 transition-colors hover:bg-red-500/10 hover:text-red-500"
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
    </div>
  );
}
