export type Role =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'CONTENT_CREATOR'
  | 'STAFF'
  | 'USER'
  | 'DEALER'
  | 'DEALER_STAFF'
  | 'SELLER';

export const ROLES: Record<Role, Role> = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  CONTENT_CREATOR: 'CONTENT_CREATOR',
  STAFF: 'STAFF',
  USER: 'USER',
  DEALER: 'DEALER',
  DEALER_STAFF: 'DEALER_STAFF',
  SELLER: 'SELLER',
};

export type UserRole = Role;

export type Language = 'EN' | 'HI' | 'MR';
export const LANGUAGES: readonly Language[] = ['EN', 'HI', 'MR'] as const;
