import { apiClient } from './axios/axios';

export type ContentType =
  | 'BLOG'
  | 'NEWS'
  | 'VIDEO'
  | 'WEB_STORY'
  | 'BUYING_GUIDE'
  | 'COMPARISON';

export type ContentStatus = 'DRAFT' | 'REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';

export type Language = 'EN' | 'HI' | 'MR' | 'TE' | 'TA' | 'PB' | 'BN' | 'GU' | 'KN';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

// ---------------------------------------------------------------------------
// Category Interfaces
// ---------------------------------------------------------------------------

export interface ContentCategory {
  id: number;
  name: string;
  slug: string;
  postType: ContentType;
  parentId: number | null;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  parent?: { id: number; name: string; slug: string } | null;
  children?: {
    id: number;
    name: string;
    slug: string;
    sortOrder: number;
    isActive: boolean;
  }[];
}

export interface CreateContentCategoryInput {
  name: string;
  slug?: string;
  postType: ContentType;
  parentId?: number | null;
  description?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateContentCategoryInput {
  name?: string;
  slug?: string;
  postType?: ContentType;
  parentId?: number | null;
  description?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface ListContentCategoriesParams {
  page?: number;
  limit?: number;
  postType?: ContentType;
  parentId?: number | 'root';
  isActive?: boolean;
  search?: string;
  sortBy?: 'sortOrder' | 'name' | 'id';
  sortOrder?: 'asc' | 'desc';
}

// ---------------------------------------------------------------------------
// Post Interfaces
// ---------------------------------------------------------------------------

export interface ContentPost {
  id: number;
  postType: ContentType;
  title: string;
  slug: string;
  categoryId: number | null;
  authorId: number | null;
  featuredImage: string | null;
  featureImageId: string | null;
  excerpt: string | null;
  contentRichtext: string | null;

  // Video-specific
  youtubeId?: string | null;
  thumbnailUrl?: string | null;
  transcript?: string | null;
  durationSec?: number | null;

  // Web-story-specific
  storySlides?: unknown;

  publishedAt: string | null;
  status: ContentStatus;
  language: Language;

  seoTitle: string | null;
  seoDescription: string | null;
  schemaMarkup?: Record<string, unknown> | null;
  canonicalUrl: string | null;
  tags?: string[] | null;
  relatedModelIds?: number[] | null;

  viewsCount: number;
  readTimeMinutes: number | null;
  isTrending: boolean;

  createdAt: string;
  updatedAt: string;

  category?: {
    id: number;
    name: string;
    slug: string;
    postType?: ContentType;
  } | null;
  author?: {
    id: number;
    fullName: string | null;
  } | null;
}

export interface CreateContentPostInput {
  postType: ContentType;
  title: string;
  slug?: string;
  categoryId?: number | null;
  authorId?: number | null;
  featuredImage?: string | null;
  featureImageId?: string | null;
  excerpt?: string | null;
  contentRichtext?: string | null;

  // Video
  youtubeId?: string | null;
  thumbnailUrl?: string | null;
  transcript?: string | null;
  durationSec?: number | null;

  // Web story
  storySlides?: unknown;

  status?: ContentStatus;
  publishedAt?: string | null;
  language?: Language;

  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  tags?: string[] | null;
  relatedModelIds?: number[] | null;
  readTimeMinutes?: number | null;
  isTrending?: boolean;
}

export interface UpdateContentPostInput extends Partial<CreateContentPostInput> {}

export interface ListContentPostsParams {
  page?: number;
  limit?: number;
  postType?: ContentType;
  categoryId?: number;
  status?: ContentStatus;
  language?: Language;
  authorId?: number;
  isTrending?: boolean;
  search?: string;
  publishedFrom?: string;
  publishedTo?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'viewsCount' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// ---------------------------------------------------------------------------
// API Client Methods
// ---------------------------------------------------------------------------

export const cmsAPI = {
  // Categories
  getCategories: async (params?: ListContentCategoriesParams) => {
    const response = await apiClient.get<ApiResponse<ContentCategory[]>>('/content/categories', {
      params,
    });
    return response.data;
  },

  getCategory: async (idOrSlug: number | string) => {
    const response = await apiClient.get<ApiResponse<ContentCategory>>(
      `/content/categories/${idOrSlug}`
    );
    return response.data;
  },

  createCategory: async (data: CreateContentCategoryInput) => {
    const response = await apiClient.post<ApiResponse<ContentCategory>>(
      '/content/categories',
      data
    );
    return response.data;
  },

  updateCategory: async (id: number, data: UpdateContentCategoryInput) => {
    const response = await apiClient.patch<ApiResponse<ContentCategory>>(
      `/content/categories/${id}`,
      data
    );
    return response.data;
  },

  deleteCategory: async (id: number) => {
    const response = await apiClient.delete<ApiResponse<{ success: true }>>(
      `/content/categories/${id}`
    );
    return response.data;
  },

  // Posts
  getPosts: async (params?: ListContentPostsParams) => {
    const response = await apiClient.get<ApiResponse<ContentPost[]>>('/content/posts', {
      params,
    });
    return response.data;
  },

  getPost: async (idOrSlug: number | string) => {
    const response = await apiClient.get<ApiResponse<ContentPost>>(`/content/posts/${idOrSlug}`);
    return response.data;
  },

  createPost: async (data: CreateContentPostInput) => {
    const response = await apiClient.post<ApiResponse<ContentPost>>('/content/posts', data);
    return response.data;
  },

  updatePost: async (id: number, data: UpdateContentPostInput) => {
    const response = await apiClient.patch<ApiResponse<ContentPost>>(`/content/posts/${id}`, data);
    return response.data;
  },

  deletePost: async (id: number) => {
    const response = await apiClient.delete<ApiResponse<{ success: true }>>(`/content/posts/${id}`);
    return response.data;
  },
};
