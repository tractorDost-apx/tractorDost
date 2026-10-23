'use client';

import React, { useState, useMemo } from 'react';
import { Lead, LeadStats, LeadStatus } from '@/lib/api/leads';
import {
  Search,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { exportDataToCSV } from '../utils/reportExportUtils';
import { getLeadSourceInfo } from '@/app/(admin)/admin/leads/lead-helpers';
import { LeadSourcePlatformBadge } from '@/app/(admin)/admin/leads/components/LeadSourcePlatformBadge';

interface LeadsReportTabProps {
  leads: Lead[];
  stats: LeadStats | null;
  loading?: boolean;
}

const statusBadgeStyles: Record<string, { bg: string; text: string; border: string }> = {
  NEW: {
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-500/20',
  },
  ATTEMPTED: {
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-500/20',
  },
  CONTACTED: {
    bg: 'bg-purple-50 dark:bg-purple-500/10',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-500/20',
  },
  QUALIFIED: {
    bg: 'bg-indigo-50 dark:bg-indigo-500/10',
    text: 'text-indigo-700 dark:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-500/20',
  },
  INTERESTED: {
    bg: 'bg-cyan-50 dark:bg-cyan-500/10',
    text: 'text-cyan-700 dark:text-cyan-400',
    border: 'border-cyan-200 dark:border-cyan-500/20',
  },
  DEALER_ASSIGNED: {
    bg: 'bg-teal-50 dark:bg-teal-500/10',
    text: 'text-teal-700 dark:text-teal-400',
    border: 'border-teal-200 dark:border-teal-500/20',
  },
  CONVERTED: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-500/20',
  },
  LOST: {
    bg: 'bg-rose-50 dark:bg-rose-500/10',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-500/20',
  },
  SPAM: {
    bg: 'bg-neutral-100 dark:bg-neutral-800',
    text: 'text-neutral-700 dark:text-neutral-400',
    border: 'border-neutral-200 dark:border-neutral-700',
  },
};

