export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface User {
  id: number;
  fullName?: string;
  mobile: number; // BigInt from backend might come as string or number, but we type it generally
  email?: string;
  roleId: number;
  role: Role;
  profilePhoto?: string;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  isActive: boolean;
  preferredLanguage: string;
  dealer?: any;
}
