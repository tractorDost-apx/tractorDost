import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle,
  Briefcase,
  Edit2,
  IdCard,
  Landmark,
  Info,
  Loader2,
  Lock,
  Plus,
  RotateCcw,
  UserPlus,
  UserRound,
  X,
} from 'lucide-react';
import type { Department, EmployeeProfile, RoleOption } from '@/types/models/employee';
import { useEmployee, useEmployeeActions } from '@/hooks/hr/use-employees';
import { useDepartments, useRoles } from '@/hooks/hr/use-hr-options';
import {
  GENDER_OPTIONS,
  NON_ASSIGNABLE_ROLES,
  UPDATABLE_STATUS_OPTIONS,
  buildCreatePayload,
  buildUpdatePayload,
  emptyEmployeeForm,
  mapServerIssues,
  profileToForm,
  todayDateInput,
  validateEmployeeForm,
  type EmployeeFormField,
  type EmployeeFormValues,
  type FieldErrors,
} from '@/lib/validators/employee.schema';
import { ManagerPicker, managerLabel, type ManagerOption } from './ManagerPicker';
import { AddRoleModal } from './AddRoleModal';
import { AddDepartmentModal } from './AddDepartmentModal';

interface EmployeeFormModalProps {
  mode: 'create' | 'edit';
  /** Required in edit mode */
  employeeId?: number;
  currentUserId: number | undefined;
  onClose: () => void;
  onSuccess: (employee: EmployeeProfile, mode: 'create' | 'edit') => void;
  /** Called after a department is created from the form, so page-level lists can refresh */
  onDepartmentCreated?: () => void;
}

const FORM_FIELDS = Object.keys(emptyEmployeeForm) as EmployeeFormField[];

const inputClass = (error?: string) =>
  `text-foreground placeholder:text-muted/70 w-full rounded-xl border bg-foreground/5 px-3.5 py-2.5 text-xs font-bold transition-all focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
    error ? 'border-rose-500/50' : 'border-[var(--border-subtle)]'
  }`;

function FormField({
  label,
  htmlFor,
  required,
  error,
  hint,
  className,
  action,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: React.ReactNode;
  className?: string;
  /** Rendered at the right end of the label row */
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <label htmlFor={htmlFor} className="text-muted block text-xs font-bold">
          {label}
          {required && <span className="text-rose-400"> *</span>}
        </label>
        {action}
      </div>
      {children}
      {error ? (
        <p className="mt-1 text-[11px] font-bold text-rose-400" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-muted mt-1 text-[11px] font-medium">{hint}</p>
      ) : null}
    </div>
  );
}

function ReadOnlyField({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <span className="text-muted mb-1 flex items-center gap-1 text-xs font-bold">
        <Lock size={10} /> {label}
      </span>
      <div className="text-foreground/80 bg-foreground/[0.02] rounded-xl border border-dashed border-[var(--border-subtle)] px-3.5 py-2.5 font-mono text-xs font-bold">
        {value || '—'}
      </div>
      {hint && <p className="text-muted mt-1 text-[11px] font-medium">{hint}</p>}
    </div>
  );
}

function AddOptionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 rounded-lg border border-lime-400/30 bg-lime-400/10 px-2 py-0.5 text-[10px] font-black tracking-wider text-lime-400 uppercase transition-colors hover:bg-lime-400/20"
    >
      <Plus size={11} className="stroke-[3]" />
      {label}
    </button>
  );
}

/** Upsert by id, keeping the list sorted by name */
function mergeById<T extends { id: number; name: string }>(list: T[], extra: T[]): T[] {
  const byId = new Map(list.map((item) => [item.id, item]));
  for (const item of extra) if (!byId.has(item.id)) byId.set(item.id, item);
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

// Thrown by generateEmployeeCode for roles without a code prefix (BACKEND employee.service.ts)
const NO_ROLE_CODE_RE = /^No employee code is configured for role /;

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <h3 className="flex items-center gap-2 text-xs font-black tracking-wider text-lime-400 uppercase">
      <Icon size={14} /> {children}
    </h3>
  );
}

interface EmployeeFormProps {
  mode: 'create' | 'edit';
  profile: EmployeeProfile | null;
  roles: RoleOption[] | null;
  rolesLoading: boolean;
  rolesError: string | null;
  onRolesReload: () => void;
  departments: Department[] | null;
  departmentsLoading: boolean;
  departmentsError: string | null;
  onDepartmentsReload: () => void;
  currentUserId: number | undefined;
  onClose: () => void;
  onSuccess: (employee: EmployeeProfile, mode: 'create' | 'edit') => void;
}

