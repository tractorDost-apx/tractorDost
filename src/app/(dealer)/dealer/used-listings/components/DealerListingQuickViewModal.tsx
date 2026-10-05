'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  Tractor,
  IndianRupee,
  ShieldCheck,
  MapPin,
  Calendar,
  Clock,
  User,
  Eye,
  MessageSquareText,
  FileText,
  Wrench,
  Loader2,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { usedTractorListingAPI } from '@/lib/api/used-listings';
import { usedTractorDocumentAPI } from '@/lib/api/used-documents';
import { usedTractorEnquiryAPI } from '@/lib/api/used-enquiries';
import { formatINR } from '@/lib/utils/format-currency';
import { formatDate } from '@/lib/utils/format-date';
import { docTypeLabel } from '@/lib/constants/listing-statuses';
import { ListingStatusBadge } from '@/components/used-tractors/status-badges';
import type { UsedTractorListing, UsedDocument, UsedEnquiry, LeadStatus } from '@/types/models/used-listing';

interface DealerListingQuickViewModalProps {
  listingId: number | null;
  onClose: () => void;
  onOpenPhotos?: (listingId: number, title: string) => void;
  onOpenEnquiries?: (listingId: number, title: string) => void;
}

type ModalTab = 'specs' | 'photos' | 'enquiries';

