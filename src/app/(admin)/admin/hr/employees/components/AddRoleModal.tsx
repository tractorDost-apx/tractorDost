import React, { useState } from 'react';
import { ShieldPlus } from 'lucide-react';
import type { RoleOption } from '@/types/models/employee';
import { useCreateRole } from '@/hooks/hr/use-hr-options';
import { mapServerIssues, validateRoleForm } from '@/lib/validators/employee.schema';
import { QuickCreateDialog } from './QuickCreateDialog';

interface AddRoleModalProps {
  /** Names already loaded, upper-case as stored */
  existingNames: readonly string[];
  onClose: () => void;
  onCreated: (role: RoleOption) => void;
}

const inputClass = (error?: string) =>
  `text-foreground placeholder:text-muted/70 w-full rounded-xl border bg-foreground/5 px-3.5 py-2.5 text-xs font-bold focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/50 focus:outline-none ${
    error ? 'border-rose-500/50' : 'border-[var(--border-subtle)]'
  }`;

/** POST /roles/create without leaving the employee form */
export function AddRoleModal({ existingNames, onClose, onCreated }: AddRoleModalProps) {
  const [values, setValues] = useState({ name: '', description: '' });
  const [errors, setErrors] = useState<Partial<Record<'name' | 'description', string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const { submitting, createRole } = useCreateRole();
  const storedName = values.name.trim().toUpperCase();

  const handleSubmit = async () => {
    setApiError(null);
    const validation = validateRoleForm(values, existingNames);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    const res = await createRole({
      name: values.name.trim(),
      description: values.description.trim() || undefined,
    });
    if (res.success && res.data) {
      onCreated(res.data);
      return;
    }
    const { fieldErrors, general } = mapServerIssues(res.error, ['name', 'description']);
    setErrors(fieldErrors);
    setApiError([res.message || 'Failed to create role', ...general].join(' — '));
  };

  return (
    <QuickCreateDialog
      title="Add role"
      subtitle="Creates a new role in Access Control."
      icon={ShieldPlus}
      submitLabel="Create role"
      submitting={submitting}
      error={apiError}
      onSubmit={handleSubmit}
      onClose={onClose}
    >
      <div>
        <label htmlFor="new-role-name" className="text-muted mb-1 block text-xs font-bold">
          Role name<span className="text-rose-400"> *</span>
        </label>
        <input
          id="new-role-name"
          type="text"
          autoFocus
          value={values.name}
          maxLength={50}
          onChange={(e) => {
            setValues((prev) => ({ ...prev, name: e.target.value }));
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          placeholder="e.g. Field Agent"
          className={inputClass(errors.name)}
        />
        {errors.name ? (
          <p className="mt-1 text-[11px] font-bold text-rose-400">{errors.name}</p>
        ) : (
          storedName.length >= 2 && (
            <p className="text-muted mt-1 text-[11px] font-medium">
              Saved as <span className="text-foreground font-mono">{storedName}</span>
            </p>
          )
        )}
      </div>

      <div>
        <label htmlFor="new-role-description" className="text-muted mb-1 block text-xs font-bold">
          Description
        </label>
        <textarea
          id="new-role-description"
          rows={2}
          maxLength={200}
          value={values.description}
          onChange={(e) => {
            setValues((prev) => ({ ...prev, description: e.target.value }));
            if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
          }}
          placeholder="What this role is responsible for"
          className={`${inputClass(errors.description)} resize-y`}
        />
        {errors.description && (
          <p className="mt-1 text-[11px] font-bold text-rose-400">{errors.description}</p>
        )}
      </div>

      <p className="text-muted bg-foreground/5 rounded-xl p-3 text-[11px] font-medium">
        Module permissions for the new role are set in Access Control. Employee codes are only
        generated for roles with a configured code prefix, so until one is added on the server,
        employees with a new role need an employee code entered by hand.
      </p>
    </QuickCreateDialog>
  );
}
