import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, AlertCircle, Plus } from 'lucide-react';
import { Lead, leadAPI } from '@/lib/api/leads';

interface AddNoteModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddNoteModal({
  lead,
  isOpen,
  onClose,
  onSuccess,
}: AddNoteModalProps) {
  const [noteText, setNoteText] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await leadAPI.createLeadNote(lead.id, {
        noteText: noteText.trim(),
      });
      setNoteText('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to add note');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-background p-6 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground">Add Internal Note</h3>
              <p className="text-[11px] font-medium text-muted">
                Lead #{lead.id} — {lead.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-foreground/10 hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-400">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-muted uppercase">Note Content</label>
            <textarea
              rows={4}
              placeholder="Record remarks, customer preferences, or internal communication notes..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-3 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#4a7635]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-2 text-xs font-bold text-muted hover:bg-foreground/10 hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !noteText.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-[#4a7635] px-4 py-2 text-xs font-black text-white hover:opacity-95 disabled:opacity-50"
            >
              <Plus size={14} />
              <span>{submitting ? 'Adding...' : 'Post Note'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
