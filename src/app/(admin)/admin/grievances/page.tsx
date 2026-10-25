'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldAlert,
  Building2,
  User,
  ChevronRight,
  X,
  MessageSquare,
  FileText,
  Calendar,
  Send,
  Loader2,
  Check,
  Flame,
} from 'lucide-react';
import { dealerAPI, Dealer } from '@/lib/api/dealers';
import { TractorLoader } from '@/components/ui/TractorLoader';

export type GrievanceStatus =
  | 'SUBMITTED'
  | 'ACKNOWLEDGED'
  | 'IN_PROGRESS'
  | 'ESCALATED'
  | 'RESOLVED'
  | 'CLOSED';

export type GrievanceType =
  | 'MILEAGE_BELOW_ADVERTISED'
  | 'POOR_DEALERSHIP_SERVICE'
  | 'WARRANTY_DENIAL'
  | 'AGGRESSIVE_EMI_COLLECTION'
  | 'PART_UNAVAILABILITY'
  | 'FRAUD_LISTING'
  | 'OTHER';

export interface GrievanceTicket {
  id: number;
  referenceNo: string;
  dealerId: number;
  dealerName: string;
  userName: string;
  userMobile: string;
  grievanceType: GrievanceType;
  title: string;
  description: string;
  status: GrievanceStatus;
  createdAt: string;
  slaDeadline: string;
  resolutionNotes?: string;
  updates?: {
    by: string;
    message: string;
    statusChange?: string;
    at: string;
  }[];
}

const INITIAL_GRIEVANCES: GrievanceTicket[] = [
  {
    id: 1,
    referenceNo: 'GRV-2026-0814',
    dealerId: 1,
    dealerName: 'Mahindra Krishi Seva Kendra',
    userName: 'Ramesh Patil',
    userMobile: '9822014589',
    grievanceType: 'POOR_DEALERSHIP_SERVICE',
    title: 'Hydraulic assembly delayed by 3 weeks with no spare parts update',
    description:
      'My 575 DI tractor was submitted for routine hydraulic pressure repair on Oct 5. Dealership claimed parts would arrive in 3 days. It has been over 20 days and the service manager refuses to answer calls.',
    status: 'IN_PROGRESS',
    createdAt: '2026-10-14T09:30:00Z',
    slaDeadline: '2026-10-28T18:00:00Z',
    updates: [
      {
        by: 'Admin Desk',
        message: 'Ticket received and forwarded to Regional Service Area Manager',
        statusChange: 'ACKNOWLEDGED',
        at: '2026-10-15T11:00:00Z',
      },
      {
        by: 'Service Area Manager',
        message: 'Dealer requested emergency expedited shipment from Chakan spare depot',
        statusChange: 'IN_PROGRESS',
        at: '2026-10-18T14:30:00Z',
      },
    ],
  },
  {
    id: 2,
    referenceNo: 'GRV-2026-0821',
    dealerId: 2,
    dealerName: 'Swaraj Kisan Tractor Workshop',
    userName: 'Balwinder Singh',
    userMobile: '9814088921',
    grievanceType: 'WARRANTY_DENIAL',
    title: 'Clutch plate failure within 6 months denied under warranty',
    description:
      'Purchased a brand new Swaraj 855 FE in May 2026. After 240 operating hours, clutch slip occurred. The dealership insisted on charging ₹18,500 claiming normal wear, despite 2-year warranty card.',
    status: 'ESCALATED',
    createdAt: '2026-10-18T14:15:00Z',
    slaDeadline: '2026-10-25T18:00:00Z',
    updates: [
      {
        by: 'System Alert',
        message: 'SLA target breach: escalated to Senior Grievance Officer',
        statusChange: 'ESCALATED',
        at: '2026-10-25T18:01:00Z',
      },
    ],
  },
  {
    id: 3,
    referenceNo: 'GRV-2026-0830',
    dealerId: 3,
    dealerName: 'John Deere Farm Hub',
    userName: 'Kishanlal Sharma',
    userMobile: '9876523419',
    grievanceType: 'MILEAGE_BELOW_ADVERTISED',
    title: 'Fuel consumption significantly higher than brochure claims',
    description:
      'Brochure promised 3.8 to 4.2 L/hr on rotavator load. Actual fuel consumption measured across 4 plots was 6.1 L/hr. Dealer mechanic inspected and found miscalibrated injectors.',
    status: 'RESOLVED',
    createdAt: '2026-10-02T10:00:00Z',
    slaDeadline: '2026-10-12T18:00:00Z',
    resolutionNotes:
      'Dealer technician re-calibrated Common Rail electronic fuel injectors. Test run confirmed fuel rate reduced to 4.1 L/hr. Farmer signed satisfaction certificate.',
    updates: [
      {
        by: 'Technical Team',
        message: 'Injector calibration kit applied and verified',
        statusChange: 'RESOLVED',
        at: '2026-10-11T16:20:00Z',
      },
    ],
  },
  {
    id: 4,
    referenceNo: 'GRV-2026-0845',
    dealerId: 4,
    dealerName: 'Sonalika ITL Service Care',
    userName: 'Praveen Yadav',
    userMobile: '9891044567',
    grievanceType: 'AGGRESSIVE_EMI_COLLECTION',
    title: 'Third-party recovery agency harassing family before grace period',
    description:
      'EMI due date was 10th of the month. Recovery executive visited residential village home on 12th demanding penalty fees despite standard 5-day bank clearance window.',
    status: 'SUBMITTED',
    createdAt: '2026-10-24T16:45:00Z',
    slaDeadline: '2026-10-31T18:00:00Z',
  },
  {
    id: 5,
    referenceNo: 'GRV-2026-0852',
    dealerId: 1,
    dealerName: 'Mahindra Krishi Seva Kendra',
    userName: 'Anand Kulkarni',
    userMobile: '9822399120',
    grievanceType: 'FRAUD_LISTING',
    title: 'Certified pre-owned listing odometer tampered by previous trade-in',
    description:
      'Listing displayed 1,200 operating hours. Digital ECU diagnostics at authorized workshop revealed 3,850 true engine hours. Requested full cancellation of booking token.',
    status: 'SUBMITTED',
    createdAt: '2026-10-25T11:20:00Z',
    slaDeadline: '2026-11-01T18:00:00Z',
  },
];

