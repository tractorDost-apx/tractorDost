'use client';

import React, { useState, useEffect } from 'react';
import { tractorAPI, Tractor, LaunchStatus, FuelType } from '@/lib/api/tractors';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Tractor as TractorIcon,
  Settings2,
  AlignLeft,
  Info,
  Hash,
  Image as ImageIcon,
  CheckCircle,
  BarChart,
} from 'lucide-react';
import Link from 'next/link';
import Pagination from '@/components/shared/Pagination';
import TractorBulkImport from '@/components/admin/tractor-bulk-import/tractor-bulk-import';

export default function TractorsPage() {
  const [tractors, setTractors] = useState<Tractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Track which row has its "Deep Analysis" view open
  const [deepExpandedId, setDeepExpandedId] = useState<number | null>(null);

  const fetchTractors = async () => {
    setLoading(true);
    try {
      const response = await tractorAPI.getAllTractors({ page, limit, search });
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
  }, [search, page, limit]);

  const toggleDeepExpand = (id: number) => {
    setDeepExpandedId(deepExpandedId === id ? null : id);
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
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

  return (
    <div className="animate-fade-in flex h-full w-full flex-col gap-6 pb-12">
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

      {/* Stats and Search */}
      <div className="glass-panel flex flex-col items-center justify-between gap-4 rounded-2xl p-4 md:flex-row">
        <div className="flex w-full items-center gap-4 text-sm font-bold md:w-auto">
          <div className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)]/10 px-4 py-2 text-[var(--color-brand-green)]">
            <TractorIcon size={18} />
            Total Tractors: {totalCount}
          </div>
          <p className="text-muted ml-2 hidden text-xs font-medium sm:block">
            Click on any row for deep insights.
          </p>
        </div>

        <div className="group relative w-full md:w-80">
          <div className="text-muted pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 transition-colors group-focus-within:text-[var(--color-brand-green)]">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search tractors by name..."
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
                    No tractors found matching your search.
                  </td>
                </tr>
              ) : (
                tractors.map((tractor) => {
                  const isDeepExpanded = deepExpandedId === tractor.id;
                  const primaryImage =
                    tractor.media?.find((m) => m.isPrimary) || tractor.media?.[0];

                  return (
                    <React.Fragment key={tractor.id}>
                      <tr
                        className={`hover:bg-foreground/5 cursor-pointer transition-colors ${isDeepExpanded ? 'bg-foreground/5' : ''}`}
                        onClick={() => toggleDeepExpand(tractor.id)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-white p-1 shadow-sm">
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
                              <div className="text-foreground text-base font-black">
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
                                {tractor.driveType.replace('_', ' ')}
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

                      {/* DEEP ANALYSIS VIEW */}
                      {isDeepExpanded && (
                        <tr>
                          <td colSpan={6} className="bg-foreground/[0.02] px-0 py-0">
                            <div className="animate-fade-in flex flex-col gap-6 border-b-2 border-[var(--color-brand-green)] p-6 shadow-inner md:p-8">
                              <div className="grid w-full grid-cols-1 gap-8 whitespace-normal md:grid-cols-12">
                                {/* SEO & Meta Data */}
                                <div className="flex flex-col gap-4 md:col-span-5">
                                  <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 text-[var(--color-brand-orange)]">
                                    <BarChart size={18} />
                                    <h3 className="text-sm font-black tracking-wide uppercase">
                                      SEO & Engagement
                                    </h3>
                                  </div>

                                  <div className="mb-2 grid grid-cols-2 gap-4">
                                    <div className="bg-background flex flex-col gap-1 rounded-xl border border-[var(--border-subtle)] p-4 shadow-sm">
                                      <span className="text-muted text-[10px] font-black tracking-wider uppercase">
                                        Total Views
                                      </span>
                                      <span className="text-foreground text-lg font-black">
                                        {tractor.viewsCount || 0}
                                      </span>
                                    </div>
                                    <div className="bg-background flex flex-col gap-1 rounded-xl border border-[var(--border-subtle)] p-4 shadow-sm">
                                      <span className="text-muted text-[10px] font-black tracking-wider uppercase">
                                        Total Leads
                                      </span>
                                      <span className="text-lg font-black text-[var(--color-brand-green)]">
                                        {tractor.leadsCount || 0}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="bg-background flex flex-col gap-3 rounded-xl border border-[var(--border-subtle)] p-4 shadow-sm">
                                    <div>
                                      <span className="text-muted mb-1 block text-[10px] font-black tracking-wider uppercase">
                                        SEO Title
                                      </span>
                                      <p className="text-foreground text-sm font-bold">
                                        {tractor.seoTitle || 'Not specified'}
                                      </p>
                                    </div>
                                    <div className="bg-foreground/5 h-px w-full" />
                                    <div>
                                      <span className="text-muted mb-1 block text-[10px] font-black tracking-wider uppercase">
                                        SEO Description
                                      </span>
                                      <p className="text-foreground/70 text-xs font-medium">
                                        {tractor.seoDescription || 'Not specified'}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Quick Specs Highlight */}
                                <div className="flex flex-col gap-4 md:col-span-7">
                                  <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 text-[var(--color-brand-green)]">
                                    <Settings2 size={18} />
                                    <h3 className="text-sm font-black tracking-wide uppercase">
                                      Key Technical Specs
                                    </h3>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                    <div className="bg-background flex flex-col items-center gap-1 rounded-xl border border-[var(--border-subtle)] p-4 text-center shadow-sm">
                                      <span className="text-muted text-[10px] font-black tracking-wider uppercase">
                                        Engine CC
                                      </span>
                                      <span className="text-foreground text-sm font-black">
                                        {tractor.spec?.engineCc || '-'}
                                      </span>
                                    </div>
                                    <div className="bg-background flex flex-col items-center gap-1 rounded-xl border border-[var(--border-subtle)] p-4 text-center shadow-sm">
                                      <span className="text-muted text-[10px] font-black tracking-wider uppercase">
                                        Cylinders
                                      </span>
                                      <span className="text-foreground text-sm font-black">
                                        {tractor.spec?.cylinders || '-'}
                                      </span>
                                    </div>
                                    <div className="bg-background flex flex-col items-center gap-1 rounded-xl border border-[var(--border-subtle)] p-4 text-center shadow-sm">
                                      <span className="text-muted text-[10px] font-black tracking-wider uppercase">
                                        PTO HP
                                      </span>
                                      <span className="text-foreground text-sm font-black">
                                        {tractor.spec?.ptoHp || '-'}
                                      </span>
                                    </div>
                                    <div className="bg-background flex flex-col items-center gap-1 rounded-xl border border-[var(--border-subtle)] p-4 text-center shadow-sm">
                                      <span className="text-muted text-[10px] font-black tracking-wider uppercase">
                                        Lift Cap.
                                      </span>
                                      <span className="text-foreground text-sm font-black">
                                        {tractor.spec?.liftingCapacityKg
                                          ? `${tractor.spec.liftingCapacityKg} kg`
                                          : '-'}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="mt-2 flex flex-col gap-3">
                                    <div className="flex items-start gap-2">
                                      <Info size={16} className="text-muted mt-0.5 shrink-0" />
                                      <div>
                                        <span className="text-muted block text-[10px] font-black tracking-wider uppercase">
                                          Overview
                                        </span>
                                        <p className="text-foreground/80 line-clamp-2 text-xs font-medium">
                                          {tractor.overview || 'No overview provided.'}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <CheckCircle
                                        size={16}
                                        className="mt-0.5 shrink-0 text-[var(--color-brand-green)]"
                                      />
                                      <div>
                                        <span className="text-muted block text-[10px] font-black tracking-wider uppercase">
                                          Why Buy?
                                        </span>
                                        <p className="text-foreground/80 line-clamp-2 text-xs font-medium">
                                          {tractor.whyBuy || 'No reason provided.'}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-4">
                                <div className="text-muted flex items-center gap-2 text-xs font-bold">
                                  <ImageIcon size={14} />
                                  {tractor.media?.length || 0} Media File(s) Attached
                                </div>
                                <Link
                                  href={`/admin/tractors/${tractor.id}`}
                                  className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-6 py-2.5 text-sm font-black tracking-wider text-white uppercase shadow-[var(--color-brand-green)]/20 shadow-lg transition-colors hover:bg-[var(--color-brand-orange)]"
                                >
                                  <Edit2 size={16} /> Edit Full Profile
                                </Link>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
    </div>
  );
}
