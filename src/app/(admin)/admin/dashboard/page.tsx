'use client';

import React from 'react';
import { useAuth } from '@/store/AuthContext';
import { Users, Tractor, Store, ArrowRight, Activity, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { user } = useAuth();

  const metrics = [
    { label: 'Total Users', value: '12,450', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Active Dealers', value: '342', icon: Store, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Tractors Listed', value: '4,891', icon: Tractor, color: 'text-lime-500', bg: 'bg-lime-500/10' },
  ];

  const recentActivity = [
    { title: 'New Dealership Registered', desc: 'Patil Tractors, Pune', time: '10 mins ago' },
    { title: 'System Alert', desc: 'High traffic detected on valuation tool', time: '1 hour ago' },
    { title: 'Report Generated', desc: 'Monthly Sales Report completed', time: '3 hours ago' },
  ];

  return (
    <div className="flex flex-col h-full space-y-8 animate-fade-in">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-black text-foreground">
            Welcome back, {user?.fullName?.split(' ')[0] || 'Admin'}! 👋
          </h1>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20 uppercase tracking-wider">
            {user?.role?.name === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
          </span>
        </div>
        <p className="text-muted font-medium">Here is an overview of the platform's performance.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="bg-foreground/5 rounded-2xl p-5 border border-foreground/5 flex items-center justify-between">
              <div>
                <p className="text-muted text-sm font-bold mb-1">{m.label}</p>
                <div className="flex items-end gap-2">
                  <p className="text-3xl font-black text-foreground">{m.value}</p>
                  <span className="flex items-center text-xs font-bold text-lime-500 mb-1">
                    <TrendingUp size={12} className="mr-0.5" /> +12%
                  </span>
                </div>
              </div>
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${m.bg} ${m.color}`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="flex-1 mt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Activity className="text-[var(--color-brand-green)]" size={24} /> Platform Activity
          </h2>
          <Link href="/admin/reports" className="text-sm font-bold text-muted hover:text-[var(--color-brand-green)] flex items-center gap-1 transition-colors">
            View all logs <ArrowRight size={16} />
          </Link>
        </div>
        
        <div className="space-y-4">
          {recentActivity.map((activity, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-foreground/5 transition-colors border border-transparent hover:border-foreground/10 cursor-pointer">
              <div className="h-10 w-10 rounded-full bg-[var(--color-brand-green)]/20 flex items-center justify-center flex-shrink-0">
                <div className="h-3 w-3 rounded-full bg-[var(--color-brand-green)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-foreground truncate">{activity.title}</p>
                <p className="text-sm text-muted font-medium truncate">{activity.desc}</p>
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
