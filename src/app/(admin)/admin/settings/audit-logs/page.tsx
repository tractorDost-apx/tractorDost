'use client';

import React, { useCallback, useState } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import Pagination from '@/components/shared/Pagination';
import { useAuditLogs } from '@/hooks/audit/use-audit-logs';
import { AuditLogFilters, type AuditFilterValues } from './components/AuditLogFilters';
import { AuditLogTable } from './components/AuditLogTable';
import { AuditLogDetailsDrawer } from './components/AuditLogDetailsDrawer';

const DEFAULT_LIMIT = 20; // the backend default for GET /audit-logs/getAll

const EMPTY_FILTERS: AuditFilterValues = {
  action: '',
  entityType: '',
  actorId: '',
  fromDate: '',
  toDate: '',
};

/** Local start/end of the picked day as the full ISO timestamp the API requires */
const startOfDayIso = (date: string) => new Date(`${date}T00:00:00`).toISOString();
const endOfDayIso = (date: string) => new Date(`${date}T23:59:59.999`).toISOString();

export default function AuditLogsAdminPage() {
  const [filters, setFilters] = useState<AuditFilterValues>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const actorNumber = Number(filters.actorId);
  const actorId = Number.isInteger(actorNumber) && actorNumber > 0 ? actorNumber : undefined;
  const dateRangeInvalid = !!filters.fromDate && !!filters.toDate && filters.fromDate > filters.toDate;

  const list = useAuditLogs(
    {
      page,
      limit,
      action: filters.action || undefined,
      entityType: filters.entityType || undefined,
      userId: actorId,
      // An invalid range is not sent: the backend would reject it with a 422
      from: filters.fromDate && !dateRangeInvalid ? startOfDayIso(filters.fromDate) : undefined,
      to: filters.toDate && !dateRangeInvalid ? endOfDayIso(filters.toDate) : undefined,
    },
    refreshKey
  );

  const meta = list.data?.meta;
  const hasFilters = Object.values(filters).some(Boolean);

  const updateFilters = (patch: Partial<AuditFilterValues>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  };
  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };
  const closeDrawer = useCallback(() => setSelectedId(null), []);

  return (
    <div className="animate-fade-in flex h-full w-full max-w-full flex-col gap-5 overflow-x-hidden pb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-foreground flex items-center gap-2 text-2xl font-black">
            <ShieldCheck className="text-[var(--color-brand-green)]" size={24} /> Audit Logs
          </h1>
          <p className="text-muted mt-1 text-sm font-medium">
            A read-only record of who did what across the platform
            {meta ? ` · ${meta.totalItems} ${meta.totalItems === 1 ? 'entry' : 'entries'}` : ''}.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRefreshKey((k) => k + 1)}
          disabled={list.loading}
          className="text-foreground bg-foreground/5 hover:bg-foreground/10 flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-xs font-bold disabled:opacity-50"
        >
          <RefreshCw size={14} className={list.loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <AuditLogFilters
        values={filters}
        onChange={updateFilters}
        onReset={resetFilters}
        hasFilters={hasFilters}
        dateRangeInvalid={dateRangeInvalid}
      />

      <div className="flex flex-1 flex-col gap-4">
        <AuditLogTable
          logs={list.data?.logs ?? null}
          loading={list.loading}
          refreshing={list.loading && !!list.data}
          error={list.error}
          hasFilters={hasFilters}
          onRetry={list.reload}
          onClearFilters={resetFilters}
          onView={(log) => setSelectedId(log.id)}
        />

        {meta && !list.error && meta.totalItems > 0 && (
          <div className="glass-panel rounded-2xl p-2">
            <Pagination
              page={page}
              limit={limit}
              totalCount={meta.totalItems}
              totalPages={meta.totalPages}
              onPageChange={setPage}
              onLimitChange={(l) => {
                setLimit(l);
                setPage(1);
              }}
            />
          </div>
        )}
      </div>

      {selectedId !== null && <AuditLogDetailsDrawer auditLogId={selectedId} onClose={closeDrawer} />}
    </div>
  );
}
