import { createContext, useCallback, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { http } from '../../shared/api/http';
import { getApiErrorMessage } from '../../shared/api/apiError';
import { refreshToken } from './authApi';
import { authStorage } from './authStorage';
import type { AuthState, AuthUser } from './authStorage';

type LoginInput = {
  mail: string;
  password: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loginAdmin: (input: LoginInput) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState>(() =>
    authStorage.get() ?? { user: null, tokens: null }
  );

  const loginAdmin = useCallback(async (input: LoginInput) => {
    try {
      const res = await http.post('/api/auth/login', {
        mail: input.mail,
        password: input.password,
        userType: 'admin',
      });

      const data = res.data?.data;
      const user = data?.user;
      const tokens = data?.tokens;

      if (!user?.id || !tokens?.accessToken || !tokens?.refreshToken) {
        throw new Error(res.data?.message ?? 'Login failed');
      }

      const next: AuthState = {
        user,
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
          tokenType: tokens.tokenType,
        },
      };

      authStorage.set(next);
      setState(next);
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Login failed'));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const auth = authStorage.get();
      if (auth?.tokens?.refreshToken) {
        // Call refresh-token endpoint to invalidate the token on the server
        await refreshToken({ refreshToken: auth.tokens.refreshToken });
      }
    } catch (error) {
      // Even if the API call fails, we should still clear local auth state
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local storage and state
      authStorage.clear();
      setState({ user: null, tokens: null });
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: state.user,
      isAuthenticated: Boolean(state.tokens?.accessToken),
      loginAdmin,
      logout,
    }),
    [loginAdmin, logout, state.tokens?.accessToken, state.user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
