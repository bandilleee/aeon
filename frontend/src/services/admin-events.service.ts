import { apiClient } from '@/lib/api-client';
import { Event, EventAttendee } from '@/types/event.types';

export const adminEventsService = {
  // --- EVENTS ---
  getAllEvents: async () => {
    return await apiClient.get<Event[]>('/api/admin/events');
  },

  updateEventStatus: async (id: string, status: string, reason?: string) => {
    return await apiClient.put<boolean>(`/api/admin/events/${id}/status`, { status, reason });
  },

  // --- ATTENDEES ---
  getEventAttendees: async (eventId: string) => {
    return await apiClient.get<EventAttendee[]>(`/api/admin/events/${eventId}/attendees`);
  },

  addAttendee: async (eventId: string, attendeeData: any) => {
    return await apiClient.post<{ id: string }>(`/api/admin/events/${eventId}/attendees`, attendeeData);
  },

  updateAttendeeStatus: async (attendeeId: string, status: string) => {
    return await apiClient.put<boolean>(`/api/admin/events/attendees/${attendeeId}/status`, { status });
  },

  removeAttendee: async (attendeeId: string) => {
    return await apiClient.delete<boolean>(`/api/admin/events/attendees/${attendeeId}`);
  }
};