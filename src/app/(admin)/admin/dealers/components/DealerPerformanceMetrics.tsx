'use client';

import React from 'react';
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ThumbsUp,
  Activity,
  Award,
  Sparkles,
} from 'lucide-react';
import { DealerProfileSummary } from '@/types/models/dealer';

interface DealerPerformanceMetricsProps {
  profile: DealerProfileSummary | null;
  loading?: boolean;
}

export function DealerPerformanceMetrics({ profile, loading }: DealerPerformanceMetricsProps) {
  if (loading) {
    return (
      <div className="glass-panel space-y-4 rounded-2xl p-5 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-4 w-48 rounded-lg bg-foreground/10" />
          <div className="h-6 w-28 rounded-full bg-foreground/10" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-foreground/5" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="h-40 rounded-xl bg-foreground/5" />
          <div className="h-40 rounded-xl bg-foreground/5" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="glass-panel space-y-3 rounded-2xl p-5 text-center">
        <div className="flex items-center justify-center gap-2 text-xs font-black tracking-wider text-lime-400 uppercase">
          <Activity size={16} /> Performance & Resolution Metrics
        </div>
        <p className="text-xs text-muted font-medium">
          Performance metrics are currently being compiled for this dealership.
        </p>
      </div>
    );
  }

  const { overallRating, reviewsCount, ratingBreakdown, positivePercentage = 100, subscores, grievanceStats } = profile;
  const { totalGrievances, resolved, pending, escalated, resolutionRate, healthStatus = 'PERFECT', avgResolutionDays } = grievanceStats;

  // Rating Stars breakdown calculations
  const totalBreakdown =
    (ratingBreakdown?.oneStar || 0) +
    (ratingBreakdown?.twoStar || 0) +
    (ratingBreakdown?.threeStar || 0) +
    (ratingBreakdown?.fourStar || 0) +
    (ratingBreakdown?.fiveStar || 0);

  const starPercentages = {
    five: totalBreakdown > 0 ? Math.round(((ratingBreakdown?.fiveStar || 0) / totalBreakdown) * 100) : 0,
    four: totalBreakdown > 0 ? Math.round(((ratingBreakdown?.fourStar || 0) / totalBreakdown) * 100) : 0,
    three: totalBreakdown > 0 ? Math.round(((ratingBreakdown?.threeStar || 0) / totalBreakdown) * 100) : 0,
    two: totalBreakdown > 0 ? Math.round(((ratingBreakdown?.twoStar || 0) / totalBreakdown) * 100) : 0,
    one: totalBreakdown > 0 ? Math.round(((ratingBreakdown?.oneStar || 0) / totalBreakdown) * 100) : 0,
  };

  // Status Badge configs
  const healthBadgeConfig = {
    PERFECT: {
      label: 'Spotless Record',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      icon: <ShieldCheck size={13} className="shrink-0" />,
    },
    EXCELLENT: {
      label: 'High Performance',
      color: 'text-lime-400 bg-lime-500/10 border-lime-500/20',
      icon: <CheckCircle2 size={13} className="shrink-0" />,
    },
    GOOD: {
      label: 'Standard SLA',
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      icon: <Clock size={13} className="shrink-0" />,
    },
    NEEDS_ATTENTION: {
      label: 'Attention Required',
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      icon: <AlertTriangle size={13} className="shrink-0" />,
    },
  }[healthStatus];

  return (
    <div className="glass-panel space-y-5 rounded-2xl p-5 border border-[var(--border-subtle)] bg-[var(--card-bg)] shadow-sm">
      {/* 1. Header with Title & Health Badge */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border-subtle)] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl border border-lime-400/20 bg-lime-400/10 p-2 text-lime-400">
            <Activity size={18} />
          </div>
          <div>
            <h4 className="text-sm font-black tracking-wider text-lime-400 uppercase">
              Performance & Resolution Metrics
            </h4>
            <p className="text-[11px] text-muted font-medium">
              Customer satisfaction, rating breakdown, and grievance resolution SLA
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${healthBadgeConfig.color}`}
          >
            {healthBadgeConfig.icon}
            {healthBadgeConfig.label}
          </span>
        </div>
      </div>

      {/* 2. Top KPI Strip (6 Quick Metrics) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
        {/* Rating */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-3 text-center transition-all hover:border-amber-400/30">
          <div className="flex items-center justify-center gap-1 text-foreground text-xl font-black">
            <Star size={16} className="fill-amber-400 text-amber-400 shrink-0" />
            <span>{overallRating > 0 ? overallRating.toFixed(1) : '0.0'}</span>
          </div>
          <div className="text-muted mt-1 text-[10px] font-bold uppercase tracking-wider">
            Overall Rating
          </div>
          <div className="text-muted/80 text-[10px] font-medium mt-0.5">
            {reviewsCount} {reviewsCount === 1 ? 'review' : 'reviews'}
          </div>
        </div>

        {/* CSAT */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-3 text-center transition-all hover:border-lime-400/30">
          <div className="flex items-center justify-center gap-1 text-lime-400 text-xl font-black">
            <ThumbsUp size={15} className="shrink-0" />
            <span>{positivePercentage}%</span>
          </div>
          <div className="text-muted mt-1 text-[10px] font-bold uppercase tracking-wider">
            CSAT Score
          </div>
          <div className="text-muted/80 text-[10px] font-medium mt-0.5">
            Positive sentiment
          </div>
        </div>

        {/* Resolution Rate */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-3 text-center transition-all hover:border-emerald-400/30">
          <div className="text-emerald-400 text-xl font-black">
            {resolutionRate}
          </div>
          <div className="text-muted mt-1 text-[10px] font-bold uppercase tracking-wider">
            Resolution Rate
          </div>
          <div className="text-muted/80 text-[10px] font-medium mt-0.5">
            {totalGrievances === 0 ? 'Zero complaints' : `${resolved}/${totalGrievances} resolved`}
          </div>
        </div>

        {/* Total Grievances */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-3 text-center transition-all">
          <div className="text-foreground text-xl font-black">
            {totalGrievances}
          </div>
          <div className="text-muted mt-1 text-[10px] font-bold uppercase tracking-wider">
            Total Complaints
          </div>
          <div className="text-muted/80 text-[10px] font-medium mt-0.5">
            Lifetime logged
          </div>
        </div>

        {/* Pending */}
        <div
          className={`rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-3 text-center transition-all ${
            pending > 0 ? 'border-amber-400/40 bg-amber-400/5' : ''
          }`}
        >
          <div className={`text-xl font-black ${pending > 0 ? 'text-amber-400' : 'text-foreground'}`}>
            {pending}
          </div>
          <div className="text-muted mt-1 text-[10px] font-bold uppercase tracking-wider">
            Pending Cases
          </div>
          <div className="text-muted/80 text-[10px] font-medium mt-0.5">
            {pending > 0 ? 'Under review' : 'No active cases'}
          </div>
        </div>

        {/* Escalated */}
        <div
          className={`rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-3 text-center transition-all ${
            escalated > 0 ? 'border-rose-400/40 bg-rose-400/5' : ''
          }`}
        >
          <div className={`text-xl font-black ${escalated > 0 ? 'text-rose-400' : 'text-foreground'}`}>
            {escalated}
          </div>
          <div className="text-muted mt-1 text-[10px] font-bold uppercase tracking-wider">
            Escalations
          </div>
          <div className="text-muted/80 text-[10px] font-medium mt-0.5">
            {escalated > 0 ? 'Action required' : 'Clean record'}
          </div>
        </div>
      </div>

      {/* 3. Deep Dive Grid: Left = Rating Breakdown; Right = Grievance Resolution Pipeline */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Left: Star Rating Distribution & Operational Scores */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-foreground/90 flex items-center gap-1.5">
              <Star size={14} className="text-amber-400 fill-amber-400" /> Star Rating Distribution
            </span>
            <span className="text-[10px] font-bold text-muted uppercase">
              {reviewsCount} Total Reviews
            </span>
          </div>

          {reviewsCount > 0 ? (
            <div className="space-y-2 text-xs">
              {[
                { stars: 5, count: ratingBreakdown?.fiveStar || 0, pct: starPercentages.five },
                { stars: 4, count: ratingBreakdown?.fourStar || 0, pct: starPercentages.four },
                { stars: 3, count: ratingBreakdown?.threeStar || 0, pct: starPercentages.three },
                { stars: 2, count: ratingBreakdown?.twoStar || 0, pct: starPercentages.two },
                { stars: 1, count: ratingBreakdown?.oneStar || 0, pct: starPercentages.one },
              ].map((row) => (
                <div key={row.stars} className="flex items-center gap-2">
                  <span className="w-7 text-[11px] font-bold text-muted shrink-0 text-right">
                    {row.stars} ★
                  </span>
                  <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-foreground/10">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all duration-300"
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                  <span className="w-12 text-[10px] font-bold text-muted text-right shrink-0">
                    {row.count} ({row.pct}%)
                  </span>
                </div>
              ))}

              {/* Subscores if available */}
              {subscores && (subscores.serviceQuality || subscores.responseTime) && (
                <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] grid grid-cols-2 gap-2 text-[11px]">
                  {subscores.serviceQuality != null && (
                    <div className="flex items-center justify-between text-muted">
                      <span>Service Quality:</span>
                      <span className="font-bold text-foreground">{subscores.serviceQuality} / 5</span>
                    </div>
                  )}
                  {subscores.responseTime != null && (
                    <div className="flex items-center justify-between text-muted">
                      <span>Response Speed:</span>
                      <span className="font-bold text-foreground">{subscores.responseTime} / 5</span>
                    </div>
                  )}
                  {subscores.afterSalesSupport != null && (
                    <div className="flex items-center justify-between text-muted">
                      <span>After-Sales:</span>
                      <span className="font-bold text-foreground">{subscores.afterSalesSupport} / 5</span>
                    </div>
                  )}
                  {subscores.priceFairness != null && (
                    <div className="flex items-center justify-between text-muted">
                      <span>Pricing Fairness:</span>
                      <span className="font-bold text-foreground">{subscores.priceFairness} / 5</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[var(--border-subtle)] p-4 text-center">
              <Sparkles size={20} className="mx-auto text-muted/60 mb-1" />
              <p className="text-xs font-bold text-foreground/80">No customer reviews yet</p>
              <p className="text-[11px] text-muted mt-0.5">
                Rating distribution will update as farmers and buyers review this dealership.
              </p>
            </div>
          )}
        </div>

        {/* Right: Grievance Resolution & SLA Pipeline */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-foreground/90 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" /> Resolution & SLA Pipeline
            </span>
            <span className="text-[10px] font-bold text-muted uppercase">
              {resolutionRate} Efficiency
            </span>
          </div>

          {/* Resolution Multi-bar */}
          <div className="space-y-1.5">
            <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/10 flex">
              {totalGrievances > 0 ? (
                <>
                  <div
                    className="bg-emerald-400 h-full transition-all duration-300"
                    style={{ width: `${(resolved / totalGrievances) * 100}%` }}
                    title={`Resolved: ${resolved}`}
                  />
                  <div
                    className="bg-amber-400 h-full transition-all duration-300"
                    style={{ width: `${(pending / totalGrievances) * 100}%` }}
                    title={`Pending: ${pending}`}
                  />
                  <div
                    className="bg-rose-500 h-full transition-all duration-300"
                    style={{ width: `${(escalated / totalGrievances) * 100}%` }}
                    title={`Escalated: ${escalated}`}
                  />
                </>
              ) : (
                <div className="bg-emerald-400 h-full w-full" title="Spotless Record: 100%" />
              )}
            </div>

            <div className="flex items-center justify-between text-[10px] text-muted font-bold">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                Resolved: {resolved}
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
                Pending: {pending}
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-rose-500" />
                Escalated: {escalated}
              </span>
            </div>
          </div>

          {/* SLA Turnaround & Compliance Note */}
          <div className="rounded-xl bg-foreground/5 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-muted flex items-center gap-1">
                <Clock size={12} className="text-muted" /> Avg. Turnaround Time:
              </span>
              <span className="text-foreground font-black">
                {avgResolutionDays != null ? `${avgResolutionDays} days` : 'Prompt (< 24 hrs)'}
              </span>
            </div>

            <p className="text-[11px] text-muted leading-relaxed font-medium">
              {totalGrievances === 0
                ? 'Spotless compliance record: Zero farmer grievances or disputes logged against this dealership since joining the TractorDost network.'
                : pending === 0 && escalated === 0
                ? 'All logged grievances have been successfully resolved and closed under partner SLA terms.'
                : 'Pending complaints are undergoing active mediation by the TractorDost partner support desk.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
