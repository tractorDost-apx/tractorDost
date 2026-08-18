import { apiClient } from './axios/axios';

export interface CreateEmiCalculationPayload {
  tractorId?: number;
  tractorPrice: number;
  downPayment: number;
  interestRatePct: number;
  tenureMonths: number;
  repaymentInterval?: 'monthly' | 'quarterly' | 'half_yearly';
}

export interface EmiCalculationResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    userId: number | null;
    tractorId: number | null;
    tractorPrice: number;
    downPayment: number;
    loanAmount: number;
    interestRatePct: number;
    tenureMonths: number;
    repaymentInterval: string;
    monthlyEmi: number;
    totalInterest: number;
    totalPayable: number;
    createdAt: string;
  };
}

export const emiAPI = {
  /**
   * Save a calculated EMI to the database (anonymous or logged-in user)
   */
  saveCalculation: async (data: CreateEmiCalculationPayload) => {
    const response = await apiClient.post<EmiCalculationResponse>('/emi-calculations', data);
    return response.data;
  },

  /**
   * Retrieve all saved EMI calculations (subject to backend access control)
   */
  getCalculations: async (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    userId?: number;
    tractorId?: number;
    tractorModel?: string;
    userName?: string;
    minPrice?: number;
    maxPrice?: number;
    minDownPayment?: number;
    maxDownPayment?: number;
    minLoanAmount?: number;
    maxLoanAmount?: number;
    minInterestRate?: number;
    maxInterestRate?: number;
    minTenure?: number;
    maxTenure?: number;
    minEmi?: number;
    maxEmi?: number;
    repaymentInterval?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await apiClient.get<{ success: boolean; data: any; message?: string }>('/emi-calculations', { params });
    return response.data;
  },

  /**
   * Fetch a single saved calculation details by its ID
   */
  getCalculationById: async (id: number) => {
    const response = await apiClient.get<{ success: boolean; data: any; message?: string }>(`/emi-calculations/${id}`);
    return response.data;
  },

  /**
   * Update an existing EMI calculation record (Admin only)
   */
  updateCalculation: async (id: number, data: Partial<CreateEmiCalculationPayload>) => {
    const response = await apiClient.patch<{ success: boolean; data: any; message?: string }>(`/emi-calculations/${id}`, data);
    return response.data;
  },

  /**
   * Delete an EMI calculation record (Admin only)
   */
  deleteCalculation: async (id: number) => {
    const response = await apiClient.delete<{ success: boolean; data: any; message?: string }>(`/emi-calculations/${id}`);
    return response.data;
  }
};
