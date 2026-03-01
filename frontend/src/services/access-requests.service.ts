import { apiClient } from '@/lib/api-client';

export interface AccessRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewNote?: string;
  reviewedAt?: string;
  createdAt: string;
}

export const accessRequestsService = {
  getAll: async (status?: string) => {
    const endpoint = status
      ? `/api/admin/access-requests?status=${status}`
      : '/api/admin/access-requests';
    return await apiClient.get<AccessRequest[]>(endpoint);
  },

  approve: async (id: string, data: { role?: string; temporaryPassword?: string; note?: string; reviewedBy?: string }) => {
    return await apiClient.put<object>(`/api/admin/access-requests/${id}/approve`, data);
  },

  reject: async (id: string, data: { reason: string; reviewedBy?: string }) => {
    return await apiClient.put<object>(`/api/admin/access-requests/${id}/reject`, data);
  },
};