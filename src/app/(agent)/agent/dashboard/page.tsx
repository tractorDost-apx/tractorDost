'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/store/AuthContext';
import { usedTractorInspectionAPI } from '@/lib/api/used-inspections';
import { ClipboardCheck, CheckCircle2, Clock, MapPin, Tractor, Calendar } from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';
import Link from 'next/link';

export default function AgentDashboardOverview() {
  const { user } = useAuth();
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await usedTractorInspectionAPI.getAllInspections({ inspectorId: user?.id });
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

  const assigned = inspections.length;
  const pending = inspections.filter((i) => i.status === 'ASSIGNED').length;
  const completed = inspections.filter((i) => i.status !== 'ASSIGNED').length;

  const recentInspections = inspections.slice(0, 5); // Show latest 5

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-500">
      <div>
        <h1 className="mb-2 text-3xl font-black">
          Welcome, {user?.fullName?.split(' ')[0] || 'Agent'}! 👋
        </h1>
        <p className="text-muted font-medium">Here is the overview of your inspection tasks.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="bg-background flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] p-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
            <ClipboardCheck size={28} />
          </div>
          <div>
            <p className="text-muted text-sm font-bold tracking-widest uppercase">Total Assigned</p>
            <p className="text-3xl font-black">{assigned}</p>
          </div>
        </div>
        <div className="bg-background flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] p-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-muted text-sm font-bold tracking-widest uppercase">Pending</p>
            <p className="text-3xl font-black">{pending}</p>
          </div>
        </div>
        <div className="bg-background flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] p-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <p className="text-muted text-sm font-bold tracking-widest uppercase">Completed</p>
            <p className="text-3xl font-black">{completed}</p>
          </div>
        </div>
      </div>

      <div className="bg-background overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] p-6">
          <h2 className="text-xl font-black">Recent Assignments</h2>
          <Link
            href="/agent/inspections"
            className="text-sm font-bold text-[var(--color-brand-green)] hover:underline"
          >
            View All
          </Link>
        </div>

        <div className="divide-y divide-[var(--border-subtle)]">
          {recentInspections.length === 0 ? (
            <div className="text-muted p-8 text-center font-bold">No tasks assigned yet.</div>
          ) : (
            recentInspections.map((inspection) => (
              <div
                key={inspection.id}
                className="hover:bg-foreground/5 flex flex-col items-center gap-6 p-6 transition-colors sm:flex-row"
              >
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black">
                      {inspection.listing?.brand?.name} {inspection.listing?.model}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-black tracking-wider uppercase ${
                        inspection.status === 'ASSIGNED'
                          ? 'bg-orange-500/10 text-orange-500'
                          : 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]'
                      }`}
                    >
                      {inspection.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-muted flex flex-wrap items-center gap-4 text-sm font-bold">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={16} /> {new Date(inspection.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin size={16} /> {inspection.listing?.district},{' '}
                      {inspection.listing?.state}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/agent/inspections/${inspection.id}`}
                  className="bg-foreground text-background w-full shrink-0 rounded-xl px-6 py-2.5 text-center text-sm font-black transition-all hover:opacity-90 sm:w-auto"
                >
                  {inspection.status === 'ASSIGNED' ? 'Start Inspection' : 'View Report'}
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
