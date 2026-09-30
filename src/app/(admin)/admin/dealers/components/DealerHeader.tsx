import React from 'react';
import { Store, Plus, RefreshCw, CheckCircle2, Clock, Award } from 'lucide-react';

interface DealerHeaderProps {
  totalCount: number;
  verifiedCount?: number;
  pendingCount?: number;
  certifiedCount?: number;
  loading: boolean;
  onRefresh: () => void;
  onCreateOpen: () => void;
}

export function DealerHeader({
  totalCount,
  verifiedCount = 0,
  pendingCount = 0,
  certifiedCount = 0,
  loading,
  onRefresh,
  onCreateOpen,
}: DealerHeaderProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Top Title & Actions */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-lime-400/20 bg-lime-400/10 p-2.5 text-lime-400">
              <Store size={26} />
            </div>
            <div>
              <h1 className="text-foreground text-3xl font-black tracking-tight">Dealer Network</h1>
              <p className="text-muted mt-0.5 text-sm font-bold">
                Master management of tractor dealerships, verifications, and regional operations.
              </p>
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="glass-panel text-muted hover:text-foreground flex items-center justify-center rounded-xl p-2.5 transition-all hover:border-lime-400/30 disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin text-lime-400' : ''} />
          </button>

          <button
            onClick={onCreateOpen}
            className="flex items-center gap-2 rounded-xl bg-lime-400 px-5 py-2.5 text-sm font-black tracking-wider text-black uppercase shadow-lg shadow-lime-400/20 transition-all hover:bg-lime-300"
          >
            <Plus size={18} className="stroke-[3]" />
            Add New Dealer
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="glass-panel flex items-center gap-4 rounded-2xl border border-white/5 p-4">
          <div className="shrink-0 rounded-xl bg-lime-400/10 p-3 text-lime-400">
            <Store size={20} />
          </div>
          <div>
            <div className="text-foreground text-2xl font-black tracking-tight">{totalCount}</div>
            <div className="text-muted text-xs font-bold tracking-wider uppercase">
              Total Dealers
            </div>
          </div>
        </div>

        <div className="glass-panel flex items-center gap-4 rounded-2xl border border-white/5 p-4">
          <div className="shrink-0 rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="text-foreground text-2xl font-black tracking-tight">
              {verifiedCount}
            </div>
            <div className="text-muted text-xs font-bold tracking-wider uppercase">Verified</div>
          </div>
        </div>

        <div className="glass-panel flex items-center gap-4 rounded-2xl border border-white/5 p-4">
          <div className="shrink-0 rounded-xl bg-amber-500/10 p-3 text-amber-400">
            <Clock size={20} />
          </div>
          <div>
            <div className="text-foreground text-2xl font-black tracking-tight">{pendingCount}</div>
            <div className="text-muted text-xs font-bold tracking-wider uppercase">
              Pending Audit
            </div>
          </div>
        </div>

        <div className="glass-panel flex items-center gap-4 rounded-2xl border border-white/5 p-4">
          <div className="shrink-0 rounded-xl bg-amber-400/10 p-3 text-amber-300">
            <Award size={20} />
          </div>
          <div>
            <div className="text-foreground text-2xl font-black tracking-tight">
              {certifiedCount}
            </div>
            <div className="text-muted text-xs font-bold tracking-wider uppercase">
              Certified 3S
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
