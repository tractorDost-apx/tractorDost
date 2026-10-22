'use client';

import React, { useMemo } from 'react';
import { useAuth } from '@/store/AuthContext';
import { useDealerInventory } from '@/hooks/dealers/use-dealer-inventory';
import { useReceivedEnquiries } from '@/hooks/leads/use-my-enquiries';
import { useMyUsedListings } from '@/hooks/used-listings/use-used-listings';
import { useDealerServices } from '@/hooks/dealers/use-dealer-services';
import { formatRelativeTime } from '@/lib/utils/format-date';
import {
  Tractor,
  MessageSquareText,
  FileCheck,
  ArrowRight,
  Activity,
  TrendingUp,
  LayoutDashboard,
  Store,
  Layers,
  Inbox,
  UserCheck,
  PlusCircle,
  Clock,
  Sparkles,
  Loader2,
  Wrench,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

export default function DealerDashboardPage() {
  const { user } = useAuth();

  // 1. Dealer Inventory Data
  const { stats, inventory, loadingData, dealerName } = useDealerInventory();

  // 2. Real Customer Leads / Enquiries
  const { data: leadsData, loading: loadingLeads } = useReceivedEnquiries({ page: 1, limit: 15 });

  // 3. Real Used Tractor Listings
  const { data: usedData, loading: loadingUsed } = useMyUsedListings({ page: 1, limit: 15 });

  // 4. Real Workshop Bookings & Inspections
  const {
    bookings,
    pagination: servicesPagination,
    loadingBookings,
    loadingDealer,
  } = useDealerServices();

  // Inventory Metrics
  const totalInventoryCount = stats?.totalItems ?? (inventory?.length || 0);
  const inStockCount = stats?.availableItems ?? (inventory?.filter((i) => i.isAvailable)?.length || 0);
  const outOfStockCount = stats?.unavailableItems ?? (inventory?.filter((i) => !i.isAvailable)?.length || 0);

  // Leads Metrics
  const totalLeadsCount = leadsData?.meta?.total ?? (leadsData?.data?.length || 0);
  const newLeadsCount = (leadsData?.data ?? []).filter((e) => e.status === 'NEW').length;
  const inProgressLeadsCount = (leadsData?.data ?? []).filter(
    (e) => e.status === 'ATTEMPTED' || e.status === 'CONTACTED'
  ).length;

  // Used Listings Metrics
  const totalUsedCount = usedData?.meta?.total ?? (usedData?.data?.length || 0);
  const activeUsedCount = (usedData?.data ?? []).filter((l) => l.status === 'ACTIVE').length;
  const certifiedUsedCount = (usedData?.data ?? []).filter((l) => l.isCertified).length;

  // Services Metrics
  const totalServicesCount = servicesPagination?.total ?? (bookings?.length || 0);
  const pendingServicesCount = (bookings ?? []).filter(
    (b) => b.status === 'SCHEDULED' || b.status === 'IN_PROGRESS'
  ).length;
  const completedServicesCount = (bookings ?? []).filter((b) => b.status === 'COMPLETED').length;

  const metrics = [
    {
      label: 'Active Inventory',
      value: loadingData ? '...' : String(totalInventoryCount),
      subtext: `${inStockCount} In Stock · ${outOfStockCount} Out of Stock`,
      icon: Tractor,
      color: 'text-[var(--color-brand-green)]',
      bg: 'bg-[var(--color-brand-green)]/10 border-[var(--color-brand-green)]/20',
      href: '/dealer/inventory',
      loading: loadingData,
    },
    {
      label: 'Customer Leads',
      value: loadingLeads ? '...' : String(totalLeadsCount),
      subtext: loadingLeads
        ? 'Updating leads...'
        : totalLeadsCount === 0
          ? 'No buyer leads yet'
          : `${newLeadsCount} new · ${inProgressLeadsCount} in progress`,
      icon: MessageSquareText,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10 border-amber-500/20',
      href: '/dealer/leads',
      loading: loadingLeads,
    },
    {
      label: 'Used Listings',
      value: loadingUsed ? '...' : String(totalUsedCount),
      subtext: loadingUsed
        ? 'Updating listings...'
        : totalUsedCount === 0
          ? '0 listings posted'
          : `${activeUsedCount} active · ${certifiedUsedCount} certified`,
      icon: Store,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10 border-blue-500/20',
      href: '/dealer/used-listings',
      loading: loadingUsed,
    },
    {
      label: 'Workshop Services',
      value: loadingBookings || loadingDealer ? '...' : String(totalServicesCount),
      subtext:
        loadingBookings || loadingDealer
          ? 'Updating bookings...'
          : totalServicesCount === 0
            ? 'No service bookings yet'
            : `${pendingServicesCount} active · ${completedServicesCount} completed`,
      icon: FileCheck,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      href: '/dealer/services',
      loading: loadingBookings || loadingDealer,
    },
  ];

  const quickActions = [
    {
      title: 'Manage Inventory',
      desc: 'Add, update stock status and tractor pricing',
      icon: Tractor,
      href: '/dealer/inventory',
      color: 'text-[var(--color-brand-green)]',
      bg: 'bg-[var(--color-brand-green)]/10',
    },
    {
      title: 'Authorized Brands',
      desc: 'Manage brand dealership certifications',
      icon: Layers,
      href: '/dealer/brands',
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
    },
    {
      title: 'Used Tractor Leads',
      desc: 'Connect with verified buyers & farmers',
      icon: Inbox,
      href: '/dealer/leads',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      title: 'Dealership Profile',
      desc: 'Showroom location, contacts & working hours',
      icon: UserCheck,
      href: '/dealer/profile',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
  ];

  // Combined real activity feed from leads, service bookings, and used tractor listings
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

    // 1. Leads
    (leadsData?.data ?? []).forEach((lead) => {
      const isNew = lead.status === 'NEW';
      items.push({
        id: `lead-${lead.id}`,
        title: `Buyer Lead: ${lead.name}`,
        desc: `Enquiry on ${lead.listing?.tractorModel || 'Tractor'} · Mobile: ${lead.mobile}`,
        time: formatRelativeTime(lead.createdAt),
        date: new Date(lead.createdAt),
        badge: lead.status,
        badgeColor: isNew
          ? 'text-amber-500 border-amber-500/20 bg-amber-500/10'
          : 'text-blue-500 border-blue-500/20 bg-blue-500/10',
        href: '/dealer/leads',
      });
    });

    // 2. Services / Inspections
    (bookings ?? []).forEach((booking) => {
      const isDone = booking.status === 'COMPLETED';
      items.push({
        id: `service-${booking.bookingId}`,
        title: `Service: ${booking.tractorBrand} ${booking.tractorModel}`,
        desc: `Customer: ${booking.name} · Type: ${booking.serviceType.replace(/_/g, ' ')}`,
        time: formatRelativeTime(booking.createdAt),
        date: new Date(booking.createdAt),
        badge: booking.status,
        badgeColor: isDone
          ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10'
          : 'text-purple-500 border-purple-500/20 bg-purple-500/10',
        href: '/dealer/services',
      });
    });

    // 3. Used Listings
    (usedData?.data ?? []).forEach((listing) => {
      items.push({
        id: `listing-${listing.id}`,
        title: `Listed: ${listing.tractorModel}`,
        desc: `Price: ₹${(listing.askingPrice ?? listing.price) ? (listing.askingPrice ?? listing.price)!.toLocaleString('en-IN') : 'N/A'} · Year: ${listing.yearOfManufacture || 'Used'}`,
        time: formatRelativeTime(listing.createdAt),
        date: new Date(listing.createdAt),
        badge: listing.listingStatus || listing.status || 'ACTIVE',
        badgeColor:
          (listing.listingStatus || listing.status) === 'ACTIVE'
            ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10'
            : 'text-zinc-400 border-zinc-500/20 bg-zinc-500/10',
        href: '/dealer/used-listings',
      });
    });

    // Sort newest first
    items.sort((a, b) => b.date.getTime() - a.date.getTime());
    return items.slice(0, 5);
  }, [leadsData, bookings, usedData]);

  const isActivityLoading = loadingLeads && loadingUsed && (loadingBookings || loadingDealer);

  return (
    <div className="animate-fade-in flex h-full flex-col space-y-8 pb-8">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3.5">
          <div className="shrink-0 rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 p-3 text-[var(--color-brand-green)] shadow-sm">
            <LayoutDashboard size={28} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                Welcome back, {user?.fullName?.split(' ')[0] || dealerName || 'Dealer'}! 👋
              </h1>
              <span className="rounded-full border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-3 py-1 text-xs font-black tracking-wider text-[var(--color-brand-green)] uppercase">
                {dealerName ? `${dealerName} Hub` : 'Dealership Hub'}
              </span>
            </div>
            <p className="text-muted mt-1 text-xs font-medium sm:text-sm">
              Manage your tractor inventory, track customer leads, and monitor dealership operations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dealer/inventory"
            className="flex shrink-0 items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-5 py-2.5 text-xs font-black tracking-wider text-white uppercase shadow-md transition-all hover:opacity-90 active:scale-95"
          >
            <PlusCircle size={16} /> Add Inventory
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <Link
              key={idx}
              href={m.href}
              className="bg-foreground/5 group relative flex flex-col justify-between rounded-2xl border border-[var(--border-subtle)] p-5 transition-all hover:border-[var(--color-brand-green)]/40 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-muted text-xs font-black tracking-wider uppercase">
                  {m.label}
                </span>
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${m.bg} ${m.color} transition-transform group-hover:scale-110`}
                >
                  <Icon size={22} />
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-foreground text-3xl font-black tracking-tight">
                    {m.value}
                  </span>
                  {m.loading && (
                    <Loader2 size={16} className="text-muted animate-spin" />
                  )}
                </div>
                <p className="text-muted mt-1 text-xs font-medium">{m.subtext}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Dealership Shortcuts / Hub Navigation */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-foreground flex items-center gap-2 text-lg font-black tracking-tight">
            <Sparkles className="text-[var(--color-brand-green)]" size={20} /> Quick Dealership Actions
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link
                key={idx}
                href={action.href}
                className="bg-foreground/5 group flex flex-col justify-between rounded-2xl border border-[var(--border-subtle)] p-4.5 transition-all hover:border-[var(--color-brand-green)]/40 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${action.bg} ${action.color}`}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-foreground text-sm font-black group-hover:text-[var(--color-brand-green)] transition-colors">
                      {action.title}
                    </h3>
                  </div>
                </div>
                <p className="text-muted mt-2.5 text-xs font-medium leading-relaxed">
                  {action.desc}
                </p>
                <div className="mt-3 flex items-center gap-1 text-xs font-bold text-[var(--color-brand-green)] group-hover:translate-x-1 transition-transform">
                  Open <ArrowRight size={13} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Dealership Activity Timeline */}
      <div className="flex-1">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-foreground flex items-center gap-2 text-lg font-black tracking-tight">
            <Activity className="text-[var(--color-brand-green)]" size={20} /> Recent Dealership Activity
          </h2>
          <Link
            href="/dealer/leads"
            className="text-muted hover:text-[var(--color-brand-green)] flex items-center gap-1 text-xs font-bold transition-colors"
          >
            View all leads <ArrowRight size={14} />
          </Link>
        </div>

        {isActivityLoading ? (
          <div className="bg-foreground/5 flex items-center justify-center rounded-2xl border border-[var(--border-subtle)] py-12">
            <Loader2 className="animate-spin text-[var(--color-brand-green)]" size={28} />
          </div>
        ) : combinedActivity.length === 0 ? (
          <div className="bg-foreground/5 flex flex-col items-center justify-center rounded-2xl border border-[var(--border-subtle)] p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] mb-3">
              <Activity size={24} />
            </div>
            <p className="text-foreground text-sm font-bold">No Dealership Activity Yet</p>
            <p className="text-muted mt-1 max-w-sm text-xs font-medium">
              When farmers enquire about your tractors or book workshop maintenance, activities will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {combinedActivity.map((activity) => (
              <Link
                key={activity.id}
                href={activity.href}
                className="bg-foreground/5 flex flex-col gap-3 rounded-2xl border border-[var(--border-subtle)] p-4 transition-all hover:border-[var(--color-brand-green)]/30 sm:flex-row sm:items-center sm:justify-between group"
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
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase ${activity.badgeColor}`}>
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