function EmployeeForm({
  mode,
  profile,
  roles,
  rolesLoading,
  rolesError,
  onRolesReload,
  departments,
  departmentsLoading,
  departmentsError,
  onDepartmentsReload,
  currentUserId,
  onClose,
  onSuccess,
}: EmployeeFormProps) {
  const initial = useMemo<EmployeeFormValues>(
    () =>
      profile ? profileToForm(profile) : { ...emptyEmployeeForm, joiningDate: todayDateInput() },
    [profile]
  );
  const [values, setValues] = useState<EmployeeFormValues>(initial);
  const [manager, setManager] = useState<ManagerOption | null>(
    profile?.reportingManager
      ? {
          id: profile.reportingManager.id,
          label: managerLabel(
            profile.reportingManager.fullName,
            profile.reportingManager.employeeCode
          ),
        }
      : null
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [generalIssues, setGeneralIssues] = useState<string[]>([]);
  const { submitting, createEmployee, updateEmployee } = useEmployeeActions();
  // Created from this form; kept until the reloaded lists include them so they are selectable at once
  const [createdRoles, setCreatedRoles] = useState<RoleOption[]>([]);
  const [createdDepartments, setCreatedDepartments] = useState<Department[]>([]);
  const [quickCreate, setQuickCreate] = useState<'role' | 'department' | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isEdit = mode === 'edit' && profile !== null;
  const isSelf = isEdit && profile.user.id === currentUserId;
  const isTerminated = isEdit && profile.status === 'TERMINATED';

  const set =
    (field: EmployeeFormField) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { value } = e.target;
      setValues((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const allRoles = mergeById(roles ?? [], createdRoles);
  const allDepartments = mergeById(departments ?? [], createdDepartments);
  const assignableRoles = allRoles.filter((r) => !NON_ASSIGNABLE_ROLES.includes(r.name));
  // Inactive departments are refused on assignment; an employee's current one stays listed in edit mode
  const departmentOptions = allDepartments.filter(
    (d) => d.isActive || (isEdit && d.id === profile.departmentId)
  );

  const handleRoleCreated = (role: RoleOption) => {
    setQuickCreate(null);
    setCreatedRoles((prev) => [...prev, role]);
    onRolesReload();
    if (NON_ASSIGNABLE_ROLES.includes(role.name)) {
      setNotice(
        `Role ${role.name} was created, but it cannot be assigned through employee registration.`
      );
      return;
    }
    setValues((prev) => ({ ...prev, roleId: String(role.id) }));
    setErrors((prev) => ({ ...prev, roleId: undefined }));
    setNotice(`Role ${role.name} was created and selected.`);
  };

  const handleDepartmentCreated = (department: Department) => {
    setQuickCreate(null);
    setCreatedDepartments((prev) => [...prev, department]);
    onDepartmentsReload();
    if (!department.isActive) {
      setNotice(
        `Department ${department.name} was created as inactive, so it cannot be assigned yet.`
      );
      return;
    }
    setValues((prev) => ({ ...prev, departmentId: String(department.id) }));
    setErrors((prev) => ({ ...prev, departmentId: undefined }));
    setNotice(`Department ${department.name} was created and selected.`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setApiError(null);
    setGeneralIssues([]);

    const formValues = { ...values, reportingManagerId: manager ? String(manager.id) : '' };
    const validation = validateEmployeeForm(formValues, mode, initial);
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      setApiError('Please fix the highlighted fields.');
      return;
    }

    let res;
    if (isEdit) {
      const payload = buildUpdatePayload(initial, formValues);
      if (Object.keys(payload).length === 0) {
        setApiError('No changes to save.');
        return;
      }
      res = await updateEmployee(profile.id, payload);
    } else {
      res = await createEmployee(buildCreatePayload(formValues));
    }

    if (res.success && res.data) {
      onSuccess(res.data, mode);
      return;
    }
    const { fieldErrors, general } = mapServerIssues(res.error, FORM_FIELDS);
    if (NO_ROLE_CODE_RE.test(res.message)) {
      fieldErrors.employeeCode = `${res.message}. Enter an employee code to register this employee.`;
    }
    setErrors(fieldErrors as FieldErrors);
    setGeneralIssues(general);
    setNotice(null);
    setApiError(res.message || 'Request failed');
  };

  const maskedHint = (current: string | null) =>
    current
      ? `Current: ${current}. Leave blank to keep it.`
      : 'Not set. Leave blank to keep it empty.';

  return (
    <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-7 overflow-y-auto p-5 sm:p-6">
        {apiError && (
          <div
            className="flex items-start gap-2.5 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-bold text-rose-400"
            role="alert"
          >
            <AlertCircle size={16} className="mt-px shrink-0" />
            <div>
              <p>{apiError}</p>
              {generalIssues.length > 0 && (
                <ul className="mt-1 list-disc pl-4 font-medium">
                  {generalIssues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {notice && (
          <div
            className="flex items-center gap-2.5 rounded-2xl border border-lime-400/20 bg-lime-400/10 p-3 text-xs font-bold text-lime-400"
            role="status"
          >
            <Info size={15} className="shrink-0" />
            <p className="flex-1">{notice}</p>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="rounded-lg p-0.5 hover:bg-lime-400/20"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Account */}
        <section className="space-y-3">
          <SectionTitle icon={UserRound}>Account</SectionTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Full name" htmlFor="emp-fullName" required error={errors.fullName}>
              <input
                id="emp-fullName"
                type="text"
                value={values.fullName}
                onChange={set('fullName')}
                maxLength={100}
                autoComplete="off"
                placeholder="e.g. Ravi Kumar"
                className={inputClass(errors.fullName)}
              />
            </FormField>

            {isEdit ? (
              <ReadOnlyField
                label="Mobile number"
                value={profile.user.mobile ?? ''}
                hint="The login mobile cannot be changed here."
              />
            ) : (
              <FormField
                label="Mobile number"
                htmlFor="emp-mobile"
                required
                error={errors.mobile}
                hint="Used to sign in. Must not belong to an existing account."
              >
                <input
                  id="emp-mobile"
                  type="tel"
                  inputMode="numeric"
                  value={values.mobile}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setValues((prev) => ({ ...prev, mobile: digits }));
                    if (errors.mobile) setErrors((prev) => ({ ...prev, mobile: undefined }));
                  }}
                  autoComplete="off"
                  placeholder="10-digit mobile"
                  className={inputClass(errors.mobile)}
                />
              </FormField>
            )}

            <FormField
              label="Email"
              htmlFor="emp-email"
              error={errors.email}
              hint={isEdit ? 'Changing it marks the email as unverified.' : undefined}
            >
              <input
                id="emp-email"
                type="email"
                value={values.email}
                onChange={set('email')}
                maxLength={254}
                autoComplete="off"
                placeholder="name@company.com"
                className={inputClass(errors.email)}
              />
            </FormField>

            {isEdit ? (
              <ReadOnlyField
                label="Role"
                value={profile.user.role.name}
                hint="Roles are changed from Users & Staff, not the employee record."
              />
            ) : (
              <FormField
                label="Role"
                htmlFor="emp-role"
                required
                error={errors.roleId ?? (rolesError && !roles ? rolesError : undefined)}
                hint="ADMIN, CUSTOMER and DEALER cannot be assigned through employee registration."
                action={<AddOptionButton label="Add Role" onClick={() => setQuickCreate('role')} />}
              >
                <select
                  id="emp-role"
                  value={values.roleId}
                  onChange={set('roleId')}
                  disabled={rolesLoading && !roles}
                  className={inputClass(errors.roleId)}
                >
                  <option value="">
                    {rolesLoading && !roles
                      ? 'Loading roles...'
                      : assignableRoles.length === 0
                        ? 'No assignable staff roles'
                        : 'Select a role'}
                  </option>
                  {assignableRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </FormField>
            )}
          </div>
        </section>

        {/* Employment */}
        <section className="space-y-3">
          <SectionTitle icon={Briefcase}>Employment</SectionTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {isEdit ? (
              <ReadOnlyField
                label="Employee code"
                value={profile.employeeCode}
                hint="Permanent identifier; it cannot be changed."
              />
            ) : (
              <FormField
                label="Employee code"
                htmlFor="emp-code"
                error={errors.employeeCode}
                hint="Leave blank to have one generated (EMP-MM-YY-role-ID). If entered: 2-30 letters, digits, - or _. It cannot be changed later."
              >
                <input
                  id="emp-code"
                  type="text"
                  value={values.employeeCode}
                  onChange={(e) => {
                    setValues((prev) => ({ ...prev, employeeCode: e.target.value.toUpperCase() }));
                    if (errors.employeeCode)
                      setErrors((prev) => ({ ...prev, employeeCode: undefined }));
                  }}
                  maxLength={30}
                  autoComplete="off"
                  placeholder="Auto-generated if left blank"
                  className={`${inputClass(errors.employeeCode)} font-mono`}
                />
              </FormField>
            )}

            <FormField
              label="Designation"
              htmlFor="emp-designation"
              required
              error={errors.designation}
            >
              <input
                id="emp-designation"
                type="text"
                value={values.designation}
                onChange={set('designation')}
                maxLength={100}
                placeholder="e.g. Field Sales Executive"
                className={inputClass(errors.designation)}
              />
            </FormField>

            <FormField
              label="Department"
              htmlFor="emp-department"
              error={
                errors.departmentId ??
                (departmentsError && !departments ? departmentsError : undefined)
              }
              hint="Only active departments can be assigned."
              action={
                <AddOptionButton
                  label="Add Department"
                  onClick={() => setQuickCreate('department')}
                />
              }
            >
              <select
                id="emp-department"
                value={values.departmentId}
                onChange={set('departmentId')}
                disabled={departmentsLoading && !departments}
                className={inputClass(errors.departmentId)}
              >
                <option value="">
                  {departmentsLoading && !departments ? 'Loading departments...' : 'No department'}
                </option>
                {departmentOptions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                    {d.isActive ? '' : ' (inactive)'}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Reporting manager" error={errors.reportingManagerId}>
              <ManagerPicker
                value={manager}
                onChange={(next) => {
                  setManager(next);
                  if (errors.reportingManagerId) {
                    setErrors((prev) => ({ ...prev, reportingManagerId: undefined }));
                  }
                }}
                excludeEmployeeId={isEdit ? profile.id : undefined}
                error={errors.reportingManagerId}
              />
            </FormField>

            {isEdit && (
              <FormField
                label="Employment status"
                htmlFor="emp-status"
                error={errors.status}
                hint={
                  isTerminated
                    ? 'Terminated employees cannot change status.'
                    : isSelf
                      ? 'You cannot change your own status.'
                      : 'Use Terminate to end employment.'
                }
              >
                <select
                  id="emp-status"
                  value={values.status}
                  onChange={set('status')}
                  disabled={isTerminated || isSelf}
                  className={inputClass(errors.status)}
                >
                  {isTerminated && <option value="">Terminated</option>}
                  {UPDATABLE_STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </FormField>
            )}

            <FormField
              label="Joining date"
              htmlFor="emp-joining"
              required
              error={errors.joiningDate}
            >
              <input
                id="emp-joining"
                type="date"
                value={values.joiningDate}
                onChange={set('joiningDate')}
                min="1900-01-01"
                max="2100-12-31"
                className={inputClass(errors.joiningDate)}
              />
            </FormField>

            <FormField
              label="Probation end date"
              htmlFor="emp-probation"
              error={errors.probationEndDate}
            >
              <input
                id="emp-probation"
                type="date"
                value={values.probationEndDate}
                onChange={set('probationEndDate')}
                min={values.joiningDate || '1900-01-01'}
                max="2100-12-31"
                className={inputClass(errors.probationEndDate)}
              />
            </FormField>

            <FormField
              label="Confirmation date"
              htmlFor="emp-confirmation"
              error={errors.confirmationDate}
            >
              <input
                id="emp-confirmation"
                type="date"
                value={values.confirmationDate}
                onChange={set('confirmationDate')}
                min={values.joiningDate || '1900-01-01'}
                max="2100-12-31"
                className={inputClass(errors.confirmationDate)}
              />
            </FormField>
          </div>
        </section>

        {/* Personal */}
        <section className="space-y-3">
          <SectionTitle icon={IdCard}>Personal details</SectionTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Date of birth" htmlFor="emp-dob" error={errors.dateOfBirth}>
              <input
                id="emp-dob"
                type="date"
                value={values.dateOfBirth}
                onChange={set('dateOfBirth')}
                min="1900-01-01"
                max={todayDateInput()}
                className={inputClass(errors.dateOfBirth)}
              />
            </FormField>

            <FormField label="Gender" htmlFor="emp-gender" error={errors.gender}>
              <select
                id="emp-gender"
                value={values.gender}
                onChange={set('gender')}
                className={inputClass(errors.gender)}
              >
                <option value="">Not specified</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Emergency contact"
              htmlFor="emp-emergency"
              error={errors.emergencyContact}
            >
              <input
                id="emp-emergency"
                type="text"
                value={values.emergencyContact}
                onChange={set('emergencyContact')}
                maxLength={100}
                autoComplete="off"
                placeholder="Name and phone number"
                className={inputClass(errors.emergencyContact)}
              />
            </FormField>

            <FormField
              label="Address"
              htmlFor="emp-address"
              error={errors.address}
              className="sm:col-span-2"
            >
              <textarea
                id="emp-address"
                value={values.address}
                onChange={set('address')}
                maxLength={500}
                rows={2}
                autoComplete="off"
                placeholder="Residential address"
                className={`${inputClass(errors.address)} resize-y`}
              />
            </FormField>
          </div>
        </section>

        {/* Compensation & bank */}
        <section className="space-y-3">
          <SectionTitle icon={Landmark}>Compensation &amp; bank</SectionTitle>
          {isEdit && (
            <p className="text-muted text-[11px] font-medium">
              These values are confidential and are only shown masked. Fill a field to replace it;
              blank fields keep their current value.
            </p>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Basic salary (₹ / month)"
              htmlFor="emp-basic"
              error={errors.basicSalary}
              hint={isSelf ? 'You cannot change your own compensation.' : undefined}
            >
              <input
                id="emp-basic"
                type="text"
                inputMode="decimal"
                value={values.basicSalary}
                onChange={set('basicSalary')}
                disabled={isSelf}
                autoComplete="off"
                placeholder={isEdit ? 'Leave blank to keep current' : 'e.g. 25000'}
                className={inputClass(errors.basicSalary)}
              />
            </FormField>

            <FormField
              label="CTC (₹ / year)"
              htmlFor="emp-ctc"
              error={errors.ctc}
              hint={
                isSelf
                  ? 'You cannot change your own compensation.'
                  : 'Cannot be less than basic salary.'
              }
            >
              <input
                id="emp-ctc"
                type="text"
                inputMode="decimal"
                value={values.ctc}
                onChange={set('ctc')}
                disabled={isSelf}
                autoComplete="off"
                placeholder={isEdit ? 'Leave blank to keep current' : 'e.g. 360000'}
                className={inputClass(errors.ctc)}
              />
            </FormField>

            <FormField
              label="Bank account number"
              htmlFor="emp-bank"
              error={errors.bankAccountNo}
              hint={isEdit ? maskedHint(profile.bankAccountNo) : '9-18 digits'}
            >
              <input
                id="emp-bank"
                type="text"
                inputMode="numeric"
                value={values.bankAccountNo}
                onChange={set('bankAccountNo')}
                maxLength={18}
                autoComplete="off"
                className={inputClass(errors.bankAccountNo)}
              />
            </FormField>

            <FormField
              label="IFSC code"
              htmlFor="emp-ifsc"
              error={errors.ifscCode}
              hint={isEdit ? maskedHint(profile.ifscCode) : 'e.g. SBIN0001234'}
            >
              <input
                id="emp-ifsc"
                type="text"
                value={values.ifscCode}
                onChange={(e) => {
                  setValues((prev) => ({ ...prev, ifscCode: e.target.value.toUpperCase() }));
                  if (errors.ifscCode) setErrors((prev) => ({ ...prev, ifscCode: undefined }));
                }}
                maxLength={11}
                autoComplete="off"
                className={`${inputClass(errors.ifscCode)} font-mono`}
              />
            </FormField>

            <FormField
              label="PAN"
              htmlFor="emp-pan"
              error={errors.panNumber}
              hint={isEdit ? maskedHint(profile.panNumber) : 'e.g. ABCDE1234F'}
            >
              <input
                id="emp-pan"
                type="text"
                value={values.panNumber}
                onChange={(e) => {
                  setValues((prev) => ({ ...prev, panNumber: e.target.value.toUpperCase() }));
                  if (errors.panNumber) setErrors((prev) => ({ ...prev, panNumber: undefined }));
                }}
                maxLength={10}
                autoComplete="off"
                className={`${inputClass(errors.panNumber)} font-mono`}
              />
            </FormField>
          </div>
        </section>
      </div>

      <div className="bg-foreground/5 flex shrink-0 flex-col-reverse gap-2 border-t border-[var(--border-subtle)] p-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="text-muted hover:text-foreground bg-foreground/5 hover:bg-foreground/10 rounded-xl border border-[var(--border-subtle)] px-5 py-2.5 text-xs font-bold transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || (!isEdit && assignableRoles.length === 0)}
          className="flex items-center justify-center gap-2 rounded-xl bg-lime-400 px-5 py-2.5 text-xs font-black tracking-wider text-black uppercase transition-colors hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Register employee'}
        </button>
      </div>

      {/* Rendered here so the employee form keeps every entered value while these are open */}
      {quickCreate === 'role' && (
        <AddRoleModal
          existingNames={allRoles.map((r) => r.name)}
          onClose={() => setQuickCreate(null)}
          onCreated={handleRoleCreated}
        />
      )}
      {quickCreate === 'department' && (
        <AddDepartmentModal
          existingNames={allDepartments.map((d) => d.name)}
          onClose={() => setQuickCreate(null)}
          onCreated={handleDepartmentCreated}
        />
      )}
    </form>
  );
}

export function EmployeeFormModal({
  mode,
  employeeId,
  currentUserId,
  onClose,
  onSuccess,
  onDepartmentCreated,
}: EmployeeFormModalProps) {
  const isEdit = mode === 'edit';
  const profileQuery = useEmployee(isEdit && employeeId !== undefined ? employeeId : null);
  const rolesQuery = useRoles();
  const departmentsQuery = useDepartments();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  const profile = isEdit ? profileQuery.data : null;
  const title = isEdit
    ? `Edit employee${profile ? ` — ${profile.user.fullName ?? profile.employeeCode}` : ''}`
    : 'Register new employee';

  return createPortal(
    <div
      className="animate-fade-in fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 backdrop-blur-md sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="employee-form-title"
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--background)] shadow-2xl"
      >
        <div className="bg-foreground/5 flex shrink-0 items-center justify-between gap-3 border-b border-[var(--border-subtle)] p-5 sm:p-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="shrink-0 rounded-2xl border border-lime-400/20 bg-lime-400/10 p-2.5 text-lime-400">
              {isEdit ? <Edit2 size={20} /> : <UserPlus size={20} />}
            </div>
            <div className="min-w-0">
              <h2
                id="employee-form-title"
                className="text-foreground truncate text-lg font-black tracking-tight sm:text-xl"
              >
                {title}
              </h2>
              <p className="text-muted mt-0.5 text-xs font-medium">
                {isEdit
                  ? 'Only the fields you change are sent. Fields marked with a lock cannot be edited.'
                  : 'Creates the login account and the employee record together. Fields marked * are required.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-foreground hover:bg-foreground/10 shrink-0 rounded-xl p-2 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {isEdit && !profile ? (
          profileQuery.error ? (
            <div className="flex flex-col items-center gap-3 p-10 text-center">
              <AlertCircle size={28} className="text-rose-400" />
              <p className="text-sm font-bold text-rose-400">{profileQuery.error}</p>
              <button
                type="button"
                onClick={profileQuery.reload}
                className="bg-foreground/5 text-foreground flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-xs font-bold hover:border-lime-400/40"
              >
                <RotateCcw size={14} /> Try again
              </button>
            </div>
          ) : (
            <div className="space-y-3 p-6" aria-busy="true">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-foreground/5 h-12 animate-pulse rounded-xl" />
              ))}
            </div>
          )
        ) : (
          <EmployeeForm
            mode={mode}
            profile={profile}
            roles={rolesQuery.data}
            rolesLoading={rolesQuery.loading}
            rolesError={rolesQuery.error}
            onRolesReload={rolesQuery.reload}
            departments={departmentsQuery.data}
            departmentsLoading={departmentsQuery.loading}
            departmentsError={departmentsQuery.error}
            onDepartmentsReload={() => {
              departmentsQuery.reload();
              onDepartmentCreated?.();
            }}
            currentUserId={currentUserId}
            onClose={onClose}
            onSuccess={onSuccess}
          />
        )}
      </div>
    </div>,
    document.body
  );
}
