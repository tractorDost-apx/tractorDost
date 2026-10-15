import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { Lead, leadAPI } from '@/lib/api/leads';

interface DeleteConfirmModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteConfirmModal({
  lead,
  isOpen,
  onClose,
  onSuccess,
}: DeleteConfirmModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !lead) return null;

  const handleDelete = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await leadAPI.deleteLead(lead.id);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete lead');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-rose-500/30 bg-background p-6 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground">Confirm Permanent Delete</h3>
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
            <AlertTriangle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2">
          <p className="text-xs text-foreground/90 font-medium">
            Are you sure you want to permanently delete lead <strong className="text-foreground">#{lead.id} ({lead.name})</strong>?
          </p>
          <div className="rounded-xl bg-rose-500/10 p-3 text-[11px] font-medium text-rose-300">
            ⚠️ <strong>Warning:</strong> All associated call logs and lead notes will be permanently removed.
            This action cannot be undone. Converted leads cannot be deleted.
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-2 text-xs font-bold text-muted hover:bg-foreground/10 hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={submitting}
            className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-black text-white hover:bg-rose-500 disabled:opacity-50"
          >
            <Trash2 size={14} />
            <span>{submitting ? 'Deleting...' : 'Delete Lead'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
