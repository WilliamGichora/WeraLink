import api from '@/lib/api';
import type { User } from '../context/AuthContext';

export const authService = {
  checkAuth: async (): Promise<User | null> => {
    const response = await api.get('/auth/check-auth');
    return response.data?.data?.user || null;
  },

  login: async (email: string, password: string): Promise<any> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data?.data;
  },

  register: async (data: any): Promise<void> => {
    await api.post('/auth/register', data);
  },

  verifyOTP: async (email: string, token: string, type: 'signup' | 'magiclink' | 'recovery' = 'signup', rememberMe: boolean = true): Promise<User | null> => {
    const response = await api.post('/auth/verify-otp', { email, token, type, rememberMe });
    return response.data?.data?.user || null;
  },

  resendOTP: async (email: string, type: 'signup' | 'magiclink' | 'recovery' = 'signup'): Promise<void> => {
    await api.post('/auth/resend-otp', { email, type });
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  updatePassword: async (newPassword: string): Promise<void> => {
    await api.post('/auth/update-password', { newPassword });
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  }
};
