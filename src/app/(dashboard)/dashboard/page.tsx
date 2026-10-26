'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/store/AuthContext';
import { useMyUsedListings } from '@/hooks/used-listings/use-used-listings';
import { useMyEnquiries } from '@/hooks/leads/use-my-enquiries';
import { serviceBookingAPI, ServiceBookingItem } from '@/lib/api/serviceBookings';
import { formatRelativeTime } from '@/lib/utils/format-date';
import {
  Tractor,
  MessageSquareText,
  Wrench,
  ArrowRight,
  Activity,
  PlusCircle,
  Clock,
  Sparkles,
  Loader2,
  Calendar,
  Landmark,
  Calculator,
  ArrowRightLeft,
  Inbox,
  Heart,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();

  // 1. My Used Listings
  const { data: myListingsData, loading: loadingListings } = useMyUsedListings({ page: 1, limit: 10 });

  // 2. My Sent Enquiries
  const { data: myEnquiriesData, loading: loadingEnquiries } = useMyEnquiries({ page: 1, limit: 10 });

  // 3. Service / Repair Bookings
  const [serviceBookings, setServiceBookings] = useState<ServiceBookingItem[]>([]);
  const [loadingServices, setLoadingServices] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadBookings() {
      try {
        const res = await serviceBookingAPI.getMyBookings();
        if (isMounted && res.success && res.data?.bookings) {
          setServiceBookings(res.data.bookings);
        }
      } catch (err) {
        console.error('Failed to fetch user service bookings', err);
      } finally {
        if (isMounted) setLoadingServices(false);
      }
    }
    loadBookings();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute Metrics
  const totalMyListings = myListingsData?.meta?.total ?? (myListingsData?.data?.length || 0);
  const activeListings = (myListingsData?.data ?? []).filter(
    (l) => l.listingStatus === 'ACTIVE' || l.status === 'ACTIVE'
  ).length;

  const totalEnquiries = myEnquiriesData?.meta?.total ?? (myEnquiriesData?.data?.length || 0);
  const pendingEnquiries = (myEnquiriesData?.data ?? []).filter(
    (e) => e.status === 'NEW' || e.status === 'ATTEMPTED'
  ).length;

  const totalServiceBookings = serviceBookings.length;
  const activeServices = serviceBookings.filter(
    (b) => b.status === 'SCHEDULED' || b.status === 'IN_PROGRESS'
  ).length;

  const metrics = [
    {
      label: 'My Used Listings',
      value: loadingListings ? '...' : String(totalMyListings),
      subtext: loadingListings
        ? 'Updating listings...'
        : totalMyListings === 0
          ? '0 tractors listed'
          : `${activeListings} Active on Market`,
      icon: Tractor,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10 border-blue-500/20',
      href: '/dashboard/my-listings',
      loading: loadingListings,
    },
    {
      label: 'Enquiries Sent',
      value: loadingEnquiries ? '...' : String(totalEnquiries),
      subtext: loadingEnquiries
        ? 'Updating enquiries...'
        : totalEnquiries === 0
          ? 'No active enquiries'
          : `${pendingEnquiries} awaiting response`,
      icon: MessageSquareText,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10 border-amber-500/20',
      href: '/dashboard/my-enquiries',
      loading: loadingEnquiries,
    },
    {
      label: 'Tractor Repair Bookings',
      value: loadingServices ? '...' : String(totalServiceBookings),
      subtext: loadingServices
        ? 'Updating repairs...'
        : totalServiceBookings === 0
          ? 'No service bookings'
          : `${activeServices} scheduled / in progress`,
      icon: Wrench,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      href: '/dashboard/tractor-repair',
      loading: loadingServices,
    },
  ];

  // Quick Action Shortcuts Hub
  const quickActions = [
    {
      title: 'Sell Used Tractor',
      desc: 'Free listing to thousands of verified buyers',
      icon: PlusCircle,
      href: '/sell-used-tractor',
      color: 'text-[var(--color-brand-green)]',
      bg: 'bg-[var(--color-brand-green)]/10',
    },
    {
      title: 'Book Doorstep Repair',
      desc: 'Expert mechanics at your farm / home',
      icon: Wrench,
      href: '/dashboard/tractor-repair',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'TrueVal Price Check',
      desc: 'Get accurate resale market valuation',
      icon: Calculator,
      href: '/used-tractor-valuation',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      title: 'Compare Tractors',
      desc: 'Side-by-side specs, price & mileage',
      icon: ArrowRightLeft,
      href: '/compare',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      title: 'Received Enquiries',
      desc: 'View buyers interested in your tractors',
      icon: Inbox,
      href: '/dashboard/listing-enquiries',
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
    },
    {
      title: 'Tractor Loans & EMI',
      desc: 'Fast financing & EMI calculations',
      icon: Landmark,
      href: '/dashboard/loans',
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
    },
  ];

  // Combined Activity Feed
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

    // Enquiries
    (myEnquiriesData?.data ?? []).forEach((enq) => {
      const tractorTitle = `${enq.listing?.tractorBrand ? `${enq.listing.tractorBrand} ` : ''}${enq.listing?.tractorModel || 'Tractor'}`.trim();
      items.push({
        id: `enq-${enq.id}`,
        title: `Enquiry on ${tractorTitle}`,
        desc: `Status: ${enq.status.replace(/_/g, ' ')} · Location: ${enq.city || 'Maharashtra'}`,
        time: formatRelativeTime(enq.createdAt),
        date: new Date(enq.createdAt),
        badge: enq.status.replace(/_/g, ' '),
        badgeColor:
          enq.status === 'NEW'
            ? 'text-amber-500 border-amber-500/20 bg-amber-500/10'
            : 'text-blue-500 border-blue-500/20 bg-blue-500/10',
        href: '/dashboard/my-enquiries',
      });
    });

    // Services
    serviceBookings.forEach((b) => {
      items.push({
        id: `service-${b.bookingId}`,
        title: `Repair: ${b.tractorBrand} ${b.tractorModel}`,
        desc: `${b.serviceType.replace(/_/g, ' ')} · ${b.serviceCenterName || 'Doorstep Service'}`,
        time: formatRelativeTime(b.createdAt),
        date: new Date(b.createdAt),
        badge: b.status.replace(/_/g, ' '),
        badgeColor:
          b.status === 'COMPLETED'
            ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10'
            : 'text-purple-500 border-purple-500/20 bg-purple-500/10',
        href: '/dashboard/tractor-repair',
      });
    });

    // Listings
    (myListingsData?.data ?? []).forEach((l) => {
      const listingTitle = `${l.tractorBrand || ''} ${l.tractorModel || ''}`.trim() || 'Tractor Listing';
      const priceVal = l.askingPrice ?? l.price;
      const formattedPrice = priceVal ? `₹${Number(priceVal).toLocaleString('en-IN')}` : 'N/A';
      items.push({
        id: `listing-${l.id}`,
        title: `Listing: ${listingTitle}`,
        desc: `Listed for ${formattedPrice} · ${l.district || 'Maharashtra'}`,
        time: formatRelativeTime(l.createdAt),
        date: new Date(l.createdAt),
        badge: (l.listingStatus || l.status || 'PENDING').replace(/_/g, ' '),
        badgeColor:
          (l.listingStatus || l.status) === 'ACTIVE'
            ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10'
            : 'text-zinc-400 border-zinc-500/20 bg-zinc-500/10',
        href: '/dashboard/my-listings',
      });
    });

    items.sort((a, b) => b.date.getTime() - a.date.getTime());
    return items.slice(0, 6);
  }, [myEnquiriesData, serviceBookings, myListingsData]);

  const isActivityLoading = loadingListings && loadingEnquiries && loadingServices;

  const getRoleDisplay = () => {
    if (user?.role?.name === 'ADMIN') return 'Admin';
    if (user?.role?.name === 'DEALER') return 'Dealer';
    if (user?.role?.name === 'AGENT') return 'Agent';
    return 'Customer';
  };

  return (
    <div className="animate-fade-in flex h-full flex-col space-y-8 pb-8">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h1 className="text-foreground text-2xl font-black sm:text-3xl">
              Welcome back, {user?.fullName?.split(' ')[0] || 'Farmer'}! 👋
            </h1>
            <span className="rounded-full border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-3 py-1 text-xs font-black tracking-wider text-[var(--color-brand-green)] uppercase">
              {getRoleDisplay()}
            </span>
          </div>
          <p className="text-muted text-xs font-medium sm:text-sm">
            Here is an overview of your tractor activities, listings, and service bookings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/sell-used-tractor"
            className="flex shrink-0 items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-5 py-2.5 text-xs font-black tracking-wider text-white uppercase shadow-md transition-all hover:opacity-90 active:scale-95"
          >
            <PlusCircle size={16} /> Sell Tractor
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                  {m.loading && <Loader2 size={16} className="text-muted animate-spin" />}
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

      {/* Quick Access Services Hub */}
      <div>
        <h2 className="text-foreground mb-4 flex items-center gap-2 text-lg font-black tracking-tight">
          <Sparkles className="text-[var(--color-brand-green)]" size={20} /> Quick Services Hub
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link
                key={idx}
                href={action.href}
                className="bg-foreground/5 group flex items-start gap-4 rounded-2xl border border-[var(--border-subtle)] p-4 transition-all hover:border-[var(--color-brand-green)]/40 hover:shadow-sm"
              >
                <div
                  className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${action.bg} ${action.color}`}
                >
                  <Icon size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-foreground group-hover:text-[var(--color-brand-green)] text-sm font-black transition-colors">
                      {action.title}
                    </p>
                    <ChevronRight size={14} className="text-muted group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-muted mt-0.5 line-clamp-1 text-xs font-medium">
                    {action.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="flex-1">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-foreground flex items-center gap-2 text-lg font-black tracking-tight">
            <Activity className="text-[var(--color-brand-green)]" size={20} /> Recent Activity
          </h2>
          <Link
            href="/dashboard/my-enquiries"
            className="text-muted hover:text-[var(--color-brand-green)] flex items-center gap-1 text-xs font-bold transition-colors"
          >
            View all enquiries <ArrowRight size={14} />
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
            <p className="text-foreground text-sm font-bold">No Activity Yet</p>
            <p className="text-muted mt-1 max-w-sm text-xs font-medium">
              Explore used tractors, book doorstep tractor maintenance, or post a tractor for sale to see activities here.
            </p>
            <div className="mt-4 flex gap-3">
              <Link
                href="/used-tractors"
                className="rounded-xl border border-[var(--border-subtle)] bg-background px-4 py-2 text-xs font-bold text-foreground transition-colors hover:border-[var(--color-brand-green)]"
              >
                Browse Tractors
              </Link>
              <Link
                href="/dashboard/tractor-repair"
                className="rounded-xl bg-[var(--color-brand-green)] px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"
              >
                Book Repair
              </Link>
            </div>
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
