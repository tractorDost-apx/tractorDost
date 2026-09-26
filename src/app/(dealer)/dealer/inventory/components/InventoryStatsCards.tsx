'use client';

import React from 'react';
import { DealerInventoryStats } from '@/types/models/dealerInventory';
import { Tractor, PackageCheck, AlertTriangle, CalendarClock } from 'lucide-react';

interface InventoryStatsCardsProps {
  stats: DealerInventoryStats | null;
  loading: boolean;
}

export function InventoryStatsCards({ stats, loading }: InventoryStatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 space-y-3 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 bg-foreground/10 rounded w-1/2" />
              <div className="h-10 w-10 rounded-xl bg-foreground/10" />
            </div>
            <div className="h-8 bg-foreground/10 rounded w-1/3" />
            <div className="h-3 bg-foreground/5 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const cards = [
    {
      title: 'Total Stock Units',
      value: stats.totalStock,
      badge: `${stats.totalItems} Unique Models`,
      icon: Tractor,
      colorClass: 'text-[var(--color-brand-green)]',
      bgClass: 'bg-[var(--color-brand-green)]/10 border-[var(--color-brand-green)]/20',
    },
    {
      title: 'Available Models',
      value: stats.availableItems,
      badge: `${stats.availabilityRate} Rate`,
      icon: PackageCheck,
      colorClass: 'text-emerald-500',
      bgClass: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Unavailable / Off-Market',
      value: stats.unavailableItems,
      badge: 'Needs Attention',
      icon: AlertTriangle,
      colorClass: 'text-amber-500',
      bgClass: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Incoming Stock',
      value: stats.expectedArrivals,
      badge: 'Future Delivery',
      icon: CalendarClock,
      colorClass: 'text-blue-500',
      bgClass: 'bg-blue-500/10 border-blue-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-foreground/5 rounded-2xl p-5 border border-[var(--border-subtle)] flex items-center justify-between gap-4"
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-muted uppercase tracking-wider truncate mb-1">
                {card.title}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-foreground tracking-tight">
                  {card.value}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${card.bgClass} ${card.colorClass}`}>
                  {card.badge}
                </span>
              </div>
            </div>

            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${card.bgClass} ${card.colorClass} shrink-0`}>
              <Icon size={24} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
