'use client';

import React, { useState, useEffect } from 'react';
import { usedTractorEnquiryAPI } from '@/lib/api/used-enquiries';
import {
  Search,
  MessageCircle,
  Clock,
  CheckCircle2,
  Phone,
  User as UserIcon,
  Filter,
  XCircle,
  MoreVertical,
} from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';

export default function AdminUsedEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = () => {
    setLoading(true);
    usedTractorEnquiryAPI.getAllEnquiries().then((res: any) => {
      if (res.success && res.data) {
        setEnquiries(res.data);
      }
      setLoading(false);
    });
  };

  const updateStatus = (id: number, status: string) => {
    setUpdatingId(id);
    usedTractorEnquiryAPI.updateEnquiryStatus(id, status).then((res: any) => {
      if (res.success) {
        setEnquiries(enquiries.map(e => e.id === id ? { ...e, status } : e));
      }
      setUpdatingId(null);
    });
  };

  const filteredEnquiries = enquiries.filter(e =>
    (activeTab === 'ALL' || e.status === activeTab) &&
    (e.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.mobile?.includes(searchQuery))
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW': return <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded text-xs font-bold uppercase">New</span>;
      case 'CONTACTED': return <span className="px-2 py-1 bg-amber-500/10 text-amber-500 rounded text-xs font-bold uppercase">Contacted</span>;
      case 'QUALIFIED': return <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded text-xs font-bold uppercase">Qualified</span>;
      case 'LOST': return <span className="px-2 py-1 bg-red-500/10 text-red-500 rounded text-xs font-bold uppercase">Lost</span>;
      default: return <span className="px-2 py-1 bg-foreground/10 text-foreground rounded text-xs font-bold uppercase">{status}</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Used Tractor Enquiries</h1>
          <p className="text-muted font-medium mt-1">Manage buyer leads for used tractor listings.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-foreground/5 p-2 rounded-2xl border border-[var(--border-subtle)]">
        <div className="flex w-full md:w-auto overflow-x-auto no-scrollbar gap-1">
          {['ALL', 'NEW', 'CONTACTED', 'QUALIFIED', 'LOST'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab ? 'bg-background text-foreground shadow-sm border border-[var(--border-subtle)]' : 'text-muted hover:text-foreground hover:bg-foreground/5'}`}
            >
              {tab === 'ALL' ? 'All Leads' : tab}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            type="text"
            placeholder="Search by name or mobile..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-[var(--border-subtle)] rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]"
          />
        </div>
      </div>

      <div className="bg-background rounded-3xl border border-[var(--border-subtle)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-foreground/5 border-b border-[var(--border-subtle)]">
                <th className="px-6 py-4 text-xs font-black text-muted uppercase tracking-wider">Buyer Detail</th>
                <th className="px-6 py-4 text-xs font-black text-muted uppercase tracking-wider">Listing Ref</th>
                <th className="px-6 py-4 text-xs font-black text-muted uppercase tracking-wider">Message/Offer</th>
                <th className="px-6 py-4 text-xs font-black text-muted uppercase tracking-wider">Status</th>
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
              ) : filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted font-medium">
                    No enquiries found.
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((enquiry: any) => (
                  <tr key={enquiry.id} className="hover:bg-foreground/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-black text-foreground flex items-center gap-2"><UserIcon size={14}/> {enquiry.name}</div>
                      <div className="text-xs font-bold text-muted mt-1 flex items-center gap-1"><Phone size={12}/> {enquiry.mobile}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground">Listing #{enquiry.listingId || enquiry.tractorId}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="text-sm font-medium truncate">{enquiry.message || '-'}</div>
                      {enquiry.offerPrice && <div className="text-xs font-black text-[var(--color-brand-green)] mt-1">Offer: ₹{enquiry.offerPrice.toLocaleString('en-IN')}</div>}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(enquiry.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {updatingId === enquiry.id ? (
                        <TractorLoader size={20} />
                      ) : (
                        <select 
                          className="bg-foreground/5 border border-[var(--border-subtle)] text-xs font-bold rounded-lg px-2 py-1.5 outline-none"
                          value={enquiry.status}
                          onChange={(e) => updateStatus(enquiry.id, e.target.value)}
                        >
                          <option value="NEW">New</option>
                          <option value="CONTACTED">Contacted</option>
                          <option value="QUALIFIED">Qualified</option>
                          <option value="LOST">Lost</option>
                        </select>
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
