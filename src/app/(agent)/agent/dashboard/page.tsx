'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/store/AuthContext';
import { usedTractorInspectionAPI } from '@/lib/api/used-inspections';
import {
  ClipboardCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Tractor,
  Calendar,
  Award,
  ArrowRight,
  IndianRupee,
  Gauge,
} from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';
import Link from 'next/link';

export default function AgentDashboardOverview() {
  const { user } = useAuth();
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role?.name?.toUpperCase() === 'ADMIN';

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Backend automatically scopes AGENT to their inspectorId.
      // For ADMIN, omitting inspectorId allows seeing all inspections.
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

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <TractorLoader className="text-[var(--color-brand-green)]" size={64} />
      </div>
    );
  }

  const totalAssigned = inspections.length;
  const pending = inspections.filter((i) => i.status === 'ASSIGNED').length;
  const reportUploaded = inspections.filter((i) => i.status === 'REPORT_UPLOADED').length;
  const certified = inspections.filter((i) => i.status === 'CERTIFIED').length;

  const recentInspections = inspections.slice(0, 5); // Show latest 5

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ASSIGNED':
        return (
          <span className="rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-black tracking-wider text-amber-600 uppercase dark:text-amber-400">
            Assigned (Pending)
          </span>
        );
      case 'REPORT_UPLOADED':
        return (
          <span className="rounded-full bg-blue-500/10 px-3 py-1 text-[11px] font-black tracking-wider text-blue-600 uppercase dark:text-blue-400">
            Report Uploaded
          </span>
        );
      case 'CERTIFIED':
        return (
          <span className="rounded-full bg-[var(--color-brand-green)]/15 px-3 py-1 text-[11px] font-black tracking-wider text-[var(--color-brand-green)] uppercase">
            Certified
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="rounded-full bg-purple-500/10 px-3 py-1 text-[11px] font-black tracking-wider text-purple-600 uppercase dark:text-purple-400">
            Completed
          </span>
        );
      default:
        return (
          <span className="bg-foreground/10 text-muted rounded-full px-3 py-1 text-[11px] font-black tracking-wider uppercase">
            {status.replace('_', ' ')}
          </span>
        );
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-500">
      <div>
        <h1 className="mb-2 text-3xl font-black">
          Welcome, {user?.fullName?.split(' ')[0] || (isAdmin ? 'Admin' : 'Agent')}! 👋
        </h1>
        <p className="text-muted font-medium">
          {isAdmin
            ? 'Inspections overview and field agent activity tracking.'
            : 'Here is the overview of your assigned tractor inspections.'}
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-background flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] p-5 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
            <ClipboardCheck size={26} />
          </div>
          <div>
            <p className="text-muted text-xs font-bold tracking-widest uppercase">Total Tasks</p>
            <p className="text-2xl font-black">{totalAssigned}</p>
          </div>
        </div>

        <div className="bg-background flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] p-5 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <Clock size={26} />
          </div>
          <div>
            <p className="text-muted text-xs font-bold tracking-widest uppercase">Pending Action</p>
            <p className="text-2xl font-black">{pending}</p>
          </div>
        </div>

        <div className="bg-background flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] p-5 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
            <CheckCircle2 size={26} />
          </div>
          <div>
            <p className="text-muted text-xs font-bold tracking-widest uppercase">
              Reports Submitted
            </p>
            <p className="text-2xl font-black">{reportUploaded}</p>
          </div>
        </div>

        <div className="bg-background flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] p-5 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
            <Award size={26} />
          </div>
          <div>
            <p className="text-muted text-xs font-bold tracking-widest uppercase">Certified</p>
            <p className="text-2xl font-black">{certified}</p>
          </div>
        </div>
      </div>

      {/* Recent Assignments Card */}
      <div className="bg-background overflow-hidden rounded-3xl border border-[var(--border-subtle)] shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] p-6">
          <div>
            <h2 className="text-xl font-black">Recent Inspection Tasks</h2>
            <p className="text-muted text-xs font-medium">Your latest tractor inspection records</p>
          </div>
          <Link
            href="/agent/inspections"
            className="flex items-center gap-1.5 text-sm font-bold text-[var(--color-brand-green)] transition-opacity hover:opacity-80"
          >
            <span>View All</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="divide-y divide-[var(--border-subtle)]">
          {recentInspections.length === 0 ? (
            <div className="text-muted flex flex-col items-center justify-center gap-3 p-12 text-center">
              <Tractor size={48} className="opacity-30" />
              <p className="text-base font-bold">No inspection tasks assigned yet.</p>
              <p className="text-xs">Once an admin assigns tractor listings, they will appear here.</p>
            </div>
          ) : (
            recentInspections.map((inspection) => {
              const listing = inspection.listing || {};
              const tractorTitle =
                listing.tractorBrand || listing.tractorModel
                  ? `${listing.tractorBrand || ''} ${listing.tractorModel || ''}`.trim()
                  : `Tractor Listing #${inspection.listingId}`;

              const askingPriceFormatted = listing.askingPrice
                ? `₹${Number(listing.askingPrice).toLocaleString('en-IN')}`
                : null;

              return (
                <div
                  key={inspection.id}
                  className="hover:bg-foreground/5 flex flex-col items-start justify-between gap-6 p-6 transition-colors sm:flex-row sm:items-center"
                >
                  <div className="flex flex-1 flex-col gap-2.5">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-lg font-black text-foreground">{tractorTitle}</span>
                      {getStatusBadge(inspection.status)}
                      {inspection.overallScore && (
                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          Score: {inspection.overallScore}/100
                        </span>
                      )}
                    </div>

                    <div className="text-muted flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={15} /> Assigned:{' '}
                        {new Date(inspection.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={15} />{' '}
                        {listing.villageCity ? `${listing.villageCity}, ` : ''}
                        {listing.district || 'Unknown'}, {listing.state || ''}
                      </span>
                      {askingPriceFormatted && (
                        <span className="text-foreground flex items-center gap-1 font-extrabold">
                          <IndianRupee size={14} /> {askingPriceFormatted}
                        </span>
                      )}
                      {listing.hoursUsed && (
                        <span className="flex items-center gap-1">
                          <Gauge size={14} /> {listing.hoursUsed} hrs
                        </span>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/agent/inspections/${inspection.id}`}
                    className="bg-foreground text-background w-full shrink-0 rounded-xl px-6 py-2.5 text-center text-sm font-black transition-all hover:scale-105 active:scale-95 sm:w-auto"
                  >
                    {inspection.status === 'ASSIGNED'
                      ? 'Start Inspection'
                      : inspection.status === 'REPORT_UPLOADED'
                        ? 'Review / Edit Report'
                        : 'View Details'}
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
