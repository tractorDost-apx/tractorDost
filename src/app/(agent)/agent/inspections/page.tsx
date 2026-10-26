'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/store/AuthContext';
import { usedTractorInspectionAPI } from '@/lib/api/used-inspections';
import {
  ClipboardCheck,
  Calendar,
  MapPin,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  Gauge,
  Award,
  Sparkles,
} from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';
import Link from 'next/link';

export default function AgentInspectionsPage() {
  const { user } = useAuth();
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = user?.role?.name?.toUpperCase() === 'ADMIN';

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Backend scopes AGENT to their inspectorId automatically.
      // For ADMIN, omitting inspectorId allows seeing all inspections across the system.
      const queryParams = isAdmin ? { limit: 50 } : { inspectorId: user?.id, limit: 50 };
      const res = await usedTractorInspectionAPI.getAllInspections(queryParams);
      if (res.success && res.data?.data) {
        setInspections(res.data.data);
      }
    } catch (e) {
      console.error('Failed to fetch inspections', e);
    }
    setLoading(false);
  };

  const filteredInspections = inspections.filter((i) => {
    const matchStatus = statusFilter === 'ALL' || i.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchStatus;

    const brand = (i.listing?.tractorBrand || '').toLowerCase();
    const model = (i.listing?.tractorModel || '').toLowerCase();
    const district = (i.listing?.district || '').toLowerCase();
    const villageCity = (i.listing?.villageCity || '').toLowerCase();
    const state = (i.listing?.state || '').toLowerCase();
    const idMatch = String(i.id).includes(q) || String(i.listingId).includes(q);

    const matchSearch =
      brand.includes(q) ||
      model.includes(q) ||
      district.includes(q) ||
      villageCity.includes(q) ||
      state.includes(q) ||
      idMatch;

    return matchStatus && matchSearch;
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-500">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black">
            <ClipboardCheck className="text-[var(--color-brand-green)]" size={32} />
            My Inspections
          </h1>
          <p className="text-muted mt-1 font-medium">
            Manage, inspect, and submit reports for assigned tractor listings.
          </p>
        </div>
        <div className="text-muted text-xs font-bold">
          Showing {filteredInspections.length} of {inspections.length} assignments
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="relative md:col-span-2">
          <Search className="text-muted absolute top-1/2 left-4 -translate-y-1/2" size={20} />
          <input
            type="text"
            placeholder="Search by tractor brand, model, city, district, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-background w-full rounded-2xl border border-[var(--border-subtle)] py-3.5 pr-4 pl-12 font-bold transition-colors focus:border-[var(--color-brand-green)] focus:outline-none"
          />
        </div>
        <div className="relative">
          <Filter className="text-muted absolute top-1/2 left-4 -translate-y-1/2" size={20} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background w-full cursor-pointer appearance-none rounded-2xl border border-[var(--border-subtle)] py-3.5 pr-4 pl-12 font-bold transition-colors focus:border-[var(--color-brand-green)] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ASSIGNED">Assigned (Pending Inspection)</option>
            <option value="REPORT_UPLOADED">Report Uploaded</option>
            <option value="COMPLETED">Completed</option>
            <option value="CERTIFIED">Certified</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <TractorLoader className="text-[var(--color-brand-green)]" size={64} />
        </div>
      ) : (
        <div className="bg-background overflow-hidden rounded-[2rem] border border-[var(--border-subtle)] shadow-sm">
          <div className="divide-y divide-[var(--border-subtle)]">
            {filteredInspections.length === 0 ? (
              <div className="text-muted flex flex-col items-center justify-center gap-2 p-12 text-center text-base font-bold">
                <p>No inspections found matching your criteria.</p>
                <p className="text-xs font-normal">Try clearing your search query or selecting &quot;All Statuses&quot;.</p>
              </div>
            ) : (
              filteredInspections.map((inspection) => (
                <InspectionRow key={inspection.id} inspection={inspection} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InspectionRow({ inspection }: { inspection: any }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const listing = inspection.listing || {};

  // Extract images from media
  const mediaImages = (listing.media || [])
    .filter((m: any) => m.mediaType !== 'pdf' && m.url)
    .map((m: any) => ({ url: m.url, id: m.id }));

  // Also include tractor photos uploaded as documents
  const docImages = (listing.documents || [])
    .filter((d: any) => d.url && !d.url.toLowerCase().endsWith('.pdf'))
    .map((d: any) => ({ url: d.url, id: `doc-${d.id}` }));

  // De-duplicate images by URL
  const allImages = Array.from(
    new Map([...mediaImages, ...docImages].map((img) => [img.url, img])).values()
  );

  const tractorTitle =
    listing.tractorBrand || listing.tractorModel
      ? `${listing.tractorBrand || ''} ${listing.tractorModel || ''}`.trim()
      : `Tractor Listing #${inspection.listingId}`;

  const askingPriceFormatted = listing.askingPrice
    ? `₹${Number(listing.askingPrice).toLocaleString('en-IN')}`
    : null;

  return (
    <div className="hover:bg-foreground/5 flex flex-col items-start justify-between gap-6 p-6 transition-colors md:flex-row md:items-center md:p-8">
      <div className="flex w-full flex-1 flex-col items-start gap-6 md:flex-row md:items-center">
        {/* Thumbnail or Carousel */}
        {allImages.length > 0 ? (
          <div className="group bg-foreground/5 relative h-48 w-full shrink-0 overflow-hidden rounded-2xl border border-[var(--border-subtle)] shadow-sm md:h-28 md:w-36">
            <img
              src={allImages[currentImageIndex]?.url}
              alt={`${tractorTitle} thumbnail`}
              className="animate-in fade-in h-full w-full object-cover transition-all duration-300"
            />

            {allImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
                  }}
                  className="absolute top-1/2 left-1.5 flex -translate-y-1/2 items-center justify-center rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/75"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={14} />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
                  }}
                  className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center justify-center rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/75"
                  aria-label="Next image"
                >
                  <ChevronRight size={14} />
                </button>

                <div className="absolute bottom-1.5 left-1/2 flex -translate-x-1/2 gap-1 rounded-full bg-black/40 px-1.5 py-0.5">
                  {allImages.slice(0, 5).map((_, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentImageIndex(idx);
                      }}
                      className={`h-1 w-1 rounded-full transition-all ${
                        idx === currentImageIndex ? 'w-2.5 bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                  {allImages.length > 5 && (
                    <span className="text-[8px] font-black text-white">+{allImages.length - 5}</span>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="bg-foreground/5 text-muted flex h-48 w-full shrink-0 flex-col items-center justify-center rounded-2xl border border-[var(--border-subtle)] md:h-28 md:w-36">
            <span className="text-xs font-bold tracking-widest uppercase">No Image</span>
          </div>
        )}

        {/* Info Column */}
        <div className="flex flex-1 flex-col gap-2.5">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-black transition-colors group-hover:text-[var(--color-brand-green)] md:text-2xl">
              {tractorTitle}
            </h3>

            <span
              className={`rounded-full px-3.5 py-1 text-xs font-black tracking-widest uppercase ${
                inspection.status === 'ASSIGNED'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : inspection.status === 'CERTIFIED'
                    ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
                    : inspection.status === 'REPORT_UPLOADED'
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]'
              }`}
            >
              {inspection.status.replace('_', ' ')}
            </span>

            {inspection.overallScore && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-600 dark:text-emerald-400">
                <Award size={14} /> Score: {inspection.overallScore}/100
              </span>
            )}
          </div>

          <div className="text-muted flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold md:text-sm">
            <span className="flex items-center gap-1.5">
              <Calendar size={16} /> Assigned:{' '}
              {new Date(inspection.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={16} />{' '}
              {listing.villageCity ? `${listing.villageCity}, ` : ''}
              {listing.district || 'Unknown'}, {listing.state || ''}
            </span>
            {askingPriceFormatted && (
              <span className="text-foreground flex items-center gap-1 font-extrabold">
                <IndianRupee size={15} /> {askingPriceFormatted}
              </span>
            )}
            {listing.yearOfManufacture && (
              <span>Model Year: {listing.yearOfManufacture}</span>
            )}
            {listing.hoursUsed && (
              <span className="flex items-center gap-1">
                <Gauge size={15} /> {listing.hoursUsed} hrs
              </span>
            )}
          </div>
        </div>
      </div>

      <Link
        href={`/agent/inspections/${inspection.id}`}
        className="bg-foreground text-background w-full shrink-0 rounded-xl px-7 py-3 text-center text-sm font-black tracking-wider uppercase shadow-md transition-all hover:scale-105 active:scale-95 md:w-auto"
      >
        {inspection.status === 'ASSIGNED'
          ? 'Start Inspection'
          : inspection.status === 'REPORT_UPLOADED'
            ? 'Review / Edit'
            : 'View Report'}
      </Link>
    </div>
  );
}
