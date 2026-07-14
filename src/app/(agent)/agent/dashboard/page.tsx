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
  Calendar
} from 'lucide-react';
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
  const pending = inspections.filter(i => i.status === 'ASSIGNED').length;
  const completed = inspections.filter(i => i.status !== 'ASSIGNED').length;
  
  const recentInspections = inspections.slice(0, 5); // Show latest 5

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black mb-2">Welcome, {user?.fullName?.split(' ')[0] || 'Agent'}! 👋</h1>
        <p className="text-muted font-medium">Here is the overview of your inspection tasks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-background rounded-2xl p-6 border border-[var(--border-subtle)] flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <ClipboardCheck size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-muted uppercase tracking-widest">Total Assigned</p>
            <p className="text-3xl font-black">{assigned}</p>
          </div>
        </div>
        <div className="bg-background rounded-2xl p-6 border border-[var(--border-subtle)] flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-muted uppercase tracking-widest">Pending</p>
            <p className="text-3xl font-black">{pending}</p>
          </div>
        </div>
        <div className="bg-background rounded-2xl p-6 border border-[var(--border-subtle)] flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] flex items-center justify-center shrink-0">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-muted uppercase tracking-widest">Completed</p>
            <p className="text-3xl font-black">{completed}</p>
          </div>
        </div>
      </div>

      <div className="bg-background rounded-2xl border border-[var(--border-subtle)] overflow-hidden">
        <div className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <h2 className="text-xl font-black">Recent Assignments</h2>
          <Link href="/agent/inspections" className="text-sm font-bold text-[var(--color-brand-green)] hover:underline">
            View All
          </Link>
        </div>
        
        <div className="divide-y divide-[var(--border-subtle)]">
          {recentInspections.length === 0 ? (
            <div className="p-8 text-center text-muted font-bold">No tasks assigned yet.</div>
          ) : (
            recentInspections.map((inspection) => (
              <div key={inspection.id} className="p-6 flex flex-col sm:flex-row items-center gap-6 hover:bg-foreground/5 transition-colors">
                
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-lg">
                      {inspection.listing?.brand?.name} {inspection.listing?.model}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      inspection.status === 'ASSIGNED' ? 'bg-orange-500/10 text-orange-500' : 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]'
                    }`}>
                      {inspection.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-muted">
                    <span className="flex items-center gap-1.5"><Calendar size={16} /> {new Date(inspection.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={16} /> {inspection.listing?.district}, {inspection.listing?.state}</span>
                  </div>
                </div>

                <Link
                  href={`/agent/inspections/${inspection.id}`}
                  className="px-6 py-2.5 rounded-xl font-black text-sm bg-foreground text-background hover:opacity-90 transition-all shrink-0 w-full sm:w-auto text-center"
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
