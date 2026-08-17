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
  MoreVertical
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
    usedTractorListingAPI.getAllListings().then(res => {
      if (res.success && res.data) {
        // The backend wraps the array in a paginated object: res.data = { listings: [...], total: ... }
        const listingsArray = Array.isArray(res.data.listings) ? res.data.listings : (Array.isArray(res.data.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []));
        setListings(listingsArray);
      } else {
        setListings([]);
      }
      setLoading(false);
    });
  };

  const filteredListings = listings.filter(l => {
    const matchesTab = activeTab === 'ALL' || l.listingStatus === activeTab;
    const searchLower = searchQuery.toLowerCase();
    const brandMatch = (l.tractorBrand || '').toLowerCase().includes(searchLower);
    const modelMatch = (l.tractorModel || '').toLowerCase().includes(searchLower);
    return matchesTab && (brandMatch || modelMatch);
  });

  const getStatusBadge = (status: ListingStatus) => {
    switch (status) {
      case ListingStatus.ACTIVE:
        return <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-md text-xs font-black tracking-wider uppercase flex items-center gap-1 w-fit"><CheckCircle2 size={12} /> Active</span>;
      case ListingStatus.PENDING_APPROVAL:
        return <span className="px-2.5 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-md text-xs font-black tracking-wider uppercase flex items-center gap-1 w-fit"><Clock size={12} /> Pending</span>;
      case ListingStatus.REJECTED:
        return <span className="px-2.5 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-md text-xs font-black tracking-wider uppercase flex items-center gap-1 w-fit"><XCircle size={12} /> Rejected</span>;
      default:
        return <span className="px-2.5 py-1 bg-foreground/10 text-foreground border border-[var(--border-brand)] rounded-md text-xs font-black tracking-wider uppercase flex items-center gap-1 w-fit">{status}</span>;
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const paginatedListings = filteredListings.slice((page - 1) * limit, page * limit);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">Used Listings</h1>
          <p className="text-muted font-bold mt-2 text-sm uppercase tracking-widest">Manage and moderate marketplace listings.</p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[var(--card-bg)] backdrop-blur-xl p-3 rounded-[1.5rem] border border-[var(--border-subtle)] shadow-[var(--card-shadow)]">
        <div className="flex w-full md:w-auto overflow-x-auto no-scrollbar gap-2">
          {['ALL', ListingStatus.PENDING_APPROVAL, ListingStatus.ACTIVE, ListingStatus.REJECTED].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${activeTab === tab ? 'bg-[var(--color-brand-green)] text-white shadow-md' : 'text-muted hover:text-foreground hover:bg-foreground/5'}`}
            >
              {tab === 'ALL' ? 'All Listings' : tab.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            type="text"
            placeholder="Search listings..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-background/50 border border-[var(--border-subtle)] rounded-xl text-sm font-bold focus:border-[var(--color-brand-green)] focus:ring-4 focus:ring-[var(--color-brand-green)]/10 outline-none transition-all"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[var(--card-bg)] backdrop-blur-2xl rounded-[2rem] border border-[var(--border-subtle)] shadow-[var(--card-shadow)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-foreground/5 border-b border-[var(--border-subtle)]">
                <th className="px-6 py-5 text-[10px] font-black text-muted uppercase tracking-widest">Tractor</th>
                <th className="px-6 py-5 text-[10px] font-black text-muted uppercase tracking-widest">Price / Location</th>
                <th className="px-6 py-5 text-[10px] font-black text-muted uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-muted uppercase tracking-widest">Stats</th>
                <th className="px-6 py-5 text-[10px] font-black text-muted uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <TractorLoader className="text-[var(--color-brand-green)] mx-auto mb-2" size={48} />
                    <p className="text-sm font-medium text-muted mt-2">Loading listings...</p>
                  </td>
                </tr>
              ) : filteredListings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted font-medium">
                    No listings found for the selected criteria.
                  </td>
                </tr>
              ) : (
                paginatedListings.map(listing => (
                  <tr key={listing.id} className="hover:bg-background/60 transition-colors duration-300 group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded-lg overflow-hidden bg-foreground/10 shrink-0 border border-[var(--border-subtle)]">
                          {listing.imageUrl ? (
                            <img src={listing.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted">No Img</div>
                          )}
                        </div>
                        <div>
                          <div className="font-black text-foreground flex items-center gap-2">
                            {listing.tractorBrand} {listing.tractorModel}
                            {listing.isCertified && <ShieldCheck size={14} className="text-[var(--color-brand-green)]" />}
                          </div>
                          <div className="text-xs font-bold text-muted mt-0.5">
                            ID: {listing.id} • {listing.yearOfManufacture} • {listing.hoursUsed} Hrs
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-black text-foreground">{formatPrice(listing.askingPrice)}</div>
                      <div className="text-xs font-bold text-muted mt-0.5">{listing.district}, {listing.state}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(listing.listingStatus)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-black text-foreground">{listing.leadCount || 0} Leads</div>
                      <div className="text-xs font-bold text-muted mt-0.5">{listing.viewsCount || 0} Views</div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link
                        href={`/admin/used-listings/${listing.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-foreground/5 hover:bg-[var(--color-brand-green)] hover:text-white border border-[var(--border-subtle)] hover:border-[var(--color-brand-green)] rounded-xl text-sm font-bold transition-all duration-300 shadow-sm"
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
          onLimitChange={(l) => { setLimit(l); setPage(1); }}
        />
      </div>

    </div>
  );
}
