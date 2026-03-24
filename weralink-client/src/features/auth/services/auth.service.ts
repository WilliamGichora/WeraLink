import api from '@/lib/api';
import type { User } from '../context/AuthContext';

export const authService = {
  checkAuth: async (): Promise<User | null> => {
    const response = await api.get('/auth/check-auth');
    return response.data?.data?.user || null;
  },

  login: async (email: string, password: string): Promise<void> => {
    await api.post('/auth/login', { email, password });
  },

  register: async (data: any): Promise<void> => {
    await api.post('/auth/register', data);
  },

  verifyOTP: async (email: string, token: string, type: 'signup' | 'magiclink' = 'signup'): Promise<User | null> => {
    const response = await api.post('/auth/verify-otp', { email, token, type });
    return response.data?.data?.user || null;
  },

  resendOTP: async (email: string, type: 'signup' | 'magiclink' = 'signup'): Promise<void> => {
    await api.post('/auth/resend-otp', { email, type });
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  }
};
