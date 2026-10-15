import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, UserCheck, AlertCircle } from 'lucide-react';
import { leadAPI } from '@/lib/api/leads';

interface BulkAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLeadIds: number[];
  agents: { id: number; fullName: string }[];
  onSuccess: () => void;
}

export function BulkAssignModal({
  isOpen,
  onClose,
  selectedLeadIds,
  agents,
  onSuccess,
}: BulkAssignModalProps) {
  const [targetAgentId, setTargetAgentId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAgentId) {
      setError('Please select an agent to assign');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await leadAPI.bulkAssign({
        leadIds: selectedLeadIds,
        assignedTo: Number(targetAgentId),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to bulk assign leads');
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
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
              <UserCheck size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground">Bulk Assign Leads</h3>
              <p className="text-[11px] font-medium text-muted">
                Assigning {selectedLeadIds.length} selected lead(s)
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
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-foreground">
              Select Agent
            </label>
            <select
              value={targetAgentId}
              onChange={(e) => setTargetAgentId(e.target.value)}
              className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-2.5 text-xs font-bold text-foreground focus:border-[#4a7635] focus:outline-none"
            >
              <option value="">-- Choose an Agent --</option>
              {agents.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  👤 {ag.fullName}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-muted">
              Leads in terminal status (Converted/Spam) will be skipped automatically.
            </span>
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
              disabled={submitting || !targetAgentId}
              className="flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-black text-white hover:bg-sky-500 disabled:opacity-50"
            >
              <UserCheck size={14} />
              <span>{submitting ? 'Assigning...' : `Assign ${selectedLeadIds.length} Leads`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
