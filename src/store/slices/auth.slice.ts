import type { User } from '@/types/models/user';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

export const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,
};
