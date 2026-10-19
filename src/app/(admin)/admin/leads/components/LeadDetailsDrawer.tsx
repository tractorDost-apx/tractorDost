import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
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
  Sparkles,
} from 'lucide-react';
import {
  Lead,
  LeadStatus,
  LeadNote,
  CallLog,
  CallOutcome,
  leadAPI,
} from '@/lib/api/leads';
import {
  LeadStatusBadge,
  LeadTypeBadge,
  IntentScoreBadge,
  FollowupBadge,
} from './LeadStatusBadge';
import { LEAD_STATUSES } from './LeadFilters';

interface LeadDetailsDrawerProps {
  leadId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onLeadUpdated: () => void;
  agents: { id: number; fullName: string }[];
  dealers: { id: number; businessName: string }[];
  currentUserId?: number;
  isAdmin: boolean;
}

type DrawerTab = 'overview' | 'actions' | 'calls' | 'notes';

export function LeadDetailsDrawer({
  leadId,
  isOpen,
  onClose,
  onLeadUpdated,
  agents,
  dealers,
  currentUserId,
  isAdmin,
}: LeadDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<DrawerTab>('overview');
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states for CRM status & assignment
  const [status, setStatus] = useState<LeadStatus>('NEW');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [dealerId, setDealerId] = useState<string>('');
  const [nextFollowupAt, setNextFollowupAt] = useState<string>('');

  // Call log form state
  const [callOutcome, setCallOutcome] = useState<CallOutcome>('answered');
  const [callDuration, setCallDuration] = useState<string>('60');
  const [callNotes, setCallNotes] = useState<string>('');
  const [loggingCall, setLoggingCall] = useState(false);

  // Note form state
  const [noteText, setNoteText] = useState<string>('');
  const [addingNote, setAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingNoteText, setEditingNoteText] = useState<string>('');

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchLeadDetails = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await leadAPI.getLeadById(id);
      if (res.success && res.data) {
        setLead(res.data);
        setStatus(res.data.status);
        setAssignedTo(res.data.assignedTo ? String(res.data.assignedTo) : '');
        setDealerId(res.data.dealerId ? String(res.data.dealerId) : '');
        if (res.data.nextFollowupAt) {
          // Format for datetime-local: YYYY-MM-DDTHH:mm
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
    if (leadId && isOpen) {
      setActiveTab('overview');
      setError(null);
      setSuccessMsg(null);
      fetchLeadDetails(leadId);
    }
  }, [leadId, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
      fetchLeadDetails(lead.id);
      onLeadUpdated();
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
      fetchLeadDetails(lead.id);
      onLeadUpdated();
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
      fetchLeadDetails(lead.id);
      onLeadUpdated();
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
      fetchLeadDetails(lead.id);
      onLeadUpdated();
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
      fetchLeadDetails(lead.id);
      onLeadUpdated();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!lead || !confirm('Delete this note?')) return;
    try {
      await leadAPI.deleteLeadNote(lead.id, noteId);
      fetchLeadDetails(lead.id);
      onLeadUpdated();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete note');
    }
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
      />

      {/* Drawer content */}
      <div className="relative z-10 flex h-full w-full max-w-2xl flex-col border-l border-[var(--border-subtle)] bg-background/95 shadow-2xl backdrop-blur-2xl transition-transform duration-300 animate-in slide-in-from-right sm:w-[650px]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-black text-[#4a7635]">
                  #{lead?.id ?? leadId}
                </span>
                {lead && <LeadStatusBadge status={lead.status} />}
                {lead && <LeadTypeBadge type={lead.leadType} />}
              </div>
              <h2 className="text-base font-black text-foreground">
                {lead?.name || 'Customer Enquiry'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-muted transition-colors hover:bg-foreground/10 hover:text-foreground"
            title="Close Drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Feedback banners */}
        {error && (
          <div className="mx-6 mt-3 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-400">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-3 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-400">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-[var(--border-subtle)] px-6">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`border-b-2 px-4 py-3 text-xs font-black transition-colors ${
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
            className={`border-b-2 px-4 py-3 text-xs font-black transition-colors ${
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
            className={`flex items-center gap-1.5 border-b-2 px-4 py-3 text-xs font-black transition-colors ${
              activeTab === 'calls'
                ? 'border-[#4a7635] text-[#4a7635]'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            <span>Call Logs</span>
            {lead?.callLogs && lead.callLogs.length > 0 && (
              <span className="rounded-full bg-indigo-500/20 px-1.5 py-0.2 text-[10px] font-black text-indigo-400">
                {lead.callLogs.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-3 text-xs font-black transition-colors ${
              activeTab === 'notes'
                ? 'border-[#4a7635] text-[#4a7635]'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            <span>Notes</span>
            {lead?.notes && lead.notes.length > 0 && (
              <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[10px] font-black text-amber-400">
                {lead.notes.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-foreground/5" />
              ))}
            </div>
          ) : !lead ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted">
              <AlertCircle size={32} />
              <p className="mt-2 text-sm font-bold">Failed to load lead.</p>
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="flex flex-col gap-6">
                  {/* Customer Contact Box */}
                  <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-muted mb-3">
                      Customer Profile & Contact
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                          <Phone size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-muted uppercase">
                            Mobile Number
                          </span>
                          <a
                            href={`tel:${lead.mobile}`}
                            className="font-mono text-xs font-bold text-foreground hover:text-[#4a7635]"
                          >
                            {lead.mobile}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
                          <Mail size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-muted uppercase">
                            Email Address
                          </span>
                          {lead.email ? (
                            <a
                              href={`mailto:${lead.email}`}
                              className="text-xs font-bold text-foreground hover:text-sky-400 truncate max-w-[200px]"
                            >
                              {lead.email}
                            </a>
                          ) : (
                            <span className="text-xs italic text-muted">Not provided</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 sm:col-span-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                          <MapPin size={16} />
                        </div>
                        <div className="flex flex-col flex-1">
                          <span className="text-[10px] font-bold text-muted uppercase">
                            Location
                          </span>
                          <span className="text-xs font-bold text-foreground">
                            {[lead.address, lead.city, lead.district, lead.state]
                              .filter(Boolean)
                              .join(', ') || 'Location not specified'}
                          </span>
                          {lead.latitude && lead.longitude && (
                            <a
                              href={`https://maps.google.com/?q=${lead.latitude},${lead.longitude}`}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1 flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:underline"
                            >
                              <Compass size={12} />
                              <span>View GPS Coordinates on Maps</span>
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interested Product & Details Box */}
                  <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-muted mb-3">
                      Enquiry & Product Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-muted uppercase">
                          Interested Brand
                        </span>
                        <p className="text-xs font-bold text-foreground">
                          {lead.interestedBrand || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-muted uppercase">
                          Interested Model
                        </span>
                        <p className="text-xs font-bold text-foreground">
                          {lead.interestedModel || lead.tractor?.modelName || 'General Enquiry'}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-muted uppercase">
                          Declared Budget
                        </span>
                        <p className="text-xs font-bold text-emerald-400">
                          {lead.budget && lead.budget > 0
                            ? `₹${Number(lead.budget).toLocaleString('en-IN')}`
                            : 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-muted uppercase">
                          Intent Score
                        </span>
                        <div className="mt-1">
                          <IntentScoreBadge score={lead.intentScore} />
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-muted uppercase">
                          Source Page
                        </span>
                        <p className="text-xs font-mono font-semibold text-foreground/80">
                          {lead.sourcePage || 'direct'}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-muted uppercase">
                          Source Campaign
                        </span>
                        <p className="text-xs font-mono font-semibold text-foreground/80">
                          {lead.sourceCampaign || 'organic'}
                        </p>
                      </div>
                    </div>

                    {lead.message && (
                      <div className="mt-4 border-t border-[var(--border-subtle)] pt-3">
                        <span className="text-[10px] font-bold text-muted uppercase">
                          Customer Message / Notes
                        </span>
                        <p className="mt-1 rounded-xl bg-foreground/5 p-3 text-xs font-medium text-foreground/90 whitespace-pre-wrap">
                          {lead.message}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* System & Duplicate Status */}
                  <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-4 text-xs font-semibold">
                    <h3 className="text-xs font-black uppercase tracking-wider text-muted mb-2">
                      Record Timestamps
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-[11px]">
                      <div>
                        <span className="text-muted">Created:</span>{' '}
                        <span className="text-foreground">
                          {new Date(lead.createdAt).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted">Last Updated:</span>{' '}
                        <span className="text-foreground">
                          {new Date(lead.updatedAt).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted">Last Followed Up:</span>{' '}
                        <span className="text-foreground">
                          {lead.lastFollowupAt
                            ? new Date(lead.lastFollowupAt).toLocaleString('en-IN')
                            : 'Never'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted">Converted At:</span>{' '}
                        <span className="text-lime-400">
                          {lead.convertedAt
                            ? new Date(lead.convertedAt).toLocaleString('en-IN')
                            : 'Not converted'}
                        </span>
                      </div>
                      {lead.isDuplicate && (
                        <div className="col-span-2 flex items-center gap-2 rounded-xl bg-purple-500/10 p-2.5 text-purple-300">
                          <Copy size={14} className="shrink-0" />
                          <span>
                            This enquiry is tagged as a duplicate submission.
                            {lead.mergedIntoId && ` Merged into original #${lead.mergedIntoId}.`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: STATUS & ASSIGNMENT */}
              {activeTab === 'actions' && (
                <div className="flex flex-col gap-5">
                  <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-muted mb-3">
                      Update CRM Pipeline Status
                    </h3>
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-bold text-foreground">Status</label>
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
                      <span className="text-[10px] text-muted">
                        Setting status to Converted will stamp conversion timestamp. Converted and
                        Spam leads are frozen.
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-muted mb-3">
                      Agent & Dealer Assignment
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-foreground">
                          Assigned Agent
                        </label>
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
                        <label className="text-[11px] font-bold text-foreground">
                          Associated Dealer
                        </label>
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
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-muted mb-3">
                      Schedule Next Follow-up
                    </h3>
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-bold text-foreground">
                        Next Follow-up Date & Time
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="datetime-local"
                          value={nextFollowupAt}
                          onChange={(e) => setNextFollowupAt(e.target.value)}
                          className="flex-1 rounded-xl border border-[var(--border-subtle)] bg-background px-3 py-2.5 text-xs font-bold text-foreground focus:border-[#4a7635] focus:outline-none"
                        />
                        {nextFollowupAt && (
                          <button
                            type="button"
                            onClick={() => setNextFollowupAt('')}
                            className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/20"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveActions}
                    disabled={saving}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4a7635] py-3 text-xs font-black text-white transition-opacity hover:opacity-95 disabled:opacity-50"
                  >
                    <Save size={15} />
                    <span>{saving ? 'Saving Changes...' : 'Save Lead Updates'}</span>
                  </button>
                </div>
              )}

              {/* TAB 3: CALL LOGS */}
              {activeTab === 'calls' && (
                <div className="flex flex-col gap-6">
                  {/* Inline Log Call Form */}
                  <form
                    onSubmit={handleCreateCallLog}
                    className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-4"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <PhoneCall size={16} className="text-indigo-400" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                        Record New Call
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-muted uppercase">
                          Call Outcome
                        </label>
                        <select
                          value={callOutcome}
                          onChange={(e) => setCallOutcome(e.target.value as CallOutcome)}
                          className="rounded-xl border border-[var(--border-subtle)] bg-background px-3 py-2 text-xs font-bold text-foreground focus:border-[#4a7635] focus:outline-none"
                        >
                          <option value="answered">Answered / Connected</option>
                          <option value="no_answer">No Answer / Busy</option>
                          <option value="callback">Customer Requested Callback</option>
                          <option value="wrong_number">Wrong Number</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-muted uppercase">
                          Duration (seconds)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={callDuration}
                          onChange={(e) => setCallDuration(e.target.value)}
                          className="rounded-xl border border-[var(--border-subtle)] bg-background px-3 py-2 text-xs font-bold text-foreground focus:border-[#4a7635] focus:outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1 sm:col-span-2">
                        <label className="text-[10px] font-bold text-muted uppercase">
                          Call Summary / Discussion
                        </label>
                        <textarea
                          rows={2}
                          placeholder="What did the customer discuss? What is the next step?"
                          value={callNotes}
                          onChange={(e) => setCallNotes(e.target.value)}
                          className="rounded-xl border border-[var(--border-subtle)] bg-background px-3 py-2 text-xs font-medium text-foreground focus:border-[#4a7635] focus:outline-none"
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
                        <span>{loggingCall ? 'Logging...' : 'Save Call Log'}</span>
                      </button>
                    </div>
                  </form>

                  {/* History of Call Logs */}
                  <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-muted">
                      Call History ({lead.callLogs?.length ?? 0})
                    </h3>

                    {(!lead.callLogs || lead.callLogs.length === 0) && (
                      <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-6 text-center text-xs text-muted">
                        No calls have been recorded for this lead yet.
                      </div>
                    )}

                    {lead.callLogs?.map((log) => {
                      const canDeleteCall =
                        isAdmin || (currentUserId && log.agentId === currentUserId);

                      return (
                        <div
                          key={log.id}
                          className="flex flex-col gap-2 rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded-lg px-2 py-0.5 text-[10px] font-black uppercase border ${
                                  log.outcome === 'answered'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : log.outcome === 'callback'
                                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                }`}
                              >
                                {log.outcome.replace('_', ' ')}
                              </span>
                              <span className="text-[11px] font-bold text-foreground">
                                {log.durationSec ? `${log.durationSec}s` : '0s'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted">
                                {new Date(log.calledAt).toLocaleString('en-IN')}
                              </span>
                              {canDeleteCall && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCallLog(log.id)}
                                  className="text-muted hover:text-rose-400"
                                  title="Delete call log"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </div>

                          {log.notes && (
                            <p className="text-xs font-medium text-foreground/90 whitespace-pre-wrap">
                              {log.notes}
                            </p>
                          )}

                          <div className="text-[10px] font-semibold text-muted">
                            Logged by: {log.agent?.fullName || 'Agent'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: NOTES */}
              {activeTab === 'notes' && (
                <div className="flex flex-col gap-6">
                  {/* Inline Add Note Form */}
                  <form
                    onSubmit={handleCreateNote}
                    className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={16} className="text-amber-400" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                        Add New Note
                      </h3>
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Write internal notes about this lead (only visible to staff)..."
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="w-full rounded-xl border border-[var(--border-subtle)] bg-background p-3 text-xs font-medium text-foreground focus:border-[#4a7635] focus:outline-none"
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

                  {/* Notes Timeline */}
                  <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-muted">
                      Notes Timeline ({lead.notes?.length ?? 0})
                    </h3>

                    {(!lead.notes || lead.notes.length === 0) && (
                      <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-6 text-center text-xs text-muted">
                        No internal notes recorded yet.
                      </div>
                    )}

                    {lead.notes?.map((n) => {
                      const isEditing = editingNoteId === n.id;
                      const canModify =
                        isAdmin || (currentUserId && n.agentId === currentUserId);

                      return (
                        <div
                          key={n.id}
                          className="flex flex-col gap-2 rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-4"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-foreground">
                              {n.agent?.fullName || 'Agent'}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted">
                                {new Date(n.createdAt).toLocaleString('en-IN')}
                              </span>
                              {canModify && !isEditing && (
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingNoteId(n.id);
                                      setEditingNoteText(n.noteText);
                                    }}
                                    className="text-muted hover:text-amber-400"
                                    title="Edit note"
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteNote(n.id)}
                                    className="text-muted hover:text-rose-400"
                                    title="Delete note"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {isEditing ? (
                            <div className="flex flex-col gap-2">
                              <textarea
                                rows={2}
                                value={editingNoteText}
                                onChange={(e) => setEditingNoteText(e.target.value)}
                                className="w-full rounded-xl border border-[var(--border-subtle)] bg-background p-2 text-xs font-medium text-foreground focus:outline-none"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingNoteId(null)}
                                  className="rounded-lg px-2.5 py-1 text-xs font-bold text-muted hover:text-foreground"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateNote(n.id)}
                                  className="rounded-lg bg-[#4a7635] px-3 py-1 text-xs font-bold text-white hover:opacity-95"
                                >
                                  Save Note
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs font-medium text-foreground/90 whitespace-pre-wrap">
                              {n.noteText}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
