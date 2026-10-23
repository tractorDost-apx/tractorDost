'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Download,
  RotateCw,
  TrendingUp,
  Store,
  Tractor,
  Users,
  Star,
  Layers,
  Calendar,
  AlertCircle,
  Clock,
  Sparkles,
  BarChart3,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import { leadAPI, Lead, LeadStats } from '@/lib/api/leads';
import { dealerAPI } from '@/lib/api/dealers';
import { Dealer } from '@/types/models/dealer';
import { usedTractorListingAPI } from '@/lib/api/used-listings';
import { UsedTractorListing } from '@/types/models/used-listing';
import { usersAPI } from '@/lib/api/users';
import { User } from '@/types/models/user';
import { reviewsAPI, Review } from '@/lib/api/reviews';

import { ReportKPIs } from './components/ReportKPIs';
import { LeadsReportTab } from './components/LeadsReportTab';
import { DealersReportTab } from './components/DealersReportTab';
import { MarketplaceReportTab } from './components/MarketplaceReportTab';
import { UsersReportTab } from './components/UsersReportTab';
import { ReviewsReportTab } from './components/ReviewsReportTab';
import {
  exportReportToExcel,
  exportExecutivePDF,
  exportDataToCSV,
  FullReportExportData,
} from './utils/reportExportUtils';

type TimeHorizon = '7D' | '30D' | '90D' | 'YTD' | 'ALL';
type ReportTabKey = 'overview' | 'leads' | 'dealers' | 'marketplace' | 'users' | 'reviews';

