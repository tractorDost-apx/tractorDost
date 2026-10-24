import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Loader2, UserX, X } from 'lucide-react';
import type { EmployeeProfile } from '@/types/models/employee';
import { useEmployeeActions } from '@/hooks/hr/use-employees';
import {
  buildTerminatePayload,
  mapServerIssues,
  toDateInput,
  validateTermination,
  type TerminationFormValues,
} from '@/lib/validators/employee.schema';
import { formatEmployeeDate } from '@/lib/utils/employee-format';

export interface TerminationTarget {
  id: number;
  employeeCode: string;
  fullName: string | null;
  joiningDate: string;
}

interface TerminateEmployeeModalProps {
  employee: TerminationTarget;
  onClose: () => void;
  onSuccess: (employee: EmployeeProfile) => void;
}

export function TerminateEmployeeModal({
  employee,
  onClose,
  onSuccess,
}: TerminateEmployeeModalProps) {
  const [values, setValues] = useState<TerminationFormValues>({
    terminationDate: '',
    terminationReason: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof TerminationFormValues, string>>>({});
  const [acknowledged, setAcknowledged] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { submitting, terminateEmployee } = useEmployeeActions();
  const name = employee.fullName ?? 'this employee';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, submitting]);

  const handleTerminate = async () => {
    if (submitting || !acknowledged) return;
    setApiError(null);
    const validation = validateTermination(values, employee.joiningDate);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    const res = await terminateEmployee(employee.id, buildTerminatePayload(values));
    if (res.success && res.data) {
      onSuccess(res.data);
      return;
    }
    const { fieldErrors, general } = mapServerIssues(res.error, [
      'terminationDate',
      'terminationReason',
    ]);
    setErrors(fieldErrors);
    setApiError([res.message || 'Failed to terminate employee', ...general].join(' — '));
  };

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div
        onClick={submitting ? undefined : onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="terminate-title"
        aria-describedby="terminate-description"
        className="bg-background animate-in fade-in zoom-in-95 relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-rose-500/30 p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 id="terminate-title" className="text-foreground text-sm font-black">
                Terminate employee
              </h3>
              <p className="text-muted text-[11px] font-medium">
                {name} · <span className="font-mono">{employee.employeeCode}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-muted hover:bg-foreground/10 hover:text-foreground rounded-lg p-1.5 disabled:opacity-50"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div
          id="terminate-description"
          className="text-foreground/90 mt-4 space-y-2 text-xs font-medium"
        >
          <p>
            Terminating <strong className="text-foreground">{name}</strong> will:
          </p>
          <ul className="text-foreground/80 list-disc space-y-1 pl-5">
            <li>set their employment status to Terminated, which cannot be reversed here;</li>
            <li>deactivate their login account and sign them out of every session.</li>
          </ul>
          <p className="text-muted">
            Their employee record is kept for HR retention; nothing is deleted.
          </p>
        </div>

        {apiError && (
          <div
            className="mt-4 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-400"
            role="alert"
          >
            <AlertTriangle size={15} className="mt-px shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="termination-date" className="text-muted mb-1 block text-xs font-bold">
              Termination date
            </label>
            <input
              id="termination-date"
              type="date"
              value={values.terminationDate}
              min={toDateInput(employee.joiningDate)}
              max="2100-12-31"
              onChange={(e) => setValues((prev) => ({ ...prev, terminationDate: e.target.value }))}
              className={`text-foreground bg-foreground/5 w-full rounded-xl border px-3.5 py-2.5 text-xs font-bold focus:border-rose-400/50 focus:outline-none ${
                errors.terminationDate ? 'border-rose-500/50' : 'border-[var(--border-subtle)]'
              }`}
            />
            {errors.terminationDate ? (
              <p className="mt-1 text-[11px] font-bold text-rose-400">{errors.terminationDate}</p>
            ) : (
              <p className="text-muted mt-1 text-[11px] font-medium">
                Leave blank for today (or the joining date,{' '}
                {formatEmployeeDate(employee.joiningDate)}, if they have not joined yet).
              </p>
            )}
          </div>

          <div>
            <label htmlFor="termination-reason" className="text-muted mb-1 block text-xs font-bold">
              Reason
            </label>
            <textarea
              id="termination-reason"
              rows={3}
              maxLength={500}
              value={values.terminationReason}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, terminationReason: e.target.value }))
              }
              placeholder="Optional. Stored encrypted."
              className={`text-foreground bg-foreground/5 w-full resize-y rounded-xl border px-3.5 py-2.5 text-xs font-bold focus:border-rose-400/50 focus:outline-none ${
                errors.terminationReason ? 'border-rose-500/50' : 'border-[var(--border-subtle)]'
              }`}
            />
            {errors.terminationReason && (
              <p className="mt-1 text-[11px] font-bold text-rose-400">{errors.terminationReason}</p>
            )}
          </div>

          <label className="flex cursor-pointer items-start gap-2.5 rounded-xl bg-rose-500/10 p-3 text-[11px] font-bold text-rose-300">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 accent-rose-500"
            />
            I understand that {name} will lose access immediately and this cannot be undone from
            this page.
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="bg-foreground/5 text-muted hover:bg-foreground/10 hover:text-foreground rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-xs font-bold disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleTerminate}
            disabled={submitting || !acknowledged}
            className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-black text-white hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <UserX size={14} />}
            <span>{submitting ? 'Terminating...' : 'Terminate employee'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
