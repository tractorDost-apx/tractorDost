'use client';

import React, { useState } from 'react';
import {
  MessageSquareText,
  Search,
  Filter,
  RefreshCw,
  Phone,
  User,
  Tractor,
  CheckCircle2,
  Clock,
  Send,
  X,
  ChevronRight,
} from 'lucide-react';

interface DealerLead {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  location: string;
  interestedModel: string;
  enquiryType: 'BUY' | 'TEST_DRIVE' | 'FINANCE' | 'EXCHANGE';
  status: 'NEW' | 'CONTACTED' | 'IN_PROGRESS' | 'CONVERTED' | 'CLOSED';
  createdAt: string;
  lastContactedAt?: string;
  notes?: string;
}

const INITIAL_LEADS: DealerLead[] = [
  {
    id: 'LEAD-101',
    customerName: 'Ramesh Patil',
    phone: '+91 98230 11223',
    email: 'ramesh.patil@gmail.com',
    location: 'Baramati, Pune',
    interestedModel: 'Swaraj 744 FE',
    enquiryType: 'BUY',
    status: 'NEW',
    createdAt: '2026-08-21T10:30:00Z',
    notes: 'Interested in seasonal festive discount and 50% down payment financing options.',
  },
  {
    id: 'LEAD-102',
    customerName: 'Suresh Deshmukh',
    phone: '+91 97654 44321',
    location: 'Indapur, Pune',
    interestedModel: 'Mahindra 575 DI SP Plus',
    enquiryType: 'TEST_DRIVE',
    status: 'CONTACTED',
    createdAt: '2026-08-20T14:15:00Z',
    lastContactedAt: '2026-08-21T09:00:00Z',
    notes: 'Test drive scheduled for Saturday 11 AM at showroom.',
  },
  {
    id: 'LEAD-103',
    customerName: 'Vikram Shinde',
    phone: '+91 94221 88990',
    email: 'vikram.shinde@yahoo.com',
    location: 'Phaltan, Satara',
    interestedModel: 'Eicher 380 Super DI',
    enquiryType: 'FINANCE',
    status: 'IN_PROGRESS',
    createdAt: '2026-08-19T11:00:00Z',
    lastContactedAt: '2026-08-20T16:30:00Z',
    notes: 'Loan application submitted to SBI Rural branch.',
  },
  {
    id: 'LEAD-104',
    customerName: 'Ganesh Jadhav',
    phone: '+91 99887 76655',
    location: 'Karad, Satara',
    interestedModel: 'Farmtrac 60 Powermaxx',
    enquiryType: 'EXCHANGE',
    status: 'CONVERTED',
    createdAt: '2026-08-18T09:45:00Z',
    lastContactedAt: '2026-08-19T17:00:00Z',
    notes: 'Old tractor valued at ₹2.4 Lakhs. Deal finalized.',
  },
  {
    id: 'LEAD-105',
    customerName: 'Anil Kadam',
    phone: '+91 98901 23456',
    location: 'Shirur, Pune',
    interestedModel: 'John Deere 5050 D',
    enquiryType: 'BUY',
    status: 'CLOSED',
    createdAt: '2026-08-15T16:20:00Z',
    lastContactedAt: '2026-08-16T12:00:00Z',
    notes: 'Purchased competitor brand.',
  },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<DealerLead[]>(INITIAL_LEADS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedLead, setSelectedLead] = useState<DealerLead | null>(null);
  const [noteInput, setNoteInput] = useState('');

  // Filtered Leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      lead.interestedModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // KPI Metrics
  const totalLeads = leads.length;
  const newLeadsCount = leads.filter((l) => l.status === 'NEW').length;
  const inProgressCount = leads.filter(
    (l) => l.status === 'IN_PROGRESS' || l.status === 'CONTACTED'
  ).length;
  const convertedCount = leads.filter((l) => l.status === 'CONVERTED').length;

  const handleUpdateStatus = (leadId: string, newStatus: DealerLead['status']) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId ? { ...l, status: newStatus, lastContactedAt: new Date().toISOString() } : l
      )
    );
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead({
        ...selectedLead,
        status: newStatus,
        lastContactedAt: new Date().toISOString(),
      });
    }
  };

  const handleAddNote = () => {
    if (!selectedLead || !noteInput.trim()) return;
    const updatedNotes = selectedLead.notes
      ? `${selectedLead.notes}\n[${new Date().toLocaleDateString()}] ${noteInput.trim()}`
      : `[${new Date().toLocaleDateString()}] ${noteInput.trim()}`;

    setLeads((prev) =>
      prev.map((l) => (l.id === selectedLead.id ? { ...l, notes: updatedNotes } : l))
    );
    setSelectedLead({ ...selectedLead, notes: updatedNotes });
    setNoteInput('');
  };

  const getStatusBadge = (status: DealerLead['status']) => {
    switch (status) {
      case 'NEW':
        return {
          label: 'New Lead',
          color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        };
      case 'CONTACTED':
        return {
          label: 'Contacted',
          color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        };
      case 'IN_PROGRESS':
        return {
          label: 'In Negotiation',
          color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        };
      case 'CONVERTED':
        return {
          label: 'Converted',
          color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        };
      case 'CLOSED':
        return { label: 'Closed / Lost', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' };
    }
  };

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      {/* Sleek Admin Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="shrink-0 rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 p-2.5 text-[var(--color-brand-green)]">
            <MessageSquareText size={26} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                Leads & Enquiries
              </h1>
              <span className="rounded-full border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-3 py-1 text-xs font-black tracking-wider text-[var(--color-brand-green)] uppercase">
                {totalLeads} Total Leads
              </span>
            </div>
            <p className="text-muted mt-0.5 text-xs font-bold sm:text-sm">
              Manage incoming customer purchase enquiries, test drive requests, and sales
              follow-ups.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setSearchQuery('');
            setStatusFilter('ALL');
          }}
          className="bg-foreground/5 text-muted hover:text-foreground flex shrink-0 items-center justify-center self-start rounded-xl border border-[var(--border-subtle)] p-2.5 transition-all hover:border-[var(--color-brand-green)]/30 sm:self-auto"
          title="Reset Filters"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* KPI Stat Strip Layout */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-foreground/5 flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] p-4 sm:p-5">
          <div className="shrink-0 rounded-xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 p-3 text-[var(--color-brand-green)]">
            <MessageSquareText size={22} />
          </div>
          <div>
            <div className="text-foreground text-2xl font-black tracking-tight">{totalLeads}</div>
            <div className="text-muted text-xs font-bold tracking-wider uppercase">
              Total Enquiries
            </div>
          </div>
        </div>

        <div className="bg-foreground/5 flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] p-4 sm:p-5">
          <div className="shrink-0 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-amber-500">
            <Clock size={22} />
          </div>
          <div>
            <div className="text-foreground text-2xl font-black tracking-tight">
              {newLeadsCount}
            </div>
            <div className="text-muted text-xs font-bold tracking-wider uppercase">
              New Enquiries
            </div>
          </div>
        </div>

        <div className="bg-foreground/5 flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] p-4 sm:p-5">
          <div className="shrink-0 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-500">
            <Phone size={22} />
          </div>
          <div>
            <div className="text-foreground text-2xl font-black tracking-tight">
              {inProgressCount}
            </div>
            <div className="text-muted text-xs font-bold tracking-wider uppercase">
              In Negotiation
            </div>
          </div>
        </div>

        <div className="bg-foreground/5 flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] p-4 sm:p-5">
          <div className="shrink-0 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-500">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="text-foreground text-2xl font-black tracking-tight">
              {convertedCount}
            </div>
            <div className="text-muted text-xs font-bold tracking-wider uppercase">
              Converted Sales
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Control Bar */}
      <div className="flex flex-col items-stretch justify-between gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search size={18} className="text-muted absolute top-3 left-3.5" />
          <input
            type="text"
            placeholder="Search by farmer name, phone number, model, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] py-2 pr-4 pl-10 text-xs font-medium transition-colors focus:border-[var(--color-brand-green)] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-foreground/5 flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3 py-1.5 text-xs">
            <Filter size={14} className="text-muted shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-foreground cursor-pointer bg-transparent font-bold focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New Lead</option>
              <option value="CONTACTED">Contacted</option>
              <option value="IN_PROGRESS">In Negotiation</option>
              <option value="CONVERTED">Converted</option>
              <option value="CLOSED">Closed / Lost</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lead Table Container */}
      <div className="bg-foreground/5 rounded-3xl border border-[var(--border-subtle)] p-4 sm:p-6">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="text-muted border-b border-[var(--border-subtle)] text-xs font-bold tracking-wider uppercase">
                <th className="px-4 py-3.5">Customer Info</th>
                <th className="px-4 py-3.5">Target Model</th>
                <th className="px-4 py-3.5">Type</th>
                <th className="px-4 py-3.5">Lead Status</th>
                <th className="px-4 py-3.5">Date Logged</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] text-sm font-medium">
              {filteredLeads.map((lead) => {
                const statusBadge = getStatusBadge(lead.status);
                return (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="hover:bg-foreground/5 group cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 font-bold text-[var(--color-brand-green)]">
                          <User size={18} />
                        </div>
                        <div>
                          <div className="text-foreground text-sm font-black tracking-tight transition-colors group-hover:text-[var(--color-brand-green)]">
                            {lead.customerName}
                          </div>
                          <div className="text-muted mt-0.5 flex items-center gap-2 font-mono text-xs">
                            <span>{lead.phone}</span>
                            <span>•</span>
                            <span>{lead.location}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="text-foreground flex items-center gap-1.5 text-xs font-bold">
                        <Tractor size={14} className="shrink-0 text-[var(--color-brand-green)]" />
                        {lead.interestedModel}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="bg-foreground/5 text-foreground/80 rounded-md border border-[var(--border-subtle)] px-2.5 py-1 text-[10px] font-black tracking-wider uppercase">
                        {lead.enquiryType}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${statusBadge.color}`}
                      >
                        {statusBadge.label}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="text-muted font-mono text-xs">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLead(lead);
                        }}
                        className="bg-foreground/5 text-muted inline-flex items-center gap-1 rounded-xl border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-bold transition-colors hover:bg-[var(--color-brand-green)]/10 hover:text-[var(--color-brand-green)]"
                      >
                        View & Manage <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="space-y-4 md:hidden">
          {filteredLeads.map((lead) => {
            const statusBadge = getStatusBadge(lead.status);
            return (
              <div
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                className="bg-foreground/5 cursor-pointer space-y-3 rounded-2xl border border-[var(--border-subtle)] p-4 transition-all hover:border-[var(--color-brand-green)]/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 font-bold text-[var(--color-brand-green)]">
                      <User size={18} />
                    </div>
                    <div>
                      <h4 className="text-foreground text-sm leading-tight font-black">
                        {lead.customerName}
                      </h4>
                      <p className="text-muted mt-0.5 text-xs">
                        {lead.phone} • {lead.location}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusBadge.color}`}
                  >
                    {statusBadge.label}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-2 text-xs">
                  <span className="text-foreground flex items-center gap-1 font-bold">
                    <Tractor size={12} className="text-[var(--color-brand-green)]" />{' '}
                    {lead.interestedModel}
                  </span>
                  <span className="text-muted font-mono text-[10px]">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lead Detail & Disposition Modal */}
      {selectedLead && (
        <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/25 p-4 dark:bg-black/60">
          <div className="text-foreground relative my-8 flex w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--background)] shadow-2xl [backdrop-filter:none]">
            <div className="bg-foreground/5 flex items-center justify-between border-b border-[var(--border-subtle)] p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 p-2.5 text-[var(--color-brand-green)]">
                  <User size={22} />
                </div>
                <div>
                  <h3 className="text-foreground text-xl font-black tracking-tight">
                    {selectedLead.customerName}
                  </h3>
                  <p className="text-muted font-mono text-xs">Lead ID #{selectedLead.id}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedLead(null)}
                className="text-muted hover:text-foreground hover:bg-foreground/10 rounded-xl p-2 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* Contact Details Grid */}
              <div className="bg-foreground/5 grid grid-cols-2 gap-4 rounded-2xl border border-[var(--border-subtle)] p-4 text-xs">
                <div>
                  <span className="text-muted block font-bold">Phone Number</span>
                  <a
                    href={`tel:${selectedLead.phone}`}
                    className="mt-0.5 flex items-center gap-1.5 text-sm font-black text-[var(--color-brand-green)] hover:underline"
                  >
                    <Phone size={14} /> {selectedLead.phone}
                  </a>
                </div>
                <div>
                  <span className="text-muted block font-bold">Location</span>
                  <span className="text-foreground mt-0.5 block text-sm font-bold">
                    {selectedLead.location}
                  </span>
                </div>
                <div>
                  <span className="text-muted block font-bold">Interested Model</span>
                  <span className="text-foreground mt-0.5 block font-bold">
                    {selectedLead.interestedModel}
                  </span>
                </div>
                <div>
                  <span className="text-muted block font-bold">Enquiry Type</span>
                  <span className="text-foreground mt-0.5 block font-bold">
                    {selectedLead.enquiryType}
                  </span>
                </div>
              </div>

              {/* Update Lead Status */}
              <div className="space-y-2">
                <label className="text-muted block text-xs font-bold tracking-wider uppercase">
                  Update Lead Status
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {(['NEW', 'CONTACTED', 'IN_PROGRESS', 'CONVERTED', 'CLOSED'] as const).map(
                    (st) => {
                      const active = selectedLead.status === st;
                      return (
                        <button
                          key={st}
                          onClick={() => handleUpdateStatus(selectedLead.id, st)}
                          className={`rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
                            active
                              ? 'border-[var(--color-brand-green)]/40 bg-[var(--color-brand-green)]/20 text-[var(--color-brand-green)] shadow-sm'
                              : 'bg-foreground/5 text-muted hover:text-foreground hover:bg-foreground/10 border-[var(--border-subtle)]'
                          }`}
                        >
                          {st.replace('_', ' ')}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Call Notes & History */}
              <div className="space-y-3">
                <label className="text-muted block text-xs font-bold tracking-wider uppercase">
                  Conversation & Call Notes
                </label>

                {selectedLead.notes && (
                  <div className="bg-foreground/5 text-foreground/90 rounded-2xl border border-[var(--border-subtle)] p-4 text-xs leading-relaxed font-medium whitespace-pre-line">
                    {selectedLead.notes}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Log call outcome or customer feedback..."
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    className="bg-foreground/5 text-foreground flex-1 rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-xs transition-colors focus:border-[var(--color-brand-green)] focus:outline-none"
                  />
                  <button
                    onClick={handleAddNote}
                    className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[var(--color-brand-green)] px-4 py-2 text-xs font-bold tracking-wider text-white uppercase shadow-md transition-all hover:opacity-90"
                  >
                    <Send size={14} /> Log Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
