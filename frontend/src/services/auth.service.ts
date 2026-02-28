import { apiClient } from '@/lib/api-client';

export const authService = {
  // 1. Request Access (Register)
  requestAccess: async (data: { firstName: string; lastName: string; email: string; reason: string }) => {
    return await apiClient.post('/api/auth/request-access', data);
  },

  // 2. Login (For your login page)
  login: async (credentials: any) => {
    return await apiClient.post('/api/auth/login', credentials);
  },

  // 3. Forgot Password
  forgotPassword: async (email: string) => {
    return await apiClient.post('/api/auth/forgot-password', { email });
  },

  // 4. Reset Password
  resetPassword: async (data: any) => {
    return await apiClient.post('/api/auth/reset-password', data);
  },

  // 5. Verify 2FA Setup
  verify2FA: async (userId: string, code: string) => {
    return await apiClient.post(`/api/auth/verify-2fa/${userId}`, { code });
  }
};