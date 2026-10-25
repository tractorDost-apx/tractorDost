import React from 'react';
import { Building2, Plus, RefreshCw } from 'lucide-react';

interface DepartmentHeaderProps {
  totalCount: number | null;
  loading: boolean;
  onRefresh: () => void;
  onCreateOpen: () => void;
}

export function DepartmentHeader({
  totalCount,
  loading,
  onRefresh,
  onCreateOpen,
}: DepartmentHeaderProps) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-lime-400/20 bg-lime-400/10 p-2.5 text-lime-400">
          <Building2 size={26} />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
              Departments
            </h1>
            {totalCount !== null && (
              <span className="bg-foreground/5 rounded-lg border border-[var(--border-subtle)] px-2 py-0.5 text-xs font-black text-lime-400">
                {totalCount.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          <p className="text-muted mt-0.5 text-sm font-bold">
            Create and manage company departments for employee organisation.
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="glass-panel text-muted hover:text-foreground flex items-center justify-center rounded-xl p-2.5 transition-all hover:border-lime-400/30 disabled:opacity-50"
          title="Refresh data"
          aria-label="Refresh data"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin text-lime-400' : ''} />
        </button>

        <button
          type="button"
          onClick={onCreateOpen}
          className="flex items-center gap-2 rounded-xl bg-lime-400 px-5 py-2.5 text-sm font-black tracking-wider text-black uppercase shadow-lg shadow-lime-400/20 transition-all hover:bg-lime-300"
        >
          <Plus size={18} className="stroke-[3]" />
          Add Department
        </button>
      </div>
    </div>
  );
}
