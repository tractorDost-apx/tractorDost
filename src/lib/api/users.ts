import { apiClient } from './axios/axios';
import { User } from '@/types/models/user';

export interface PaginatedUsersResponse {
  success: boolean;
  message: string;
  data: {
    data: User[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface UserStats {
  totalListings: number;
  activeListings: number;
  totalEnquiries: number;
  totalLeads: number;
  totalLoanApplications: number;
  totalReviews: number;
  memberSince: string;
  lastLogin: string | null;
}

export interface UserStatsResponse {
  success: boolean;
  message: string;
  data: UserStats;
}

export const usersAPI = {
  /**
   * Fetch all users with pagination and filters
   */
  getAllUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: 'true' | 'false';
    kycStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
  }) => {
    const response = await apiClient.get<PaginatedUsersResponse>('/users/getAllUsers', { params });
    return response.data;
  },

  /**
   * Fetch a single user by ID
   */
  getUserById: async (id: number) => {
    const response = await apiClient.get<{ success: boolean; data: User }>(
      `/users/getUserById/${id}`
    );
    return response.data;
  },

  /**
   * Fetch stats for a specific user
   */
  getUserStats: async (id: number) => {
    const response = await apiClient.get<UserStatsResponse>(`/users/getUserStats/${id}`);
    return response.data;
  },

  /**
   * Update a user (Admin)
   */
  updateUserById: async (id: number, data: Partial<User>) => {
    const response = await apiClient.patch<{ success: boolean; data: User }>(
      `/users/updateUserById/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Toggle a user's active status (Admin)
   */
  toggleUserActive: async (id: number) => {
    const response = await apiClient.patch<{
      success: boolean;
      data: { id: number; isActive: boolean; message: string };
    }>(`/users/toggleUserActive/${id}`, {});
    return response.data;
  },

  /**
   * Update the current authenticated user's profile
   */
  updateMe: async (data: Partial<User>) => {
    const response = await apiClient.patch<{ success: boolean; data: User; message: string }>(
      '/users/me',
      data
    );
    return response.data;
  },

  /**
   * Upload profile photo for current user
   */
  uploadProfilePhoto: async (formData: FormData) => {
    const response = await apiClient.post<{
      success: boolean;
      data: { profilePhoto: string };
      message: string;
    }>('/users/me/profile-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Delete profile photo for current user
   */
  deleteProfilePhoto: async () => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      '/users/me/profile-photo'
    );
    return response.data;
  },

  /**
   * Delete current user's account
   */
  deleteMyAccount: async () => {
    const response = await apiClient.delete<{ success: boolean; message: string }>('/users/me');
    return response.data;
  },

  /**
   * Delete a user (Admin only)
   */
  deleteUserById: async (id: number) => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/users/deleteUserById/${id}`
    );
    return response.data;
  },
};

export const userAPI = usersAPI;