export function DealerListingQuickViewModal({
  listingId,
  onClose,
  onOpenPhotos,
  onOpenEnquiries,
}: DealerListingQuickViewModalProps) {
  const [listing, setListing] = useState<UsedTractorListing | null>(null);
  const [documents, setDocuments] = useState<UsedDocument[]>([]);
  const [enquiries, setEnquiries] = useState<UsedEnquiry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<ModalTab>('specs');

  useEffect(() => {
    if (!listingId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      usedTractorListingAPI.getListingById(listingId),
      usedTractorDocumentAPI.getAllDocuments({ listingId, limit: 50 }),
      usedTractorEnquiryAPI.getMyListingEnquiries({ listingId, limit: 50 }),
    ])
      .then(([listingRes, docsRes, enqRes]) => {
        if (!isMounted) return;
        if (listingRes.success && listingRes.data) {
          setListing(listingRes.data);
        } else {
          setError(listingRes.message || 'Failed to load listing details.');
        }

        if (docsRes.success && docsRes.data) {
          setDocuments(docsRes.data.data || []);
        }

        if (enqRes.success && enqRes.data) {
          setEnquiries(enqRes.data.data || []);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err?.message || 'Error fetching listing details.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [listingId]);

  if (!listingId) return null;

  const mediaList = listing?.media || [];
  const activeMediaUrl = mediaList[activePhotoIdx]?.url || null;
  const listingTitle = listing ? `${listing.tractorBrand} ${listing.tractorModel}` : `Listing #${listingId}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative my-8 w-full max-w-4xl rounded-2xl border border-lime-400/20 bg-slate-950 p-6 shadow-2xl md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-400/10 text-lime-400">
              <Tractor size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-foreground">
                  {listingTitle}
                </h2>
                {listing && <ListingStatusBadge status={listing.listingStatus} />}
              </div>
              <p className="text-xs text-muted font-medium">
                ID: #{listingId} &bull; Dealer Marketplace View & Inspection Report
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted hover:bg-slate-900 hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="mt-4 flex gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('specs')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'specs'
                ? 'bg-lime-400 text-black shadow-md shadow-lime-400/20'
                : 'border border-slate-800 bg-slate-900/60 text-slate-300 hover:text-foreground'
            }`}
          >
            <Tractor size={14} /> Overview & Specs
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'photos'
                ? 'bg-lime-400 text-black shadow-md shadow-lime-400/20'
                : 'border border-slate-800 bg-slate-900/60 text-slate-300 hover:text-foreground'
            }`}
          >
            <Camera size={14} /> Photos & Papers ({documents.length})
          </button>
          <button
            onClick={() => setActiveTab('enquiries')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'enquiries'
                ? 'bg-lime-400 text-black shadow-md shadow-lime-400/20'
                : 'border border-slate-800 bg-slate-900/60 text-slate-300 hover:text-foreground'
            }`}
          >
            <MessageSquareText size={14} /> Enquiries ({enquiries.length})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-lime-400" size={32} />
            <p className="text-xs text-muted font-medium mt-2">Loading tractor specifications...</p>
          </div>
        ) : error || !listing ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-red-400">{error || 'Unable to load listing details.'}</p>
            <button
              onClick={onClose}
              className="mt-4 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-foreground hover:bg-slate-700"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-6 max-h-[66vh] overflow-y-auto pr-1">
            {/* TAB 1: OVERVIEW & SPECS */}
            {activeTab === 'specs' && (
              <div className="space-y-6">
                {/* Gallery + Key Numbers */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  {/* Media gallery */}
                  <div className="lg:col-span-6 space-y-3">
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-center">
                      {activeMediaUrl ? (
                        <img
                          src={activeMediaUrl}
                          alt={listingTitle}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-600">
                          <Tractor size={48} className="stroke-[1.5]" />
                          <span className="text-xs font-medium mt-2">No photos uploaded</span>
                        </div>
                      )}
                      {listing.isCertified && (
                        <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full border border-lime-400/30 bg-slate-950/80 px-2.5 py-1 text-xs font-bold text-lime-400 backdrop-blur-sm">
                          <ShieldCheck size={14} /> Dealer Certified
                        </span>
                      )}
                    </div>

                    {mediaList.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {mediaList.map((m, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActivePhotoIdx(idx)}
                            className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                              activePhotoIdx === idx ? 'border-lime-400' : 'border-slate-800 opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={m.url} alt={`Thumb ${idx + 1}`} className="h-full w-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Top stats */}
                  <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                      <span className="text-xs font-bold text-muted uppercase tracking-wider">Asking Price</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-black text-lime-400">
                          {formatINR(listing.askingPrice)}
                        </span>
                        {listing.negotiable && (
                          <span className="rounded-md border border-lime-400/20 bg-lime-400/10 px-2 py-0.5 text-xs font-bold text-lime-300">
                            Negotiable
                          </span>
                        )}
                      </div>
                      {listing.financeAvailable && (
                        <p className="mt-2 text-xs font-semibold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 size={13} /> Loan / Financing Available at Dealership
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                        <span className="text-[11px] font-bold text-muted uppercase flex items-center gap-1">
                          <Calendar size={12} /> Year
                        </span>
                        <p className="mt-1 text-sm font-black text-foreground">{listing.yearOfManufacture}</p>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                        <span className="text-[11px] font-bold text-muted uppercase flex items-center gap-1">
                          <User size={12} /> Owner
                        </span>
                        <p className="mt-1 text-sm font-black text-foreground">{listing.ownership} Owner</p>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                        <span className="text-[11px] font-bold text-muted uppercase flex items-center gap-1">
                          <Clock size={12} /> Hours Run
                        </span>
                        <p className="mt-1 text-sm font-black text-foreground">{listing.hoursUsed ?? 0} hrs</p>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                        <span className="text-[11px] font-bold text-muted uppercase flex items-center gap-1">
                          <Eye size={12} /> Views
                        </span>
                        <p className="mt-1 text-sm font-black text-foreground">{listing.viewsCount ?? 0}</p>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                        <span className="text-[11px] font-bold text-muted uppercase flex items-center gap-1">
                          <MessageSquareText size={12} /> Leads
                        </span>
                        <p className="mt-1 text-sm font-black text-foreground">{listing.leadCount ?? 0}</p>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                        <span className="text-[11px] font-bold text-muted uppercase flex items-center gap-1">
                          <MapPin size={12} /> District
                        </span>
                        <p className="mt-1 text-sm font-black text-foreground truncate">{listing.district}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Condition & Inspection Scores */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-lime-400 mb-3">
                    <Wrench size={14} /> Condition & Inspection Breakdown
                  </h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-lg bg-slate-900/80 p-2.5">
                      <span className="text-[11px] text-muted font-bold block">Engine Health</span>
                      <span className="text-sm font-black text-foreground">
                        {listing.engineConditionPct ? `${listing.engineConditionPct}%` : 'Good'}
                      </span>
                    </div>
                    <div className="rounded-lg bg-slate-900/80 p-2.5">
                      <span className="text-[11px] text-muted font-bold block">Tyres</span>
                      <span className="text-sm font-black text-foreground">{listing.tyreCondition ?? 'Good'}</span>
                    </div>
                    <div className="rounded-lg bg-slate-900/80 p-2.5">
                      <span className="text-[11px] text-muted font-bold block">Hydraulics</span>
                      <span className="text-sm font-black text-foreground">{listing.hydraulicsCondition ?? 'Good'}</span>
                    </div>
                    <div className="rounded-lg bg-slate-900/80 p-2.5">
                      <span className="text-[11px] text-muted font-bold block">Clutch</span>
                      <span className="text-sm font-black text-foreground">{listing.clutchCondition ?? 'Good'}</span>
                    </div>
                  </div>
                </div>

                {/* Documents & Description */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                    <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-lime-400 mb-2.5">
                      <FileText size={14} /> Documents & Clearance
                    </h3>
                    <ul className="space-y-2 text-xs text-slate-300">
                      <li className="flex items-center justify-between">
                        <span className="text-muted">RC Book:</span>
                        <span className="font-bold text-foreground">
                          {listing.rcAvailable ? 'Available' : 'Not Available'}
                        </span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-muted">Loan Status:</span>
                        <span className="font-bold text-foreground">{listing.loanClearanceStatus ?? 'CLEAR'}</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-muted">Insurance Validity:</span>
                        <span className="font-bold text-foreground">
                          {listing.insuranceValidity ? formatDate(listing.insuranceValidity) : 'Expired / None'}
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                    <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-lime-400 mb-2.5">
                      <MapPin size={14} /> Dealership Location
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {listing.villageCity && `${listing.villageCity}, `}
                      {listing.district}, {listing.state}
                      {listing.pincode && ` - ${listing.pincode}`}
                    </p>
                    {listing.description && (
                      <p className="mt-3 text-xs text-muted italic border-t border-slate-800/80 pt-2">
                        &ldquo;{listing.description}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PHOTOS & PAPERS */}
            {activeTab === 'photos' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted">
                    {documents.length} photos and documents associated with this tractor
                  </span>
                  <button
                    onClick={() => onOpenPhotos?.(listing.id, listingTitle)}
                    className="flex items-center gap-1 text-xs font-bold text-lime-400 hover:underline"
                  >
                    <Camera size={13} /> Open Photo & Document Manager
                  </button>
                </div>

                {documents.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-xs text-muted">
                    No photos or paperwork uploaded for this listing yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900"
                      >
                        <div className="aspect-[4/3] w-full bg-slate-950">
                          <img src={doc.url} alt={docTypeLabel(doc.docType)} className="h-full w-full object-cover" />
                        </div>
                        <div className="p-2">
                          <span className="text-[11px] font-bold text-slate-300 block truncate">
                            {docTypeLabel(doc.docType)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ENQUIRIES */}
            {activeTab === 'enquiries' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted">
                    {enquiries.length} prospective buyer leads received
                  </span>
                  <button
                    onClick={() => onOpenEnquiries?.(listing.id, listingTitle)}
                    className="flex items-center gap-1 text-xs font-bold text-purple-400 hover:underline"
                  >
                    <MessageSquareText size={13} /> Open Leads CRM
                  </button>
                </div>

                {enquiries.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-xs text-muted">
                    No buyer inquiries received for this used tractor yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {enquiries.map((enq) => (
                      <div
                        key={enq.id}
                        className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-foreground">{enq.name}</span>
                            <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-lime-400">
                              {enq.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted mt-0.5 flex items-center gap-2">
                            <span>{enq.mobile}</span> &bull; <span>{formatDate(enq.createdAt)}</span>
                          </p>
                          {enq.message && (
                            <p className="mt-1 text-xs text-slate-300 italic">&ldquo;{enq.message}&rdquo;</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${enq.mobile}`}
                            className="rounded-lg bg-lime-400/10 px-2.5 py-1 text-xs font-bold text-lime-400 hover:bg-lime-400/20"
                          >
                            Call
                          </a>
                          <a
                            href={`https://wa.me/91${enq.mobile.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20"
                          >
                            WhatsApp
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
              <a
                href={`/dealer/used-listings/${listing.id}`}
                className="flex items-center gap-1.5 rounded-xl border border-lime-400/40 bg-lime-400/10 px-4 py-2 text-xs font-bold text-lime-400 hover:bg-lime-400/20 transition-colors"
              >
                Manage Listing & Full Details <ExternalLink size={14} />
              </a>
              <button
                onClick={onClose}
                className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-bold text-foreground hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
