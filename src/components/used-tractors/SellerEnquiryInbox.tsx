'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Loader2, MessageSquareText, Phone, Tractor, MapPin, Eye, X, StickyNote } from 'lucide-react';
import { SpatialButton } from '@/components/ui/spatial-button';
import { LeadStatusBadge } from '@/components/used-tractors/status-badges';
import LeadNotesPanel from '@/components/used-tractors/LeadNotesPanel';
import { useReceivedEnquiries } from '@/hooks/leads/use-my-enquiries';
import { useLeadStatusUpdate } from '@/hooks/leads/use-lead-actions';
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_TRANSITIONS,
} from '@/lib/constants/lead-statuses';
import { formatDateTime } from '@/lib/utils/format-date';
import type { LeadStatus, UsedEnquiry } from '@/types/models/used-listing';

interface SellerEnquiryInboxProps {
  /** Restrict to one listing; omit for all of the seller's listings */
  listingId?: number;
  /** Base route of the seller's listing pages, used to link each lead to its listing */
  listingBasePath?: string;
  title?: string;
  description?: string;
}

const SELECT_CLASS =
  'bg-secondary/20 border border-border/50 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/50 transition-all';

export default function SellerEnquiryInbox({
  listingId,
  listingBasePath,
  title = 'Buyer Enquiries',
  description = 'Buyers who contacted you about your tractors. Call them and keep each lead status up to date.',
}: SellerEnquiryInboxProps) {
  const [status, setStatus] = useState<LeadStatus | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [rowError, setRowError] = useState<{ id: number; text: string } | null>(null);
  const [selectedEnquiry, setSelectedEnquiry] = useState<UsedEnquiry | null>(null);
  const [notesEnquiry, setNotesEnquiry] = useState<UsedEnquiry | null>(null);

  const { data, loading, error, reload } = useReceivedEnquiries({ listingId, status, page });
  const { pendingId, updateStatus } = useLeadStatusUpdate();

  const enquiries = data?.data ?? [];
  const totalPages = data?.meta.totalPages ?? 1;

  const handleStatusChange = async (enquiry: UsedEnquiry, next: LeadStatus) => {
    setRowError(null);
    const res = await updateStatus(enquiry.id, next);
    if (res.success) {
      reload();
    } else {
      setRowError({ id: enquiry.id, text: res.message });
    }
  };

  return (
    <div className="flex flex-col">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-foreground mb-2 text-2xl font-black">{title}</h2>
          <p className="text-muted font-medium">{description}</p>
        </div>
        <select
          value={status ?? ''}
          onChange={(e) => {
            setStatus((e.target.value || undefined) as LeadStatus | undefined);
            setPage(1);
          }}
          className={SELECT_CLASS}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {LEAD_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-lime-400" size={28} />
        </div>
      ) : error ? (
        <div className="glass-inner p-8 text-center">
          <p className="mb-4 font-medium text-red-400">{error}</p>
          <SpatialButton variant="glass" onClick={reload}>
            Try again
          </SpatialButton>
        </div>
      ) : enquiries.length === 0 ? (
        <div className="glass-inner flex flex-col items-center p-10 text-center">
          <MessageSquareText className="text-muted mb-3" size={36} />
          <p className="text-foreground font-bold">No enquiries yet</p>
          <p className="text-muted text-sm">Enquiries appear here as soon as buyers contact you.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map((enquiry) => {
            const nextStatuses = LEAD_STATUS_TRANSITIONS[enquiry.status];
            const busy = pendingId === enquiry.id;
            return (
              <div key={enquiry.id} className="glass-inner p-5">
                <div className="mb-3 flex flex-col justify-between gap-3 md:flex-row md:items-start">
                  <div>
                    <p className="text-foreground text-lg font-bold">{enquiry.name}</p>
                    <a
                      href={`tel:${enquiry.mobile}`}
                      className="flex items-center gap-1 text-sm font-bold text-lime-400 hover:text-lime-300"
                    >
                      <Phone size={14} /> {enquiry.mobile}
                    </a>
                    {!listingId && (
                      <p className="text-muted mt-1 flex items-center gap-1 text-sm">
                        <Tractor size={14} />
                        {listingBasePath ? (
                          <Link
                            href={`${listingBasePath}/${enquiry.listing.id}`}
                            className="hover:text-lime-400"
                          >
                            {enquiry.listing.tractorBrand} {enquiry.listing.tractorModel}
                          </Link>
                        ) : (
                          `${enquiry.listing.tractorBrand} ${enquiry.listing.tractorModel}`
                        )}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-start gap-2 md:items-end">
                    <LeadStatusBadge status={enquiry.status} />
                    <span className="text-muted text-xs font-bold">
                      {formatDateTime(enquiry.createdAt)}
                    </span>
                  </div>
                </div>

                {enquiry.message && (
                  <p className="bg-secondary/20 text-foreground mb-3 rounded-xl p-3 text-sm">
                    &ldquo;{enquiry.message}&rdquo;
                  </p>
                )}

                {(enquiry.city || enquiry.state || enquiry.country || enquiry.pincode) && (
                  <div className="mb-3 flex items-start gap-2 rounded-xl bg-lime-400/5 border border-lime-400/20 p-3">
                    <MapPin size={14} className="text-lime-400 shrink-0 mt-0.5" />
                    <div className="flex-1 text-sm">
                      <p className="text-muted text-[11px] font-bold uppercase tracking-wider mb-1">Buyer Location</p>
                      <p className="text-foreground font-semibold">
                        {[enquiry.city, enquiry.state, enquiry.country, enquiry.pincode]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setSelectedEnquiry(enquiry)}
                    className="glass-button px-3 py-1.5 text-xs font-bold text-foreground hover:text-lime-400 flex items-center gap-1"
                  >
                    <Eye size={13} /> View Details
                  </button>
                  <button
                    onClick={() => setNotesEnquiry(enquiry)}
                    className="glass-button px-3 py-1.5 text-xs font-bold text-foreground hover:text-lime-400 flex items-center gap-1"
                  >
                    <StickyNote size={13} className="text-lime-400" /> Lead Notes
                  </button>
                  {nextStatuses.length === 0 ? (
                    <span className="text-muted text-xs font-medium">Closed lead</span>
                  ) : (
                    <>
                      <span className="text-muted text-xs font-bold uppercase">Move to</span>
                      {nextStatuses.map((next) => (
                        <button
                          key={next}
                          disabled={busy}
                          onClick={() => handleStatusChange(enquiry, next)}
                          className={`glass-button px-3 py-1.5 text-xs font-bold disabled:opacity-40 ${
                            next === 'SPAM' || next === 'LOST'
                              ? 'text-muted hover:text-red-400'
                              : 'text-foreground hover:text-lime-400'
                          }`}
                        >
                          {LEAD_STATUS_LABELS[next]}
                        </button>
                      ))}
                      {busy && <Loader2 size={14} className="animate-spin text-lime-400" />}
                    </>
                  )}
                </div>
                {rowError?.id === enquiry.id && (
                  <p className="mt-2 text-xs text-red-400">{rowError.text}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="glass-button text-foreground px-4 py-2 text-sm font-bold disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-muted text-sm font-bold">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="glass-button text-foreground px-4 py-2 text-sm font-bold disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* Details Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="glass-inner relative w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-[2rem] p-6 sm:p-8">
            {/* Close Button */}
            <button
              onClick={() => setSelectedEnquiry(null)}
              className="absolute top-4 right-4 text-muted hover:text-foreground transition-colors"
            >
              <X size={24} />
            </button>

            {/* Header */}
            <div className="mb-6">
              <h3 className="text-2xl font-black text-foreground mb-1">{selectedEnquiry.name}</h3>
              <a
                href={`tel:${selectedEnquiry.mobile}`}
                className="flex items-center gap-1 text-sm font-bold text-lime-400 hover:text-lime-300"
              >
                <Phone size={14} /> {selectedEnquiry.mobile}
              </a>
              <div className="flex items-center gap-2 mt-2">
                <LeadStatusBadge status={selectedEnquiry.status} />
                <span className="text-muted text-xs font-bold">
                  {formatDateTime(selectedEnquiry.createdAt)}
                </span>
              </div>
            </div>

            {/* Listing Info */}
            <div className="mb-6 pb-6 border-b border-border">
              <p className="text-muted text-xs font-bold uppercase tracking-wider mb-2">Interested In</p>
              <p className="text-foreground font-bold">
                {selectedEnquiry.listing.tractorBrand} {selectedEnquiry.listing.tractorModel}
              </p>
            </div>

            {/* Message */}
            {selectedEnquiry.message && (
              <div className="mb-6 pb-6 border-b border-border">
                <p className="text-muted text-xs font-bold uppercase tracking-wider mb-2">Message</p>
                <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedEnquiry.message}
                </p>
              </div>
            )}

            {/* Location Information */}
            {(selectedEnquiry.city || selectedEnquiry.state || selectedEnquiry.country || selectedEnquiry.pincode || selectedEnquiry.zone) && (
              <div className="mb-6 pb-6 border-b border-border">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={16} className="text-lime-400" />
                  <p className="text-muted text-xs font-bold uppercase tracking-wider">Buyer's Location</p>
                </div>
                <div className="space-y-2 text-sm">
                  {selectedEnquiry.city && (
                    <div className="flex justify-between">
                      <span className="text-muted font-semibold">City</span>
                      <span className="text-foreground font-bold">{selectedEnquiry.city}</span>
                    </div>
                  )}
                  {selectedEnquiry.state && (
                    <div className="flex justify-between">
                      <span className="text-muted font-semibold">State</span>
                      <span className="text-foreground font-bold">{selectedEnquiry.state}</span>
                    </div>
                  )}
                  {selectedEnquiry.country && (
                    <div className="flex justify-between">
                      <span className="text-muted font-semibold">Country</span>
                      <span className="text-foreground font-bold">{selectedEnquiry.country}</span>
                    </div>
                  )}
                  {selectedEnquiry.pincode && (
                    <div className="flex justify-between">
                      <span className="text-muted font-semibold">Pincode</span>
                      <span className="text-foreground font-bold">{selectedEnquiry.pincode}</span>
                    </div>
                  )}
                  {selectedEnquiry.zone && (
                    <div className="flex justify-between">
                      <span className="text-muted font-semibold">Zone</span>
                      <span className="text-foreground font-bold">{selectedEnquiry.zone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted font-semibold">Enquiry ID</span>
                <span className="text-foreground font-mono text-xs">{selectedEnquiry.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted font-semibold">Submitted</span>
                <span className="text-foreground text-xs">{formatDateTime(selectedEnquiry.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted font-semibold">Last Updated</span>
                <span className="text-foreground text-xs">{formatDateTime(selectedEnquiry.updatedAt)}</span>
              </div>
            </div>

            {/* Note about GPS coordinates */}
            <div className="mt-6 pt-6 border-t border-border text-xs text-muted">
              <p>
                ℹ️ GPS coordinates are not displayed for privacy reasons. Address information above is sufficient for
                follow-up.
              </p>
            </div>

            {/* Lead Notes Section */}
            <div className="mt-6 pt-6 border-t border-border">
              <LeadNotesPanel leadId={selectedEnquiry.id} />
            </div>

            {/* Close Button */}
            <button
              onClick={() => setSelectedEnquiry(null)}
              className="mt-6 w-full bg-lime-400 hover:bg-lime-500 text-black rounded-xl py-2.5 text-xs font-black transition-colors"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      {/* Dedicated Lead Notes Modal */}
      {notesEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="glass-inner relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-[2rem] p-6 sm:p-8">
            {/* Close Button */}
            <button
              onClick={() => setNotesEnquiry(null)}
              className="absolute top-4 right-4 text-muted hover:text-foreground transition-colors p-2"
              aria-label="Close"
            >
              <X size={22} />
            </button>

            {/* Header */}
            <div className="mb-6 pb-4 border-b border-border">
              <div className="flex items-center gap-2 mb-1">
                <StickyNote size={20} className="text-lime-400" />
                <h3 className="text-xl font-black text-foreground">
                  Lead Notes — {notesEnquiry.name}
                </h3>
              </div>
              <p className="text-muted text-xs font-medium">
                Record customer discussions, negotiations, and next follow-up milestones for this enquiry.
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <a
                  href={`tel:${notesEnquiry.mobile}`}
                  className="flex items-center gap-1 text-xs font-bold text-lime-400 hover:text-lime-300"
                >
                  <Phone size={13} /> {notesEnquiry.mobile}
                </a>
                <span className="text-muted text-xs">•</span>
                <span className="text-foreground text-xs font-semibold">
                  {notesEnquiry.listing.tractorBrand} {notesEnquiry.listing.tractorModel}
                </span>
                <span className="text-muted text-xs">•</span>
                <LeadStatusBadge status={notesEnquiry.status} />
              </div>
            </div>

            <LeadNotesPanel leadId={notesEnquiry.id} />

            <button
              onClick={() => setNotesEnquiry(null)}
              className="mt-6 w-full bg-secondary/30 hover:bg-secondary/50 text-foreground border border-border/50 rounded-xl py-2.5 text-xs font-bold transition-colors"
            >
              Close Notes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
