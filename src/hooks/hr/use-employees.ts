'use client';

import { useState } from 'react';
import { employeeAPI } from '@/lib/api/employees';
import { useApiQuery } from '@/hooks/ui/use-api-query';
import type { ApiResult } from '@/types/api/responses';
import type {
  CreateEmployeeInput,
  EmployeeListParams,
  EmployeeStatus,
  TerminateEmployeeInput,
  UpdateEmployeeInput,
} from '@/types/models/employee';

/** One page of the employee list. `refreshKey` changes force a refetch with the same filters. */
export function useEmployees(params: EmployeeListParams, refreshKey = 0) {
  const { page, limit, search, status, departmentId, reportingManagerId, sortBy, sortOrder } =
    params;
  return useApiQuery(
    () =>
      employeeAPI.getAllEmployees({
        page,
        limit,
        search,
        status,
        departmentId,
        reportingManagerId,
        sortBy,
        sortOrder,
      }),
    [page, limit, search, status, departmentId, reportingManagerId, sortBy, sortOrder, refreshKey]
  );
}

/** One employee's profile (bank details masked); skipped while `id` is null */
export function useEmployee(id: number | null, refreshKey = 0) {
  return useApiQuery(
    () =>
      id === null
        ? Promise.resolve<ApiResult<never>>({ success: false, message: 'No employee selected' })
        : employeeAPI.getEmployeeById(id),
    [id, refreshKey]
  );
}

export interface EmployeeStats {
  total: number;
  byStatus: Record<EmployeeStatus, number>;
}

const STATUSES: EmployeeStatus[] = ['ACTIVE', 'ON_LEAVE', 'INACTIVE', 'TERMINATED'];

/**
 * Company-wide headcount per status. The list endpoint has no stats route, so this reads `meta.total`
 * from one 1-row request per status: exact counts from the server, not totals of a loaded page.
 */
export function useEmployeeStats(refreshKey = 0) {
  return useApiQuery<EmployeeStats>(async () => {
    const [all, ...perStatus] = await Promise.all([
      employeeAPI.getAllEmployees({ page: 1, limit: 1 }),
      ...STATUSES.map((status) => employeeAPI.getAllEmployees({ page: 1, limit: 1, status })),
    ]);
    const failed = [all, ...perStatus].find((res) => !res.success || !res.data);
    if (failed) return { success: false, message: failed.message };

    const byStatus = Object.fromEntries(
      STATUSES.map((status, i) => [status, perStatus[i].data!.meta.total])
    ) as Record<EmployeeStatus, number>;
    return {
      success: true,
      message: 'Employee stats loaded',
      data: { total: all.data!.meta.total, byStatus },
    };
  }, [refreshKey]);
}

/** Staff accounts for the reporting-manager picker, searched by name or employee code on the server */
export function useReportingManagers(search: string, enabled: boolean, excludeEmployeeId?: number) {
  return useApiQuery(
    () =>
      enabled
        ? employeeAPI.getReportingManagers({
            search: search || undefined,
            limit: 20,
            excludeEmployeeId,
          })
        : Promise.resolve<ApiResult<never>>({ success: false, message: '' }),
    [search, enabled, excludeEmployeeId]
  );
}

/** Create, update and terminate; `submitting` blocks duplicate submissions while a write is in flight */
export function useEmployeeActions() {
  const [submitting, setSubmitting] = useState(false);

  const run = async <T>(action: () => Promise<ApiResult<T>>): Promise<ApiResult<T>> => {
    setSubmitting(true);
    try {
      return await action();
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitting,
    createEmployee: (data: CreateEmployeeInput) => run(() => employeeAPI.createEmployee(data)),
    updateEmployee: (id: number, data: UpdateEmployeeInput) =>
      run(() => employeeAPI.updateEmployee(id, data)),
    terminateEmployee: (id: number, data: TerminateEmployeeInput) =>
      run(() => employeeAPI.terminateEmployee(id, data)),
  };
}
