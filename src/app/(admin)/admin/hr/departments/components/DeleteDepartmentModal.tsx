import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, AlertTriangle, Loader2, Trash2, Users, X } from 'lucide-react';
import type { Department } from '@/types/models/employee';
import { useDepartmentActions } from '@/hooks/hr/use-departments';

interface DeleteDepartmentModalProps {
  department: Department;
  onClose: () => void;
  onSuccess: (department: Department) => void;
}

export function DeleteDepartmentModal({
  department,
  onClose,
  onSuccess,
}: DeleteDepartmentModalProps) {
  const { submitting, deleteDepartment } = useDepartmentActions();
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, submitting]);

  const handleDelete = async () => {
    setApiError(null);
    const res = await deleteDepartment(department.id);
    if (res.success && res.data) {
      onSuccess(res.data);
      return;
    }
    setApiError(res.message || 'Failed to delete department');
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        onClick={submitting ? undefined : onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dept-title"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--background)] shadow-2xl"
      >
        {/* Header */}
        <div className="bg-foreground/5 flex items-center justify-between border-b border-[var(--border-subtle)] p-5">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-rose-400">
              <Trash2 size={18} />
            </div>
            <div>
              <h3 id="delete-dept-title" className="text-foreground text-sm font-black">
                Delete Department
              </h3>
              <p className="text-muted text-[11px] font-medium">This action cannot be undone.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-muted hover:text-foreground hover:bg-foreground/10 rounded-lg p-1.5 disabled:opacity-50"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 p-5">
          {apiError && (
            <div
              className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-400"
              role="alert"
            >
              <AlertCircle size={15} className="mt-px shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          <p className="text-foreground/90 text-sm font-medium">
            Are you sure you want to delete{' '}
            <span className="font-black">{department.name}</span>?
          </p>

          {department._count.employees > 0 && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
              <AlertTriangle size={16} className="mt-px shrink-0 text-amber-400" />
              <div>
                <p className="text-amber-400 text-xs font-black">
                  {department._count.employees} employee
                  {department._count.employees !== 1 ? 's' : ''} assigned
                </p>
                <p className="text-amber-400/80 mt-0.5 text-[11px] font-medium">
                  Their department assignment will be cleared but they will not be removed.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2.5">
            <Users size={14} className="text-muted shrink-0" />
            <span className="text-foreground/90 text-xs font-bold">
              {department._count.employees} employee
              {department._count.employees !== 1 ? 's' : ''} currently assigned
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-foreground/5 flex justify-end gap-2 border-t border-[var(--border-subtle)] p-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-muted hover:text-foreground bg-foreground/5 hover:bg-foreground/10 rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-xs font-bold disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={submitting}
            className="flex items-center gap-1.5 rounded-xl bg-rose-500 px-4 py-2 text-xs font-black tracking-wider text-white uppercase hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {submitting ? 'Deleting...' : 'Delete department'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
