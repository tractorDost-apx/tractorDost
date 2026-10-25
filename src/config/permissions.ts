import { UserRole } from '@/types/enums/roles';

export const PERMISSIONS = {
  // Admin module permissions
  MANAGE_USERS: ['SUPER_ADMIN', 'ADMIN'] as UserRole[],
  MANAGE_DEALERS: ['SUPER_ADMIN', 'ADMIN', 'STAFF'] as UserRole[],
  MANAGE_CATALOG: ['SUPER_ADMIN', 'ADMIN', 'CONTENT_CREATOR', 'STAFF'] as UserRole[],
  MANAGE_USED_LISTINGS: ['SUPER_ADMIN', 'ADMIN', 'STAFF'] as UserRole[],
  MANAGE_LEADS: ['SUPER_ADMIN', 'ADMIN', 'STAFF'] as UserRole[],
  MANAGE_FINANCE: ['SUPER_ADMIN', 'ADMIN'] as UserRole[],
  MANAGE_CMS: ['SUPER_ADMIN', 'ADMIN', 'CONTENT_CREATOR'] as UserRole[],
  MANAGE_SETTINGS: ['SUPER_ADMIN', 'ADMIN'] as UserRole[],
  VIEW_AUDIT_LOGS: ['SUPER_ADMIN', 'ADMIN'] as UserRole[],
  MANAGE_HR: ['SUPER_ADMIN', 'ADMIN'] as UserRole[],

  // Marketplace permissions
  CREATE_USED_LISTING: ['SUPER_ADMIN', 'ADMIN', 'DEALER', 'SELLER', 'USER'] as UserRole[],
  BOOK_INSPECTION: ['SUPER_ADMIN', 'ADMIN', 'USER', 'DEALER', 'SELLER'] as UserRole[],
};

export function hasPermission(userRole: UserRole | string | undefined, allowedRoles: UserRole[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole as UserRole);
}
