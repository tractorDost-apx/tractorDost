'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/store/AuthContext';
import { usedTractorInspectionAPI } from '@/lib/api/used-inspections';
import { 
  ClipboardCheck, 
  Calendar,
  MapPin,
  Search,
  Filter
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
      const res = await usedTractorInspectionAPI.getAllInspections({ inspectorId: user?.id, limit: 50 });
      if (res.success && res.data?.data) {
        setInspections(res.data.data);
      }
    } catch (e) {
      console.error('Failed to fetch inspections', e);
    }
    setLoading(false);
  };

  const filteredInspections = inspections.filter(i => {
    const matchStatus = statusFilter === 'ALL' || i.status === statusFilter;
    const matchSearch = (i.listing?.tractorBrand || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (i.listing?.tractorModel || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <ClipboardCheck className="text-[var(--color-brand-green)]" size={32} />
            My Inspections
          </h1>
          <p className="text-muted font-medium mt-1">Manage and track your assigned tractor inspections.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
          <input
            type="text"
            placeholder="Search by brand or model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-background border border-[var(--border-subtle)] rounded-2xl font-bold focus:outline-none focus:border-[var(--color-brand-green)] transition-colors"
          />
        </div>
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-background border border-[var(--border-subtle)] rounded-2xl font-bold focus:outline-none focus:border-[var(--color-brand-green)] transition-colors appearance-none cursor-pointer"
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
        <div className="bg-background rounded-[2rem] border border-[var(--border-subtle)] overflow-hidden shadow-sm">
          <div className="divide-y divide-[var(--border-subtle)]">
            {filteredInspections.length === 0 ? (
              <div className="p-12 text-center text-muted font-bold text-lg">No inspections found matching your criteria.</div>
            ) : (
              filteredInspections.map((inspection) => (
                <div key={inspection.id} className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-foreground/5 transition-colors">
                  
                  <div className="flex-1 flex flex-col md:flex-row items-start md:items-center gap-6 w-full">
                    {inspection.listing?.documents?.[0]?.url ? (
                      <div className="w-full md:w-32 h-48 md:h-24 rounded-2xl overflow-hidden shrink-0 shadow-md">
                        <img src={inspection.listing.documents[0].url} alt="Tractor" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      </div>
                    ) : (
                      <div className="w-full md:w-32 h-48 md:h-24 rounded-2xl bg-foreground/5 flex flex-col items-center justify-center shrink-0 border border-[var(--border-subtle)] text-muted">
                        <span className="font-bold text-xs uppercase tracking-widest mt-2">No Image</span>
                      </div>
                    )}
                    
                    <div className="flex-1 flex flex-col gap-3">
                      <div className="flex items-center gap-4 flex-wrap">
                        <h3 className="font-black text-2xl group-hover:text-[var(--color-brand-green)] transition-colors">
                          {inspection.listing?.tractorBrand} {inspection.listing?.tractorModel}
                        </h3>
                      <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                        inspection.status === 'ASSIGNED' ? 'bg-orange-500/10 text-orange-500' : 
                        inspection.status === 'CERTIFIED' ? 'bg-[var(--color-brand-green)] text-white' :
                        'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]'
                      }`}>
                        {inspection.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-muted">
                      <span className="flex items-center gap-2"><Calendar size={18} /> Assigned: {new Date(inspection.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-2"><MapPin size={18} /> Location: {inspection.listing?.villageCity || 'Unknown'}, {inspection.listing?.district}</span>
                    </div>
                  </div>
                </div>

                  <Link
                    href={`/agent/inspections/${inspection.id}`}
                    className="px-8 py-3.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all w-full md:w-auto text-center shrink-0
                      bg-foreground text-background hover:scale-105 active:scale-95 shadow-lg"
                  >
                    {inspection.status === 'ASSIGNED' ? 'Start Inspection' : 'View Report'}
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
