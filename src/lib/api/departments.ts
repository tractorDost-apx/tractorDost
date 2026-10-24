import { apiClient } from './axios/axios';
import { toErrorResult, toResult } from './axios/result';
import type { ApiResult } from '@/types/api/responses';
import type { CreateDepartmentInput, Department, DepartmentPage } from '@/types/models/employee';

export interface DepartmentListParams {
  page?: number;
  /** The backend caps this at 100 */
  limit?: number;
  search?: string;
  isActive?: boolean;
}

// ADMIN-only (BACKEND department.routes.ts). Used by the employee forms and filters.
export const departmentAPI = {
  getAllDepartments: async (params?: DepartmentListParams): Promise<ApiResult<DepartmentPage>> => {
    try {
      const response = await apiClient.get('/departments/getAll', { params });
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to fetch departments');
    }
  },

  /** 409 when the name is taken */
  createDepartment: async (data: CreateDepartmentInput): Promise<ApiResult<Department>> => {
    try {
      const response = await apiClient.post('/departments/create', data);
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to create department');
    }
  },
};
