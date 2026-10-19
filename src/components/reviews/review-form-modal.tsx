'use client';

import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import {
  reviewsAPI,
  type CreateReviewPayload,
  type Review,
  type ReviewTargetType,
} from '@/lib/api/reviews';
import { getReviewErrorMessage } from '@/lib/utils/review-error';

type SubscoreKey = Exclude<keyof CreateReviewPayload, 'overallRating' | 'headline' | 'body'>;

// Subscores accepted by the backend per target type (see review.validation.ts)
const SUBSCORES: Record<ReviewTargetType, { key: SubscoreKey; label: string }[]> = {
  DEALER: [
    { key: 'serviceQuality', label: 'Service quality' },
    { key: 'responseTime', label: 'Response time' },
    { key: 'afterSalesSupport', label: 'After-sales support' },
  ],
  SERVICE_CENTER: [
    { key: 'mechanicQuality', label: 'Mechanic quality' },
    { key: 'priceFairness', label: 'Price fairness' },
    { key: 'turnaroundTime', label: 'Turnaround time' },
  ],
  SHOWROOM: [],
};

interface ReviewFormModalProps {
  targetType: ReviewTargetType;
  targetId: number;
  targetName: string;
  /** When set, the modal edits this review instead of creating one */
  existing?: Review | null;
  onClose: () => void;
  onSaved: (review: Review) => void;
}

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} aria-label={`${n} stars`}>
          <Star
            size={22}
            className={n <= value ? 'fill-amber-400 text-amber-400' : 'text-muted'}
          />
        </button>
      ))}
    </div>
  );
}

export function ReviewFormModal({
  targetType,
  targetId,
  targetName,
  existing,
  onClose,
  onSaved,
}: ReviewFormModalProps) {
  const [overallRating, setOverallRating] = useState(existing?.overallRating ?? 0);
  const [headline, setHeadline] = useState(existing?.headline ?? '');
  const [body, setBody] = useState(existing?.body ?? '');
  const [subscores, setSubscores] = useState<Partial<Record<SubscoreKey, number>>>(() => {
    const initial: Partial<Record<SubscoreKey, number>> = {};
    for (const { key } of SUBSCORES[targetType]) {
      const v = existing?.[key];
      if (typeof v === 'number') initial[key] = v;
    }
    return initial;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (overallRating < 1) {
      setError('Please select an overall rating.');
      return;
    }

    const payload: CreateReviewPayload = {
      overallRating,
      headline: headline.trim() || undefined,
      body: body.trim() || undefined,
      ...subscores,
    };

    setSaving(true);
    setError(null);
    try {
      const res = existing
        ? await reviewsAPI.updateReview(existing.id, payload)
        : await reviewsAPI.createReview(targetType, targetId, payload);
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
      <form
        onSubmit={handleSubmit}
        className="relative max-h-[90vh] w-full max-w-lg space-y-5 overflow-y-auto rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#121814] sm:p-7"
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-4 dark:border-white/10">
          <div>
            <h2 className="text-lg font-black text-zinc-900 dark:text-white">
              {existing ? 'Edit your review' : 'Rate your experience'}
            </h2>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{targetName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-zinc-200 bg-zinc-100 p-2 text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-900 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-1.5">
          <span className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">Overall rating *</span>
          <StarPicker value={overallRating} onChange={setOverallRating} />
        </div>

        {SUBSCORES[targetType].map(({ key, label }) => (
          <div key={key} className="space-y-1.5">
            <span className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">{label}</span>
            <StarPicker
              value={subscores[key] ?? 0}
              onChange={(n) => setSubscores((prev) => ({ ...prev, [key]: n }))}
            />
          </div>
        ))}

        <label className="block space-y-1.5">
          <span className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">Headline</span>
          <input
            className={inputClass}
            maxLength={120}
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Summarise in a few words"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">Your review</span>
          <textarea
            className={inputClass}
            rows={4}
            maxLength={2000}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Tell others about your experience"
          />
        </label>

        {error && <p className="text-sm font-semibold text-red-500">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
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
            className="rounded-xl bg-[var(--color-brand-green)] px-6 py-2.5 text-xs font-black text-white shadow-md shadow-[var(--color-brand-green)]/30 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
          >
            {saving ? 'Saving...' : existing ? 'Save changes' : 'Submit review'}
          </button>
        </div>
      </form>
    </div>
  );
}
