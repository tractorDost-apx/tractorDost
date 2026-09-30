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
import Pagination from '@/components/shared/Pagination';

export default function AdminUsedInspectionsPage() {
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

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
    usedTractorInspectionAPI.certifyInspection(id).then((res) => {
      if (res.success) {
        fetchInspections();
      }
    });
  };

  const filteredInspections = inspections.filter(
    (i) => activeTab === 'ALL' || i.status === activeTab
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-foreground text-3xl font-black tracking-tight">
            Tractor Inspections
          </h1>
          <p className="text-muted mt-1 font-medium">
            Manage physical inspection requests and reports.
          </p>
        </div>
      </div>

      <div className="bg-foreground/5 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[var(--border-subtle)] p-2 md:flex-row">
        <div className="no-scrollbar flex w-full gap-1 overflow-x-auto md:w-auto">
          {['ALL', 'PENDING', 'ASSIGNED', 'REPORT_UPLOADED', 'COMPLETED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-6 py-2.5 text-sm font-bold whitespace-nowrap transition-all ${activeTab === tab ? 'bg-background text-foreground border border-[var(--border-subtle)] shadow-sm' : 'text-muted hover:text-foreground hover:bg-foreground/5'}`}
            >
              {tab === 'ALL' ? 'All Inspections' : tab.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-background overflow-hidden rounded-3xl border border-[var(--border-subtle)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-foreground/5 border-b border-[var(--border-subtle)]">
                <th className="text-muted px-6 py-4 text-xs font-black tracking-wider uppercase">
                  Listing ID
                </th>
                <th className="text-muted px-6 py-4 text-xs font-black tracking-wider uppercase">
                  Status
                </th>
                <th className="text-muted px-6 py-4 text-xs font-black tracking-wider uppercase">
                  Inspector
                </th>
                <th className="text-muted px-6 py-4 text-xs font-black tracking-wider uppercase">
                  Report
                </th>
                <th className="text-muted px-6 py-4 text-right text-xs font-black tracking-wider uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-foreground/10 divide-y">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <TractorLoader
                      className="mx-auto mb-2 text-[var(--color-brand-green)]"
                      size={48}
                    />
                  </td>
                </tr>
              ) : filteredInspections.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-muted px-6 py-12 text-center font-medium">
                    No inspections found.
                  </td>
                </tr>
              ) : (
                filteredInspections.slice((page - 1) * limit, page * limit).map((insp: any) => (
                  <tr key={insp.id} className="hover:bg-foreground/[0.02] transition-colors">
                    <td className="px-6 py-4 font-bold">#{insp.listingId}</td>
                    <td className="px-6 py-4">
                      <span className="bg-foreground/10 text-foreground rounded px-2 py-1 text-xs font-bold uppercase">
                        {insp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {insp.inspectorId ? (
                        <span className="font-bold">ID: {insp.inspectorId}</span>
                      ) : (
                        <span className="text-muted font-medium italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {insp.reportUrl ? (
                        <a
                          href={insp.reportUrl}
                          target="_blank"
                          className="flex items-center gap-1 text-sm font-bold text-blue-500 underline"
                        >
                          <FileCheck size={14} /> View
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {insp.status === 'REPORT_UPLOADED' && (
                        <button
                          onClick={() => certifyTractor(insp.id)}
                          className="ml-auto flex items-center gap-1 rounded bg-[var(--color-brand-green)] px-3 py-1.5 text-xs font-bold text-white"
                        >
                          <ShieldCheck size={14} /> Certify
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredInspections.length > 0 && (
          <Pagination
            page={page}
            limit={limit}
            totalCount={filteredInspections.length}
            totalPages={Math.ceil(filteredInspections.length / limit)}
            onPageChange={setPage}
            onLimitChange={(l) => {
              setLimit(l);
              setPage(1);
            }}
          />
        )}
      </div>
    </div>
  );
}