const TYPE_LABELS: Record<GrievanceType, string> = {
  MILEAGE_BELOW_ADVERTISED: 'Mileage Discrepancy',
  POOR_DEALERSHIP_SERVICE: 'Poor Service / Delay',
  WARRANTY_DENIAL: 'Warranty Denial',
  AGGRESSIVE_EMI_COLLECTION: 'EMI Collection Dispute',
  PART_UNAVAILABILITY: 'Part Unavailability',
  FRAUD_LISTING: 'Fraudulent Listing',
  OTHER: 'General Dispute',
};

const STATUS_COLORS: Record<GrievanceStatus, { badge: string; text: string; bg: string }> = {
  SUBMITTED: {
    badge: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    text: 'text-blue-500',
    bg: 'bg-blue-500',
  },
  ACKNOWLEDGED: {
    badge: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    text: 'text-indigo-500',
    bg: 'bg-indigo-500',
  },
  IN_PROGRESS: {
    badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    text: 'text-amber-500',
    bg: 'bg-amber-500',
  },
  ESCALATED: {
    badge: 'bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse',
    text: 'text-rose-500',
    bg: 'bg-rose-500',
  },
  RESOLVED: {
    badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    text: 'text-emerald-500',
    bg: 'bg-emerald-500',
  },
  CLOSED: {
    badge: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    text: 'text-zinc-400',
    bg: 'bg-zinc-500',
  },
};

