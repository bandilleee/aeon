import { apiClient } from '@/lib/api-client';

export const eventService = {
  getAllEvents: async () => {
    return await apiClient.get<any[]>('/api/events');
  },
  getEventById: async (id: string) => {
    return await apiClient.get<any>(`/api/events/${id}`);
  },
  createEvent: async (data: any) => {
    return await apiClient.post<any>('/api/events', data);
  },
  updateEvent: async (id: string, data: any) => {
    return await apiClient.put<any>(`/api/events/${id}`, data);
  },
  deleteEvent: async (id: string) => {
    return await apiClient.delete<any>(`/api/events/${id}`);
  },

  // ── SELF-REGISTRATION ─────────────────────────────────────────────────
  registerForEvent: async (id: string) => {
    return await apiClient.post<any>(`/api/events/${id}/register`, {});
  },
  cancelRegistration: async (id: string) => {
    return await apiClient.delete<any>(`/api/events/${id}/register`);
  },
  getEventAttendees: async (id: string) => {
    return await apiClient.get<any[]>(`/api/events/${id}/attendees`);
  },
};