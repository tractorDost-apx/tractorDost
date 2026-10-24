import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import type { Department } from '@/types/models/employee';
import { useCreateDepartment } from '@/hooks/hr/use-hr-options';
import { mapServerIssues, validateDepartmentForm } from '@/lib/validators/employee.schema';
import { QuickCreateDialog } from './QuickCreateDialog';

interface AddDepartmentModalProps {
  existingNames: readonly string[];
  onClose: () => void;
  onCreated: (department: Department) => void;
}

const inputClass = (error?: string) =>
  `text-foreground placeholder:text-muted/70 w-full rounded-xl border bg-foreground/5 px-3.5 py-2.5 text-xs font-bold focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/50 focus:outline-none ${
    error ? 'border-rose-500/50' : 'border-[var(--border-subtle)]'
  }`;

/** POST /departments/create without leaving the employee form */
export function AddDepartmentModal({ existingNames, onClose, onCreated }: AddDepartmentModalProps) {
  const [values, setValues] = useState({ name: '', description: '', isActive: true });
  const [errors, setErrors] = useState<Partial<Record<'name' | 'description', string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const { submitting, createDepartment } = useCreateDepartment();

  const handleSubmit = async () => {
    setApiError(null);
    const validation = validateDepartmentForm(values, existingNames);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    const res = await createDepartment({
      name: values.name.trim(),
      description: values.description.trim() || undefined,
      isActive: values.isActive,
    });
    if (res.success && res.data) {
      onCreated(res.data);
      return;
    }
    const { fieldErrors, general } = mapServerIssues(res.error, ['name', 'description']);
    setErrors(fieldErrors);
    setApiError([res.message || 'Failed to create department', ...general].join(' — '));
  };

  return (
    <QuickCreateDialog
      title="Add department"
      subtitle="Creates a new department for employee assignment."
      icon={Building2}
      submitLabel="Create department"
      submitting={submitting}
      error={apiError}
      onSubmit={handleSubmit}
      onClose={onClose}
    >
      <div>
        <label htmlFor="new-department-name" className="text-muted mb-1 block text-xs font-bold">
          Department name<span className="text-rose-400"> *</span>
        </label>
        <input
          id="new-department-name"
          type="text"
          autoFocus
          value={values.name}
          maxLength={50}
          onChange={(e) => {
            setValues((prev) => ({ ...prev, name: e.target.value }));
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          placeholder="e.g. Field Sales"
          className={inputClass(errors.name)}
        />
        {errors.name && <p className="mt-1 text-[11px] font-bold text-rose-400">{errors.name}</p>}
      </div>

      <div>
        <label
          htmlFor="new-department-description"
          className="text-muted mb-1 block text-xs font-bold"
        >
          Description
        </label>
        <textarea
          id="new-department-description"
          rows={2}
          maxLength={200}
          value={values.description}
          onChange={(e) => {
            setValues((prev) => ({ ...prev, description: e.target.value }));
            if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
          }}
          placeholder="Optional"
          className={`${inputClass(errors.description)} resize-y`}
        />
        {errors.description && (
          <p className="mt-1 text-[11px] font-bold text-rose-400">{errors.description}</p>
        )}
      </div>

      <label className="text-foreground/90 flex cursor-pointer items-center gap-2.5 text-xs font-bold">
        <input
          type="checkbox"
          checked={values.isActive}
          onChange={(e) => setValues((prev) => ({ ...prev, isActive: e.target.checked }))}
          className="accent-lime-400"
        />
        Active
        <span className="text-muted font-medium">(only active departments can be assigned)</span>
      </label>
    </QuickCreateDialog>
  );
}
