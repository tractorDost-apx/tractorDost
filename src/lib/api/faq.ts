import { apiClient } from './axios/axios';

export type FaqTargetType = 'TRACTOR' | 'BRAND' | 'LOAN' | 'GENERAL' | 'SELL' | 'BUY';

export interface FAQ {
  id: number;
  targetType: FaqTargetType;
  targetId: number | null;
  question: string;
  answer: string;
  category: string | null;
  slug: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFaqInput {
  targetType?: FaqTargetType;
  targetId?: number | null;
  question: string;
  answer: string;
  category?: string | null;
  slug?: string | null;
  sortOrder?: number;
  isPublished?: boolean;
}

export type UpdateFaqInput = Partial<CreateFaqInput>;

export interface ListFaqsQuery {
  targetType?: FaqTargetType;
  targetId?: number;
  category?: string;
  isPublished?: boolean | 'true' | 'false';
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Generate a URL-friendly slug compliant with backend SLUG_RE:
 * /^(?=.*[a-z])[a-z0-9]+(?:-[a-z0-9]+)*$/
 */
export function generateFaqSlug(text: string): string {
  if (!text) return '';
  const clean = text
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);

  // Ensure it contains at least one letter; if not, prepend 'faq-'
  if (clean && !/[a-z]/.test(clean)) {
    return `faq-${clean}`;
  }
  return clean;
}

export const FAQ_TARGET_TYPES: { value: FaqTargetType; label: string; description: string }[] = [
  { value: 'GENERAL', label: 'General', description: 'Platform-wide, about us, general guidelines' },
  { value: 'TRACTOR', label: 'Tractor', description: 'Tractor specifications, models & features' },
  { value: 'BRAND', label: 'Brand', description: 'Manufacturer & OEM specific inquiries' },
  { value: 'LOAN', label: 'Loan & EMI', description: 'Financing, interest rates & EMI schemes' },
  { value: 'BUY', label: 'Buying Guide', description: 'Purchase guidance & documentation' },
  { value: 'SELL', label: 'Selling Guide', description: 'Listing used tractors & valuation' },
];

export const faqAPI = {
  /**
   * Fetch all FAQs with optional filters.
   */
  getAll: async (params?: ListFaqsQuery): Promise<ApiResponse<FAQ[]>> => {
    const queryParams: Record<string, string | number> = {};
    if (params?.targetType) queryParams.targetType = params.targetType;
    if (params?.targetId !== undefined && params?.targetId !== null) queryParams.targetId = params.targetId;
    if (params?.category) queryParams.category = params.category;
    if (params?.isPublished !== undefined && params?.isPublished !== null) {
      queryParams.isPublished = String(params.isPublished);
    }

    const response = await apiClient.get<ApiResponse<FAQ[]>>('/content/faqs', {
      params: queryParams,
    });
    return response.data;
  },

  /**
   * Fetch a single FAQ by its unique slug.
   */
  getBySlug: async (slug: string): Promise<ApiResponse<FAQ>> => {
    const response = await apiClient.get<ApiResponse<FAQ>>(`/content/faqs/${encodeURIComponent(slug)}`);
    return response.data;
  },

  /**
   * Fetch FAQs attached to a specific target type and entity ID.
   */
  getByTarget: async (targetType: FaqTargetType, targetId: number): Promise<ApiResponse<FAQ[]>> => {
    const response = await apiClient.get<ApiResponse<FAQ[]>>(
      `/content/faqs/target/${targetType}/${targetId}`
    );
    return response.data;
  },

  /**
   * Create a new FAQ entry (ADMIN / SUPER_ADMIN required).
   */
  create: async (data: CreateFaqInput): Promise<ApiResponse<FAQ>> => {
    const response = await apiClient.post<ApiResponse<FAQ>>('/content/faqs', data);
    return response.data;
  },

  /**
   * Update an existing FAQ by ID (ADMIN / SUPER_ADMIN required).
   */
  update: async (id: number, data: UpdateFaqInput): Promise<ApiResponse<FAQ>> => {
    const response = await apiClient.patch<ApiResponse<FAQ>>(`/content/faqs/${id}`, data);
    return response.data;
  },

  /**
   * Delete a FAQ entry by ID (ADMIN / SUPER_ADMIN required).
   */
  delete: async (id: number): Promise<ApiResponse<{ success: true }>> => {
    const response = await apiClient.delete<ApiResponse<{ success: true }>>(`/content/faqs/${id}`);
    return response.data;
  },
};
