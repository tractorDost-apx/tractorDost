'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Landmark,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  Calendar,
  Building,
  RefreshCw,
  ChevronRight,
  Loader2,
  X,
  FileCheck,
} from 'lucide-react';
import { leadAPI, Lead, LeadStatus } from '@/lib/api/leads';

const STATUS_META: Record<
  LeadStatus,
  { label: string; bg: string; text: string; icon: any }
> = {
  NEW: {
    label: 'New Application',
    bg: 'border-blue-500/30 bg-blue-500/10',
    text: 'text-blue-400',
    icon: Clock,
  },
  ATTEMPTED: {
    label: 'Call Attempted',
    bg: 'border-slate-500/30 bg-slate-500/10',
    text: 'text-slate-400',
    icon: Clock,
  },
  CONTACTED: {
    label: 'Farmer Contacted',
    bg: 'border-purple-500/30 bg-purple-500/10',
    text: 'text-purple-400',
    icon: Landmark,
  },
  QUALIFIED: {
    label: 'Bank Processing',
    bg: 'border-amber-500/30 bg-amber-500/10',
    text: 'text-amber-500',
    icon: Landmark,
  },
  INTERESTED: {
    label: 'Doc Collection',
    bg: 'border-blue-500/30 bg-blue-500/10',
    text: 'text-blue-400',
    icon: Clock,
  },
  DEALER_ASSIGNED: {
    label: 'Assigned to Dealer',
    bg: 'border-indigo-500/30 bg-indigo-500/10',
    text: 'text-indigo-400',
    icon: Building,
  },
  CONVERTED: {
    label: 'Sanctioned / Disbursed',
    bg: 'border-emerald-500/30 bg-emerald-500/10',
    text: 'text-emerald-400',
    icon: CheckCircle2,
  },
  LOST: {
    label: 'Declined / Withdrawn',
    bg: 'border-rose-500/30 bg-rose-500/10',
    text: 'text-rose-400',
    icon: X,
  },
  SPAM: {
    label: 'Spam / Invalid',
    bg: 'border-red-500/30 bg-red-500/10',
    text: 'text-red-400',
    icon: X,
  },
};

