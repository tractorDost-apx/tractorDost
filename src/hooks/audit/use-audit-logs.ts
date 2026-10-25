'use client';

import { auditLogAPI } from '@/lib/api/auditLogs';
import { useApiQuery } from '@/hooks/ui/use-api-query';
import type { ApiResult } from '@/types/api/responses';
import type { AuditLogListParams } from '@/types/models/audit-log';

/** One page of the audit trail. `refreshKey` changes force a refetch with the same filters. */
export function useAuditLogs(params: AuditLogListParams, refreshKey = 0) {
  const { page, limit, userId, action, entityType, entityId, from, to } = params;
  return useApiQuery(
    () => auditLogAPI.getAuditLogs({ page, limit, userId, action, entityType, entityId, from, to }),
    [page, limit, userId, action, entityType, entityId, from, to, refreshKey]
  );
}

/** One audit entry from GET /audit-logs/get/:id; skipped while `id` is null */
export function useAuditLog(id: number | null) {
  return useApiQuery(
    () =>
      id === null
        ? Promise.resolve<ApiResult<never>>({ success: false, message: 'No audit log selected' })
        : auditLogAPI.getAuditLogById(id),
    [id]
  );
}
