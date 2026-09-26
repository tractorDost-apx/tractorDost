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
  const inProgressCount = leads.filter((l) => l.status === 'IN_PROGRESS' || l.status === 'CONTACTED').length;
  const convertedCount = leads.filter((l) => l.status === 'CONVERTED').length;

  const handleUpdateStatus = (leadId: string, newStatus: DealerLead['status']) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus, lastContactedAt: new Date().toISOString() } : l))
    );
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead({ ...selectedLead, status: newStatus, lastContactedAt: new Date().toISOString() });
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
        return { label: 'New Lead', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
      case 'CONTACTED':
        return { label: 'Contacted', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' };
      case 'IN_PROGRESS':
        return { label: 'In Negotiation', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' };
      case 'CONVERTED':
        return { label: 'Converted', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
      case 'CLOSED':
        return { label: 'Closed / Lost', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' };
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Sleek Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20 shrink-0">
            <MessageSquareText size={26} />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Leads & Enquiries
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20 uppercase tracking-wider">
                {totalLeads} Total Leads
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-muted mt-0.5">
              Manage incoming customer purchase enquiries, test drive requests, and sales follow-ups.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setSearchQuery('');
            setStatusFilter('ALL');
          }}
          className="p-2.5 rounded-xl bg-foreground/5 text-muted hover:text-foreground hover:border-[var(--color-brand-green)]/30 border border-[var(--border-subtle)] transition-all flex items-center justify-center shrink-0 self-start sm:self-auto"
          title="Reset Filters"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* KPI Stat Strip Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-foreground/5 p-4 sm:p-5 rounded-2xl flex items-center gap-4 border border-[var(--border-subtle)]">
          <div className="p-3 rounded-xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] shrink-0 border border-[var(--color-brand-green)]/20">
            <MessageSquareText size={22} />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-foreground">{totalLeads}</div>
            <div className="text-xs font-bold text-muted uppercase tracking-wider">Total Enquiries</div>
          </div>
        </div>

        <div className="bg-foreground/5 p-4 sm:p-5 rounded-2xl flex items-center gap-4 border border-[var(--border-subtle)]">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 shrink-0 border border-amber-500/20">
            <Clock size={22} />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-foreground">{newLeadsCount}</div>
            <div className="text-xs font-bold text-muted uppercase tracking-wider">New Enquiries</div>
          </div>
        </div>

        <div className="bg-foreground/5 p-4 sm:p-5 rounded-2xl flex items-center gap-4 border border-[var(--border-subtle)]">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 shrink-0 border border-blue-500/20">
            <Phone size={22} />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-foreground">{inProgressCount}</div>
            <div className="text-xs font-bold text-muted uppercase tracking-wider">In Negotiation</div>
          </div>
        </div>

        <div className="bg-foreground/5 p-4 sm:p-5 rounded-2xl flex items-center gap-4 border border-[var(--border-subtle)]">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0 border border-emerald-500/20">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-foreground">{convertedCount}</div>
            <div className="text-xs font-bold text-muted uppercase tracking-wider">Converted Sales</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Control Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-3 text-muted" />
          <input
            type="text"
            placeholder="Search by farmer name, phone number, model, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-foreground/5 border border-[var(--border-subtle)] rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-foreground focus:outline-none focus:border-[var(--color-brand-green)] transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-foreground/5 border border-[var(--border-subtle)] rounded-xl px-3 py-1.5 text-xs">
            <Filter size={14} className="text-muted shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-foreground font-bold focus:outline-none cursor-pointer"
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
      <div className="bg-foreground/5 p-4 sm:p-6 rounded-3xl border border-[var(--border-subtle)]">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-xs font-bold text-muted uppercase tracking-wider">
                <th className="py-3.5 px-4">Customer Info</th>
                <th className="py-3.5 px-4">Target Model</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Lead Status</th>
                <th className="py-3.5 px-4">Date Logged</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] text-sm font-medium">
              {filteredLeads.map((lead) => {
                const statusBadge = getStatusBadge(lead.status);
                return (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="hover:bg-foreground/5 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20 flex items-center justify-center font-bold shrink-0">
                          <User size={18} />
                        </div>
                        <div>
                          <div className="font-black text-foreground text-sm tracking-tight group-hover:text-[var(--color-brand-green)] transition-colors">
                            {lead.customerName}
                          </div>
                          <div className="text-xs text-muted font-mono flex items-center gap-2 mt-0.5">
                            <span>{lead.phone}</span>
                            <span>•</span>
                            <span>{lead.location}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-foreground text-xs flex items-center gap-1.5">
                        <Tractor size={14} className="text-[var(--color-brand-green)] shrink-0" />
                        {lead.interestedModel}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-foreground/5 text-foreground/80 border border-[var(--border-subtle)]">
                        {lead.enquiryType}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${statusBadge.color}`}>
                        {statusBadge.label}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="text-xs text-muted font-mono">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLead(lead);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-foreground/5 hover:bg-[var(--color-brand-green)]/10 text-muted hover:text-[var(--color-brand-green)] transition-colors border border-[var(--border-subtle)] text-xs font-bold inline-flex items-center gap-1"
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
        <div className="md:hidden space-y-4">
          {filteredLeads.map((lead) => {
            const statusBadge = getStatusBadge(lead.status);
            return (
              <div
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 space-y-3 hover:border-[var(--color-brand-green)]/30 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20 flex items-center justify-center font-bold shrink-0">
                      <User size={18} />
                    </div>
                    <div>
                      <h4 className="font-black text-foreground text-sm leading-tight">
                        {lead.customerName}
                      </h4>
                      <p className="text-xs text-muted mt-0.5">{lead.phone} • {lead.location}</p>
                    </div>
                  </div>

                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${statusBadge.color}`}>
                    {statusBadge.label}
                  </span>
                </div>

                <div className="pt-2 border-t border-[var(--border-subtle)] text-xs flex items-center justify-between">
                  <span className="font-bold text-foreground flex items-center gap-1">
                    <Tractor size={12} className="text-[var(--color-brand-green)]" /> {lead.interestedModel}
                  </span>
                  <span className="text-[10px] font-mono text-muted">{new Date(lead.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lead Detail & Disposition Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/25 dark:bg-black/60 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-xl bg-[var(--background)] text-foreground border border-[var(--border-subtle)] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-8 relative [backdrop-filter:none]">
            <div className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-between bg-foreground/5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20">
                  <User size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-foreground tracking-tight">
                    {selectedLead.customerName}
                  </h3>
                  <p className="text-xs font-mono text-muted">Lead ID #{selectedLead.id}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedLead(null)}
                className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-foreground/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-foreground/5 p-4 rounded-2xl border border-[var(--border-subtle)]">
                <div>
                  <span className="text-muted font-bold block">Phone Number</span>
                  <a href={`tel:${selectedLead.phone}`} className="font-black text-[var(--color-brand-green)] text-sm hover:underline flex items-center gap-1.5 mt-0.5">
                    <Phone size={14} /> {selectedLead.phone}
                  </a>
                </div>
                <div>
                  <span className="text-muted font-bold block">Location</span>
                  <span className="font-bold text-foreground text-sm block mt-0.5">{selectedLead.location}</span>
                </div>
                <div>
                  <span className="text-muted font-bold block">Interested Model</span>
                  <span className="font-bold text-foreground block mt-0.5">{selectedLead.interestedModel}</span>
                </div>
                <div>
                  <span className="text-muted font-bold block">Enquiry Type</span>
                  <span className="font-bold text-foreground block mt-0.5">{selectedLead.enquiryType}</span>
                </div>
              </div>

              {/* Update Lead Status */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted uppercase tracking-wider block">
                  Update Lead Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(['NEW', 'CONTACTED', 'IN_PROGRESS', 'CONVERTED', 'CLOSED'] as const).map((st) => {
                    const active = selectedLead.status === st;
                    return (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(selectedLead.id, st)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                          active
                            ? 'bg-[var(--color-brand-green)]/20 text-[var(--color-brand-green)] border-[var(--color-brand-green)]/40 shadow-sm'
                            : 'bg-foreground/5 text-muted border-[var(--border-subtle)] hover:text-foreground hover:bg-foreground/10'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Call Notes & History */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-muted uppercase tracking-wider block">
                  Conversation & Call Notes
                </label>

                {selectedLead.notes && (
                  <div className="bg-foreground/5 p-4 rounded-2xl border border-[var(--border-subtle)] text-xs text-foreground/90 font-medium whitespace-pre-line leading-relaxed">
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
                    className="flex-1 bg-foreground/5 border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-xs text-foreground focus:outline-none focus:border-[var(--color-brand-green)] transition-colors"
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-4 py-2 bg-[var(--color-brand-green)] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-90 transition-all shrink-0 flex items-center gap-1.5 shadow-md"
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
