import { useState, useEffect, useCallback } from 'react';
import { User, AuthState } from '../types';
import { api } from '../services/api';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Verify session on mount
  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const data = await api.getMe();
        if (isMounted && data?.user) {
          setAuthState({
            user: data.user,
            token: localStorage.getItem('omoor_auth_token'),
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else if (isMounted) {
          setAuthState((prev) => ({
            ...prev,
            isLoading: false,
          }));
        }
      } catch {
        if (isMounted) {
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const signup = useCallback(async (data: { name: string; phone: string; password: string }) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const res = await api.signup(data);
      setAuthState({
        user: res.user,
        token: res.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return res;
    } catch (err: any) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Failed to sign up',
      }));
      throw err;
    }
  }, []);

  const signin = useCallback(async (data: { phone: string; password: string }) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const res = await api.signin(data);
      setAuthState({
        user: res.user,
        token: res.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return res;
    } catch (err: any) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Failed to sign in',
      }));
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));
    try {
      await api.logout();
    } finally {
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  return {
    ...authState,
    signup,
    signin,
    logout,
  };
}
