import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Building2,
  CalendarDays,
  Edit2,
  Eye,
  MoreVertical,
  Network,
  Plus,
  RotateCcw,
  UserRound,
  UsersRound,
  UserX,
} from 'lucide-react';
import type { EmployeeListItem, EmployeeSortBy, SortOrder } from '@/types/models/employee';
import { employeeInitials, formatEmployeeDate } from '@/lib/utils/employee-format';
import { terminationBlockedReason } from '@/lib/validators/employee.schema';
import { AccountDisabledBadge, EmployeeRoleBadge, EmployeeStatusBadge } from './EmployeeBadges';

interface EmployeeRowActions {
  onView: (employee: EmployeeListItem) => void;
  onEdit: (employee: EmployeeListItem) => void;
  onTerminate: (employee: EmployeeListItem) => void;
  onShowReports: (employee: EmployeeListItem) => void;
}

interface EmployeeTableProps extends EmployeeRowActions {
  employees: EmployeeListItem[] | null;
  /** First load for the current query (no rows to show yet) */
  loading: boolean;
  /** A refetch is running while the previous rows are still shown */
  refreshing: boolean;
  error: string | null;
  onRetry: () => void;
  currentUserId: number | undefined;
  hasFilters: boolean;
  /** Set when the list shows one employee's direct reports and no other filter, for the empty state */
  directReportsOf?: string | null;
  onClearFilters: () => void;
  onCreate: () => void;
  sortBy: EmployeeSortBy;
  sortOrder: SortOrder;
  onSort: (sortBy: EmployeeSortBy) => void;
}

interface ActionMenuProps extends EmployeeRowActions {
  employee: EmployeeListItem;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  currentUserId: number | undefined;
}

const MENU_WIDTH = 224;
const MENU_HEIGHT = 200;

