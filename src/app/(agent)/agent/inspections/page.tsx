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
} from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';
import Link from 'next/link';

export default function AgentInspectionsPage() {
  const { user } = useAuth();
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await usedTractorInspectionAPI.getAllInspections({
        inspectorId: user?.id,
        limit: 50,
      });
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
    const matchSearch =
      (i.listing?.tractorBrand || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.listing?.tractorModel || '').toLowerCase().includes(searchQuery.toLowerCase());
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
            Manage and track your assigned tractor inspections.
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted absolute top-1/2 left-4 -translate-y-1/2" size={20} />
          <input
            type="text"
            placeholder="Search by brand or model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-background w-full rounded-2xl border border-[var(--border-subtle)] py-3.5 pr-4 pl-12 font-bold transition-colors focus:border-[var(--color-brand-green)] focus:outline-none"
          />
        </div>
        <div className="relative min-w-[200px]">
          <Filter className="text-muted absolute top-1/2 left-4 -translate-y-1/2" size={20} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background w-full cursor-pointer appearance-none rounded-2xl border border-[var(--border-subtle)] py-3.5 pr-4 pl-12 font-bold transition-colors focus:border-[var(--color-brand-green)] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ASSIGNED">Assigned (Pending)</option>
            <option value="REPORT_UPLOADED">Report Uploaded</option>
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
              <div className="text-muted p-12 text-center text-lg font-bold">
                No inspections found matching your criteria.
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
  const images = listing.media?.filter((m: any) => m.mediaType !== 'pdf') || [];

  return (
    <div className="hover:bg-foreground/5 flex flex-col items-center justify-between gap-6 p-6 transition-colors md:flex-row md:p-8">
      <div className="flex w-full flex-1 flex-col items-start gap-6 md:flex-row md:items-center">
        {images.length > 0 ? (
          <div className="group bg-foreground/5 relative h-48 w-full shrink-0 overflow-hidden rounded-2xl border border-[var(--border-subtle)] shadow-sm md:h-24 md:w-32">
            <img
              src={images[currentImageIndex]?.url}
              alt={`Tractor Image ${currentImageIndex + 1}`}
              className="animate-in fade-in h-full w-full object-cover transition-all duration-300"
            />

            {images.length > 1 && (
              <>
                {/* Left Arrow */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                  }}
                  className="absolute top-1/2 left-1 flex -translate-y-1/2 items-center justify-center rounded-full bg-black/40 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/60"
                >
                  <ChevronLeft size={12} />
                </button>

                {/* Right Arrow */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                  }}
                  className="absolute top-1/2 right-1 flex -translate-y-1/2 items-center justify-center rounded-full bg-black/40 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/60"
                >
                  <ChevronRight size={12} />
                </button>

                {/* Indicators / Dots */}
                <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5 rounded-full bg-black/30 px-1 py-0.5">
                  {images.map((_: any, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentImageIndex(idx);
                      }}
                      className={`h-1 w-1 rounded-full transition-all ${
                        idx === currentImageIndex ? 'w-2 bg-white' : 'bg-foreground/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="bg-foreground/5 text-muted flex h-48 w-full shrink-0 flex-col items-center justify-center rounded-2xl border border-[var(--border-subtle)] md:h-24 md:w-32">
            <span className="text-xs font-bold tracking-widest uppercase">No Image</span>
          </div>
        )}

        <div className="flex flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <h3 className="text-2xl font-black transition-colors group-hover:text-[var(--color-brand-green)]">
              {listing.tractorBrand} {listing.tractorModel}
            </h3>
            <span
              className={`rounded-full px-4 py-1.5 text-xs font-black tracking-widest uppercase ${
                inspection.status === 'ASSIGNED'
                  ? 'bg-orange-500/10 text-orange-500'
                  : inspection.status === 'CERTIFIED'
                    ? 'bg-[var(--color-brand-green)] text-white'
                    : 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]'
              }`}
            >
              {inspection.status.replace('_', ' ')}
            </span>
          </div>

          <div className="text-muted flex flex-wrap items-center gap-6 text-sm font-bold">
            <span className="flex items-center gap-2">
              <Calendar size={18} /> Assigned: {new Date(inspection.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-2">
              <MapPin size={18} /> Location: {listing.villageCity || 'Unknown'}, {listing.district}
            </span>
          </div>
        </div>
      </div>

      <Link
        href={`/agent/inspections/${inspection.id}`}
        className="bg-foreground text-background w-full shrink-0 rounded-xl px-8 py-3.5 text-center text-sm font-black tracking-wider uppercase shadow-lg transition-all hover:scale-105 active:scale-95 md:w-auto"
      >
        {inspection.status === 'ASSIGNED' ? 'Start Inspection' : 'View Report'}
      </Link>
    </div>
  );
}
