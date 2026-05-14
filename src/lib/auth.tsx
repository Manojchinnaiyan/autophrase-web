import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { api, ApiError } from './api';
import type { AccountStatus } from './types';

interface AuthCtx {
  status: AccountStatus | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signin: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  signout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AccountStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const s = await api.me();
      setStatus(s);
    } catch (err) {
      // 401 from /api/me just means "not signed in" — keep status null, no toast.
      if (!(err instanceof ApiError && err.status === 401)) {
        console.error('auth refresh failed', err);
      }
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signin = useCallback(
    async (email: string, password: string) => {
      await api.signin(email, password);
      await refresh();
    },
    [refresh],
  );

  const signup = useCallback(
    async (email: string, password: string) => {
      await api.signup(email, password);
      await refresh();
    },
    [refresh],
  );

  const signout = useCallback(async () => {
    await api.signout();
    setStatus(null);
  }, []);

  return (
    <Ctx.Provider value={{ status, loading, refresh, signin, signup, signout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
