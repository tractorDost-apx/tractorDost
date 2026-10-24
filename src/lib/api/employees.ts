import { apiClient } from './axios/axios';
import { toErrorResult, toResult } from './axios/result';
import type { ApiResult } from '@/types/api/responses';
import type {
  CreateEmployeeInput,
  EmployeeListParams,
  EmployeePage,
  EmployeeProfile,
  EmployeeSensitiveDetails,
  ReportingManagerOption,
  ReportingManagerParams,
  TerminateEmployeeInput,
  UpdateEmployeeInput,
} from '@/types/models/employee';

// Every route except /me is ADMIN-only (BACKEND employee.routes.ts).
export const employeeAPI = {
  getAllEmployees: async (params?: EmployeeListParams): Promise<ApiResult<EmployeePage>> => {
    try {
      const response = await apiClient.get('/employees/getAll', { params });
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to fetch employees');
    }
  },

  /** Active staff accounts for the reporting-manager picker; CUSTOMER and DEALER are excluded on the server */
  getReportingManagers: async (
    params?: ReportingManagerParams
  ): Promise<ApiResult<ReportingManagerOption[]>> => {
    try {
      const response = await apiClient.get('/employees/reporting-managers', { params });
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to fetch reporting managers');
    }
  },

  /** Profile with bank details masked and salary omitted */
  getEmployeeById: async (id: number): Promise<ApiResult<EmployeeProfile>> => {
    try {
      const response = await apiClient.get(`/employees/get/${id}`);
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to fetch employee');
    }
  },

  /** Unmasked bank details and salary. The backend writes an audit log entry for every call. */
  getEmployeeSensitiveDetails: async (id: number): Promise<ApiResult<EmployeeSensitiveDetails>> => {
    try {
      const response = await apiClient.get(`/employees/get/${id}/sensitive`);
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to fetch sensitive details');
    }
  },

  createEmployee: async (data: CreateEmployeeInput): Promise<ApiResult<EmployeeProfile>> => {
    try {
      const response = await apiClient.post('/employees/create', data);
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to register employee');
    }
  },

  updateEmployee: async (
    id: number,
    data: UpdateEmployeeInput
  ): Promise<ApiResult<EmployeeProfile>> => {
    try {
      const response = await apiClient.patch(`/employees/update/${id}`, data);
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to update employee');
    }
  },

  /** Marks the employee TERMINATED, deactivates their login and ends their sessions */
  terminateEmployee: async (
    id: number,
    data: TerminateEmployeeInput
  ): Promise<ApiResult<EmployeeProfile>> => {
    try {
      const response = await apiClient.delete(`/employees/terminate/${id}`, { data });
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to terminate employee');
    }
  },
};
