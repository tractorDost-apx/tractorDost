'use client';

import React, { useState } from 'react';
import { Loader2, StickyNote, Edit3, Check, X, RefreshCw, Sparkles, MessageSquare } from 'lucide-react';
import { SpatialButton } from '@/components/ui/spatial-button';
import { useLeadNotes, useLeadNoteActions } from '@/hooks/leads/use-lead-notes';
import { formatDateTime } from '@/lib/utils/format-date';
import type { LeadNote } from '@/types/models/used-listing';

interface LeadNotesPanelProps {
  /** Lead or Enquiry ID (number) the notes belong to */
  leadId: number;
}

const INPUT_CLASS =
  'w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 transition-all focus:border-[var(--color-brand-green)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-lime-400 dark:focus:bg-white/10 dark:focus:ring-lime-400/20 resize-y';

const QUICK_TAGS = [
  '📞 Called - Buyer interested',
  '🤝 Negotiating final price',
  '🚜 Scheduled tractor inspection',
  '⏳ Waiting for financing/loan approval',
  '🔄 Requested callback tomorrow',
  '✅ Deal finalized',
];

export default function LeadNotesPanel({ leadId }: LeadNotesPanelProps) {
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [fetchingNoteId, setFetchingNoteId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { data, loading, error: loadError, reload } = useLeadNotes(leadId, page);
  const { saving, addNote, editNote, getNote } = useLeadNoteActions();

  const notes = data?.data ?? [];
  const totalPages = data?.meta.totalPages ?? 1;

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleAdd = async () => {
    const text = draft.trim();
    if (!text) return;
    setError(null);
    const res = await addNote(leadId, text);
    if (res.success) {
      setDraft('');
      setPage(1);
      showSuccess('Note added successfully');
      reload();
    } else {
      setError(res.message);
    }
  };

  const handleStartEdit = async (note: LeadNote) => {
    setEditingId(note.id);
    setEditText(note.noteText);
    setError(null);
    setFetchingNoteId(note.id);

    try {
      // Fetch latest version of this specific note from backend using getLeadNoteById
      const res = await getNote(note.id);
      if (res.success && res.data) {
        setEditText(res.data.noteText);
      }
    } catch {
      // Keep existing note text
    } finally {
      setFetchingNoteId(null);
    }
  };

  const handleSaveEdit = async (noteId: number) => {
    const text = editText.trim();
    if (!text) return;
    setError(null);
    const res = await editNote(noteId, text);
    if (res.success) {
      setEditingId(null);
      showSuccess('Note updated successfully');
      reload();
    } else {
      setError(res.message);
    }
  };

  const handleApplyQuickTag = (tag: string) => {
    setDraft((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed}\n${tag}` : tag;
    });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Panel Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StickyNote size={18} className="text-lime-400" />
          <h4 className="text-foreground text-sm font-black uppercase tracking-wider">
            Lead Notes & Follow-ups
          </h4>
        </div>
        <button
          onClick={reload}
          disabled={loading}
          className="text-muted hover:text-foreground text-xs font-semibold flex items-center gap-1 transition-colors"
          title="Refresh notes"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Add New Note Section */}
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 space-y-3 dark:border-white/10 dark:bg-white/[0.03]">
        {/* Quick Follow-up Templates */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">
            <Sparkles size={12} className="text-lime-500 dark:text-lime-400" />
            <span>Quick Templates</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleApplyQuickTag(tag)}
                className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-800 shadow-sm transition-all hover:border-[var(--color-brand-green)] hover:bg-[var(--color-brand-green)]/10 hover:text-[var(--color-brand-green)] dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:border-lime-400/50 dark:hover:bg-lime-400/10 dark:hover:text-lime-400"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea Input */}
        <div className="relative">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={2000}
            rows={3}
            placeholder="Type follow-up details, customer requirements, agreed price, or next action…"
            className={INPUT_CLASS}
            aria-label="New lead note"
          />
          <div className="mt-1 flex items-center justify-between text-[11px] text-muted">
            <span>Keep your notes clear for easy follow-up</span>
            <span className={draft.length > 1800 ? 'text-amber-400 font-bold' : ''}>
              {draft.length} / 2000
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end items-center gap-2">
          <SpatialButton
            variant="primary"
            onClick={handleAdd}
            disabled={saving || draft.trim().length === 0}
            className="text-xs px-4 py-2"
          >
            {saving ? (
              <span className="flex items-center gap-1.5">
                <Loader2 size={14} className="animate-spin" /> Saving…
              </span>
            ) : (
              'Add Lead Note'
            )}
          </SpatialButton>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-semibold text-red-400">
          ⚠️ {error}
        </div>
      )}
      {successMsg && (
        <div className="rounded-xl border border-lime-400/20 bg-lime-400/10 p-3 text-xs font-semibold text-lime-400 flex items-center gap-1.5">
          <Check size={14} /> {successMsg}
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-muted">
          <span>Activity Timeline ({notes.length})</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin text-lime-400" size={24} />
          </div>
        ) : loadError ? (
          <div className="glass-inner p-6 text-center space-y-3">
            <p className="text-sm font-medium text-red-400">{loadError}</p>
            <SpatialButton variant="glass" onClick={reload}>
              Try again
            </SpatialButton>
          </div>
        ) : notes.length === 0 ? (
          <div className="rounded-2xl border border-border/40 bg-secondary/5 p-6 text-center">
            <MessageSquare size={28} className="mx-auto text-muted mb-2 opacity-60" />
            <p className="text-sm font-bold text-foreground">No notes recorded yet</p>
            <p className="text-xs text-muted mt-1">
              Add your first note above to track calls, discussions, and updates for this lead.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {notes.map((note) => (
              <li
                key={note.id}
                className="rounded-2xl border border-border/50 bg-secondary/15 p-4 transition-all hover:border-lime-400/30"
              >
                {/* Note Header */}
                <div className="mb-2 flex items-center justify-between gap-2 border-b border-border/40 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime-400/20 text-[11px] font-black text-lime-400">
                      {(note.agent.fullName ?? 'D')[0].toUpperCase()}
                    </span>
                    <span className="text-foreground text-xs font-bold">
                      {note.agent.fullName ?? 'Dealership Staff'}
                    </span>
                  </div>
                  <span className="text-muted text-[11px] font-medium">
                    {formatDateTime(note.createdAt)}
                  </span>
                </div>

                {/* Note Content / Editing */}
                {editingId === note.id ? (
                  <div className="space-y-2 mt-2">
                    {fetchingNoteId === note.id ? (
                      <div className="flex items-center gap-2 py-4 text-xs text-muted">
                        <Loader2 size={14} className="animate-spin text-lime-400" />
                        <span>Fetching latest note content…</span>
                      </div>
                    ) : (
                      <>
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          maxLength={2000}
                          rows={3}
                          className={INPUT_CLASS}
                          aria-label="Edit lead note"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(null);
                              setError(null);
                            }}
                            className="glass-button px-3 py-1.5 text-xs font-bold text-muted hover:text-foreground flex items-center gap-1"
                          >
                            <X size={12} /> Cancel
                          </button>
                          <SpatialButton
                            variant="primary"
                            onClick={() => handleSaveEdit(note.id)}
                            disabled={saving || editText.trim().length === 0}
                            className="text-xs px-3 py-1.5"
                          >
                            {saving ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <span className="flex items-center gap-1">
                                <Check size={12} /> Save Note
                              </span>
                            )}
                          </SpatialButton>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-foreground text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-medium">
                      {note.noteText}
                    </p>
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(note)}
                        className="glass-button px-2.5 py-1 text-[11px] font-bold text-muted hover:text-lime-400 flex items-center gap-1 transition-colors"
                      >
                        <Edit3 size={11} /> Edit Note
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="glass-button text-foreground px-3 py-1.5 text-xs font-bold disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-muted text-xs font-bold">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="glass-button text-foreground px-3 py-1.5 text-xs font-bold disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
