import { apiClient } from './client';
import type { Event, EventFormData, DashboardMetrics } from '../types';

export const eventsApi = {
  list: async (status?: string): Promise<Event[]> => {
    const { data } = await apiClient.get('/events', { params: status ? { status } : undefined });
    return data.items || data.results || (Array.isArray(data) ? data : []);
  },

  get: async (id: string): Promise<Event> => {
    const { data } = await apiClient.get(`/events/${id}`);
    return data;
  },

  create: async (payload: EventFormData): Promise<Event> => {
    const { data } = await apiClient.post('/events', payload);
    return data;
  },

  update: async (id: string, payload: Partial<EventFormData>): Promise<Event> => {
    const { data } = await apiClient.patch(`/events/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/events/${id}`);
  },

  getMetrics: async (eventId: string): Promise<DashboardMetrics> => {
    const { data } = await apiClient.get(`/admin/dashboard/${eventId}`);
    return {
      total_capacity: data.total_capacity ?? 0,
      registered: data.registered ?? 0,
      available_slots: data.available_slots ?? 0,
      payment_pending: data.payment_pending ?? 0,
      checked_in: data.checked_in ?? 0,
      not_arrived: data.not_arrived ?? 0,
      exclusive_members: data.exclusive_members ?? 0,
    };
  },
};
