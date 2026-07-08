'use client';

import React, { useState, useEffect } from 'react';
import { usedTractorAPI, UsedTractorListing, ListingStatus } from '@/lib/api/usedTractors';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  ShieldCheck, 
  MoreVertical,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function AdminUsedListingsPage() {
  const [listings, setListings] = useState<UsedTractorListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | ListingStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = () => {
    setLoading(true);
    usedTractorAPI.getAllListings().then(res => {
      if (res.success && res.data) {
        setListings(res.data);
      }
      setLoading(false);
    });
  };

  const filteredListings = listings.filter(l => 
    (activeTab === 'ALL' || l.listingStatus === activeTab) &&
    (l.tractorBrand.toLowerCase().includes(searchQuery.toLowerCase()) || 
     l.tractorModel.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusBadge = (status: ListingStatus) => {
    switch(status) {
      case ListingStatus.ACTIVE:
        return <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-md text-xs font-black tracking-wider uppercase flex items-center gap-1 w-fit"><CheckCircle2 size={12}/> Active</span>;
      case ListingStatus.PENDING_APPROVAL:
        return <span className="px-2.5 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-md text-xs font-black tracking-wider uppercase flex items-center gap-1 w-fit"><Clock size={12}/> Pending</span>;
      case ListingStatus.REJECTED:
        return <span className="px-2.5 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-md text-xs font-black tracking-wider uppercase flex items-center gap-1 w-fit"><XCircle size={12}/> Rejected</span>;
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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Used Listings</h1>
          <p className="text-muted font-medium mt-1">Manage and moderate marketplace listings.</p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-foreground/5 p-2 rounded-2xl border border-[var(--border-subtle)]">
        <div className="flex w-full md:w-auto overflow-x-auto no-scrollbar gap-1">
          {['ALL', ListingStatus.PENDING_APPROVAL, ListingStatus.ACTIVE, ListingStatus.REJECTED].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab ? 'bg-background text-foreground shadow-sm border border-[var(--border-subtle)]' : 'text-muted hover:text-foreground hover:bg-foreground/5'}`}
            >
              {tab === 'ALL' ? 'All Listings' : tab.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search listings..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-[var(--border-subtle)] rounded-xl text-sm font-medium focus:ring-2 focus:ring-[var(--color-brand-green)] outline-none"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-background rounded-3xl border border-[var(--border-subtle)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-foreground/5 border-b border-[var(--border-subtle)]">
                <th className="px-6 py-4 text-xs font-black text-muted uppercase tracking-wider">Tractor</th>
                <th className="px-6 py-4 text-xs font-black text-muted uppercase tracking-wider">Price / Location</th>
                <th className="px-6 py-4 text-xs font-black text-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-black text-muted uppercase tracking-wider">Stats</th>
                <th className="px-6 py-4 text-xs font-black text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin text-[var(--color-brand-green)] mx-auto mb-2" size={32} />
                    <p className="text-sm font-medium text-muted">Loading listings...</p>
                  </td>
                </tr>
              ) : filteredListings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted font-medium">
                    No listings found for the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredListings.map(listing => (
                  <tr key={listing.id} className="hover:bg-foreground/[0.02] transition-colors group">
                    <td className="px-6 py-4">
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
                      <div className="text-sm font-bold text-foreground">{listing.leadCount} Leads</div>
                      <div className="text-xs font-medium text-muted mt-0.5">{listing.viewsCount} Views</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/used-listings/${listing.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-foreground/5 hover:bg-foreground/10 border border-[var(--border-subtle)] rounded-lg text-sm font-bold transition-colors"
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
      </div>

    </div>
  );
}
