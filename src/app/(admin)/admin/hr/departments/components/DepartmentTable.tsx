import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle,
  Building2,
  CalendarDays,
  Edit2,
  MoreVertical,
  Plus,
  RotateCcw,
  Trash2,
  Users,
} from 'lucide-react';
import type { Department } from '@/types/models/employee';

interface DepartmentRowActions {
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
}

interface DepartmentTableProps extends DepartmentRowActions {
  departments: Department[] | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  onRetry: () => void;
  hasFilters: boolean;
  onClearFilters: () => void;
  onCreate: () => void;
}

interface ActionMenuProps extends DepartmentRowActions {
  department: Department;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const MENU_WIDTH = 200;
const MENU_HEIGHT = 130;

function DepartmentActionMenu({
  department,
  isOpen,
  onToggle,
  onClose,
  onEdit,
  onDelete,
}: ActionMenuProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);

  const menuVisible = isOpen && menuPos !== null;

  useEffect(() => {
    if (!menuVisible) return;
    const handleClose = () => onClose();
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!menuRef.current?.contains(target) && !buttonRef.current?.contains(target)) onClose();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
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
      setMenuPos({
        top: fitsBelow ? rect.bottom + 6 : Math.max(10, rect.top - MENU_HEIGHT),
        left,
      });
    }
    onToggle();
  };

  const select = (action: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
    action();
  };

  const itemClassName =
    'flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-foreground/90 transition-colors hover:bg-foreground/10 hover:text-foreground';

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
        aria-label={`Actions for ${department.name}`}
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
            className="nav-dropdown-glass animate-in fade-in zoom-in-95 w-50 rounded-2xl p-1.5 duration-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              role="menuitem"
              onClick={select(() => onEdit(department))}
              className={itemClassName}
            >
              <Edit2 size={15} className="text-muted shrink-0" />
              Edit department
            </button>
            <div className="my-1 border-t border-[var(--border-subtle)]" />
            <button
              type="button"
              role="menuitem"
              onClick={select(() => onDelete(department))}
              className={`${itemClassName} hover:bg-rose-500/10 hover:text-rose-400`}
            >
              <Trash2 size={15} className="shrink-0 text-rose-400" />
              Delete department
            </button>
          </div>,
          document.body
        )}
    </>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-black tracking-wider uppercase ${
        isActive
          ? 'bg-emerald-400/10 text-emerald-400'
          : 'bg-rose-400/10 text-rose-400'
      }`}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function DepartmentTable({
  departments,
  loading,
  refreshing,
  error,
  onRetry,
  hasFilters,
  onClearFilters,
  onCreate,
  onEdit,
  onDelete,
}: DepartmentTableProps) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const closeMenu = React.useCallback(() => setOpenMenuId(null), []);

  if (error) {
    return (
      <div className="glass-panel flex w-full flex-col items-center justify-center gap-3 rounded-2xl p-12 text-center">
        <div className="rounded-2xl bg-rose-500/10 p-4 text-rose-400">
          <AlertCircle size={36} />
        </div>
        <h3 className="text-foreground text-lg font-bold">Could not load departments</h3>
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

  if (loading && !departments) {
    return (
      <div className="glass-panel w-full rounded-2xl p-6" aria-busy="true" aria-label="Loading departments">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="bg-foreground/10 h-9 w-9 shrink-0 animate-pulse rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="bg-foreground/10 h-3 w-1/4 animate-pulse rounded" />
                <div className="bg-foreground/5 h-3 w-2/5 animate-pulse rounded" />
              </div>
              <div className="bg-foreground/5 hidden h-6 w-16 animate-pulse rounded-lg md:block" />
              <div className="bg-foreground/5 hidden h-6 w-20 animate-pulse rounded-lg md:block" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!departments || departments.length === 0) {
    return (
      <div className="glass-panel flex w-full flex-col items-center justify-center gap-3 rounded-2xl p-12 text-center">
        <div className="text-muted bg-foreground/5 rounded-2xl p-4">
          <Building2 size={36} />
        </div>
        <h3 className="text-foreground text-lg font-bold">
          {hasFilters ? 'No departments match these filters' : 'No departments yet'}
        </h3>
        <p className="text-muted max-w-sm text-sm font-medium">
          {hasFilters
            ? 'Try a different search term or clear the filters.'
            : 'Create your first department to start organising employees.'}
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
            Add Department
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`glass-panel w-full max-w-full overflow-hidden rounded-2xl transition-opacity ${
        refreshing ? 'opacity-60' : ''
      }`}
      aria-busy={refreshing}
    >
      {/* Desktop table */}
      <div className="hidden w-full overflow-x-auto md:block">
        <table className="w-full text-left text-xs">
          <thead className="text-muted bg-foreground/5 border-b border-[var(--border-subtle)] text-[10px] font-black tracking-wider uppercase">
            <tr>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Employees</th>
              <th className="px-4 py-3">Status</th>
              <th className="hidden px-4 py-3 xl:table-cell">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {departments.map((dept) => (
              <tr
                key={dept.id}
                className="group hover:bg-foreground/5 transition-[background-color]"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-lime-400/20 bg-lime-400/10 text-lime-400">
                      <Building2 size={16} />
                    </div>
                    <span className="text-foreground text-[13px] font-black tracking-tight">
                      {dept.name}
                    </span>
                  </div>
                </td>
                <td className="text-muted max-w-[260px] px-4 py-3 text-xs font-medium">
                  <span className="line-clamp-2">{dept.description || '—'}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-foreground/90 flex items-center gap-1.5 font-bold">
                    <Users size={13} className="text-muted" />
                    {dept._count.employees}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge isActive={dept.isActive} />
                </td>
                <td className="text-muted hidden px-4 py-3 font-medium xl:table-cell">
                  {formatDate(dept.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <DepartmentActionMenu
                    department={dept}
                    isOpen={openMenuId === dept.id}
                    onToggle={() => setOpenMenuId((prev) => (prev === dept.id ? null : dept.id))}
                    onClose={closeMenu}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="divide-y divide-[var(--border-subtle)] md:hidden">
        {departments.map((dept) => (
          <li key={dept.id}>
            <div className="flex items-start gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-lime-400/20 bg-lime-400/10 text-lime-400">
                <Building2 size={18} />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-foreground truncate text-sm font-black">{dept.name}</p>
                  <div onClick={(e) => e.stopPropagation()}>
                    <DepartmentActionMenu
                      department={dept}
                      isOpen={openMenuId === dept.id}
                      onToggle={() => setOpenMenuId((prev) => (prev === dept.id ? null : dept.id))}
                      onClose={closeMenu}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </div>
                </div>
                {dept.description && (
                  <p className="text-muted line-clamp-2 text-xs font-medium">{dept.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge isActive={dept.isActive} />
                  <span className="text-muted flex items-center gap-1 text-[11px] font-medium">
                    <Users size={11} />
                    {dept._count.employees} employee{dept._count.employees !== 1 ? 's' : ''}
                  </span>
                  <span className="text-muted flex items-center gap-1 text-[11px] font-medium">
                    <CalendarDays size={11} />
                    {formatDate(dept.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
