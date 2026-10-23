'use client';

import React, { useState, useMemo } from 'react';
import { Dealer } from '@/types/models/dealer';
import {
  Search,
  Download,
  Store,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  MapPin,
  Star,
  Award,
} from 'lucide-react';
import { exportDataToCSV } from '../utils/reportExportUtils';

interface DealersReportTabProps {
  dealers: Dealer[];
  loading?: boolean;
}

export const DealersReportTab: React.FC<DealersReportTabProps> = ({ dealers, loading }) => {
  const [search, setSearch] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Compute status distributions
  const stats = useMemo(() => {
    let verified = 0;
    let pending = 0;
    let rejected = 0;
    let certified = 0;
    const byType: Record<string, number> = {};
    const byState: Record<string, number> = {};

    dealers.forEach((d) => {
      const vStatus = d.verificationStatus || 'PENDING';
      if (vStatus === 'VERIFIED') verified++;
      else if (vStatus === 'REJECTED') rejected++;
      else pending++;

      if (d.isCertified) certified++;

      const typeKey = d.dealerType || 'OTHER';
      byType[typeKey] = (byType[typeKey] || 0) + 1;

      if (d.state) {
        byState[d.state] = (byState[d.state] || 0) + 1;
      }
    });

    return {
      verified,
      pending,
      rejected,
      certified,
      byType,
      byState,
    };
  }, [dealers]);

  // Filtered dealers
  const filteredDealers = useMemo(() => {
    return dealers.filter((d) => {
      const matchesSearch =
        search === '' ||
        d.businessName?.toLowerCase().includes(search.toLowerCase()) ||
        d.phone?.includes(search) ||
        d.email?.toLowerCase().includes(search.toLowerCase()) ||
        d.district?.toLowerCase().includes(search.toLowerCase()) ||
        d.state?.toLowerCase().includes(search.toLowerCase());

      const vStatus = d.verificationStatus || 'PENDING';
      const matchesVerification =
        verificationFilter === 'ALL' || vStatus === verificationFilter;

      const matchesType = typeFilter === 'ALL' || d.dealerType === typeFilter;

      return matchesSearch && matchesVerification && matchesType;
    });
  }, [dealers, search, verificationFilter, typeFilter]);

  const handleExportCSV = () => {
    const rows = filteredDealers.map((d) => ({
      ID: d.id,
      BusinessName: d.businessName,
      DealerType: d.dealerType,
      VerificationStatus: d.verificationStatus || 'PENDING',
      IsCertified: d.isCertified ? 'Yes' : 'No',
      Phone: d.phone || '-',
      Email: d.email || '-',
      State: d.state || '-',
      District: d.district || '-',
      Rating: d.rating ?? 0,
      ReviewsCount: d.reviewsCount ?? 0,
      CreatedAt: new Date(d.createdAt).toLocaleDateString('en-IN'),
    }));
    exportDataToCSV(rows, 'Dealers_Report');
  };

  return (
    <div className="space-y-6">
      {/* 1. Dealer Metrics & Geographic Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Verification Status Cards */}
        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
          <div className="mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Verification Status Breakdown
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Partner onboarding and compliance
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-500/5 p-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  Verified Dealerships
                </span>
              </div>
              <span className="text-base font-black text-neutral-900 dark:text-white">
                {stats.verified}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50/60 dark:bg-amber-500/5 p-3">
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  Pending Verification
                </span>
              </div>
              <span className="text-base font-black text-neutral-900 dark:text-white">
                {stats.pending}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-lime-200 dark:border-lime-500/20 bg-lime-50/60 dark:bg-lime-500/5 p-3">
              <div className="flex items-center gap-2.5">
                <Award className="h-4 w-4 text-lime-600 dark:text-lime-400" />
                <span className="text-xs font-bold text-lime-800 dark:text-lime-300">
                  Certified Partners
                </span>
              </div>
              <span className="text-base font-black text-neutral-900 dark:text-white">
                {stats.certified}
              </span>
            </div>
          </div>
        </div>

        {/* Dealer Category Share */}
        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
          <div className="mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">Dealer Categories</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Distribution by business model
            </p>
          </div>

          <div className="space-y-3">
            {Object.entries(stats.byType).length === 0 ? (
              <p className="text-xs text-neutral-500">No category data recorded</p>
            ) : (
              Object.entries(stats.byType).map(([type, count]) => {
                const pct = dealers.length > 0 ? Math.round((count / dealers.length) * 100) : 0;
                return (
                  <div key={type} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                        {type.replace(/_/g, ' ')}
                      </span>
                      <span className="font-bold text-neutral-900 dark:text-white">
                        {count} <span className="font-medium text-neutral-500">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Geographic Presence */}
        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
          <div className="mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Geographic Footprint
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Dealer concentration by state
              </p>
            </div>
            <MapPin className="h-4 w-4 text-neutral-400" />
          </div>

          <div className="flex flex-wrap gap-2 overflow-y-auto max-h-[160px] pr-1">
            {Object.entries(stats.byState).length === 0 ? (
              <span className="text-xs text-neutral-500">No regional data recorded</span>
            ) : (
              Object.entries(stats.byState).map(([state, count]) => (
                <span
                  key={state}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-2.5 py-1 text-xs font-semibold text-neutral-800 dark:text-neutral-200"
                >
                  <span>{state}</span>
                  <span className="rounded bg-blue-100 dark:bg-blue-500/20 px-1.5 py-0.2 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                    {count}
                  </span>
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 2. Interactive Data Table with Filters */}
      <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              Dealership Directory
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              Showing {filteredDealers.length} of {dealers.length} dealerships
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search dealership, city, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 py-2 pl-9 pr-3 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-blue-500 focus:bg-white dark:focus:bg-neutral-800 focus:outline-none shadow-2xs font-medium"
              />
            </div>

            {/* Verification Filter */}
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200 focus:border-blue-500 focus:bg-white dark:focus:bg-neutral-800 focus:outline-none shadow-2xs"
            >
              <option value="ALL">All Verification</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>

            {/* Category Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200 focus:border-blue-500 focus:bg-white dark:focus:bg-neutral-800 focus:outline-none shadow-2xs"
            >
              <option value="ALL">All Categories</option>
              <option value="BRAND_DEALER">Brand Dealer</option>
              <option value="USED_DEALER">Used Tractor Dealer</option>
              <option value="SERVICE_CENTER">Service Center</option>
              <option value="IMPLEMENT_DEALER">Implement Dealer</option>
            </select>

            {/* Export CSV button */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-2 text-xs font-bold text-neutral-700 dark:text-neutral-200 shadow-2xs transition-all hover:border-blue-500 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-neutral-50 dark:hover:bg-neutral-700"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-neutral-100 dark:border-neutral-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
              <tr>
                <th className="py-3 pl-3">Dealer ID</th>
                <th className="py-3">Business Name</th>
                <th className="py-3">Type</th>
                <th className="py-3">Contact</th>
                <th className="py-3">Location</th>
                <th className="py-3">Rating</th>
                <th className="py-3">Status</th>
                <th className="py-3 pr-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300">
              {filteredDealers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-500">
                    <p className="font-semibold">No dealerships matching your search criteria</p>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Try clearing filters or search query
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDealers.slice(0, 50).map((d) => {
                  const vStatus = d.verificationStatus || 'PENDING';
                  return (
                    <tr
                      key={d.id}
                      className="group transition-colors hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40"
                    >
                      <td className="py-3 pl-3 font-mono text-[11px] font-bold text-neutral-500">
                        #{d.id}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-neutral-900 dark:text-white">
                            {d.businessName}
                          </span>
                          {d.isCertified && (
                            <span title="Certified Partner">
                              <Award className="h-3.5 w-3.5 text-lime-600 dark:text-lime-400" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="rounded-md bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-[10px] font-bold text-neutral-700 dark:text-neutral-300">
                          {d.dealerType?.replace(/_/g, ' ') || 'Dealer'}
                        </span>
                      </td>
                      <td className="py-3 font-medium text-neutral-600 dark:text-neutral-400">
                        <div>{d.phone || '-'}</div>
                        <div className="text-[10px] text-neutral-500">{d.email || ''}</div>
                      </td>
                      <td className="py-3 font-medium text-neutral-800 dark:text-neutral-200">
                        {d.district ? `${d.district}, ` : ''}
                        {d.state || '-'}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1 text-yellow-500 font-bold">
                          <Star className="h-3.5 w-3.5 fill-yellow-400" />
                          <span className="text-xs">{d.rating ?? 0}</span>
                          <span className="text-[10px] text-neutral-500 font-medium">
                            ({d.reviewsCount ?? 0})
                          </span>
                        </div>
                      </td>
                      <td className="py-3">
                        {vStatus === 'VERIFIED' ? (
                          <span className="inline-flex items-center rounded-full border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                            Verified
                          </span>
                        ) : vStatus === 'REJECTED' ? (
                          <span className="inline-flex items-center rounded-full border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-400">
                            Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-3 text-neutral-500 dark:text-neutral-400 font-medium">
                        {new Date(d.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                        })}
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
};
