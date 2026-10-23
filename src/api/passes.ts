import { apiClient } from './client';
import type { Pass } from '../types';

export const passesApi = {
  get: async (id: string): Promise<Pass> => {
    const { data } = await apiClient.get(`/passes/${id}/`);
    return data;
  },

  getByRegistration: async (registrationId: string): Promise<Pass> => {
    const { data } = await apiClient.get(`/passes/by-registration/${registrationId}/`);
    return data;
  },

  deactivate: async (id: string): Promise<Pass> => {
    const { data } = await apiClient.post(`/passes/${id}/deactivate/`);
    return data;
  },

  activate: async (id: string): Promise<Pass> => {
    const { data } = await apiClient.post(`/passes/${id}/activate/`);
    return data;
  },
};
