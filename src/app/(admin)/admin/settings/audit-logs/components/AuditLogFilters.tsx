import React from 'react';
import { RotateCcw } from 'lucide-react';
import {
  AUDIT_ACTION_OPTIONS,
  AUDIT_ENTITY_OPTIONS,
  entityTypeLabel,
} from '@/lib/utils/audit-log';

export interface AuditFilterValues {
  action: string;
  entityType: string;
  /** Raw text of the actor ID input; applied once it is a positive whole number */
  actorId: string;
  /** yyyy-mm-dd from a date input */
  fromDate: string;
  toDate: string;
}

interface AuditLogFiltersProps {
  values: AuditFilterValues;
  onChange: (patch: Partial<AuditFilterValues>) => void;
  onReset: () => void;
  hasFilters: boolean;
  dateRangeInvalid: boolean;
}

const fieldClass =
  'bg-secondary/20 border border-border/50 rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/50 transition-all w-full';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="text-muted text-[10px] font-black tracking-wider uppercase">{label}</span>
      {children}
    </label>
  );
}

export function AuditLogFilters({
  values,
  onChange,
  onReset,
  hasFilters,
  dateRangeInvalid,
}: AuditLogFiltersProps) {
  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Field label="Action">
          <select
            value={values.action}
            onChange={(e) => onChange({ action: e.target.value })}
            className={fieldClass}
          >
            <option value="">All actions</option>
            {AUDIT_ACTION_OPTIONS.map((a) => (
              <option key={a} value={a}>
                {a.replace(/_/g, ' ').toLowerCase()}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Record type">
          <select
            value={values.entityType}
            onChange={(e) => onChange({ entityType: e.target.value })}
            className={fieldClass}
          >
            <option value="">All record types</option>
            {AUDIT_ENTITY_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {entityTypeLabel(t)}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Performed by (user DB ID)">
          <input
            type="number"
            min={1}
            inputMode="numeric"
            placeholder="e.g. 1"
            value={values.actorId}
            onChange={(e) => onChange({ actorId: e.target.value })}
            className={fieldClass}
          />
        </Field>

        <Field label="From date">
          <input
            type="date"
            value={values.fromDate}
            max={values.toDate || undefined}
            onChange={(e) => onChange({ fromDate: e.target.value })}
            className={fieldClass}
          />
        </Field>

        <Field label="To date">
          <input
            type="date"
            value={values.toDate}
            min={values.fromDate || undefined}
            onChange={(e) => onChange({ toDate: e.target.value })}
            className={fieldClass}
          />
        </Field>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] font-medium">
        <p className={dateRangeInvalid ? 'font-bold text-rose-400' : 'text-muted'}>
          {dateRangeInvalid
            ? 'The start date must be on or before the end date.'
            : 'Newest entries first. Filters are applied by the server.'}
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-foreground bg-foreground/5 hover:bg-foreground/10 flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3 py-1.5 text-[11px] font-bold"
          >
            <RotateCcw size={12} /> Reset filters
          </button>
        )}
      </div>
    </div>
  );
}
