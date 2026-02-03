import { User, LoginCredentials } from '@/types';
import { api, setToken, removeToken, getToken } from './api';

type LoginResponse = {
  token: string;
  lawyer: User;
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    const res = await api.post<LoginResponse>('/auth/login', credentials);

    if (!res.success || !res.data) {
      throw new Error(res.message || 'Email ou senha inválidos');
    }

    setToken(res.data.token);
    return res.data.lawyer;
  },

  async logout(): Promise<void> {
    removeToken();
  },

  async getCurrentUser(): Promise<User | null> {
    const token = getToken();
    if (!token) return null;

    const res = await api.get<User>('/me');
    if (!res.success || !res.data) {
      removeToken();
      return null;
    }

    return res.data;
  },
};
