import type {
  CreateEmployeeInput,
  EmployeeGender,
  EmployeeProfile,
  TerminateEmployeeInput,
  UpdatableEmployeeStatus,
  UpdateEmployeeInput,
} from '@/types/models/employee';

// Mirrors BACKEND/src/module/humanResource/employee/employee.validation.ts so most mistakes are caught
// before a request is sent. The backend stays the source of truth: its issues are mapped back onto the
// form by mapServerIssues.

export const MOBILE_RE = /^[6-9]\d{9}$/;
export const EMPLOYEE_CODE_RE = /^[A-Z0-9][A-Z0-9_-]{1,29}$/;
export const BANK_ACCOUNT_RE = /^\d{9,18}$/;
export const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;
export const PAN_RE = /^[A-Z]{5}\d{4}[A-Z]$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
// Decimal(12, 2) columns
const SALARY_MAX = 9_999_999_999.99;

export const GENDER_OPTIONS: { value: EmployeeGender; label: string }[] = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];

export const UPDATABLE_STATUS_OPTIONS: { value: UpdatableEmployeeStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_LEAVE', label: 'On Leave' },
  { value: 'INACTIVE', label: 'Inactive' },
];

/**
 * Roles the backend refuses at employee registration (NON_ASSIGNABLE_ROLES in employee.service.ts):
 * ADMIN goes through user management, CUSTOMER and DEALER are not staff roles.
 */
export const NON_ASSIGNABLE_ROLES = ['ADMIN', 'CUSTOMER', 'DEALER'];

/**
 * Why the backend would refuse to terminate this employee (terminateEmployeeService), or null.
 * Used to disable the action up front; the backend still enforces every rule.
 */
export function terminationBlockedReason(
  employee: { status: string; user: { id: number; role: { name: string } } },
  currentUserId: number | undefined
): string | null {
  if (employee.status === 'TERMINATED') return 'Already terminated';
  if (currentUserId !== undefined && employee.user.id === currentUserId) {
    return 'You cannot terminate yourself';
  }
  if (employee.user.role.name === 'ADMIN') {
    return 'Remove the ADMIN role in Users & Staff before terminating';
  }
  return null;
}

/** Every form input is held as a string; payload builders convert types */
export interface EmployeeFormValues {
  fullName: string;
  mobile: string;
  email: string;
  roleId: string;
  employeeCode: string;
  designation: string;
  status: UpdatableEmployeeStatus | '';
  departmentId: string;
  reportingManagerId: string;
  dateOfBirth: string;
  gender: EmployeeGender | '';
  address: string;
  emergencyContact: string;
  joiningDate: string;
  probationEndDate: string;
  confirmationDate: string;
  basicSalary: string;
  ctc: string;
  bankAccountNo: string;
  ifscCode: string;
  panNumber: string;
}

export type EmployeeFormField = keyof EmployeeFormValues;
export type FieldErrors = Partial<Record<EmployeeFormField, string>>;

/** Write-only in edit mode: the profile only carries masked values, so these start blank */
export const SENSITIVE_FIELDS: EmployeeFormField[] = [
  'basicSalary',
  'ctc',
  'bankAccountNo',
  'ifscCode',
  'panNumber',
];

export const emptyEmployeeForm: EmployeeFormValues = {
  fullName: '',
  mobile: '',
  email: '',
  roleId: '',
  employeeCode: '',
  designation: '',
  status: '',
  departmentId: '',
  reportingManagerId: '',
  dateOfBirth: '',
  gender: '',
  address: '',
  emergencyContact: '',
  joiningDate: '',
  probationEndDate: '',
  confirmationDate: '',
  basicSalary: '',
  ctc: '',
  bankAccountNo: '',
  ifscCode: '',
  panNumber: '',
};

/** ISO timestamp → YYYY-MM-DD. Date-only columns are stored at UTC midnight, so the UTC date is the date. */
export function toDateInput(iso: string | null | undefined): string {
  return iso ? iso.slice(0, 10) : '';
}

