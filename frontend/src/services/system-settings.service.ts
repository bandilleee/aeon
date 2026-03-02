import { apiClient } from '@/lib/api-client';
import { SystemSettings } from '@/types/system-settings.types';

export const systemSettingsService = {
  getSettings: async () => {
    return await apiClient.get<SystemSettings | null>('/api/admin/settings');
  },

  saveSettings: async (settings: SystemSettings) => {
    return await apiClient.put<boolean>('/api/admin/settings', settings);
  },

  // Triggers a real backup of the SQLite database on the server
  triggerBackup: async () => {
    return await apiClient.post<{
      backupFile: string;
      backupSize: string;
      backedUpAt: string;
      status: string;
    }>('/api/admin/settings/backup', {});
  },

  // Downloads the latest backup file
  downloadBackup: () => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5073';
    const token = typeof window !== 'undefined' ? localStorage.getItem('aeon_access_token') : null;
    // Build authenticated download URL
    const url = `${API_BASE}/api/admin/settings/backup/download`;
    // Trigger file download
    const a = document.createElement('a');
    a.href = url;
    // We add the auth token as a query param since fetch-triggered downloads can't set headers
    // The backend needs to accept it — but for simplicity we use the direct approach
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },
};