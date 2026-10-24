import React from 'react';
import { Building2, CheckCircle2, Clock, PauseCircle, UserX, UsersRound } from 'lucide-react';
import type { Department, EmployeeStatus } from '@/types/models/employee';
import type { EmployeeStats } from '@/hooks/hr/use-employees';

interface EmployeeStatsCardsProps {
  stats: EmployeeStats | null;
  statsLoading: boolean;
  statsError: string | null;
  departments: Department[] | null;
  activeStatus: EmployeeStatus | '';
  activeDepartmentId: number | null;
  onStatusSelect: (status: EmployeeStatus | '') => void;
  onDepartmentSelect: (departmentId: number | null) => void;
}

const STATUS_CARDS: {
  status: EmployeeStatus | '';
  label: string;
  icon: React.ElementType;
  iconClassName: string;
}[] = [
  {
    status: '',
    label: 'Total Employees',
    icon: UsersRound,
    iconClassName: 'bg-lime-400/10 text-lime-400',
  },
  {
    status: 'ACTIVE',
    label: 'Active',
    icon: CheckCircle2,
    iconClassName: 'bg-emerald-500/10 text-emerald-400',
  },
  {
    status: 'ON_LEAVE',
    label: 'On Leave',
    icon: Clock,
    iconClassName: 'bg-amber-500/10 text-amber-400',
  },
  {
    status: 'INACTIVE',
    label: 'Inactive',
    icon: PauseCircle,
    iconClassName: 'bg-foreground/10 text-muted',
  },
  {
    status: 'TERMINATED',
    label: 'Terminated',
    icon: UserX,
    iconClassName: 'bg-rose-500/10 text-rose-400',
  },
];

export function EmployeeStatsCards({
  stats,
  statsLoading,
  statsError,
  departments,
  activeStatus,
  activeDepartmentId,
  onStatusSelect,
  onDepartmentSelect,
}: EmployeeStatsCardsProps) {
  // Department counts include every employee record (any status); an employee has at most one department
  const assignedCount = departments?.reduce((sum, d) => sum + d._count.employees, 0) ?? 0;
  const unassignedCount = stats && departments ? Math.max(0, stats.total - assignedCount) : null;
  const departmentsWithStaff = (departments ?? [])
    .filter((d) => d._count.employees > 0)
    .sort((a, b) => b._count.employees - a._count.employees);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        {STATUS_CARDS.map(({ status, label, icon: Icon, iconClassName }) => {
          const value = stats ? (status ? stats.byStatus[status] : stats.total) : null;
          const isSelected = activeStatus === status && status !== '';
          return (
            <button
              key={label}
              type="button"
              onClick={() => onStatusSelect(isSelected ? '' : status)}
              className={`glass-panel flex items-center gap-3 rounded-2xl p-4 text-left transition-all hover:-translate-y-0.5 hover:border-lime-400/30 ${
                isSelected ? 'border-lime-400/40 ring-1 ring-lime-400/40' : ''
              } ${status === '' ? 'col-span-2 lg:col-span-1' : ''}`}
              title={status ? `Show ${label.toLowerCase()} employees` : 'Show all employees'}
            >
              <div className={`shrink-0 rounded-xl p-3 ${iconClassName}`}>
                <Icon size={20} />
              </div>
              <div className="min-w-0">
                {statsLoading && value === null ? (
                  <div className="bg-foreground/10 h-7 w-12 animate-pulse rounded-lg" />
                ) : (
                  <div className="text-foreground text-2xl font-black tracking-tight">
                    {value === null ? '—' : value.toLocaleString('en-IN')}
                  </div>
                )}
                <div className="text-muted truncate text-[11px] font-bold tracking-wider uppercase">
                  {label}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {statsError && !statsLoading && (
        <p className="text-xs font-bold text-rose-400">
          Headcount summary unavailable: {statsError}
        </p>
      )}

      {departments && (departmentsWithStaff.length > 0 || (unassignedCount ?? 0) > 0) && (
        <div className="glass-panel rounded-2xl p-4">
          <div className="text-muted mb-3 flex items-center gap-2 text-[11px] font-black tracking-wider uppercase">
            <Building2 size={14} className="text-lime-400" />
            Headcount by department
            <span className="text-muted/70 font-bold tracking-normal normal-case">
              (all records, including terminated)
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {departmentsWithStaff.map((d) => {
              const isSelected = activeDepartmentId === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => onDepartmentSelect(isSelected ? null : d.id)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                    isSelected
                      ? 'border-lime-400/40 bg-lime-400/10 text-lime-400'
                      : 'text-foreground/90 bg-foreground/5 border-[var(--border-subtle)] hover:border-lime-400/30'
                  }`}
                >
                  <span className="max-w-[160px] truncate">{d.name}</span>
                  {!d.isActive && <span className="text-muted text-[9px] uppercase">inactive</span>}
                  <span className="bg-foreground/10 rounded-md px-1.5 text-[11px] font-black">
                    {d._count.employees}
                  </span>
                </button>
              );
            })}
            {unassignedCount !== null && unassignedCount > 0 && (
              <span className="text-muted flex items-center gap-2 rounded-xl border border-dashed border-[var(--border-subtle)] px-3 py-1.5 text-xs font-bold">
                No department
                <span className="bg-foreground/10 rounded-md px-1.5 text-[11px] font-black">
                  {unassignedCount}
                </span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
