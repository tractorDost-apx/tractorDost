'use client';

import React, { useState } from 'react';
import {
  MessageSquareText,
  Search,
  Filter,
  RefreshCw,
  Phone,
  User,
  Tractor,
  CheckCircle2,
  Clock,
  Send,
  X,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useReceivedEnquiries } from '@/hooks/leads/use-my-enquiries';
import { useLeadStatusUpdate } from '@/hooks/leads/use-lead-actions';
import type { UsedEnquiry, LeadStatus } from '@/types/models/used-listing';

export default function LeadsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'ALL'>('ALL');
  const [selectedEnquiry, setSelectedEnquiry] = useState<UsedEnquiry | null>(null);
  const [page, setPage] = useState(1);

  // Fetch real API data
  const { data, loading, error, reload } = useReceivedEnquiries({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    page,
  });
  const { updateStatus } = useLeadStatusUpdate();

  const enquiries = data?.data ?? [];

  // Filtered Enquiries
  const filteredEnquiries = enquiries.filter((enquiry) => {
    const location = [enquiry.city, enquiry.state, enquiry.country]
      .filter(Boolean)
      .join(', ');

    const matchesSearch =
      enquiry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enquiry.mobile.includes(searchQuery) ||
      enquiry.listing.tractorModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // KPI Metrics
  const totalLeads = data?.meta.total ?? 0;
  const newLeadsCount = enquiries.filter((e) => e.status === 'NEW').length;
  const inProgressCount = enquiries.filter(
    (e) => e.status === 'ATTEMPTED' || e.status === 'CONTACTED'
  ).length;
  const convertedCount = enquiries.filter((e) => e.status === 'CONVERTED').length;

  const handleUpdateStatus = async (enquiryId: number, newStatus: LeadStatus) => {
    await updateStatus(enquiryId, newStatus);
    reload();
    if (selectedEnquiry && selectedEnquiry.id === enquiryId) {
      setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
    }
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'NEW':
        return {
          label: 'New Lead',
          color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        };
      case 'ATTEMPTED':
      case 'CONTACTED':
        return {
          label: 'Contacted',
          color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        };
      case 'QUALIFIED':
      case 'INTERESTED':
        return {
          label: 'In Negotiation',
          color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        };
      case 'CONVERTED':
        return {
          label: 'Converted',
          color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        };
      case 'LOST':
      case 'SPAM':
        return { label: 'Closed / Lost', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' };
      case 'DEALER_ASSIGNED':
        return {
          label: 'Dealer Assigned',
          color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
        };
    }
  };

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      {/* Sleek Admin Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="shrink-0 rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 p-2.5 text-[var(--color-brand-green)]">
            <MessageSquareText size={26} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                Leads & Enquiries
              </h1>
              <span className="rounded-full border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-3 py-1 text-xs font-black tracking-wider text-[var(--color-brand-green)] uppercase">
                {totalLeads} Total Leads
              </span>
            </div>
            <p className="text-muted mt-0.5 text-xs font-bold sm:text-sm">
              Manage incoming customer purchase enquiries, test drive requests, and sales
              follow-ups.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setSearchQuery('');
            setStatusFilter('ALL');
            reload();
          }}
          className="bg-foreground/5 text-muted hover:text-foreground flex shrink-0 items-center justify-center self-start rounded-xl border border-[var(--border-subtle)] p-2.5 transition-all hover:border-[var(--color-brand-green)]/30 sm:self-auto"
          title="Reset Filters"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* KPI Stat Strip Layout */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-foreground/5 flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] p-4 sm:p-5">
          <div className="shrink-0 rounded-xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 p-3 text-[var(--color-brand-green)]">
            <MessageSquareText size={22} />
          </div>
          <div>
            <div className="text-foreground text-2xl font-black tracking-tight">{totalLeads}</div>
            <div className="text-muted text-xs font-bold tracking-wider uppercase">
              Total Enquiries
            </div>
          </div>
        </div>

        <div className="bg-foreground/5 flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] p-4 sm:p-5">
          <div className="shrink-0 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-amber-500">
            <Clock size={22} />
          </div>
          <div>
            <div className="text-foreground text-2xl font-black tracking-tight">
              {newLeadsCount}
            </div>
            <div className="text-muted text-xs font-bold tracking-wider uppercase">
              New Enquiries
            </div>
          </div>
        </div>

        <div className="bg-foreground/5 flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] p-4 sm:p-5">
          <div className="shrink-0 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-500">
            <Phone size={22} />
          </div>
          <div>
            <div className="text-foreground text-2xl font-black tracking-tight">
              {inProgressCount}
            </div>
            <div className="text-muted text-xs font-bold tracking-wider uppercase">
              In Negotiation
            </div>
          </div>
        </div>

        <div className="bg-foreground/5 flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] p-4 sm:p-5">
          <div className="shrink-0 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-500">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="text-foreground text-2xl font-black tracking-tight">
              {convertedCount}
            </div>
            <div className="text-muted text-xs font-bold tracking-wider uppercase">
              Converted Sales
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Control Bar */}
      <div className="flex flex-col items-stretch justify-between gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search size={18} className="text-muted absolute top-3 left-3.5" />
          <input
            type="text"
            placeholder="Search by farmer name, phone number, model, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] py-2 pr-4 pl-10 text-xs font-medium transition-colors focus:border-[var(--color-brand-green)] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-foreground/5 flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3 py-1.5 text-xs">
            <Filter size={14} className="text-muted shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter((e.target.value || 'ALL') as LeadStatus | 'ALL');
                setPage(1);
              }}
              className="text-foreground cursor-pointer bg-transparent font-bold focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New Lead</option>
              <option value="ATTEMPTED">Attempted</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="INTERESTED">Interested</option>
              <option value="CONVERTED">Converted</option>
              <option value="LOST">Lost</option>
              <option value="SPAM">Spam</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lead Table Container */}
      <div className="bg-foreground/5 rounded-3xl border border-[var(--border-subtle)] p-4 sm:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-[var(--color-brand-green)]" size={28} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-red-400 font-medium mb-4">{error}</p>
            <button
              onClick={reload}
              className="bg-[var(--color-brand-green)] text-black px-4 py-2 rounded-xl font-bold text-xs"
            >
              Try Again
            </button>
          </div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquareText className="text-muted mb-3" size={36} />
            <p className="text-foreground font-bold">No enquiries found</p>
            <p className="text-muted text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="text-muted border-b border-[var(--border-subtle)] text-xs font-bold tracking-wider uppercase">
                    <th className="px-2 lg:px-3 py-3">Customer Info</th>
                    <th className="px-2 lg:px-3 py-3">Target Model</th>
                    <th className="px-2 lg:px-3 py-3">Location</th>
                    <th className="px-2 lg:px-3 py-3">Lead Status</th>
                    <th className="px-2 lg:px-3 py-3">Date Logged</th>
                    <th className="px-2 lg:px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] text-xs font-medium">
                  {filteredEnquiries.map((enquiry) => {
                    const statusBadge = getStatusBadge(enquiry.status);
                    const location = [enquiry.city, enquiry.state].filter(Boolean).join(', ');
                    return (
                      <tr
                        key={enquiry.id}
                        onClick={() => setSelectedEnquiry(enquiry)}
                        className="hover:bg-foreground/5 group cursor-pointer transition-colors"
                      >
                        <td className="px-2 lg:px-3 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 font-bold text-[var(--color-brand-green)]">
                              <User size={18} />
                            </div>
                            <div>
                              <div className="text-foreground text-sm font-black tracking-tight transition-colors group-hover:text-[var(--color-brand-green)]">
                                {enquiry.name}
                              </div>
                              <div className="text-muted mt-0.5 flex items-center gap-2 font-mono text-xs">
                                <span>{enquiry.mobile}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-2 lg:px-3 py-3">
                          <div className="text-foreground flex items-center gap-1.5 text-xs font-bold">
                            <Tractor size={14} className="shrink-0 text-[var(--color-brand-green)]" />
                            {enquiry.listing.tractorBrand} {enquiry.listing.tractorModel}
                          </div>
                        </td>

                        <td className="px-2 lg:px-3 py-3">
                          <span className="text-foreground/80 text-xs">
                            {location || 'Location not shared'}
                          </span>
                        </td>

                        <td className="px-2 lg:px-3 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${statusBadge.color}`}
                          >
                            {statusBadge.label}
                          </span>
                        </td>

                        <td className="px-2 lg:px-3 py-3">
                          <div className="text-muted font-mono text-xs">
                            {new Date(enquiry.createdAt).toLocaleDateString()}
                          </div>
                        </td>

                        <td className="px-2 lg:px-3 py-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEnquiry(enquiry);
                            }}
                            className="bg-foreground/5 text-muted inline-flex items-center gap-1 rounded-xl border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-bold transition-colors hover:bg-[var(--color-brand-green)]/10 hover:text-[var(--color-brand-green)]"
                          >
                            View & Manage <ChevronRight size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="space-y-4 md:hidden">
              {filteredEnquiries.map((enquiry) => {
                const statusBadge = getStatusBadge(enquiry.status);
                const location = [enquiry.city, enquiry.state].filter(Boolean).join(', ');
                return (
                  <div
                    key={enquiry.id}
                    onClick={() => setSelectedEnquiry(enquiry)}
                    className="bg-foreground/5 cursor-pointer space-y-3 rounded-2xl border border-[var(--border-subtle)] p-4 transition-all hover:border-[var(--color-brand-green)]/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 font-bold text-[var(--color-brand-green)]">
                          <User size={18} />
                        </div>
                        <div>
                          <h4 className="text-foreground text-sm leading-tight font-black">
                            {enquiry.name}
                          </h4>
                          <p className="text-muted mt-0.5 text-xs">
                            {enquiry.mobile} {location && `• ${location}`}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusBadge.color}`}
                      >
                        {statusBadge.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-2 text-xs">
                      <span className="text-foreground flex items-center gap-1 font-bold">
                        <Tractor size={12} className="text-[var(--color-brand-green)]" />{' '}
                        {enquiry.listing.tractorBrand} {enquiry.listing.tractorModel}
                      </span>
                      <span className="text-muted font-mono text-[10px]">
                        {new Date(enquiry.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Lead Detail & Disposition Modal */}
      {selectedEnquiry && (
        <div className="animate-fade-in fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/25 dark:bg-black/60 backdrop-blur-sm">
          <div className="text-foreground relative flex w-full max-h-[80vh] max-w-xl flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--background)] shadow-2xl [backdrop-filter:none]">
            <div className="bg-foreground/5 shrink-0 flex items-center justify-between border-b border-[var(--border-subtle)] p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 p-2.5 text-[var(--color-brand-green)]">
                  <User size={22} />
                </div>
                <div>
                  <h3 className="text-foreground text-xl font-black tracking-tight">
                    {selectedEnquiry.name}
                  </h3>
                  <p className="text-muted font-mono text-xs">Enquiry ID #{selectedEnquiry.id}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedEnquiry(null)}
                className="text-muted hover:text-foreground hover:bg-foreground/10 rounded-xl p-2 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 p-6">
              {/* Contact Details Grid */}
              <div className="bg-foreground/5 grid grid-cols-2 gap-4 rounded-2xl border border-[var(--border-subtle)] p-4 text-xs">
                <div>
                  <span className="text-muted block font-bold">Phone Number</span>
                  <a
                    href={`tel:${selectedEnquiry.mobile}`}
                    className="mt-0.5 flex items-center gap-1.5 text-sm font-black text-[var(--color-brand-green)] hover:underline"
                  >
                    <Phone size={14} /> {selectedEnquiry.mobile}
                  </a>
                </div>
                <div>
                  <span className="text-muted block font-bold">Location</span>
                  <span className="text-foreground mt-0.5 block text-sm font-bold">
                    {[selectedEnquiry.city, selectedEnquiry.state]
                      .filter(Boolean)
                      .join(', ') || 'Not shared'}
                  </span>
                </div>
                <div>
                  <span className="text-muted block font-bold">Interested Model</span>
                  <span className="text-foreground mt-0.5 block font-bold">
                    {selectedEnquiry.listing.tractorBrand} {selectedEnquiry.listing.tractorModel}
                  </span>
                </div>
                <div>
                  <span className="text-muted block font-bold">Enquiry Status</span>
                  <span className="text-foreground mt-0.5 block font-bold">
                    {selectedEnquiry.status}
                  </span>
                </div>
              </div>

              {/* Enquiry Message */}
              {selectedEnquiry.message && (
                <div className="bg-foreground/5 rounded-2xl border border-[var(--border-subtle)] p-4 text-xs">
                  <span className="text-muted block font-bold mb-2">Enquiry Message</span>
                  <p className="text-foreground/90 leading-relaxed font-medium">
                    {selectedEnquiry.message}
                  </p>
                </div>
              )}

              {/* Update Lead Status */}
              <div className="space-y-2">
                <label className="text-muted block text-xs font-bold tracking-wider uppercase">
                  Update Lead Status
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {(['NEW', 'ATTEMPTED', 'CONTACTED', 'QUALIFIED', 'INTERESTED', 'CONVERTED', 'LOST'] as const).map(
                    (st) => {
                      const active = selectedEnquiry.status === st;
                      return (
                        <button
                          key={st}
                          onClick={() => handleUpdateStatus(selectedEnquiry.id, st)}
                          className={`rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
                            active
                              ? 'border-[var(--color-brand-green)]/40 bg-[var(--color-brand-green)]/20 text-[var(--color-brand-green)] shadow-sm'
                              : 'bg-foreground/5 text-muted hover:text-foreground hover:bg-foreground/10 border-[var(--border-subtle)]'
                          }`}
                        >
                          {st.replace('_', ' ')}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Enquiry Details */}
              <div className="bg-foreground/5 rounded-2xl border border-[var(--border-subtle)] p-4 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted font-bold">Submitted</span>
                  <span className="text-foreground font-mono">
                    {new Date(selectedEnquiry.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted font-bold">Updated</span>
                  <span className="text-foreground font-mono">
                    {new Date(selectedEnquiry.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
