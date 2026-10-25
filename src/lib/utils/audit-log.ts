import type { AuditLog } from '@/types/models/audit-log';

/** Readable names for the entity types the backend records (AUDIT_ENTITY_TYPES) */
const ENTITY_NOUNS: Record<string, string> = {
  Dealer: 'dealer',
  DealerBrand: 'dealer brand',
  DealerInventory: 'dealer inventory item',
  Showroom: 'showroom',
  ServiceCenter: 'service center',
  ServiceBooking: 'service booking',
  Employee: 'employee',
  Implement: 'implement',
  UsedTractorDocument: 'used tractor document',
  UsedTractorListing: 'used tractor listing',
  UserPermissionOverride: 'user permission override',
  User: 'user',
};

const VERBS_PAST: Record<string, string> = {
  CREATE: 'Created',
  UPDATE: 'Updated',
  DELETE: 'Deleted',
  VERIFY: 'Verified',
  TERMINATE: 'Terminated',
  VIEW: 'Viewed',
  APPROVE: 'Approved',
  REJECT: 'Rejected',
};

const withArticle = (noun: string) => `${/^[aeiou]/i.test(noun) ? 'an' : 'a'} ${noun}`;

/** "UsedTractorListing" -> "used tractor listing" for entity types not in the table */
const humanizeEntity = (entityType: string) =>
  ENTITY_NOUNS[entityType] ??
  entityType
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase();

/**
 * Turns the stored action code into a sentence. Only the action and entity on the record are used;
 * codes we do not recognise are shown as-is rather than guessed at.
 */
export function describeAuditAction(log: Pick<AuditLog, 'action' | 'entityType'>): string {
  const noun = humanizeEntity(log.entityType);
  const action = log.action.toUpperCase();

  // Specific codes first
  if (action === 'VIEW_EMPLOYEE_SENSITIVE') return 'Viewed sensitive employee information';
  if (action === 'UPDATE_USER_ROLE') return "Changed a user's role";
  if (action === 'CREATE_EMPLOYEE') return 'Created a new employee';
  if (action === 'TERMINATE_EMPLOYEE') return 'Terminated an employee';

  const parts = action.split('_');
  const verb = VERBS_PAST[parts[0]];
  if (!verb) return `Performed "${action.replace(/_/g, ' ').toLowerCase()}" on ${noun}`;

  // Generic CREATE/UPDATE/DELETE/VERIFY, or VERB_ENTITY such as UPDATE_DEALER / UPDATE_EMPLOYEE
  const rest = parts.slice(1).join(' ').toLowerCase();
  const subject = rest || noun;
  if (parts[0] === 'CREATE') return `Created a new ${subject}`;
  if (parts[0] === 'UPDATE') return `Updated ${subject} information`;
  return `${verb} ${withArticle(subject)}`;
}

/** Affected record: real name and DB ID, with an honest fallback when the name cannot be resolved */
export function describeAuditTarget(log: Pick<AuditLog, 'entityType' | 'entityId' | 'target'>): string {
  const noun = humanizeEntity(log.entityType);
  const title = noun.charAt(0).toUpperCase() + noun.slice(1);
  const hasId = log.entityId !== null && log.entityId !== undefined;
  const idPart = hasId ? ` (DB ID: ${log.entityId})` : '';
  if (log.target?.label) return `${title}: ${log.target.label}${idPart}`;
  return hasId ? `${title}: name unavailable${idPart}` : title;
}

/** Actor name + DB ID. Distinguishes "account exists but has no name" from "account not found". */
export function describeAuditActor(log: Pick<AuditLog, 'userId' | 'actor'>): {
  name: string;
  role: string | null;
} {
  const idPart = `(DB ID: ${log.userId})`;
  if (!log.actor) return { name: `Unknown or removed user ${idPart}`, role: null };
  const name = log.actor.displayName?.trim() || log.actor.fullName?.trim();
  return {
    name: name ? `${name} ${idPart}` : `Unnamed account ${idPart}`,
    role: log.actor.role,
  };
}
export const formatRoleName = (role: string | null) =>
  role ? role.charAt(0) + role.slice(1).toLowerCase().replace(/_/g, ' ') : null;

export interface AuditChangeRow {
  field: string;
  before: string;
  after: string;
}

const show = (value: unknown): string =>
  value === undefined ? '—' : typeof value === 'string' ? value : JSON.stringify(value);

const isRecord = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object' && !Array.isArray(v);

/**
 * What the record stored, flattened for display. `fieldsOnly` is set when the backend recorded just the
 * names of changed fields (values are deliberately not stored for confidential data).
 */
export function getAuditChanges(log: Pick<AuditLog, 'oldValue' | 'newValue'>): {
  rows: AuditChangeRow[];
  fieldsOnly: string[] | null;
} {
  const oldV = isRecord(log.oldValue) ? log.oldValue : null;
  const newV = isRecord(log.newValue) ? log.newValue : null;

  if (!oldV && newV && Array.isArray(newV.fields) && Object.keys(newV).length === 1) {
    return { rows: [], fieldsOnly: newV.fields.map(String) };
  }

  const keys = [...new Set([...Object.keys(oldV ?? {}), ...Object.keys(newV ?? {})])];
  return {
    rows: keys.map((field) => ({
      field,
      before: oldV && field in oldV ? show(oldV[field]) : '—',
      after: newV && field in newV ? show(newV[field]) : '—',
    })),
    fieldsOnly: null,
  };
}


/**
 * Filter options. These mirror AUDIT_ACTIONS / AUDIT_ENTITY_TYPES in
 * BACKEND/src/module/affinity/auditLog/auditLog.types.ts, which the API validates against;
 * a value missing here cannot be filtered on until it is added in both places.
 */
export const AUDIT_ACTION_OPTIONS = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'VERIFY',
  'UPDATE_DEALER',
  'CREATE_EMPLOYEE',
  'UPDATE_EMPLOYEE',
  'TERMINATE_EMPLOYEE',
  'VIEW_EMPLOYEE_SENSITIVE',
] as const;

export const AUDIT_ENTITY_OPTIONS = [
  'Dealer',
  'DealerBrand',
  'DealerInventory',
  'Showroom',
  'ServiceCenter',
  'ServiceBooking',
  'Employee',
  'Implement',
  'UsedTractorDocument',
  'UsedTractorListing',
  'UserPermissionOverride',
] as const;

/** Label for an entity type in a dropdown, e.g. "Used tractor listing" */
export function entityTypeLabel(entityType: string): string {
  const noun = humanizeEntity(entityType);
  return noun.charAt(0).toUpperCase() + noun.slice(1);
}
