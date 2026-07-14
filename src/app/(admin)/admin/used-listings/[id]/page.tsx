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
  Eye
} from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';
import Link from 'next/link';

export default function AdminListingModerationPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'INSPECTION' | 'LEADS'>('OVERVIEW');

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
            overallScore: latestInspection.overallScore ?? 0
          });
        } else {
          setInspectionScores({
            engineScore: 0,
            tyreScore: 0,
            hydraulicsScore: 0,
            bodyScore: 0,
            clutchScore: 0,
            overallScore: 0
          });
        }
      }

      // Fetch Leads, Documents, and Agents concurrently
      const [leadsRes, docsRes, agentsRes] = await Promise.all([
        usedTractorListingAPI.getListingEnquiries(idStr),
        usedTractorListingAPI.getListingDocuments(idStr),
        usersAPI.getAllUsers({ role: 'AGENT' })
      ]);

      if (leadsRes?.success && leadsRes?.data) setLeads(leadsRes.data);
      if (docsRes?.success && docsRes?.data) setDocuments(docsRes.data);
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
    usedTractorListingAPI.adminUpdateListingStatus(listing.id, { listingStatus: status, isCertified, rejectionReason }).then(res => {
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
    usedTractorListingAPI.adminUpdateListingStatus(listing.id, { 
      boostType: boostType,
      featuredUntil: featuredUntil ? new Date(featuredUntil).toISOString() : undefined 
    }).then(res => {
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
        res = await usedTractorInspectionAPI.assignInspector(inspectionScores.id, Number(selectedAgentId));
      } else {
        // Otherwise, create a new inspection with the inspector assigned
        const payload = {
          listingId: listing.id,
          inspectorId: Number(selectedAgentId)
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
        const createRes = await usedTractorInspectionAPI.createInspection({ listingId: Number(unwrappedParams.id) });
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

      const submitRes = await usedTractorInspectionAPI.submitInspectionReport(inspectionId, formData);

      if (submitRes.success && submitRes.data) {
        const updated = submitRes.data;
        setInspectionScores({
          id: updated.id,
          engineScore: updated.engineScore,
          tyreScore: updated.tyreScore,
          hydraulicsScore: updated.hydraulicsScore,
          bodyScore: updated.bodyScore,
          clutchScore: updated.clutchScore,
          overallScore: updated.overallScore
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
      alert("Please select a document file first.");
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
        alert("Document uploaded successfully!");
        setDocuments(prev => [...prev, res.data]);
        setNewDocFile(null);
      } else {
        alert("Failed to upload document: " + res.message);
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred while uploading the document.");
    }
    setIsUploadingDoc(false);
  };

  if (loading) {
    return <div className="p-12 flex justify-center h-[80vh] items-center"><TractorLoader className="text-[var(--color-brand-green)]" size={64} /></div>;
  }

  if (!listing) return <div className="p-12 text-center font-bold text-muted text-xl h-[80vh] flex items-center justify-center">Listing not found.</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link href="/admin/used-listings" className="text-muted hover:text-[var(--color-brand-green)] text-sm font-bold flex items-center gap-1 mb-2 transition-colors w-fit">
            <ArrowLeft size={16} /> Back to Listings
          </Link>
          <h1 className="text-4xl font-black flex items-center gap-4">
            Listing #{listing.id}
            {listing.listingStatus === ListingStatus.ACTIVE && <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-xs rounded-lg uppercase tracking-wider font-bold">Active</span>}
            {listing.listingStatus === ListingStatus.PENDING_APPROVAL && <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-xs rounded-lg uppercase tracking-wider font-bold">Pending</span>}
            {listing.listingStatus === ListingStatus.REJECTED && <span className="px-3 py-1 bg-red-500/10 text-red-500 text-xs rounded-lg uppercase tracking-wider font-bold">Rejected</span>}
          </h1>
        </div>

        {/* Moderation Controls */}
        <div className="flex flex-wrap items-center gap-3 bg-foreground/5 p-2 rounded-2xl border border-[var(--border-subtle)] shadow-sm backdrop-blur-xl">
          {listing.listingStatus !== ListingStatus.ACTIVE && (
            <button
              disabled={isUpdating}
              onClick={() => updateStatus(ListingStatus.ACTIVE)}
              className="px-6 py-2.5 bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green)]/90 text-white text-sm font-black rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <CheckCircle2 size={16} /> Approve Listing
            </button>
          )}
          {listing.listingStatus !== ListingStatus.REJECTED && (
            <button
              disabled={isUpdating}
              onClick={() => updateStatus(ListingStatus.REJECTED)}
              className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-black rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <XCircle size={16} /> Reject Listing
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* MAIN COLUMN */}
        <div className="lg:col-span-3 space-y-8">

          {/* Tabs */}
          <div className="flex gap-2 border-b border-[var(--border-subtle)] overflow-x-auto no-scrollbar">
            {['OVERVIEW', 'INSPECTION', 'LEADS', 'DOCUMENTS'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-8 py-4 text-sm font-black tracking-widest border-b-2 transition-all whitespace-nowrap ${activeTab === tab ? 'border-[var(--color-brand-green)] text-[var(--color-brand-green)] bg-[var(--color-brand-green)]/5' : 'border-transparent text-muted hover:text-foreground hover:bg-foreground/5'} rounded-t-xl`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-background rounded-[2rem] border border-[var(--border-subtle)] p-8 shadow-sm relative overflow-hidden">

                {/* Decorative Background */}
                <div className="absolute top-[-50%] right-[-10%] w-[400px] h-[400px] bg-[var(--color-brand-green)] opacity-[0.03] blur-[80px] rounded-full pointer-events-none" />

                <div className="flex flex-col md:flex-row gap-8 mb-8">
                  <div className="w-full md:w-1/3 aspect-[4/3] rounded-2xl overflow-hidden bg-foreground/5 border border-[var(--border-subtle)] shrink-0 relative group">
                    {(documents.find(d => d.docType === 'FRONT_VIEW' || d.docType === 'TRACTOR_IMAGE' || d.docType?.includes('VIEW'))?.fileUrl || documents[0]?.fileUrl) ? (
                      <img src={documents.find(d => d.docType === 'FRONT_VIEW' || d.docType === 'TRACTOR_IMAGE' || d.docType?.includes('VIEW'))?.fileUrl || documents[0]?.fileUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted gap-2">
                        <ImageIcon size={32} />
                        <span className="text-sm font-bold">No Image</span>
                      </div>
                    )}
                    {listing.isCertified && (
                      <div className="absolute top-3 right-3 bg-[var(--color-brand-green)] text-white px-3 py-1.5 rounded-lg font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow-lg">
                        <ShieldCheck size={14} /> Certified
                      </div>
                    )}
                  </div>
                  <div className="w-full">
                    <h2 className="text-3xl font-black mb-2">{listing.yearOfManufacture} {listing.tractorBrand} {listing.tractorModel}</h2>
                    <p className="text-muted font-bold flex items-center gap-2 mb-6">
                      <MapPin size={16} /> {listing.villageCity ? `${listing.villageCity}, ` : ''}{listing.district}, {listing.state} • {listing.pincode}
                    </p>

                    <div className="flex flex-wrap gap-6 p-6 bg-[var(--border-subtle)] rounded-2xl border border-[var(--border-subtle)]">
                      <div>
                        <p className="text-xs text-muted font-bold uppercase tracking-widest">Asking Price</p>
                        <p className="text-3xl font-black text-[var(--color-brand-green)] mt-1">₹{(listing.askingPrice || 0).toLocaleString('en-IN')}</p>
                        <span className="inline-block mt-2 px-2 py-0.5 bg-background border border-[var(--border-subtle)] rounded text-xs font-bold text-muted uppercase">Negotiable: {listing.isNegotiable ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="hidden md:block w-px border-[var(--border-subtle)]"></div>
                      <div>
                        <p className="text-xs text-muted font-bold uppercase tracking-widest">Market Est.</p>
                        <p className="text-xl font-black mt-1">₹{listing.estimatedMarketPrice?.toLocaleString('en-IN') || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-8 border-t border-[var(--border-subtle)]">
                  <div className="bg-foreground/5 p-4 rounded-xl">
                    <p className="text-xs text-muted font-bold uppercase tracking-widest flex items-center gap-1.5"><Clock size={14} /> Hours</p>
                    <p className="text-lg font-black mt-2">{listing.hoursUsed || 'N/A'} Hrs</p>
                  </div>
                  <div className="bg-foreground/5 p-4 rounded-xl">
                    <p className="text-xs text-muted font-bold uppercase tracking-widest flex items-center gap-1.5"><UserIcon size={14} /> Ownership</p>
                    <p className="text-lg font-black mt-2">{listing.ownership}</p>
                  </div>
                  <div className="bg-foreground/5 p-4 rounded-xl">
                    <p className="text-xs text-muted font-bold uppercase tracking-widest flex items-center gap-1.5"><Wrench size={14} /> Condition</p>
                    <p className="text-lg font-black mt-2">{listing.conditionGrade}</p>
                  </div>
                  <div className="bg-foreground/5 p-4 rounded-xl">
                    <p className="text-xs text-muted font-bold uppercase tracking-widest flex items-center gap-1.5"><FileText size={14} /> Insurance</p>
                    <p className="text-sm font-black mt-2 text-blue-500 whitespace-nowrap">
                      {listing.insuranceValidity ? new Date(listing.insuranceValidity).toLocaleDateString() : 'No'}
                    </p>
                  </div>
                  <div className="bg-foreground/5 p-4 rounded-xl">
                    <p className="text-xs text-muted font-bold uppercase tracking-widest flex items-center gap-1.5"><UserIcon size={14} /> Seller</p>
                    <p className="text-sm font-black mt-2">{listing.seller?.fullName || 'Unknown'}</p>
                    <p className="text-xs font-bold text-muted mt-1">{listing.seller?.maskedMobile || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-background rounded-[2rem] border border-[var(--border-subtle)] p-8 shadow-sm">
                <h3 className="text-xl font-black mb-4 flex items-center gap-2"><FileText className="text-[var(--color-brand-green)]" /> Seller's Description</h3>
                <div className="bg-foreground/5 p-6 rounded-2xl border border-[var(--border-subtle)]">
                  <p className="text-muted font-medium leading-relaxed whitespace-pre-wrap">{listing.description}</p>
                </div>
              </div>

              {/* Documents verification status */}
              <div className="bg-background rounded-[2rem] border border-[var(--border-subtle)] p-8 shadow-sm">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2"><FileCheck className="text-[var(--color-brand-green)]" /> Verification & Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-foreground/5 rounded-xl">
                    <span className="font-bold">RC Available</span>
                    {listing.rcAvailable ? <span className="flex items-center gap-1 text-emerald-500 font-black"><CheckCircle2 size={16} /> Yes</span> : <span className="flex items-center gap-1 text-red-500 font-black"><XCircle size={16} /> No</span>}
                  </div>
                  <div className="flex items-center justify-between p-4 bg-foreground/5 rounded-xl">
                    <span className="font-bold">Finance Available</span>
                    {listing.financeAvailable ? <span className="flex items-center gap-1 text-emerald-500 font-black"><CheckCircle2 size={16} /> Yes</span> : <span className="flex items-center gap-1 text-red-500 font-black"><XCircle size={16} /> No</span>}
                  </div>
                  <div className="flex items-center justify-between p-4 bg-foreground/5 rounded-xl">
                    <span className="font-bold">Loan Clearance</span>
                    <span className="font-black text-blue-500">{listing.loanClearanceStatus}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* INSPECTION TAB */}
          {activeTab === 'INSPECTION' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-background rounded-[2rem] border border-[var(--border-subtle)] p-8 shadow-sm relative overflow-hidden">

                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                  <h3 className="text-2xl font-black flex items-center gap-3">
                    <Wrench className="text-[var(--color-brand-green)]" size={28} />
                    Inspection Report
                  </h3>
                  
                  <div className="text-right">
                    <p className="text-xs text-muted font-bold uppercase tracking-widest mb-1">Overall Score</p>
                    {listing.inspections?.[0] ? (
                      <p className="text-4xl font-black text-[var(--color-brand-green)]">{(listing.inspections[0].overallScore ? Number(listing.inspections[0].overallScore) : 0).toFixed(1)}<span className="text-xl text-muted">/10</span></p>
                    ) : (
                      <p className="text-xl font-black text-muted">N/A</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {['engineScore', 'tyreScore', 'hydraulicsScore', 'bodyScore', 'clutchScore'].map((field) => (
                    <div key={field} className="bg-foreground/5 p-5 rounded-2xl border border-[var(--border-subtle)]">
                      <label className="flex justify-between items-center mb-3">
                        <span className="font-black capitalize">{field.replace('Score', '')} Condition</span>
                        <span className="text-xl font-black text-[var(--color-brand-green)]">{inspectionScores[field] || 0}/10</span>
                      </label>
                      <input
                        type="range"
                        min="0" max="10" step="1"
                        value={inspectionScores[field] || 0}
                        onChange={(e) => setInspectionScores({ ...inspectionScores, [field]: Number(e.target.value) })}
                        className="w-full accent-[var(--color-brand-green)]"
                      />
                    </div>
                  ))}
                </div>

                {/* Upload Tractor Images */}
                <div className="mb-8 border-t border-[var(--border-subtle)] pt-8">
                  <h4 className="text-xl font-black flex items-center gap-2 mb-4">
                    <ImageIcon className="text-[var(--color-brand-green)]" size={24} />
                    Upload Inspection Images
                  </h4>
                  <div className="bg-foreground/5 p-6 rounded-2xl border border-[var(--border-subtle)] border-dashed">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files) {
                          setInspectionImages(Array.from(e.target.files));
                        }
                      }}
                      className="block w-full text-sm text-muted
                        file:mr-4 file:py-2.5 file:px-6
                        file:rounded-xl file:border-0
                        file:text-sm file:font-black file:uppercase file:tracking-widest
                        file:bg-[var(--color-brand-green)] file:text-background
                        hover:file:bg-[var(--color-brand-green)]/90 cursor-pointer"
                    />
                    {inspectionImages.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {inspectionImages.map((file, idx) => (
                          <div key={idx} className="bg-background px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs font-bold flex items-center gap-2">
                            <span className="truncate max-w-[120px]">{file.name}</span>
                            <button onClick={() => setInspectionImages(prev => prev.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-600">
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
                    className="px-8 py-3 bg-foreground text-background hover:bg-foreground/90 font-black rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
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
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-background rounded-[2rem] border border-[var(--border-subtle)] p-8 shadow-sm">
                <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                  <MessageCircle className="text-[var(--color-brand-green)]" size={28} />
                  Buyer Enquiries ({listing.leadCount})
                </h3>

                {leads.length > 0 ? (
                  <div className="space-y-4">
                    {leads.map((lead: any) => (
                      <div key={lead.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-foreground/5 rounded-2xl border border-[var(--border-subtle)] gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center text-xl font-black text-[var(--color-brand-green)] border border-[var(--border-subtle)] shadow-sm">
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-black text-lg">{lead.name}</h4>
                            <p className="text-sm font-bold text-muted flex items-center gap-1"><Phone size={12} /> +91 {lead.mobile}</p>
                          </div>
                        </div>
                        <div className="text-left md:text-right w-full md:w-auto bg-background md:bg-transparent p-4 md:p-0 rounded-xl">
                          <p className="text-xs text-muted font-bold uppercase tracking-widest mb-1">Status</p>
                          <p className={`text-sm font-black px-3 py-1 rounded-full ${lead.status === 'CLOSED_WON' ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]' : 'bg-foreground/10 text-foreground'}`}>
                            {lead.status.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center bg-foreground/5 rounded-2xl border border-[var(--border-subtle)]">
                    <p className="text-muted font-bold">No leads have been received for this tractor yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DOCUMENTS TAB */}
          {activeTab === 'DOCUMENTS' as any && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-background rounded-[2rem] border border-[var(--border-subtle)] p-8 shadow-sm">
                <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                  <FileCheck className="text-[var(--color-brand-green)]" size={28} />
                  Listing Documents
                </h3>

                {documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.map((doc: any) => (
                      <div key={doc.id} className="flex items-center justify-between p-6 bg-foreground/5 rounded-2xl border border-[var(--border-subtle)]">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center text-[var(--color-brand-green)] border border-[var(--border-subtle)] shadow-sm">
                            <FileText size={20} />
                          </div>
                          <div>
                            <span className="font-black uppercase tracking-wider text-sm block mb-1">{doc.docType.replace('_', ' ')}</span>
                            {doc.fileUrl ? (
                              <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-1">
                                View File <ArrowLeft size={12} className="rotate-135" />
                              </a>
                            ) : (
                              <span className="text-xs font-bold text-muted">No file attached</span>
                            )}
                          </div>
                        </div>
                        {doc.isVerified ? (
                          <span className="flex items-center gap-1 text-sm font-black text-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 px-3 py-1 rounded-full">
                            <CheckCircle2 size={14} /> Verified
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-sm font-black text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">
                            Pending Verification
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center bg-foreground/5 rounded-2xl border border-[var(--border-subtle)]">
                    <p className="text-muted font-bold">No documents have been uploaded for this tractor yet.</p>
                  </div>
                )}

                {/* Upload Document Form */}
                <div className="mt-8 border-t border-[var(--border-subtle)] pt-8">
                  <h4 className="text-xl font-black mb-4">Upload New Document</h4>
                  <div className="bg-foreground/5 p-6 rounded-2xl border border-[var(--border-subtle)] space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-muted mb-2 uppercase tracking-widest">Document Type</label>
                      <select
                        value={newDocType}
                        onChange={(e) => setNewDocType(e.target.value)}
                        className="w-full bg-background border border-[var(--border-subtle)] rounded-xl px-4 py-3 font-bold"
                      >
                        <option value="RC_COPY">RC Copy</option>
                        <option value="INSURANCE_COPY">Insurance Copy</option>
                        <option value="LOAN_NOC">Loan NOC</option>
                        <option value="OTHER_DOCUMENT">Other Document</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-muted mb-2 uppercase tracking-widest">Select File (PDF, JPG, PNG)</label>
                      <input
                        type="file"
                        accept=".pdf,image/jpeg,image/png"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setNewDocFile(e.target.files[0]);
                          }
                        }}
                        className="block w-full text-sm text-muted
                          file:mr-4 file:py-2.5 file:px-6
                          file:rounded-xl file:border-0
                          file:text-sm file:font-black file:uppercase file:tracking-widest
                          file:bg-foreground file:text-background
                          hover:file:bg-foreground/90 cursor-pointer border border-[var(--border-subtle)] rounded-xl bg-background"
                      />
                    </div>
                    <button
                      onClick={handleUploadDocument}
                      disabled={isUploadingDoc || !newDocFile}
                      className="w-full mt-2 py-3 bg-[var(--color-brand-green)] text-white font-black rounded-xl hover:bg-[var(--color-brand-green)]/90 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
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
            <h3 className="text-lg font-black mb-4 flex items-center gap-2">
              <ShieldCheck className="text-[var(--color-brand-green)]" size={20} />
              Status & Moderation
            </h3>
            
            <div className="mb-6 p-4 rounded-xl bg-foreground/5 flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-widest text-muted">Current Status</span>
              <span className={`text-lg font-black ${listing.listingStatus === 'ACTIVE' ? 'text-[var(--color-brand-green)]' : listing.listingStatus === 'REJECTED' ? 'text-red-500' : ''}`}>
                {listing.listingStatus.replace('_', ' ')}
              </span>
              {listing.rejectionReason && (
                <div className="mt-2 text-sm text-red-500 font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                  <span className="block text-xs uppercase mb-1 opacity-70">Reason</span>
                  {listing.rejectionReason}
                </div>
              )}
            </div>

            {listing.listingStatus === ListingStatus.PENDING_APPROVAL && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => updateStatus(ListingStatus.ACTIVE)}
                  disabled={isUpdating}
                  className="py-3 bg-[var(--color-brand-green)] text-white font-black rounded-xl hover:bg-[var(--color-brand-green)]/90 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} /> Approve
                </button>
                <button
                  onClick={() => updateStatus(ListingStatus.REJECTED)}
                  disabled={isUpdating}
                  className="py-3 bg-red-500 text-white font-black rounded-xl hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <XCircle size={18} /> Reject
                </button>
              </div>
            )}
            
            {listing.listingStatus === ListingStatus.ACTIVE && (
              <button
                onClick={() => updateStatus(ListingStatus.PAUSED)}
                disabled={isUpdating}
                className="w-full py-3 bg-foreground/10 text-foreground font-black rounded-xl hover:bg-foreground/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Clock size={18} /> Pause Listing
              </button>
            )}

            {listing.listingStatus === ListingStatus.PAUSED && (
              <button
                onClick={() => updateStatus(ListingStatus.ACTIVE)}
                disabled={isUpdating}
                className="w-full py-3 bg-[var(--color-brand-green)] text-white font-black rounded-xl hover:bg-[var(--color-brand-green)]/90 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={18} /> Re-Activate
              </button>
            )}
          </div>

          {/* Agent Assignment Panel */}
          <div className="bg-background rounded-[2rem] border border-[var(--border-subtle)] p-6 shadow-sm">
            <h3 className="text-lg font-black mb-4 flex items-center gap-2">
              <UserIcon className="text-[var(--color-brand-green)]" size={20} />
              Agent Assignment
            </h3>
            
            <div className="space-y-4">
              {listing.inspections?.[0]?.inspectorId ? (
                <div className="mb-4 p-4 rounded-xl bg-[var(--color-brand-green)]/10 border border-[var(--color-brand-green)]/20 flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-brand-green)]">Currently Assigned</span>
                  <span className="text-lg font-black">
                    {agents.find(a => a.id === listing.inspections[0].inspectorId)?.fullName || `Agent ID: ${listing.inspections[0].inspectorId}`}
                  </span>
                </div>
              ) : (
                <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-500">Currently Assigned</span>
                  <span className="text-sm font-black text-amber-500">
                    No Agent Assigned
                  </span>
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-muted mb-2 uppercase tracking-widest">
                  {listing.inspections?.[0]?.inspectorId ? 'Re-assign Agent' : 'Assign Agent'}
                </label>
                <select 
                  value={selectedAgentId} 
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="w-full bg-foreground/5 border border-[var(--border-subtle)] rounded-xl px-4 py-3 font-bold mb-3"
                >
                  <option value="">Select Agent...</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>{agent.fullName} ({agent.mobile})</option>
                  ))}
                </select>
                <button 
                  onClick={handleAssignAgent}
                  disabled={!selectedAgentId || isAssigning}
                  className="w-full py-3 bg-[var(--color-brand-green)] text-white font-black rounded-xl hover:bg-[var(--color-brand-green)]/90 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isAssigning ? <TractorLoader size={20} /> : null}
                  {listing.inspections?.[0]?.inspectorId ? 'Update Assignment' : 'Assign Inspection'}
                </button>
              </div>
            </div>
          </div>

          {/* Visibility & Boosts Panel */}
          <div className="bg-background rounded-[2rem] border border-[var(--border-subtle)] p-6 shadow-sm">
            <h3 className="text-lg font-black mb-4 flex items-center gap-2">
              <Eye className="text-[var(--color-brand-green)]" size={20} />
              Visibility & Boosts
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted mb-2 uppercase tracking-widest">Boost Type</label>
                <select
                  value={boostType}
                  onChange={(e) => setBoostType(e.target.value)}
                  className="w-full bg-foreground/5 border border-[var(--border-subtle)] rounded-xl px-4 py-3 font-bold"
                >
                  <option value="NONE">None</option>
                  <option value="FEATURED">Featured</option>
                  <option value="PREMIUM">Premium</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-muted mb-2 uppercase tracking-widest">Featured Until</label>
                <input
                  type="date"
                  value={featuredUntil}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFeaturedUntil(e.target.value)}
                  className="w-full bg-foreground/5 border border-[var(--border-subtle)] rounded-xl px-4 py-3 font-bold"
                />
              </div>

              <button
                onClick={updateBoost}
                disabled={isUpdating}
                className="w-full py-3 bg-foreground text-background font-black rounded-xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
              >
                Apply Boost Settings
              </button>
            </div>
          </div>

          <div className="bg-background rounded-[2rem] border border-[var(--border-subtle)] p-6 shadow-sm relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none transition-all duration-700 blur-[50px] ${listing.isCertified ? 'bg-[var(--color-brand-green)] opacity-20 group-hover:opacity-40 group-hover:scale-150' : 'bg-foreground opacity-5'}`}></div>

            <div className="flex flex-col items-center text-center gap-4 py-4 relative z-10">
              <div className={`p-4 rounded-2xl ${listing.isCertified ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]' : 'bg-foreground/5 text-muted'}`}>
                <ShieldCheck size={48} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-xl font-black mb-1">TractorDost Certified</h3>
                <p className="text-sm text-muted font-medium px-4">
                  Certified tractors receive a trust badge, rank higher in search, and get up to 4x more buyer leads.
                </p>
              </div>
            </div>

            <button
              onClick={() => updateStatus(listing.listingStatus, !listing.isCertified)}
              disabled={isUpdating}
              className={`w-full py-3.5 mt-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all hover:-translate-y-0.5 active:translate-y-0 ${listing.isCertified ? 'bg-[var(--color-brand-green)] text-white shadow-lg shadow-[var(--color-brand-green)]/20' : 'bg-foreground text-background shadow-lg'}`}
            >
              {listing.isCertified ? 'Revoke Certification' : 'Mark as Certified'}
            </button>
          </div>

          <div className="bg-background rounded-[2rem] border border-[var(--border-subtle)] p-6 shadow-sm">
            <h3 className="text-lg font-black mb-5">Listing Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-foreground/5 px-4 py-3.5 rounded-xl">
                <span className="text-sm font-bold text-muted flex items-center gap-2"><Eye size={16} /> Total Views</span>
                <span className="text-lg font-black">{listing.viewsCount}</span>
              </div>
              <div className="flex justify-between items-center bg-[var(--color-brand-green)]/10 px-4 py-3.5 rounded-xl border border-[var(--color-brand-green)]/20">
                <span className="text-sm font-bold text-[var(--color-brand-green)] flex items-center gap-2"><MessageCircle size={16} /> Total Leads</span>
                <span className="text-lg font-black text-[var(--color-brand-green)]">{listing.leadCount}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