export const LeadsReportTab: React.FC<LeadsReportTabProps> = ({ leads, stats, loading }) => {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  // Compute status counts either from stats or from leads array
  const statusCounts = useMemo(() => {
    if (stats?.byStatus && Object.keys(stats.byStatus).length > 0) return stats.byStatus;
    const counts: Record<string, number> = {};
    leads.forEach((l) => {
      counts[l.status] = (counts[l.status] || 0) + 1;
    });
    return counts;
  }, [stats, leads]);

  // Compute type counts
  const typeCounts = useMemo(() => {
    if (stats?.byType && Object.keys(stats.byType).length > 0) return stats.byType;
    const counts: Record<string, number> = {};
    leads.forEach((l) => {
      counts[l.leadType] = (counts[l.leadType] || 0) + 1;
    });
    return counts;
  }, [stats, leads]);

  const totalLeadsCount = stats?.total ?? leads.length;

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchesSearch =
        search === '' ||
        l.name?.toLowerCase().includes(search.toLowerCase()) ||
        l.mobile?.includes(search) ||
        l.interestedBrand?.toLowerCase().includes(search.toLowerCase()) ||
        l.interestedModel?.toLowerCase().includes(search.toLowerCase()) ||
        l.city?.toLowerCase().includes(search.toLowerCase()) ||
        l.state?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = selectedStatus === 'ALL' || l.status === selectedStatus;
      const matchesType = selectedType === 'ALL' || l.leadType === selectedType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [leads, search, selectedStatus, selectedType]);

  const handleExportCSV = () => {
    const rows = filteredLeads.map((l) => {
      const sourceInfo = getLeadSourceInfo(l);
      return {
        ID: l.id,
        Customer: l.name || 'Anonymous',
        Mobile: l.mobile || '-',
        Email: l.email || '-',
        LeadType: l.leadType,
        Status: l.status,
        IntentScore: l.intentScore ?? 0,
        SourcePlatform: sourceInfo.platformName,
        SourcePage: sourceInfo.pageLabel,
        SourceCampaign: sourceInfo.campaignLabel,
        InterestedBrand: l.interestedBrand || l.tractor?.modelName || '-',
        InterestedModel: l.interestedModel || '-',
        City: l.city || l.district || '-',
        State: l.state || '-',
        CreatedAt: new Date(l.createdAt).toLocaleDateString('en-IN'),
      };
    });
    exportDataToCSV(rows, 'Leads_Report');
  };

  return (
    <div className="space-y-6">
      {/* 1. Pipeline Funnel & Distribution Visual Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Status Distribution */}
        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm lg:col-span-2">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Lead Pipeline Funnel & Conversion
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Distribution of incoming inquiries across sales lifecycle stages
              </p>
            </div>
            <span className="rounded-full bg-lime-500/10 px-3 py-1 text-xs font-black text-lime-700 dark:text-lime-400 border border-lime-500/20">
              {stats?.conversionRate ?? 0}% Conversion Rate
            </span>
          </div>

          <div className="space-y-3.5">
            {[
              { key: 'NEW', label: 'New Inquiries', color: 'bg-blue-500' },
              { key: 'CONTACTED', label: 'Contacted', color: 'bg-purple-500' },
              { key: 'QUALIFIED', label: 'Qualified Buyer', color: 'bg-indigo-500' },
              { key: 'INTERESTED', label: 'High Intent / Interested', color: 'bg-cyan-500' },
              { key: 'DEALER_ASSIGNED', label: 'Dealer Assigned', color: 'bg-teal-500' },
              { key: 'CONVERTED', label: 'Converted to Sale', color: 'bg-emerald-500' },
              { key: 'LOST', label: 'Lost / Dropped', color: 'bg-rose-500' },
            ].map(({ key, label, color }) => {
              const count = statusCounts[key as LeadStatus] || 0;
              const pct = totalLeadsCount > 0 ? Math.round((count / totalLeadsCount) * 100) : 0;
              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                      {label}
                    </span>
                    <span className="font-bold text-neutral-900 dark:text-white">
                      {count} <span className="font-medium text-neutral-500">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div
                      className={`h-full ${color} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lead Types Share */}
        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
          <div className="mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Inquiry Type Share
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Customer demand by category
            </p>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[300px] pr-1">
            {Object.entries(typeCounts).map(([type, count]) => {
              const pct = totalLeadsCount > 0 ? Math.round((Number(count) / totalLeadsCount) * 100) : 0;
              return (
                <div
                  key={type}
                  className="flex items-center justify-between rounded-xl border border-neutral-200/60 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-800/40 p-2.5 text-xs transition-colors hover:border-neutral-300 dark:hover:border-neutral-700"
                >
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">
                    {type.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-900 dark:text-white">{count}</span>
                    <span className="rounded-md bg-neutral-200/60 dark:bg-neutral-700 px-1.5 py-0.5 text-[10px] font-bold text-neutral-700 dark:text-neutral-300">
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Interactive Data Table with Filters */}
      <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              Leads Pipeline Records
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              Showing {filteredLeads.length} of {leads.length} recorded inquiries
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search customer, phone, brand..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 py-2 pl-9 pr-3 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-lime-500 focus:bg-white dark:focus:bg-neutral-800 focus:outline-none shadow-2xs font-medium"
              />
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200 focus:border-lime-500 focus:bg-white dark:focus:bg-neutral-800 focus:outline-none shadow-2xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="INTERESTED">Interested</option>
              <option value="DEALER_ASSIGNED">Dealer Assigned</option>
              <option value="CONVERTED">Converted</option>
              <option value="LOST">Lost</option>
            </select>

            {/* Export CSV button */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-2 text-xs font-bold text-neutral-700 dark:text-neutral-200 shadow-2xs transition-all hover:border-lime-500 hover:text-lime-700 dark:hover:text-lime-400 hover:bg-neutral-50 dark:hover:bg-neutral-700"
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
                <th className="py-3 pl-3">Lead ID</th>
                <th className="py-3">Customer</th>
                <th className="py-3">Contact</th>
                <th className="py-3">Source Platform</th>
                <th className="py-3">Type</th>
                <th className="py-3">Interested In</th>
                <th className="py-3">Intent Score</th>
                <th className="py-3">Status</th>
                <th className="py-3 pr-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-neutral-500">
                    <p className="font-semibold">No leads matching your search criteria</p>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Try adjusting the search query or status filter above
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLeads.slice(0, 50).map((l) => {
                  const sStyle = statusBadgeStyles[l.status] || {
                    bg: 'bg-neutral-100 dark:bg-neutral-800',
                    text: 'text-neutral-700 dark:text-neutral-400',
                    border: 'border-neutral-200 dark:border-neutral-700',
                  };
                  return (
                    <tr
                      key={l.id}
                      className="group transition-colors hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40"
                    >
                      <td className="py-3 pl-3 font-mono text-[11px] font-bold text-neutral-500">
                        #{l.id}
                      </td>
                      <td className="py-3 font-bold text-neutral-900 dark:text-white">
                        {l.name || 'Anonymous'}
                      </td>
                      <td className="py-3 font-medium text-neutral-600 dark:text-neutral-400">
                        {l.mobile || '-'}
                      </td>
                      <td className="py-3">
                        <LeadSourcePlatformBadge sourceInfo={getLeadSourceInfo(l)} size="xs" />
                      </td>
                      <td className="py-3">
                        <span className="rounded-md bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-[10px] font-bold text-neutral-700 dark:text-neutral-300">
                          {l.leadType.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 font-medium text-neutral-800 dark:text-neutral-200">
                        {l.interestedBrand || l.tractor?.modelName || '-'}
                        {l.interestedModel ? ` • ${l.interestedModel}` : ''}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-12 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                            <div
                              className="h-full bg-lime-500 rounded-full"
                              style={{ width: `${Math.min((l.intentScore ?? 0) * 10, 100)}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono font-bold text-neutral-600 dark:text-neutral-400">
                            {l.intentScore ?? 0}/10
                          </span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${sStyle.bg} ${sStyle.text} ${sStyle.border}`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-neutral-500 dark:text-neutral-400 font-medium">
                        {new Date(l.createdAt).toLocaleDateString('en-IN', {
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
        {filteredLeads.length > 50 && (
          <p className="mt-3 text-center text-xs text-neutral-500">
            Showing first 50 records. Download full Excel / CSV to view all {filteredLeads.length} leads.
          </p>
        )}
      </div>
    </div>
  );
};
