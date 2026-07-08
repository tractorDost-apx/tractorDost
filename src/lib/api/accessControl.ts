import { apiClient } from './axios/axios';

// Interfaces for Types
export interface Role {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface Module {
  id: number;
  name: string;
  code: string;
  description: string | null;
  parentId: number | null;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface ModuleTreeNode extends Module {
  children: ModuleTreeNode[];
}

export interface RolePermission {
  id?: number;
  roleId: number;
  moduleId: number;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canExport: boolean;
  module?: Module;
}

export interface UserPermissionOverride {
  id?: number;
  userId: number;
  moduleId: number;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canExport: boolean;
  isGrant: boolean;
  reason?: string;
  expiresAt?: string;
  module?: Module;
}

export const accessControlAPI = {
  // Roles
  getAllRoles: async () => {
    const response = await apiClient.get('/roles/getAll');
    return response.data;
  },
  createRole: async (data: { name: string; description?: string }) => {
    const response = await apiClient.post('/roles/create', data);
    return response.data;
  },
  updateRole: async (id: number, data: { name?: string; description?: string }) => {
    const response = await apiClient.patch(`/roles/update/${id}`, data);
    return response.data;
  },
  deleteRole: async (id: number) => {
    const response = await apiClient.delete(`/roles/delete/${id}`);
    return response.data;
  },

  // Modules
  getModuleTree: async () => {
    const response = await apiClient.get('/access-control/modules/tree');
    return response.data;
  },
  listModules: async (params?: { search?: string; parentId?: number; isActive?: boolean; limit?: number; page?: number }) => {
    const response = await apiClient.get('/access-control/modules/listModules', { params });
    return response.data;
  },
  createModule: async (data: Partial<Module>) => {
    const response = await apiClient.post('/access-control/modules/create', data);
    return response.data;
  },
  updateModule: async (id: number, data: Partial<Module>) => {
    const response = await apiClient.patch(`/access-control/modules/update/${id}`, data);
    return response.data;
  },
  deleteModule: async (id: number) => {
    const response = await apiClient.delete(`/access-control/modules/delete/${id}`);
    return response.data;
  },

  // Role Permissions
  getRolePermissions: async (roleId: number) => {
    const response = await apiClient.get(`/access-control/roles/${roleId}/permissions`);
    return response.data;
  },
  assignRolePermissions: async (roleId: number, permissions: Partial<RolePermission>[]) => {
    const response = await apiClient.post(`/access-control/roles/${roleId}/permissions`, { permissions });
    return response.data;
  },
  removeRolePermission: async (roleId: number, moduleId: number) => {
    const response = await apiClient.delete(`/access-control/roles/${roleId}/permissions/${moduleId}`);
    return response.data;
  },

  // User Overrides
  getUserOverrides: async (userId: number) => {
    const response = await apiClient.get(`/access-control/users/${userId}/overrides`);
    return response.data;
  },
  createOverride: async (userId: number, data: Partial<UserPermissionOverride>) => {
    const response = await apiClient.post(`/access-control/users/${userId}/overrides`, data);
    return response.data;
  },
  revokeOverride: async (id: number) => {
    const response = await apiClient.delete(`/access-control/overrides/${id}`);
    return response.data;
  }
};
