'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Star, Trash2, Eye, EyeOff, Pencil, X } from 'lucide-react';
import Pagination from '@/components/shared/Pagination';
import {
  reviewsAPI,
  type Review,
  type ReviewMeta,
  type AdminUpdateReviewPayload,
} from '@/lib/api/reviews';
import { getReviewErrorMessage } from '@/lib/utils/review-error';

type StatusFilter = 'all' | 'published' | 'hidden';

const FILTER_TO_APPROVED: Record<StatusFilter, boolean | undefined> = {
  all: undefined,
  published: true,
  hidden: false,
};

export default function ReviewsAdminPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [meta, setMeta] = useState<ReviewMeta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Review | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reviewsAPI.adminListReviews({
        page: meta.page,
        limit: meta.limit,
        approved: FILTER_TO_APPROVED[filter],
      });
      setReviews(res.data);
      setMeta(res.meta);
    } catch (err) {
      setError(getReviewErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filter, meta.page, meta.limit]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleToggleVisibility = async (review: Review) => {
    try {
      const res = await reviewsAPI.adminSetApproval(review.id, !review.isApproved);
      setReviews((prev) => prev.map((r) => (r.id === review.id ? res.data : r)));
    } catch (err) {
      setError(getReviewErrorMessage(err));
    }
  };

  const handleDelete = async (review: Review) => {
    if (!window.confirm(`Delete review #${review.id}? This cannot be undone.`)) return;
    try {
      await reviewsAPI.adminDeleteReview(review.id);
      fetchReviews();
    } catch (err) {
      setError(getReviewErrorMessage(err));
    }
  };

  const handleSaved = (updated: Review) => {
    setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setEditing(null);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-foreground text-2xl font-black">Reviews Management</h1>
          <p className="text-muted text-sm">
            Reviews are published by default. You can hide, edit or delete any review at any time.
          </p>
        </div>
        <div className="flex gap-2">
          {(['all', 'published', 'hidden'] as StatusFilter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                setFilter(f);
                setMeta((m) => ({ ...m, page: 1 }));
              }}
              className={`glass-button px-4 py-2 text-xs font-bold capitalize ${
                filter === f ? 'text-lime-400' : 'text-foreground/80'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="glass-inner rounded-2xl border border-red-500/30 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="glass-panel overflow-x-auto rounded-3xl p-2">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-muted text-xs uppercase">
            <tr>
              <th className="px-4 py-3">Target</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Review</th>
              <th className="px-4 py-3">By</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="text-muted px-4 py-10 text-center">
                  Loading reviews...
                </td>
              </tr>
            )}
            {!loading && reviews.length === 0 && (
              <tr>
                <td colSpan={6} className="text-muted px-4 py-10 text-center">
                  No reviews found.
                </td>
              </tr>
            )}
            {!loading &&
              reviews.map((review) => (
                <tr key={review.id} className="border-foreground/5 border-t">
                  <td className="text-foreground px-4 py-3 font-bold">
                    {review.targetType.replace('_', ' ')} #{review.targetId}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 font-bold text-amber-400">
                      <Star size={14} className="fill-amber-400" /> {review.overallRating}
                    </span>
                  </td>
                  <td className="max-w-xs px-4 py-3">
                    <p className="text-foreground truncate font-bold">{review.headline || '—'}</p>
                    <p className="text-muted truncate text-xs">{review.body || ''}</p>
                  </td>
                  <td className="text-muted px-4 py-3">{review.user?.fullName ?? `User #${review.userId}`}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        review.isApproved
                          ? 'bg-lime-400/10 text-lime-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {review.isApproved ? 'Published' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        title={review.isApproved ? 'Hide' : 'Publish'}
                        onClick={() => handleToggleVisibility(review)}
                        className="glass-button p-2 hover:text-lime-400"
                      >
                        {review.isApproved ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button
                        type="button"
                        title="Edit"
                        onClick={() => setEditing(review)}
                        className="glass-button p-2 hover:text-lime-400"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        title="Delete"
                        onClick={() => handleDelete(review)}
                        className="glass-button p-2 hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={meta.page}
        limit={meta.limit}
        totalCount={meta.total}
        totalPages={meta.totalPages}
        onPageChange={(p) => setMeta((m) => ({ ...m, page: p }))}
        onLimitChange={(l) => setMeta((m) => ({ ...m, limit: l, page: 1 }))}
      />

      {editing && (
        <EditReviewModal review={editing} onClose={() => setEditing(null)} onSaved={handleSaved} />
      )}
    </div>
  );
}

interface EditReviewModalProps {
  review: Review;
  onClose: () => void;
  onSaved: (review: Review) => void;
}

function EditReviewModal({ review, onClose, onSaved }: EditReviewModalProps) {
  const [overallRating, setOverallRating] = useState(review.overallRating);
  const [headline, setHeadline] = useState(review.headline ?? '');
  const [body, setBody] = useState(review.body ?? '');
  const [isApproved, setIsApproved] = useState(review.isApproved);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: AdminUpdateReviewPayload = {};
    if (overallRating !== review.overallRating) payload.overallRating = overallRating;
    if (headline !== (review.headline ?? '')) payload.headline = headline;
    if (body !== (review.body ?? '')) payload.body = body;
    if (isApproved !== review.isApproved) payload.isApproved = isApproved;

    if (Object.keys(payload).length === 0) {
      onClose();
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await reviewsAPI.adminUpdateReview(review.id, payload);
      onSaved(res.data);
    } catch (err) {
      setError(getReviewErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 transition-all focus:border-[var(--color-brand-green)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-lime-400 dark:focus:bg-white/10 dark:focus:ring-lime-400/20';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200 dark:bg-black/75">
      <form onSubmit={handleSubmit} className="relative w-full max-w-lg space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#121814]">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-white/10">
          <h2 className="text-lg font-black text-zinc-900 dark:text-white">Edit review #{review.id}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-zinc-200 bg-zinc-100 p-2 text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-900 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X size={14} />
          </button>
        </div>

        <label className="block space-y-1">
          <span className="text-zinc-700 dark:text-zinc-300 text-xs font-bold">Rating</span>
          <select
            className={inputClass}
            value={overallRating}
            onChange={(e) => setOverallRating(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} star{n > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1">
          <span className="text-zinc-700 dark:text-zinc-300 text-xs font-bold">Headline</span>
          <input
            className={inputClass}
            maxLength={120}
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
          />
        </label>

        <label className="block space-y-1">
          <span className="text-zinc-700 dark:text-zinc-300 text-xs font-bold">Body</span>
          <textarea
            className={inputClass}
            rows={4}
            maxLength={2000}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </label>

        <label className="flex items-center gap-2 text-sm font-bold text-zinc-800 dark:text-zinc-200">
          <input
            type="checkbox"
            checked={isApproved}
            onChange={(e) => setIsApproved(e.target.checked)}
            className="h-4 w-4 rounded accent-[var(--color-brand-green)]"
          />
          Published (visible to public)
        </label>

        {error && <p className="text-sm font-semibold text-red-500">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-200 bg-zinc-100 px-5 py-2.5 text-xs font-bold text-zinc-700 transition-colors hover:bg-zinc-200 hover:text-zinc-900 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[var(--color-brand-green)] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[var(--color-brand-green)]/30 hover:brightness-110 active:scale-95 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
