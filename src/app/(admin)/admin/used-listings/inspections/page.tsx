'use client';

import React, { useState, useEffect } from 'react';
import { usedTractorInspectionAPI } from '@/lib/api/used-inspections';
import {
  Search,
  Wrench,
  Clock,
  CheckCircle2,
  FileCheck,
  User as UserIcon,
  ShieldCheck,
} from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';

export default function AdminUsedInspectionsPage() {
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    fetchInspections();
  }, []);

  const fetchInspections = () => {
    setLoading(true);
    usedTractorInspectionAPI.getAllInspections().then((res: any) => {
      if (res.success && res.data) {
        setInspections(res.data);
      }
      setLoading(false);
    });
  };

  const certifyTractor = (id: number) => {
    usedTractorInspectionAPI.certifyInspection(id, true).then((res: any) => {
      if(res.success) {
        fetchInspections();
      }
    });
  }

  const filteredInspections = inspections.filter(i => activeTab === 'ALL' || i.status === activeTab);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Tractor Inspections</h1>
          <p className="text-muted font-medium mt-1">Manage physical inspection requests and reports.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-foreground/5 p-2 rounded-2xl border border-[var(--border-subtle)]">
        <div className="flex w-full md:w-auto overflow-x-auto no-scrollbar gap-1">
          {['ALL', 'PENDING', 'ASSIGNED', 'REPORT_UPLOADED', 'COMPLETED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab ? 'bg-background text-foreground shadow-sm border border-[var(--border-subtle)]' : 'text-muted hover:text-foreground hover:bg-foreground/5'}`}
            >
              {tab === 'ALL' ? 'All Inspections' : tab.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-background rounded-3xl border border-[var(--border-subtle)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-foreground/5 border-b border-[var(--border-subtle)]">
                <th className="px-6 py-4 text-xs font-black text-muted uppercase tracking-wider">Listing ID</th>
                <th className="px-6 py-4 text-xs font-black text-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-black text-muted uppercase tracking-wider">Inspector</th>
                <th className="px-6 py-4 text-xs font-black text-muted uppercase tracking-wider">Report</th>
                <th className="px-6 py-4 text-xs font-black text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <TractorLoader className="text-[var(--color-brand-green)] mx-auto mb-2" size={48} />
                  </td>
                </tr>
              ) : filteredInspections.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted font-medium">
                    No inspections found.
                  </td>
                </tr>
              ) : (
                filteredInspections.map((insp: any) => (
                  <tr key={insp.id} className="hover:bg-foreground/[0.02] transition-colors">
                    <td className="px-6 py-4 font-bold">#{insp.listingId}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-foreground/10 text-foreground rounded text-xs font-bold uppercase">{insp.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      {insp.inspectorId ? <span className="font-bold">ID: {insp.inspectorId}</span> : <span className="text-muted font-medium italic">Unassigned</span>}
                    </td>
                    <td className="px-6 py-4">
                      {insp.reportUrl ? <a href={insp.reportUrl} target="_blank" className="text-blue-500 font-bold text-sm underline flex items-center gap-1"><FileCheck size={14}/> View</a> : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {insp.status === 'REPORT_UPLOADED' && (
                        <button onClick={() => certifyTractor(insp.id)} className="px-3 py-1.5 bg-[var(--color-brand-green)] text-white text-xs font-bold rounded flex items-center gap-1 ml-auto">
                           <ShieldCheck size={14}/> Certify
                        </button>
                      )}
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
