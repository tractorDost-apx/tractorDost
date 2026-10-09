'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  MessageSquareText,
  Phone,
  Calendar,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  MessageCircle,
  Clock,
  Sparkles,
  Search,
} from 'lucide-react';
import { usedTractorEnquiryAPI } from '@/lib/api/used-enquiries';
import { formatDate } from '@/lib/utils/format-date';
import type { LeadStatus, UsedEnquiry } from '@/types/models/used-listing';

interface DealerListingEnquiriesModalProps {
  listingId?: number | null;
  listingTitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated?: () => void;
}

const LEAD_STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  NEW: { label: 'New Lead', color: 'text-sky-400', bg: 'bg-sky-400/10', border: 'border-sky-400/30' },
  ATTEMPTED: { label: 'Call Attempted', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30' },
  CONTACTED: { label: 'Contacted', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
  QUALIFIED: { label: 'Qualified Buyer', color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/30' },
  INTERESTED: { label: 'Highly Interested', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30' },
  DEALER_ASSIGNED: { label: 'Assigned', color: 'text-teal-400', bg: 'bg-teal-400/10', border: 'border-teal-400/30' },
  CONVERTED: { label: 'Deal Closed / Sold', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30' },
  LOST: { label: 'Lost / Not Interested', color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/30' },
  SPAM: { label: 'Spam / Invalid', color: 'text-muted', bg: 'bg-slate-400/10', border: 'border-slate-400/30' },
};

export function DealerListingEnquiriesModal({
  listingId,
  listingTitle,
  isOpen,
  onClose,
  onStatusUpdated,
}: DealerListingEnquiriesModalProps) {
  const [enquiries, setEnquiries] = useState<UsedEnquiry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await usedTractorEnquiryAPI.getMyListingEnquiries({
        ...(listingId ? { listingId } : {}),
        limit: 50,
      });
      if (res.success && res.data) {
        setEnquiries(res.data.data || []);
      }
    } catch (err: any) {
      console.error('Error fetching enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEnquiries();
      setNotice(null);
    }
  }, [isOpen, listingId]);

  if (!isOpen) return null;

  const handleStatusChange = async (enquiryId: number, nextStatus: LeadStatus) => {
    setUpdatingId(enquiryId);
    setNotice(null);

    const res = await usedTractorEnquiryAPI.updateEnquiryStatus(enquiryId, nextStatus);
    setUpdatingId(null);

    if (res.success) {
      setNotice({
        type: 'success',
        text: `Lead status updated to "${LEAD_STATUS_CONFIG[nextStatus]?.label || nextStatus}".`,
      });
      setEnquiries((prev) =>
        prev.map((e) => (e.id === enquiryId ? { ...e, status: nextStatus } : e))
      );
      onStatusUpdated?.();
    } else {
      setNotice({ type: 'error', text: res.message || 'Failed to update enquiry status.' });
    }
  };

  const filteredEnquiries = enquiries.filter((e) => {
    if (statusFilter !== 'ALL' && e.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchName = e.name?.toLowerCase().includes(q);
      const matchPhone = e.mobile?.includes(q);
      const matchMessage = e.message?.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchMessage) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative max-h-[80vh] overflow-y-auto w-full max-w-4xl rounded-2xl border border-lime-400/20 bg-[var(--background)] p-6 shadow-2xl md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
              <MessageSquareText size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground">
                Buyer Enquiries & Leads
              </h2>
              <p className="text-xs text-muted font-medium">
                {listingTitle ? `${listingTitle} (Listing #${listingId})` : 'All Used Tractor Inquiries'} &bull; Follow up with prospective buyers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted hover:bg-foreground/5 hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Notice */}
        {notice && (
          <div
            className={`mt-4 flex items-center gap-2 rounded-xl border p-3.5 text-xs font-semibold ${
              notice.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-red-500/30 bg-red-500/10 text-red-400'
            }`}
          >
            {notice.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{notice.text}</span>
          </div>
        )}

        {/* Filter Bar */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-muted" size={14} />
            <input
              type="text"
              placeholder="Search buyer name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 pl-8 pr-3 py-1.5 text-xs font-medium text-foreground focus:border-lime-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted whitespace-nowrap">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-1.5 text-xs font-bold text-foreground focus:border-lime-400 focus:outline-none"
            >
              <option value="ALL">All Statuses ({enquiries.length})</option>
              {Object.keys(LEAD_STATUS_CONFIG).map((key) => (
                <option key={key} value={key}>
                  {LEAD_STATUS_CONFIG[key as LeadStatus]?.label || key}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Leads List */}
        <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="animate-spin text-lime-400" size={30} />
              <p className="text-xs text-muted font-medium mt-2">Loading buyer enquiries...</p>
            </div>
          ) : filteredEnquiries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border-subtle)] bg-foreground/5 p-10 text-center">
              <MessageSquareText size={32} className="mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-bold text-foreground">No enquiries found</p>
              <p className="text-xs text-muted mt-1">
                {search || statusFilter !== 'ALL'
                  ? 'No buyer leads matched your search or status filter.'
                  : 'Interested buyers will appear here when they submit enquiries for this tractor.'}
              </p>
            </div>
          ) : (
            filteredEnquiries.map((enq) => {
              const cfg = LEAD_STATUS_CONFIG[enq.status] || LEAD_STATUS_CONFIG.NEW;
              const isUpdating = updatingId === enq.id;

              return (
                <div
                  key={enq.id}
                  className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-4 transition-all hover:border-[var(--border-brand)]"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-foreground">{enq.name}</span>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${cfg.bg} ${cfg.color} ${cfg.border}`}
                        >
                          {cfg.label}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-muted font-medium">
                        <span className="flex items-center gap-1 text-muted font-bold">
                          <Phone size={12} className="text-lime-400" /> {enq.mobile}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {formatDate(enq.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons & status dropdown */}
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={`tel:${enq.mobile}`}
                        className="flex items-center gap-1 rounded-xl bg-lime-400/10 px-3 py-1.5 text-xs font-bold text-lime-400 hover:bg-lime-400/20 transition-colors"
                      >
                        <Phone size={12} /> Call
                      </a>
                      <a
                        href={`https://wa.me/91${enq.mobile.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(enq.name)},%20I%20am%20contacting%20you%20regarding%20the%20used%20tractor%20listing%20on%20TractorDost.`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 rounded-xl bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                      >
                        <MessageCircle size={12} /> WhatsApp
                      </a>

                      <select
                        disabled={isUpdating}
                        value={enq.status}
                        onChange={(e) => handleStatusChange(enq.id, e.target.value as LeadStatus)}
                        className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-1.5 text-xs font-bold text-foreground focus:border-lime-400 focus:outline-none"
                      >
                        {Object.keys(LEAD_STATUS_CONFIG).map((st) => (
                          <option key={st} value={st}>
                            {LEAD_STATUS_CONFIG[st as LeadStatus]?.label || st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {enq.message && (
                    <p className="mt-3 rounded-xl bg-[var(--background)] p-3 text-xs text-muted italic border border-[var(--border-subtle)]">
                      &ldquo;{enq.message}&rdquo;
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t border-[var(--border-subtle)] pt-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-foreground/10 px-5 py-2 text-xs font-bold text-foreground hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