/** Today as YYYY-MM-DD in the viewer's time zone */
export function todayDateInput(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function isGender(value: string | null): value is EmployeeGender {
  return value === 'MALE' || value === 'FEMALE' || value === 'OTHER';
}

export function profileToForm(profile: EmployeeProfile): EmployeeFormValues {
  return {
    ...emptyEmployeeForm,
    fullName: profile.user.fullName ?? '',
    mobile: profile.user.mobile ?? '',
    email: profile.user.email ?? '',
    roleId: String(profile.user.role.id),
    employeeCode: profile.employeeCode,
    designation: profile.designation,
    status: profile.status === 'TERMINATED' ? '' : profile.status,
    departmentId: profile.departmentId ? String(profile.departmentId) : '',
    reportingManagerId: profile.reportingManagerId ? String(profile.reportingManagerId) : '',
    dateOfBirth: toDateInput(profile.dateOfBirth),
    gender: isGender(profile.gender) ? profile.gender : '',
    address: profile.address ?? '',
    emergencyContact: profile.emergencyContact ?? '',
    joiningDate: toDateInput(profile.joiningDate),
    probationEndDate: toDateInput(profile.probationEndDate),
    confirmationDate: toDateInput(profile.confirmationDate),
  };
}

function checkDate(value: string, label: string): string | undefined {
  if (!DATE_RE.test(value) || Number.isNaN(new Date(value).getTime())) {
    return `${label} must be a valid date`;
  }
  if (value < '1900-01-01' || value > '2100-12-31') return `${label} must be between 1900 and 2100`;
  return undefined;
}

function checkSalary(value: string, label: string): string | undefined {
  const amount = Number(value.replace(/,/g, ''));
  if (!Number.isFinite(amount)) return `${label} must be a number`;
  if (amount <= 0) return `${label} must be greater than 0`;
  if (amount > SALARY_MAX) return `${label} is too large`;
  if (!/^\d+(\.\d{1,2})?$/.test(value.replace(/,/g, ''))) {
    return `${label} can have at most 2 decimal places`;
  }
  return undefined;
}

/** The backend rejects encrypted-at-rest text that already looks like ciphertext */
function checkEncryptedText(value: string, label: string, max: number): string | undefined {
  if (value.length > max) return `${label} cannot exceed ${max} characters`;
  if (/^enc:/i.test(value)) return `${label} is not valid`;
  return undefined;
}

/**
 * Validate the employee form. `mode` is 'create' or 'edit'; in edit mode the immutable fields
 * (mobile, role, code) are skipped and write-only sensitive fields are only checked when filled.
 */
export function validateEmployeeForm(
  values: EmployeeFormValues,
  mode: 'create' | 'edit',
  initial?: EmployeeFormValues
): FieldErrors {
  const errors: FieldErrors = {};
  const v = (field: EmployeeFormField) => values[field].trim();

  const fullName = v('fullName');
  if (fullName.length < 2) errors.fullName = 'Full name must be at least 2 characters';
  else if (fullName.length > 100) errors.fullName = 'Full name cannot exceed 100 characters';

  const designation = v('designation');
  if (designation.length < 2) errors.designation = 'Designation must be at least 2 characters';
  else if (designation.length > 100)
    errors.designation = 'Designation cannot exceed 100 characters';

  const email = v('email');
  if (email) {
    if (!EMAIL_RE.test(email)) errors.email = 'Invalid email address';
    else if (email.length > 254) errors.email = 'Email cannot exceed 254 characters';
  } else if (mode === 'edit' && initial?.email.trim()) {
    errors.email = 'An existing email cannot be removed, only replaced';
  }

  if (mode === 'create') {
    if (!MOBILE_RE.test(v('mobile'))) errors.mobile = 'Enter a valid 10-digit Indian mobile number';
    if (!v('roleId')) errors.roleId = 'Select a role';
    // Optional: when blank the backend generates the code
    const code = v('employeeCode').toUpperCase();
    if (code && !EMPLOYEE_CODE_RE.test(code)) {
      errors.employeeCode = 'Use 2-30 letters, digits, "-" or "_", starting with a letter or digit';
    }
  }

  const joiningDate = v('joiningDate');
  if (!joiningDate) errors.joiningDate = 'Joining date is required';
  else errors.joiningDate = checkDate(joiningDate, 'Joining date');

  const dateOfBirth = v('dateOfBirth');
  if (dateOfBirth) {
    errors.dateOfBirth = checkDate(dateOfBirth, 'Date of birth');
    if (!errors.dateOfBirth && dateOfBirth >= todayDateInput()) {
      errors.dateOfBirth = 'Date of birth must be in the past';
    } else if (!errors.dateOfBirth && joiningDate && dateOfBirth >= joiningDate) {
      errors.dateOfBirth = 'Date of birth must be before the joining date';
    }
  }

  const probationEndDate = v('probationEndDate');
  if (probationEndDate) {
    errors.probationEndDate = checkDate(probationEndDate, 'Probation end date');
    if (!errors.probationEndDate && joiningDate && probationEndDate < joiningDate) {
      errors.probationEndDate = 'Probation end date cannot be before the joining date';
    }
  }

  const confirmationDate = v('confirmationDate');
  if (confirmationDate) {
    errors.confirmationDate = checkDate(confirmationDate, 'Confirmation date');
    if (!errors.confirmationDate && joiningDate && confirmationDate < joiningDate) {
      errors.confirmationDate = 'Confirmation date cannot be before the joining date';
    }
  }

  if (v('address')) errors.address = checkEncryptedText(v('address'), 'Address', 500);
  if (v('emergencyContact')) {
    errors.emergencyContact = checkEncryptedText(v('emergencyContact'), 'Emergency contact', 100);
  }

  const basicSalary = v('basicSalary');
  const ctc = v('ctc');
  if (basicSalary) errors.basicSalary = checkSalary(basicSalary, 'Basic salary');
  if (ctc) errors.ctc = checkSalary(ctc, 'CTC');
  if (basicSalary && ctc && !errors.basicSalary && !errors.ctc) {
    if (Number(ctc.replace(/,/g, '')) < Number(basicSalary.replace(/,/g, ''))) {
      errors.ctc = 'CTC cannot be less than the basic salary';
    }
  }

  if (v('bankAccountNo') && !BANK_ACCOUNT_RE.test(v('bankAccountNo'))) {
    errors.bankAccountNo = 'Bank account number must be 9-18 digits';
  }
  if (v('ifscCode') && !IFSC_RE.test(v('ifscCode').toUpperCase())) {
    errors.ifscCode = 'Invalid IFSC code (e.g. SBIN0001234)';
  }
  if (v('panNumber') && !PAN_RE.test(v('panNumber').toUpperCase())) {
    errors.panNumber = 'Invalid PAN (e.g. ABCDE1234F)';
  }

  // Drop the keys whose checks passed
  for (const key of Object.keys(errors) as EmployeeFormField[]) {
    if (!errors[key]) delete errors[key];
  }
  return errors;
}

const toAmount = (value: string) => Number(value.replace(/,/g, ''));

/** Build the strict create body: optional fields that are blank are left out entirely */
export function buildCreatePayload(values: EmployeeFormValues): CreateEmployeeInput {
  const v = (field: EmployeeFormField) => values[field].trim();
  const optional = (field: EmployeeFormField) => v(field) || undefined;

  return {
    fullName: v('fullName'),
    mobile: v('mobile'),
    email: optional('email')?.toLowerCase(),
    roleId: Number(v('roleId')),
    // Left out when blank, so the backend generates it; never generated here
    employeeCode: optional('employeeCode')?.toUpperCase(),
    designation: v('designation'),
    departmentId: v('departmentId') ? Number(v('departmentId')) : undefined,
    reportingManagerId: v('reportingManagerId') ? Number(v('reportingManagerId')) : undefined,
    dateOfBirth: optional('dateOfBirth'),
    gender: values.gender || undefined,
    address: optional('address'),
    emergencyContact: optional('emergencyContact'),
    joiningDate: v('joiningDate'),
    probationEndDate: optional('probationEndDate'),
    confirmationDate: optional('confirmationDate'),
    basicSalary: v('basicSalary') ? toAmount(v('basicSalary')) : undefined,
    ctc: v('ctc') ? toAmount(v('ctc')) : undefined,
    bankAccountNo: optional('bankAccountNo'),
    ifscCode: optional('ifscCode')?.toUpperCase(),
    panNumber: optional('panNumber')?.toUpperCase(),
  };
}

/**
 * Build the update body from what actually changed, so untouched fields are never rewritten.
 * Clearing an optional field sends null. Write-only sensitive fields are sent only when filled.
 */
export function buildUpdatePayload(
  initial: EmployeeFormValues,
  values: EmployeeFormValues
): UpdateEmployeeInput {
  const payload: UpdateEmployeeInput = {};
  const changed = (field: EmployeeFormField) => values[field].trim() !== initial[field].trim();
  const v = (field: EmployeeFormField) => values[field].trim();

  if (changed('fullName')) payload.fullName = v('fullName');
  if (changed('email') && v('email')) payload.email = v('email').toLowerCase();
  if (changed('designation')) payload.designation = v('designation');
  if (changed('status') && values.status) payload.status = values.status;
  if (changed('departmentId'))
    payload.departmentId = v('departmentId') ? Number(v('departmentId')) : null;
  if (changed('reportingManagerId')) {
    payload.reportingManagerId = v('reportingManagerId') ? Number(v('reportingManagerId')) : null;
  }
  if (changed('dateOfBirth')) payload.dateOfBirth = v('dateOfBirth') || null;
  if (changed('gender')) payload.gender = values.gender || null;
  if (changed('address')) payload.address = v('address') || null;
  if (changed('emergencyContact')) payload.emergencyContact = v('emergencyContact') || null;
  if (changed('joiningDate')) payload.joiningDate = v('joiningDate');
  if (changed('probationEndDate')) payload.probationEndDate = v('probationEndDate') || null;
  if (changed('confirmationDate')) payload.confirmationDate = v('confirmationDate') || null;

  if (v('basicSalary')) payload.basicSalary = toAmount(v('basicSalary'));
  if (v('ctc')) payload.ctc = toAmount(v('ctc'));
  if (v('bankAccountNo')) payload.bankAccountNo = v('bankAccountNo');
  if (v('ifscCode')) payload.ifscCode = v('ifscCode').toUpperCase();
  if (v('panNumber')) payload.panNumber = v('panNumber').toUpperCase();

  return payload;
}

export interface TerminationFormValues {
  terminationDate: string;
  terminationReason: string;
}

export function validateTermination(
  values: TerminationFormValues,
  joiningDate: string
): Partial<Record<keyof TerminationFormValues, string>> {
  const errors: Partial<Record<keyof TerminationFormValues, string>> = {};
  const date = values.terminationDate.trim();
  if (date) {
    const dateError = checkDate(date, 'Termination date');
    if (dateError) errors.terminationDate = dateError;
    else if (date < toDateInput(joiningDate)) {
      errors.terminationDate = 'Termination date cannot be before the joining date';
    }
  }
  const reason = values.terminationReason.trim();
  if (reason) {
    const reasonError = checkEncryptedText(reason, 'Termination reason', 500);
    if (reasonError) errors.terminationReason = reasonError;
  }
  return errors;
}

export function buildTerminatePayload(values: TerminationFormValues): TerminateEmployeeInput {
  return {
    terminationDate: values.terminationDate.trim() || undefined,
    terminationReason: values.terminationReason.trim() || undefined,
  };
}

/**
 * Turn the backend's Zod issues ({ path, message }[]) into per-field errors. Issues that do not map to
 * a known field (e.g. unrecognised keys) are returned as general messages.
 */
export function mapServerIssues(
  issues: unknown,
  knownFields: readonly string[]
): { fieldErrors: Record<string, string>; general: string[] } {
  const fieldErrors: Record<string, string> = {};
  const general: string[] = [];
  if (!Array.isArray(issues)) return { fieldErrors, general };

  for (const issue of issues) {
    if (!issue || typeof issue !== 'object') continue;
    const { path, message } = issue as { path?: unknown; message?: unknown };
    if (typeof message !== 'string') continue;
    const field = Array.isArray(path) && typeof path[0] === 'string' ? path[0] : null;
    if (field && knownFields.includes(field)) {
      fieldErrors[field] ??= message;
    } else {
      general.push(message);
    }
  }
  return { fieldErrors, general };
}

// Mirrors createRoleSchema (BACKEND foundation/roles/role.validation.ts). The backend upper-cases the name.
export function validateRoleForm(
  values: { name: string; description: string },
  existingNames: readonly string[]
): Partial<Record<'name' | 'description', string>> {
  const errors: Partial<Record<'name' | 'description', string>> = {};
  const name = values.name.trim();
  if (name.length < 2) errors.name = 'Name must be at least 2 characters';
  else if (name.length > 50) errors.name = 'Name cannot exceed 50 characters';
  else if (existingNames.includes(name.toUpperCase()))
    errors.name = 'A role with this name already exists';
  if (values.description.length > 200)
    errors.description = 'Description cannot exceed 200 characters';
  return errors;
}

// Mirrors createDepartmentSchema (BACKEND humanResource/department/department.validation.ts)
export function validateDepartmentForm(
  values: { name: string; description: string },
  existingNames: readonly string[]
): Partial<Record<'name' | 'description', string>> {
  const errors: Partial<Record<'name' | 'description', string>> = {};
  const name = values.name.trim();
  if (name.length < 2) errors.name = 'Name must be at least 2 characters';
  else if (name.length > 50) errors.name = 'Name cannot exceed 50 characters';
  // Exact match, like the database's unique index on Department.name
  else if (existingNames.includes(name)) errors.name = 'A department with this name already exists';
  if (values.description.trim().length > 200) {
    errors.description = 'Description cannot exceed 200 characters';
  }
  return errors;
}
