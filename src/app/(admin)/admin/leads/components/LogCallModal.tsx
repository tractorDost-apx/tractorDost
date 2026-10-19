import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, PhoneCall, AlertCircle } from 'lucide-react';
import { Lead, CallOutcome, leadAPI } from '@/lib/api/leads';

interface LogCallModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function LogCallModal({
  lead,
  isOpen,
  onClose,
  onSuccess,
}: LogCallModalProps) {
  const [outcome, setOutcome] = useState<CallOutcome>('answered');
  const [durationSec, setDurationSec] = useState<string>('60');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await leadAPI.createCallLog(lead.id, {
        outcome,
        durationSec: Number(durationSec) || 0,
        notes: notes.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to log call');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-background p-6 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
              <PhoneCall size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground">Log Call Interaction</h3>
              <p className="text-[11px] font-medium text-muted">
                Lead #{lead.id} — {lead.name} ({lead.mobile})
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
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-muted uppercase">Outcome</label>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value as CallOutcome)}
                className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-2 text-xs font-bold text-foreground focus:outline-none"
              >
                <option value="answered">Answered</option>
                <option value="no_answer">No Answer</option>
                <option value="callback">Callback</option>
                <option value="wrong_number">Wrong Number</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-muted uppercase">Duration (sec)</label>
              <input
                type="number"
                min="0"
                value={durationSec}
                onChange={(e) => setDurationSec(e.target.value)}
                className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-2 text-xs font-bold text-foreground focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-muted uppercase">Call Notes</label>
            <textarea
              rows={3}
              placeholder="Record outcome notes, customer questions or next steps..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-2.5 text-xs font-medium text-foreground focus:outline-none"
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
              disabled={submitting}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-black text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              <PhoneCall size={14} />
              <span>{submitting ? 'Saving...' : 'Record Call Log'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
