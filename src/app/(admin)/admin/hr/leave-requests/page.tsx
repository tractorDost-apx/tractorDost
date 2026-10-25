'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarDays,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Users,
  Check,
  X,
  Loader2,
  FileText,
  Calendar,
} from 'lucide-react';
import { employeeAPI } from '@/lib/api/employees';
import { EmployeeListItem } from '@/types/models/employee';

type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
type LeaveType = 'CASUAL' | 'SICK' | 'EARNED' | 'MATERNITY' | 'EMERGENCY';

interface LeaveRequestItem {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  departmentName: string;
  leaveType: LeaveType;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  appliedDate: string;
  approvedBy?: string;
  rejectionReason?: string;
}

const LEAVE_TYPE_META: Record<LeaveType, { label: string; bg: string; text: string }> = {
  CASUAL: {
    label: 'Casual Leave (CL)',
    bg: 'bg-blue-500/10 border-blue-500/30',
    text: 'text-blue-400',
  },
  SICK: {
    label: 'Sick Leave (SL)',
    bg: 'bg-rose-500/10 border-rose-500/30',
    text: 'text-rose-400',
  },
  EARNED: {
    label: 'Earned / Paid Leave',
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    text: 'text-emerald-400',
  },
  MATERNITY: {
    label: 'Parental / Maternity',
    bg: 'bg-purple-500/10 border-purple-500/30',
    text: 'text-purple-400',
  },
  EMERGENCY: {
    label: 'Emergency / Bereavement',
    bg: 'bg-amber-500/10 border-amber-500/30',
    text: 'text-amber-400',
  },
};

const STATUS_META: Record<LeaveStatus, { label: string; bg: string; text: string; icon: any }> = {
  PENDING: {
    label: 'Pending Review',
    bg: 'bg-amber-500/10 border-amber-500/30',
    text: 'text-amber-400',
    icon: Clock,
  },
  APPROVED: {
    label: 'Approved',
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    text: 'text-emerald-400',
    icon: CheckCircle2,
  },
  REJECTED: {
    label: 'Rejected',
    bg: 'bg-rose-500/10 border-rose-500/30',
    text: 'text-rose-400',
    icon: XCircle,
  },
};

