import React from 'react';
import { AlertCircle, Eye, Loader2, RotateCcw, ShieldCheck } from 'lucide-react';
import { formatDateTime } from '@/lib/utils/format-date';
import {
  describeAuditAction,
  describeAuditActor,
  describeAuditTarget,
  formatRoleName,
} from '@/lib/utils/audit-log';
import type { AuditLog } from '@/types/models/audit-log';

interface AuditLogTableProps {
  logs: AuditLog[] | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  hasFilters: boolean;
  onRetry: () => void;
  onClearFilters: () => void;
  onView: (log: AuditLog) => void;
}

function Notice({ children }: { children: React.ReactNode }) {
  return <div className="glass-panel flex flex-col items-center rounded-2xl p-10 text-center">{children}</div>;
}

export function AuditLogTable({
  logs,
  loading,
  refreshing,
  error,
  hasFilters,
  onRetry,
  onClearFilters,
  onView,
}: AuditLogTableProps) {
  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm font-semibold text-rose-400"
      >
        <span className="flex items-center gap-2.5">
          <AlertCircle size={18} className="shrink-0" /> {error}
        </span>
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-1.5 rounded-lg bg-rose-500/20 px-3 py-1.5 text-xs font-bold hover:bg-rose-500/30"
        >
          <RotateCcw size={13} /> Retry
        </button>
      </div>
    );
  }

  if (loading && !logs) {
    return (
      <Notice>
        <Loader2 className="animate-spin text-[var(--color-brand-green)]" size={28} />
        <p className="text-muted mt-3 text-xs font-bold">Loading audit logs…</p>
      </Notice>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <Notice>
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
          <ShieldCheck size={24} />
        </div>
        <p className="text-foreground text-sm font-bold">
          {hasFilters ? 'No audit logs match these filters' : 'No audit logs yet'}
        </p>
        <p className="text-muted mt-1 max-w-sm text-xs font-medium">
          {hasFilters
            ? 'Try a different action, record type, user or date range.'
            : 'Actions such as creating, updating or deleting records will appear here.'}
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-4 rounded-xl border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 px-4 py-2 text-xs font-bold text-[var(--color-brand-green)]"
          >
            Clear filters
          </button>
        )}
      </Notice>
    );
  }

  return (
    <div
      className={`glass-panel overflow-hidden rounded-2xl transition-opacity ${refreshing ? 'opacity-60' : ''}`}
      aria-busy={refreshing}
    >
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-xs">
          <thead className="text-muted border-b border-[var(--border-subtle)] text-[10px] font-black tracking-wider uppercase">
            <tr>
              <th className="px-4 py-3">Performed by</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Affected record</th>
              <th className="px-4 py-3">Date &amp; time</th>
              <th className="px-4 py-3">IP</th>
              <th className="px-4 py-3 text-right">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const actor = describeAuditActor(log);
              const role = formatRoleName(actor.role);
              return (
                <tr
                  key={log.id}
                  className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-foreground/5"
                >
                  <td className="px-4 py-3">
                    <p className="text-foreground font-bold break-words">{actor.name}</p>
                    {role && <RoleBadge role={role} />}
                  </td>
                  <td className="text-foreground px-4 py-3 font-bold">{describeAuditAction(log)}</td>
                  <td className="text-muted px-4 py-3 font-medium break-words">
                    {describeAuditTarget(log)}
                  </td>
                  <td className="text-muted px-4 py-3 font-medium whitespace-nowrap">
                    {formatDateTime(log.createdAt)}
                  </td>
                  <td className="text-muted px-4 py-3 font-mono">{log.ipAddress ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <ViewButton onClick={() => onView(log)} id={log.id} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="divide-y divide-[var(--border-subtle)] md:hidden">
        {logs.map((log) => {
          const actor = describeAuditActor(log);
          const role = formatRoleName(actor.role);
          return (
            <li key={log.id} className="space-y-1.5 p-4 text-xs">
              <p className="text-foreground text-sm font-bold">{describeAuditAction(log)}</p>
              <p className="text-muted font-medium break-words">
                <span className="text-foreground font-bold">{actor.name}</span>
                {role && <RoleBadge role={role} inline />}
              </p>
              <p className="text-muted font-medium break-words">{describeAuditTarget(log)}</p>
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-muted font-medium">
                  {formatDateTime(log.createdAt)}
                  {log.ipAddress ? ` · ${log.ipAddress}` : ''}
                </span>
                <ViewButton onClick={() => onView(log)} id={log.id} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RoleBadge({ role, inline }: { role: string; inline?: boolean }) {
  return (
    <span
      className={`rounded-full border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-2 py-0.5 text-[10px] font-black text-[var(--color-brand-green)] uppercase ${inline ? 'ml-1.5' : 'mt-1 inline-block'}`}
    >
      {role}
    </span>
  );
}

function ViewButton({ onClick, id }: { onClick: () => void; id: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`View audit entry ${id}`}
      className="text-foreground bg-foreground/5 inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3 py-1.5 text-[11px] font-bold transition-colors hover:border-[var(--color-brand-green)]/40 hover:text-[var(--color-brand-green)]"
    >
      <Eye size={13} /> View
    </button>
  );
}
