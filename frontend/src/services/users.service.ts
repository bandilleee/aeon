import { apiClient } from '@/lib/api-client';

// User type matching what the backend returns
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  initials: string;
  avatarUrl?: string;
  role: string;
  status: string;
}

export const usersService = {
  // Get all users (for dropdowns, collaborators, etc.)
  getAllUsers: async () => {
    return await apiClient.get<User[]>('/api/admin/users');
  },

  // Get a single user by ID
  getUserById: async (id: string) => {
    return await apiClient.get<User>(`/api/admin/users/${id}`);
  },
};
