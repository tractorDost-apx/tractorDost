'use client';

import React, { useState, useEffect } from 'react';
import { usedTractorListingAPI } from '@/lib/api/used-listings';
import { UsedTractorListing, ListingStatus } from '@/lib/api/usedTractors';
import {
  ClipboardCheck,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  Wrench,
  FileText
} from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';
import Link from 'next/link';
import Pagination from '@/components/shared/Pagination';

export default function AdminValuationPage() {
  const [listings, setListings] = useState<UsedTractorListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'COMPLETED'>('PENDING');

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = () => {
    setLoading(true);
    usedTractorListingAPI.getAllListings().then(res => {
      if (res.success && res.data) {
        // The backend wraps the array in a paginated object: res.data = { listings: [...], total: ... }
        const listingsArray = Array.isArray(res.data.listings) ? res.data.listings : (Array.isArray(res.data.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []));
        setListings(listingsArray);
      }
      setLoading(false);
    });
  };

  // We consider a tractor "pending inspection" if it is active but not certified
  const pendingInspections = listings.filter(l => !l.isCertified && l.listingStatus !== ListingStatus.REJECTED);
  const completedInspections = listings.filter(l => l.isCertified);

  const displayListings = activeTab === 'PENDING' ? pendingInspections : completedInspections;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
            <ClipboardCheck className="text-[var(--color-brand-green)]" size={32} />
            Inspections & Valuations
          </h1>
          <p className="text-muted font-medium mt-1">Manage physical inspections and issue certifications.</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--card-bg)] backdrop-blur-2xl rounded-2xl border border-[var(--border-subtle)] shadow-[var(--card-shadow)] p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500">
              <Clock size={20} />
            </div>
          </div>
          <p className="text-sm font-bold text-muted uppercase tracking-widest">Pending Inspections</p>
          <p className="text-3xl font-black mt-1">{pendingInspections.length}</p>
        </div>
        <div className="bg-[var(--card-bg)] backdrop-blur-2xl rounded-2xl border border-[var(--color-brand-green)]/30 shadow-lg shadow-[var(--color-brand-green)]/10 p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-brand-green)] opacity-10 blur-3xl pointer-events-none rounded-full" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-[var(--color-brand-green)] rounded-xl text-white">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <p className="text-sm font-bold text-[var(--color-brand-green)] uppercase tracking-widest">Certified Tractors</p>
          <p className="text-3xl font-black text-[var(--color-brand-green)] mt-1">{completedInspections.length}</p>
        </div>
        <div className="bg-[var(--card-bg)] backdrop-blur-2xl rounded-2xl border border-[var(--border-subtle)] shadow-[var(--card-shadow)] p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500">
              <FileText size={20} />
            </div>
          </div>
          <p className="text-sm font-bold text-muted uppercase tracking-widest">Valuation Requests</p>
          <p className="text-3xl font-black mt-1">0</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border-subtle)]">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'PENDING' ? 'border-[var(--color-brand-green)] text-[var(--color-brand-green)]' : 'border-transparent text-muted hover:text-foreground'}`}
        >
          Pending Inspections
        </button>
        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'COMPLETED' ? 'border-[var(--color-brand-green)] text-[var(--color-brand-green)]' : 'border-transparent text-muted hover:text-foreground'}`}
        >
          Completed & Certified
        </button>
      </div>

      {/* Inspection List */}
      <div className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[2rem] border border-[var(--border-subtle)] shadow-[var(--card-shadow)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-foreground/5 border-b border-[var(--border-subtle)]">
                <th className="px-6 py-4 text-xs font-black text-muted uppercase tracking-wider">Tractor & Location</th>
                <th className="px-6 py-4 text-xs font-black text-muted uppercase tracking-wider">Seller Details</th>
                <th className="px-6 py-4 text-xs font-black text-muted uppercase tracking-wider">Condition / Age</th>
                <th className="px-6 py-4 text-xs font-black text-muted uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <TractorLoader className="text-[var(--color-brand-green)] mx-auto mb-2" size={48} />
                    <p className="text-sm font-medium text-muted mt-2">Loading inspection queue...</p>
                  </td>
                </tr>
              ) : displayListings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted font-medium">
                    No tractors found in this queue.
                  </td>
                </tr>
              ) : (
                displayListings.slice((page - 1) * limit, page * limit).map(listing => (
                  <tr key={listing.id} className="hover:bg-foreground/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded-lg overflow-hidden bg-foreground/10 shrink-0 border border-[var(--border-subtle)] relative">
                          {listing.imageUrl ? (
                            <img src={listing.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted">No Img</div>
                          )}
                          {listing.isCertified && (
                            <div className="absolute top-0 right-0 bg-[var(--color-brand-green)] text-white p-0.5 rounded-bl-lg">
                              <CheckCircle2 size={12} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-black text-foreground">
                            {listing.yearOfManufacture} {listing.tractorBrand} {listing.tractorModel}
                          </div>
                          <div className="text-xs font-bold text-muted mt-0.5">
                            {listing.district}, {listing.state}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground">₹{(listing.askingPrice || 0).toLocaleString('en-IN')}</div>
                      <div className="text-xs font-bold text-muted mt-0.5">ID: {listing.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold flex items-center gap-1 capitalize">
                        <Wrench size={14} className="text-muted" /> {(listing.conditionGrade || 'N/A').toLowerCase()}
                      </div>
                      <div className="text-xs font-bold text-muted mt-0.5">{listing.hoursUsed || '0'} Hours</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/used-listings/${listing.id}`}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black transition-all hover:-translate-y-0.5 ${activeTab === 'PENDING' ? 'bg-[var(--color-brand-green)] text-white hover:bg-[var(--color-brand-green)]/90 shadow-lg shadow-[var(--color-brand-green)]/20' : 'bg-foreground/5 hover:bg-foreground/10 border border-[var(--border-subtle)] shadow-sm'}`}
                      >
                        {activeTab === 'PENDING' ? (
                          <>Start Inspection</>
                        ) : (
                          <>View Report</>
                        )}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!loading && displayListings.length > 0 && (
          <Pagination
            page={page}
            limit={limit}
            totalCount={displayListings.length}
            totalPages={Math.ceil(displayListings.length / limit)}
            onPageChange={setPage}
            onLimitChange={(l) => { setLimit(l); setPage(1); }}
          />
        )}
      </div>

    </div>
  );
}
