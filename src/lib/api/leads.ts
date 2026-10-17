import { apiClient } from './axios/axios';

export type DetailTargetType = 'TRACTOR' | 'IMPLEMENT';

/** Sent once, on submit of the detail-page lead form. Address and location are optional. */
export interface DetailAccessLeadInput {
  targetType: DetailTargetType;
  targetId: number;
  name?: string;
  mobile?: string;
  state?: string;
  city?: string;
  email?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

/** Grant that opens every tractor and implement detail page. Expires on `expiresAt` (ISO string). */
export interface DetailAccessGrant {
  token: string;
  expiresAt: string;
}

export type LeadType =
  | 'GET_PRICE'
  | 'EMI_ENQUIRY'
  | 'LOAN'
  | 'INSURANCE'
  | 'USED_ENQUIRY'
  | 'SELL'
  | 'DEALER'
  | 'SERVICE'
  | 'CALLBACK'
  | 'BROCHURE'
  | 'COMPARE'
  | 'VALUATION'
  | 'TEST_DRIVE';

export type LeadStatus =
  | 'NEW'
  | 'ATTEMPTED'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'INTERESTED'
  | 'DEALER_ASSIGNED'
  | 'CONVERTED'
  | 'LOST'
  | 'SPAM';

export type CallOutcome = 'answered' | 'no_answer' | 'callback' | 'wrong_number';

export interface LeadNote {
  id: number;
  leadId: number;
  agentId: number;
  noteText: string;
  createdAt: string;
  agent?: {
    id: number;
    fullName: string;
  };
}

export interface CallLog {
  id: number;
  leadId: number;
  agentId: number;
  outcome: CallOutcome;
  durationSec?: number | null;
  notes?: string | null;
  recordingUrl?: string | null;
  calledAt: string;
  agent?: {
    id: number;
    fullName: string;
  };
}

export interface Lead {
  id: number;
  leadType: LeadType;
  sourcePage?: string | null;
  sourceCampaign?: string | null;
  userId?: number | null;
  dealerId?: number | null;
  tractorId?: number | null;
  implmentId?: number | null;
  name: string;
  mobile: string;
  email?: string | null;
  state?: string | null;
  city?: string | null;
  address?: string | null;
  district?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  interestedBrand?: string | null;
  interestedModel?: string | null;
  budget?: number | null;
  message?: string | null;
  assignedTo?: number | null;
  status: LeadStatus;
  intentScore?: number | null;
  isDuplicate: boolean;
  mergedIntoId?: number | null;
  lastFollowupAt?: string | null;
  nextFollowupAt?: string | null;
  convertedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    fullName: string;
    mobile?: string | null;
  } | null;
  assignedAgent?: {
    id: number;
    fullName: string;
  } | null;
  dealer?: {
    id: number;
    businessName: string;
  } | null;
  tractor?: {
    id: number;
    modelName: string;
    brandId?: number;
  } | null;
  notes?: LeadNote[];
  callLogs?: CallLog[];
}

export interface LeadStats {
  total: number;
  byStatus: Record<LeadStatus, number>;
  byType: Record<LeadType, number>;
  todayCount: number;
  highIntentCount: number;
  duplicateCount: number;
  unassignedCount: number;
  followupDueCount: number;
  conversionRate: number;
}

