import React from 'react';
import { Building2, CheckCircle2, XCircle } from 'lucide-react';
import type { DepartmentStats } from '@/hooks/hr/use-departments';

interface DepartmentStatsCardsProps {
  stats: DepartmentStats | null;
  statsLoading: boolean;
  statsError: string | null;
  activeFilter: boolean | undefined;
  onFilterChange: (value: boolean | undefined) => void;
}

interface StatCardProps {
  label: string;
  value: number | null;
  loading: boolean;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  accent: string;
}

function StatCard({ label, value, loading, icon, active, onClick, accent }: StatCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`glass-panel flex flex-1 cursor-pointer items-center gap-3 rounded-2xl p-4 text-left transition-all hover:border-lime-400/30 ${
        active ? 'border-lime-400/40 bg-lime-400/5' : ''
      }`}
    >
      <div className={`rounded-xl border p-2.5 ${accent}`}>{icon}</div>
      <div>
        <p className="text-muted text-xs font-bold uppercase tracking-wider">{label}</p>
        {loading && value === null ? (
          <div className="bg-foreground/10 mt-1 h-6 w-12 animate-pulse rounded" />
        ) : (
          <p className="text-foreground text-xl font-black">
            {value?.toLocaleString('en-IN') ?? '—'}
          </p>
        )}
      </div>
    </button>
  );
}

export function DepartmentStatsCards({
  stats,
  statsLoading,
  statsError,
  activeFilter,
  onFilterChange,
}: DepartmentStatsCardsProps) {
  if (statsError && !stats) return null;

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <StatCard
        label="Total"
        value={stats?.total ?? null}
        loading={statsLoading}
        icon={<Building2 size={20} className="text-lime-400" />}
        accent="border-lime-400/20 bg-lime-400/10"
        active={activeFilter === undefined}
        onClick={() => onFilterChange(undefined)}
      />
      <StatCard
        label="Active"
        value={stats?.active ?? null}
        loading={statsLoading}
        icon={<CheckCircle2 size={20} className="text-emerald-400" />}
        accent="border-emerald-400/20 bg-emerald-400/10"
        active={activeFilter === true}
        onClick={() => onFilterChange(activeFilter === true ? undefined : true)}
      />
      <StatCard
        label="Inactive"
        value={stats?.inactive ?? null}
        loading={statsLoading}
        icon={<XCircle size={20} className="text-rose-400" />}
        accent="border-rose-400/20 bg-rose-400/10"
        active={activeFilter === false}
        onClick={() => onFilterChange(activeFilter === false ? undefined : false)}
      />
    </div>
  );
}
