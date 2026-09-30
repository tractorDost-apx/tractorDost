'use client';

import React, { useState, useEffect } from 'react';
import { usedTractorListingAPI } from '@/lib/api/used-listings';
import { UsedTractorListing, ListingStatus } from '@/lib/api/usedTractors';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  ShieldCheck,
  MoreVertical,
} from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';
import Link from 'next/link';
import Pagination from '@/components/shared/Pagination';

export default function AdminUsedListingsPage() {
  const [listings, setListings] = useState<UsedTractorListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | ListingStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

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
      } else {
        setListings([]);
      }
      setLoading(false);
    });
  };

  const filteredListings = listings.filter((l) => {
    const matchesTab = activeTab === 'ALL' || l.listingStatus === activeTab;
    const searchLower = searchQuery.toLowerCase();
    const brandMatch = (l.tractorBrand || '').toLowerCase().includes(searchLower);
    const modelMatch = (l.tractorModel || '').toLowerCase().includes(searchLower);
    return matchesTab && (brandMatch || modelMatch);
  });

  const getStatusBadge = (status: ListingStatus) => {
    switch (status) {
      case ListingStatus.ACTIVE:
        return (
          <span className="flex w-fit items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-black tracking-wider text-emerald-500 uppercase">
            <CheckCircle2 size={12} /> Active
          </span>
        );
      case ListingStatus.PENDING_APPROVAL:
        return (
          <span className="flex w-fit items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-black tracking-wider text-amber-500 uppercase">
            <Clock size={12} /> Pending
          </span>
        );
      case ListingStatus.REJECTED:
        return (
          <span className="flex w-fit items-center gap-1 rounded-md border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-black tracking-wider text-red-500 uppercase">
            <XCircle size={12} /> Rejected
          </span>
        );
      default:
        return (
          <span className="bg-foreground/10 text-foreground flex w-fit items-center gap-1 rounded-md border border-[var(--border-brand)] px-2.5 py-1 text-xs font-black tracking-wider uppercase">
            {status}
          </span>
        );
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const paginatedListings = filteredListings.slice((page - 1) * limit, page * limit);

  return (
    <div className="animate-fade-in mx-auto max-w-7xl space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-foreground text-3xl font-black tracking-tight md:text-4xl">
            Used Listings
          </h1>
          <p className="text-muted mt-2 text-sm font-bold tracking-widest uppercase">
            Manage and moderate marketplace listings.
          </p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--card-bg)] p-3 shadow-[var(--card-shadow)] backdrop-blur-xl md:flex-row">
        <div className="no-scrollbar flex w-full gap-2 overflow-x-auto md:w-auto">
          {[
            'ALL',
            ListingStatus.PENDING_APPROVAL,
            ListingStatus.ACTIVE,
            ListingStatus.REJECTED,
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`rounded-xl px-6 py-2.5 text-sm font-bold whitespace-nowrap transition-all duration-300 ${activeTab === tab ? 'bg-[var(--color-brand-green)] text-white shadow-md' : 'text-muted hover:text-foreground hover:bg-foreground/5'}`}
            >
              {tab === 'ALL' ? 'All Listings' : tab.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="relative w-full shrink-0 md:w-72">
          <Search className="text-muted absolute top-1/2 left-4 -translate-y-1/2" size={18} />
          <input
            type="text"
            placeholder="Search listings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-background/50 w-full rounded-xl border border-[var(--border-subtle)] py-3 pr-4 pl-11 text-sm font-bold transition-all outline-none focus:border-[var(--color-brand-green)] focus:ring-4 focus:ring-[var(--color-brand-green)]/10"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-hidden rounded-[2rem] border border-[var(--border-subtle)] bg-[var(--card-bg)] shadow-[var(--card-shadow)] backdrop-blur-2xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-foreground/5 border-b border-[var(--border-subtle)]">
                <th className="text-muted px-6 py-5 text-[10px] font-black tracking-widest uppercase">
                  Tractor
                </th>
                <th className="text-muted px-6 py-5 text-[10px] font-black tracking-widest uppercase">
                  Price / Location
                </th>
                <th className="text-muted px-6 py-5 text-[10px] font-black tracking-widest uppercase">
                  Status
                </th>
                <th className="text-muted px-6 py-5 text-[10px] font-black tracking-widest uppercase">
                  Stats
                </th>
                <th className="text-muted px-6 py-5 text-right text-[10px] font-black tracking-widest uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <TractorLoader
                      className="mx-auto mb-2 text-[var(--color-brand-green)]"
                      size={48}
                    />
                    <p className="text-muted mt-2 text-sm font-medium">Loading listings...</p>
                  </td>
                </tr>
              ) : filteredListings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-muted px-6 py-12 text-center font-medium">
                    No listings found for the selected criteria.
                  </td>
                </tr>
              ) : (
                paginatedListings.map((listing) => (
                  <tr
                    key={listing.id}
                    className="hover:bg-background/60 group transition-colors duration-300"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="bg-foreground/10 h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-[var(--border-subtle)]">
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
                        </div>
                        <div>
                          <div className="text-foreground flex items-center gap-2 font-black">
                            {listing.tractorBrand} {listing.tractorModel}
                            {listing.isCertified && (
                              <ShieldCheck size={14} className="text-[var(--color-brand-green)]" />
                            )}
                          </div>
                          <div className="text-muted mt-0.5 text-xs font-bold">
                            ID: {listing.id} • {listing.yearOfManufacture} • {listing.hoursUsed} Hrs
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-foreground font-black">
                        {formatPrice(listing.askingPrice)}
                      </div>
                      <div className="text-muted mt-0.5 text-xs font-bold">
                        {listing.district}, {listing.state}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(listing.listingStatus)}</td>
                    <td className="px-6 py-4">
                      <div className="text-foreground text-sm font-black">
                        {listing.leadCount || 0} Leads
                      </div>
                      <div className="text-muted mt-0.5 text-xs font-bold">
                        {listing.viewsCount || 0} Views
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link
                        href={`/admin/used-listings/${listing.id}`}
                        className="bg-foreground/5 inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-sm font-bold shadow-sm transition-all duration-300 hover:border-[var(--color-brand-green)] hover:bg-[var(--color-brand-green)] hover:text-white"
                      >
                        <Eye size={16} /> Review
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          limit={limit}
          totalCount={filteredListings.length}
          totalPages={Math.ceil(filteredListings.length / limit)}
          onPageChange={setPage}
          onLimitChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
        />
      </div>
    </div>
  );
}
