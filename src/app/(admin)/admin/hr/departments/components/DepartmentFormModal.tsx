import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, Building2, Loader2, X } from 'lucide-react';
import type { Department } from '@/types/models/employee';
import { useDepartmentActions } from '@/hooks/hr/use-departments';
import { validateDepartmentForm, mapServerIssues } from '@/lib/validators/employee.schema';

interface DepartmentFormModalProps {
  /** null → create mode; a Department → edit mode */
  department: Department | null;
  /** Names of all existing departments (used to catch duplicate-name errors client-side) */
  existingNames: string[];
  onClose: () => void;
  onSuccess: (department: Department, mode: 'create' | 'edit') => void;
}

interface FormValues {
  name: string;
  description: string;
  isActive: boolean;
}

const inputClass = (error?: string) =>
  `text-foreground placeholder:text-muted/70 w-full rounded-xl border bg-foreground/5 px-3.5 py-2.5 text-xs font-bold focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/50 focus:outline-none ${
    error ? 'border-rose-500/50' : 'border-[var(--border-subtle)]'
  }`;

export function DepartmentFormModal({
  department,
  existingNames,
  onClose,
  onSuccess,
}: DepartmentFormModalProps) {
  const mode = department ? 'edit' : 'create';
  const { submitting, createDepartment, updateDepartment } = useDepartmentActions();

  const [values, setValues] = useState<FormValues>({
    name: department?.name ?? '',
    description: department?.description ?? '',
    isActive: department?.isActive ?? true,
  });
  const [errors, setErrors] = useState<Partial<Record<'name' | 'description', string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, submitting]);

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (key === 'name' || key === 'description') {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    // exclude current department name from duplicate check in edit mode
    const namesForCheck = mode === 'edit'
      ? existingNames.filter((n) => n !== department!.name)
      : existingNames;

    const validation = validateDepartmentForm(values, namesForCheck);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    const payload = {
      name: values.name.trim(),
      description: values.description.trim() || undefined,
      isActive: values.isActive,
    };

    let res;
    if (mode === 'create') {
      res = await createDepartment(payload);
    } else {
      res = await updateDepartment(department!.id, {
        name: values.name.trim() !== department!.name ? values.name.trim() : undefined,
        description:
          values.description.trim() !== (department!.description ?? '')
            ? values.description.trim() || null
            : undefined,
        isActive: values.isActive !== department!.isActive ? values.isActive : undefined,
      });
    }

    if (res.success && res.data) {
      onSuccess(res.data, mode);
      return;
    }
    const { fieldErrors, general } = mapServerIssues(res.error, ['name', 'description']);
    setErrors(fieldErrors as Partial<Record<'name' | 'description', string>>);
    setApiError([res.message || `Failed to ${mode} department`, ...general].join(' — '));
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        onClick={submitting ? undefined : onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
      />
      <form
        onSubmit={handleSubmit}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-labelledby="dept-form-title"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--background)] shadow-2xl"
      >
        {/* Header */}
        <div className="bg-foreground/5 flex items-center justify-between border-b border-[var(--border-subtle)] p-5">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl border border-lime-400/20 bg-lime-400/10 p-2 text-lime-400">
              <Building2 size={18} />
            </div>
            <div>
              <h3 id="dept-form-title" className="text-foreground text-sm font-black">
                {mode === 'create' ? 'Create Department' : 'Edit Department'}
              </h3>
              <p className="text-muted text-[11px] font-medium">
                {mode === 'create'
                  ? 'Add a new department for employee assignment.'
                  : `Editing "${department!.name}"`}
              </p>
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

          <div>
            <label htmlFor="dept-name" className="text-muted mb-1 block text-xs font-bold">
              Department name<span className="text-rose-400"> *</span>
            </label>
            <input
              id="dept-name"
              type="text"
              autoFocus
              value={values.name}
              maxLength={50}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Field Sales"
              className={inputClass(errors.name)}
            />
            {errors.name && (
              <p className="mt-1 text-[11px] font-bold text-rose-400">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="dept-description" className="text-muted mb-1 block text-xs font-bold">
              Description
            </label>
            <textarea
              id="dept-description"
              rows={3}
              maxLength={200}
              value={values.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Optional — what this department does"
              className={`${inputClass(errors.description)} resize-y`}
            />
            <div className="mt-1 flex items-center justify-between">
              {errors.description ? (
                <p className="text-[11px] font-bold text-rose-400">{errors.description}</p>
              ) : (
                <span />
              )}
              <span className="text-muted text-[10px] font-medium">
                {values.description.length}/200
              </span>
            </div>
          </div>

          <label className="text-foreground/90 flex cursor-pointer items-center gap-2.5 text-xs font-bold">
            <input
              type="checkbox"
              checked={values.isActive}
              onChange={(e) => set('isActive', e.target.checked)}
              className="accent-lime-400"
            />
            Active
            <span className="text-muted font-medium">(only active departments can be assigned)</span>
          </label>
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
            type="submit"
            disabled={submitting}
            className="flex items-center gap-1.5 rounded-xl bg-lime-400 px-4 py-2 text-xs font-black tracking-wider text-black uppercase hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {submitting ? 'Saving...' : mode === 'create' ? 'Create department' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}
