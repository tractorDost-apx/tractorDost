'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  Filter,
  Edit2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Building2,
  RefreshCw,
  X,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

type PlanTier = 'SILVER' | 'GOLD' | 'PLATINUM';
type SubStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'CANCELLED';

interface SubscriptionRecord {
  id: string;
  dealerName: string;
  contactPerson: string;
  mobile: string;
  plan: PlanTier;
  cycle: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  amount: number;
  startDate: string;
  renewalDate: string;
  status: SubStatus;
}

const TIER_META: Record<PlanTier, { label: string; color: string; badge: string }> = {
  SILVER: { label: 'Silver Dealer', color: 'border-slate-400/30 bg-slate-400/10 text-slate-300', badge: 'Silver' },
  GOLD: { label: 'Gold Verified', color: 'border-amber-500/30 bg-amber-500/10 text-amber-400', badge: 'Gold' },
  PLATINUM: { label: 'Platinum Enterprise', color: 'border-purple-500/30 bg-purple-500/10 text-purple-400', badge: 'Platinum' },
};

const STATUS_META: Record<SubStatus, { label: string; bg: string; text: string }> = {
  ACTIVE: { label: 'Active', bg: 'border-emerald-500/30 bg-emerald-500/10', text: 'text-emerald-400' },
  EXPIRING_SOON: { label: 'Renewal Due (< 7 Days)', bg: 'border-amber-500/30 bg-amber-500/10', text: 'text-amber-400' },
  EXPIRED: { label: 'Expired', bg: 'border-rose-500/30 bg-rose-500/10', text: 'text-rose-400' },
  CANCELLED: { label: 'Cancelled', bg: 'border-slate-500/30 bg-slate-500/10', text: 'text-muted' },
};

const DEFAULT_SUBSCRIPTIONS: SubscriptionRecord[] = [
  {
    id: 'SUB-2001',
    dealerName: 'Kisan Mahindra Tractors',
    contactPerson: 'Rameshwar Patil',
    mobile: '9822123456',
    plan: 'PLATINUM',
    cycle: 'ANNUAL',
    amount: 149999,
    startDate: '2026-01-15',
    renewalDate: '2027-01-15',
    status: 'ACTIVE',
  },
  {
    id: 'SUB-2002',
    dealerName: 'Sai Samarth Swaraj Hub',
    contactPerson: 'Vikas Deshmukh',
    mobile: '9850987654',
    plan: 'GOLD',
    cycle: 'QUARTERLY',
    amount: 19999,
    startDate: '2026-08-01',
    renewalDate: '2026-11-01',
    status: 'ACTIVE',
  },
  {
    id: 'SUB-2003',
    dealerName: 'Shri Ganesh John Deere Center',
    contactPerson: 'Sanjay More',
    mobile: '9921456789',
    plan: 'GOLD',
    cycle: 'MONTHLY',
    amount: 6999,
    startDate: '2026-09-30',
    renewalDate: '2026-10-30',
    status: 'EXPIRING_SOON',
  },
  {
    id: 'SUB-2004',
    dealerName: 'Jai Kisan Sonalika Agency',
    contactPerson: 'Anand Shinde',
    mobile: '9765432109',
    plan: 'SILVER',
    cycle: 'MONTHLY',
    amount: 2999,
    startDate: '2026-08-15',
    renewalDate: '2026-09-15',
    status: 'EXPIRED',
  },
];