export default function GrievancesAdminPage() {
  const [grievances, setGrievances] = useState<GrievanceTicket[]>(INITIAL_GRIEVANCES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedTicket, setSelectedTicket] = useState<GrievanceTicket | null>(null);

  // Status update form inside modal
  const [newStatus, setNewStatus] = useState<GrievanceStatus>('IN_PROGRESS');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Filtered grievances
  const filtered = grievances.filter((g) => {
    if (selectedStatus !== 'ALL' && g.status !== selectedStatus) return false;
    if (selectedType !== 'ALL' && g.grievanceType !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        g.referenceNo.toLowerCase().includes(q) ||
        g.title.toLowerCase().includes(q) ||
        g.dealerName.toLowerCase().includes(q) ||
        g.userName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // KPI stats
  const totalTickets = grievances.length;
  const pendingCount = grievances.filter((g) => g.status === 'SUBMITTED' || g.status === 'ACKNOWLEDGED').length;
  const inProgressCount = grievances.filter((g) => g.status === 'IN_PROGRESS' || g.status === 'ESCALATED').length;
  const resolvedCount = grievances.filter((g) => g.status === 'RESOLVED' || g.status === 'CLOSED').length;
  const resolutionRate = totalTickets > 0 ? `${((resolvedCount / totalTickets) * 100).toFixed(0)}%` : '0%';

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setIsUpdating(true);
    setTimeout(() => {
      const now = new Date().toISOString();
      const updatedList = grievances.map((g) => {
        if (g.id === selectedTicket.id) {
          const updates = g.updates ? [...g.updates] : [];
          if (statusNote.trim()) {
            updates.push({
              by: 'Super Admin',
              message: statusNote.trim(),
              statusChange: newStatus,
              at: now,
            });
          }
          return {
            ...g,
            status: newStatus,
            resolutionNotes: newStatus === 'RESOLVED' ? statusNote.trim() || g.resolutionNotes : g.resolutionNotes,
            updates,
          };
        }
        return g;
      });

      setGrievances(updatedList);
      setSelectedTicket((prev) => (prev ? { ...prev, status: newStatus } : null));
      setIsUpdating(false);
      setUpdateSuccess(true);
      setStatusNote('');
      setTimeout(() => setUpdateSuccess(false), 2500);
    }, 600);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1 text-xs font-black tracking-widest text-rose-500 uppercase">
            <ShieldAlert size={14} /> Grievance & Dispute Redressal
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-900 dark:text-white md:text-4xl">
            Customer & Dealer <span className="text-rose-500">Grievances</span>
          </h1>
          <p className="mt-1 text-sm font-bold text-zinc-500 dark:text-zinc-400">
            Monitor, investigate, and resolve formal disputes, warranty claims, and dealership service violations.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-[#121814]">
          <div className="text-xs font-black tracking-widest text-zinc-400 uppercase">Total Filed</div>
          <div className="mt-2 text-3xl font-black text-zinc-900 dark:text-white">{totalTickets}</div>
          <div className="mt-1 text-xs font-bold text-zinc-500">All registered dispute tickets</div>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-[#121814]">
          <div className="text-xs font-black tracking-widest text-blue-500 uppercase">Pending Review</div>
          <div className="mt-2 text-3xl font-black text-blue-500">{pendingCount}</div>
          <div className="mt-1 text-xs font-bold text-zinc-500">Awaiting officer assignment</div>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-[#121814]">
          <div className="text-xs font-black tracking-widest text-amber-500 uppercase">Under Investigation</div>
          <div className="mt-2 text-3xl font-black text-amber-500">{inProgressCount}</div>
          <div className="mt-1 text-xs font-bold text-zinc-500">In-progress or escalated</div>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-[#121814]">
          <div className="text-xs font-black tracking-widest text-emerald-500 uppercase">Resolution Rate</div>
          <div className="mt-2 text-3xl font-black text-emerald-500">{resolutionRate}</div>
          <div className="mt-1 text-xs font-bold text-zinc-500">{resolvedCount} tickets successfully closed</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-zinc-200 bg-white p-4 shadow-xs md:flex-row md:items-center md:justify-between dark:border-white/10 dark:bg-[#121814]">
        <div className="relative flex-1">
          <Search size={18} className="absolute top-1/2 left-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by ticket #, farmer name, dealer, or issue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 pr-4 pl-11 text-sm font-bold text-zinc-900 outline-none transition-all focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-black text-zinc-700 outline-none transition-all dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ESCALATED">Escalated</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-black text-zinc-700 outline-none transition-all dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
          >
            <option value="ALL">All Dispute Categories</option>
            {Object.entries(TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xs dark:border-white/10 dark:bg-[#121814]">
        <div className="divide-y divide-zinc-200 dark:divide-white/10">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-zinc-400">
              <CheckCircle2 size={48} className="mb-3 text-zinc-300 dark:text-zinc-600" />
              <p className="text-base font-bold">No grievances found matching the criteria.</p>
              <p className="text-xs">All customer concerns have been addressed or resolved.</p>
            </div>
          ) : (
            filtered.map((ticket) => {
              const statusCfg = STATUS_COLORS[ticket.status];
              return (
                <div
                  key={ticket.id}
                  onClick={() => {
                    setSelectedTicket(ticket);
                    setNewStatus(ticket.status);
                  }}
                  className="flex cursor-pointer flex-col gap-4 p-6 transition-colors hover:bg-zinc-50 sm:flex-row sm:items-center sm:justify-between dark:hover:bg-white/5"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-xs font-black text-zinc-500 dark:text-zinc-400">
                        {ticket.referenceNo}
                      </span>
                      <span className={`rounded-md border px-2.5 py-0.5 text-[10px] font-black uppercase ${statusCfg.badge}`}>
                        {ticket.status.replace(/_/g, ' ')}
                      </span>
                      <span className="rounded-md border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
                        {TYPE_LABELS[ticket.grievanceType]}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-zinc-900 dark:text-white">
                      {ticket.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1.5">
                        <Building2 size={14} className="text-zinc-400" />
                        {ticket.dealerName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <User size={14} className="text-zinc-400" />
                        {ticket.userName} ({ticket.userMobile})
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} className="text-zinc-400" />
                        SLA: {new Date(ticket.slaDeadline).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-black text-zinc-800 transition-colors hover:border-zinc-300 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200">
                      View Details <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Ticket Details Drawer / Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-all"
            onClick={() => setSelectedTicket(null)}
          />

          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-2xl sm:p-8 dark:border-white/10 dark:bg-[#121814]">
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-6 right-6 rounded-full border border-zinc-200 bg-zinc-100 p-2 text-zinc-600 hover:bg-zinc-200 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-white/10"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-zinc-400">
                  {selectedTicket.referenceNo}
                </span>
                <span
                  className={`rounded-md border px-2.5 py-0.5 text-[10px] font-black uppercase ${
                    STATUS_COLORS[selectedTicket.status].badge
                  }`}
                >
                  {selectedTicket.status.replace(/_/g, ' ')}
                </span>
              </div>
              <h2 className="mt-2 text-xl font-black text-zinc-900 dark:text-white sm:text-2xl">
                {selectedTicket.title}
              </h2>
            </div>

            {/* Info Grid */}
            <div className="mb-6 grid grid-cols-2 gap-4 rounded-2xl bg-zinc-50 p-4 text-xs font-bold dark:bg-white/5">
              <div>
                <span className="text-zinc-400 uppercase">Complainant:</span>
                <div className="mt-0.5 text-zinc-900 dark:text-white">
                  {selectedTicket.userName} ({selectedTicket.userMobile})
                </div>
              </div>
              <div>
                <span className="text-zinc-400 uppercase">Dealership:</span>
                <div className="mt-0.5 text-zinc-900 dark:text-white">{selectedTicket.dealerName}</div>
              </div>
              <div>
                <span className="text-zinc-400 uppercase">Dispute Category:</span>
                <div className="mt-0.5 text-rose-500">{TYPE_LABELS[selectedTicket.grievanceType]}</div>
              </div>
              <div>
                <span className="text-zinc-400 uppercase">SLA Target Date:</span>
                <div className="mt-0.5 text-zinc-900 dark:text-white">
                  {new Date(selectedTicket.slaDeadline).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </div>

            {/* Problem Description */}
            <div className="mb-6">
              <h4 className="mb-2 text-xs font-black tracking-widest text-zinc-400 uppercase">
                Complaint Statement
              </h4>
              <p className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4 text-sm leading-relaxed font-bold text-zinc-800 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200">
                {selectedTicket.description}
              </p>
            </div>

            {/* Past Updates & Timeline */}
            {selectedTicket.updates && selectedTicket.updates.length > 0 && (
              <div className="mb-6">
                <h4 className="mb-3 text-xs font-black tracking-widest text-zinc-400 uppercase">
                  Investigation & Resolution History
                </h4>
                <div className="space-y-3">
                  {selectedTicket.updates.map((up, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-3 text-xs dark:border-white/5 dark:bg-white/5"
                    >
                      <div className="flex items-center justify-between text-zinc-400">
                        <span className="font-black text-zinc-700 dark:text-zinc-300">{up.by}</span>
                        <span>{new Date(up.at).toLocaleDateString('en-IN')}</span>
                      </div>
                      <p className="mt-1 font-bold text-zinc-800 dark:text-zinc-200">{up.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status Update & Resolution Form */}
            <form onSubmit={handleUpdateStatus} className="border-t border-zinc-200 pt-6 dark:border-white/10">
              <h4 className="mb-3 text-xs font-black tracking-widest text-zinc-400 uppercase">
                Update Ticket Status
              </h4>

              {updateSuccess && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-xs font-black text-emerald-500">
                  <Check size={16} /> Grievance status updated successfully!
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[10px] font-black tracking-widest text-zinc-400 uppercase">
                    New Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as GrievanceStatus)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs font-black text-zinc-800 outline-none dark:border-white/10 dark:bg-white/5 dark:text-zinc-200"
                  >
                    <option value="SUBMITTED">Submitted</option>
                    <option value="ACKNOWLEDGED">Acknowledged</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="ESCALATED">Escalated</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-[10px] font-black tracking-widest text-zinc-400 uppercase">
                    Internal Investigation / Resolution Notes
                  </label>
                  <textarea
                    rows={3}
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Enter details of contact made with dealer or farmer..."
                    className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs font-bold text-zinc-800 outline-none dark:border-white/10 dark:bg-white/5 dark:text-zinc-200"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="rounded-xl border border-zinc-200 px-5 py-2.5 text-xs font-black text-zinc-600 hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/5"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex items-center gap-2 rounded-xl bg-rose-500 px-6 py-2.5 text-xs font-black text-white shadow-lg shadow-rose-500/20 transition-all hover:brightness-105 disabled:opacity-60"
                >
                  {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
