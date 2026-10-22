'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  MousePointerClick,
  Pencil,
  Plus,
  Power,
  RefreshCw,
  Search,
  Trash2,
  X,
  Eye,
  Image as ImageIcon,
} from 'lucide-react';
import {
  bannerAPI,
  BANNER_PLACEMENTS,
  BannerListMeta,
  buildBannerFormData,
  getBannerErrorMessage,
  getBannerStatus,
  getPlacementLabel,
  placementKey,
} from '@/lib/api/banners';
import type { Banner, BannerStatus } from '@/types/models/banner';
import Pagination from '@/components/shared/Pagination';
import BannerEditor from './banner-editor';

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

interface AlertState {
  type: 'success' | 'error';
  text: string;
}

const STATUS_BADGES: Record<BannerStatus, { label: string; className: string }> = {
  LIVE: {
    label: 'Live',
    className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30',
  },
  SCHEDULED: {
    label: 'Scheduled',
    className: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30',
  },
  EXPIRED: {
    label: 'Expired',
    className: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30',
  },
  INACTIVE: {
    label: 'Inactive',
    className: 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border border-zinc-500/30',
  },
};

const filterInputClass =
  'rounded-xl border border-foreground/10 bg-foreground/5 px-3 py-2 text-xs font-semibold text-foreground placeholder:text-muted focus:border-[var(--color-brand-green)] focus:outline-none';

const formatDateTime = (iso: string | null): string | null =>
  iso ? new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : null;

const formatCount = (n: number): string => n.toLocaleString('en-IN');

const formatCtr = (banner: Banner): string =>
  banner.impressions > 0
    ? `${((banner.clickCount / banner.impressions) * 100).toFixed(1)}%`
    : '—';

