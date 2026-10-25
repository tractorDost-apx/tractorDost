import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, Loader2, RotateCcw, SearchX, X } from 'lucide-react';
import { useAuditLog } from '@/hooks/audit/use-audit-logs';
import { AuditChanges } from '@/components/admin/AuditChanges';
import { formatDateTime } from '@/lib/utils/format-date';
import {
  describeAuditAction,
  describeAuditActor,
  describeAuditTarget,
  formatRoleName,
} from '@/lib/utils/audit-log';

interface AuditLogDetailsDrawerProps {
  auditLogId: number;
  onClose: () => void;
}

function Detail({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-muted text-[10px] font-black tracking-wider uppercase">{label}</dt>
      <dd className={`text-foreground mt-0.5 text-xs font-bold break-words ${mono ? 'font-mono' : ''}`}>
        {value === null || value === undefined || value === '' ? (
          <span className="text-muted">Not recorded</span>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

/** Full audit entry, loaded from GET /audit-logs/get/:id */
export function AuditLogDetailsDrawer({ auditLogId, onClose }: AuditLogDetailsDrawerProps) {
  const { data, loading, error, reload } = useAuditLog(auditLogId);
  // Ignore an entry still cached from a previously opened row
  const log = data && data.id === auditLogId ? data : null;

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const notFound = !!error && /not found|404/i.test(error);
  const actor = log ? describeAuditActor(log) : null;
  const role = actor ? formatRoleName(actor.role) : null;

  return createPortal(
    <div
      onClick={onClose}
      className="animate-fade-in fixed inset-0 z-[100] flex justify-end bg-black/80 backdrop-blur-md"
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="audit-drawer-title"
        className="flex h-full w-full max-w-xl flex-col border-l border-[var(--border-subtle)] bg-[var(--background)] shadow-2xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-[var(--border-subtle)] p-5">
          <div className="min-w-0">
            <p className="text-muted text-[10px] font-black tracking-wider uppercase">
              Audit entry #{auditLogId}
            </p>
            <h2 id="audit-drawer-title" className="text-foreground mt-1 text-lg font-black">
              {log ? describeAuditAction(log) : 'Audit log details'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-muted hover:text-foreground rounded-lg p-1.5"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {loading && !log && (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-[var(--color-brand-green)]" size={28} />
            </div>
          )}

          {error && !log && (
            <div
              role="alert"
              className="flex flex-col items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-center text-sm font-semibold text-rose-400"
            >
              {notFound ? <SearchX size={22} /> : <AlertCircle size={22} />}
              <p>{notFound ? 'This audit entry could not be found. It may no longer exist.' : error}</p>
              {!notFound && (
                <button
                  type="button"
                  onClick={reload}
                  className="flex items-center gap-1.5 rounded-lg bg-rose-500/20 px-3 py-1.5 text-xs font-bold hover:bg-rose-500/30"
                >
                  <RotateCcw size={13} /> Retry
                </button>
              )}
            </div>
          )}

          {log && actor && (
            <>
              <section className="glass-inner space-y-3 p-4">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                  <Detail label="Performed by" value={actor.name} />
                  <Detail label="Role" value={role} />
                  <Detail label="Action" value={describeAuditAction(log)} />
                  <Detail label="Action code" value={log.action} mono />
                  <Detail label="Affected record" value={describeAuditTarget(log)} />
                  <Detail label="Date & time" value={formatDateTime(log.createdAt)} />
                  <Detail label="IP address" value={log.ipAddress} mono />
                  <Detail label="Audit entry ID" value={`#${log.id}`} mono />
                </dl>
                <dl>
                  <Detail label="Browser / client" value={log.userAgent} />
                </dl>
              </section>

              <section className="glass-inner p-4">
                <AuditChanges log={log} />
              </section>
            </>
          )}
        </div>
      </aside>
    </div>,
    document.body
  );
}
