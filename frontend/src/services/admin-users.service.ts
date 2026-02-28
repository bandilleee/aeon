import { apiClient } from '@/lib/api-client';
import { AdminUser, AccountStatus, AdminPermissions } from '@/types/admin-user.types';

export const adminUsersService = {
  getAllUsers: async () => {
    return await apiClient.get<AdminUser[]>('/api/admin/users');
  },

  createUser: async (userData: any) => {
    return await apiClient.post<{ message: string; id: string }>('/api/admin/users', userData);
  },

  deleteUser: async (id: string) => {
    return await apiClient.delete<boolean>(`/api/admin/users/${id}`);
  },

  updateUser: async (id: string, data: any) => {
    return await apiClient.put<boolean>(`/api/admin/users/${id}`, data);
  },
  
  updateStatus: async (id: string, status: AccountStatus, reason?: string) => {
    return await apiClient.put<boolean>(`/api/admin/users/${id}/status`, { status, reason });
  },

  updatePermissions: async (id: string, permissions: AdminPermissions) => {
    return await apiClient.put<boolean>(`/api/admin/users/${id}/permissions`, { permissions });
  }
};