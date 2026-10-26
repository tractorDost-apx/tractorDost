'use client';

import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Eye,
  MousePointerClick,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  X,
  Upload,
} from 'lucide-react';
import {
  bannerAPI,
  BANNER_PLACEMENTS,
  getBannerStatus,
  buildBannerFormData,
  getBannerImageError,
} from '@/lib/api/banners';
import type { Banner } from '@/types/models/banner';
import { TractorLoader } from '@/components/ui/TractorLoader';
import { toast } from '@/components/ui/toast';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [page, setPage] = useState('home');
  const [position, setPosition] = useState('hero');
  const [title, setTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [altText, setAltText] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);
  const [formError, setFormError] = useState('');

  const loadBanners = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await bannerAPI.getAll({});
      if (res.success && Array.isArray(res.data)) {
        setBanners(res.data);
      } else {
        setBanners([]);
      }
    } catch (err: any) {
      console.error('Failed to load banners:', err);
      setErrorMsg(err?.response?.data?.message || 'Failed to fetch banner records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const openCreateModal = () => {
    setEditingBanner(null);
    setPage('home');
    setPosition('hero');
    setTitle('');
    setLinkUrl('');
    setCtaText('Explore Deals');
    setAltText('');
    setStartDate('');
    setEndDate('');
    setIsActive(true);
    setSortOrder(0);
    setDesktopFile(null);
    setMobileFile(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setPage(banner.page);
    setPosition(banner.position);
    setTitle(banner.title || '');
    setLinkUrl(banner.linkUrl || '');
    setCtaText(banner.ctaText || '');
    setAltText(banner.altText || '');
    setStartDate(banner.startDate ? banner.startDate.slice(0, 10) : '');
    setEndDate(banner.endDate ? banner.endDate.slice(0, 10) : '');
    setIsActive(banner.isActive);
    setSortOrder(banner.sortOrder || 0);
    setDesktopFile(null);
    setMobileFile(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!editingBanner && !desktopFile) {
      setFormError('Desktop banner image is required for new banners.');
      return;
    }

    if (desktopFile) {
      const err = getBannerImageError(desktopFile);
      if (err) {
        setFormError(err);
        return;
      }
    }

    if (mobileFile) {
      const err = getBannerImageError(mobileFile);
      if (err) {
        setFormError(err);
        return;
      }
    }

    setSubmitting(true);
    try {
      const formData = buildBannerFormData(
        {
          page,
          position,
          title: title || null,
          linkUrl: linkUrl || null,
          ctaText: ctaText || null,
          altText: altText || null,
          startDate: startDate ? new Date(startDate).toISOString() : null,
          endDate: endDate ? new Date(endDate).toISOString() : null,
          isActive,
          sortOrder: Number(sortOrder) || 0,
        },
        {
          desktop: desktopFile || undefined,
          mobile: mobileFile || undefined,
        }
      );

      if (editingBanner) {
        await bannerAPI.update(editingBanner.id, formData);
        toast.success('Banner updated successfully');
      } else {
        await bannerAPI.create(formData);
        toast.success('Banner created successfully');
      }

      setIsModalOpen(false);
      await loadBanners();
    } catch (err: any) {
      console.error('Failed to save banner:', err);
      setFormError(err?.response?.data?.message || 'Failed to save banner.');
      toast.error(err?.response?.data?.message || 'Failed to save banner.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBanner = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this promotional banner?')) return;
    try {
      await bannerAPI.delete(id);
      toast.success('Banner deleted successfully');
      await loadBanners();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete banner');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-lime-400/10 text-lime-400">
              <ImageIcon size={18} />
            </span>
            <h1 className="text-2xl font-black text-foreground">Banner Campaign Management</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage homepage hero carousels, seasonal promotional offers, and brand partner advertisements.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-5 py-2.5 text-xs font-black uppercase text-black hover:bg-lime-300 transition-all shadow-md"
        >
          <Plus size={16} /> Create Banner
        </button>
      </div>

      {/* Error state */}
      {errorMsg && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-semibold text-red-500">
          {errorMsg}
        </div>
      )}

      {/* Banners Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <TractorLoader size={48} />
          <p className="text-muted-foreground mt-3 text-xs font-bold">Loading banner records...</p>
        </div>
      ) : banners.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/60 bg-card/40 p-12 text-center">
          <ImageIcon size={48} className="mx-auto text-muted-foreground mb-3 opacity-60" />
          <h3 className="text-foreground text-base font-bold">No active promotional banners</h3>
          <p className="text-muted-foreground text-xs mt-1 mb-6">
            Add high-resolution promotional hero banners to engage farmers visiting the platform.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="rounded-full bg-lime-400 px-6 py-2.5 text-xs font-black uppercase text-black"
          >
            Create First Banner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {banners.map((b) => {
            const status = getBannerStatus(b);
            return (
              <div
                key={b.id}
                className="group flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card/60 shadow-sm transition-all hover:border-lime-400/50 hover:shadow-xl"
              >
                {/* Banner Preview Image */}
                <div className="relative aspect-[16/7] w-full overflow-hidden bg-black/60">
                  <img
                    src={b.desktopImageUrl || b.imageUrl}
                    alt={b.altText || b.title || 'Banner'}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-full bg-black/80 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                    <span>{b.page} · {b.position}</span>
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase shadow-md ${
                        status === 'LIVE'
                          ? 'bg-lime-400 text-black'
                          : status === 'SCHEDULED'
                          ? 'bg-amber-400 text-black'
                          : status === 'EXPIRED'
                          ? 'bg-red-500 text-white'
                          : 'bg-zinc-700 text-white'
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-foreground line-clamp-1 text-base font-extrabold mb-1">
                    {b.title || 'Untitled Banner'}
                  </h3>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5 mb-3">
                    <ExternalLink size={12} />
                    <span className="truncate">{b.linkUrl || 'No external URL linked'}</span>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-2 rounded-2xl bg-secondary/30 p-3 text-xs mb-4">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Eye size={13} className="text-lime-400" />
                      <span>{b.impressionsCount ?? b.impressions ?? 0} Views</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MousePointerClick size={13} className="text-lime-400" />
                      <span>{b.clicksCount ?? b.clickCount ?? 0} Clicks</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto flex items-center justify-between border-t border-border/30 pt-3">
                    <div className="text-[11px] font-bold text-muted-foreground">
                      Order: #{b.sortOrder}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(b)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-foreground hover:bg-lime-400 hover:text-black transition-colors"
                        title="Edit Banner"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBanner(b.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                        title="Delete Banner"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border/60 bg-card p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>

            <h2 className="text-xl font-black text-foreground mb-4">
              {editingBanner ? 'Edit Promotional Banner' : 'Create New Promotional Banner'}
            </h2>

            {formError && (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-500">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveBanner} className="space-y-4">
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                  Banner Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Navratri Tractor Mahotsav 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-3 py-2 text-xs font-medium focus:border-lime-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                    Placement Page
                  </label>
                  <select
                    value={page}
                    onChange={(e) => setPage(e.target.value)}
                    className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-3 py-2 text-xs font-medium focus:border-lime-400 focus:outline-none"
                  >
                    <option value="home">Home</option>
                    <option value="tractors">Tractors Catalog</option>
                    <option value="loan">Loan Portal</option>
                  </select>
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                    Position
                  </label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-3 py-2 text-xs font-medium focus:border-lime-400 focus:outline-none"
                  >
                    <option value="hero">Hero Carousel</option>
                    <option value="sidebar">Sidebar Banner</option>
                    <option value="footer_above">Footer Sticky</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                    Click Link URL
                  </label>
                  <input
                    type="text"
                    placeholder="/loan or https://..."
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-3 py-2 text-xs font-medium focus:border-lime-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Check Subsidy"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-3 py-2 text-xs font-medium focus:border-lime-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* File Uploads */}
              <div className="space-y-3 rounded-2xl border border-border/40 bg-secondary/20 p-4">
                <div>
                  <label className="text-foreground block text-xs font-bold mb-1">
                    Desktop Image {editingBanner ? '(Leave empty to keep current)' : '*'}
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setDesktopFile(e.target.files?.[0] || null)}
                    className="text-xs text-muted-foreground file:mr-2 file:rounded-lg file:border-0 file:bg-lime-400 file:px-3 file:py-1 file:text-xs file:font-black file:text-black hover:file:bg-lime-300"
                  />
                </div>
                <div>
                  <label className="text-foreground block text-xs font-bold mb-1">
                    Mobile Image (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setMobileFile(e.target.files?.[0] || null)}
                    className="text-xs text-muted-foreground file:mr-2 file:rounded-lg file:border-0 file:bg-lime-400 file:px-3 file:py-1 file:text-xs file:font-black file:text-black hover:file:bg-lime-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-3 py-2 text-xs font-medium focus:border-lime-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-3 py-2 text-xs font-medium focus:border-lime-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border/40 pt-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded accent-lime-400"
                  />
                  <span>Active Campaign</span>
                </label>

                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">Sort Order:</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-16 rounded-lg border border-border/50 bg-secondary/30 px-2 py-1 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-border/60 px-5 py-2.5 text-xs font-bold text-foreground hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-lime-400 px-6 py-2.5 text-xs font-black uppercase text-black hover:bg-lime-300 disabled:opacity-70 shadow-md"
                >
                  {submitting ? 'Saving Banner...' : editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
