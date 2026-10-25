'use client';

import { useState } from 'react';
import { departmentAPI, type DepartmentListParams } from '@/lib/api/departments';
import { useApiQuery } from '@/hooks/ui/use-api-query';
import type { CreateDepartmentInput, UpdateDepartmentInput } from '@/types/models/employee';

export interface DepartmentStats {
  total: number;
  active: number;
  inactive: number;
}

/** One page of departments with server-side search + isActive filter. */
export function useDepartmentList(params: DepartmentListParams, refreshKey = 0) {
  const { page, limit, search, isActive } = params;
  return useApiQuery(
    () => departmentAPI.getAllDepartments({ page, limit, search, isActive }),
    [page, limit, search, isActive, refreshKey]
  );
}

/** Active / inactive / total counts; three lightweight 1-row requests. */
export function useDepartmentStats(refreshKey = 0) {
  return useApiQuery<DepartmentStats>(async () => {
    const [all, active, inactive] = await Promise.all([
      departmentAPI.getAllDepartments({ page: 1, limit: 1 }),
      departmentAPI.getAllDepartments({ page: 1, limit: 1, isActive: true }),
      departmentAPI.getAllDepartments({ page: 1, limit: 1, isActive: false }),
    ]);
    const failed = [all, active, inactive].find((r) => !r.success || !r.data);
    if (failed) return { success: false, message: failed.message };
    return {
      success: true,
      message: 'Department stats loaded',
      data: {
        total: all.data!.meta.totalItems,
        active: active.data!.meta.totalItems,
        inactive: inactive.data!.meta.totalItems,
      },
    };
  }, [refreshKey]);
}

/** Create, update and delete; `submitting` blocks duplicate submissions. */
export function useDepartmentActions() {
  const [submitting, setSubmitting] = useState(false);

  const run = async <T>(action: () => Promise<T>): Promise<T> => {
    setSubmitting(true);
    try {
      return await action();
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitting,
    createDepartment: (data: CreateDepartmentInput) =>
      run(() => departmentAPI.createDepartment(data)),
    updateDepartment: (id: number, data: UpdateDepartmentInput) =>
      run(() => departmentAPI.updateDepartment(id, data)),
    deleteDepartment: (id: number) =>
      run(() => departmentAPI.deleteDepartment(id)),
  };
}
