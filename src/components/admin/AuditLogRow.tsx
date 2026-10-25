'use client';

import React, { useState } from 'react';
import { ChevronDown, Clock, ShieldCheck } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/format-date';
import {
  describeAuditActor,
  describeAuditAction,
  describeAuditTarget,
  formatRoleName,
} from '@/lib/utils/audit-log';
import { AuditChanges } from './AuditChanges';
import type { AuditLog } from '@/types/models/audit-log';

interface AuditLogRowProps {
  log: AuditLog;
}

/** Compact audit entry (who / what / which record / when) that expands to the full details */
export function AuditLogRow({ log }: AuditLogRowProps) {
  const [open, setOpen] = useState(false);

  const actor = describeAuditActor(log);
  const role = formatRoleName(actor.role);
  const exactTime = new Date(log.createdAt).toLocaleString('en-IN');

  return (
    <div className="bg-foreground/5 rounded-2xl border border-[var(--border-subtle)] transition-all hover:border-[var(--color-brand-green)]/30">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full flex-col gap-3 p-4 text-left sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex min-w-0 items-start gap-3.5">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
            <ShieldCheck size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-foreground text-sm font-bold">{describeAuditAction(log)}</p>
            <p className="text-muted mt-1 text-xs font-medium break-words">
              <span className="text-foreground font-bold">{actor.name}</span>
              {role && (
                <span className="ml-1.5 rounded-full border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-2 py-0.5 text-[10px] font-black uppercase text-[var(--color-brand-green)]">
                  {role}
                </span>
              )}
            </p>
            <p className="text-muted mt-1 text-xs font-medium break-words">
              {describeAuditTarget(log)}
            </p>
          </div>
        </div>
        <div className="text-muted flex items-center gap-3 text-xs font-bold whitespace-nowrap sm:self-center">
          <span className="flex items-center gap-1.5" title={exactTime}>
            <Clock size={13} /> {formatRelativeTime(log.createdAt)}
          </span>
          <ChevronDown
            size={16}
            className={`transition-transform ${open ? 'rotate-180 text-[var(--color-brand-green)]' : ''}`}
          />
        </div>
      </button>

      {open && (
        <div className="space-y-3 border-t border-[var(--border-subtle)] px-4 py-3 text-xs">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            <Detail label="Performed by" value={`${actor.name}${role ? ` (${role})` : ''}`} />
            <Detail label="Record" value={describeAuditTarget(log)} />
            <Detail label="Date & time" value={exactTime} />
            <Detail label="IP address" value={log.ipAddress ?? 'Not recorded'} />
            <Detail label="Action code" value={log.action} mono />
            <Detail label="Audit entry" value={`#${log.id}`} mono />
          </dl>

          <AuditChanges log={log} />
        </div>
      )}
    </div>
  );
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-muted text-[10px] font-black tracking-wider uppercase">{label}</dt>
      <dd className={`text-foreground font-medium break-words ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  );
}


