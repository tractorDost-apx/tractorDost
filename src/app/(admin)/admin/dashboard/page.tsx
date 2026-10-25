'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/store/AuthContext';
import { usersAPI } from '@/lib/api/users';
import { dealerAPI } from '@/lib/api/dealers';
import { tractorAPI } from '@/lib/api/tractors';
import { usedTractorListingAPI } from '@/lib/api/used-listings';
import { usedTractorEnquiryAPI } from '@/lib/api/used-enquiries';
import { leadAPI, LeadStats } from '@/lib/api/leads';
import { auditLogAPI } from '@/lib/api/auditLogs';
import { AuditLogRow } from '@/components/admin/AuditLogRow';
import type { AuditLog } from '@/types/models/audit-log';
import { formatRelativeTime } from '@/lib/utils/format-date';
import {
  Users,
  Tractor,
  Store,
  MessageSquareText,
  ArrowRight,
  Activity,
  Loader2,
  Clock,
  ShieldCheck,
  Tag,
  CheckCircle2,
  RotateCw,
  AlertCircle,
  PhoneCall,
  Check,
  TrendingUp,
  Flame,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Real Counts & Recent items
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalDealers, setTotalDealers] = useState<number>(0);
  const [verifiedDealersCount, setVerifiedDealersCount] = useState<number>(0);
  const [pendingDealersCount, setPendingDealersCount] = useState<number>(0);
  const [certifiedDealersCount, setCertifiedDealersCount] = useState<number>(0);

  const [totalCatalogTractors, setTotalCatalogTractors] = useState<number>(0);
  const [totalListings, setTotalListings] = useState<number>(0);
  const [totalLeads, setTotalLeads] = useState<number>(0);
  const [totalEnquiries, setTotalEnquiries] = useState<number>(0);

  const [leadStats, setLeadStats] = useState<LeadStats | null>(null);

  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentDealers, setRecentDealers] = useState<any[]>([]);
  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [recentEnquiries, setRecentEnquiries] = useState<any[]>([]);

  // Live Platform Activity tab: Enquiries (default) or Audit Logs (fetched on first open)
  const [activityTab, setActivityTab] = useState<'enquiries' | 'audit'>('enquiries');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [auditLoaded, setAuditLoaded] = useState(false);

  const loadAuditLogs = useCallback(async () => {
    setAuditLoading(true);
    setAuditError(null);
    const res = await auditLogAPI.getAuditLogs({ page: 1, limit: 10 });
    if (res.success && res.data) {
      setAuditLogs(Array.isArray(res.data.logs) ? res.data.logs : []);
      setAuditLoaded(true);
    } else {
      setAuditError(res.message || 'Failed to fetch audit logs');
    }
    setAuditLoading(false);
  }, []);

  useEffect(() => {
    if (activityTab === 'audit' && !auditLoaded && !auditLoading && !auditError) {
      loadAuditLogs();
    }
  }, [activityTab, auditLoaded, auditLoading, auditError, loadAuditLogs]);

  const loadDashboardData = useCallback(async () => {
    setLoadError(null);
    try {
      const [
        usersRes,
        dealersRes,
        catalogRes,
        listingsRes,
        leadsRes,
        enquiriesRes,
        leadStatsRes,
      ] = await Promise.allSettled([
        usersAPI.getAllUsers({ limit: 10 }),
        dealerAPI.getAllDealers({ limit: 20 }),
        tractorAPI.getAllTractors({ limit: 1 }),
        usedTractorListingAPI.getAllListings({ limit: 10 }),
        leadAPI.getLeads({ limit: 10 }),
        usedTractorEnquiryAPI.getAllEnquiries({ limit: 10 }),
        leadAPI.getLeadStats(),
      ]);

      const errors: string[] = [];

      // 1. Users (total from meta or total or totalCount)
      if (usersRes.status === 'fulfilled' && usersRes.value?.success) {
        const uData: any = usersRes.value.data;
        const uTotal =
          uData?.meta?.total ??
          uData?.total ??
          uData?.totalCount ??
          (Array.isArray(uData?.data) ? uData.data.length : 0);
        setTotalUsers(Number(uTotal) || 0);
        setRecentUsers(Array.isArray(uData?.data) ? uData.data : []);
      } else if (usersRes.status === 'rejected') {
        errors.push('Users directory');
      }

      // 2. Dealers (backend returns totalCount directly on data)
      if (dealersRes.status === 'fulfilled' && dealersRes.value?.success) {
        const dData: any = dealersRes.value.data;
        const dTotal =
          dData?.totalCount ??
          dData?.total ??
          dData?.meta?.total ??
          (Array.isArray(dData?.data) ? dData.data.length : 0);
        setTotalDealers(Number(dTotal) || 0);

        const dealerList: any[] = Array.isArray(dData?.data) ? dData.data : [];
        setRecentDealers(dealerList);

        // Calculate dealer statuses
        const verified = dealerList.filter(
          (d) => d.verificationStatus === 'VERIFIED' || d.isVerified
        ).length;
        const pending = dealerList.filter(
          (d) => d.verificationStatus === 'PENDING'
        ).length;
        const certified = dealerList.filter((d) => Boolean(d.isCertified)).length;
        setVerifiedDealersCount(verified);
        setPendingDealersCount(pending);
        setCertifiedDealersCount(certified);
      } else if (dealersRes.status === 'rejected') {
        errors.push('Dealers directory');
      }

      // 3. Catalog Tractors (backend returns totalCount or pagination.total)
      if (catalogRes.status === 'fulfilled' && catalogRes.value?.success) {
        const cData: any = catalogRes.value.data;
        const cTotal =
          cData?.pagination?.total ??
          cData?.totalCount ??
          (catalogRes.value as any)?.pagination?.total ??
          (Array.isArray(cData?.tractors) ? cData.tractors.length : 0);
        setTotalCatalogTractors(Number(cTotal) || 0);
      } else if (catalogRes.status === 'rejected') {
        errors.push('Catalog tractors');
      }

      // 4. Used Listings (backend returns total directly on data)
      if (
        listingsRes.status === 'fulfilled' &&
        listingsRes.value?.success &&
        listingsRes.value.data
      ) {
        const lData: any = listingsRes.value.data;
        const lTotal =
          lData?.total ??
          lData?.meta?.total ??
          lData?.totalCount ??
          (Array.isArray(lData?.data) ? lData.data.length : 0);
        setTotalListings(Number(lTotal) || 0);
        setRecentListings(Array.isArray(lData?.data) ? lData.data : []);
      } else if (listingsRes.status === 'rejected') {
        errors.push('Used listings');
      }

      // 5. Customer Leads (CRM platform leads)
      if (leadsRes.status === 'fulfilled' && leadsRes.value?.success && leadsRes.value.data) {
        const leadData: any = leadsRes.value.data;
        const leadTotal =
          leadData?.total ??
          leadData?.pagination?.total ??
          leadData?.meta?.total ??
          (Array.isArray(leadData?.leads) ? leadData.leads.length : 0);
        setTotalLeads(Number(leadTotal) || 0);
        setRecentLeads(Array.isArray(leadData?.leads) ? leadData.leads : []);
      } else if (leadsRes.status === 'rejected') {
        errors.push('Customer leads');
      }

      // 6. Used Tractor Marketplace Enquiries
      if (
        enquiriesRes.status === 'fulfilled' &&
        enquiriesRes.value?.success &&
        enquiriesRes.value.data
      ) {
        const enqData: any = enquiriesRes.value.data;
        const enqTotal =
          enqData?.meta?.total ??
          enqData?.total ??
          (Array.isArray(enqData?.data) ? enqData.data.length : 0);
        setTotalEnquiries(Number(enqTotal) || 0);
        setRecentEnquiries(Array.isArray(enqData?.data) ? enqData.data : []);
      } else if (enquiriesRes.status === 'rejected') {
        errors.push('Marketplace enquiries');
      }

      // 7. Lead Detailed Stats
      if (leadStatsRes.status === 'fulfilled' && leadStatsRes.value?.success && leadStatsRes.value.data) {
        setLeadStats(leadStatsRes.value.data);
      }

      if (errors.length > 0) {
        setLoadError(`Failed to load: ${errors.join(', ')}. Please try refreshing.`);
      }
    } catch (err: any) {
      console.error('Error fetching admin dashboard data', err);
      setLoadError('An error occurred while loading dashboard metrics.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    loadDashboardData();
    if (auditLoaded || auditError) loadAuditLogs();
  };

  const totalCustomerContacts = totalLeads + totalEnquiries;
  const totalTractorsAvailable = totalCatalogTractors + totalListings;

  const metrics = [
    {
      label: 'Total Users',
      value: loading ? '...' : String(totalUsers),
      subtext: 'Registered platform users',
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10 border-blue-500/20',
      href: '/admin/users',
    },
    {
      label: 'Dealer Network',
      value: loading ? '...' : String(totalDealers),
      subtext: `${verifiedDealersCount} verified · ${pendingDealersCount} pending review`,
      icon: Store,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10 border-amber-500/20',
      href: '/admin/dealers',
    },
    {
      label: 'Tractors Listed',
      value: loading ? '...' : String(totalTractorsAvailable),
      subtext: `${totalCatalogTractors} catalog · ${totalListings} used market`,
      icon: Tractor,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      href: '/admin/tractors',
    },
    {
      label: 'Customer Leads',
      value: loading ? '...' : String(totalCustomerContacts),
      subtext: `${totalLeads} platform leads · ${totalEnquiries} marketplace`,
      icon: MessageSquareText,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10 border-purple-500/20',
      href: '/admin/leads',
    },
  ];

  // Combined Platform Activity Feed
  const combinedActivity = useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      desc: string;
      time: string;
      date: Date;
      badge: string;
      badgeColor: string;
      href: string;
    }> = [];

    // 1. Dealers
    recentDealers.forEach((d) => {
      const isVerified = d.verificationStatus === 'VERIFIED' || d.isVerified;
      const isPending = d.verificationStatus === 'PENDING';
      const badge = isVerified ? 'VERIFIED' : isPending ? 'PENDING' : d.verificationStatus || 'DEALER';
      const badgeColor = isVerified
        ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10'
        : isPending
        ? 'text-amber-500 border-amber-500/20 bg-amber-500/10'
        : 'text-blue-500 border-blue-500/20 bg-blue-500/10';
      const locStr = [d.district, d.state].filter(Boolean).join(', ') || 'Dealership';
      const contactStr = d.phone || d.email || (d.user?.fullName ? `Owner: ${d.user.fullName}` : '');

      items.push({
        id: `dealer-${d.id}`,
        title: `Dealership: ${d.businessName || 'Partner'}`,
        desc: `${locStr}${contactStr ? ` · ${contactStr}` : ''}`,
        time: formatRelativeTime(d.createdAt),
        date: new Date(d.createdAt || Date.now()),
        badge,
        badgeColor,
        href: `/admin/dealers`,
      });
    });

    // 2. Users
    recentUsers.forEach((u) => {
      const roleName = u.role?.name || u.role || 'Customer';
      items.push({
        id: `user-${u.id}`,
        title: `New User: ${u.fullName || 'Registered User'}`,
        desc: `Role: ${roleName} · ${u.mobile || u.email || 'Registered account'}`,
        time: formatRelativeTime(u.createdAt),
        date: new Date(u.createdAt || Date.now()),
        badge: String(roleName).toUpperCase(),
        badgeColor: 'text-blue-500 border-blue-500/20 bg-blue-500/10',
        href: `/admin/users`,
      });
    });

    // 3. Used Listings
    recentListings.forEach((l) => {
      const priceVal =
        l.askingPrice !== undefined && l.askingPrice !== null ? l.askingPrice : l.price;
      const priceStr = priceVal ? `₹${Number(priceVal).toLocaleString('en-IN')}` : 'Price on request';
      const titleStr = [l.tractorBrand, l.tractorModel].filter(Boolean).join(' ') || 'Used Tractor';
      const locStr = [l.district, l.state].filter(Boolean).join(', ') || 'India';
      const status = l.listingStatus || l.status || 'ACTIVE';

      items.push({
        id: `listing-${l.id}`,
        title: `New Listing: ${titleStr}`,
        desc: `${priceStr} · ${locStr}`,
        time: formatRelativeTime(l.createdAt),
        date: new Date(l.createdAt || Date.now()),
        badge: status,
        badgeColor:
          status === 'ACTIVE'
            ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10'
            : 'text-zinc-400 border-zinc-500/20 bg-zinc-500/10',
        href: `/admin/used-listings`,
      });
    });

    // 4. Platform Customer Leads
    recentLeads.forEach((l) => {
      const tractorName =
        [l.interestedBrand, l.interestedModel].filter(Boolean).join(' ') ||
        l.tractor?.modelName ||
        l.leadType ||
        'Tractor Enquiry';
      const contactInfo = l.mobile || l.email || '';
      items.push({
        id: `lead-${l.id}`,
        title: `New Lead: ${l.name || 'Customer'}`,
        desc: `Interested in ${tractorName}${contactInfo ? ` · Mobile: ${contactInfo}` : ''}`,
        time: formatRelativeTime(l.createdAt),
        date: new Date(l.createdAt || Date.now()),
        badge: l.status || 'NEW',
        badgeColor: 'text-purple-500 border-purple-500/20 bg-purple-500/10',
        href: `/admin/leads`,
      });
    });

    // 5. Used Tractor Enquiries
    recentEnquiries.forEach((e) => {
      const listingTitle =
        [e.listing?.tractorBrand, e.listing?.tractorModel].filter(Boolean).join(' ') ||
        'Used Tractor';
      const contactInfo = e.mobile || '';
      items.push({
        id: `enquiry-${e.id}`,
        title: `Used Enquiry: ${e.name || 'Buyer'}`,
        desc: `Interested in ${listingTitle}${contactInfo ? ` · Mobile: ${contactInfo}` : ''}`,
        time: formatRelativeTime(e.createdAt),
        date: new Date(e.createdAt || Date.now()),
        badge: e.status || 'NEW',
        badgeColor: 'text-amber-500 border-amber-500/20 bg-amber-500/10',
        href: `/admin/leads`,
      });
    });

    items.sort((a, b) => b.date.getTime() - a.date.getTime());
    return items.slice(0, 10);
  }, [recentDealers, recentUsers, recentListings, recentLeads, recentEnquiries]);

  return (
    <div className="animate-fade-in flex h-full flex-col space-y-6 pb-6">
      <div>
        <div className="mb-2 flex items-center gap-3">
          <h1 className="text-foreground text-3xl font-black">
            Welcome back, {user?.fullName?.split(' ')[0] || 'Admin'}! 👋
          </h1>
          <span className="rounded-full border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-3 py-1 text-xs font-black tracking-wider text-[var(--color-brand-green)] uppercase">
            Admin
          </span>
        </div>
        <p className="text-muted font-medium">Here is an overview of the platform's performance.</p>
      </div>

      {/* Error Notice */}
      {loadError && (
        <div className="flex items-center justify-between rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-semibold text-rose-500">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={16} />
            <span>{loadError}</span>
          </div>
          <button
            onClick={handleManualRefresh}
            className="rounded-lg bg-rose-500/20 px-3 py-1 font-bold text-rose-500 hover:bg-rose-500/30"
          >
            Retry
          </button>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <Link
              key={idx}
              href={m.href}
              className="bg-foreground/5 group relative flex items-center justify-between rounded-2xl border border-[var(--border-subtle)] p-5 transition-all hover:border-[var(--color-brand-green)]/40 hover:shadow-md"
            >
              <div>
                <p className="text-muted mb-1 text-xs font-black tracking-wider uppercase">
                  {m.label}
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-foreground text-3xl font-black">{m.value}</p>
                  {loading && <Loader2 size={16} className="text-muted animate-spin" />}
                </div>
                <p className="text-muted mt-1 text-xs font-medium">{m.subtext}</p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${m.bg} ${m.color} transition-transform group-hover:scale-110`}
              >
                <Icon size={24} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Navigation Hub */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-foreground text-xs font-black tracking-wider uppercase">
            Quick Management Hub
          </p>
          <span className="text-muted text-[11px] font-bold">Direct platform access</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          <Link
            href="/admin/users"
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-background/50 p-3 text-center transition-all hover:border-blue-500/40 hover:bg-blue-500/5 group"
          >
            <Users size={18} className="text-blue-500 transition-transform group-hover:scale-110" />
            <span className="text-[11px] font-black text-foreground">Users ({totalUsers})</span>
          </Link>
          <Link
            href="/admin/dealers"
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-background/50 p-3 text-center transition-all hover:border-amber-500/40 hover:bg-amber-500/5 group"
          >
            <Store size={18} className="text-amber-500 transition-transform group-hover:scale-110" />
            <span className="text-[11px] font-black text-foreground">Dealers ({totalDealers})</span>
          </Link>
          <Link
            href="/admin/tractors"
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-background/50 p-3 text-center transition-all hover:border-emerald-500/40 hover:bg-emerald-500/5 group"
          >
            <Tractor size={18} className="text-emerald-500 transition-transform group-hover:scale-110" />
            <span className="text-[11px] font-black text-foreground">Catalog ({totalCatalogTractors})</span>
          </Link>
          <Link
            href="/admin/used-listings"
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-background/50 p-3 text-center transition-all hover:border-teal-500/40 hover:bg-teal-500/5 group"
          >
            <Tag size={18} className="text-teal-500 transition-transform group-hover:scale-110" />
            <span className="text-[11px] font-black text-foreground">Used ({totalListings})</span>
          </Link>
          <Link
            href="/admin/leads"
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-background/50 p-3 text-center transition-all hover:border-purple-500/40 hover:bg-purple-500/5 group"
          >
            <MessageSquareText size={18} className="text-purple-500 transition-transform group-hover:scale-110" />
            <span className="text-[11px] font-black text-foreground">Leads ({totalLeads})</span>
          </Link>
          <Link
            href="/admin/reviews"
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-background/50 p-3 text-center transition-all hover:border-rose-500/40 hover:bg-rose-500/5 group"
          >
            <CheckCircle2 size={18} className="text-rose-500 transition-transform group-hover:scale-110" />
            <span className="text-[11px] font-black text-foreground">Reviews</span>
          </Link>
        </div>
      </div>

      {/* Real-time Insights & Status Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Lead Pipeline Overview */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-foreground flex items-center gap-2 text-sm font-black tracking-wider uppercase">
              <MessageSquareText size={16} className="text-purple-500" /> Customer Lead Pipeline
            </h3>
            <Link
              href="/admin/leads"
              className="text-muted hover:text-purple-500 flex items-center gap-1 text-xs font-bold transition-colors"
            >
              Open CRM <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Link
              href="/admin/leads?status=NEW"
              className="flex flex-col rounded-xl border border-purple-500/20 bg-purple-500/5 p-3.5 transition-all hover:bg-purple-500/10"
            >
              <span className="text-muted text-[10px] font-black uppercase tracking-wider">New</span>
              <span className="text-foreground mt-1 text-xl font-black">
                {leadStats?.byStatus?.NEW ?? recentLeads.filter((l) => l.status === 'NEW').length}
              </span>
              <span className="text-purple-500 mt-1 text-[10px] font-bold">Needs Contact</span>
            </Link>

            <Link
              href="/admin/leads?status=CONTACTED"
              className="flex flex-col rounded-xl border border-blue-500/20 bg-blue-500/5 p-3.5 transition-all hover:bg-blue-500/10"
            >
              <span className="text-muted text-[10px] font-black uppercase tracking-wider">Contacted</span>
              <span className="text-foreground mt-1 text-xl font-black">
                {leadStats?.byStatus?.CONTACTED ?? recentLeads.filter((l) => l.status === 'CONTACTED').length}
              </span>
              <span className="text-blue-500 mt-1 text-[10px] font-bold">In Conversation</span>
            </Link>

            <Link
              href="/admin/leads?status=QUALIFIED"
              className="flex flex-col rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 transition-all hover:bg-amber-500/10"
            >
              <span className="text-muted text-[10px] font-black uppercase tracking-wider">Qualified</span>
              <span className="text-foreground mt-1 text-xl font-black">
                {leadStats?.byStatus?.QUALIFIED ?? 0}
              </span>
              <span className="text-amber-500 mt-1 text-[10px] font-bold">High Intent</span>
            </Link>

            <Link
              href="/admin/leads?status=CONVERTED"
              className="flex flex-col rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 transition-all hover:bg-emerald-500/10"
            >
              <span className="text-muted text-[10px] font-black uppercase tracking-wider">Converted</span>
              <span className="text-foreground mt-1 text-xl font-black">
                {leadStats?.byStatus?.CONVERTED ?? 0}
              </span>
              <span className="text-emerald-500 mt-1 text-[10px] font-bold">Purchased</span>
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-3 text-xs">
            <span className="text-muted">
              Marketplace Enquiries: <strong className="text-foreground">{totalEnquiries}</strong>
            </span>
            <span className="text-muted">
              Duplicate Leads Merged: <strong className="text-foreground">{leadStats?.duplicateCount ?? 0}</strong>
            </span>
            <Link href="/admin/leads" className="text-purple-500 font-bold hover:underline">
              View all {totalLeads} leads →
            </Link>
          </div>
        </div>

        {/* Dealer Network Health */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-foreground flex items-center gap-2 text-sm font-black tracking-wider uppercase">
              <Store size={16} className="text-amber-500" /> Dealership Network Status
            </h3>
            <Link
              href="/admin/dealers"
              className="text-muted hover:text-amber-500 flex items-center gap-1 text-xs font-bold transition-colors"
            >
              Manage Dealers <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Link
              href="/admin/dealers?status=VERIFIED"
              className="flex flex-col rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 transition-all hover:bg-emerald-500/10"
            >
              <span className="text-muted text-[10px] font-black uppercase tracking-wider">Verified</span>
              <span className="text-foreground mt-1 text-xl font-black">{verifiedDealersCount}</span>
              <span className="text-emerald-500 mt-1 text-[10px] font-bold">Active Partners</span>
            </Link>

            <Link
              href="/admin/dealers?status=PENDING"
              className="flex flex-col rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 transition-all hover:bg-amber-500/10"
            >
              <span className="text-muted text-[10px] font-black uppercase tracking-wider">Pending</span>
              <span className="text-foreground mt-1 text-xl font-black">{pendingDealersCount}</span>
              <span className="text-amber-500 mt-1 text-[10px] font-bold">Needs Review</span>
            </Link>

            <Link
              href="/admin/dealers"
              className="flex flex-col rounded-xl border border-blue-500/20 bg-blue-500/5 p-3.5 transition-all hover:bg-blue-500/10"
            >
              <span className="text-muted text-[10px] font-black uppercase tracking-wider">Certified</span>
              <span className="text-foreground mt-1 text-xl font-black">{certifiedDealersCount}</span>
              <span className="text-blue-500 mt-1 text-[10px] font-bold">Trusted Badge</span>
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-3 text-xs">
            <span className="text-muted">
              Total Dealership Applications: <strong className="text-foreground">{totalDealers}</strong>
            </span>
            <Link href="/admin/dealers" className="text-amber-500 font-bold hover:underline">
              Moderate dealerships →
            </Link>
          </div>
        </div>
      </div>

      {/* Platform Recent Activity */}
      <div className="flex-1">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-foreground flex items-center gap-2 text-lg font-black tracking-tight">
            <Activity className="text-[var(--color-brand-green)]" size={20} /> Live Platform Activity
          </h2>
          <div className="flex items-center gap-3">
            <div
              role="tablist"
              aria-label="Activity view"
              className="flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-foreground/5 p-1"
            >
              {(
                [
                  { key: 'enquiries', label: 'Enquiries' },
                  { key: 'audit', label: 'Audit Logs' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={activityTab === tab.key}
                  onClick={() => setActivityTab(tab.key)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-black transition-all ${
                    activityTab === tab.key
                      ? 'bg-[var(--color-brand-green)] text-black shadow-sm'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <Link
              href={activityTab === 'audit' ? '/admin/settings/audit-logs' : '/admin/leads'}
              className="text-muted hover:text-[var(--color-brand-green)] hidden items-center gap-1 text-xs font-bold transition-colors sm:flex"
            >
              {activityTab === 'audit' ? 'View all logs' : 'View all leads'} <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {activityTab === 'audit' ? (
          auditLoading ? (
            <div className="bg-foreground/5 flex items-center justify-center rounded-2xl border border-[var(--border-subtle)] py-12">
              <Loader2 className="animate-spin text-[var(--color-brand-green)]" size={28} />
            </div>
          ) : auditError ? (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-semibold text-rose-500">
              <div className="flex items-center gap-2.5">
                <AlertCircle size={16} className="shrink-0" />
                <span>{auditError}</span>
              </div>
              <button
                onClick={loadAuditLogs}
                className="rounded-lg bg-rose-500/20 px-3 py-1 font-bold text-rose-500 hover:bg-rose-500/30"
              >
                Retry
              </button>
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="bg-foreground/5 flex flex-col items-center justify-center rounded-2xl border border-[var(--border-subtle)] p-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
                <ShieldCheck size={24} />
              </div>
              <p className="text-foreground text-sm font-bold">No Audit Logs Yet</p>
              <p className="text-muted mt-1 max-w-sm text-xs font-medium">
                Admin and staff actions such as creating, updating or deleting records will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <AuditLogRow key={log.id} log={log} />
              ))}
            </div>
          )
        ) : loading ? (
          <div className="bg-foreground/5 flex items-center justify-center rounded-2xl border border-[var(--border-subtle)] py-12">
            <Loader2 className="animate-spin text-[var(--color-brand-green)]" size={28} />
          </div>
        ) : combinedActivity.length === 0 ? (
          <div className="bg-foreground/5 flex flex-col items-center justify-center rounded-2xl border border-[var(--border-subtle)] p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] mb-3">
              <Activity size={24} />
            </div>
            <p className="text-foreground text-sm font-bold">No Platform Activity Yet</p>
            <p className="text-muted mt-1 max-w-sm text-xs font-medium">
              Registered users, new dealer onboarding, and buyer enquiries will appear here as they occur.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {combinedActivity.map((activity) => (
              <Link
                key={activity.id}
                href={activity.href}
                className="bg-foreground/5 group flex flex-col gap-3 rounded-2xl border border-[var(--border-subtle)] p-4 transition-all hover:border-[var(--color-brand-green)]/30 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
                    <div className="h-2 w-2 rounded-full bg-[var(--color-brand-green)] animate-pulse" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-foreground text-sm font-bold group-hover:text-[var(--color-brand-green)] transition-colors">
                        {activity.title}
                      </p>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase ${activity.badgeColor}`}
                      >
                        {activity.badge}
                      </span>
                    </div>
                    <p className="text-muted mt-1 text-xs font-medium">{activity.desc}</p>
                  </div>
                </div>
                <div className="text-muted flex items-center gap-1.5 text-xs font-bold whitespace-nowrap sm:self-center">
                  <Clock size={13} /> {activity.time}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

