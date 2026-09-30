'use client';

import React from 'react';
import { useAuth } from '@/store/AuthContext';
import {
  Tractor,
  MessageSquareText,
  FileCheck,
  ArrowRight,
  Activity,
  TrendingUp,
  LayoutDashboard,
} from 'lucide-react';
import Link from 'next/link';

export default function DealerDashboardPage() {
  const { user } = useAuth();

  const metrics = [
    {
      label: 'Active Inventory',
      value: '45',
      icon: Tractor,
      color: 'text-[var(--color-brand-green)]',
      bg: 'bg-[var(--color-brand-green)]/10 border-[var(--color-brand-green)]/20',
    },
    {
      label: 'New Enquiries',
      value: '12',
      icon: MessageSquareText,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      label: 'Inspections Done',
      value: '8',
      icon: FileCheck,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  const recentActivity = [
    {
      title: 'New Enquiry on Swaraj 744 FE',
      desc: 'Ramesh Patil requested a call back for tractor pricing & EMI financing options.',
      time: '20 mins ago',
    },
    {
      title: 'Inspection Certified',
      desc: 'Mahindra 575 DI SP Plus successfully passed 120-point quality audit inspection.',
      time: '2 hours ago',
    },
    {
      title: 'Listing Boost Active',
      desc: 'Featured listing boost for Eicher 380 was renewed for 30 days.',
      time: '1 day ago',
    },
  ];

  return (
    <div className="animate-fade-in flex h-full flex-col space-y-8 pb-8">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="shrink-0 rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 p-2.5 text-[var(--color-brand-green)]">
            <LayoutDashboard size={26} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                Welcome back, {user?.fullName?.split(' ')[0] || 'Dealer'}! 👋
              </h1>
              <span className="rounded-full border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-3 py-1 text-xs font-black tracking-wider text-[var(--color-brand-green)] uppercase">
                Dealership
              </span>
            </div>
            <p className="text-muted mt-0.5 text-xs font-bold sm:text-sm">
              Here is an overview of your active inventory, lead enquiries, and operational updates.
            </p>
          </div>
        </div>

        <Link
          href="/dealer/inventory"
          className="flex shrink-0 items-center gap-2 self-start rounded-xl bg-[var(--color-brand-green)] px-5 py-2.5 text-xs font-bold tracking-wider text-white uppercase shadow-md transition-all hover:opacity-90 sm:self-auto"
        >
          <Tractor size={16} /> Manage Inventory
        </Link>
      </div>

      {/* Admin Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className="bg-foreground/5 flex items-center justify-between rounded-2xl border border-[var(--border-subtle)] p-5"
            >
              <div>
                <p className="text-muted mb-1 text-sm font-bold">{m.label}</p>
                <div className="flex items-end gap-2">
                  <p className="text-foreground text-3xl font-black">{m.value}</p>
                  <span className="mb-1 flex items-center text-xs font-bold text-[var(--color-brand-green)]">
                    <TrendingUp size={12} className="mr-0.5" /> +5%
                  </span>
                </div>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${m.bg} ${m.color}`}
              >
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Dealership Activity Timeline */}
      <div className="mt-6 flex-1">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Activity className="text-[var(--color-brand-green)]" size={24} /> Recent Dealership
            Activity
          </h2>
          <Link
            href="/dealer/leads"
            className="text-muted flex items-center gap-1 text-sm font-bold transition-colors hover:text-[var(--color-brand-green)]"
          >
            View all leads <ArrowRight size={16} />
          </Link>
        </div>

        <div className="space-y-3">
          {recentActivity.map((activity, idx) => (
            <div
              key={idx}
              className="hover:bg-foreground/5 flex cursor-pointer items-start gap-4 rounded-2xl border border-transparent p-4 transition-colors hover:border-[var(--border-subtle)] sm:items-center"
            >
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] sm:mt-0">
                <div className="h-2.5 w-2.5 rounded-full bg-[var(--color-brand-green)]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate text-base font-bold">{activity.title}</p>
                <p className="text-muted mt-0.5 truncate text-sm font-medium">{activity.desc}</p>
              </div>
              <div className="text-muted text-sm font-bold whitespace-nowrap">{activity.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
