import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Search, UserRound, X } from 'lucide-react';
import { useDebounce } from '@/hooks/ui/use-debounce';
import { useReportingManagers } from '@/hooks/hr/use-employees';
import type { ReportingManagerOption } from '@/types/models/employee';

export interface ManagerOption {
  /** Employee.id: the identifier reportingManagerId expects */
  id: number;
  label: string;
}

interface ManagerPickerProps {
  value: ManagerOption | null;
  onChange: (value: ManagerOption | null) => void;
  /** The employee being edited: they cannot report to themselves */
  excludeEmployeeId?: number;
  disabled?: boolean;
  error?: string;
}

export function managerLabel(fullName: string | null, employeeCode: string, role?: string): string {
  return `${fullName ?? 'Unnamed'} (${employeeCode})${role ? ` · ${role.replace(/_/g, ' ')}` : ''}`;
}

/**
 * Searchable reporting-manager selector backed by GET /employees/reporting-managers. The server leaves
 * out CUSTOMER and DEALER accounts; staff without an employee record are listed but cannot be picked.
 */
export function ManagerPicker({
  value,
  onChange,
  excludeEmployeeId,
  disabled,
  error,
}: ManagerPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query.trim(), 300);
  const containerRef = useRef<HTMLDivElement>(null);
  const results = useReportingManagers(debouncedQuery, open, excludeEmployeeId);

  useEffect(() => {
    if (!open) return;
    const handleMouseDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open]);

  const select = (option: ReportingManagerOption) => {
    if (!option.eligible || !option.employee) return;
    onChange({
      id: option.employee.id,
      label: managerLabel(option.fullName, option.employee.employeeCode, option.role.name),
    });
    setQuery('');
    setOpen(false);
  };

  if (value) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-xl border border-lime-400/30 bg-lime-400/5 px-3.5 py-2.5">
        <span className="text-foreground flex min-w-0 items-center gap-2 text-xs font-bold">
          <UserRound size={14} className="shrink-0 text-lime-400" />
          <span className="truncate">{value.label}</span>
        </span>
        {!disabled && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-muted hover:text-foreground hover:bg-foreground/10 rounded-lg p-0.5"
            aria-label="Remove reporting manager"
          >
            <X size={14} />
          </button>
        )}
      </div>
    );
  }

  const options = results.data ?? [];

  return (
    <div ref={containerRef} className="relative">
      <Search size={14} className="text-muted pointer-events-none absolute top-3 left-3" />
      <input
        type="text"
        value={query}
        disabled={disabled}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && open) {
            e.stopPropagation();
            setOpen(false);
          }
        }}
        maxLength={100}
        placeholder="Search by name or employee code..."
        aria-invalid={!!error}
        aria-expanded={open}
        role="combobox"
        aria-controls="manager-picker-options"
        className={`text-foreground bg-foreground/5 w-full rounded-xl border py-2.5 pr-3 pl-9 text-xs font-bold focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/50 focus:outline-none disabled:opacity-50 ${
          error ? 'border-rose-500/50' : 'border-[var(--border-subtle)]'
        }`}
      />
      {open && (
        <div
          id="manager-picker-options"
          role="listbox"
          className="absolute top-full right-0 left-0 z-20 mt-1 max-h-64 overflow-y-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] p-1 shadow-2xl"
        >
          {results.loading && !results.data ? (
            <div className="text-muted flex items-center gap-2 px-3 py-2.5 text-xs font-bold">
              <Loader2 size={14} className="animate-spin" />
              Searching...
            </div>
          ) : results.error ? (
            <div className="px-3 py-2.5 text-xs font-bold text-rose-400">{results.error}</div>
          ) : options.length === 0 ? (
            <div className="text-muted px-3 py-2.5 text-xs font-bold">
              {debouncedQuery ? `No staff match "${debouncedQuery}"` : 'No staff accounts found'}
            </div>
          ) : (
            <div className={results.loading ? 'opacity-60' : ''}>
              {options.map((option) => (
                <button
                  key={option.userId}
                  type="button"
                  role="option"
                  aria-selected={false}
                  aria-disabled={!option.eligible}
                  disabled={!option.eligible}
                  onClick={() => select(option)}
                  title={option.ineligibleReason ?? undefined}
                  className="enabled:hover:bg-foreground/10 flex w-full items-start justify-between gap-2 rounded-lg px-3 py-2 text-left transition-colors disabled:cursor-not-allowed"
                >
                  <span className="flex min-w-0 flex-col">
                    <span
                      className={`truncate text-xs font-bold ${option.eligible ? 'text-foreground' : 'text-muted'}`}
                    >
                      {option.fullName ?? 'Unnamed'}
                    </span>
                    <span className="text-muted truncate text-[10px] font-medium">
                      {option.employee ? (
                        <>
                          <span className="font-mono">{option.employee.employeeCode}</span> ·{' '}
                          {option.employee.designation}
                        </>
                      ) : (
                        'No employee code'
                      )}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-0.5">
                    <span className="rounded-md border border-lime-400/20 bg-lime-400/10 px-1.5 text-[9px] font-black tracking-wider text-lime-400 uppercase">
                      {option.role.name.replace(/_/g, ' ')}
                    </span>
                    {option.ineligibleReason && (
                      <span className="text-[9px] font-bold text-amber-400">
                        {option.ineligibleReason}
                      </span>
                    )}
                  </span>
                </button>
              ))}
              {options.some((o) => !o.eligible) && (
                <p className="text-muted border-t border-[var(--border-subtle)] px-3 pt-2 pb-1 text-[10px] font-medium">
                  Only staff with an active employee record can be reporting managers.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
