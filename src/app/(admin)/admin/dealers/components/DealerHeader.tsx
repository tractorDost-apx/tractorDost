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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-lime-400/10 text-lime-400 border border-lime-400/20">
              <Store size={26} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-foreground">Dealer Network</h1>
              <p className="text-sm font-bold text-muted mt-0.5">
                Master management of tractor dealerships, verifications, and regional operations.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2.5 rounded-xl glass-panel text-muted hover:text-foreground hover:border-lime-400/30 transition-all disabled:opacity-50 flex items-center justify-center"
            title="Refresh Data"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin text-lime-400' : ''} />
          </button>

          <button
            onClick={onCreateOpen}
            className="px-5 py-2.5 bg-lime-400 text-black font-black text-sm uppercase tracking-wider rounded-xl hover:bg-lime-300 transition-all shadow-lg shadow-lime-400/20 flex items-center gap-2"
          >
            <Plus size={18} className="stroke-[3]" />
            Add New Dealer
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl flex items-center gap-4 border border-white/5">
          <div className="p-3 rounded-xl bg-lime-400/10 text-lime-400 shrink-0">
            <Store size={20} />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-foreground">{totalCount}</div>
            <div className="text-xs font-bold text-muted uppercase tracking-wider">Total Dealers</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex items-center gap-4 border border-white/5">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-foreground">{verifiedCount}</div>
            <div className="text-xs font-bold text-muted uppercase tracking-wider">Verified</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex items-center gap-4 border border-white/5">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-foreground">{pendingCount}</div>
            <div className="text-xs font-bold text-muted uppercase tracking-wider">Pending Audit</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex items-center gap-4 border border-white/5">
          <div className="p-3 rounded-xl bg-amber-400/10 text-amber-300 shrink-0">
            <Award size={20} />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-foreground">{certifiedCount}</div>
            <div className="text-xs font-bold text-muted uppercase tracking-wider">Certified 3S</div>
          </div>
        </div>
      </div>
    </div>
  );
}