function EmployeeActionMenu({
  employee,
  isOpen,
  onToggle,
  onClose,
  currentUserId,
  onView,
  onEdit,
  onTerminate,
  onShowReports,
}: ActionMenuProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);

  const menuVisible = isOpen && menuPos !== null;

  // Only the instance that is actually showing its menu listens for outside clicks; otherwise a
  // press inside the menu would count as "outside" for another instance and close it before click.
  useEffect(() => {
    if (!menuVisible) return;

    const handleClose = () => onClose();
    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !buttonRef.current?.contains(target)) onClose();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('scroll', handleClose, true);
    window.addEventListener('resize', handleClose);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('scroll', handleClose, true);
      window.removeEventListener('resize', handleClose);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuVisible, onClose]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const left = Math.max(10, rect.right - MENU_WIDTH);
      const fitsBelow = rect.bottom + 6 + MENU_HEIGHT <= window.innerHeight;
      setMenuPos({ top: fitsBelow ? rect.bottom + 6 : Math.max(10, rect.top - MENU_HEIGHT), left });
    }
    onToggle();
  };

  const blockedReason = terminationBlockedReason(employee, currentUserId);
  const itemClassName =
    'group flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-foreground/90 transition-colors hover:bg-foreground/10 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50';

  const select = (action: (employee: EmployeeListItem) => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
    action(employee);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className={`inline-flex items-center justify-center rounded-xl p-2 transition-all duration-200 focus:outline-none ${
          isOpen
            ? 'bg-foreground/10 text-foreground ring-foreground/10 ring-2'
            : 'text-muted hover:bg-foreground/10 hover:text-foreground'
        }`}
        title="Actions"
        aria-label={`Actions for ${employee.user.fullName ?? employee.employeeCode}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <MoreVertical size={18} />
      </button>
      {menuVisible &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, zIndex: 99999 }}
            className="nav-dropdown-glass animate-in fade-in zoom-in-95 w-56 rounded-2xl p-1.5 duration-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              role="menuitem"
              onClick={select(onView)}
              className={itemClassName}
            >
              <Eye size={15} className="text-muted shrink-0" />
              View details
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={select(onEdit)}
              className={itemClassName}
            >
              <Edit2 size={15} className="text-muted shrink-0" />
              Edit employee
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={select(onShowReports)}
              className={itemClassName}
            >
              <Network size={15} className="text-muted shrink-0" />
              Show direct reports
            </button>
            <div className="my-1 border-t border-[var(--border-subtle)]" />
            <button
              type="button"
              role="menuitem"
              onClick={select(onTerminate)}
              disabled={blockedReason !== null}
              title={blockedReason ?? undefined}
              className={`${itemClassName} hover:bg-rose-500/10 hover:text-rose-400`}
            >
              <UserX size={15} className="shrink-0 text-rose-400" />
              <span className="flex flex-col">
                Terminate employee
                {blockedReason && (
                  <span className="text-muted text-[10px] font-medium">{blockedReason}</span>
                )}
              </span>
            </button>
          </div>,
          document.body
        )}
    </>
  );
}

function SortableHeader({
  label,
  field,
  sortBy,
  sortOrder,
  onSort,
}: {
  label: string;
  field: EmployeeSortBy;
  sortBy: EmployeeSortBy;
  sortOrder: SortOrder;
  onSort: (field: EmployeeSortBy) => void;
}) {
  const active = sortBy === field;
  const Icon = !active ? ArrowUpDown : sortOrder === 'asc' ? ArrowUp : ArrowDown;
  return (
    <th
      className="px-3 py-3"
      aria-sort={active ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button
        type="button"
        onClick={() => onSort(field)}
        className={`hover:text-foreground inline-flex items-center gap-1 uppercase transition-colors ${
          active ? 'text-lime-400' : ''
        }`}
      >
        {label}
        <Icon size={11} />
      </button>
    </th>
  );
}

export function EmployeeTable({
  employees,
  loading,
  refreshing,
  error,
  onRetry,
  currentUserId,
  hasFilters,
  directReportsOf,
  onClearFilters,
  onCreate,
  sortBy,
  sortOrder,
  onSort,
  ...actions
}: EmployeeTableProps) {
  // Keyed by layout as well as id: each row renders a menu in the table and in the (CSS-hidden) card list
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);
  const closeMenu = React.useCallback(() => setOpenMenuKey(null), []);

  if (error) {
    return (
      <div className="glass-panel flex w-full flex-col items-center justify-center gap-3 rounded-2xl p-12 text-center">
        <div className="rounded-2xl bg-rose-500/10 p-4 text-rose-400">
          <AlertCircle size={36} />
        </div>
        <h3 className="text-foreground text-lg font-bold">Could not load employees</h3>
        <p className="text-muted max-w-sm text-sm font-medium">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="bg-foreground/5 text-foreground mt-1 flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-xs font-bold transition-colors hover:border-lime-400/40"
        >
          <RotateCcw size={14} />
          Try again
        </button>
      </div>
    );
  }

  if (loading && !employees) {
    return (
      <div
        className="glass-panel w-full rounded-2xl p-6"
        aria-busy="true"
        aria-label="Loading employees"
      >
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="bg-foreground/10 h-10 w-10 shrink-0 animate-pulse rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="bg-foreground/10 h-3 w-1/3 animate-pulse rounded" />
                <div className="bg-foreground/5 h-3 w-1/5 animate-pulse rounded" />
              </div>
              <div className="bg-foreground/5 hidden h-6 w-20 animate-pulse rounded-lg md:block" />
              <div className="bg-foreground/5 hidden h-6 w-24 animate-pulse rounded-lg md:block" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!employees || employees.length === 0) {
    return (
      <div className="glass-panel flex w-full flex-col items-center justify-center gap-3 rounded-2xl p-12 text-center">
        <div className="text-muted bg-foreground/5 rounded-2xl p-4">
          <UsersRound size={36} />
        </div>
        <h3 className="text-foreground text-lg font-bold">
          {directReportsOf
            ? `${directReportsOf} has no direct reports`
            : hasFilters
              ? 'No employees match these filters'
              : 'No employees yet'}
        </h3>
        <p className="text-muted max-w-sm text-sm font-medium">
          {directReportsOf
            ? 'Nobody has this employee set as their reporting manager.'
            : hasFilters
              ? 'Try a different search term or clear the filters to see everyone.'
              : 'Register your first staff member to start managing roles, departments and reporting lines.'}
        </p>
        {hasFilters ? (
          <button
            type="button"
            onClick={onClearFilters}
            className="bg-foreground/5 text-foreground mt-1 flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-xs font-bold transition-colors hover:border-lime-400/40"
          >
            <RotateCcw size={14} />
            Clear filters
          </button>
        ) : (
          <button
            type="button"
            onClick={onCreate}
            className="mt-1 flex items-center gap-2 rounded-xl bg-lime-400 px-4 py-2 text-xs font-black tracking-wider text-black uppercase hover:bg-lime-300"
          >
            <Plus size={14} className="stroke-[3]" />
            Add Employee
          </button>
        )}
      </div>
    );
  }

  const menuFor = (employee: EmployeeListItem, layout: 'table' | 'card') => {
    const key = `${layout}:${employee.id}`;
    return (
      <EmployeeActionMenu
        employee={employee}
        isOpen={openMenuKey === key}
        onToggle={() => setOpenMenuKey((prev) => (prev === key ? null : key))}
        onClose={closeMenu}
        currentUserId={currentUserId}
        {...actions}
      />
    );
  };

  const managerCell = (employee: EmployeeListItem) =>
    employee.reportingManager ? (
      <div className="flex flex-col">
        <span className="text-foreground/90 font-bold">
          {employee.reportingManager.fullName ?? 'Unnamed'}
        </span>
        <span className="text-muted font-mono text-[10px]">
          {employee.reportingManager.employeeCode}
        </span>
      </div>
    ) : (
      <span className="text-muted">—</span>
    );

  return (
    <div
      className={`glass-panel w-full max-w-full overflow-hidden rounded-2xl transition-opacity ${
        refreshing ? 'opacity-60' : ''
      }`}
      aria-busy={refreshing}
    >
      {/* Desktop / tablet table */}
      <div className="hidden w-full overflow-x-auto md:block">
        <table className="w-full text-left text-xs">
          <thead className="text-muted bg-foreground/5 border-b border-[var(--border-subtle)] text-[10px] font-black tracking-wider uppercase">
            <tr>
              <th className="px-3 py-3">Employee</th>
              <SortableHeader
                label="Code"
                field="employeeCode"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
              <th className="px-3 py-3">Role</th>
              <SortableHeader
                label="Designation"
                field="designation"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
              <th className="px-3 py-3">Department</th>
              <th className="hidden px-3 py-3 xl:table-cell">Reporting to</th>
              <SortableHeader
                label="Joined"
                field="joiningDate"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {employees.map((employee) => (
              <tr
                key={employee.id}
                onClick={() => actions.onView(employee)}
                className="group hover:bg-foreground/5 cursor-pointer transition-[background-color]"
              >
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-lime-400/20 bg-lime-400/10 text-xs font-black text-lime-400">
                      {employeeInitials(employee.user.fullName)}
                    </div>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-foreground truncate text-[13px] font-black tracking-tight">
                        {employee.user.fullName ?? 'Unnamed employee'}
                        {employee.user.id === currentUserId && (
                          <span className="text-muted ml-1.5 text-[10px] font-bold">(you)</span>
                        )}
                      </span>
                      {!employee.user.isActive && employee.status !== 'TERMINATED' && (
                        <AccountDisabledBadge />
                      )}
                    </div>
                  </div>
                </td>
                <td className="text-foreground/90 px-3 py-3 font-mono text-[11px] font-bold whitespace-nowrap">
                  {employee.employeeCode}
                </td>
                <td className="px-3 py-3">
                  <EmployeeRoleBadge role={employee.user.role.name} />
                </td>
                <td className="text-foreground/90 max-w-[180px] px-3 py-3 font-bold">
                  <span className="line-clamp-2">{employee.designation}</span>
                </td>
                <td className="px-3 py-3">
                  {employee.department ? (
                    <span className="text-foreground/90 flex items-center gap-1.5 font-bold">
                      <Building2 size={12} className="text-muted shrink-0" />
                      {employee.department.name}
                    </span>
                  ) : (
                    <span className="text-muted">Unassigned</span>
                  )}
                </td>
                <td className="hidden px-3 py-3 xl:table-cell">{managerCell(employee)}</td>
                <td className="text-foreground/90 px-3 py-3 font-bold whitespace-nowrap">
                  {formatEmployeeDate(employee.joiningDate)}
                </td>
                <td className="px-3 py-3">
                  <EmployeeStatusBadge status={employee.status} />
                </td>
                <td className="px-3 py-3 text-right">{menuFor(employee, 'table')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="divide-y divide-[var(--border-subtle)] md:hidden">
        {employees.map((employee) => (
          <li key={employee.id}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => actions.onView(employee)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') actions.onView(employee);
              }}
              className="hover:bg-foreground/5 flex cursor-pointer items-start gap-3 p-4 transition-colors"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-lime-400/20 bg-lime-400/10 text-xs font-black text-lime-400">
                {employeeInitials(employee.user.fullName)}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-foreground truncate text-sm font-black">
                      {employee.user.fullName ?? 'Unnamed employee'}
                    </p>
                    <p className="text-muted font-mono text-[11px] font-bold">
                      {employee.employeeCode}
                    </p>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>{menuFor(employee, 'card')}</div>
                </div>
                <p className="text-foreground/90 text-xs font-bold">{employee.designation}</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <EmployeeStatusBadge status={employee.status} />
                  <EmployeeRoleBadge role={employee.user.role.name} />
                </div>
                <div className="text-muted flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-medium">
                  <span className="flex items-center gap-1">
                    <Building2 size={11} />
                    {employee.department?.name ?? 'Unassigned'}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarDays size={11} />
                    {formatEmployeeDate(employee.joiningDate)}
                  </span>
                  {employee.reportingManager && (
                    <span className="flex items-center gap-1">
                      <UserRound size={11} />
                      {employee.reportingManager.fullName ?? employee.reportingManager.employeeCode}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
