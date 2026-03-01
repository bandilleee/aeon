import { apiClient } from '@/lib/api-client';

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    pending: number;
    admins: number;
  };
  events: {
    total: number;
    pending: number;
    approved: number;
    upcoming: number;
  };
  tasks: {
    total: number;
    todo: number;
    inProgress: number;
    completed: number;
  };
  members: {
    total: number;
    active: number;
  };
  accessRequests: {        // ← NEW
    pending: number;
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
      category: string;
      startDate: string;
      createdAt: string;
    }>;
  };
  pendingApprovals: Array<{
    id: string;
    title: string;
    category: string;
    createdAt: string;
  }>;
}

export const adminDashboardService = {
  getStats: async () => {
    return await apiClient.get<DashboardStats>('/api/admin/dashboard/stats');
  }
};