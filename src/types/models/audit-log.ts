/** The user who performed the action; null on the log when that user no longer exists */
export interface AuditActorInfo {
  id: number;
  fullName: string | null;
  /** fullName, or the account email when the profile has no name */
  displayName: string | null;
  role: string | null;
}

/** Display name of the affected record, looked up live. label is null when it cannot be resolved. */
export interface AuditTargetInfo {
  entityType: string;
  id: number | null;
  label: string | null;
}

/** One row of the backend audit trail (read-only) */
export interface AuditLog {
  id: number;
  userId: number;
  action: string;
  entityType: string;
  entityId: number | null;
  oldValue: unknown;
  newValue: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  actor: AuditActorInfo | null;
  target: AuditTargetInfo;
}

export interface AuditLogPage {
  logs: AuditLog[];
  meta: {
    totalItems: number;
    itemCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export interface AuditLogListParams {
  page?: number;
  limit?: number;
  userId?: number;
  action?: string;
  entityType?: string;
  entityId?: number;
  /** ISO-8601 timestamps */
  from?: string;
  to?: string;
}

