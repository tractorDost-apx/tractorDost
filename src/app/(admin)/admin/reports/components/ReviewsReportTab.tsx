'use client';

import React, { useState, useMemo } from 'react';
import { Review } from '@/lib/api/reviews';
import {
  Search,
  Download,
  Star,
  CheckCircle2,
  Clock,
  ThumbsUp,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { exportDataToCSV } from '../utils/reportExportUtils';

interface ReviewsReportTabProps {
  reviews: Review[];
  loading?: boolean;
}

export const ReviewsReportTab: React.FC<ReviewsReportTabProps> = ({ reviews, loading }) => {
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('ALL');
  const [approvalFilter, setApprovalFilter] = useState<string>('ALL');

  // Compute rating and moderation statistics
  const stats = useMemo(() => {
    let totalScore = 0;
    let approvedCount = 0;
    let pendingCount = 0;
    let verifiedCount = 0;
    const starCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    reviews.forEach((r) => {
      const rating = Math.round(r.overallRating) || 5;
      totalScore += r.overallRating;

      if (starCounts[rating] !== undefined) {
        starCounts[rating]++;
      }

      if (r.isApproved) approvedCount++;
      else pendingCount++;

      if (r.isVerified) verifiedCount++;
    });

    const avg = reviews.length > 0 ? (totalScore / reviews.length).toFixed(1) : '4.8';

    return {
      avgRating: avg,
      approvedCount,
      pendingCount,
      verifiedCount,
      starCounts,
    };
  }, [reviews]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchesSearch =
        search === '' ||
        r.headline?.toLowerCase().includes(search.toLowerCase()) ||
        r.body?.toLowerCase().includes(search.toLowerCase()) ||
        r.user?.fullName?.toLowerCase().includes(search.toLowerCase());

      const ratingMatch =
        ratingFilter === 'ALL' || Math.round(r.overallRating) === Number(ratingFilter);

      const approvalMatch =
        approvalFilter === 'ALL' ||
        (approvalFilter === 'APPROVED' && r.isApproved) ||
        (approvalFilter === 'PENDING' && !r.isApproved);

      return matchesSearch && ratingMatch && approvalMatch;
    });
  }, [reviews, search, ratingFilter, approvalFilter]);

  const handleExportCSV = () => {
    const rows = filteredReviews.map((r) => ({
      ID: r.id,
      Reviewer: r.user?.fullName || 'Anonymous',
      TargetType: r.targetType,
      TargetID: r.targetId,
      OverallRating: r.overallRating,
      Headline: r.headline || '-',
      Body: r.body || '-',
      IsApproved: r.isApproved ? 'Approved' : 'Pending',
      IsVerified: r.isVerified ? 'Verified' : 'Unverified',
      HelpfulCount: r.helpfulCount ?? 0,
      CreatedAt: new Date(r.createdAt).toLocaleDateString('en-IN'),
    }));
    exportDataToCSV(rows, 'Customer_Reviews_Report');
  };

  return (
    <div className="space-y-6">
      {/* 1. Rating Barometer & Star Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Rating Score Card */}
        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm text-center flex flex-col justify-center items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Overall Satisfaction Score
          </span>
          <div className="mt-3 text-5xl font-black text-neutral-900 dark:text-white">
            {stats.avgRating}
            <span className="text-xl text-neutral-400 font-medium"> / 5.0</span>
          </div>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-yellow-500">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.round(Number(stats.avgRating))
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-neutral-300 dark:text-neutral-700'
                }`}
              />
            ))}
          </div>
          <span className="mt-3 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
            Based on <strong className="text-neutral-900 dark:text-white font-bold">{reviews.length}</strong> authenticated reviews
          </span>
        </div>

        {/* Star Rating Breakdown */}
        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
          <div className="mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">Rating Distribution</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Customer sentiment breakdown
            </p>
          </div>

          <div className="space-y-2.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.starCounts[star] || 0;
              const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <div className="flex w-12 items-center gap-1 text-yellow-500 font-bold">
                    <span>{star}</span>
                    <Star className="h-3.5 w-3.5 fill-yellow-400" />
                  </div>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="w-12 text-right font-mono font-bold text-neutral-700 dark:text-neutral-300">
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Moderation & Trust Status */}
        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
          <div className="mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Moderation & Trust Status
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Review verification and status
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-500/5 p-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  Published / Approved
                </span>
              </div>
              <span className="text-base font-black text-neutral-900 dark:text-white">
                {stats.approvedCount}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50/60 dark:bg-amber-500/5 p-3">
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  Awaiting Moderation
                </span>
              </div>
              <span className="text-base font-black text-neutral-900 dark:text-white">
                {stats.pendingCount}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-cyan-200 dark:border-cyan-500/20 bg-cyan-50/60 dark:bg-cyan-500/5 p-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                <span className="text-xs font-bold text-cyan-800 dark:text-cyan-300">
                  Verified Experiences
                </span>
              </div>
              <span className="text-base font-black text-neutral-900 dark:text-white">
                {stats.verifiedCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Feedback Table */}
      <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              Customer Feedback Stream
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              Showing {filteredReviews.length} of {reviews.length} submitted reviews
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search headline, text, reviewer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 py-2 pl-9 pr-3 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-yellow-500 focus:bg-white dark:focus:bg-neutral-800 focus:outline-none shadow-2xs font-medium"
              />
            </div>

            {/* Rating Filter */}
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200 focus:border-yellow-500 focus:bg-white dark:focus:bg-neutral-800 focus:outline-none shadow-2xs"
            >
              <option value="ALL">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            {/* Approval Filter */}
            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200 focus:border-yellow-500 focus:bg-white dark:focus:bg-neutral-800 focus:outline-none shadow-2xs"
            >
              <option value="ALL">All Moderation</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
            </select>

            {/* Export CSV button */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-2 text-xs font-bold text-neutral-700 dark:text-neutral-200 shadow-2xs transition-all hover:border-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-400 hover:bg-neutral-50 dark:hover:bg-neutral-700"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-neutral-100 dark:border-neutral-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
              <tr>
                <th className="py-3 pl-3">ID</th>
                <th className="py-3">Rating</th>
                <th className="py-3">Review Headline & Feedback</th>
                <th className="py-3">Target Entity</th>
                <th className="py-3">Reviewer</th>
                <th className="py-3">Status</th>
                <th className="py-3">Helpful</th>
                <th className="py-3 pr-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300">
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-500">
                    <p className="font-semibold">No customer reviews matching your search criteria</p>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Try clearing search or filter selections
                    </p>
                  </td>
                </tr>
              ) : (
                filteredReviews.slice(0, 50).map((r) => (
                  <tr
                    key={r.id}
                    className="group transition-colors hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40"
                  >
                    <td className="py-3 pl-3 font-mono text-[11px] font-bold text-neutral-500">
                      #{r.id}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1 text-yellow-500 font-black">
                        <Star className="h-3.5 w-3.5 fill-yellow-400" />
                        <span>{r.overallRating}</span>
                      </div>
                    </td>
                    <td className="py-3 max-w-xs">
                      <div className="font-bold text-neutral-900 dark:text-white truncate">
                        {r.headline || 'Review'}
                      </div>
                      <div className="text-[11px] text-neutral-600 dark:text-neutral-400 truncate">
                        {r.body || '-'}
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="rounded-md bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-[10px] font-bold text-neutral-700 dark:text-neutral-300">
                        {r.targetType} #{r.targetId}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-neutral-900 dark:text-white">
                      {r.user?.fullName || 'Customer'}
                    </td>
                    <td className="py-3">
                      {r.isApproved ? (
                        <span className="inline-flex items-center rounded-full border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-neutral-600 dark:text-neutral-400 font-medium">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3 text-neutral-400" />
                        <span>{r.helpfulCount ?? 0}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-3 text-neutral-500 dark:text-neutral-400 font-medium">
                      {new Date(r.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
