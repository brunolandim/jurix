import { AuthUser, LoginCredentials } from '@/types';
import { api, setToken, removeToken, getToken } from './api';

type LoginResponse = {
  token: string;
  user: AuthUser;
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const res = await api.post<LoginResponse>('/auth', credentials);

    if (!res.success || !res.data) {
      throw new Error('Email ou senha inválidos');
    }

    setToken(res.data.token);
    return res.data.user;
  },

  async logout(): Promise<void> {
    removeToken();
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    const token = getToken();
    if (!token) return null;

    const res = await api.get<AuthUser>('/me');
    if (!res.success || !res.data) {
      removeToken();
      return null;
    }

    return res.data;
  },
};