export default function LeaveRequestsAdminPage() {
  const [requests, setRequests] = useState<LeaveRequestItem[]>([]);
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | LeaveStatus>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | LeaveType>('ALL');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Apply Modal
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState<number | ''>('');
  const [leaveType, setLeaveType] = useState<LeaveType>('CASUAL');
  const [fromDate, setFromDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');

  // Reject Modal
  const [rejectingItem, setRejectingItem] = useState<LeaveRequestItem | null>(null);
  const [rejectionNote, setRejectionNote] = useState('');

  const loadData = async () => {
    try {
      setRefreshing(true);
      const res = await employeeAPI.getAllEmployees({ limit: 100 });
      const empList: EmployeeListItem[] = res?.data?.data || [];
      setEmployees(empList);

      // Generate realistic active leave requests based on real staff
      const sampleRequests: LeaveRequestItem[] = [
        {
          id: 101,
          employeeId: empList[0]?.id || 1,
          employeeName: empList[0]?.user.fullName || 'Ramesh Shinde',
          employeeCode: empList[0]?.employeeCode || 'TD-EMP-001',
          departmentName: empList[0]?.department?.name || 'Operations',
          leaveType: 'CASUAL',
          fromDate: '2026-10-28',
          toDate: '2026-10-30',
          days: 3,
          reason: 'Attending family wedding ceremony in Satara district.',
          status: 'PENDING',
          appliedDate: '2026-10-25',
        },
        {
          id: 102,
          employeeId: empList[1]?.id || 2,
          employeeName: empList[1]?.user.fullName || 'Sunita Kulkarni',
          employeeCode: empList[1]?.employeeCode || 'TD-EMP-002',
          departmentName: empList[1]?.department?.name || 'Customer Support',
          leaveType: 'SICK',
          fromDate: '2026-10-26',
          toDate: '2026-10-27',
          days: 2,
          reason: 'Viral fever and doctor-prescribed mandatory rest.',
          status: 'PENDING',
          appliedDate: '2026-10-26',
        },
        {
          id: 103,
          employeeId: empList[2]?.id || 3,
          employeeName: empList[2]?.user.fullName || 'Vikas Patil',
          employeeCode: empList[2]?.employeeCode || 'TD-EMP-003',
          departmentName: empList[2]?.department?.name || 'Field Valuation',
          leaveType: 'EARNED',
          fromDate: '2026-10-15',
          toDate: '2026-10-20',
          days: 6,
          reason: 'Annual Diwali harvesting break and travel.',
          status: 'APPROVED',
          appliedDate: '2026-10-10',
          approvedBy: 'Admin Team',
        },
        {
          id: 104,
          employeeId: empList[3]?.id || 4,
          employeeName: empList[3]?.user.fullName || 'Aniket Deshmukh',
          employeeCode: empList[3]?.employeeCode || 'TD-EMP-004',
          departmentName: empList[3]?.department?.name || 'Engineering',
          leaveType: 'CASUAL',
          fromDate: '2026-10-02',
          toDate: '2026-10-03',
          days: 2,
          reason: 'Personal paperwork at regional RTO office.',
          status: 'REJECTED',
          appliedDate: '2026-09-29',
          rejectionReason: 'Critical tractor launch deployment sprint scheduled on same dates.',
        },
      ];

      setRequests(sampleRequests);
    } catch (err: any) {
      console.error('Failed to load leave requests:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = (item: LeaveRequestItem) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === item.id
          ? { ...r, status: 'APPROVED', approvedBy: 'Admin Authority' }
          : r
      )
    );
    setSuccessMsg(`Leave request for ${item.employeeName} approved successfully.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleRejectConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingItem) return;

    setRequests((prev) =>
      prev.map((r) =>
        r.id === rejectingItem.id
          ? {
              ...r,
              status: 'REJECTED',
              rejectionReason: rejectionNote.trim() || 'Declined by administration',
            }
          : r
      )
    );

    setSuccessMsg(`Leave request for ${rejectingItem.employeeName} rejected.`);
    setRejectingItem(null);
    setRejectionNote('');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) return;

    const emp = employees.find((e) => e.id === Number(selectedEmpId));
    if (!emp) return;

    const start = new Date(fromDate);
    const end = new Date(toDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newReq: LeaveRequestItem = {
      id: Date.now(),
      employeeId: emp.id,
      employeeName: emp.user.fullName || emp.employeeCode,
      employeeCode: emp.employeeCode,
      departmentName: emp.department?.name || 'General',
      leaveType,
      fromDate,
      toDate,
      days: Math.max(1, days),
      reason: reason.trim(),
      status: 'PENDING',
      appliedDate: new Date().toISOString().split('T')[0],
    };

    setRequests((prev) => [newReq, ...prev]);
    setIsApplyModalOpen(false);
    setReason('');
    setSuccessMsg(`Leave application created for ${newReq.employeeName}.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesSearch =
        !search ||
        r.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        r.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
        r.reason.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const matchesType = typeFilter === 'ALL' || r.leaveType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [requests, search, statusFilter, typeFilter]);

  // KPIs
  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;
  const approvedCount = requests.filter((r) => r.status === 'APPROVED').length;
  const rejectedCount = requests.filter((r) => r.status === 'REJECTED').length;

  return (
    <div className="animate-fade-in flex h-full w-full flex-col gap-6 pb-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 text-purple-400 shadow-sm">
              <CalendarDays size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                  Leave Requests Management
                </h1>
                <span className="rounded-lg bg-purple-500/10 px-2.5 py-0.5 text-xs font-black text-purple-400">
                  HR Approvals
                </span>
              </div>
              <p className="text-muted text-xs font-semibold sm:text-sm">
                Review employee vacation requests, sick leaves, parental leaves, and approve timesheets.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadData}
            disabled={refreshing}
            className="text-muted hover:text-foreground flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold transition-all hover:bg-foreground/10"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (employees.length) setSelectedEmpId(employees[0].id);
              setIsApplyModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-4 py-2 text-xs font-black text-white shadow-lg shadow-[var(--color-brand-green)]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={16} />
            <span>Apply Leave for Staff</span>
          </button>
        </div>
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
          <div className="flex items-center justify-between">
            <span className="text-muted text-[10px] font-black uppercase tracking-wider">
              Total Applications
            </span>
            <CalendarDays size={16} className="text-purple-400" />
          </div>
          <div className="text-foreground mt-2 text-2xl font-black">{totalCount}</div>
          <span className="text-muted text-xs font-semibold">Total Requests Logged</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-muted text-[10px] font-black uppercase tracking-wider">
              Pending Review
            </span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <div className="text-amber-400 mt-2 text-2xl font-black">{pendingCount}</div>
          <span className="text-muted text-xs font-semibold">Awaiting Decision</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-muted text-[10px] font-black uppercase tracking-wider">
              Approved
            </span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div className="text-emerald-400 mt-2 text-2xl font-black">{approvedCount}</div>
          <span className="text-muted text-xs font-semibold">Granted Leaves</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-muted text-[10px] font-black uppercase tracking-wider">
              Rejected
            </span>
            <XCircle size={16} className="text-rose-500" />
          </div>
          <div className="text-rose-400 mt-2 text-2xl font-black">{rejectedCount}</div>
          <span className="text-muted text-xs font-semibold">Declined Requests</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="text-muted absolute top-1/2 left-3 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search employee, leave reason, or employee code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 py-2 pr-4 pl-9 text-xs font-semibold text-foreground placeholder:text-muted focus:border-[var(--color-brand-green)] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="APPROVED">Approved Only</option>
            <option value="REJECTED">Rejected Only</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
          >
            <option value="ALL">All Leave Types</option>
            <option value="CASUAL">Casual Leave</option>
            <option value="SICK">Sick Leave</option>
            <option value="EARNED">Earned / Paid</option>
            <option value="MATERNITY">Parental</option>
            <option value="EMERGENCY">Emergency</option>
          </select>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="glass-panel flex flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--border-subtle)] bg-foreground/5 text-[11px] font-black uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-4">Employee</th>
                <th className="px-5 py-4">Leave Category</th>
                <th className="px-5 py-4">Duration & Dates</th>
                <th className="px-5 py-4">Reason / Notes</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Decision Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-purple-400" />
                    <span>Loading leave requests...</span>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted font-bold">
                    No leave requests found matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const typeMeta = LEAVE_TYPE_META[req.leaveType] || {
                    label: req.leaveType,
                    bg: 'bg-foreground/5 border-[var(--border-subtle)]',
                    text: 'text-foreground',
                  };
                  const statusMeta = STATUS_META[req.status];
                  const StatusIcon = statusMeta.icon;

                  return (
                    <tr
                      key={req.id}
                      className="transition-colors hover:bg-foreground/[0.02]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-xs font-black text-purple-400">
                            {req.employeeName.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-foreground text-xs font-black">
                              {req.employeeName}
                            </span>
                            <span className="font-mono text-[10px] text-muted">
                              {req.employeeCode} • {req.departmentName}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[11px] font-black uppercase ${typeMeta.bg} ${typeMeta.text}`}
                        >
                          {typeMeta.label}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-0.5 font-mono">
                          <span className="text-foreground text-xs font-bold">
                            {req.fromDate} → {req.toDate}
                          </span>
                          <span className="text-[10px] font-bold text-muted">
                            Total: <strong className="text-foreground">{req.days} days</strong>
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="max-w-xs">
                          <p className="text-foreground text-xs font-medium line-clamp-2">
                            {req.reason}
                          </p>
                          {req.rejectionReason && (
                            <p className="text-rose-400 text-[10px] font-semibold mt-1">
                              Reason: {req.rejectionReason}
                            </p>
                          )}
                          {req.approvedBy && (
                            <p className="text-emerald-400 text-[10px] font-semibold mt-1">
                              Approved by: {req.approvedBy}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black uppercase ${statusMeta.bg} ${statusMeta.text}`}
                        >
                          <StatusIcon size={12} />
                          {statusMeta.label}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        {req.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleApprove(req)}
                              className="inline-flex items-center gap-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20"
                            >
                              <Check size={13} />
                              <span>Approve</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setRejectingItem(req)}
                              className="inline-flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-500/20"
                            >
                              <X size={13} />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] font-bold text-muted italic">
                            Decision Finalized
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* APPLY LEAVE MODAL */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-background shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] p-5">
              <div className="flex items-center gap-2">
                <CalendarDays size={18} className="text-purple-400" />
                <h3 className="text-foreground text-base font-black">
                  Apply Leave Request
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(false)}
                className="text-muted hover:text-foreground rounded-lg p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="p-5 space-y-4">
              <div>
                <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                  Employee
                </label>
                <select
                  required
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(Number(e.target.value))}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.user.fullName || emp.employeeCode} ({emp.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                  Leave Category
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
                >
                  <option value="CASUAL">Casual Leave (CL)</option>
                  <option value="SICK">Sick Leave (SL)</option>
                  <option value="EARNED">Earned / Paid Leave</option>
                  <option value="MATERNITY">Parental / Maternity Leave</option>
                  <option value="EMERGENCY">Emergency / Bereavement</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                  Reason for Leave
                </label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide brief purpose or explanation..."
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-medium text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-xs font-bold text-muted hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-5 py-2 text-xs font-black text-white hover:opacity-95"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl border border-rose-500/20 bg-background p-6 shadow-2xl animate-scale-up">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 mb-3">
              <XCircle size={22} />
            </div>
            <h3 className="text-foreground text-center text-lg font-black">
              Reject Leave Request?
            </h3>
            <p className="text-muted text-center text-xs font-medium mt-1 mb-4">
              Provide a rationale for turning down {rejectingItem.employeeName}&apos;s leave.
            </p>

            <form onSubmit={handleRejectConfirm} className="space-y-4">
              <textarea
                required
                rows={3}
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                placeholder="Reason (e.g. Insufficient leave balance, overlapping project deadlines)..."
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-medium text-foreground focus:border-rose-500 focus:outline-none"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingItem(null)}
                  className="rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-xs font-bold text-muted hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-500 px-5 py-2 text-xs font-black text-white hover:bg-rose-600"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
