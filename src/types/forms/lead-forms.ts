import type { LeadType, LeadStatus } from '@/types/enums/statuses';

export interface LeadFormValues {
  name: string;
  mobile: string;
  email?: string;
  state?: string;
  city?: string;
  district?: string;
  address?: string;
  leadType?: LeadType;
  targetType?: 'TRACTOR' | 'IMPLEMENT';
  targetId?: number;
  tractorId?: number;
  dealerId?: number;
  interestedBrand?: string;
  interestedModel?: string;
  budget?: number;
  message?: string;
  sourcePage?: string;
  sourceCampaign?: string;
}

export interface DetailAccessLeadFormValues {
  targetType: 'TRACTOR' | 'IMPLEMENT';
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

export interface LoanApplicationFormValues {
  name: string;
  mobile: string;
  email?: string;
  state: string;
  district: string;
  tractorModel?: string;
  loanAmount: number;
  tenureYears: number;
  employmentType?: 'FARMER' | 'SALARIED' | 'BUSINESS';
  annualIncome?: number;
}

export interface LeadNoteFormValues {
  noteText: string;
}

export interface CallLogFormValues {
  outcome: 'answered' | 'no_answer' | 'callback' | 'wrong_number';
  durationSec?: number;
  notes?: string;
  recordingUrl?: string;
}

export interface UpdateLeadStatusFormValues {
  status: LeadStatus;
  assignedTo?: number | null;
  intentScore?: number;
  nextFollowupAt?: string | null;
  message?: string;
}
