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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-foreground/5 animate-pulse space-y-3 rounded-2xl border border-[var(--border-subtle)] p-5"
          >
            <div className="flex items-center justify-between">
              <div className="bg-foreground/10 h-4 w-1/2 rounded" />
              <div className="bg-foreground/10 h-10 w-10 rounded-xl" />
            </div>
            <div className="bg-foreground/10 h-8 w-1/3 rounded" />
            <div className="bg-foreground/5 h-3 w-3/4 rounded" />
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-foreground/5 flex items-center justify-between gap-4 rounded-2xl border border-[var(--border-subtle)] p-5"
          >
            <div className="min-w-0 flex-1">
              <p className="text-muted mb-1 truncate text-xs font-bold tracking-wider uppercase">
                {card.title}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-foreground text-3xl font-black tracking-tight">
                  {card.value}
                </span>
                <span
                  className={`rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${card.bgClass} ${card.colorClass}`}
                >
                  {card.badge}
                </span>
              </div>
            </div>

            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${card.bgClass} ${card.colorClass} shrink-0`}
            >
              <Icon size={24} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
