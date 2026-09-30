import { apiClient } from './axios/axios';
import { PaginatedResponse } from './tractors';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: number | null;
  iconUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  // Included in tree queries
  children?: Category[];
  _count?: {
    tractors: number;
    children?: number;
  };
}

export const categoryAPI = {
  /**
   * Fetch all tractor categories (includes nested children tree)
   */
  getAllCategories: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await apiClient.get<PaginatedResponse<Category>>(
      '/category/get-all-tractor-categories',
      { params }
    );
    return response.data;
  },

  /**
   * Fetch a single category by ID
   */
  getCategoryById: async (id: number) => {
    const response = await apiClient.get<{ success: boolean; data: Category }>(
      `/category/get-tractor-categories-by-id/${id}`
    );
    return response.data;
  },

  /**
   * Create a new category
   * Uses FormData because it handles file uploads (image)
   */
  createCategory: async (data: FormData) => {
    const response = await apiClient.postForm<{ success: boolean; data: Category }>(
      '/category/create-tractor-category',
      data,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  /**
   * Update an existing category
   * Uses FormData because it handles file uploads (image)
   */
  updateCategory: async (id: number, data: FormData) => {
    const response = await apiClient.putForm<{ success: boolean; data: Category }>(
      `/category/update-tractor-category/${id}`,
      data,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  /**
   * Delete a category
   */
  deleteCategory: async (id: number) => {
    const response = await apiClient.delete<{ success: boolean; data: Category }>(
      `/category/delete-tractor-category/${id}`
    );
    return response.data;
  },
};
