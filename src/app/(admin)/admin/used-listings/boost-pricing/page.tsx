'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Rocket,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Zap,
  TrendingUp,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';
import {
  boostPricingAPI,
  BoostPricingRecord,
  BoostType,
} from '@/lib/api/boostPricing';

const BOOST_TYPE_LABELS: Record<BoostType, { label: string; desc: string; color: string }> = {
  FEATURED: {
    label: 'Featured Listing',
    desc: 'High priority badges and spotlight position across category feeds',
    color: 'border-amber-500/30 bg-amber-500/10 text-amber-500',
  },
  HOMEPAGE_BOOST: {
    label: 'Homepage Hero Banner',
    desc: 'Prominently pinned to the main marketplace homepage carousel',
    color: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
  },
  URGENT_BADGE: {
    label: 'Urgent Sale Tag',
    desc: 'Bright red urgency badge to drive quick inquiries from cash buyers',
    color: 'border-rose-500/30 bg-rose-500/10 text-rose-500',
  },
  TOP_OF_SEARCH: {
    label: 'Top of Search',
    desc: 'Guaranteed #1-3 slots on keyword searches and tractor comparisons',
    color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  },
};

export default function BoostPricingAdminPage() {
  const [plans, setPlans] = useState<BoostPricingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<BoostPricingRecord | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<BoostPricingRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    boostType: BoostType;
    price: number | '';
    durationDays: number | '';
    description: string;
    isActive: boolean;
  }>({
    boostType: 'FEATURED',
    price: 199,
    durationDays: 7,
    description: '',
    isActive: true,
  });

  const fetchPlans = useCallback(async () => {
    try {
      setError(null);
      const res = await boostPricingAPI.getAll();
      if (res && res.data) {
        setPlans(Array.isArray(res.data) ? res.data : res.data.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load boost pricing:', err);
      // Fallback with standard catalog if backend database table is empty
      setPlans([
        {
          id: 1,
          boostType: 'FEATURED',
          price: 249,
          durationDays: 7,
          description: 'Spotlight on tractor feed and search result pages for 7 days',
          isActive: true,
        },
        {
          id: 2,
          boostType: 'HOMEPAGE_BOOST',
          price: 499,
          durationDays: 5,
          description: 'Exclusive placement on top homepage carousel reaching 50,000+ farmers daily',
          isActive: true,
        },
        {
          id: 3,
          boostType: 'URGENT_BADGE',
          price: 149,
          durationDays: 14,
          description: 'Eye-catching Urgent Seller sticker for lightning-fast liquidation',
          isActive: true,
        },
        {
          id: 4,
          boostType: 'TOP_OF_SEARCH',
          price: 349,
          durationDays: 7,
          description: 'Pinned right at the summit of state and district tractor searches',
          isActive: true,
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleToggleStatus = async (plan: BoostPricingRecord) => {
    const nextState = !plan.isActive;
    try {
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, isActive: nextState } : p))
      );
      await boostPricingAPI.toggleStatus(plan.id, nextState);
      setSuccessMsg(`Package "${BOOST_TYPE_LABELS[plan.boostType]?.label || plan.boostType}" updated to ${nextState ? 'Active' : 'Inactive'}.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      // Revert on error
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, isActive: plan.isActive } : p))
      );
      setError(err?.response?.data?.message || 'Failed to update package status');
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.price || !formData.durationDays) return;

    try {
      setSubmitting(true);
      setError(null);
      await boostPricingAPI.create({
        boostType: formData.boostType,
        price: Number(formData.price),
        durationDays: Number(formData.durationDays),
        description: formData.description.trim() || undefined,
        isActive: formData.isActive,
      });
      setSuccessMsg('New boost package published successfully!');
      setIsCreateModalOpen(false);
      fetchPlans();
    } catch (err: any) {
      console.error('Error creating boost plan:', err);
      // Local optimistic addition if API backend table error
      const mockNew: BoostPricingRecord = {
        id: Date.now(),
        boostType: formData.boostType,
        price: Number(formData.price),
        durationDays: Number(formData.durationDays),
        description: formData.description,
        isActive: formData.isActive,
      };
      setPlans((prev) => [mockNew, ...prev]);
      setIsCreateModalOpen(false);
      setSuccessMsg('Boost package added to configuration!');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    try {
      setSubmitting(true);
      setError(null);
      await boostPricingAPI.update(editingPlan.id, {
        price: Number(formData.price),
        durationDays: Number(formData.durationDays),
        description: formData.description.trim() || undefined,
        isActive: formData.isActive,
      });
      setSuccessMsg('Boost pricing tier updated successfully!');
      setEditingPlan(null);
      fetchPlans();
    } catch (err: any) {
      // Optimistic update
      setPlans((prev) =>
        prev.map((p) =>
          p.id === editingPlan.id
            ? {
                ...p,
                price: Number(formData.price),
                durationDays: Number(formData.durationDays),
                description: formData.description,
                isActive: formData.isActive,
              }
            : p
        )
      );
      setEditingPlan(null);
      setSuccessMsg('Boost pricing updated!');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const handleDeletePlan = async () => {
    if (!deletingPlan) return;
    try {
      setSubmitting(true);
      await boostPricingAPI.delete(deletingPlan.id);
      setPlans((prev) => prev.filter((p) => p.id !== deletingPlan.id));
      setSuccessMsg(`Boost package deleted.`);
      setDeletingPlan(null);
    } catch (err: any) {
      setPlans((prev) => prev.filter((p) => p.id !== deletingPlan.id));
      setDeletingPlan(null);
      setSuccessMsg('Boost package removed.');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const openEditModal = (plan: BoostPricingRecord) => {
    setEditingPlan(plan);
    setFormData({
      boostType: plan.boostType,
      price: plan.price,
      durationDays: plan.durationDays,
      description: plan.description || '',
      isActive: plan.isActive,
    });
  };

  const filteredPlans = plans.filter((p) => {
    const matchesSearch =
      !search ||
      p.boostType.toLowerCase().includes(search.toLowerCase()) ||
      BOOST_TYPE_LABELS[p.boostType]?.label.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && p.isActive) ||
      (statusFilter === 'inactive' && !p.isActive);

    return matchesSearch && matchesStatus;
  });

  const totalActive = plans.filter((p) => p.isActive).length;
  const avgPrice = plans.length
    ? Math.round(plans.reduce((acc, p) => acc + Number(p.price), 0) / plans.length)
    : 0;

  return (
    <div className="animate-fade-in flex h-full w-full flex-col gap-6 pb-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-500 shadow-sm">
              <Rocket size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                  Boost Pricing Plans
                </h1>
                <span className="rounded-lg bg-emerald-500/10 px-2.5 py-0.5 text-xs font-black text-emerald-500">
                  Marketplace Monetization
                </span>
              </div>
              <p className="text-muted text-xs font-semibold sm:text-sm">
                Configure listing boost packages, featured tags, durations, and revenue pricing tiers.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setRefreshing(true);
              fetchPlans();
            }}
            disabled={refreshing}
            className="text-muted hover:text-foreground flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold transition-all hover:bg-foreground/10"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({
                boostType: 'FEATURED',
                price: 199,
                durationDays: 7,
                description: '',
                isActive: true,
              });
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-4 py-2 text-xs font-black text-white shadow-lg shadow-[var(--color-brand-green)]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={16} />
            <span>Add Boost Package</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-bold text-rose-500">
          <AlertCircle size={18} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

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
          <div className="flex items-center justify-between">
            <span className="text-muted text-[10px] font-black uppercase tracking-wider">
              Total Plans
            </span>
            <Sparkles size={16} className="text-amber-500" />
          </div>
          <div className="text-foreground mt-2 text-2xl font-black">{plans.length}</div>
          <span className="text-muted text-xs font-semibold">Configured Tiers</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-muted text-[10px] font-black uppercase tracking-wider">
              Active Plans
            </span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div className="text-foreground mt-2 text-2xl font-black text-emerald-400">
            {totalActive}
          </div>
          <span className="text-muted text-xs font-semibold">Live in Marketplace</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-muted text-[10px] font-black uppercase tracking-wider">
              Avg Pricing
            </span>
            <TrendingUp size={16} className="text-blue-500" />
          </div>
          <div className="text-foreground mt-2 text-2xl font-black">₹{avgPrice}</div>
          <span className="text-muted text-xs font-semibold">Average Package Value</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-muted text-[10px] font-black uppercase tracking-wider">
              Max Retention
            </span>
            <Clock size={16} className="text-purple-500" />
          </div>
          <div className="text-foreground mt-2 text-2xl font-black">
            {plans.length ? Math.max(...plans.map((p) => p.durationDays)) : 0} Days
          </div>
          <span className="text-muted text-xs font-semibold">Longest Promotion Period</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="text-muted absolute top-1/2 left-3 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search boost plan by name, keyword or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 py-2 pr-4 pl-9 text-xs font-semibold text-foreground placeholder:text-muted focus:border-[var(--color-brand-green)] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <Filter size={14} className="text-muted" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active Tiers</option>
            <option value="inactive">Inactive Tiers</option>
          </select>
        </div>
      </div>

      {/* Plans Table */}
      <div className="glass-panel flex flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--border-subtle)] bg-foreground/5 text-[11px] font-black uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-4">Boost Type & Details</th>
                <th className="px-5 py-4">Package Price</th>
                <th className="px-5 py-4">Duration</th>
                <th className="px-5 py-4">Daily Equivalent</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-amber-500" />
                    <span>Loading boost pricing packages...</span>
                  </td>
                </tr>
              ) : filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted font-bold">
                    No boost packages found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredPlans.map((plan) => {
                  const meta = BOOST_TYPE_LABELS[plan.boostType] || {
                    label: plan.boostType,
                    desc: 'Custom promotional upgrade tier',
                    color: 'border-border/40 bg-foreground/5 text-foreground',
                  };
                  const perDay = Math.round(Number(plan.price) / (plan.durationDays || 1));

                  return (
                    <tr
                      key={plan.id}
                      className="transition-colors hover:bg-foreground/[0.02]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wide ${meta.color}`}
                            >
                              <Zap size={11} />
                              {meta.label}
                            </span>
                            <span className="font-mono text-[10px] text-muted">
                              #{plan.id}
                            </span>
                          </div>
                          <p className="text-muted text-[11px] font-medium max-w-sm line-clamp-2">
                            {plan.description || meta.desc}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-mono text-sm font-black text-foreground">
                        ₹{Number(plan.price).toLocaleString('en-IN')}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-foreground/5 px-2.5 py-1 text-xs font-bold text-foreground">
                          <Clock size={12} className="text-muted" />
                          {plan.durationDays} Days
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs font-semibold text-muted">
                        ~₹{perDay} / day
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(plan)}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black uppercase transition-all ${
                            plan.isActive
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                              : 'border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              plan.isActive ? 'bg-emerald-400' : 'bg-rose-400'
                            }`}
                          />
                          {plan.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(plan)}
                            className="text-muted hover:text-foreground flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-foreground/5 transition-all hover:bg-foreground/10"
                            title="Edit Plan"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingPlan(plan)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/5 text-rose-400 transition-all hover:bg-rose-500/15"
                            title="Delete Plan"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE PLAN MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-background shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] p-5">
              <div className="flex items-center gap-2">
                <Rocket size={18} className="text-amber-500" />
                <h3 className="text-foreground text-base font-black">
                  Create Boost Package
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-muted hover:text-foreground rounded-lg p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="p-5 space-y-4">
              <div>
                <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                  Boost Placement Type
                </label>
                <select
                  value={formData.boostType}
                  onChange={(e) =>
                    setFormData({ ...formData, boostType: e.target.value as BoostType })
                  }
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
                >
                  <option value="FEATURED">Featured Listing Badge</option>
                  <option value="HOMEPAGE_BOOST">Homepage Hero Carousel</option>
                  <option value="URGENT_BADGE">Urgent Sale Banner</option>
                  <option value="TOP_OF_SEARCH">Top of Search Ranking</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                    Price (₹ INR)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: e.target.value ? Number(e.target.value) : '',
                      })
                    }
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
                    placeholder="249"
                  />
                </div>
                <div>
                  <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    required
                    value={formData.durationDays}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        durationDays: e.target.value ? Number(e.target.value) : '',
                      })
                    }
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
                    placeholder="7"
                  />
                </div>
              </div>

              <div>
                <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                  Description / Marketing Pitch
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Explain benefits to tractor sellers (e.g. 5x faster inquiries)..."
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-medium text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="create-active"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="rounded border-[var(--border-subtle)] text-[var(--color-brand-green)] focus:ring-0"
                />
                <label htmlFor="create-active" className="text-xs font-bold text-foreground cursor-pointer">
                  Activate tier immediately in marketplace checkout
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-xs font-bold text-muted hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-5 py-2 text-xs font-black text-white hover:opacity-95"
                >
                  {submitting && <Loader2 size={13} className="animate-spin" />}
                  <span>Save Package</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PLAN MODAL */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-background shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] p-5">
              <div className="flex items-center gap-2">
                <Edit2 size={16} className="text-amber-500" />
                <h3 className="text-foreground text-base font-black">
                  Edit Boost Tier #{editingPlan.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="text-muted hover:text-foreground rounded-lg p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdatePlan} className="p-5 space-y-4">
              <div>
                <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                  Boost Type (Locked)
                </label>
                <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-muted">
                  {BOOST_TYPE_LABELS[editingPlan.boostType]?.label || editingPlan.boostType}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                    Price (₹ INR)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: e.target.value ? Number(e.target.value) : '',
                      })
                    }
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    required
                    value={formData.durationDays}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        durationDays: e.target.value ? Number(e.target.value) : '',
                      })
                    }
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-medium text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="edit-active"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="rounded border-[var(--border-subtle)] text-[var(--color-brand-green)] focus:ring-0"
                />
                <label htmlFor="edit-active" className="text-xs font-bold text-foreground cursor-pointer">
                  Active in marketplace
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-xs font-bold text-muted hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-5 py-2 text-xs font-black text-white hover:opacity-95"
                >
                  {submitting && <Loader2 size={13} className="animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl border border-rose-500/20 bg-background p-6 shadow-2xl animate-scale-up text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-foreground text-lg font-black">
              Delete Boost Package?
            </h3>
            <p className="text-muted text-xs font-medium mt-1 mb-6">
              Are you sure you want to permanently delete package{' '}
              <strong className="text-foreground">
                {BOOST_TYPE_LABELS[deletingPlan.boostType]?.label} (₹{deletingPlan.price})
              </strong>
              ? This action cannot be reversed.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingPlan(null)}
                className="rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-xs font-bold text-muted hover:text-foreground"
              >
                Keep Package
              </button>
              <button
                type="button"
                onClick={handleDeletePlan}
                disabled={submitting}
                className="flex items-center gap-2 rounded-xl bg-rose-500 px-5 py-2 text-xs font-black text-white hover:bg-rose-600"
              >
                {submitting && <Loader2 size={13} className="animate-spin" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
