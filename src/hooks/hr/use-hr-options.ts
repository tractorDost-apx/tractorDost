'use client';

import { useState } from 'react';
import { accessControlAPI } from '@/lib/api/accessControl';
import { departmentAPI } from '@/lib/api/departments';
import { toErrorResult } from '@/lib/api/axios/result';
import { useApiQuery } from '@/hooks/ui/use-api-query';
import type { ApiResult } from '@/types/api/responses';
import type {
  CreateDepartmentInput,
  CreateRoleInput,
  Department,
  RoleOption,
  RolePage,
} from '@/types/models/employee';

const PAGE_SIZE = 100; // the backend maximum for both lists

/** Every department (active and inactive), walking the pages so dropdowns are never cut off */
export function useDepartments(refreshKey = 0) {
  return useApiQuery<Department[]>(async () => {
    const departments: Department[] = [];
    for (let page = 1; ; page++) {
      const res = await departmentAPI.getAllDepartments({ page, limit: PAGE_SIZE });
      if (!res.success || !res.data) return { success: false, message: res.message };
      departments.push(...res.data.departments);
      if (page >= res.data.meta.totalPages) break;
    }
    departments.sort((a, b) => a.name.localeCompare(b.name));
    return { success: true, message: 'Departments loaded', data: departments };
  }, [refreshKey]);
}

/** Every role, walking the pages; the caller filters out roles employee registration cannot assign */
export function useRoles() {
  return useApiQuery<RoleOption[]>(async () => {
    try {
      const roles: RoleOption[] = [];
      for (let page = 1; ; page++) {
        const res = (await accessControlAPI.getAllRoles({
          page,
          limit: PAGE_SIZE,
        })) as ApiResult<RolePage>;
        if (!res.success || !res.data) return { success: false, message: res.message };
        roles.push(...res.data.roles);
        if (page >= res.data.meta.totalPages) break;
      }
      roles.sort((a, b) => a.name.localeCompare(b.name));
      return { success: true, message: 'Roles loaded', data: roles };
    } catch (error) {
      return toErrorResult(error, 'Failed to fetch roles');
    }
  }, []);
}

/** POST /roles/create; `submitting` blocks duplicate submissions */
export function useCreateRole() {
  const [submitting, setSubmitting] = useState(false);

  const createRole = async (data: CreateRoleInput): Promise<ApiResult<RoleOption>> => {
    setSubmitting(true);
    try {
      // accessControlAPI returns the response body and throws on HTTP errors
      return (await accessControlAPI.createRole(data)) as ApiResult<RoleOption>;
    } catch (error) {
      return toErrorResult(error, 'Failed to create role');
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, createRole };
}

/** POST /departments/create; `submitting` blocks duplicate submissions */
export function useCreateDepartment() {
  const [submitting, setSubmitting] = useState(false);

  const createDepartment = async (data: CreateDepartmentInput) => {
    setSubmitting(true);
    try {
      return await departmentAPI.createDepartment(data);
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, createDepartment };
}
