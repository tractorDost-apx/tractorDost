import React from 'react';
import {
  Users,
  Sparkles,
  UserX,
  ClockAlert,
  Trophy,
  Percent,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { LeadStats } from '@/lib/api/leads';

interface LeadStatsCardsProps {
  stats: LeadStats | null;
  loading: boolean;
  onRefresh?: () => void;
}

export function LeadStatsCards({ stats, loading, onRefresh }: LeadStatsCardsProps) {
  if (loading && !stats) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="glass-panel flex flex-col gap-2 rounded-2xl p-4 border border-[var(--border-subtle)] animate-pulse"
          >
            <div className="h-4 w-20 rounded bg-foreground/10" />
            <div className="h-7 w-14 rounded bg-foreground/10" />
            <div className="h-3 w-28 rounded bg-foreground/5" />
          </div>
        ))}
      </div>
    );
  }

  const total = stats?.total ?? 0;
  const newLeads = stats?.byStatus?.NEW ?? 0;
  const unassigned = stats?.unassignedCount ?? 0;
  const followupDue = stats?.followupDueCount ?? 0;
  const converted = stats?.byStatus?.CONVERTED ?? 0;
  const conversionRate = stats?.conversionRate ?? 0;

  const cards = [
    {
      title: 'Total Leads',
      value: total.toLocaleString('en-IN'),
      subtitle: `${stats?.todayCount ?? 0} received today`,
      icon: Users,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10 border-sky-500/20',
      trendColor: 'text-sky-400',
    },
    {
      title: 'New Leads',
      value: newLeads.toLocaleString('en-IN'),
      subtitle: 'Awaiting first contact',
      icon: Sparkles,
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/10 border-teal-500/20',
      trendColor: 'text-teal-400',
    },
    {
      title: 'Unassigned Leads',
      value: unassigned.toLocaleString('en-IN'),
      subtitle: unassigned > 0 ? 'Requires agent allocation' : 'All leads assigned',
      icon: UserX,
      color: unassigned > 0 ? 'text-amber-400' : 'text-muted',
      bgColor: unassigned > 0 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-foreground/5 border-[var(--border-subtle)]',
      trendColor: unassigned > 0 ? 'text-amber-400 font-bold' : 'text-muted',
    },
    {
      title: 'Follow-ups Due',
      value: followupDue.toLocaleString('en-IN'),
      subtitle: followupDue > 0 ? 'Action required today' : 'Up to date',
      icon: ClockAlert,
      color: followupDue > 0 ? 'text-rose-400' : 'text-muted',
      bgColor: followupDue > 0 ? 'bg-rose-500/10 border-rose-500/20' : 'bg-foreground/5 border-[var(--border-subtle)]',
      trendColor: followupDue > 0 ? 'text-rose-400 font-bold' : 'text-muted',
    },
    {
      title: 'Converted Leads',
      value: converted.toLocaleString('en-IN'),
      subtitle: `${stats?.highIntentCount ?? 0} high-intent`,
      icon: Trophy,
      color: 'text-lime-400',
      bgColor: 'bg-lime-500/10 border-lime-500/20',
      trendColor: 'text-lime-400',
    },
    {
      title: 'Conversion Rate',
      value: `${conversionRate}%`,
      subtitle: `${converted} of ${total} closed`,
      icon: Percent,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10 border-orange-500/20',
      trendColor: 'text-orange-400',
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-[#4a7635]" />
          <h2 className="text-xs font-black uppercase tracking-wider text-muted">
            Pipeline Snapshot & KPI Performance
          </h2>
        </div>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-foreground/5 px-2.5 py-1 text-[11px] font-bold text-muted transition-colors hover:bg-foreground/10 hover:text-foreground disabled:opacity-50"
            title="Refresh statistics"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            <span>Sync Stats</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="glass-panel group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--border-subtle)] p-4 transition-all duration-300 hover:border-foreground/20 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-black uppercase tracking-tight text-muted">
                  {card.title}
                </span>
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border ${card.bgColor}`}
                >
                  <Icon size={14} className={card.color} />
                </div>
              </div>

              <div className="mt-2 flex flex-col">
                <div className="text-2xl font-black tracking-tight text-foreground">
                  {card.value}
                </div>
                <div className={`mt-0.5 text-[10px] truncate font-medium ${card.trendColor}`}>
                  {card.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
