import { AuthUser, LoginCredentials } from '@/types';

const FAKE_USER: AuthUser = {
  id: 'law-001',
  name: 'Dr. Bruno Landim',
  email: 'bruno@email.com',
  image_url: '/img/homemSpider.jpg',
};

const FAKE_PASSWORD = '123456';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    await delay(800);

    if (credentials.email === FAKE_USER.email && credentials.password === FAKE_PASSWORD) {
      localStorage.setItem('auth_user', JSON.stringify(FAKE_USER));
      return FAKE_USER;
    }

    throw new Error('Email ou senha inválidos');
  },

  async logout(): Promise<void> {
    await delay(300);
    localStorage.removeItem('auth_user');
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    await delay(200);
    const stored = localStorage.getItem('auth_user');
    return stored ? JSON.parse(stored) : null;
  },
};
