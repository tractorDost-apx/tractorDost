import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, UserCheck, AlertCircle, Loader2 } from 'lucide-react';
import { leadAPI } from '@/lib/api/leads';

interface BulkAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLeadIds: number[];
  agents: { id: number; fullName: string }[];
  onSuccess: (updatedCount?: number) => void;
  isLoadingAgents?: boolean;
  initialAgentId?: number | null;
}

export function BulkAssignModal({
  isOpen,
  onClose,
  selectedLeadIds,
  agents,
  onSuccess,
  isLoadingAgents = false,
  initialAgentId,
}: BulkAssignModalProps) {
  const [targetAgentId, setTargetAgentId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTargetAgentId(initialAgentId ? String(initialAgentId) : '');
      setError(null);
      setSubmitting(false);
    }
  }, [isOpen, initialAgentId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAgentId) {
      setError('Please select an agent to assign');
      return;
    }

    const agentIdNum = Number(targetAgentId);
    if (!agentIdNum || isNaN(agentIdNum) || agentIdNum <= 0) {
      setError('Invalid agent selected');
      return;
    }

    if (!selectedLeadIds || selectedLeadIds.length === 0) {
      setError('Please select at least one lead to assign');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await leadAPI.bulkAssign({
        leadIds: selectedLeadIds,
        assignedTo: agentIdNum,
      });

      const updatedCount = res.data?.updated ?? selectedLeadIds.length;
      if (updatedCount === 0) {
        setError('No leads were updated. Selected lead(s) may be in terminal status (Converted/Spam) or no longer available.');
        return;
      }

      onSuccess(updatedCount);
      onClose();
    } catch (err: any) {
      const backendMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to assign leads. Please try again.';
      setError(backendMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const hasAgents = agents && agents.length > 0;
  const leadCount = selectedLeadIds.length;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-background p-6 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
              <UserCheck size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground">
                {leadCount === 1 ? 'Assign Lead to Agent' : 'Bulk Assign Leads'}
              </h3>
              <p className="text-[11px] font-medium text-muted">
                Assigning {leadCount} selected lead{leadCount === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-foreground/10 hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-400">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-foreground">
              Select Agent / Administrator
            </label>
            <div className="relative">
              <select
                value={targetAgentId}
                onChange={(e) => {
                  setTargetAgentId(e.target.value);
                  if (error) setError(null);
                }}
                disabled={submitting || isLoadingAgents || !hasAgents}
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-2.5 text-xs font-bold text-foreground focus:border-[#4a7635] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">
                  {isLoadingAgents
                    ? '-- Loading Agents... --'
                    : hasAgents
                    ? '-- Choose an Agent --'
                    : '-- No Agents Found --'}
                </option>
                {agents.map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    👤 {ag.fullName}
                  </option>
                ))}
              </select>
              {isLoadingAgents && (
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                  <Loader2 size={14} className="animate-spin text-sky-400" />
                </div>
              )}
            </div>

            {!isLoadingAgents && !hasAgents && (
              <span className="text-[11px] font-medium text-amber-400">
                No active staff agents or administrators available for assignment.
              </span>
            )}

            <span className="text-[10px] text-muted">
              Leads in terminal status (Converted/Spam) will be skipped automatically.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-2 text-xs font-bold text-muted hover:bg-foreground/10 hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !targetAgentId || isLoadingAgents || !hasAgents}
              className="flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-black text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              {submitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <UserCheck size={14} />
              )}
              <span>
                {submitting
                  ? 'Assigning...'
                  : `Assign ${leadCount} Lead${leadCount === 1 ? '' : 's'}`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
