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
  FileText,
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
    usedTractorListingAPI.getAllListings().then((res) => {
      if (res.success && res.data) {
        // Paginated response: { data: [...], total, page, limit, totalPages }
        setListings(res.data.data);
      }
      setLoading(false);
    });
  };

  // We consider a tractor "pending inspection" if it is active but not certified
  const pendingInspections = listings.filter(
    (l) => !l.isCertified && l.listingStatus !== ListingStatus.REJECTED
  );
  const completedInspections = listings.filter((l) => l.isCertified);

  const displayListings = activeTab === 'PENDING' ? pendingInspections : completedInspections;

  return (
    <div className="animate-fade-in w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-foreground flex items-center gap-3 text-3xl font-black tracking-tight">
            <ClipboardCheck className="text-[var(--color-brand-green)]" size={32} />
            Inspections & Valuations
          </h1>
          <p className="text-muted mt-1 font-medium">
            Manage physical inspections and issue certifications.
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--card-bg)] p-5 shadow-[var(--card-shadow)] backdrop-blur-2xl">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-500">
              <Clock size={20} />
            </div>
          </div>
          <p className="text-muted text-sm font-bold tracking-widest uppercase">
            Pending Inspections
          </p>
          <p className="mt-1 text-3xl font-black">{pendingInspections.length}</p>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-[var(--color-brand-green)]/30 bg-[var(--card-bg)] p-5 shadow-[var(--color-brand-green)]/10 shadow-lg backdrop-blur-2xl">
          <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full bg-[var(--color-brand-green)] opacity-10 blur-3xl" />
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-xl bg-[var(--color-brand-green)] p-2.5 text-white">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <p className="text-sm font-bold tracking-widest text-[var(--color-brand-green)] uppercase">
            Certified Tractors
          </p>
          <p className="mt-1 text-3xl font-black text-[var(--color-brand-green)]">
            {completedInspections.length}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--card-bg)] p-5 shadow-[var(--card-shadow)] backdrop-blur-2xl">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-500">
              <FileText size={20} />
            </div>
          </div>
          <p className="text-muted text-sm font-bold tracking-widest uppercase">
            Valuation Requests
          </p>
          <p className="mt-1 text-3xl font-black">0</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border-subtle)]">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`border-b-2 px-6 py-3 text-sm font-bold transition-colors ${activeTab === 'PENDING' ? 'border-[var(--color-brand-green)] text-[var(--color-brand-green)]' : 'text-muted hover:text-foreground border-transparent'}`}
        >
          Pending Inspections
        </button>
        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`border-b-2 px-6 py-3 text-sm font-bold transition-colors ${activeTab === 'COMPLETED' ? 'border-[var(--color-brand-green)] text-[var(--color-brand-green)]' : 'text-muted hover:text-foreground border-transparent'}`}
        >
          Completed & Certified
        </button>
      </div>

      {/* Inspection List */}
      <div className="overflow-hidden rounded-[2rem] border border-[var(--border-subtle)] bg-[var(--card-bg)] shadow-[var(--card-shadow)] backdrop-blur-3xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-foreground/5 border-b border-[var(--border-subtle)]">
                <th className="text-muted px-6 py-4 text-xs font-black tracking-wider uppercase">
                  Tractor & Location
                </th>
                <th className="text-muted px-6 py-4 text-xs font-black tracking-wider uppercase">
                  Seller Details
                </th>
                <th className="text-muted px-6 py-4 text-xs font-black tracking-wider uppercase">
                  Condition / Age
                </th>
                <th className="text-muted px-6 py-4 text-right text-xs font-black tracking-wider uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <TractorLoader
                      className="mx-auto mb-2 text-[var(--color-brand-green)]"
                      size={48}
                    />
                    <p className="text-muted mt-2 text-sm font-medium">
                      Loading inspection queue...
                    </p>
                  </td>
                </tr>
              ) : displayListings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-muted px-6 py-12 text-center font-medium">
                    No tractors found in this queue.
                  </td>
                </tr>
              ) : (
                displayListings.slice((page - 1) * limit, page * limit).map((listing) => (
                  <tr
                    key={listing.id}
                    className="hover:bg-foreground/[0.02] group transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-foreground/10 relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-[var(--border-subtle)]">
                          {listing.media?.[0]?.url ? (
                            <img
                              src={listing.media[0].url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="text-muted flex h-full w-full items-center justify-center">
                              No Img
                            </div>
                          )}
                          {listing.isCertified && (
                            <div className="absolute top-0 right-0 rounded-bl-lg bg-[var(--color-brand-green)] p-0.5 text-white">
                              <CheckCircle2 size={12} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-foreground font-black">
                            {listing.yearOfManufacture} {listing.tractorBrand}{' '}
                            {listing.tractorModel}
                          </div>
                          <div className="text-muted mt-0.5 text-xs font-bold">
                            {listing.district}, {listing.state}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-foreground font-bold">
                        ₹{(listing.askingPrice || 0).toLocaleString('en-IN')}
                      </div>
                      <div className="text-muted mt-0.5 text-xs font-bold">ID: {listing.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm font-bold capitalize">
                        <Wrench size={14} className="text-muted" />{' '}
                        {(listing.conditionGrade || 'N/A').toLowerCase()}
                      </div>
                      <div className="text-muted mt-0.5 text-xs font-bold">
                        {listing.hoursUsed || '0'} Hours
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/used-listings/${listing.id}`}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-black transition-all hover:-translate-y-0.5 ${activeTab === 'PENDING' ? 'bg-[var(--color-brand-green)] text-white shadow-[var(--color-brand-green)]/20 shadow-lg hover:bg-[var(--color-brand-green)]/90' : 'bg-foreground/5 hover:bg-foreground/10 border border-[var(--border-subtle)] shadow-sm'}`}
                      >
                        {activeTab === 'PENDING' ? <>Start Inspection</> : <>View Report</>}
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
            onLimitChange={(l) => {
              setLimit(l);
              setPage(1);
            }}
          />
        )}
      </div>
    </div>
  );
}
