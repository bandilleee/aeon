import api from '@/lib/api';
import { LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth'; // We will define these types

export const authService = {
  // Login
  login: async (credentials: LoginRequest) => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    if (response.data.success) {
      // Store tokens
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
      localStorage.setItem('userEmail', credentials.email);
    }
    return response.data;
  },

  // Register
  register: async (data: RegisterRequest) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        await api.post('/auth/logout', { refreshToken });
    } finally {
        localStorage.clear();
        window.location.href = '/login';
    }
  },

  // Get Current User
  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};