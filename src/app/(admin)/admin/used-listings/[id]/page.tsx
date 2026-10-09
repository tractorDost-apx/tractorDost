'use client';

import React, { useState, useEffect, use } from 'react';
import { usedTractorListingAPI } from '@/lib/api/used-listings';
import { usedTractorInspectionAPI } from '@/lib/api/used-inspections';
import { mediaAPI } from '@/lib/api/media';
import { usedTractorDocumentAPI } from '@/lib/api/used-documents';
import { usersAPI } from '@/lib/api/users';
import { UsedTractorListing, ListingStatus } from '@/lib/api/usedTractors';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  FileText,
  User as UserIcon,
  MapPin,
  Calendar,
  Wrench,
  Phone,
  Image as ImageIcon,
  Save,
  MessageCircle,
  FileCheck,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';
import Link from 'next/link';

export default function AdminListingModerationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'INSPECTION' | 'LEADS'>('OVERVIEW');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Inspection form state
  const [inspectionScores, setInspectionScores] = useState<any>({});
  const [inspectionImages, setInspectionImages] = useState<File[]>([]);

  // Agent Assignment state
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    fetchListing();
  }, [unwrappedParams.id]);

  const [leads, setLeads] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);

  // Document upload state
  const [newDocFile, setNewDocFile] = useState<File | null>(null);
  const [newDocType, setNewDocType] = useState<string>('RC_COPY');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  // Boosting state
  const [boostType, setBoostType] = useState<string>('NONE');
  const [featuredUntil, setFeaturedUntil] = useState<string>('');

  const fetchListing = async () => {
    setLoading(true);
    try {
      const idStr = unwrappedParams.id;
      const res = await usedTractorListingAPI.getListingById(Number(idStr));
      if (res.success && res.data) {
        setListing(res.data);
        setBoostType(res.data.boostType || 'NONE');
        if (res.data.featuredUntil) {
          setFeaturedUntil(new Date(res.data.featuredUntil).toISOString().split('T')[0]);
        }
        const latestInspection = res.data.inspections?.[0];
        if (latestInspection) {
          setInspectionScores({
            id: latestInspection.id,
            engineScore: latestInspection.engineScore ?? 0,
            tyreScore: latestInspection.tyreScore ?? 0,
            hydraulicsScore: latestInspection.hydraulicsScore ?? 0,
            bodyScore: latestInspection.bodyScore ?? 0,
            clutchScore: latestInspection.clutchScore ?? 0,
            overallScore: latestInspection.overallScore ?? 0,
          });
        } else {
          setInspectionScores({
            engineScore: 0,
            tyreScore: 0,
            hydraulicsScore: 0,
            bodyScore: 0,
            clutchScore: 0,
            overallScore: 0,
          });
        }
      }

      // Fetch Leads, Documents, and Agents concurrently
      const [leadsRes, docsRes, agentsRes] = await Promise.all([
        usedTractorListingAPI.getListingEnquiries(idStr),
        usedTractorListingAPI.getListingDocuments(idStr),
        usersAPI.getAllUsers({ role: 'AGENT' }),
      ]);

      // Both endpoints return { data: [...], meta }
      if (leadsRes?.success && leadsRes?.data) setLeads(leadsRes.data.data);
      if (docsRes?.success && docsRes?.data) setDocuments(docsRes.data.data);
      if (agentsRes?.success && agentsRes?.data?.data) setAgents(agentsRes.data.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const updateStatus = (status: ListingStatus, isCertified?: boolean) => {
    let rejectionReason: string | undefined = undefined;
    if (status === ListingStatus.REJECTED) {
      const reason = window.prompt('Please enter a reason for rejection (minimum 10 characters):');
      if (!reason || reason.trim().length < 10) {
        alert('Rejection cancelled: A valid reason of at least 10 characters is required.');
        return;
      }
      rejectionReason = reason.trim();
    }

    setIsUpdating(true);
    usedTractorListingAPI
      .adminUpdateListingStatus(listing.id, { listingStatus: status, isCertified, rejectionReason })
      .then((res) => {
        if (res.success) {
          fetchListing();
        } else {
          alert('Failed to update status: ' + res.message);
        }
        setIsUpdating(false);
      });
  };

  const updateBoost = () => {
    setIsUpdating(true);
    usedTractorListingAPI
      .adminUpdateListingStatus(listing.id, {
        boostType: boostType === 'NONE' ? null : boostType,
        featuredUntil: featuredUntil ? new Date(featuredUntil).toISOString() : undefined,
      })
      .then((res) => {
        if (res.success) {
          alert('Visibility settings updated!');
          fetchListing();
        } else {
          alert('Failed to update visibility: ' + res.message);
        }
        setIsUpdating(false);
      });
  };

  const handleAssignAgent = async () => {
    if (!selectedAgentId) return;
    setIsAssigning(true);
    try {
      let res;
      if (inspectionScores.id) {
        // If an inspection already exists, just assign the inspector to it
        res = await usedTractorInspectionAPI.assignInspector(
          inspectionScores.id,
          Number(selectedAgentId)
        );
      } else {
        // Otherwise, create a new inspection with the inspector assigned
        const payload = {
          listingId: listing.id,
          inspectorId: Number(selectedAgentId),
        };
        res = await usedTractorInspectionAPI.createInspection(payload);
      }

      if (res.success) {
        alert('Agent assigned successfully!');
        fetchListing(); // Refresh to show inspection
      } else {
        alert('Failed to assign agent: ' + res.message);
      }
    } catch (e) {
      console.error(e);
      alert('An error occurred while assigning agent.');
    }
    setIsAssigning(false);
  };

  const handleInspectionSave = async () => {
    setIsUpdating(true);
    try {
      let inspectionId = inspectionScores.id;

      if (!inspectionId) {
        // Create an inspection first if it doesn't exist
        const createRes = await usedTractorInspectionAPI.createInspection({
          listingId: Number(unwrappedParams.id),
        });
        if (createRes.success && createRes.data) {
          inspectionId = createRes.data.id;
        } else {
          alert('Failed to create inspection: ' + createRes.message);
          setIsUpdating(false);
          return;
        }
      }

      // Submit the scores
      const formData = new FormData();
      formData.append('engineScore', String(inspectionScores.engineScore));
      formData.append('tyreScore', String(inspectionScores.tyreScore));
      formData.append('hydraulicsScore', String(inspectionScores.hydraulicsScore));
      formData.append('bodyScore', String(inspectionScores.bodyScore));
      formData.append('clutchScore', String(inspectionScores.clutchScore));
      formData.append('inspectorNotes', 'Admin updated via dashboard');

      const submitRes = await usedTractorInspectionAPI.submitInspectionReport(
        inspectionId,
        formData
      );

      if (submitRes.success && submitRes.data) {
        const updated = submitRes.data;
        setInspectionScores({
          id: updated.id,
          engineScore: updated.engineScore,
          tyreScore: updated.tyreScore,
          hydraulicsScore: updated.hydraulicsScore,
          bodyScore: updated.bodyScore,
          clutchScore: updated.clutchScore,
          overallScore: updated.overallScore,
        });

        // Upload images if any are selected
        if (inspectionImages.length > 0) {
          for (let i = 0; i < inspectionImages.length; i++) {
            const file = inspectionImages[i];
            const mediaFormData = new FormData();
            mediaFormData.append('listingId', unwrappedParams.id);
            // using TRACTOR_IMAGE as a generic catch-all for inspection images
            mediaFormData.append('docType', 'TRACTOR_IMAGE');
            mediaFormData.append('document', file);

            const mediaRes = await usedTractorDocumentAPI.uploadDocument(mediaFormData);
            if (!mediaRes.success) {
              console.error('Failed to upload inspection image:', mediaRes);
              alert('Inspection saved, but some image uploads failed.');
              setIsUpdating(false);
              return;
            }
          }
          // Clear images after successful upload
          setInspectionImages([]);
        }

        alert('Inspection saved successfully!');
      } else {
        alert('Failed to submit inspection: ' + submitRes.message);
      }
    } catch (e) {
      console.error(e);
      alert('An error occurred while saving the inspection.');
    }
    setIsUpdating(false);
  };

  const handleUploadDocument = async () => {
    if (!newDocFile) {
      alert('Please select a document file first.');
      return;
    }

    setIsUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append('listingId', unwrappedParams.id);
      formData.append('docType', newDocType);
      formData.append('document', newDocFile);

      const res = await usedTractorDocumentAPI.uploadDocument(formData);
      if (res.success && res.data) {
        alert('Document uploaded successfully!');
        setDocuments((prev) => [...prev, res.data]);
        setNewDocFile(null);
      } else {
        alert('Failed to upload document: ' + res.message);
      }
    } catch (e) {
      console.error(e);
      alert('An error occurred while uploading the document.');
    }
    setIsUploadingDoc(false);
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center p-12">
        <TractorLoader className="text-[var(--color-brand-green)]" size={64} />
      </div>
    );
  }

  if (!listing)
    return (
      <div className="text-muted flex h-[80vh] items-center justify-center p-12 text-center text-xl font-bold">
        Listing not found.
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <Link
            href="/admin/used-listings"
            className="text-muted mb-2 flex w-fit items-center gap-1 text-sm font-bold transition-colors hover:text-[var(--color-brand-green)]"
          >
            <ArrowLeft size={16} /> Back to Listings
          </Link>
          <h1 className="flex items-center gap-4 text-4xl font-black">
            Listing #{listing.id}
            {listing.listingStatus === ListingStatus.ACTIVE && (
              <span className="rounded-lg bg-emerald-500/10 px-3 py-1 text-xs font-bold tracking-wider text-emerald-500 uppercase">
                Active
              </span>
            )}
            {listing.listingStatus === ListingStatus.PENDING_APPROVAL && (
              <span className="rounded-lg bg-amber-500/10 px-3 py-1 text-xs font-bold tracking-wider text-amber-500 uppercase">
                Pending
              </span>
            )}
            {listing.listingStatus === ListingStatus.REJECTED && (
              <span className="rounded-lg bg-red-500/10 px-3 py-1 text-xs font-bold tracking-wider text-red-500 uppercase">
                Rejected
              </span>
            )}
          </h1>
        </div>

        {/* Moderation Controls */}
        <div className="bg-foreground/5 flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--border-subtle)] p-2 shadow-sm backdrop-blur-xl">
          {listing.listingStatus !== ListingStatus.ACTIVE && (
            <button
              disabled={isUpdating}
              onClick={() => updateStatus(ListingStatus.ACTIVE)}
              className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-6 py-2.5 text-sm font-black text-white transition-all hover:scale-105 hover:bg-[var(--color-brand-green)]/90 active:scale-95"
            >
              <CheckCircle2 size={16} /> Approve Listing
            </button>
          )}
          {listing.listingStatus !== ListingStatus.REJECTED && (
            <button
              disabled={isUpdating}
              onClick={() => updateStatus(ListingStatus.REJECTED)}
              className="flex items-center gap-2 rounded-xl bg-red-500 px-6 py-2.5 text-sm font-black text-white transition-all hover:scale-105 hover:bg-red-600 active:scale-95"
            >
              <XCircle size={16} /> Reject Listing
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* MAIN COLUMN */}
        <div className="space-y-8 lg:col-span-3">
          {/* Tabs */}
          <div className="no-scrollbar flex gap-2 overflow-x-auto border-b border-[var(--border-subtle)]">
            {['OVERVIEW', 'INSPECTION', 'LEADS', 'DOCUMENTS'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`border-b-2 px-8 py-4 text-sm font-black tracking-widest whitespace-nowrap transition-all ${activeTab === tab ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/5 text-[var(--color-brand-green)]' : 'text-muted hover:text-foreground hover:bg-foreground/5 border-transparent'} rounded-t-xl`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === 'OVERVIEW' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-500">
              <div className="bg-background relative overflow-hidden rounded-[2rem] border border-[var(--border-subtle)] p-8 shadow-sm">
                {/* Decorative Background */}
                <div className="pointer-events-none absolute top-[-50%] right-[-10%] h-[400px] w-[400px] rounded-full bg-[var(--color-brand-green)] opacity-[0.03] blur-[80px]" />

                <div className="mb-8 flex flex-col gap-8 md:flex-row">
                  <div className="bg-foreground/5 group relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-2xl border border-[var(--border-subtle)] md:w-1/3">
                    {listing?.media?.filter((m: any) => m.mediaType !== 'pdf').length > 0 ? (
                      <>
                        <img
                          src={
                            listing.media.filter((m: any) => m.mediaType !== 'pdf')[
                              currentImageIndex
                            ]?.url
                          }
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                        />

                        {listing.media.filter((m: any) => m.mediaType !== 'pdf').length > 1 && (
                          <>
                            {/* Left Arrow */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentImageIndex((prev) =>
                                  prev === 0
                                    ? listing.media.filter((m: any) => m.mediaType !== 'pdf')
                                        .length - 1
                                    : prev - 1
                                );
                              }}
                              className="absolute top-1/2 left-3 flex -translate-y-1/2 items-center justify-center rounded-full bg-black/50 p-2 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 hover:bg-black/70"
                            >
                              <ChevronLeft size={20} />
                            </button>

                            {/* Right Arrow */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentImageIndex((prev) =>
                                  prev ===
                                  listing.media.filter((m: any) => m.mediaType !== 'pdf').length - 1
                                    ? 0
                                    : prev + 1
                                );
                              }}
                              className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center justify-center rounded-full bg-black/50 p-2 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 hover:bg-black/70"
                            >
                              <ChevronRight size={20} />
                            </button>

                            {/* Indicators */}
                            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/40 px-2.5 py-1.5 backdrop-blur-sm">
                              {listing.media
                                .filter((m: any) => m.mediaType !== 'pdf')
                                .map((_: any, idx: number) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setCurrentImageIndex(idx);
                                    }}
                                    className={`h-1.5 w-1.5 rounded-full transition-all ${
                                      idx === currentImageIndex ? 'w-3.5 bg-white' : 'bg-foreground/50'
                                    }`}
                                  />
                                ))}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="text-muted flex h-full w-full flex-col items-center justify-center gap-2">
                        <ImageIcon size={32} />
                        <span className="text-sm font-bold">No Image</span>
                      </div>
                    )}
                    {listing.isCertified && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 rounded-lg bg-[var(--color-brand-green)] px-3 py-1.5 text-xs font-black tracking-wider text-white uppercase shadow-lg">
                        <ShieldCheck size={14} /> Certified
                      </div>
                    )}
                  </div>
                  <div className="w-full">
                    <h2 className="mb-2 text-3xl font-black">
                      {listing.yearOfManufacture} {listing.tractorBrand} {listing.tractorModel}
                    </h2>
                    <p className="text-muted mb-6 flex items-center gap-2 font-bold">
                      <MapPin size={16} /> {listing.villageCity ? `${listing.villageCity}, ` : ''}
                      {listing.district}, {listing.state} • {listing.pincode}
                    </p>

                    <div className="flex flex-wrap gap-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--border-subtle)] p-6">
                      <div>
                        <p className="text-muted text-xs font-bold tracking-widest uppercase">
                          Asking Price
                        </p>
                        <p className="mt-1 text-3xl font-black text-[var(--color-brand-green)]">
                          ₹{(listing.askingPrice || 0).toLocaleString('en-IN')}
                        </p>
                        <span className="bg-background text-muted mt-2 inline-block rounded border border-[var(--border-subtle)] px-2 py-0.5 text-xs font-bold uppercase">
                          Negotiable: {listing.isNegotiable ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="hidden w-px border-[var(--border-subtle)] md:block"></div>
                      <div>
                        <p className="text-muted text-xs font-bold tracking-widest uppercase">
                          Market Est.
                        </p>
                        <p className="mt-1 text-xl font-black">
                          ₹{listing.estimatedMarketPrice?.toLocaleString('en-IN') || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-[var(--border-subtle)] pt-8 md:grid-cols-5">
                  <div className="bg-foreground/5 rounded-xl p-4">
                    <p className="text-muted flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase">
                      <Clock size={14} /> Hours
                    </p>
                    <p className="mt-2 text-lg font-black">{listing.hoursUsed || 'N/A'} Hrs</p>
                  </div>
                  <div className="bg-foreground/5 rounded-xl p-4">
                    <p className="text-muted flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase">
                      <UserIcon size={14} /> Ownership
                    </p>
                    <p className="mt-2 text-lg font-black">{listing.ownership}</p>
                  </div>
                  <div className="bg-foreground/5 rounded-xl p-4">
                    <p className="text-muted flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase">
                      <Wrench size={14} /> Condition
                    </p>
                    <p className="mt-2 text-lg font-black">{listing.conditionGrade}</p>
                  </div>
                  <div className="bg-foreground/5 rounded-xl p-4">
                    <p className="text-muted flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase">
                      <FileText size={14} /> Insurance
                    </p>
                    <p className="mt-2 text-sm font-black whitespace-nowrap text-blue-500">
                      {listing.insuranceValidity
                        ? new Date(listing.insuranceValidity).toLocaleDateString()
                        : 'No'}
                    </p>
                  </div>
                  <div className="bg-foreground/5 rounded-xl p-4">
                    <p className="text-muted flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase">
                      <UserIcon size={14} /> Seller
                    </p>
                    <p className="mt-2 text-sm font-black">
                      {listing.seller?.fullName || 'Unknown'}
                    </p>
                    <p className="text-muted mt-1 text-xs font-bold">
                      {listing.seller?.maskedMobile || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-background rounded-[2rem] border border-[var(--border-subtle)] p-8 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-xl font-black">
                  <FileText className="text-[var(--color-brand-green)]" /> Seller's Description
                </h3>
                <div className="bg-foreground/5 rounded-2xl border border-[var(--border-subtle)] p-6">
                  <p className="text-muted leading-relaxed font-medium whitespace-pre-wrap">
                    {listing.description}
                  </p>
                </div>
              </div>

              {/* Documents verification status */}
              <div className="bg-background rounded-[2rem] border border-[var(--border-subtle)] p-8 shadow-sm">
                <h3 className="mb-6 flex items-center gap-2 text-xl font-black">
                  <FileCheck className="text-[var(--color-brand-green)]" /> Verification & Documents
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="bg-foreground/5 flex items-center justify-between rounded-xl p-4">
                    <span className="font-bold">RC Available</span>
                    {listing.rcAvailable ? (
                      <span className="flex items-center gap-1 font-black text-emerald-500">
                        <CheckCircle2 size={16} /> Yes
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 font-black text-red-500">
                        <XCircle size={16} /> No
                      </span>
                    )}
                  </div>
                  <div className="bg-foreground/5 flex items-center justify-between rounded-xl p-4">
                    <span className="font-bold">Finance Available</span>
                    {listing.financeAvailable ? (
                      <span className="flex items-center gap-1 font-black text-emerald-500">
                        <CheckCircle2 size={16} /> Yes
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 font-black text-red-500">
                        <XCircle size={16} /> No
                      </span>
                    )}
                  </div>
                  <div className="bg-foreground/5 flex items-center justify-between rounded-xl p-4">
                    <span className="font-bold">Loan Clearance</span>
                    <span className="font-black text-blue-500">{listing.loanClearanceStatus}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* INSPECTION TAB */}
          {activeTab === 'INSPECTION' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-500">
              <div className="bg-background relative overflow-hidden rounded-[2rem] border border-[var(--border-subtle)] p-8 shadow-sm">
                <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <h3 className="flex items-center gap-3 text-2xl font-black">
                    <Wrench className="text-[var(--color-brand-green)]" size={28} />
                    Inspection Report
                  </h3>

                  <div className="text-right">
                    <p className="text-muted mb-1 text-xs font-bold tracking-widest uppercase">
                      Overall Score
                    </p>
                    {listing.inspections?.[0] ? (
                      <p className="text-4xl font-black text-[var(--color-brand-green)]">
                        {(listing.inspections[0].overallScore
                          ? Number(listing.inspections[0].overallScore)
                          : 0
                        ).toFixed(1)}
                        <span className="text-muted text-xl">/10</span>
                      </p>
                    ) : (
                      <p className="text-muted text-xl font-black">N/A</p>
                    )}
                  </div>
                </div>

                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                  {['engineScore', 'tyreScore', 'hydraulicsScore', 'bodyScore', 'clutchScore'].map(
                    (field) => (
                      <div
                        key={field}
                        className="bg-foreground/5 rounded-2xl border border-[var(--border-subtle)] p-5"
                      >
                        <label className="mb-3 flex items-center justify-between">
                          <span className="font-black capitalize">
                            {field.replace('Score', '')} Condition
                          </span>
                          <span className="text-xl font-black text-[var(--color-brand-green)]">
                            {inspectionScores[field] || 0}/10
                          </span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="1"
                          value={inspectionScores[field] || 0}
                          onChange={(e) =>
                            setInspectionScores({
                              ...inspectionScores,
                              [field]: Number(e.target.value),
                            })
                          }
                          className="w-full accent-[var(--color-brand-green)]"
                        />
                      </div>
                    )
                  )}
                </div>

                {/* Upload Tractor Images */}
                <div className="mb-8 border-t border-[var(--border-subtle)] pt-8">
                  <h4 className="mb-4 flex items-center gap-2 text-xl font-black">
                    <ImageIcon className="text-[var(--color-brand-green)]" size={24} />
                    Upload Inspection Images
                  </h4>
                  <div className="bg-foreground/5 rounded-2xl border border-dashed border-[var(--border-subtle)] p-6">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files) {
                          setInspectionImages(Array.from(e.target.files));
                        }
                      }}
                      className="text-muted file:text-background block w-full cursor-pointer text-sm file:mr-4 file:rounded-xl file:border-0 file:bg-[var(--color-brand-green)] file:px-6 file:py-2.5 file:text-sm file:font-black file:tracking-widest file:uppercase hover:file:bg-[var(--color-brand-green)]/90"
                    />
                    {inspectionImages.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {inspectionImages.map((file, idx) => (
                          <div
                            key={idx}
                            className="bg-background flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-bold"
                          >
                            <span className="max-w-[120px] truncate">{file.name}</span>
                            <button
                              onClick={() =>
                                setInspectionImages((prev) => prev.filter((_, i) => i !== idx))
                              }
                              className="text-red-500 hover:text-red-600"
                            >
                              <XCircle size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-4 border-t border-[var(--border-subtle)] pt-6">
                  <button
                    onClick={handleInspectionSave}
                    disabled={isUpdating}
                    className="bg-foreground text-background hover:bg-foreground/90 flex items-center gap-2 rounded-xl px-8 py-3 font-black transition-all hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {isUpdating ? <TractorLoader size={20} /> : <Save size={18} />}
                    Save Inspection Report
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* LEADS TAB */}
          {activeTab === 'LEADS' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-500">
              <div className="bg-background rounded-[2rem] border border-[var(--border-subtle)] p-8 shadow-sm">
                <h3 className="mb-8 flex items-center gap-3 text-2xl font-black">
                  <MessageCircle className="text-[var(--color-brand-green)]" size={28} />
                  Buyer Enquiries ({listing.leadCount})
                </h3>

                {leads.length > 0 ? (
                  <div className="space-y-4">
                    {leads.map((lead: any) => (
                      <div
                        key={lead.id}
                        className="bg-foreground/5 flex flex-col items-start justify-between gap-4 rounded-2xl border border-[var(--border-subtle)] p-6 md:flex-row md:items-center"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-background flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border-subtle)] text-xl font-black text-[var(--color-brand-green)] shadow-sm">
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-lg font-black">{lead.name}</h4>
                            <p className="text-muted flex items-center gap-1 text-sm font-bold">
                              <Phone size={12} /> +91 {lead.mobile}
                            </p>
                          </div>
                        </div>
                        <div className="bg-background w-full rounded-xl p-4 text-left md:w-auto md:bg-transparent md:p-0 md:text-right">
                          <p className="text-muted mb-1 text-xs font-bold tracking-widest uppercase">
                            Status
                          </p>
                          <p
                            className={`rounded-full px-3 py-1 text-sm font-black ${lead.status === 'CLOSED_WON' ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]' : 'bg-foreground/10 text-foreground'}`}
                          >
                            {lead.status.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-foreground/5 rounded-2xl border border-[var(--border-subtle)] p-12 text-center">
                    <p className="text-muted font-bold">
                      No leads have been received for this tractor yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DOCUMENTS TAB */}
          {activeTab === ('DOCUMENTS' as any) && (
            <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-500">
              <div className="bg-background rounded-[2rem] border border-[var(--border-subtle)] p-8 shadow-sm">
                <h3 className="mb-8 flex items-center gap-3 text-2xl font-black">
                  <FileCheck className="text-[var(--color-brand-green)]" size={28} />
                  Listing Documents
                </h3>

                {documents.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {documents.map((doc: any) => (
                      <div
                        key={doc.id}
                        className="bg-foreground/5 flex items-center justify-between rounded-2xl border border-[var(--border-subtle)] p-6"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-background flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--border-subtle)] text-[var(--color-brand-green)] shadow-sm">
                            <FileText size={20} />
                          </div>
                          <div>
                            <span className="mb-1 block text-sm font-black tracking-wider uppercase">
                              {doc.docType.replace('_', ' ')}
                            </span>
                            {doc.fileUrl ? (
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-xs font-bold text-blue-500 hover:underline"
                              >
                                View File <ArrowLeft size={12} className="rotate-135" />
                              </a>
                            ) : (
                              <span className="text-muted text-xs font-bold">No file attached</span>
                            )}
                          </div>
                        </div>
                        {doc.isVerified ? (
                          <span className="flex items-center gap-1 rounded-full bg-[var(--color-brand-green)]/10 px-3 py-1 text-sm font-black text-[var(--color-brand-green)]">
                            <CheckCircle2 size={14} /> Verified
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-sm font-black text-amber-500">
                            Pending Verification
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-foreground/5 rounded-2xl border border-[var(--border-subtle)] p-12 text-center">
                    <p className="text-muted font-bold">
                      No documents have been uploaded for this tractor yet.
                    </p>
                  </div>
                )}

                {/* Upload Document Form */}
                <div className="mt-8 border-t border-[var(--border-subtle)] pt-8">
                  <h4 className="mb-4 text-xl font-black">Upload New Document</h4>
                  <div className="bg-foreground/5 space-y-4 rounded-2xl border border-[var(--border-subtle)] p-6">
                    <div>
                      <label className="text-muted mb-2 block text-sm font-bold tracking-widest uppercase">
                        Document Type
                      </label>
                      <select
                        value={newDocType}
                        onChange={(e) => setNewDocType(e.target.value)}
                        className="bg-background w-full rounded-xl border border-[var(--border-subtle)] px-4 py-3 font-bold"
                      >
                        <option value="RC_COPY">RC Copy</option>
                        <option value="INSURANCE_COPY">Insurance Copy</option>
                        <option value="LOAN_NOC">Loan NOC</option>
                        <option value="OTHER_DOCUMENT">Other Document</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-muted mb-2 block text-sm font-bold tracking-widest uppercase">
                        Select File (PDF, JPG, PNG)
                      </label>
                      <input
                        type="file"
                        accept=".pdf,image/jpeg,image/png"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setNewDocFile(e.target.files[0]);
                          }
                        }}
                        className="text-muted file:bg-foreground file:text-background hover:file:bg-foreground/90 bg-background block w-full cursor-pointer rounded-xl border border-[var(--border-subtle)] text-sm file:mr-4 file:rounded-xl file:border-0 file:px-6 file:py-2.5 file:text-sm file:font-black file:tracking-widest file:uppercase"
                      />
                    </div>
                    <button
                      onClick={handleUploadDocument}
                      disabled={isUploadingDoc || !newDocFile}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-green)] py-3 font-black text-white transition-all hover:bg-[var(--color-brand-green)]/90 active:scale-95 disabled:opacity-50"
                    >
                      {isUploadingDoc ? <TractorLoader size={20} /> : <Save size={18} />}
                      Upload Document
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Moderation, Certification & Status Panel */}
        <div className="space-y-6">
          {/* Moderation Panel */}
          <div className="bg-background rounded-[2rem] border border-[var(--border-subtle)] p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-black">
              <ShieldCheck className="text-[var(--color-brand-green)]" size={20} />
              Status & Moderation
            </h3>

            <div className="bg-foreground/5 mb-6 flex flex-col gap-1 rounded-xl p-4">
              <span className="text-muted text-xs font-bold tracking-widest uppercase">
                Current Status
              </span>
              <span
                className={`text-lg font-black ${listing.listingStatus === 'ACTIVE' ? 'text-[var(--color-brand-green)]' : listing.listingStatus === 'REJECTED' ? 'text-red-500' : ''}`}
              >
                {listing.listingStatus.replace('_', ' ')}
              </span>
              {listing.rejectionReason && (
                <div className="mt-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm font-bold text-red-500">
                  <span className="mb-1 block text-xs uppercase opacity-70">Reason</span>
                  {listing.rejectionReason}
                </div>
              )}
            </div>

            {listing.listingStatus === ListingStatus.PENDING_APPROVAL && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => updateStatus(ListingStatus.ACTIVE)}
                  disabled={isUpdating}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-green)] py-3 font-black text-white transition-all hover:bg-[var(--color-brand-green)]/90 active:scale-95 disabled:opacity-50"
                >
                  <CheckCircle2 size={18} /> Approve
                </button>
                <button
                  onClick={() => updateStatus(ListingStatus.REJECTED)}
                  disabled={isUpdating}
                  className="flex items-center justify-center gap-2 rounded-xl bg-red-500 py-3 font-black text-white transition-all hover:bg-red-600 active:scale-95 disabled:opacity-50"
                >
                  <XCircle size={18} /> Reject
                </button>
              </div>
            )}

            {listing.listingStatus === ListingStatus.ACTIVE && (
              <button
                onClick={() => updateStatus(ListingStatus.PAUSED)}
                disabled={isUpdating}
                className="bg-foreground/10 text-foreground hover:bg-foreground/20 flex w-full items-center justify-center gap-2 rounded-xl py-3 font-black transition-all active:scale-95 disabled:opacity-50"
              >
                <Clock size={18} /> Pause Listing
              </button>
            )}

            {listing.listingStatus === ListingStatus.PAUSED && (
              <button
                onClick={() => updateStatus(ListingStatus.ACTIVE)}
                disabled={isUpdating}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-green)] py-3 font-black text-white transition-all hover:bg-[var(--color-brand-green)]/90 active:scale-95 disabled:opacity-50"
              >
                <CheckCircle2 size={18} /> Re-Activate
              </button>
            )}
          </div>

          {/* Agent Assignment Panel */}
          <div className="bg-background rounded-[2rem] border border-[var(--border-subtle)] p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-black">
              <UserIcon className="text-[var(--color-brand-green)]" size={20} />
              Agent Assignment
            </h3>

            <div className="space-y-4">
              {listing.inspections?.[0]?.inspectorId ? (
                <div className="mb-4 flex flex-col gap-1 rounded-xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 p-4">
                  <span className="text-xs font-bold tracking-widest text-[var(--color-brand-green)] uppercase">
                    Currently Assigned
                  </span>
                  <span className="text-lg font-black">
                    {agents.find((a) => a.id === listing.inspections[0].inspectorId)?.fullName ||
                      `Agent ID: ${listing.inspections[0].inspectorId}`}
                  </span>
                </div>
              ) : (
                <div className="mb-4 flex flex-col gap-1 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                  <span className="text-xs font-bold tracking-widest text-amber-500 uppercase">
                    Currently Assigned
                  </span>
                  <span className="text-sm font-black text-amber-500">No Agent Assigned</span>
                </div>
              )}

              <div>
                <label className="text-muted mb-2 block text-xs font-bold tracking-widest uppercase">
                  {listing.inspections?.[0]?.inspectorId ? 'Re-assign Agent' : 'Assign Agent'}
                </label>
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="bg-foreground/5 mb-3 w-full rounded-xl border border-[var(--border-subtle)] px-4 py-3 font-bold"
                >
                  <option value="">Select Agent...</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.fullName} ({agent.mobile})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAssignAgent}
                  disabled={!selectedAgentId || isAssigning}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-green)] py-3 font-black text-white transition-all hover:bg-[var(--color-brand-green)]/90 active:scale-95 disabled:opacity-50"
                >
                  {isAssigning ? <TractorLoader size={20} /> : null}
                  {listing.inspections?.[0]?.inspectorId
                    ? 'Update Assignment'
                    : 'Assign Inspection'}
                </button>
              </div>
            </div>
          </div>

          {/* Visibility & Boosts Panel */}
          <div className="bg-background rounded-[2rem] border border-[var(--border-subtle)] p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-black">
              <Eye className="text-[var(--color-brand-green)]" size={20} />
              Visibility & Boosts
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-muted mb-2 block text-xs font-bold tracking-widest uppercase">
                  Boost Type
                </label>
                <select
                  value={boostType}
                  onChange={(e) => setBoostType(e.target.value)}
                  className="bg-foreground/5 w-full rounded-xl border border-[var(--border-subtle)] px-4 py-3 font-bold"
                >
                  <option value="NONE">None</option>
                  <option value="FEATURED">Featured</option>
                  <option value="HOMEPAGE_BOOST">Homepage Boost</option>
                  <option value="URGENT_BADGE">Urgent Badge</option>
                  <option value="TOP_OF_SEARCH">Top of Search</option>
                </select>
              </div>

              <div>
                <label className="text-muted mb-2 block text-xs font-bold tracking-widest uppercase">
                  Featured Until
                </label>
                <input
                  type="date"
                  value={featuredUntil}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFeaturedUntil(e.target.value)}
                  className="bg-foreground/5 w-full rounded-xl border border-[var(--border-subtle)] px-4 py-3 font-bold"
                />
              </div>

              <button
                onClick={updateBoost}
                disabled={isUpdating}
                className="bg-foreground text-background w-full rounded-xl py-3 font-black transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
              >
                Apply Boost Settings
              </button>
            </div>
          </div>

          <div className="bg-background group relative overflow-hidden rounded-[2rem] border border-[var(--border-subtle)] p-6 shadow-sm">
            <div
              className={`pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full blur-[50px] transition-all duration-700 ${listing.isCertified ? 'bg-[var(--color-brand-green)] opacity-20 group-hover:scale-150 group-hover:opacity-40' : 'bg-foreground opacity-5'}`}
            ></div>

            <div className="relative z-10 flex flex-col items-center gap-4 py-4 text-center">
              <div
                className={`rounded-2xl p-4 ${listing.isCertified ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]' : 'bg-foreground/5 text-muted'}`}
              >
                <ShieldCheck size={48} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="mb-1 text-xl font-black">TractorDost Certified</h3>
                <p className="text-muted px-4 text-sm font-medium">
                  Certified tractors receive a trust badge, rank higher in search, and get up to 4x
                  more buyer leads.
                </p>
              </div>
            </div>

            <button
              onClick={() => updateStatus(listing.listingStatus, !listing.isCertified)}
              disabled={isUpdating}
              className={`mt-4 w-full rounded-xl py-3.5 text-sm font-black tracking-wider uppercase transition-all hover:-translate-y-0.5 active:translate-y-0 ${listing.isCertified ? 'bg-[var(--color-brand-green)] text-white shadow-[var(--color-brand-green)]/20 shadow-lg' : 'bg-foreground text-background shadow-lg'}`}
            >
              {listing.isCertified ? 'Revoke Certification' : 'Mark as Certified'}
            </button>
          </div>

          <div className="bg-background rounded-[2rem] border border-[var(--border-subtle)] p-6 shadow-sm">
            <h3 className="mb-5 text-lg font-black">Listing Performance</h3>
            <div className="space-y-3">
              <div className="bg-foreground/5 flex items-center justify-between rounded-xl px-4 py-3.5">
                <span className="text-muted flex items-center gap-2 text-sm font-bold">
                  <Eye size={16} /> Total Views
                </span>
                <span className="text-lg font-black">{listing.viewsCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-4 py-3.5">
                <span className="flex items-center gap-2 text-sm font-bold text-[var(--color-brand-green)]">
                  <MessageCircle size={16} /> Total Leads
                </span>
                <span className="text-lg font-black text-[var(--color-brand-green)]">
                  {listing.leadCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
