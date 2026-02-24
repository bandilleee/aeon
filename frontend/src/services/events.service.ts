import { apiClient } from '@/lib/api-client';

// We'll use 'any' for the data types temporarily until we see your exact Event interfaces, 
// but this wires up all the actual API calls!
export const eventService = {
  // Read All
  getAllEvents: async () => {
    return await apiClient.get<any[]>('/api/events');
  },

  // Read One
  getEventById: async (id: string) => {
    return await apiClient.get<any>(`/api/events/${id}`);
  },

  // Create
  createEvent: async (data: any) => {
    return await apiClient.post<any>('/api/events', data);
  },

  // Update
  updateEvent: async (id: string, data: any) => {
    return await apiClient.put<any>(`/api/events/${id}`, data);
  },

  // Delete
  deleteEvent: async (id: string) => {
    return await apiClient.delete<any>(`/api/events/${id}`);
  }
};