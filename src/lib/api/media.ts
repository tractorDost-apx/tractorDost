import { apiClient } from './axios/axios';
import { PaginatedResponse } from './tractors';

export interface Media {
  id: number;
  targetType: string;
  targetId: number;
  url: string;
  fileId?: string;
  mimeType?: string;
  mediaType: string;
  altText?: string;
  caption?: string;
  isPrimary: boolean;
  sortOrder: number;
  fileSize?: number;
  width?: number;
  height?: number;
  createdAt: string;
  updatedAt: string;
}

export const mediaAPI = {
  /**
   * Fetch all media items
   */
  getAllMedia: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    targetType?: string;
    targetId?: number;
  }) => {
    const response = await apiClient.get<PaginatedResponse<Media>>('/media/getAll', { params });
    return response.data;
  },

  /**
   * Upload and create new media item(s)
   */
  createMedia: async (data: FormData) => {
    const response = await apiClient.post<{ success: boolean; data: Media[] }>(
      '/media/create',
      data
    );
    return response.data;
  },

  /**
   * Fetch media items by target ID
   * GET /media/getByTargetId/:id
   */
  getByTargetId: async (id: number) => {
    const response = await apiClient.get<{ success: boolean; data: Media[] }>(
      `/media/getByTargetId/${id}`
    );
    return response.data;
  },

  /**
   * Delete a media item
   */
  deleteMedia: async (id: number) => {
    const response = await apiClient.delete<{ success: boolean; data: Media }>(
      `/media/delete/${id}`
    );
    return response.data;
  },
};

