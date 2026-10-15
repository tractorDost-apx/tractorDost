'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Star, Pencil, Trash2 } from 'lucide-react';
import { reviewsAPI, type Review, type ReviewTargetType } from '@/lib/api/reviews';
import { getReviewErrorMessage, isNotFoundError } from '@/lib/utils/review-error';
import { ReviewFormModal } from './review-form-modal';

interface MyReviewActionProps {
  targetType: ReviewTargetType;
  targetId: number;
  targetName: string;
  /** Backend enforces the real eligibility rule; this only controls whether "Rate" is shown */
  canRate: boolean;
}

/**
 * Shows the logged-in user's review for one target, with Rate / Edit / Delete.
 * Uses GET /reviews/:targetType/:targetId/my-review, POST, PATCH /:reviewId and DELETE /:reviewId.
 */
export function MyReviewAction({ targetType, targetId, targetName, canRate }: MyReviewActionProps) {
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const fetchMine = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reviewsAPI.getMyReview(targetType, targetId);
      setReview(res.data);
    } catch (err) {
      if (isNotFoundError(err)) {
        setReview(null);
      } else {
        setError(getReviewErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }, [targetType, targetId]);

  useEffect(() => {
    fetchMine();
  }, [fetchMine]);

  const handleDelete = async () => {
    if (!review || !window.confirm('Delete your review?')) return;
    try {
      await reviewsAPI.deleteReview(review.id);
      setReview(null);
    } catch (err) {
      setError(getReviewErrorMessage(err));
    }
  };

  if (loading) {
    return <span className="text-muted text-xs">Checking your review...</span>;
  }

  return (
    <div className="space-y-2">
      {review ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400">
            <Star size={12} className="fill-amber-400" /> You rated {review.overallRating}
          </span>
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="glass-button inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold hover:text-lime-400"
          >
            <Pencil size={12} /> Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="glass-button inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold hover:text-red-400"
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      ) : (
        canRate && (
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="inline-flex items-center gap-1 rounded-full bg-lime-400 px-4 py-1.5 text-xs font-bold text-black"
          >
            <Star size={12} /> Rate
          </button>
        )
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}

      {formOpen && (
        <ReviewFormModal
          targetType={targetType}
          targetId={targetId}
          targetName={targetName}
          existing={review}
          onClose={() => setFormOpen(false)}
          onSaved={(saved) => {
            setReview(saved);
            setFormOpen(false);
          }}
        />
      )}
    </div>
  );
}
