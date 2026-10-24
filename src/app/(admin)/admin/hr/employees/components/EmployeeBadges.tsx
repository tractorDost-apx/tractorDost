import React from 'react';
import { ShieldCheck } from 'lucide-react';
import type { EmployeeStatus } from '@/types/models/employee';
import { EMPLOYEE_STATUS_META } from '@/lib/utils/employee-format';

export function EmployeeStatusBadge({ status }: { status: EmployeeStatus }) {
  const meta = EMPLOYEE_STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-[10px] font-black tracking-wider uppercase ${meta.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClassName}`} />
      {meta.label}
    </span>
  );
}

export function EmployeeRoleBadge({ role }: { role: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg border border-lime-400/20 bg-lime-400/10 px-2 py-0.5 text-[10px] font-black tracking-wider text-lime-400 uppercase">
      <ShieldCheck size={10} />
      {role.replace(/_/g, ' ')}
    </span>
  );
}

/** Shown when the linked login account has been deactivated */
export function AccountDisabledBadge() {
  return (
    <span
      className="inline-flex items-center rounded-lg border border-rose-500/20 bg-rose-500/10 px-1.5 py-0.5 text-[9px] font-bold text-rose-400"
      title="This employee's login account is deactivated"
    >
      Login disabled
    </span>
  );
}
