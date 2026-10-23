'use client';

import React from 'react';
import {
  TrendingUp,
  Store,
  Tractor,
  Users,
  Star,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Award,
} from 'lucide-react';

interface ReportKPIsProps {
  kpis: {
    totalLeads: number;
    conversionRate: number;
    todayLeads: number;
    totalDealers: number;
    verifiedDealers: number;
    totalListings: number;
    activeListings: number;
    totalUsers: number;
    verifiedUsers: number;
    avgRating: number;
    totalReviews: number;
  };
  loading?: boolean;
}

export const ReportKPIs: React.FC<ReportKPIsProps> = ({ kpis, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-xs"
          >
            <div className="mb-3 h-4 w-24 rounded bg-neutral-100 dark:bg-neutral-800" />
            <div className="mb-2 h-8 w-32 rounded bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-3 w-40 rounded bg-neutral-100 dark:bg-neutral-800" />
          </div>
        ))}
      </div>
    );
  }

  const dealerVerifiedPct =
    kpis.totalDealers > 0 ? Math.round((kpis.verifiedDealers / kpis.totalDealers) * 100) : 0;
  const userVerifiedPct =
    kpis.totalUsers > 0 ? Math.round((kpis.verifiedUsers / kpis.totalUsers) * 100) : 0;
  const activeListingPct =
    kpis.totalListings > 0 ? Math.round((kpis.activeListings / kpis.totalListings) * 100) : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {/* 1. Leads Pipeline KPI */}
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm hover:shadow-md hover:border-lime-500/40 transition-all duration-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            CRM Leads & Pipeline
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime-500/10 text-lime-600 dark:text-lime-400">
            <TrendingUp className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
            {kpis.totalLeads.toLocaleString()}
          </span>
          <span className="inline-flex items-center rounded-full bg-lime-500/10 px-2 py-0.5 text-xs font-bold text-lime-700 dark:text-lime-400">
            <ArrowUpRight className="mr-0.5 h-3 w-3" />
            {kpis.conversionRate}% conv.
          </span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
          <Clock className="h-3.5 w-3.5 text-neutral-400" />
          <span>
            <strong className="text-neutral-900 dark:text-neutral-200 font-bold">{kpis.todayLeads}</strong> new today
          </span>
        </div>
      </div>

      {/* 2. Dealership Network KPI */}
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm hover:shadow-md hover:border-blue-500/40 transition-all duration-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Dealership Network
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Store className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
            {kpis.totalDealers.toLocaleString()}
          </span>
          <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-400">
            {dealerVerifiedPct}% verified
          </span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
          <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
          <span>
            <strong className="text-neutral-900 dark:text-neutral-200 font-bold">{kpis.verifiedDealers}</strong> active partners
          </span>
        </div>
      </div>

      {/* 3. Marketplace Inventory KPI */}
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm hover:shadow-md hover:border-amber-500/40 transition-all duration-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Used Marketplace
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Tractor className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
            {kpis.totalListings.toLocaleString()}
          </span>
          <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400">
            {activeListingPct}% active
          </span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          <span>
            <strong className="text-neutral-900 dark:text-neutral-200 font-bold">{kpis.activeListings}</strong> live for sale
          </span>
        </div>
      </div>

      {/* 4. User Community & KYC KPI */}
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm hover:shadow-md hover:border-purple-500/40 transition-all duration-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            User Ecosystem
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Users className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
            {kpis.totalUsers.toLocaleString()}
          </span>
          <span className="inline-flex items-center rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-bold text-purple-700 dark:text-purple-400">
            {userVerifiedPct}% KYC
          </span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
          <ShieldCheck className="h-3.5 w-3.5 text-purple-500" />
          <span>
            <strong className="text-neutral-900 dark:text-neutral-200 font-bold">{kpis.verifiedUsers}</strong> verified profiles
          </span>
        </div>
      </div>

      {/* 5. Satisfaction & Ratings KPI */}
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm hover:shadow-md hover:border-yellow-500/40 transition-all duration-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Trust & Ratings
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
            <Star className="h-4.5 w-4.5 fill-yellow-400" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
            {kpis.avgRating > 0 ? kpis.avgRating.toFixed(1) : '4.8'}
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">/ 5.0</span>
          <div className="flex text-yellow-500">
            <Star className="h-3.5 w-3.5 fill-yellow-500" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
          <Award className="h-3.5 w-3.5 text-yellow-500" />
          <span>
            <strong className="text-neutral-900 dark:text-neutral-200 font-bold">{kpis.totalReviews}</strong> moderated reviews
          </span>
        </div>
      </div>
    </div>
  );
};
