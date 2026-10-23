'use client';

import React, { useState, useEffect, useMemo, useDeferredValue } from 'react';
import {
  HelpCircle,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  FolderTree,
  X,
} from 'lucide-react';
import {
  faqAPI,
  FAQ,
  FaqTargetType,
} from '@/lib/api/faq';
import FaqFilters, { PublishedFilterState } from './FaqFilters';
import FaqTable from './FaqTable';
import FaqForm from './FaqForm';
import FaqDeleteDialog from './FaqDeleteDialog';
import Pagination from '@/components/shared/Pagination';

export default function FaqManagement() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);

  const [targetTypeFilter, setTargetTypeFilter] = useState<FaqTargetType | ''>('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [publishedFilter, setPublishedFilter] = useState<PublishedFilterState>('ALL');

  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);

  // Delete modal
  const [faqToDelete, setFaqToDelete] = useState<FAQ | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Inline toggle published loading state
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Alert message banner
  const [alertMsg, setAlertMsg] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  // Auto-dismiss alert messages after 5 seconds
  useEffect(() => {
    if (!alertMsg) return;
    const timer = setTimeout(() => {
      setAlertMsg(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [alertMsg]);

  // Fetch FAQs from API
  useEffect(() => {
    let active = true;

    async function loadFaqs() {
      try {
        const queryParams: {
          targetType?: FaqTargetType;
          category?: string;
          isPublished?: boolean;
        } = {};

        if (targetTypeFilter) {
          queryParams.targetType = targetTypeFilter;
        }

        if (categoryFilter.trim()) {
          queryParams.category = categoryFilter.trim();
        }

        if (publishedFilter === 'PUBLISHED') {
          queryParams.isPublished = true;
        } else if (publishedFilter === 'DRAFT') {
          queryParams.isPublished = false;
        }

        const res = await faqAPI.getAll(queryParams);
        if (active && res.success && Array.isArray(res.data)) {
          setFaqs(res.data);
        }
      } catch (err: unknown) {
        if (active) {
          console.error('Failed to fetch FAQs:', err);
          setAlertMsg({
            text: 'Failed to load FAQs from server. Please verify connection.',
            type: 'error',
          });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadFaqs();

    return () => {
      active = false;
    };
  }, [targetTypeFilter, categoryFilter, publishedFilter]);

  // Manual refresh button handler
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const queryParams: {
        targetType?: FaqTargetType;
        category?: string;
        isPublished?: boolean;
      } = {};

      if (targetTypeFilter) queryParams.targetType = targetTypeFilter;
      if (categoryFilter.trim()) queryParams.category = categoryFilter.trim();
      if (publishedFilter === 'PUBLISHED') queryParams.isPublished = true;
      else if (publishedFilter === 'DRAFT') queryParams.isPublished = false;

      const res = await faqAPI.getAll(queryParams);
      if (res.success && Array.isArray(res.data)) {
        setFaqs(res.data);
        setAlertMsg({ text: 'FAQs refreshed successfully.', type: 'success' });
      }
    } catch (err: unknown) {
      console.error('Failed to refresh FAQs:', err);
      setAlertMsg({ text: 'Failed to refresh FAQs.', type: 'error' });
    } finally {
      setRefreshing(false);
    }
  };

  // Filter setters that also reset current page
  const handleTargetTypeChange = (value: FaqTargetType | '') => {
    setTargetTypeFilter(value);
    setPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setPage(1);
  };

  const handlePublishedFilterChange = (value: PublishedFilterState) => {
    setPublishedFilter(value);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  // Collect distinct existing categories for suggestions and stats
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    faqs.forEach((f) => {
      if (f.category?.trim()) {
        set.add(f.category.trim());
      }
    });
    return Array.from(set).sort();
  }, [faqs]);

  // Client-side text search (question, answer, slug, category)
  const filteredFaqs = useMemo(() => {
    if (!deferredSearch.trim()) {
      return faqs;
    }
    const q = deferredSearch.toLowerCase().trim();
    return faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        (f.slug && f.slug.toLowerCase().includes(q)) ||
        (f.category && f.category.toLowerCase().includes(q))
    );
  }, [faqs, deferredSearch]);

  // Client-side Pagination calculation
  const totalCount = filteredFaqs.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  const paginatedFaqs = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredFaqs.slice(start, start + limit);
  }, [filteredFaqs, page, limit]);

  // Overall statistics (for metric cards)
  const stats = useMemo(() => {
    const total = faqs.length;
    const published = faqs.filter((f) => f.isPublished).length;
    const drafts = total - published;
    const categoriesCount = availableCategories.length;
    return { total, published, drafts, categoriesCount };
  }, [faqs, availableCategories]);

  // Toggle Published handler
  const handleTogglePublished = async (faq: FAQ) => {
    setTogglingId(faq.id);
    setAlertMsg(null);
    const nextStatus = !faq.isPublished;

    try {
      const res = await faqAPI.update(faq.id, { isPublished: nextStatus });
      if (res.success && res.data) {
        setFaqs((prev) =>
          prev.map((item) => (item.id === faq.id ? res.data : item))
        );
        setAlertMsg({
          text: `FAQ #${faq.id} ${
            nextStatus ? 'is now Live (Published)' : 'is now saved as Draft'
          }.`,
          type: 'success',
        });
      }
    } catch (err: unknown) {
      console.error('Failed to toggle published status:', err);
      setAlertMsg({
        text: 'Failed to update FAQ published status.',
        type: 'error',
      });
    } finally {
      setTogglingId(null);
    }
  };

  // Open Create Modal
  const handleAddNew = () => {
    setSelectedFaq(null);
    setIsFormOpen(true);
  };

  // Open Edit Modal
  const handleEdit = (faq: FAQ) => {
    setSelectedFaq(faq);
    setIsFormOpen(true);
  };

  // Open Delete Modal
  const handleDeleteClick = (faq: FAQ) => {
    setFaqToDelete(faq);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!faqToDelete) return;
    setIsDeleting(true);
    setAlertMsg(null);

    try {
      const res = await faqAPI.delete(faqToDelete.id);
      if (res.success) {
        setFaqs((prev) => prev.filter((item) => item.id !== faqToDelete.id));
        setAlertMsg({
          text: `FAQ #${faqToDelete.id} was deleted successfully.`,
          type: 'success',
        });
        setFaqToDelete(null);
      }
    } catch (err: unknown) {
      console.error('Failed to delete FAQ:', err);
      const apiErr = err as { response?: { data?: { message?: string } } };
      setAlertMsg({
        text: apiErr?.response?.data?.message || 'Failed to delete FAQ.',
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Form Success Callback
  const handleFormSuccess = (savedFaq: FAQ) => {
    if (selectedFaq) {
      // Edit
      setFaqs((prev) =>
        prev.map((item) => (item.id === savedFaq.id ? savedFaq : item))
      );
      setAlertMsg({
        text: `FAQ #${savedFaq.id} updated successfully.`,
        type: 'success',
      });
    } else {
      // Create
      setFaqs((prev) => [savedFaq, ...prev]);
      setAlertMsg({
        text: `New FAQ "${savedFaq.question.slice(0, 40)}..." created successfully.`,
        type: 'success',
      });
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setTargetTypeFilter('');
    setCategoryFilter('');
    setPublishedFilter('ALL');
    setPage(1);
  };

  return (
    <div className="animate-fade-in flex flex-1 h-full w-full flex-col gap-6 pb-2">
      {/* Top Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-foreground text-2xl sm:text-3xl font-black tracking-tight">
              FAQ Management
            </h1>
            <span className="rounded-full bg-[var(--color-brand-green)]/10 border border-[var(--color-brand-green)]/20 px-2.5 py-0.5 text-[10px] font-black tracking-wider text-[var(--color-brand-green)] uppercase">
              CMS Module
            </span>
          </div>
          <p className="text-muted mt-1 text-xs sm:text-sm font-semibold max-w-xl">
            Create, categorize, and publish frequently asked questions for tractors,
            financing, brands, and general platform guidance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 text-muted hover:text-foreground transition-all disabled:opacity-50 cursor-pointer"
            title="Refresh FAQs"
          >
            <RefreshCw
              size={16}
              className={refreshing ? 'animate-spin text-[var(--color-brand-green)]' : ''}
            />
          </button>

          <button
            type="button"
            onClick={handleAddNew}
            className="spatial-button flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm whitespace-nowrap shadow-lg cursor-pointer"
          >
            <Plus size={16} />
            <span>Add New FAQ</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-panel rounded-2xl p-4 border border-[var(--border-subtle)] shadow-sm">
          <div className="flex items-center justify-between text-muted text-xs font-bold">
            <span>Total FAQs</span>
            <HelpCircle size={15} className="text-foreground/40" />
          </div>
          <p className="mt-2 text-2xl font-black text-foreground">{stats.total}</p>
          <p className="mt-0.5 text-[10px] text-muted font-medium">All recorded entries</p>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-[var(--border-subtle)] shadow-sm">
          <div className="flex items-center justify-between text-muted text-xs font-bold">
            <span>Published</span>
            <Eye size={15} className="text-[var(--color-brand-green)]" />
          </div>
          <p className="mt-2 text-2xl font-black text-[var(--color-brand-green)]">
            {stats.published}
          </p>
          <p className="mt-0.5 text-[10px] text-muted font-medium">Live on platform</p>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-[var(--border-subtle)] shadow-sm">
          <div className="flex items-center justify-between text-muted text-xs font-bold">
            <span>Drafts</span>
            <EyeOff size={15} className="text-muted" />
          </div>
          <p className="mt-2 text-2xl font-black text-muted">
            {stats.drafts}
          </p>
          <p className="mt-0.5 text-[10px] text-muted font-medium">Unpublished / staging</p>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-[var(--border-subtle)] shadow-sm">
          <div className="flex items-center justify-between text-muted text-xs font-bold">
            <span>Categories</span>
            <FolderTree size={15} className="text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-blue-500">
            {stats.categoriesCount}
          </p>
          <p className="mt-0.5 text-[10px] text-muted font-medium">Distinct taxonomies</p>
        </div>
      </div>

      {/* Alert notification banner */}
      {alertMsg && (
        <div
          className={`flex items-center justify-between gap-3 rounded-2xl p-3.5 text-xs font-bold transition-all border animate-in fade-in duration-150 ${
            alertMsg.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-red-500/30 bg-red-500/10 text-red-300'
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
          <button
            onClick={() => setAlertMsg(null)}
            className="hover:opacity-75 transition-opacity"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <FaqFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        targetTypeFilter={targetTypeFilter}
        onTargetTypeChange={handleTargetTypeChange}
        categoryFilter={categoryFilter}
        onCategoryChange={handleCategoryChange}
        publishedFilter={publishedFilter}
        onPublishedFilterChange={handlePublishedFilterChange}
        onReset={handleResetFilters}
        availableCategories={availableCategories}
        totalResults={totalCount}
      />

      {/* FAQ Table */}
      <FaqTable
        faqs={paginatedFaqs}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onTogglePublished={handleTogglePublished}
        togglingId={togglingId}
        onAddNew={handleAddNew}
      />

      {/* Pagination */}
      {!loading && totalCount > 0 && (
        <Pagination
          page={page}
          limit={limit}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
          onLimitChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
        />
      )}

      {/* Create / Edit Modal Form */}
      <FaqForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        faq={selectedFaq}
        onSuccess={handleFormSuccess}
        availableCategories={availableCategories}
      />

      {/* Delete Confirmation Dialog */}
      <FaqDeleteDialog
        isOpen={Boolean(faqToDelete)}
        onClose={() => setFaqToDelete(null)}
        faq={faqToDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
