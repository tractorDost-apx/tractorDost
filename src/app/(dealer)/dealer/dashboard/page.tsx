'use client';

import React from 'react';
import { useAuth } from '@/store/AuthContext';
import { useDealerInventory } from '@/hooks/dealers/use-dealer-inventory';
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
  Wrench,
  BarChart3,
  UserCheck,
  PlusCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default function DealerDashboardPage() {
  const { user } = useAuth();
  const { stats, inventory, loadingData } = useDealerInventory();

  const totalInventoryCount = stats?.totalItems ?? (inventory?.length || 0);
  const inStockCount = stats?.availableItems ?? 0;
  const outOfStockCount = stats?.unavailableItems ?? 0;

  const metrics = [
    {
      label: 'Active Inventory',
      value: loadingData ? '...' : String(totalInventoryCount || '45'),
      subtext: `${inStockCount} In Stock · ${outOfStockCount} Out of Stock`,
      icon: Tractor,
      color: 'text-[var(--color-brand-green)]',
      bg: 'bg-[var(--color-brand-green)]/10 border-[var(--color-brand-green)]/20',
      href: '/dealer/inventory',
    },
    {
      label: 'Customer Leads',
      value: '18',
      subtext: '4 new enquiries today',
      icon: MessageSquareText,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10 border-amber-500/20',
      href: '/dealer/leads',
    },
    {
      label: 'Used Listings',
      value: '12',
      subtext: '3 certified verified',
      icon: Store,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10 border-blue-500/20',
      href: '/dealer/used-listings',
    },
    {
      label: 'Inspections & Services',
      value: '8',
      subtext: '100% compliance rate',
      icon: FileCheck,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      href: '/dealer/services',
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
      href: '/dealer/used-leads',
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

  const recentActivity = [
    {
      title: 'New Buyer Enquiry on Swaraj 744 FE',
      desc: 'Ramesh Patil requested a call back for tractor pricing & EMI financing options.',
      time: '20 mins ago',
      badge: 'Hot Lead',
      badgeColor: 'text-amber-500 border-amber-500/20 bg-amber-500/10',
    },
    {
      title: '120-Point Inspection Certified',
      desc: 'Mahindra 575 DI SP Plus successfully passed quality audit inspection.',
      time: '2 hours ago',
      badge: 'Certified',
      badgeColor: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10',
    },
    {
      title: 'Dealership Boost Renewed',
      desc: 'Featured listing boost for Eicher 380 Super DI active for next 30 days.',
      time: '1 day ago',
      badge: 'Promoted',
      badgeColor: 'text-blue-500 border-blue-500/20 bg-blue-500/10',
    },
    {
      title: 'New Service Appointment Booked',
      desc: 'Scheduled 500-hour periodic maintenance check for John Deere 5050D.',
      time: '2 days ago',
      badge: 'Service',
      badgeColor: 'text-purple-500 border-purple-500/20 bg-purple-500/10',
    },
  ];

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
                Welcome back, {user?.fullName?.split(' ')[0] || 'Dealer'}! 👋
              </h1>
              <span className="rounded-full border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-3 py-1 text-xs font-black tracking-wider text-[var(--color-brand-green)] uppercase">
                Dealership Hub
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
                  <span className="flex items-center text-xs font-bold text-[var(--color-brand-green)]">
                    <TrendingUp size={12} className="mr-0.5" /> +8%
                  </span>
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

        <div className="space-y-3">
          {recentActivity.map((activity, idx) => (
            <div
              key={idx}
              className="bg-foreground/5 flex flex-col gap-3 rounded-2xl border border-[var(--border-subtle)] p-4 transition-all hover:border-[var(--color-brand-green)]/30 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
                  <div className="h-2 w-2 rounded-full bg-[var(--color-brand-green)] animate-pulse" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-foreground text-sm font-bold">{activity.title}</p>
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
