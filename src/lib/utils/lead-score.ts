import { LeadType, LeadStatus } from '@/types/enums/statuses';

export const HIGH_INTENT_THRESHOLD = 50;
export const MAX_INTENT_SCORE = 100;

export interface IntentInput {
  leadType?: LeadType;
  budget?: number;
  tractorId?: number;
  email?: string;
  message?: string;
}

/**
 * Calculates lead intent score mirroring backend lead.utils.ts logic.
 * Scored 0 - 100 based on buyer engagement and purchase readiness.
 */
export function calculateIntentScore(input: IntentInput): number {
  let score = 10;
  if (input.leadType === ('LOAN' as LeadType) || input.leadType === ('GET_PRICE' as LeadType)) {
    score += 20;
  }
  if (input.leadType === ('TEST_DRIVE' as LeadType) || input.leadType === ('EMI_ENQUIRY' as LeadType)) {
    score += 15;
  }
  if (input.budget !== undefined && input.budget > 0) score += 10;
  if (input.tractorId !== undefined && input.tractorId > 0) score += 10;
  if (input.email !== undefined && input.email.trim().length > 0) score += 5;
  if (input.message !== undefined && input.message.trim().length > 20) score += 5;

  return Math.min(score, MAX_INTENT_SCORE);
}

export type IntentBadgeLevel = 'HOT' | 'WARM' | 'COLD';

export function getIntentBadge(score: number): {
  level: IntentBadgeLevel;
  label: string;
  colorClass: string;
} {
  if (score >= HIGH_INTENT_THRESHOLD) {
    return {
      level: 'HOT',
      label: 'High Intent (Hot)',
      colorClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    };
  }
  if (score >= 30) {
    return {
      level: 'WARM',
      label: 'Medium Intent',
      colorClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    };
  }
  return {
    level: 'COLD',
    label: 'Standard Lead',
    colorClass: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
  };
}

export const STATUS_TRANSITIONS: Record<LeadStatus, readonly LeadStatus[]> = {
  NEW: ['ATTEMPTED', 'CONTACTED', 'SPAM'],
  ATTEMPTED: ['CONTACTED', 'LOST', 'SPAM'],
  CONTACTED: ['QUALIFIED', 'INTERESTED', 'LOST', 'SPAM'],
  QUALIFIED: ['INTERESTED', 'DEALER_ASSIGNED', 'LOST'],
  INTERESTED: ['DEALER_ASSIGNED', 'CONVERTED', 'LOST'],
  DEALER_ASSIGNED: ['CONVERTED', 'LOST'],
  CONVERTED: [],
  LOST: ['NEW'],
  SPAM: [],
  IN_PROGRESS: ['QUALIFIED', 'CONVERTED', 'LOST'],
  CLOSED: [],
};

export const TERMINAL_STATUSES: readonly LeadStatus[] = ['CONVERTED', 'SPAM'];

export function isTerminalStatus(status: LeadStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}
