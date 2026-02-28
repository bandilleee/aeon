import { apiClient } from '@/lib/api-client';

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    pending: number;
  };
  events: {
    total: number;
    pending: number;
    approved: number;
    upcoming: number;
  };
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
  };
  members: {
    total: number;
    active: number;
  };
  recent: {
    users: Array<{
      id: string;
      displayName: string;
      email: string;
      role: string;
      status: string;
      createdAt: string;
    }>;
    events: Array<{
      id: string;
      title: string;
      status: string;
      startDate: string;
      createdAt: string;
    }>;
  };
}

export const adminDashboardService = {
  getStats: async () => {
    return await apiClient.get<DashboardStats>('/api/admin/dashboard/stats');
  }
};