export default function BannerManagement() {
  // Each response is stored with the request key it answers. Loading and errors are derived from
  // comparing that key to the current one, so the effect never sets state synchronously.
  const [result, setResult] = useState<{ key: string; banners: Banner[]; meta: BannerListMeta } | null>(
    null,
  );
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Filters. The placement filter is "page|position", or "" for every placement.
  const [placementFilter, setPlacementFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [pageNumber, setPageNumber] = useState(1);
  const [limit, setLimit] = useState(10);

  const [editor, setEditor] = useState<{ open: boolean; banner: Banner | null }>({
    open: false,
    banner: null,
  });
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [alertMsg, setAlertMsg] = useState<AlertState | null>(null);

  const hasFilters = placementFilter !== '' || statusFilter !== 'ALL' || debouncedSearch !== '';

  const requestKey = JSON.stringify([
    placementFilter,
    statusFilter,
    debouncedSearch,
    pageNumber,
    limit,
    reloadKey,
  ]);
  const isFresh = result?.key === requestKey;
  const loadError = failure?.key === requestKey ? failure.message : null;
  const loading = !isFresh && loadError === null;
  // Rows from the last successful load stay on screen while a new request is in flight.
  const banners = result?.banners ?? [];
  const meta = result?.meta ?? null;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!alertMsg) return;
    const timer = setTimeout(() => setAlertMsg(null), 5000);
    return () => clearTimeout(timer);
  }, [alertMsg]);

  useEffect(() => {
    let active = true;
    const [page, position] = placementFilter ? placementFilter.split('|') : [undefined, undefined];
    const isActive = statusFilter === 'ALL' ? undefined : statusFilter === 'ACTIVE';

    bannerAPI
      .getAll({
        page,
        position,
        isActive,
        search: debouncedSearch || undefined,
        pageNumber,
        limit,
      })
      .then((res) => {
        if (active) setResult({ key: requestKey, banners: res.data, meta: res.meta });
      })
      .catch((err: unknown) => {
        console.error('Failed to load banners:', err);
        if (active) {
          setFailure({ key: requestKey, message: getBannerErrorMessage(err, 'Could not load banners.') });
        }
      });

    return () => {
      active = false;
    };
  }, [requestKey, placementFilter, statusFilter, debouncedSearch, pageNumber, limit]);

  const resetFilters = () => {
    setPlacementFilter('');
    setStatusFilter('ALL');
    setSearch('');
    setDebouncedSearch('');
    setPageNumber(1);
  };

  // Saves always reload the current page. Re-sorting or moving a banner out of the filter would
  // otherwise leave the table out of step with the server.
  const handleSaved = (banner: Banner, mode: 'create' | 'update') => {
    setAlertMsg({
      type: 'success',
      text:
        mode === 'create'
          ? `Banner #${banner.id} created.`
          : `Banner #${banner.id} updated.`,
    });
    setReloadKey((k) => k + 1);
  };

  const handleToggleActive = async (banner: Banner) => {
    setTogglingId(banner.id);
    setAlertMsg(null);
    try {
      const res = await bannerAPI.update(banner.id, buildBannerFormData({ isActive: !banner.isActive }));
      setAlertMsg({
        type: 'success',
        text: `Banner #${banner.id} is now ${res.data.isActive ? 'active' : 'inactive'}.`,
      });
      if (statusFilter === 'ALL') {
        setResult((prev) =>
          prev && { ...prev, banners: prev.banners.map((b) => (b.id === banner.id ? res.data : b)) },
        );
      } else {
        // The row may no longer match the status filter, so reload to get the right list.
        setReloadKey((k) => k + 1);
      }
    } catch (err: unknown) {
      console.error('Failed to toggle banner:', err);
      setAlertMsg({ type: 'error', text: getBannerErrorMessage(err, 'Could not update the banner.') });
    } finally {
      setTogglingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!bannerToDelete) return;
    setIsDeleting(true);
    try {
      await bannerAPI.delete(bannerToDelete.id);
      setAlertMsg({ type: 'success', text: `Banner #${bannerToDelete.id} was deleted.` });
      setBannerToDelete(null);
      // Step back a page if this was the last row on it.
      if (banners.length === 1 && pageNumber > 1) setPageNumber((p) => p - 1);
      setReloadKey((k) => k + 1);
    } catch (err: unknown) {
      console.error('Failed to delete banner:', err);
      setAlertMsg({ type: 'error', text: getBannerErrorMessage(err, 'Could not delete the banner.') });
    } finally {
      setIsDeleting(false);
    }
  };

  const totalCount = meta?.total ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-foreground">Banner Management</h1>
            <span className="rounded-full border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/20 px-2.5 py-0.5 text-[11px] font-extrabold text-[var(--color-brand-green)]">
              {formatCount(totalCount)} {totalCount === 1 ? 'banner' : 'banners'}
            </span>
          </div>
          <p className="text-muted mt-1 max-w-xl text-xs leading-relaxed">
            Manage the promotional banners shown on the homepage. Schedule them with start and end dates, and track impressions and clicks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            disabled={loading}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-foreground/10 bg-foreground/5 text-muted transition-all hover:bg-foreground/10 hover:text-foreground disabled:opacity-50"
            title="Refresh banners"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-[var(--color-brand-green)]' : ''} />
          </button>
          <button
            type="button"
            onClick={() => setEditor({ open: true, banner: null })}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-4 py-2.5 text-xs font-bold text-foreground shadow-lg shadow-[var(--color-brand-green)]/20 transition-all hover:opacity-90"
          >
            <Plus size={16} />
            <span>Add Banner</span>
          </button>
        </div>
      </div>

      {alertMsg && (
        <div
          role="status"
          className={`flex items-center justify-between gap-3 rounded-2xl border p-3.5 text-xs font-bold ${
            alertMsg.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
              : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {alertMsg.type === 'success' ? (
              <CheckCircle2 size={16} className="shrink-0" />
            ) : (
              <AlertCircle size={16} className="shrink-0" />
            )}
            <span>{alertMsg.text}</span>
          </div>
          <button type="button" onClick={() => setAlertMsg(null)} className="hover:opacity-75" aria-label="Dismiss">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPageNumber(1);
            }}
            placeholder="Search by title..."
            className={`${filterInputClass} w-full pl-9`}
          />
        </div>
        <select
          value={placementFilter}
          onChange={(e) => {
            setPlacementFilter(e.target.value);
            setPageNumber(1);
          }}
          className={`${filterInputClass} cursor-pointer`}
          aria-label="Filter by placement"
        >
          <option value="">All placements</option>
          {BANNER_PLACEMENTS.map((p) => (
            <option key={placementKey(p.page, p.position)} value={placementKey(p.page, p.position)}>
              {p.label}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as StatusFilter);
            setPageNumber(1);
          }}
          className={`${filterInputClass} cursor-pointer`}
          aria-label="Filter by status"
        >
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        {hasFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-bold text-muted transition-colors hover:text-foreground"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="glass-panel flex flex-col overflow-hidden rounded-2xl border border-foreground/10 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-foreground/10 bg-foreground/[0.02] text-[11px] font-black tracking-wider text-muted uppercase select-none">
              <tr>
                <th className="px-4 py-3.5">Preview</th>
                <th className="min-w-[200px] px-4 py-3.5">Banner</th>
                <th className="min-w-[160px] px-4 py-3.5">Schedule</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-center">Order</th>
                <th className="px-4 py-3.5 text-right">Impr.</th>
                <th className="px-4 py-3.5 text-right">Clicks</th>
                <th className="px-4 py-3.5 text-right">CTR</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5 font-medium">
              {loading && banners.length === 0 ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} aria-hidden="true">
                    <td colSpan={9} className="px-4 py-4">
                      <div className="bg-foreground/5 h-8 animate-pulse rounded-lg" />
                    </td>
                  </tr>
                ))
              ) : loadError ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <AlertTriangle size={36} className="mx-auto mb-3 text-red-600 dark:text-red-400" />
                    <p className="text-sm font-bold text-foreground">Could not load banners</p>
                    <p className="text-muted mx-auto mt-1 max-w-sm text-xs">{loadError}</p>
                    <button
                      type="button"
                      onClick={() => setReloadKey((k) => k + 1)}
                      className="mt-4 rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2 text-xs font-bold text-foreground hover:bg-foreground/10"
                    >
                      Try again
                    </button>
                  </td>
                </tr>
              ) : banners.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <ImageIcon size={40} className="mx-auto mb-3 text-[var(--color-brand-green)] opacity-30" />
                    <p className="text-sm font-bold text-foreground">
                      {hasFilters ? 'No banners match these filters' : 'No banners yet'}
                    </p>
                    <p className="text-muted mx-auto mt-1 max-w-sm text-xs">
                      {hasFilters
                        ? 'Try a different placement, status, or search term.'
                        : 'Add a banner to show a promotion on the homepage.'}
                    </p>
                    {hasFilters ? (
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="mt-4 rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2 text-xs font-bold text-foreground hover:bg-foreground/10"
                      >
                        Clear filters
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditor({ open: true, banner: null })}
                        className="mt-4 rounded-xl bg-[var(--color-brand-green)] px-4 py-2 text-xs font-bold text-foreground hover:opacity-90"
                      >
                        Add banner
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                banners.map((banner) => {
                  const status = getBannerStatus(banner);
                  const badge = STATUS_BADGES[status];
                  const start = formatDateTime(banner.startDate);
                  const end = formatDateTime(banner.endDate);
                  return (
                    <tr key={banner.id} className="transition-colors hover:bg-foreground/[0.02]">
                      <td className="px-4 py-3">
                        <div className="relative h-10 w-16 overflow-hidden rounded-md border border-foreground/10 bg-foreground/5">
                          <Image
                            src={banner.imageUrl}
                            alt={banner.altText || banner.title || ''}
                            fill
                            unoptimized
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="max-w-[260px] truncate font-bold text-foreground">
                          {banner.title || <span className="text-muted italic">Untitled</span>}
                        </p>
                        <p className="text-muted mt-0.5 text-[11px] font-bold">
                          {getPlacementLabel(banner.page, banner.position)}
                        </p>
                        {banner.ctaText && (
                          <p className="text-muted mt-0.5 text-[11px]">Button: {banner.ctaText}</p>
                        )}
                        {banner.linkUrl && (
                          <p className="text-muted max-w-[260px] truncate font-mono text-[10px]">{banner.linkUrl}</p>
                        )}
                      </td>
                      <td className="text-muted px-4 py-3 text-[11px]">
                        {start || end ? (
                          <>
                            <p>From: {start ?? 'Immediately'}</p>
                            <p>Until: {end ?? 'No end'}</p>
                          </>
                        ) : (
                          'Always'
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-foreground/80">{banner.sortOrder}</td>
                      <td className="px-4 py-3 text-right text-foreground/80">{formatCount(banner.impressions)}</td>
                      <td className="px-4 py-3 text-right text-foreground/80">{formatCount(banner.clickCount)}</td>
                      <td className="px-4 py-3 text-right text-foreground/80">{formatCtr(banner)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(banner)}
                            disabled={togglingId === banner.id}
                            className="rounded-lg border border-foreground/10 bg-foreground/5 p-2 text-muted transition-all hover:bg-foreground/10 hover:text-foreground disabled:opacity-50"
                            title={banner.isActive ? 'Deactivate' : 'Activate'}
                            aria-label={banner.isActive ? 'Deactivate banner' : 'Activate banner'}
                          >
                            {togglingId === banner.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Power size={14} className={banner.isActive ? 'text-emerald-400' : ''} />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditor({ open: true, banner })}
                            className="rounded-lg border border-foreground/10 bg-foreground/5 p-2 text-muted transition-all hover:bg-foreground/10 hover:text-foreground"
                            title="Edit"
                            aria-label="Edit banner"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setBannerToDelete(banner)}
                            className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-600 dark:text-red-400 transition-all hover:bg-red-500/20"
                            title="Delete"
                            aria-label="Delete banner"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-muted flex items-center gap-4 text-[11px]">
        <span className="flex items-center gap-1.5">
          <Eye size={12} /> Impressions count when a banner is shown on the homepage.
        </span>
        <span className="flex items-center gap-1.5">
          <MousePointerClick size={12} /> Clicks count when a visitor taps the banner.
        </span>
      </p>

      {!loading && !loadError && totalCount > 0 && meta && (
        <Pagination
          page={pageNumber}
          limit={limit}
          totalCount={totalCount}
          totalPages={meta.totalPages}
          onPageChange={(p) => setPageNumber(p)}
          onLimitChange={(l) => {
            setLimit(l);
            setPageNumber(1);
          }}
        />
      )}

      {editor.open && (
        <BannerEditor
          key={editor.banner?.id ?? 'new'}
          banner={editor.banner}
          onClose={() => setEditor({ open: false, banner: null })}
          onSaved={handleSaved}
        />
      )}

      {bannerToDelete && (
        <DeleteBannerDialog
          banner={bannerToDelete}
          isDeleting={isDeleting}
          onClose={() => setBannerToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}

interface DeleteBannerDialogProps {
  banner: Banner;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteBannerDialog({ banner, isDeleting, onClose, onConfirm }: DeleteBannerDialogProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm dark:bg-black/75">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-red-500/20 dark:bg-[#121814]">
        <div className="mb-4 flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-500">
            <AlertTriangle size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-black text-zinc-900 dark:text-white">Delete banner?</h3>
            <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              This permanently removes the banner and its impression and click counts. It cannot be undone.
            </p>
          </div>
        </div>

        <div className="mb-5 rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 dark:border-white/10 dark:bg-black/40">
          <p className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
            Banner #{banner.id} · {getPlacementLabel(banner.page, banner.position)}
          </p>
          <p className="mt-1 line-clamp-2 text-xs font-semibold text-zinc-900 dark:text-white">
            {banner.title || banner.altText || banner.imageUrl}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-2.5 text-xs font-bold text-zinc-700 transition-all hover:bg-zinc-200 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-500 disabled:opacity-50"
          >
            {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            <span>{isDeleting ? 'Deleting...' : 'Delete banner'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
