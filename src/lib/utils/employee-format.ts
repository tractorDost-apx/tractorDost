import type { EmployeeSortBy, EmployeeStatus } from '@/types/models/employee';

export const EMPLOYEE_STATUS_META: Record<
  EmployeeStatus,
  { label: string; className: string; dotClassName: string }
> = {
  ACTIVE: {
    label: 'Active',
    className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    dotClassName: 'bg-emerald-400',
  },
  ON_LEAVE: {
    label: 'On Leave',
    className: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
    dotClassName: 'bg-amber-400',
  },
  INACTIVE: {
    label: 'Inactive',
    className: 'border-[var(--border-subtle)] bg-foreground/5 text-muted',
    dotClassName: 'bg-foreground/40',
  },
  TERMINATED: {
    label: 'Terminated',
    className: 'border-rose-500/20 bg-rose-500/10 text-rose-400',
    dotClassName: 'bg-rose-400',
  },
};

export const EMPLOYEE_STATUS_ORDER: EmployeeStatus[] = [
  'ACTIVE',
  'ON_LEAVE',
  'INACTIVE',
  'TERMINATED',
];

export const EMPLOYEE_SORT_OPTIONS: { value: EmployeeSortBy; label: string }[] = [
  { value: 'createdAt', label: 'Date added' },
  { value: 'joiningDate', label: 'Joining date' },
  { value: 'employeeCode', label: 'Employee code' },
  { value: 'designation', label: 'Designation' },
];

/**
 * 27 Sep 2026, for date-only columns (joining date, date of birth, ...). They are stored at UTC
 * midnight, so formatting in UTC keeps the calendar date in every time zone.
 */
export function formatEmployeeDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function employeeInitials(fullName: string | null | undefined): string {
  const parts = (fullName ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}
