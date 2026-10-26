'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Banknote,
  Building2,
  Users,
  Search,
  CheckCircle2,
  Clock,
  Phone,
  Filter,
  ArrowRight,
  Calculator,
  Percent,
} from 'lucide-react';
import { leadAPI, Lead } from '@/lib/api/leads';
import { LOAN_PARTNERS } from '@/lib/api/loan';
import { TractorLoader } from '@/components/ui/TractorLoader';
import { toast } from '@/components/ui/toast';

export default function AdminFinancePage() {
  const [loanLeads, setLoanLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadLeads = async () => {
    try {
      setLoading(true);
      const res = await leadAPI.getLeads({ leadType: 'LOAN', limit: 50 });
      if (res.success && res.data) {
        setLoanLeads(res.data.leads || (res.data as any).data || []);
      }
    } catch (err) {
      console.error('Failed to load loan leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleUpdateStatus = async (leadId: number, newStatus: any) => {
    try {
      await leadAPI.updateLead(leadId, { status: newStatus });
      toast.success('Lead status updated successfully');
      await loadLeads();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update lead status');
    }
  };

  const filteredLeads = loanLeads.filter((l) => {
    if (statusFilter !== 'ALL' && l.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        l.name.toLowerCase().includes(q) ||
        (l.mobile || '').toLowerCase().includes(q) ||
        (l.state && l.state.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalRequestedVolume = loanLeads.reduce(
    (sum, l) => sum + (l.budget || (Number((l as any).metadata?.loanAmountRequested)) || 500000),
    0
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-lime-400/10 text-lime-400">
              <Banknote size={18} />
            </span>
            <h1 className="text-2xl font-black text-foreground">Agricultural Finance & Loan Desk</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Track farmer tractor loan applications, credit appraisals, and partner bank sanction pipelines.
          </p>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 gap-4 rounded-3xl border border-border/60 bg-card/60 p-6 shadow-xl backdrop-blur-xl sm:grid-cols-4">
        <div>
          <span className="text-muted-foreground block text-[10px] font-bold uppercase">
            Total Applications
          </span>
          <span className="text-2xl font-black text-foreground">{loanLeads.length}</span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[10px] font-bold uppercase">
            Total Credit Volume
          </span>
          <span className="text-2xl font-black text-lime-400">
            ₹ {(totalRequestedVolume / 10000000).toFixed(2)} Cr
          </span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[10px] font-bold uppercase">
            Partner Lenders
          </span>
          <span className="text-2xl font-black text-foreground">{LOAN_PARTNERS.length} Banks</span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[10px] font-bold uppercase">
            Avg. Loan Size
          </span>
          <span className="text-2xl font-black text-foreground">₹ 5.25 Lakh</span>
        </div>
      </div>

      {/* Banking Partners Rates Widget */}
      <div className="rounded-3xl border border-border/60 bg-card/60 p-6 shadow-xl">
        <h2 className="text-lg font-black text-foreground mb-4 flex items-center gap-2">
          <Building2 size={18} className="text-lime-400" />
          Active Lending Partners & Sanction Terms
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LOAN_PARTNERS.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border/40 bg-secondary/20 p-4 text-xs">
              <h4 className="font-extrabold text-foreground text-sm mb-1">{p.name}</h4>
              <p className="text-[11px] text-muted-foreground mb-3">{p.popularFor}</p>
              <div className="space-y-1 text-muted-foreground border-t border-border/30 pt-2">
                <div className="flex justify-between">
                  <span>Interest:</span>
                  <span className="font-bold text-lime-400">{p.minRate}% - {p.maxRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Funding:</span>
                  <span className="font-bold text-foreground">Up to {p.maxFundingPct}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Tenure:</span>
                  <span className="font-bold text-foreground">{p.maxTenureMonths} Months</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Loan Applications Table */}
      <div className="rounded-3xl border border-border/60 bg-card/60 p-6 shadow-xl">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-black text-foreground">Inbound Loan Applications</h2>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter pills */}
            <div className="flex gap-1 bg-secondary/40 p-1 rounded-xl text-xs font-bold">
              {['ALL', 'NEW', 'CONTACTED', 'IN_PROGRESS', 'CLOSED'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`rounded-lg px-2.5 py-1 transition-all ${
                    statusFilter === st ? 'bg-lime-400 text-black shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="relative min-w-[220px]">
              <Search size={14} className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search farmer or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-card/60 border-border/50 text-foreground w-full rounded-full border py-1.5 pl-8 pr-3 text-xs font-medium focus:border-lime-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <TractorLoader size={40} />
            <p className="text-muted-foreground mt-3 text-xs font-bold">Loading loan applications...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No loan applications matching current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/40 text-muted-foreground uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="pb-3 font-bold">Applicant Name</th>
                  <th className="pb-3 font-bold">Contact</th>
                  <th className="pb-3 font-bold">Location</th>
                  <th className="pb-3 font-bold">Tractor Target</th>
                  <th className="pb-3 font-bold">Requested Loan</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredLeads.map((l) => (
                  <tr key={l.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-3.5 pr-4 font-bold text-foreground">
                      {l.name}
                    </td>
                    <td className="py-3.5 pr-4">
                      <a href={`tel:${l.mobile}`} className="text-lime-400 font-bold hover:underline">
                        +91 {l.mobile}
                      </a>
                    </td>
                    <td className="py-3.5 pr-4 text-muted-foreground">
                      {l.district ? `${l.district}, ` : ''}{l.state || 'India'}
                    </td>
                    <td className="py-3.5 pr-4 text-muted-foreground">
                      {l.interestedBrand || l.tractor?.modelName || (l as any).metadata?.tractorBrand || 'Tractor'} {l.interestedModel || ''}
                    </td>
                    <td className="py-3.5 pr-4 font-extrabold text-foreground">
                      {l.budget
                        ? `₹ ${Number(l.budget).toLocaleString('en-IN')}`
                        : '₹ 5,00,000'}
                    </td>
                    <td className="py-3.5 pr-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          l.status === 'NEW'
                            ? 'bg-blue-500/15 text-blue-400'
                            : l.status === 'QUALIFIED' || l.status === 'CONTACTED' || l.status === 'INTERESTED'
                            ? 'bg-amber-500/15 text-amber-400'
                            : l.status === 'CONVERTED'
                            ? 'bg-lime-400/15 text-lime-400'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <select
                        value={l.status}
                        onChange={(e) => handleUpdateStatus(l.id, e.target.value)}
                        className="bg-secondary/40 border border-border/50 rounded-lg px-2 py-1 text-[11px] font-bold"
                      >
                        <option value="NEW">NEW</option>
                        <option value="ATTEMPTED">ATTEMPTED</option>
                        <option value="CONTACTED">CONTACTED</option>
                        <option value="QUALIFIED">QUALIFIED</option>
                        <option value="INTERESTED">INTERESTED</option>
                        <option value="DEALER_ASSIGNED">DEALER_ASSIGNED</option>
                        <option value="CONVERTED">CONVERTED</option>
                        <option value="LOST">LOST</option>
                        <option value="SPAM">SPAM</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
