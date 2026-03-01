import { apiClient } from '@/lib/api-client';
import { SystemSettings } from '@/types/system-settings.types';

export const systemSettingsService = {
  getSettings: async () => {
    return await apiClient.get<SystemSettings>('/api/admin/settings');
  },
  saveSettings: async (settings: SystemSettings) => {
    return await apiClient.put<boolean>('/api/admin/settings', settings);
  },
};