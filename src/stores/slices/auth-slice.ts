import { StateCreator } from 'zustand';
import { AuthUser, LoginCredentials } from '@/types';
import { authService } from '@/services';

export interface AuthSlice {
  auth: {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
  };
  authActions: {
    initialize: () => Promise<void>;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
  };
}

export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (set) => ({
  auth: {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  },
  authActions: {
    initialize: async () => {
      const user = await authService.getCurrentUser();
      set({
        auth: {
          user,
          isAuthenticated: !!user,
          isLoading: false,
          error: null,
        },
      });
    },
    login: async (credentials) => {
      set((state) => ({ auth: { ...state.auth, isLoading: true, error: null } }));
      try {
        const user = await authService.login(credentials);
        set({
          auth: {
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          },
        });
      } catch (err) {
        set((state) => ({
          auth: {
            ...state.auth,
            isLoading: false,
            error: err instanceof Error ? err.message : 'Erro ao fazer login',
          },
        }));
        throw err;
      }
    },
    logout: async () => {
      set((state) => ({ auth: { ...state.auth, isLoading: true } }));
      await authService.logout();
      set({
        auth: {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        },
      });
    },
  },
});