export interface GetLeadsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: LeadStatus | '';
  leadType?: LeadType | '';
  assignment?: 'all' | 'assigned' | 'unassigned';
  assignedTo?: number;
  dealerId?: number;
  tractorId?: number;
  interestedBrand?: string;
  interestedModel?: string;
  sourcePage?: string;
  state?: string;
  district?: string;
  isDuplicate?: boolean;
  followupDue?: boolean;
  needsAttention?: boolean;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'intentScore' | 'status' | 'leadType' | 'nextFollowupAt' | 'updatedAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedLeadsResponse {
  success: boolean;
  message: string;
  data: {
    leads: Lead[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UpdateLeadPayload {
  status?: LeadStatus;
  assignedTo?: number | null;
  dealerId?: number | null;
  intentScore?: number;
  nextFollowupAt?: string | null;
  lastFollowupAt?: string | null;
  isDuplicate?: boolean;
  mergedIntoId?: number | null;
  state?: string;
  city?: string;
  district?: string;
  sourcePage?: string;
  interestedBrand?: string;
  interestedModel?: string;
  budget?: number;
  message?: string;
  name?: string;
  email?: string | null;
}

export interface BulkAssignPayload {
  leadIds: number[];
  assignedTo: number;
}

export interface CreateLeadNotePayload {
  noteText: string;
}

export interface UpdateLeadNotePayload {
  noteText: string;
}

export interface CreateCallLogPayload {
  outcome: CallOutcome;
  durationSec?: number;
  notes?: string;
  recordingUrl?: string;
}

export const leadAPI = {
  /**
   * Records the enquiry from the lead form and returns the visitor's grant.
   */
  createDetailAccessLead: async (input: DetailAccessLeadInput) => {
    const response = await apiClient.post<{
      success: boolean;
      data: { detailAccess: DetailAccessGrant };
    }>('/leads', input);
    return response.data;
  },

  createLead: async (input: Record<string, unknown>) => {
    const response = await apiClient.post<{
      success: boolean;
      data: unknown;
    }>('/leads', input);
    return response.data;
  },

  /**
   * Get paginated leads with filters & sorting
   */
  getLeads: async (params?: GetLeadsParams): Promise<PaginatedLeadsResponse> => {
    const cleanParams: Record<string, any> = {};
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== '' && val !== null) {
          cleanParams[key] = val;
        }
      });
    }
    const response = await apiClient.get<PaginatedLeadsResponse>('/leads', {
      params: cleanParams,
    });
    return response.data;
  },

  /**
   * Get lead details by ID (including call logs and notes)
   */
  getLeadById: async (id: number): Promise<{ success: boolean; data: Lead }> => {
    const response = await apiClient.get<{ success: boolean; data: Lead }>(`/leads/${id}`);
    return response.data;
  },

  /**
   * Update lead status, assignment, dates, etc.
   */
  updateLead: async (id: number, data: UpdateLeadPayload): Promise<{ success: boolean; data: Lead }> => {
    const response = await apiClient.patch<{ success: boolean; data: Lead }>(`/leads/${id}`, data);
    return response.data;
  },

  /**
   * Delete lead (admin only)
   */
  deleteLead: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/leads/${id}`);
    return response.data;
  },

  /**
   * Bulk assign leads to an agent/admin
   */
  bulkAssign: async (data: BulkAssignPayload): Promise<{ success: boolean; data: { updated: number } }> => {
    const response = await apiClient.post<{ success: boolean; data: { updated: number } }>('/leads/bulk-assign', data);
    return response.data;
  },

  /**
   * Get lead stats for dashboard summary cards
   */
  getLeadStats: async (params?: Partial<GetLeadsParams>): Promise<{ success: boolean; data: LeadStats }> => {
    const cleanParams: Record<string, any> = {};
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== '' && val !== null) {
          cleanParams[key] = val;
        }
      });
    }
    const response = await apiClient.get<{ success: boolean; data: LeadStats }>('/leads/stats', {
      params: cleanParams,
    });
    return response.data;
  },

  /**
   * Export leads to Excel (.xlsx) file download
   */
  exportLeads: async (params?: Partial<GetLeadsParams>): Promise<void> => {
    const cleanParams: Record<string, any> = {};
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== '' && val !== null) {
          cleanParams[key] = val;
        }
      });
    }
    const response = await apiClient.get('/leads/export', {
      params: cleanParams,
      responseType: 'blob',
    });

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `leads-export-${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },

  /**
   * Lead Notes
   */
  getLeadNotes: async (leadId: number): Promise<{ success: boolean; data: LeadNote[] }> => {
    const response = await apiClient.get<{ success: boolean; data: LeadNote[] }>(`/leads/${leadId}/notes`);
    return response.data;
  },

  createLeadNote: async (leadId: number, data: CreateLeadNotePayload): Promise<{ success: boolean; data: LeadNote }> => {
    const response = await apiClient.post<{ success: boolean; data: LeadNote }>(`/leads/${leadId}/notes`, data);
    return response.data;
  },

  updateLeadNote: async (leadId: number, noteId: number, data: UpdateLeadNotePayload): Promise<{ success: boolean; data: LeadNote }> => {
    const response = await apiClient.patch<{ success: boolean; data: LeadNote }>(`/leads/${leadId}/notes/${noteId}`, data);
    return response.data;
  },

  deleteLeadNote: async (leadId: number, noteId: number): Promise<{ success: boolean }> => {
    const response = await apiClient.delete<{ success: boolean }>(`/leads/${leadId}/notes/${noteId}`);
    return response.data;
  },

  /**
   * Call Logs
   */
  getCallLogs: async (
    leadId: number,
    params?: { page?: number; limit?: number }
  ): Promise<{ success: boolean; data: { callLogs: CallLog[]; total: number; page: number; limit: number; totalPages: number } }> => {
    const response = await apiClient.get<{
      success: boolean;
      data: { callLogs: CallLog[]; total: number; page: number; limit: number; totalPages: number };
    }>(`/leads/${leadId}/call-logs`, { params });
    return response.data;
  },

  createCallLog: async (leadId: number, data: CreateCallLogPayload): Promise<{ success: boolean; data: CallLog }> => {
    const response = await apiClient.post<{ success: boolean; data: CallLog }>(`/leads/${leadId}/call-logs`, data);
    return response.data;
  },

  deleteCallLog: async (leadId: number, callLogId: number): Promise<{ success: boolean }> => {
    const response = await apiClient.delete<{ success: boolean }>(`/leads/${leadId}/call-logs/${callLogId}`);
    return response.data;
  },
};
