'use client';

import React from 'react';
import { useAuth } from '@/store/AuthContext';
import { Users, Tractor, Store, ArrowRight, Activity, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { user } = useAuth();

  const metrics = [
    {
      label: 'Total Users',
      value: '12,450',
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Active Dealers',
      value: '342',
      icon: Store,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Tractors Listed',
      value: '4,891',
      icon: Tractor,
      color: 'text-lime-500',
      bg: 'bg-lime-500/10',
    },
  ];

  const recentActivity = [
    { title: 'New Dealership Registered', desc: 'Patil Tractors, Pune', time: '10 mins ago' },
    { title: 'System Alert', desc: 'High traffic detected on valuation tool', time: '1 hour ago' },
    { title: 'Report Generated', desc: 'Monthly Sales Report completed', time: '3 hours ago' },
  ];

  return (
    <div className="animate-fade-in flex h-full flex-col space-y-8">
      <div>
        <div className="mb-2 flex items-center gap-3">
          <h1 className="text-foreground text-3xl font-black">
            Welcome back, {user?.fullName?.split(' ')[0] || 'Admin'}! 👋
          </h1>
          <span className="rounded-full border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-3 py-1 text-xs font-black tracking-wider text-[var(--color-brand-green)] uppercase">
            {user?.role?.name === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
          </span>
        </div>
        <p className="text-muted font-medium">Here is an overview of the platform's performance.</p>
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
                <div className="flex items-end gap-2">
                  <p className="text-foreground text-3xl font-black">{m.value}</p>
                  <span className="mb-1 flex items-center text-xs font-bold text-lime-500">
                    <TrendingUp size={12} className="mr-0.5" /> +12%
                  </span>
                </div>
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
            <Activity className="text-[var(--color-brand-green)]" size={24} /> Platform Activity
          </h2>
          <Link
            href="/admin/reports"
            className="text-muted flex items-center gap-1 text-sm font-bold transition-colors hover:text-[var(--color-brand-green)]"
          >
            View all logs <ArrowRight size={16} />
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
