import { apiClient } from '@/lib/api-client';

export interface UserSettings {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  phone: string;
  bio: string;
  avatarUrl: string;
  emailNotifications: boolean;
  eventNotifications: boolean;
  taskNotifications: boolean;
  memberNotifications: boolean;
  twoFactorEnabled: boolean;
}

export const settingsService = {
  getSettings: async (userId: string) => {
    return await apiClient.get<UserSettings>(`/api/settings/${userId}`);
  },

  updateProfile: async (userId: string, data: Partial<UserSettings>) => {
    return await apiClient.put<UserSettings>(`/api/settings/profile/${userId}`, data);
  },

  updateNotifications: async (userId: string, data: Partial<UserSettings>) => {
    return await apiClient.put<UserSettings>(`/api/settings/notifications/${userId}`, data);
  },

  // ✅ FIXED — wraps boolean in object to match Toggle2faDto on backend
  toggle2FA: async (userId: string, isEnabled: boolean) => {
    return await apiClient.put<UserSettings>(`/api/settings/2fa/${userId}`, { enabled: isEnabled });
  },

  changePassword: async (userId: string, data: { currentPassword: string; newPassword: string }) => {
    return await apiClient.post<string>(`/api/settings/password/${userId}`, data);
  },
};