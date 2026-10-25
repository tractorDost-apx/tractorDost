import { apiClient } from './axios/axios';
import { toErrorResult, toResult } from './axios/result';
import type { ApiResult } from '@/types/api/responses';
import type { AuditLog, AuditLogListParams, AuditLogPage } from '@/types/models/audit-log';

/** Read-only and admin-only: the backend exposes no write routes for audit rows */
export const auditLogAPI = {
  getAuditLogs: async (params?: AuditLogListParams): Promise<ApiResult<AuditLogPage>> => {
    try {
      const response = await apiClient.get('/audit-logs/getAll', { params });
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to fetch audit logs');
    }
  },

  getAuditLogById: async (id: number | string): Promise<ApiResult<AuditLog>> => {
    try {
      const response = await apiClient.get(`/audit-logs/get/${id}`);
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to fetch audit log');
    }
  },
};
