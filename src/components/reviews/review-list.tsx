'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Star, ThumbsUp } from 'lucide-react';
import Pagination from '@/components/shared/Pagination';
import {
  reviewsAPI,
  type Review,
  type ReviewMeta,
  type ReviewTargetType,
} from '@/lib/api/reviews';
import { getReviewErrorMessage } from '@/lib/utils/review-error';

interface ReviewListProps {
  targetType: ReviewTargetType;
  targetId: number;
  /** Logged-in user's id; their own reviews cannot be marked helpful */
  currentUserId?: number;
  emptyText?: string;
}

const LIMIT = 5;

export function ReviewList({
  targetType,
  targetId,
  currentUserId,
  emptyText = 'No reviews yet.',
}: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [meta, setMeta] = useState<ReviewMeta>({ total: 0, page: 1, limit: LIMIT, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [helpfulDone, setHelpfulDone] = useState<Set<number>>(new Set());

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reviewsAPI.getReviews(targetType, targetId, { page, limit: LIMIT });
      setReviews(res.data);
      setMeta(res.meta);
    } catch (err) {
      setError(getReviewErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [targetType, targetId, page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleHelpful = async (review: Review) => {
    try {
      const res = await reviewsAPI.markHelpful(review.id);
      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, helpfulCount: res.data.helpfulCount } : r))
      );
      setHelpfulDone((prev) => new Set(prev).add(review.id));
    } catch (err) {
      setError(getReviewErrorMessage(err));
    }
  };

  if (loading && reviews.length === 0) {
    return <p className="text-muted py-6 text-center text-sm">Loading reviews...</p>;
  }

  if (error) {
    return <p className="py-6 text-center text-sm text-red-400">{error}</p>;
  }

  if (reviews.length === 0) {
    return <p className="text-muted py-6 text-center text-sm">{emptyText}</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const isOwn = currentUserId !== undefined && review.userId === currentUserId;
        const alreadyMarked = helpfulDone.has(review.id);
        return (
          <div key={review.id} className="glass-inner space-y-2 rounded-2xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    size={14}
                    className={n <= review.overallRating ? 'fill-amber-400' : 'text-muted'}
                  />
                ))}
              </div>
              <span className="text-muted text-xs">
                {review.user?.fullName ?? 'Customer'} ·{' '}
                {new Date(review.createdAt).toLocaleDateString('en-IN')}
                {review.isVerified && <span className="ml-2 text-lime-400">Verified</span>}
              </span>
            </div>

            {review.headline && (
              <p className="text-foreground text-sm font-bold">{review.headline}</p>
            )}
            {review.body && <p className="text-foreground/80 text-sm">{review.body}</p>}

            <div className="flex justify-end">
              <button
                type="button"
                disabled={isOwn || alreadyMarked}
                onClick={() => handleHelpful(review)}
                className="text-muted glass-button inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold hover:text-lime-400 disabled:opacity-50"
                title={isOwn ? 'You cannot mark your own review' : 'Mark as helpful'}
              >
                <ThumbsUp size={12} /> Helpful ({review.helpfulCount})
              </button>
            </div>
          </div>
        );
      })}

      {meta.totalPages > 1 && (
        <Pagination
          page={meta.page}
          limit={meta.limit}
          totalCount={meta.total}
          totalPages={meta.totalPages}
          onPageChange={setPage}
          onLimitChange={() => {}}
        />
      )}
    </div>
  );
}
