import type { LeadStatus } from '@/types/models/used-listing';

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: 'New',
  ATTEMPTED: 'Call Attempted',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  INTERESTED: 'Interested',
  DEALER_ASSIGNED: 'Dealer Assigned',
  CONVERTED: 'Converted',
  LOST: 'Lost',
  SPAM: 'Spam',
};

/** Mirrors VALID_TRANSITIONS in BACKEND usedTractorEnquiry.service.ts */
export const LEAD_STATUS_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  NEW: ['ATTEMPTED', 'SPAM'],
  ATTEMPTED: ['CONTACTED', 'SPAM'],
  CONTACTED: ['QUALIFIED', 'LOST', 'SPAM'],
  QUALIFIED: ['INTERESTED', 'LOST', 'SPAM'],
  INTERESTED: ['CONVERTED', 'LOST', 'SPAM'],
  DEALER_ASSIGNED: ['CONTACTED', 'CONVERTED', 'LOST', 'SPAM'],
  CONVERTED: [],
  LOST: ['SPAM'],
  SPAM: [],
};

export const LEAD_STATUS_STYLES: Record<LeadStatus, string> = {
  NEW: 'bg-lime-400/10 text-lime-400 border-lime-400/30',
  ATTEMPTED: 'bg-sky-400/10 text-sky-300 border-sky-400/30',
  CONTACTED: 'bg-sky-400/10 text-sky-300 border-sky-400/30',
  QUALIFIED: 'bg-violet-400/10 text-violet-300 border-violet-400/30',
  INTERESTED: 'bg-violet-400/10 text-violet-300 border-violet-400/30',
  DEALER_ASSIGNED: 'bg-violet-400/10 text-violet-300 border-violet-400/30',
  CONVERTED: 'bg-lime-500/20 text-lime-300 border-lime-400/40',
  LOST: 'bg-foreground/5 text-muted border-border/50',
  SPAM: 'bg-red-500/10 text-red-400 border-red-500/30',
};

export const LEAD_STATUSES = Object.keys(LEAD_STATUS_LABELS) as LeadStatus[];
