// Shapes returned by BACKEND/src/module/humanResource/{employee,department} and foundation/roles.
// Dates arrive as ISO strings; date-only columns (joiningDate, dateOfBirth, ...) are UTC midnight.

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';

/** Statuses the update endpoint accepts; TERMINATED is only reachable through termination */
export type UpdatableEmployeeStatus = Exclude<EmployeeStatus, 'TERMINATED'>;

export type EmployeeGender = 'MALE' | 'FEMALE' | 'OTHER';

export type EmployeeSortBy = 'createdAt' | 'joiningDate' | 'employeeCode' | 'designation';

export type SortOrder = 'asc' | 'desc';

export interface EmployeeRoleSummary {
  id: number;
  name: string;
}

export interface EmployeeDepartmentSummary {
  id: number;
  name: string;
}

export interface EmployeeManagerSummary {
  id: number;
  employeeCode: string;
  fullName: string | null;
}

/** GET /employees/getAll row: no contact, personal, bank or compensation fields */
export interface EmployeeListItem {
  id: number;
  employeeCode: string;
  designation: string;
  status: EmployeeStatus;
  joiningDate: string;
  createdAt: string;
  user: {
    id: number;
    fullName: string | null;
    isActive: boolean;
    role: EmployeeRoleSummary;
  };
  department: EmployeeDepartmentSummary | null;
  reportingManager: EmployeeManagerSummary | null;
}

/** GET /employees/get/:id — bankAccountNo, ifscCode and panNumber are masked; salary is omitted */
export interface EmployeeProfile {
  id: number;
  employeeCode: string;
  designation: string;
  status: EmployeeStatus;
  departmentId: number | null;
  reportingManagerId: number | null;
  dateOfBirth: string | null;
  gender: string | null;
  address: string | null;
  emergencyContact: string | null;
  joiningDate: string;
  probationEndDate: string | null;
  confirmationDate: string | null;
  terminationDate: string | null;
  terminationReason: string | null;
  bankAccountNo: string | null;
  ifscCode: string | null;
  panNumber: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    fullName: string | null;
    mobile: string | null;
    email: string | null;
    isActive: boolean;
    role: EmployeeRoleSummary;
  };
  department: EmployeeDepartmentSummary | null;
  reportingManager: EmployeeManagerSummary | null;
}

/** GET /employees/get/:id/sensitive — unmasked, and every read is audit-logged */
export interface EmployeeSensitiveDetails {
  id: number;
  employeeCode: string;
  bankAccountNo: string | null;
  ifscCode: string | null;
  panNumber: string | null;
  basicSalary: number | null;
  ctc: number | null;
}

export interface EmployeePage {
  data: EmployeeListItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

/** GET /employees/reporting-managers row: an active staff account (never CUSTOMER or DEALER) */
export interface ReportingManagerOption {
  userId: number;
  fullName: string | null;
  role: EmployeeRoleSummary;
  /** reportingManagerId takes this Employee.id; accounts without one cannot be selected */
  employee: {
    id: number;
    employeeCode: string;
    designation: string;
    status: EmployeeStatus;
  } | null;
  eligible: boolean;
  ineligibleReason: string | null;
}

export interface ReportingManagerParams {
  search?: string;
  limit?: number;
  excludeEmployeeId?: number;
}

export interface EmployeeListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: EmployeeStatus;
  departmentId?: number;
  reportingManagerId?: number;
  sortBy?: EmployeeSortBy;
  sortOrder?: SortOrder;
}

/** POST /employees/create body. The validator is strict: unknown keys are rejected. */
export interface CreateEmployeeInput {
  fullName: string;
  mobile: string;
  email?: string;
  roleId: number;
  /** Omit to have the backend generate EMP-MM-YY-RR-<id> from the role and the new employee's ID */
  employeeCode?: string;
  designation: string;
  departmentId?: number;
  reportingManagerId?: number;
  dateOfBirth?: string;
  gender?: EmployeeGender;
  address?: string;
  emergencyContact?: string;
  joiningDate: string;
  probationEndDate?: string;
  confirmationDate?: string;
  basicSalary?: number;
  ctc?: number;
  bankAccountNo?: string;
  ifscCode?: string;
  panNumber?: string;
}

/** PATCH /employees/update/:id body. null clears an optional column; mobile, role and code are not editable. */
export interface UpdateEmployeeInput {
  fullName?: string;
  email?: string;
  designation?: string;
  status?: UpdatableEmployeeStatus;
  departmentId?: number | null;
  reportingManagerId?: number | null;
  dateOfBirth?: string | null;
  gender?: EmployeeGender | null;
  address?: string | null;
  emergencyContact?: string | null;
  joiningDate?: string;
  probationEndDate?: string | null;
  confirmationDate?: string | null;
  basicSalary?: number | null;
  ctc?: number | null;
  bankAccountNo?: string | null;
  ifscCode?: string | null;
  panNumber?: string | null;
}

/** DELETE /employees/terminate/:id body; both fields are optional */
export interface TerminateEmployeeInput {
  terminationDate?: string;
  terminationReason?: string;
}

/** GET /departments/getAll row */
export interface Department {
  id: number;
  name: string;
  description: string | null;
  headId: number | null;
  isActive: boolean;
  createdAt: string;
  _count: { employees: number };
}

/** POST /departments/create body */
export interface CreateDepartmentInput {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface DepartmentPage {
  departments: Department[];
  meta: { totalItems: number; itemCount: number; totalPages: number; currentPage: number };
}

/** GET /roles/getAll row */
export interface RoleOption {
  id: number;
  name: string;
  description: string | null;
}

/** POST /roles/create body; the backend stores the name upper-cased */
export interface CreateRoleInput {
  name: string;
  description?: string;
}

export interface RolePage {
  roles: RoleOption[];
  meta: { totalItems: number; itemCount: number; totalPages: number; currentPage: number };
}
