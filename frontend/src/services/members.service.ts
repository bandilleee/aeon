import { apiClient } from '@/lib/api-client';
import { Member } from '@/types/member.types';

// We create a specific type for creating a member since it doesn't need an ID or joinedAt date yet
export interface CreateMemberData {
  displayName: string;
  email: string;
  phone: string;
  bio: string;
  initials: string;
  status: string;
  role: string;
}

export const memberService = {
  // Read All
  getAllMembers: async () => {
    return await apiClient.get<Member[]>('/api/members');
  },

  // Read One
  getMemberById: async (id: string) => {
    return await apiClient.get<Member>(`/api/members/${id}`);
  },

  // Create
  createMember: async (data: CreateMemberData) => {
    return await apiClient.post<Member>('/api/members', data);
  },

  // Update
  updateMember: async (id: string, data: Partial<Member>) => {
    return await apiClient.put<Member>(`/api/members/${id}`, data);
  },

  // Delete
  deleteMember: async (id: string) => {
    return await apiClient.delete<string>(`/api/members/${id}`);
  }
};