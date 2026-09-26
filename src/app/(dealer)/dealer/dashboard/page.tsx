'use client';

import React from 'react';
import { useAuth } from '@/store/AuthContext';
import { Tractor, MessageSquareText, FileCheck, ArrowRight, Activity, TrendingUp, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default function DealerDashboardPage() {
  const { user } = useAuth();

  const metrics = [
    { label: 'Active Inventory', value: '45', icon: Tractor, color: 'text-[var(--color-brand-green)]', bg: 'bg-[var(--color-brand-green)]/10 border-[var(--color-brand-green)]/20' },
    { label: 'New Enquiries', value: '12', icon: MessageSquareText, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'Inspections Done', value: '8', icon: FileCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  ];

  const recentActivity = [
    { title: 'New Enquiry on Swaraj 744 FE', desc: 'Ramesh Patil requested a call back for tractor pricing & EMI financing options.', time: '20 mins ago' },
    { title: 'Inspection Certified', desc: 'Mahindra 575 DI SP Plus successfully passed 120-point quality audit inspection.', time: '2 hours ago' },
    { title: 'Listing Boost Active', desc: 'Featured listing boost for Eicher 380 was renewed for 30 days.', time: '1 day ago' },
  ];

  return (
    <div className="flex flex-col h-full space-y-8 animate-fade-in pb-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20 shrink-0">
            <LayoutDashboard size={26} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                Welcome back, {user?.fullName?.split(' ')[0] || 'Dealer'}! 👋
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20 uppercase tracking-wider">
                Dealership
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-muted mt-0.5">
              Here is an overview of your active inventory, lead enquiries, and operational updates.
            </p>
          </div>
        </div>

        <Link
          href="/dealer/inventory"
          className="px-5 py-2.5 bg-[var(--color-brand-green)] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-90 transition-all shadow-md flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <Tractor size={16} /> Manage Inventory
        </Link>
      </div>

      {/* Admin Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="bg-foreground/5 rounded-2xl p-5 border border-[var(--border-subtle)] flex items-center justify-between">
              <div>
                <p className="text-muted text-sm font-bold mb-1">{m.label}</p>
                <div className="flex items-end gap-2">
                  <p className="text-3xl font-black text-foreground">{m.value}</p>
                  <span className="flex items-center text-xs font-bold text-[var(--color-brand-green)] mb-1">
                    <TrendingUp size={12} className="mr-0.5" /> +5%
                  </span>
                </div>
              </div>
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${m.bg} ${m.color}`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Dealership Activity Timeline */}
      <div className="flex-1 mt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Activity className="text-[var(--color-brand-green)]" size={24} /> Recent Dealership Activity
          </h2>
          <Link href="/dealer/leads" className="text-sm font-bold text-muted hover:text-[var(--color-brand-green)] flex items-center gap-1 transition-colors">
            View all leads <ArrowRight size={16} />
          </Link>
        </div>
        
        <div className="space-y-3">
          {recentActivity.map((activity, idx) => (
            <div key={idx} className="flex items-start sm:items-center gap-4 p-4 rounded-2xl hover:bg-foreground/5 transition-colors border border-transparent hover:border-[var(--border-subtle)] cursor-pointer">
              <div className="h-10 w-10 rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <div className="h-2.5 w-2.5 rounded-full bg-[var(--color-brand-green)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-foreground truncate">{activity.title}</p>
                <p className="text-sm text-muted font-medium truncate mt-0.5">{activity.desc}</p>
              </div>
              <div className="text-sm font-bold text-muted whitespace-nowrap">
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