export default function SubscriptionsAdminPage() {
  const [subs, setSubs] = useState<SubscriptionRecord[]>(DEFAULT_SUBSCRIPTIONS);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<'ALL' | PlanTier>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | SubStatus>('ALL');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Upgrade / Edit
  const [editingSub, setEditingSub] = useState<SubscriptionRecord | null>(null);
  const [newPlan, setNewPlan] = useState<PlanTier>('GOLD');

  const filteredSubs = useMemo(() => {
    return subs.filter((s) => {
      const matchesSearch =
        !search ||
        s.dealerName.toLowerCase().includes(search.toLowerCase()) ||
        s.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
        s.mobile.includes(search) ||
        s.id.toLowerCase().includes(search.toLowerCase());

      const matchesTier = tierFilter === 'ALL' || s.plan === tierFilter;
      const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;

      return matchesSearch && matchesTier && matchesStatus;
    });
  }, [subs, search, tierFilter, statusFilter]);

  const handleUpgrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub) return;

    setSubs((prev) =>
      prev.map((s) =>
        s.id === editingSub.id
          ? {
              ...s,
              plan: newPlan,
              status: 'ACTIVE',
            }
          : s
      )
    );

    setSuccessMsg(`Subscription for ${editingSub.dealerName} updated to ${newPlan}.`);
    setEditingSub(null);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // KPIs
  const activeSubs = subs.filter((s) => s.status === 'ACTIVE' || s.status === 'EXPIRING_SOON');
  const totalMRR = activeSubs.reduce((acc, s) => {
    if (s.cycle === 'ANNUAL') return acc + Math.round(s.amount / 12);
    if (s.cycle === 'QUARTERLY') return acc + Math.round(s.amount / 3);
    return acc + s.amount;
  }, 0);

  return (
    <div className="animate-fade-in flex h-full w-full flex-col gap-6 pb-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 text-purple-400 shadow-sm">
              <Sparkles size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                  Dealer Subscriptions & SaaS
                </h1>
                <span className="rounded-lg bg-purple-500/10 px-2.5 py-0.5 text-xs font-black text-purple-400">
                  Recurring Revenue
                </span>
              </div>
              <p className="text-muted text-xs font-semibold sm:text-sm">
                Manage dealer premium memberships, verified checkmarks, unlimited listing packages, and renewals.
              </p>
            </div>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="shrink-0" />
            <p>{successMsg}</p>
          </div>
          <button type="button" onClick={() => setSuccessMsg(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            Monthly Recurring (MRR)
          </span>
          <div className="text-emerald-400 mt-1 text-2xl font-black">
            ₹{totalMRR.toLocaleString('en-IN')}
          </div>
          <span className="text-muted text-xs font-semibold">Normalized Monthly Rate</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            Active Paid Accounts
          </span>
          <div className="text-foreground mt-1 text-2xl font-black">{activeSubs.length}</div>
          <span className="text-muted text-xs font-semibold">Subscribed Dealerships</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            Enterprise Accounts
          </span>
          <div className="text-purple-400 mt-1 text-2xl font-black">
            {subs.filter((s) => s.plan === 'PLATINUM').length}
          </div>
          <span className="text-muted text-xs font-semibold">Platinum Flagships</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            Upcoming Renewals
          </span>
          <div className="text-amber-500 mt-1 text-2xl font-black">
            {subs.filter((s) => s.status === 'EXPIRING_SOON').length}
          </div>
          <span className="text-muted text-xs font-semibold">Due in 7 Days</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="text-muted absolute top-1/2 left-3 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dealership name, owner, or subscription ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 py-2 pr-4 pl-9 text-xs font-semibold text-foreground placeholder:text-muted focus:border-[var(--color-brand-green)] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value as any)}
            className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
          >
            <option value="ALL">All Membership Tiers</option>
            <option value="PLATINUM">Platinum Enterprise</option>
            <option value="GOLD">Gold Verified</option>
            <option value="SILVER">Silver Dealer</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
          >
            <option value="ALL">All Account Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRING_SOON">Expiring Soon</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="glass-panel flex flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--border-subtle)] bg-foreground/5 text-[11px] font-black uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-4">Dealership & Contact</th>
                <th className="px-5 py-4">Membership Plan</th>
                <th className="px-5 py-4">Billing Frequency</th>
                <th className="px-5 py-4">Fee (INR)</th>
                <th className="px-5 py-4">Next Renewal</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredSubs.map((s) => {
                const tierMeta = TIER_META[s.plan];
                const statusMeta = STATUS_META[s.status];

                return (
                  <tr
                    key={s.id}
                    className="transition-colors hover:bg-foreground/[0.02]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="text-foreground text-xs font-black">
                          {s.dealerName}
                        </span>
                        <span className="text-muted text-[10px] font-semibold">
                          {s.contactPerson} (+91 {s.mobile})
                        </span>
                        <span className="font-mono text-[9px] text-muted">
                          {s.id}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-black uppercase ${tierMeta.color}`}
                      >
                        {tierMeta.label}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-mono text-xs text-muted">
                      {s.cycle}
                    </td>

                    <td className="px-5 py-4 font-mono text-xs font-black text-foreground">
                      ₹{s.amount.toLocaleString('en-IN')}
                    </td>

                    <td className="px-5 py-4 font-mono text-xs text-foreground font-bold">
                      {s.renewalDate}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase ${statusMeta.bg} ${statusMeta.text}`}
                      >
                        {statusMeta.label}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSub(s);
                          setNewPlan(s.plan);
                        }}
                        className="inline-flex items-center gap-1 rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-2.5 py-1 text-xs font-bold text-foreground hover:bg-foreground/10"
                      >
                        <Edit2 size={12} />
                        <span>Plan</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PLAN UPGRADE MODAL */}
      {editingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl border border-[var(--border-subtle)] bg-background p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-purple-400" />
                <h3 className="text-foreground text-base font-black">
                  Modify Dealer Plan
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingSub(null)}
                className="text-muted hover:text-foreground rounded-lg p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpgrade} className="space-y-4">
              <div>
                <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                  Dealership
                </label>
                <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-3 text-xs font-black text-foreground">
                  {editingSub.dealerName}
                </div>
              </div>

              <div>
                <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                  Choose Membership Tier
                </label>
                <select
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value as PlanTier)}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
                >
                  <option value="SILVER">Silver Dealer (₹2,999/mo)</option>
                  <option value="GOLD">Gold Verified Dealer (₹6,999/mo)</option>
                  <option value="PLATINUM">Platinum Enterprise (₹14,999/mo)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setEditingSub(null)}
                  className="rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-xs font-bold text-muted hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[var(--color-brand-green)] px-5 py-2 text-xs font-black text-white hover:opacity-95"
                >
                  Update Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
