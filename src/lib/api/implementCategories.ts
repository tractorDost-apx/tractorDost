import { apiClient } from './axios/axios';

export interface ImplementCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  iconId?: string;
  parentId?: number;
  sortOrder: number;
  isActive: boolean;
  children?: ImplementCategory[];
  parent?: ImplementCategory;
}

export interface ImplementCategoryTreeResponse {
  success: boolean;
  data: ImplementCategory[];
}

export const implementCategoryAPI = {
  /**
   * Fetch all implement categories (flat list)
   */
  getAllImplementCategories: async () => {
    const response = await apiClient.get<{ success: boolean; data: ImplementCategory[] }>('/implement-categories');
    return response.data;
  },

  /**
   * Fetch all implement categories as a tree (with children)
   */
  getImplementCategoryTree: async () => {
    const response = await apiClient.get<ImplementCategoryTreeResponse>('/implement-categories/tree');
    return response.data;
  },

  /**
   * Fetch all active categories (flat)
   */
  getAllActiveCategoriesFlat: async (params?: { brandId?: number }) => {
    const response = await apiClient.get<{ success: boolean; data: ImplementCategory[] }>('/implement-categories/all-active', { params });
    return response.data;
  },

  /**
   * Fetch a single implement category by ID
   */
  getImplementCategoryById: async (id: number) => {
    const response = await apiClient.get<{ success: boolean; data: ImplementCategory }>(`/implement-categories/${id}`);
    return response.data;
  },

  /**
   * Create a new implement category
   * Uses FormData to handle icon uploads
   */
  createImplementCategory: async (data: FormData) => {
    const response = await apiClient.postForm<{ success: boolean; data: ImplementCategory }>(
      '/implement-categories',
      data,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  /**
   * Update an existing implement category
   * Uses FormData to handle icon uploads
   */
  updateImplementCategory: async (id: number, data: FormData) => {
    const response = await apiClient.patchForm<{ success: boolean; data: ImplementCategory }>(
      `/implement-categories/${id}`,
      data,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  /**
   * Toggle the active status of an implement category
   */
  toggleImplementCategoryActive: async (id: number) => {
    const response = await apiClient.patch<{ success: boolean; data: ImplementCategory }>(`/implement-categories/${id}/toggle-active`);
    return response.data;
  },

  /**
   * Delete an implement category
   */
  deleteImplementCategory: async (id: number) => {
    const response = await apiClient.delete<{ success: boolean; data: null }>(`/implement-categories/${id}`);
    return response.data;
  },

  /**
   * Reorder categories
   */
  reorderCategories: async (id: number, newSortOrder: number) => {
    const response = await apiClient.patch<{ success: boolean; data: ImplementCategory }>(`/implement-categories/${id}/reorder`, { sortOrder: newSortOrder });
    return response.data;
  }
};
