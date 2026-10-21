'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  UserCheck,
  Building2,
  FileText,
  PhoneCall,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  Plus,
  Compass,
  Edit2,
  Copy,
  Flame,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import {
  leadAPI,
  Lead,
  LeadStatus,
  LeadNote,
  CallLog,
  CallOutcome,
} from '@/lib/api/leads';
import { usersAPI } from '@/lib/api/users';
import { dealerAPI } from '@/lib/api/dealers';
import {
  LeadStatusBadge,
  LeadTypeBadge,
  IntentScoreBadge,
  FollowupBadge,
} from '../components/LeadStatusBadge';
import { LEAD_STATUSES } from '../components/LeadFilters';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const leadId = Number(resolvedParams.id);
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role?.name === 'ADMIN';

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'actions' | 'calls' | 'notes'>('overview');

  // References
  const [agents, setAgents] = useState<{ id: number; fullName: string }[]>([]);
  const [dealers, setDealers] = useState<{ id: number; businessName: string }[]>([]);

  // Action states
  const [status, setStatus] = useState<LeadStatus>('NEW');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [dealerId, setDealerId] = useState<string>('');
  const [nextFollowupAt, setNextFollowupAt] = useState<string>('');

  // Call log state
  const [callOutcome, setCallOutcome] = useState<CallOutcome>('answered');
  const [callDuration, setCallDuration] = useState<string>('60');
  const [callNotes, setCallNotes] = useState<string>('');
  const [loggingCall, setLoggingCall] = useState(false);

  // Note state
  const [noteText, setNoteText] = useState<string>('');
  const [addingNote, setAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingNoteText, setEditingNoteText] = useState<string>('');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const fetchLead = async () => {
    if (!leadId || isNaN(leadId)) {
      setError('Invalid lead ID');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await leadAPI.getLeadById(leadId);
      if (res.success && res.data) {
        setLead(res.data);
        setStatus(res.data.status);
        setAssignedTo(res.data.assignedTo ? String(res.data.assignedTo) : '');
        setDealerId(res.data.dealerId ? String(res.data.dealerId) : '');
        if (res.data.nextFollowupAt) {
          const d = new Date(res.data.nextFollowupAt);
          const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
          setNextFollowupAt(localIso);
        } else {
          setNextFollowupAt('');
        }
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load lead details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLead();

    const fetchRefs = async () => {
      try {
        const [usersRes, dealersRes] = await Promise.allSettled([
          usersAPI.getAllUsers({ limit: 100 }),
          dealerAPI.getAllDealers({ limit: 100 }),
        ]);

        if (usersRes.status === 'fulfilled' && usersRes.value.success) {
          const userList = (usersRes.value.data as any)?.data || usersRes.value.data || [];
          const staffUsers = userList
            .filter((u: any) => u.role === 'AGENT' || u.role === 'ADMIN')
            .map((u: any) => ({
              id: u.id,
              fullName: u.fullName || u.name || `User #${u.id}`,
            }));
          setAgents(staffUsers);
        }

        if (dealersRes.status === 'fulfilled' && dealersRes.value.success) {
          const dealerList = (dealersRes.value.data as any)?.data || [];
          setDealers(
            dealerList.map((d: any) => ({
              id: d.id,
              businessName: d.businessName,
            }))
          );
        }
      } catch (e) {
        console.error('Failed to load references', e);
      }
    };

    fetchRefs();
  }, [leadId]);

  const handleSaveActions = async () => {
    if (!lead) return;
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const payload: any = {
        status,
        assignedTo: assignedTo ? Number(assignedTo) : null,
        dealerId: dealerId ? Number(dealerId) : null,
        nextFollowupAt: nextFollowupAt ? new Date(nextFollowupAt).toISOString() : null,
      };

      await leadAPI.updateLead(lead.id, payload);
      setSuccessMsg('Lead updated successfully!');
      fetchLead();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update lead');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCallLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;
    setLoggingCall(true);
    setError(null);
    try {
      await leadAPI.createCallLog(lead.id, {
        outcome: callOutcome,
        durationSec: Number(callDuration) || 0,
        notes: callNotes.trim() || undefined,
      });
      setCallNotes('');
      setSuccessMsg('Call logged successfully!');
      fetchLead();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to log call');
    } finally {
      setLoggingCall(false);
    }
  };

  const handleDeleteCallLog = async (callLogId: number) => {
    if (!lead || !confirm('Delete this call log?')) return;
    try {
      await leadAPI.deleteCallLog(lead.id, callLogId);
      fetchLead();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete call log');
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !noteText.trim()) return;
    setAddingNote(true);
    setError(null);
    try {
      await leadAPI.createLeadNote(lead.id, { noteText: noteText.trim() });
      setNoteText('');
      setSuccessMsg('Note added successfully!');
      fetchLead();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const handleUpdateNote = async (noteId: number) => {
    if (!lead || !editingNoteText.trim()) return;
    try {
      await leadAPI.updateLeadNote(lead.id, noteId, { noteText: editingNoteText.trim() });
      setEditingNoteId(null);
      fetchLead();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!lead || !confirm('Delete this note?')) return;
    try {
      await leadAPI.deleteLeadNote(lead.id, noteId);
      fetchLead();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete note');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#4a7635] border-t-transparent" />
          <p className="text-xs font-bold text-muted">Loading lead details...</p>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-rose-400">
          <AlertCircle size={32} className="mx-auto mb-2" />
          <h2 className="text-base font-black">Lead Not Found</h2>
          <p className="mt-1 text-xs text-muted">{error || 'This lead does not exist or has been deleted.'}</p>
          <Link
            href="/admin/leads"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-foreground/10 px-4 py-2 text-xs font-bold text-foreground hover:bg-foreground/15"
          >
            <ArrowLeft size={14} />
            <span>Back to Leads CRM</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/admin/leads"
          className="inline-flex items-center gap-2 text-xs font-bold text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          <span>Back to All Leads</span>
        </Link>

        {isAdmin && lead.status !== 'CONVERTED' && (
          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/20"
          >
            <Trash2 size={14} />
            <span>Delete Lead</span>
          </button>
        )}
      </div>

      {/* Header Banner */}
      <div className="glass-panel flex flex-col gap-4 rounded-2xl border border-[var(--border-subtle)] p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-base font-black text-[#4a7635]">
              #{lead.id}
            </span>
            <LeadStatusBadge status={lead.status} />
            <LeadTypeBadge type={lead.leadType} />
            {lead.isDuplicate && (
              <span className="inline-flex items-center gap-0.5 rounded bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-black text-purple-400 border border-purple-500/20">
                <Copy size={10} />
                Duplicate
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            {lead.name}
          </h1>
          <p className="text-xs text-muted">
            Submitted on {new Date(lead.createdAt).toLocaleString('en-IN')}
          </p>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-1">
          <span className="text-[10px] font-bold text-muted uppercase">Intent Level</span>
          <IntentScoreBadge score={lead.intentScore} />
        </div>
      </div>

      {/* Notification banner */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-semibold text-emerald-400">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[var(--border-subtle)]">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`border-b-2 px-5 py-3 text-xs font-black transition-colors ${
            activeTab === 'overview'
              ? 'border-[#4a7635] text-[#4a7635]'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('actions')}
          className={`border-b-2 px-5 py-3 text-xs font-black transition-colors ${
            activeTab === 'actions'
              ? 'border-[#4a7635] text-[#4a7635]'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          Status & Assignment
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('calls')}
          className={`flex items-center gap-1.5 border-b-2 px-5 py-3 text-xs font-black transition-colors ${
            activeTab === 'calls'
              ? 'border-[#4a7635] text-[#4a7635]'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          <span>Call Logs</span>
          {lead.callLogs && lead.callLogs.length > 0 && (
            <span className="rounded-full bg-indigo-500/20 px-1.5 py-0.2 text-[10px] font-black text-indigo-400">
              {lead.callLogs.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-1.5 border-b-2 px-5 py-3 text-xs font-black transition-colors ${
            activeTab === 'notes'
              ? 'border-[#4a7635] text-[#4a7635]'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          <span>Notes</span>
          {lead.notes && lead.notes.length > 0 && (
            <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[10px] font-black text-amber-400">
              {lead.notes.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex flex-col gap-6">
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Customer Box */}
            <div className="glass-panel flex flex-col gap-4 rounded-2xl border border-[var(--border-subtle)] p-5">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted">
                Customer Information
              </h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                    <Phone size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted uppercase">Phone</span>
                    <a href={`tel:${lead.mobile}`} className="block font-mono text-xs font-bold text-foreground hover:text-[#4a7635]">
                      {lead.mobile}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
                    <Mail size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted uppercase">Email</span>
                    <p className="text-xs font-bold text-foreground">
                      {lead.email || 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted uppercase">Location</span>
                    <p className="text-xs font-bold text-foreground">
                      {[lead.address, lead.city, lead.district, lead.state]
                        .filter(Boolean)
                        .join(', ') || 'Not specified'}
                    </p>
                    {lead.latitude && lead.longitude && (
                      <a
                        href={`https://maps.google.com/?q=${lead.latitude},${lead.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:underline"
                      >
                        <Compass size={12} />
                        <span>View on Google Maps</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Product & Budget Box */}
            <div className="glass-panel flex flex-col gap-4 rounded-2xl border border-[var(--border-subtle)] p-5">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted">
                Product & Enquiry Details
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-muted uppercase">Interested Brand</span>
                  <p className="font-bold text-foreground">{lead.interestedBrand || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted uppercase">Interested Model</span>
                  <p className="font-bold text-foreground">{lead.interestedModel || lead.tractor?.modelName || 'General Enquiry'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted uppercase">Budget</span>
                  <p className="font-bold text-emerald-400">
                    {lead.budget && lead.budget > 0
                      ? `₹${Number(lead.budget).toLocaleString('en-IN')}`
                      : 'Not specified'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted uppercase">Next Follow-up</span>
                  <div className="mt-0.5">
                    <FollowupBadge date={lead.nextFollowupAt} status={lead.status} />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted uppercase">Source Page</span>
                  <p className="font-mono text-muted">{lead.sourcePage || 'direct'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted uppercase">Campaign</span>
                  <p className="font-mono text-muted">{lead.sourceCampaign || 'organic'}</p>
                </div>
              </div>

              {lead.message && (
                <div className="border-t border-[var(--border-subtle)] pt-3">
                  <span className="text-[10px] font-bold text-muted uppercase">Message</span>
                  <p className="mt-1 rounded-xl bg-foreground/5 p-3 text-xs font-medium text-foreground whitespace-pre-wrap">
                    {lead.message}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STATUS & ACTIONS */}
        {activeTab === 'actions' && (
          <div className="glass-panel flex flex-col gap-5 rounded-2xl border border-[var(--border-subtle)] p-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-muted">
              CRM Status & Team Assignment
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-foreground">Pipeline Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as LeadStatus)}
                  className="rounded-xl border border-[var(--border-subtle)] bg-background px-3 py-2.5 text-xs font-bold text-foreground focus:border-[#4a7635] focus:outline-none"
                >
                  {LEAD_STATUSES.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-foreground">Assigned Agent</label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="rounded-xl border border-[var(--border-subtle)] bg-background px-3 py-2.5 text-xs font-bold text-foreground focus:border-[#4a7635] focus:outline-none"
                >
                  <option value="">-- Unassigned --</option>
                  {agents.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      👤 {ag.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-foreground">Associated Dealer</label>
                <select
                  value={dealerId}
                  onChange={(e) => setDealerId(e.target.value)}
                  className="rounded-xl border border-[var(--border-subtle)] bg-background px-3 py-2.5 text-xs font-bold text-foreground focus:border-[#4a7635] focus:outline-none"
                >
                  <option value="">-- No Dealer --</option>
                  {dealers.map((d) => (
                    <option key={d.id} value={d.id}>
                      🏢 {d.businessName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-foreground">Next Follow-up Date & Time</label>
                <input
                  type="datetime-local"
                  value={nextFollowupAt}
                  onChange={(e) => setNextFollowupAt(e.target.value)}
                  className="rounded-xl border border-[var(--border-subtle)] bg-background px-3 py-2.5 text-xs font-bold text-foreground focus:border-[#4a7635] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveActions}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-[#4a7635] px-6 py-2.5 text-xs font-black text-white hover:opacity-95 disabled:opacity-50"
              >
                <Save size={15} />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        )}

        {/* CALL LOGS */}
        {activeTab === 'calls' && (
          <div className="flex flex-col gap-6">
            <form onSubmit={handleCreateCallLog} className="glass-panel rounded-2xl border border-[var(--border-subtle)] p-5">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted mb-3">Record Call Outcome</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-muted uppercase">Outcome</label>
                  <select
                    value={callOutcome}
                    onChange={(e) => setCallOutcome(e.target.value as CallOutcome)}
                    className="rounded-xl border border-[var(--border-subtle)] bg-background px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
                  >
                    <option value="answered">Answered / Connected</option>
                    <option value="no_answer">No Answer / Busy</option>
                    <option value="callback">Callback Requested</option>
                    <option value="wrong_number">Wrong Number</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-muted uppercase">Duration (seconds)</label>
                  <input
                    type="number"
                    min="0"
                    value={callDuration}
                    onChange={(e) => setCallDuration(e.target.value)}
                    className="rounded-xl border border-[var(--border-subtle)] bg-background px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-muted uppercase">Discussion Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Summary of discussion..."
                    value={callNotes}
                    onChange={(e) => setCallNotes(e.target.value)}
                    className="rounded-xl border border-[var(--border-subtle)] bg-background px-3 py-2 text-xs font-medium text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={loggingCall}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-black text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  <PhoneCall size={13} />
                  <span>{loggingCall ? 'Saving...' : 'Record Call Log'}</span>
                </button>
              </div>
            </form>

            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted">
                Call History ({lead.callLogs?.length ?? 0})
              </h3>
              {(!lead.callLogs || lead.callLogs.length === 0) && (
                <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-6 text-center text-xs text-muted">
                  No call logs recorded.
                </div>
              )}
              {lead.callLogs?.map((log) => (
                <div key={log.id} className="glass-panel flex flex-col gap-2 rounded-2xl border border-[var(--border-subtle)] p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs capitalize text-foreground">{log.outcome.replace('_', ' ')} ({log.durationSec}s)</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted">{new Date(log.calledAt).toLocaleString('en-IN')}</span>
                      {(isAdmin || (user?.id && log.agentId === user.id)) && (
                        <button type="button" onClick={() => handleDeleteCallLog(log.id)} className="text-muted hover:text-rose-400">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                  {log.notes && <p className="text-xs text-foreground/90 whitespace-pre-wrap">{log.notes}</p>}
                  <span className="text-[10px] text-muted">Logged by: {log.agent?.fullName || 'Agent'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NOTES */}
        {activeTab === 'notes' && (
          <div className="flex flex-col gap-6">
            <form onSubmit={handleCreateNote} className="glass-panel rounded-2xl border border-[var(--border-subtle)] p-5">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted mb-2">Post Staff Note</h3>
              <textarea
                rows={3}
                placeholder="Write internal notes about this customer..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-background p-3 text-xs font-medium text-foreground focus:outline-none"
              />
              <div className="mt-2.5 flex justify-end">
                <button
                  type="submit"
                  disabled={addingNote || !noteText.trim()}
                  className="flex items-center gap-1.5 rounded-xl bg-[#4a7635] px-4 py-2 text-xs font-black text-white hover:opacity-95 disabled:opacity-50"
                >
                  <Plus size={14} />
                  <span>{addingNote ? 'Adding...' : 'Post Note'}</span>
                </button>
              </div>
            </form>

            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted">
                Notes Timeline ({lead.notes?.length ?? 0})
              </h3>
              {(!lead.notes || lead.notes.length === 0) && (
                <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-6 text-center text-xs text-muted">
                  No internal notes recorded.
                </div>
              )}
              {lead.notes?.map((n) => (
                <div key={n.id} className="glass-panel flex flex-col gap-2 rounded-2xl border border-[var(--border-subtle)] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-foreground">{n.agent?.fullName || 'Agent'}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted">{new Date(n.createdAt).toLocaleString('en-IN')}</span>
                      {(isAdmin || (user?.id && n.agentId === user.id)) && editingNoteId !== n.id && (
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => { setEditingNoteId(n.id); setEditingNoteText(n.noteText); }} className="text-muted hover:text-amber-400">
                            <Edit2 size={13} />
                          </button>
                          <button type="button" onClick={() => handleDeleteNote(n.id)} className="text-muted hover:text-rose-400">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {editingNoteId === n.id ? (
                    <div className="flex flex-col gap-2">
                      <textarea
                        rows={2}
                        value={editingNoteText}
                        onChange={(e) => setEditingNoteText(e.target.value)}
                        className="rounded-xl border border-[var(--border-subtle)] bg-background p-2 text-xs font-medium text-foreground focus:outline-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setEditingNoteId(null)} className="text-xs font-bold text-muted hover:text-foreground">
                          Cancel
                        </button>
                        <button type="button" onClick={() => handleUpdateNote(n.id)} className="rounded-lg bg-[#4a7635] px-3 py-1 text-xs font-bold text-white hover:opacity-95">
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs font-medium text-foreground/90 whitespace-pre-wrap">{n.noteText}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        lead={lead}
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onSuccess={() => {
          router.push('/admin/leads');
        }}
      />
    </div>
  );
}