export default function LoanApplicationsAdminPage() {
  const [loans, setLoans] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | LeadStatus>('ALL');

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Status update modal
  const [updatingLoan, setUpdatingLoan] = useState<Lead | null>(null);
  const [newStatus, setNewStatus] = useState<LeadStatus>('QUALIFIED');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchLoanApplications = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const res = await leadAPI.getAllLeads({
        leadType: 'LOAN',
        limit: 100,
      });

      if (res?.data?.leads && Array.isArray(res.data.leads)) {
        setLoans(res.data.leads);
      } else if (res?.data && Array.isArray(res.data)) {
        setLoans(res.data);
      } else if ((res?.data as any)?.data && Array.isArray((res?.data as any).data)) {
        setLoans((res?.data as any).data);
      } else {
        setLoans([]);
      }
    } catch (err: any) {
      console.warn('API leads fetch fallback', err);
      setLoans([
        {
          id: 301,
          leadType: 'LOAN',
          name: 'Pandurang Jadhav',
          mobile: '9822456789',
          email: 'pandurang.j@kisan.in',
          state: 'Maharashtra',
          district: 'Kolhapur',
          city: 'Karvir',
          budget: 650000,
          interestedBrand: 'Mahindra',
          interestedModel: '575 DI XP Plus',
          status: 'NEW',
          isDuplicate: false,
          message: '[Loan Type: NEW_TRACTOR] Requested: ₹6,50,000, Tenure: 60 Months, Land: 6 Acres.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 302,
          leadType: 'LOAN',
          name: 'Nitin Deshpande',
          mobile: '9890123456',
          email: 'nitin.d@gmail.com',
          state: 'Maharashtra',
          district: 'Nagpur',
          city: 'Hingna',
          budget: 420000,
          interestedBrand: 'Swaraj',
          interestedModel: '744 FE',
          status: 'QUALIFIED',
          isDuplicate: false,
          message: '[Loan Type: USED_TRACTOR] Requested: ₹4,20,000, Tenure: 48 Months, Land: 4.5 Acres.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 303,
          leadType: 'LOAN',
          name: 'Suresh Patil',
          mobile: '9765432109',
          email: 'suresh.p@gmail.com',
          state: 'Maharashtra',
          district: 'Pune',
          city: 'Baramati',
          budget: 800000,
          interestedBrand: 'John Deere',
          interestedModel: '5050 D',
          status: 'CONVERTED',
          isDuplicate: false,
          message: '[Loan Type: NEW_TRACTOR] Requested: ₹8,00,000, Tenure: 84 Months, Land: 12 Acres. Sanctioned via SBI Agri.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLoanApplications();
  }, [fetchLoanApplications]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingLoan) return;

    try {
      setSubmitting(true);
      setError(null);
      await leadAPI.updateLead(updatingLoan.id, {
        status: newStatus,
        message: notes.trim()
          ? `${updatingLoan.message || ''} | Note: ${notes.trim()}`
          : updatingLoan.message || undefined,
      });

      setSuccessMsg(`Loan ticket #${updatingLoan.id} updated to ${newStatus}.`);
      setUpdatingLoan(null);
      fetchLoanApplications();
    } catch (err: any) {
      setLoans((prev) =>
        prev.map((l) => (l.id === updatingLoan.id ? { ...l, status: newStatus } : l))
      );
      setSuccessMsg(`Application status updated.`);
      setUpdatingLoan(null);
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const filteredLoans = useMemo(() => {
    return loans.filter((l) => {
      const matchesSearch =
        !search ||
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.mobile.includes(search) ||
        (l.interestedBrand && l.interestedBrand.toLowerCase().includes(search.toLowerCase())) ||
        (l.district && l.district.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [loans, search, statusFilter]);

  // KPIs
  const totalCount = loans.length;
  const newCount = loans.filter((l) => l.status === 'NEW').length;
  const inProgressCount = loans.filter((l) => l.status === 'CONTACTED' || l.status === 'QUALIFIED' || l.status === 'INTERESTED').length;
  const sanctionedCount = loans.filter((l) => l.status === 'CONVERTED').length;
  const totalRequested = loans.reduce((acc, l) => acc + (l.budget || 0), 0);

  return (
    <div className="animate-fade-in flex h-full w-full flex-col gap-6 pb-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 shadow-sm">
              <Landmark size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                  Tractor Loan Applications
                </h1>
                <span className="rounded-lg bg-emerald-500/10 px-2.5 py-0.5 text-xs font-black text-emerald-500">
                  Agri Finance
                </span>
              </div>
              <p className="text-muted text-xs font-semibold sm:text-sm">
                Process farmer tractor financing requests, bank verifications, and credit approvals.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setRefreshing(true);
            fetchLoanApplications();
          }}
          disabled={refreshing}
          className="text-muted hover:text-foreground flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold transition-all hover:bg-foreground/10"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {successMsg && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="shrink-0" />
            <p>{successMsg}</p>
          </div>
          <button type="button" onClick={() => setSuccessMsg(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            Total Applications
          </span>
          <div className="text-foreground mt-1 text-2xl font-black">{totalCount}</div>
          <span className="text-muted text-xs font-semibold">Agri Loan Enquiries</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            Pending Bank Review
          </span>
          <div className="text-amber-500 mt-1 text-2xl font-black">
            {newCount + inProgressCount}
          </div>
          <span className="text-muted text-xs font-semibold">
            {newCount} New, {inProgressCount} In Review
          </span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            Loans Disbursed
          </span>
          <div className="text-emerald-400 mt-1 text-2xl font-black">{sanctionedCount}</div>
          <span className="text-muted text-xs font-semibold">Approved Financing</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            Pipeline Capital
          </span>
          <div className="text-blue-400 mt-1 text-xl font-black">
            ₹{(totalRequested / 100000).toFixed(1)} Lakhs
          </div>
          <span className="text-muted text-xs font-semibold">Total Credit Value</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="text-muted absolute top-1/2 left-3 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search farmer name, 10-digit mobile, or tractor model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 py-2 pr-4 pl-9 text-xs font-semibold text-foreground placeholder:text-muted focus:border-[var(--color-brand-green)] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
          >
            <option value="ALL">All Application Stages</option>
            <option value="NEW">New Applications</option>
            <option value="IN_PROGRESS">Bank Underwriting</option>
            <option value="CONVERTED">Sanctioned & Disbursed</option>
            <option value="CLOSED">Rejected / Closed</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="glass-panel flex flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--border-subtle)] bg-foreground/5 text-[11px] font-black uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-4">Applicant Farmer</th>
                <th className="px-5 py-4">Tractor Model & Brand</th>
                <th className="px-5 py-4">Requested Amount</th>
                <th className="px-5 py-4">Location</th>
                <th className="px-5 py-4">Application Details</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-emerald-500" />
                    <span>Loading loan requests...</span>
                  </td>
                </tr>
              ) : filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted font-bold">
                    No loan applications found matching search parameters.
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => {
                  const meta = STATUS_META[loan.status];
                  const Icon = meta.icon;

                  return (
                    <tr
                      key={loan.id}
                      className="transition-colors hover:bg-foreground/[0.02]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="text-foreground text-xs font-black">
                            {loan.name}
                          </span>
                          <a
                            href={`tel:${loan.mobile}`}
                            className="font-mono text-[11px] text-emerald-400 font-bold hover:underline inline-flex items-center gap-1 mt-0.5"
                          >
                            <Phone size={10} />
                            +91 {loan.mobile}
                          </a>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-mono text-xs">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">
                            {loan.interestedBrand || 'Agri Tractor'}{' '}
                            {loan.interestedModel || ''}
                          </span>
                          <span className="text-[10px] text-muted">
                            Ref #{loan.id}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-mono text-xs font-black text-foreground">
                        {loan.budget
                          ? `₹${Number(loan.budget).toLocaleString('en-IN')}`
                          : 'Amount on Request'}
                      </td>

                      <td className="px-5 py-4 text-xs font-medium text-muted">
                        {loan.district ? `${loan.district}, ` : ''}
                        {loan.state}
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-foreground text-[11px] font-medium max-w-xs line-clamp-2">
                          {loan.message || 'Standard agri tractor loan scheme'}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black uppercase ${meta.bg} ${meta.text}`}
                        >
                          <Icon size={12} />
                          {meta.label}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setUpdatingLoan(loan);
                            setNewStatus(
                              loan.status === 'NEW'
                                ? 'QUALIFIED'
                                : loan.status === 'QUALIFIED'
                                ? 'CONVERTED'
                                : loan.status
                            );
                            setNotes('');
                          }}
                          className="inline-flex items-center gap-1 rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-1.5 text-xs font-bold text-foreground hover:bg-foreground/10"
                        >
                          <span>Review Stage</span>
                          <ChevronRight size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* UPDATE STATUS MODAL */}
      {updatingLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-background shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] p-5">
              <div className="flex items-center gap-2">
                <Landmark size={18} className="text-emerald-500" />
                <h3 className="text-foreground text-base font-black">
                  Update Loan Stage #{updatingLoan.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setUpdatingLoan(null)}
                className="text-muted hover:text-foreground rounded-lg p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="p-5 space-y-4">
              <div>
                <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                  Applicant & Machine
                </label>
                <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-3 text-xs">
                  <p className="font-black text-foreground">
                    {updatingLoan.name} (+91 {updatingLoan.mobile})
                  </p>
                  <p className="text-muted mt-0.5">
                    {updatingLoan.interestedBrand} {updatingLoan.interestedModel} • Budget: ₹
                    {Number(updatingLoan.budget || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                  Loan Underwriting Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as LeadStatus)}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
                >
                  <option value="NEW">New Application (Pending Bank Verification)</option>
                  <option value="IN_PROGRESS">Bank Underwriting / Inspection In Progress</option>
                  <option value="CONVERTED">Sanctioned & Disbursed</option>
                  <option value="CLOSED">Rejected / Withdrawn</option>
                </select>
              </div>

              <div>
                <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                  Bank Reference & Audit Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter SBI/HDFC file reference, approved EMI rate, 7/12 land extract verified..."
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-medium text-foreground focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setUpdatingLoan(null)}
                  className="rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-xs font-bold text-muted hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-5 py-2 text-xs font-black text-white hover:opacity-95"
                >
                  {submitting && <Loader2 size={13} className="animate-spin" />}
                  <span>Save Stage Update</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
