'use client';

import React, { useState, useEffect, use } from 'react';
import { usedTractorAPI, UsedTractorListing, ListingStatus } from '@/lib/api/usedTractors';
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
  Loader2,
  Phone,
  Image as ImageIcon,
  Save,
  MessageCircle,
  FileCheck,
  Eye
} from 'lucide-react';
import Link from 'next/link';

export default function AdminListingModerationPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'INSPECTION' | 'LEADS'>('OVERVIEW');

  // Inspection form state
  const [inspectionScores, setInspectionScores] = useState<any>({});

  useEffect(() => {
    fetchListing();
  }, [unwrappedParams.id]);

  const fetchListing = () => {
    setLoading(true);
    usedTractorAPI.getListingById(Number(unwrappedParams.id)).then(res => {
      if (res.success && res.data) {
        setListing(res.data);
        if (res.data.inspection) {
          setInspectionScores(res.data.inspection);
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
      setLoading(false);
    });
  };

  const updateStatus = (status: ListingStatus, isCertified?: boolean) => {
    setIsUpdating(true);
    usedTractorAPI.updateListingStatus(listing.id, status, isCertified).then(res => {
      if (res.success) {
        setListing({ ...listing, listingStatus: status, isCertified: isCertified ?? listing.isCertified });
      }
      setIsUpdating(false);
    });
  };

  const handleInspectionSave = () => {
    setIsUpdating(true);
    // Simulate calculating overall average
    const total = Number(inspectionScores.engineScore) + Number(inspectionScores.tyreScore) + Number(inspectionScores.hydraulicsScore) + Number(inspectionScores.bodyScore) + Number(inspectionScores.clutchScore);
    const overall = total / 5;
    
    usedTractorAPI.updateInspection(listing.id, { ...inspectionScores, overallScore: overall }).then(res => {
      setListing({ ...listing, inspection: { ...inspectionScores, overallScore: overall }});
      setIsUpdating(false);
    });
  };

  if (loading) {
    return <div className="p-12 flex justify-center h-[80vh] items-center"><Loader2 className="animate-spin text-[var(--color-brand-green)]" size={48} /></div>;
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
             {['OVERVIEW', 'INSPECTION', 'LEADS'].map((tab) => (
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
                       {listing.imageUrl ? (
                         <img src={listing.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
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
                       <p className="text-muted font-bold flex items-center gap-2 mb-6"><MapPin size={16}/> {listing.district}, {listing.state} • {listing.pinCode}</p>
                       
                       <div className="flex flex-wrap gap-6 p-6 bg-[var(--border-subtle)] rounded-2xl border border-[var(--border-subtle)]">
                          <div>
                            <p className="text-xs text-muted font-bold uppercase tracking-widest">Asking Price</p>
                            <p className="text-3xl font-black text-[var(--color-brand-green)] mt-1">₹{listing.askingPrice.toLocaleString('en-IN')}</p>
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

                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-[var(--border-subtle)]">
                   <div className="bg-foreground/5 p-4 rounded-xl">
                     <p className="text-xs text-muted font-bold uppercase tracking-widest flex items-center gap-1.5"><Clock size={14}/> Hours</p>
                     <p className="text-lg font-black mt-2">{listing.hoursUsed} Hrs</p>
                   </div>
                   <div className="bg-foreground/5 p-4 rounded-xl">
                     <p className="text-xs text-muted font-bold uppercase tracking-widest flex items-center gap-1.5"><UserIcon size={14}/> Ownership</p>
                     <p className="text-lg font-black mt-2">{listing.ownership}</p>
                   </div>
                   <div className="bg-foreground/5 p-4 rounded-xl">
                     <p className="text-xs text-muted font-bold uppercase tracking-widest flex items-center gap-1.5"><Wrench size={14}/> Condition</p>
                     <p className="text-lg font-black mt-2">{listing.conditionGrade}</p>
                   </div>
                   <div className="bg-foreground/5 p-4 rounded-xl">
                     <p className="text-xs text-muted font-bold uppercase tracking-widest flex items-center gap-1.5"><FileText size={14}/> Insurance</p>
                     <p className="text-lg font-black mt-2 text-blue-500">{listing.insuranceAvailable ? 'Valid' : 'No'}</p>
                   </div>
                 </div>
               </div>

               <div className="bg-background rounded-[2rem] border border-[var(--border-subtle)] p-8 shadow-sm">
                 <h3 className="text-xl font-black mb-4 flex items-center gap-2"><FileText className="text-[var(--color-brand-green)]"/> Seller's Description</h3>
                 <div className="bg-foreground/5 p-6 rounded-2xl border border-[var(--border-subtle)]">
                   <p className="text-muted font-medium leading-relaxed whitespace-pre-wrap">{listing.description}</p>
                 </div>
               </div>

               {/* Documents verification status */}
               <div className="bg-background rounded-[2rem] border border-[var(--border-subtle)] p-8 shadow-sm">
                 <h3 className="text-xl font-black mb-6 flex items-center gap-2"><FileCheck className="text-[var(--color-brand-green)]"/> Verification & Documents</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-foreground/5 rounded-xl">
                       <span className="font-bold">RC Available</span>
                       {listing.rcAvailable ? <span className="flex items-center gap-1 text-emerald-500 font-black"><CheckCircle2 size={16}/> Yes</span> : <span className="flex items-center gap-1 text-red-500 font-black"><XCircle size={16}/> No</span>}
                    </div>
                    <div className="flex items-center justify-between p-4 bg-foreground/5 rounded-xl">
                       <span className="font-bold">Finance Available</span>
                       {listing.financeAvailable ? <span className="flex items-center gap-1 text-emerald-500 font-black"><CheckCircle2 size={16}/> Yes</span> : <span className="flex items-center gap-1 text-red-500 font-black"><XCircle size={16}/> No</span>}
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
                 
                 <div className="flex items-center justify-between mb-8">
                   <h3 className="text-2xl font-black flex items-center gap-3">
                      <Wrench className="text-[var(--color-brand-green)]" size={28}/> 
                      Inspection Report Data
                   </h3>
                   <div className="text-right">
                     <p className="text-xs text-muted font-bold uppercase tracking-widest mb-1">Overall Score</p>
                     <p className="text-4xl font-black text-[var(--color-brand-green)]">{listing.inspection?.overallScore ? listing.inspection.overallScore.toFixed(1) : '0.0'}<span className="text-xl text-muted">/10</span></p>
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
                          onChange={(e) => setInspectionScores({...inspectionScores, [field]: Number(e.target.value)})}
                          className="w-full accent-[var(--color-brand-green)]"
                        />
                      </div>
                    ))}
                 </div>

                 <div className="flex justify-end gap-4 border-t border-[var(--border-subtle)] pt-6">
                    <button 
                      onClick={handleInspectionSave}
                      disabled={isUpdating}
                      className="px-8 py-3 bg-foreground text-background hover:bg-foreground/90 font-black rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                    >
                      {isUpdating ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
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
                    <MessageCircle className="text-[var(--color-brand-green)]" size={28}/> 
                    Buyer Enquiries ({listing.leadCount})
                 </h3>
                 
                 {listing.leadCount > 0 ? (
                   <div className="space-y-4">
                     {/* Mocking a list of leads for demo purposes */}
                     {[1, 2, 3].slice(0, Math.min(3, listing.leadCount)).map((i) => (
                       <div key={i} className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-foreground/5 rounded-2xl border border-[var(--border-subtle)] gap-4">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center text-xl font-black text-[var(--color-brand-green)] border border-[var(--border-subtle)] shadow-sm">
                              {['R', 'K', 'S'][i-1]}
                            </div>
                            <div>
                               <h4 className="font-black text-lg">{['Ramesh Patil', 'Kisan Kumar', 'Suresh Mane'][i-1]}</h4>
                               <p className="text-sm font-bold text-muted flex items-center gap-1"><Phone size={12}/> +91 98765 4321{i}</p>
                            </div>
                         </div>
                         <div className="text-left md:text-right w-full md:w-auto bg-background md:bg-transparent p-4 md:p-0 rounded-xl">
                            <p className="text-xs text-muted font-bold uppercase tracking-widest mb-1">Offer Price</p>
                            <p className="text-xl font-black text-[var(--color-brand-green)]">₹{(listing.askingPrice - (i * 20000)).toLocaleString('en-IN')}</p>
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

        </div>

        {/* RIGHT COLUMN: Certification & Status Panel */}
        <div className="space-y-6">
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
                  <span className="text-sm font-bold text-muted flex items-center gap-2"><Eye size={16}/> Total Views</span>
                  <span className="text-lg font-black">{listing.viewsCount}</span>
                </div>
                <div className="flex justify-between items-center bg-[var(--color-brand-green)]/10 px-4 py-3.5 rounded-xl border border-[var(--color-brand-green)]/20">
                  <span className="text-sm font-bold text-[var(--color-brand-green)] flex items-center gap-2"><MessageCircle size={16}/> Total Leads</span>
                  <span className="text-lg font-black text-[var(--color-brand-green)]">{listing.leadCount}</span>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
