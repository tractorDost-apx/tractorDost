'use client';

import React from 'react';
import {
  Tractor,
  CheckCircle2,
  PauseCircle,
  Eye,
  MessageSquareText,
  ShieldCheck,
} from 'lucide-react';

interface StatsProps {
  total: number;
  activeCount: number;
  pausedCount: number;
  totalViews: number;
  totalLeads: number;
}

export function DealerUsedStatsCards({
  total,
  activeCount,
  pausedCount,
  totalViews,
  totalLeads,
}: StatsProps) {
  const cards = [
    {
      label: 'Total Used Listings',
      value: total,
      icon: Tractor,
      color: 'text-lime-400',
      bg: 'bg-lime-400/10',
      border: 'border-lime-400/20',
      sub: 'All time inventory',
    },
    {
      label: 'Live on Marketplace',
      value: activeCount,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      border: 'border-emerald-400/20',
      sub: 'Active & visible to buyers',
    },
    {
      label: 'Paused / Drafts',
      value: pausedCount,
      icon: PauseCircle,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      border: 'border-amber-400/20',
      sub: 'Hidden from marketplace',
    },
    {
      label: 'Total Views',
      value: totalViews,
      icon: Eye,
      color: 'text-sky-400',
      bg: 'bg-sky-400/10',
      border: 'border-sky-400/20',
      sub: 'Buyer impressions',
    },
    {
      label: 'Buyer Enquiries',
      value: totalLeads,
      icon: MessageSquareText,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      border: 'border-purple-400/20',
      sub: 'Direct tractor leads',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`rounded-2xl border ${c.border} bg-[var(--background)] p-4 shadow-sm backdrop-blur-sm transition-all hover:translate-y-[-2px]`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted uppercase tracking-wider">{c.label}</span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${c.bg} ${c.color}`}>
                <Icon size={16} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-foreground">{c.value}</span>
            </div>
            <p className="mt-1 text-[11px] text-muted font-medium truncate">{c.sub}</p>
          </div>
        );
      })}
    </div>
  );
}
