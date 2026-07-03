'use client';

import React from 'react';
import { useAuth } from '@/store/AuthContext';
import { Tractor, Heart, Landmark, ArrowRight, Activity } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();

  const metrics = [
    { label: 'Active Listings', value: '2', icon: Tractor, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Saved Tractors', value: '14', icon: Heart, color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: 'Loan Applications', value: '1', icon: Landmark, color: 'text-lime-500', bg: 'bg-lime-500/10' },
  ];

  const recentActivity = [
    { title: 'Tractor Valuation Completed', desc: 'Mahindra 575 DI SP Plus', time: '2 hours ago' },
    { title: 'New Enquiry Received', desc: 'Someone asked about your Swaraj 744 FE', time: '1 day ago' },
    { title: 'Loan Application Updated', desc: 'Status changed to "Processing"', time: '2 days ago' },
  ];

  const getRoleDisplay = () => {
    if (user?.role?.name === 'SUPER_ADMIN' || user?.role?.name === 'ADMIN') return 'Admin';
    if (user?.role?.name === 'DEALER') return 'Dealer';
    return 'Customer';
  };

  return (
    <div className="flex flex-col h-full space-y-8 animate-fade-in">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-black text-foreground">
            Welcome back, {user?.fullName?.split(' ')[0] || 'User'}! 👋
          </h1>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20 uppercase tracking-wider">
            {getRoleDisplay()}
          </span>
        </div>
        <p className="text-muted font-medium">Here is an overview of your activity on TractorDost.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="bg-foreground/5 rounded-2xl p-5 border border-foreground/5 flex items-center justify-between">
              <div>
                <p className="text-muted text-sm font-bold mb-1">{m.label}</p>
                <p className="text-3xl font-black text-foreground">{m.value}</p>
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
            <Activity className="text-[var(--color-brand-green)]" size={24} /> Recent Activity
          </h2>
          <Link href="/dashboard/notifications" className="text-sm font-bold text-muted hover:text-[var(--color-brand-green)] flex items-center gap-1 transition-colors">
            View all <ArrowRight size={16} />
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
