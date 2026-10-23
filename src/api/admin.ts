import { apiClient } from './client';
import type { StaffUser } from '../types';

export const adminApi = {
  listStaff: async (): Promise<StaffUser[]> => {
    const { data } = await apiClient.get('/admin/users');
    return data.items || data.results || (Array.isArray(data) ? data : []);
  },

  createStaff: async (payload: { name: string; email: string; password: string; role: string }): Promise<StaffUser> => {
    const { data } = await apiClient.post('/admin/users', payload);
    return data;
  },

  updateStaff: async (id: string, payload: Partial<StaffUser>): Promise<StaffUser> => {
    const { data } = await apiClient.patch(`/admin/users/${id}`, payload);
    return data;
  },

  deactivateStaff: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${id}`);
  },

  activateStaff: async (id: string): Promise<StaffUser> => {
    const { data } = await apiClient.patch(`/admin/users/${id}`, { is_active: true });
    return data;
  },
};
