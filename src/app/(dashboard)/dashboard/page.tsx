'use client';

import React from 'react';
import { useAuth } from '@/store/AuthContext';
import { Tractor, Heart, Landmark, ArrowRight, Activity } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();

  const metrics = [
    {
      label: 'Active Listings',
      value: '2',
      icon: Tractor,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Saved Tractors',
      value: '14',
      icon: Heart,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
    },
    {
      label: 'Loan Applications',
      value: '1',
      icon: Landmark,
      color: 'text-lime-500',
      bg: 'bg-lime-500/10',
    },
  ];

  const recentActivity = [
    { title: 'Tractor Valuation Completed', desc: 'Mahindra 575 DI SP Plus', time: '2 hours ago' },
    {
      title: 'New Enquiry Received',
      desc: 'Someone asked about your Swaraj 744 FE',
      time: '1 day ago',
    },
    {
      title: 'Loan Application Updated',
      desc: 'Status changed to "Processing"',
      time: '2 days ago',
    },
  ];

  const getRoleDisplay = () => {
    if (user?.role?.name === 'ADMIN') return 'Admin';
    if (user?.role?.name === 'DEALER') return 'Dealer';
    return 'Customer';
  };

  return (
    <div className="animate-fade-in flex h-full flex-col space-y-8">
      <div>
        <div className="mb-2 flex items-center gap-3">
          <h1 className="text-foreground text-3xl font-black">
            Welcome back, {user?.fullName?.split(' ')[0] || 'User'}! 👋
          </h1>
          <span className="rounded-full border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-3 py-1 text-xs font-black tracking-wider text-[var(--color-brand-green)] uppercase">
            {getRoleDisplay()}
          </span>
        </div>
        <p className="text-muted font-medium">
          Here is an overview of your activity on TractorDost.
        </p>
      </div>

      {/* Metrics Grid */}
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
                <p className="text-foreground text-3xl font-black">{m.value}</p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${m.bg} ${m.color}`}
              >
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="mt-6 flex-1">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Activity className="text-[var(--color-brand-green)]" size={24} /> Recent Activity
          </h2>
          <Link
            href="/dashboard/notifications"
            className="text-muted flex items-center gap-1 text-sm font-bold transition-colors hover:text-[var(--color-brand-green)]"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>

        <div className="space-y-4">
          {recentActivity.map((activity, idx) => (
            <div
              key={idx}
              className="hover:bg-foreground/5 flex cursor-pointer items-center gap-4 rounded-2xl border border-transparent p-4 transition-colors hover:border-[var(--border-subtle)]"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-green)]/20">
                <div className="h-3 w-3 rounded-full bg-[var(--color-brand-green)]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate text-base font-bold">{activity.title}</p>
                <p className="text-muted truncate text-sm font-medium">{activity.desc}</p>
              </div>
              <div className="text-muted text-sm font-bold whitespace-nowrap">{activity.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
