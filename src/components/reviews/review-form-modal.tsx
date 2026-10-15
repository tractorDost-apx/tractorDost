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
    'bg-secondary/20 border border-border/50 rounded-xl px-4 py-3 text-foreground w-full focus:outline-none focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/50 transition-all';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <form
        onSubmit={handleSubmit}
        className="glass-panel max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-3xl p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-foreground text-lg font-black">
              {existing ? 'Edit your review' : 'Rate your experience'}
            </h2>
            <p className="text-muted text-sm">{targetName}</p>
          </div>
          <button type="button" onClick={onClose} className="glass-button p-2" aria-label="Close">
            <X size={14} />
          </button>
        </div>

        <div className="space-y-1">
          <span className="text-muted text-xs font-bold">Overall rating *</span>
          <StarPicker value={overallRating} onChange={setOverallRating} />
        </div>

        {SUBSCORES[targetType].map(({ key, label }) => (
          <div key={key} className="space-y-1">
            <span className="text-muted text-xs font-bold">{label}</span>
            <StarPicker
              value={subscores[key] ?? 0}
              onChange={(n) => setSubscores((prev) => ({ ...prev, [key]: n }))}
            />
          </div>
        ))}

        <label className="block space-y-1">
          <span className="text-muted text-xs font-bold">Headline</span>
          <input
            className={inputClass}
            maxLength={120}
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Summarise in a few words"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-muted text-xs font-bold">Your review</span>
          <textarea
            className={inputClass}
            rows={4}
            maxLength={2000}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Tell others about your experience"
          />
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="glass-button px-5 py-2 text-sm">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-lime-400 px-5 py-2 text-sm font-bold text-black disabled:opacity-50"
          >
            {saving ? 'Saving...' : existing ? 'Save changes' : 'Submit review'}
          </button>
        </div>
      </form>
    </div>
  );
}
