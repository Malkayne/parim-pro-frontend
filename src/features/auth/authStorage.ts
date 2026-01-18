export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  tokenType?: string;
};

export type AuthUser = {
  id: string;
  fullName: string;
  mail: string;
  phoneNumber?: string;
  isVerified?: boolean;
  role?: string;
  permissions?: string[];
};

export type AuthState = {
  user: AuthUser | null;
  tokens: AuthTokens | null;
};

const STORAGE_KEY = 'parim.auth';

export const authStorage = {
  get(): AuthState | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthState;
    } catch {
      return null;
    }
  },

  set(state: AuthState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY);
  },
};
