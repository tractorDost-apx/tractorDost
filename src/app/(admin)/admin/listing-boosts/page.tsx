'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Rocket,
  Zap,
  Clock,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Ban,
  ArrowUpDown,
  Tag,
  DollarSign,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import {
  listingBoostAPI,
  ListingBoost,
  BoostType,
} from '@/lib/api/listingBoosts';

export default function AdminListingBoostsPage() {
  const [boosts, setBoosts] = useState<ListingBoost[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const fetchBoosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await listingBoostAPI.getAllBoosts({
        limit: 100,
        boostType: selectedType !== 'ALL' ? (selectedType as BoostType) : undefined,
        isActive: statusFilter === 'ACTIVE' ? true : statusFilter === 'INACTIVE' ? false : undefined,
      });

      if (res.success && Array.isArray(res.data)) {
        setBoosts(res.data);
      } else {
        setBoosts([]);
      }
    } catch (err: any) {
      console.error('Error fetching listing boosts:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load listing boosts');
    } finally {
      setLoading(false);
    }
  }, [selectedType, statusFilter]);

  useEffect(() => {
    fetchBoosts();
  }, [fetchBoosts]);

  const handleDeactivate = async (id: number) => {
    if (!window.confirm('Are you sure you want to deactivate this listing boost?')) return;
    try {
      setActionLoading(id);
      setError(null);
      const res = await listingBoostAPI.deactivateBoost(id);
      if (res.success) {
        setSuccessMsg('Listing boost deactivated successfully');
        setTimeout(() => setSuccessMsg(null), 3000);
        await fetchBoosts();
      } else {
        setError(res.message || 'Failed to deactivate boost');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to deactivate boost');
    } finally {
      setActionLoading(null);
    }
  };

  // Filtered in-memory for instant search
  const filteredBoosts = useMemo(() => {
    return boosts.filter((b) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const tractorBrand = b.listing?.tractorBrand?.toLowerCase() || '';
      const tractorModel = b.listing?.tractorModel?.toLowerCase() || '';
      const orderId = b.payment?.gatewayOrderId?.toLowerCase() || '';
      const boostId = String(b.id);
      const listingId = String(b.listingId);
      return (
        tractorBrand.includes(q) ||
        tractorModel.includes(q) ||
        orderId.includes(q) ||
        boostId.includes(q) ||
        listingId.includes(q)
      );
    });
  }, [boosts, searchQuery]);

  // Aggregated Stats
  const stats = useMemo(() => {
    const total = boosts.length;
    const active = boosts.filter((b) => b.isActive).length;
    const totalRev = boosts
      .filter((b) => b.payment?.status === 'SUCCESS' || (!b.payment && b.amountPaid > 0))
      .reduce((acc, curr) => acc + (Number(curr.amountPaid) || 0), 0);
    const expiringSoon = boosts.filter((b) => {
      if (!b.isActive) return false;
      const end = new Date(b.endDate).getTime();
      const now = Date.now();
      const diffHours = (end - now) / (1000 * 60 * 60);
      return diffHours > 0 && diffHours <= 48;
    }).length;

    return { total, active, totalRev, expiringSoon };
  }, [boosts]);

  const getBoostBadge = (type: BoostType) => {
    switch (type) {
      case 'FEATURED':
        return (
          <span className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400">
            <Zap size={12} /> Featured
          </span>
        );
      case 'HOMEPAGE_BOOST':
        return (
          <span className="inline-flex items-center gap-1 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-xs font-bold text-purple-400">
            <Rocket size={12} /> Homepage
          </span>
        );
      case 'TOP_OF_SEARCH':
        return (
          <span className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-400">
            <ArrowUpDown size={12} /> Top Search
          </span>
        );
      case 'URGENT_BADGE':
        return (
          <span className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-400">
            <Tag size={12} /> Urgent Badge
          </span>
        );
      default:
        return (
          <span className="rounded-lg border border-gray-500/30 bg-gray-500/10 px-2.5 py-1 text-xs font-bold text-gray-300">
            {type}
          </span>
        );
    }
  };

  return (
    <div className="animate-fade-in w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-foreground flex items-center gap-3 text-3xl font-black tracking-tight">
            <Rocket className="text-lime-400" size={32} />
            Listing Boosts Management
          </h1>
          <p className="text-muted mt-1 font-medium">
            Monitor, inspect, and manage active marketplace visibility boosts and revenue.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/used-listings/boost-pricing"
            className="flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--card-bg)] px-4 py-2.5 text-xs font-bold transition-colors hover:border-lime-400/50 hover:bg-lime-400/10 hover:text-lime-400"
          >
            <DollarSign size={15} /> Boost Pricing Plans
          </Link>

          <button
            onClick={() => fetchBoosts()}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--card-bg)] px-4 py-2.5 text-xs font-bold transition-colors hover:bg-white/5 disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-lime-400' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-bold text-rose-400">
          <AlertCircle size={16} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-400">
          <CheckCircle2 size={16} className="shrink-0" />
          <p>{successMsg}</p>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--card-bg)] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted text-xs font-bold uppercase tracking-wider">Active Boosts</span>
            <div className="rounded-xl border border-lime-400/20 bg-lime-400/10 p-2 text-lime-400">
              <Zap size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black tracking-tight text-lime-400">{stats.active}</p>
          <span className="text-muted mt-1 block text-xs">Currently live on marketplace</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--card-bg)] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted text-xs font-bold uppercase tracking-wider">Total Boost Revenue</span>
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-2 text-emerald-400">
              <Layers size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black tracking-tight text-emerald-400">
            ₹{stats.totalRev.toLocaleString('en-IN')}
          </p>
          <span className="text-muted mt-1 block text-xs">From successful boost payments</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--card-bg)] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted text-xs font-bold uppercase tracking-wider">Expiring in 48h</span>
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-2 text-amber-400">
              <Clock size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black tracking-tight text-amber-400">{stats.expiringSoon}</p>
          <span className="text-muted mt-1 block text-xs">Boosts nearing duration limit</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--card-bg)] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted text-xs font-bold uppercase tracking-wider">Total Recorded</span>
            <div className="rounded-xl border border-blue-400/20 bg-blue-400/10 p-2 text-blue-400">
              <Rocket size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black tracking-tight text-blue-400">{stats.total}</p>
          <span className="text-muted mt-1 block text-xs">Total boost purchase records</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--card-bg)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search size={16} className="text-muted pointer-events-none absolute top-3 left-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by listing ID, tractor brand/model, or order ID..."
            className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] py-2.5 pr-4 pl-10 text-xs font-bold focus:border-lime-400/50 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-muted" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-foreground rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] px-3 py-2 text-xs font-bold focus:border-lime-400/50 focus:outline-none"
            >
              <option value="ALL">All Boost Types</option>
              <option value="FEATURED">FEATURED</option>
              <option value="HOMEPAGE_BOOST">HOMEPAGE_BOOST</option>
              <option value="TOP_OF_SEARCH">TOP_OF_SEARCH</option>
              <option value="URGENT_BADGE">URGENT_BADGE</option>
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-foreground rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] px-3 py-2 text-xs font-bold focus:border-lime-400/50 focus:outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive / Expired</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--card-bg)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--border-subtle)] bg-[var(--background)]">
              <tr className="text-muted text-[11px] font-black uppercase tracking-wider">
                <th className="px-5 py-3.5">ID</th>
                <th className="px-5 py-3.5">Listing & Tractor</th>
                <th className="px-5 py-3.5">Boost Type</th>
                <th className="px-5 py-3.5">Amount Paid</th>
                <th className="px-5 py-3.5">Duration Window</th>
                <th className="px-5 py-3.5">Payment</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-muted p-8 text-center font-bold">
                    <RefreshCw size={20} className="mx-auto mb-2 animate-spin text-lime-400" />
                    Loading listing boosts...
                  </td>
                </tr>
              ) : filteredBoosts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-muted p-12 text-center">
                    <Rocket size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-bold">No listing boosts found</p>
                    <p className="mt-1 text-xs">
                      Try adjusting your filters or promote tractor listings from the used tractor module.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredBoosts.map((boost) => {
                  const isExpired = new Date(boost.endDate).getTime() < Date.now();
                  const effectivelyActive = boost.isActive && !isExpired;
                  const paymentStatus = boost.payment?.status || (boost.amountPaid > 0 ? 'SUCCESS' : 'PENDING');

                  return (
                    <tr
                      key={boost.id}
                      className="transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-4 font-mono font-bold text-lime-400">
                        #{boost.id}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-foreground">
                          {boost.listing
                            ? `${boost.listing.tractorBrand} ${boost.listing.tractorModel}`
                            : `Listing #${boost.listingId}`}
                        </div>
                        <div className="text-muted mt-0.5 flex items-center gap-2 font-mono text-[11px]">
                          <span>Listing ID: {boost.listingId}</span>
                          {boost.listing?.state && (
                            <>
                              <span>•</span>
                              <span>{boost.listing.state}</span>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {getBoostBadge(boost.boostType)}
                      </td>

                      <td className="px-5 py-4 font-mono font-black text-emerald-400">
                        ₹{Number(boost.amountPaid || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-foreground">
                          <Calendar size={12} className="text-muted" />
                          <span>
                            {new Date(boost.startDate).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          <span className="text-muted">→</span>
                          <span>
                            {new Date(boost.endDate).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[10px] font-black uppercase ${
                            paymentStatus === 'SUCCESS'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : paymentStatus === 'PENDING'
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {paymentStatus === 'SUCCESS' ? (
                            <CheckCircle2 size={10} />
                          ) : (
                            <XCircle size={10} />
                          )}
                          {paymentStatus}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {effectivelyActive ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-lime-400/10 px-2 py-0.5 text-[10px] font-black text-lime-400 uppercase">
                            <span className="h-1.5 w-1.5 rounded-full bg-lime-400 animate-pulse" />
                            Active
                          </span>
                        ) : isExpired ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-gray-500/10 px-2 py-0.5 text-[10px] font-black text-gray-400 uppercase">
                            Expired
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2 py-0.5 text-[10px] font-black text-rose-400 uppercase">
                            Deactivated
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/used-listings?listingId=${boost.listingId}`}
                            className="rounded-lg border border-[var(--border-subtle)] p-1.5 text-muted hover:border-lime-400/50 hover:text-foreground"
                            title="View Listing Details"
                          >
                            <ExternalLink size={14} />
                          </Link>

                          {boost.isActive && !isExpired && (
                            <button
                              type="button"
                              onClick={() => handleDeactivate(boost.id)}
                              disabled={actionLoading === boost.id}
                              className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[11px] font-bold text-rose-400 transition-colors hover:bg-rose-500/20 disabled:opacity-50"
                              title="Deactivate this boost immediately"
                            >
                              <Ban size={12} />
                              {actionLoading === boost.id ? 'Stopping...' : 'Deactivate'}
                            </button>
                          )}
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
    </div>
  );
}
