import React from 'react';
import { getAuditChanges } from '@/lib/utils/audit-log';
import type { AuditLog } from '@/types/models/audit-log';

/** Recorded before/after values, exactly as stored; renders nothing it cannot back with the record */
export function AuditChanges({ log }: { log: Pick<AuditLog, 'oldValue' | 'newValue'> }) {
  const { rows, fieldsOnly } = getAuditChanges(log);

  if (rows.length === 0 && (fieldsOnly?.length ?? 0) === 0) {
    return (
      <p className="text-muted text-xs font-medium">
        No before/after values were recorded for this action.
      </p>
    );
  }

  return (
    <div>
      <p className="text-muted mb-1.5 text-[10px] font-black tracking-wider uppercase">
        Recorded changes
      </p>
      {fieldsOnly ? (
        <p className="text-foreground text-xs font-medium break-words">
          Fields changed: {fieldsOnly.join(', ')}{' '}
          <span className="text-muted">(values are not stored for confidential data)</span>
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
          <table className="w-full min-w-[320px] text-left text-xs">
            <thead className="text-muted text-[10px] font-black uppercase">
              <tr>
                <th className="px-3 py-2">Field</th>
                <th className="px-3 py-2">Before</th>
                <th className="px-3 py-2">After</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.field} className="border-t border-[var(--border-subtle)]">
                  <td className="text-foreground px-3 py-2 font-bold">{r.field}</td>
                  <td className="text-muted px-3 py-2 break-all">{r.before}</td>
                  <td className="px-3 py-2 break-all text-[var(--color-brand-green)]">{r.after}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