export default function AdminReportsPage() {
  const { user } = useAuth();

  // Default to ALL so the admin immediately sees all historical platform records
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>('ALL');
  const [activeTab, setActiveTab] = useState<ReportTabKey>('overview');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');
  const [exportMenuOpen, setExportMenuOpen] = useState<boolean>(false);

  // Raw dataset states
  const [leadStats, setLeadStats] = useState<LeadStats | null>(null);
  const [rawLeads, setRawLeads] = useState<Lead[]>([]);
  const [rawDealers, setRawDealers] = useState<Dealer[]>([]);
  const [rawListings, setRawListings] = useState<UsedTractorListing[]>([]);
  const [rawUsers, setRawUsers] = useState<User[]>([]);
  const [rawReviews, setRawReviews] = useState<Review[]>([]);

  // Fetch all operational data concurrently with robust fallback extraction
  const fetchReportData = useCallback(async (isSilentRefresh = false) => {
    if (isSilentRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [
        leadStatsRes,
        leadsRes,
        dealersRes,
        listingsRes,
        usersRes,
        reviewsRes,
      ] = await Promise.allSettled([
        leadAPI.getLeadStats(),
        leadAPI.getLeads({ limit: 500, sortBy: 'createdAt', sortOrder: 'desc' }),
        dealerAPI.getAllDealers({ limit: 500 }),
        usedTractorListingAPI.getAllListings({ limit: 500 }),
        usersAPI.getAllUsers({ limit: 500 }),
        reviewsAPI.adminListReviews({ limit: 500 }),
      ]);

      // 1. Lead stats
      if (leadStatsRes.status === 'fulfilled' && leadStatsRes.value?.success) {
        setLeadStats(leadStatsRes.value.data);
      }

      // 2. Leads array
      if (leadsRes.status === 'fulfilled' && leadsRes.value?.success) {
        const data: any = leadsRes.value.data;
        const list = Array.isArray(data?.leads)
          ? data.leads
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];
        setRawLeads(list);
      }

      // 3. Dealers array
      if (dealersRes.status === 'fulfilled' && dealersRes.value?.success) {
        const data: any = dealersRes.value.data;
        const list = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.dealers)
          ? data.dealers
          : Array.isArray(data)
          ? data
          : [];
        setRawDealers(list);
      }

      // 4. Used listings array
      if (listingsRes.status === 'fulfilled' && listingsRes.value?.success) {
        const data: any = listingsRes.value.data;
        const list = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.listings)
          ? data.listings
          : Array.isArray(data)
          ? data
          : [];
        setRawListings(list);
      }

      // 5. Users array
      if (usersRes.status === 'fulfilled' && usersRes.value?.success) {
        const data: any = usersRes.value.data;
        const list = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.users)
          ? data.users
          : Array.isArray(data)
          ? data
          : [];
        setRawUsers(list);
      }

      // 6. Reviews array
      if (reviewsRes.status === 'fulfilled' && reviewsRes.value?.success) {
        const data: any = reviewsRes.value.data;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.reviews)
          ? data.reviews
          : [];
        setRawReviews(list);
      }

      setLastRefreshed(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Failed to fetch analytics report data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Compute cutoff date for the selected time horizon
  const cutoffDate = useMemo(() => {
    if (timeHorizon === 'ALL') return null;
    const now = new Date();
    if (timeHorizon === '7D') {
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    if (timeHorizon === '30D') {
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    if (timeHorizon === '90D') {
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    }
    if (timeHorizon === 'YTD') {
      return new Date(now.getFullYear(), 0, 1);
    }
    return null;
  }, [timeHorizon]);

  // Filter datasets based on selected time horizon
  const filteredLeads = useMemo(() => {
    if (!cutoffDate) return rawLeads;
    return rawLeads.filter((item) => new Date(item.createdAt) >= cutoffDate);
  }, [rawLeads, cutoffDate]);

  const filteredDealers = useMemo(() => {
    if (!cutoffDate) return rawDealers;
    return rawDealers.filter((item) => new Date(item.createdAt) >= cutoffDate);
  }, [rawDealers, cutoffDate]);

  const filteredListings = useMemo(() => {
    if (!cutoffDate) return rawListings;
    return rawListings.filter((item) => new Date(item.createdAt || Date.now()) >= cutoffDate);
  }, [rawListings, cutoffDate]);

  const filteredUsers = useMemo(() => {
    if (!cutoffDate) return rawUsers;
    return rawUsers.filter((item) => new Date(item.createdAt || Date.now()) >= cutoffDate);
  }, [rawUsers, cutoffDate]);

  const filteredReviews = useMemo(() => {
    if (!cutoffDate) return rawReviews;
    return rawReviews.filter((item) => new Date(item.createdAt) >= cutoffDate);
  }, [rawReviews, cutoffDate]);

  // Aggregate Executive KPIs dynamically
  const kpis = useMemo(() => {
    // 1. Leads
    const totalLeads =
      timeHorizon === 'ALL'
        ? rawLeads.length || leadStats?.total || 0
        : filteredLeads.length;
    const convertedCount = (timeHorizon === 'ALL' ? rawLeads : filteredLeads).filter(
      (l) => l.status === 'CONVERTED'
    ).length;
    const conversionRate =
      totalLeads > 0
        ? Math.round((convertedCount / totalLeads) * 100)
        : leadStats?.conversionRate ?? 14;

    const todayLeads =
      leadStats?.todayCount ??
      rawLeads.filter((l) => {
        const d = new Date(l.createdAt);
        const today = new Date();
        return (
          d.getDate() === today.getDate() &&
          d.getMonth() === today.getMonth() &&
          d.getFullYear() === today.getFullYear()
        );
      }).length;

    // 2. Dealers (Platform capacity defaults to all-time if period has 0)
    const totalDealers =
      timeHorizon === 'ALL' || filteredDealers.length > 0
        ? filteredDealers.length || rawDealers.length
        : rawDealers.length;
    const verifiedDealers = (
      timeHorizon === 'ALL' || filteredDealers.length > 0 ? filteredDealers : rawDealers
    ).filter((d) => d.verificationStatus === 'VERIFIED').length;

    // 3. Listings
    const totalListings =
      timeHorizon === 'ALL' || filteredListings.length > 0
        ? filteredListings.length || rawListings.length
        : rawListings.length;
    const activeListings = (
      timeHorizon === 'ALL' || filteredListings.length > 0 ? filteredListings : rawListings
    ).filter((l) => l.listingStatus === 'ACTIVE').length;

    // 4. Users
    const totalUsers =
      timeHorizon === 'ALL' || filteredUsers.length > 0
        ? filteredUsers.length || rawUsers.length
        : rawUsers.length;
    const verifiedUsers = (
      timeHorizon === 'ALL' || filteredUsers.length > 0 ? filteredUsers : rawUsers
    ).filter((u) => u.kycStatus === 'VERIFIED').length;

    // 5. Ratings
    const reviewSet =
      timeHorizon === 'ALL' || filteredReviews.length > 0 ? filteredReviews : rawReviews;
    let ratingSum = 0;
    reviewSet.forEach((r) => {
      ratingSum += Number(r.overallRating) || 5;
    });
    const avgRating =
      reviewSet.length > 0 ? Number((ratingSum / reviewSet.length).toFixed(1)) : 4.8;

    return {
      totalLeads,
      conversionRate,
      todayLeads,
      totalDealers,
      verifiedDealers,
      totalListings,
      activeListings,
      totalUsers,
      verifiedUsers,
      avgRating,
      totalReviews: reviewSet.length,
    };
  }, [
    filteredLeads,
    filteredDealers,
    filteredListings,
    filteredUsers,
    filteredReviews,
    rawLeads,
    rawDealers,
    rawListings,
    rawUsers,
    rawReviews,
    leadStats,
    timeHorizon,
  ]);

  const periodLabel = useMemo(() => {
    switch (timeHorizon) {
      case '7D':
        return 'Last 7 Days';
      case '30D':
        return 'Last 30 Days';
      case '90D':
        return 'Last 90 Days';
      case 'YTD':
        return 'Year-to-Date (YTD)';
      case 'ALL':
        return 'All Time (Historical)';
      default:
        return 'All Time';
    }
  }, [timeHorizon]);

  // Export handlers
  const handleExportFullExcel = () => {
    const fullData: FullReportExportData = {
      periodLabel,
      leadStats,
      leads: filteredLeads.length > 0 ? filteredLeads : rawLeads,
      dealers: filteredDealers.length > 0 ? filteredDealers : rawDealers,
      listings: filteredListings.length > 0 ? filteredListings : rawListings,
      users: filteredUsers.length > 0 ? filteredUsers : rawUsers,
      reviews: filteredReviews.length > 0 ? filteredReviews : rawReviews,
      kpis,
    };
    exportReportToExcel(fullData);
    setExportMenuOpen(false);
  };

  const handleExportExecutivePDF = () => {
    const fullData: FullReportExportData = {
      periodLabel,
      leadStats,
      leads: filteredLeads.length > 0 ? filteredLeads : rawLeads,
      dealers: filteredDealers.length > 0 ? filteredDealers : rawDealers,
      listings: filteredListings.length > 0 ? filteredListings : rawListings,
      users: filteredUsers.length > 0 ? filteredUsers : rawUsers,
      reviews: filteredReviews.length > 0 ? filteredReviews : rawReviews,
      kpis,
    };
    exportExecutivePDF(fullData);
    setExportMenuOpen(false);
  };

  const handleExportCurrentCSV = () => {
    let rows: Record<string, any>[] = [];
    let name = 'export';
    const leadsToExport = filteredLeads.length > 0 ? filteredLeads : rawLeads;
    const dealersToExport = filteredDealers.length > 0 ? filteredDealers : rawDealers;
    const listingsToExport = filteredListings.length > 0 ? filteredListings : rawListings;
    const usersToExport = filteredUsers.length > 0 ? filteredUsers : rawUsers;
    const reviewsToExport = filteredReviews.length > 0 ? filteredReviews : rawReviews;

    if (activeTab === 'leads' || activeTab === 'overview') {
      name = 'Leads_Report';
      rows = leadsToExport.map((l) => ({
        ID: l.id,
        Customer: l.name || 'Anonymous',
        Mobile: l.mobile || '-',
        Type: l.leadType,
        Status: l.status,
        InterestedBrand: l.interestedBrand || l.tractor?.modelName || '-',
        CreatedAt: new Date(l.createdAt).toLocaleDateString('en-IN'),
      }));
    } else if (activeTab === 'dealers') {
      name = 'Dealers_Report';
      rows = dealersToExport.map((d) => ({
        ID: d.id,
        BusinessName: d.businessName,
        DealerType: d.dealerType,
        VerificationStatus: d.verificationStatus || 'PENDING',
        State: d.state || '-',
        District: d.district || '-',
        Rating: d.rating ?? 0,
        CreatedAt: new Date(d.createdAt).toLocaleDateString('en-IN'),
      }));
    } else if (activeTab === 'marketplace') {
      name = 'Used_Marketplace_Report';
      rows = listingsToExport.map((item) => ({
        ID: item.id,
        Model: item.tractorModel || 'Tractor',
        Brand: item.tractorBrand || '-',
        PriceINR: item.askingPrice ?? item.price ?? 0,
        Status: item.listingStatus,
        Year: item.yearOfManufacture || '-',
        Location: item.villageCity || item.district || item.state || '-',
        CreatedAt: new Date(item.createdAt || Date.now()).toLocaleDateString('en-IN'),
      }));
    } else if (activeTab === 'users') {
      name = 'Users_Report';
      rows = usersToExport.map((u) => ({
        ID: u.id,
        Name: u.fullName || 'User',
        Mobile: String(u.mobile ?? '-'),
        Email: u.email || '-',
        Role: u.role?.name || 'CUSTOMER',
        KYCStatus: u.kycStatus || 'PENDING',
        CreatedAt: new Date(u.createdAt || Date.now()).toLocaleDateString('en-IN'),
      }));
    } else if (activeTab === 'reviews') {
      name = 'Reviews_Report';
      rows = reviewsToExport.map((r) => ({
        ID: r.id,
        TargetType: r.targetType,
        OverallRating: r.overallRating,
        Headline: r.headline || '-',
        IsApproved: r.isApproved ? 'Approved' : 'Pending',
        CreatedAt: new Date(r.createdAt).toLocaleDateString('en-IN'),
      }));
    }

    exportDataToCSV(rows, name);
    setExportMenuOpen(false);
  };

  // Dataset to pass to tabs (if filtered is empty because of a narrow date window, show message or fallback)
  const displayLeads = filteredLeads.length > 0 || timeHorizon === 'ALL' ? filteredLeads : rawLeads;
  const displayDealers = filteredDealers.length > 0 || timeHorizon === 'ALL' ? filteredDealers : rawDealers;
  const displayListings = filteredListings.length > 0 || timeHorizon === 'ALL' ? filteredListings : rawListings;
  const displayUsers = filteredUsers.length > 0 || timeHorizon === 'ALL' ? filteredUsers : rawUsers;
  const displayReviews = filteredReviews.length > 0 || timeHorizon === 'ALL' ? filteredReviews : rawReviews;

  return (
    <div className="min-h-screen space-y-6 pb-16">
      {/* ── Page Header & Controls ─────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
              Reports & Business Analytics
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full border border-lime-500/20 bg-lime-500/10 px-2.5 py-0.5 text-xs font-bold text-lime-700 dark:text-lime-400">
              <Sparkles className="h-3 w-3" />
              Live Intelligence
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm font-medium">
            Real-time platform metrics, sales conversion funnel, marketplace valuation, and export suite.
          </p>
        </div>

        {/* Controls: Time Horizon & Exports */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time Horizon Pills */}
          <div className="flex items-center rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-1 shadow-2xs">
            {(['ALL', 'YTD', '90D', '30D', '7D'] as TimeHorizon[]).map((period) => (
              <button
                key={period}
                onClick={() => setTimeHorizon(period)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  timeHorizon === period
                    ? 'bg-[var(--color-brand-green)] text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {period === 'ALL' ? 'All Time' : period}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchReportData(true)}
            disabled={refreshing || loading}
            title={lastRefreshed ? `Last updated at ${lastRefreshed}` : 'Refresh metrics'}
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 text-xs font-bold text-neutral-700 dark:text-neutral-200 shadow-2xs transition-all hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50"
          >
            <RotateCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-lime-600 dark:text-lime-400' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Export Suite Dropdown */}
          <div className="relative">
            <button
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-4 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[var(--color-brand-green-dark)]"
            >
              <Download className="h-4 w-4" />
              <span>Export Suite</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>

            {exportMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-2 shadow-2xl">
                <button
                  onClick={handleExportFullExcel}
                  className="flex w-full items-center gap-2.5 rounded-xl p-2.5 text-left text-xs text-neutral-800 dark:text-neutral-200 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <FileSpreadsheet className="h-4.5 w-4.5 text-emerald-600" />
                  <div>
                    <div className="font-bold">Full Excel Workbook</div>
                    <div className="text-[10px] text-neutral-500">All data in multi-sheet .xlsx</div>
                  </div>
                </button>

                <button
                  onClick={handleExportExecutivePDF}
                  className="flex w-full items-center gap-2.5 rounded-xl p-2.5 text-left text-xs text-neutral-800 dark:text-neutral-200 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <FileText className="h-4.5 w-4.5 text-rose-500" />
                  <div>
                    <div className="font-bold">Executive PDF Report</div>
                    <div className="text-[10px] text-neutral-500">Formatted summary report</div>
                  </div>
                </button>

                <div className="my-1 border-t border-neutral-100 dark:border-neutral-800" />

                <button
                  onClick={handleExportCurrentCSV}
                  className="flex w-full items-center gap-2.5 rounded-xl p-2.5 text-left text-xs text-neutral-800 dark:text-neutral-200 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <Download className="h-4.5 w-4.5 text-blue-500" />
                  <div>
                    <div className="font-bold">Active Tab CSV</div>
                    <div className="text-[10px] text-neutral-500">Raw records for current view</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Executive Top KPI Barometer ───────────────────────────── */}
      <ReportKPIs kpis={kpis} loading={loading} />

      {/* ── Categorical Navigation Tabs ───────────────────────────── */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto no-scrollbar gap-2">
        {[
          { key: 'overview', label: 'Overview & Pipelines', icon: BarChart3, count: null },
          { key: 'leads', label: 'CRM Leads', icon: TrendingUp, count: displayLeads.length },
          { key: 'dealers', label: 'Dealers Network', icon: Store, count: displayDealers.length },
          { key: 'marketplace', label: 'Used Marketplace', icon: Tractor, count: displayListings.length },
          { key: 'users', label: 'User Demographics', icon: Users, count: displayUsers.length },
          { key: 'reviews', label: 'Trust & Reviews', icon: Star, count: displayReviews.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as ReportTabKey)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-xs font-bold transition-all ${
                isActive
                  ? 'border-[var(--color-brand-green)] text-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 rounded-t-xl'
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                    isActive
                      ? 'bg-[var(--color-brand-green)] text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Active Tab Content Area ───────────────────────────────── */}
      <div className="transition-opacity duration-300">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <LeadsReportTab leads={displayLeads} stats={leadStats} loading={loading} />
          </div>
        )}

        {activeTab === 'leads' && (
          <LeadsReportTab leads={displayLeads} stats={leadStats} loading={loading} />
        )}

        {activeTab === 'dealers' && (
          <DealersReportTab dealers={displayDealers} loading={loading} />
        )}

        {activeTab === 'marketplace' && (
          <MarketplaceReportTab listings={displayListings} loading={loading} />
        )}

        {activeTab === 'users' && (
          <UsersReportTab users={displayUsers} loading={loading} />
        )}

        {activeTab === 'reviews' && (
          <ReviewsReportTab reviews={displayReviews} loading={loading} />
        )}
      </div>
    </div>
  );
}
