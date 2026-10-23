import { apiClient } from './client';
import type { Registration, RegistrationFormData } from '../types';

interface RegistrationFilters {
  event_id?: string;
  payment_status?: string;
  pass_type?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export const registrationsApi = {
  list: async (filters?: RegistrationFilters): Promise<{ results: Registration[]; count: number }> => {
    const { data } = await apiClient.get('/registrations', { params: filters });
    const results = data.items || data.results || (Array.isArray(data) ? data : []);
    const count = data.total ?? data.count ?? results.length;
    return { results, count };
  },

  get: async (id: string): Promise<Registration> => {
    const { data } = await apiClient.get(`/registrations/${id}`);
    return data;
  },

  create: async (payload: RegistrationFormData): Promise<Registration> => {
    const { data } = await apiClient.post('/registrations', payload);
    const reg = data.registration || data;
    if (data.pass) {
      reg.pass = data.pass;
    }
    return reg;
  },

  update: async (id: string, payload: Partial<RegistrationFormData>): Promise<Registration> => {
    const { data } = await apiClient.patch(`/registrations/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/registrations/${id}`);
  },

  importFile: async (file: File): Promise<{ success_count: number; error_count: number; errors: Array<{ row: number; error: string }> }> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post('/registrations/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  bulkImport: async (records: Partial<RegistrationFormData>[]): Promise<{ created: number; errors: string[] }> => {
    // If backend only has file import, we create registrations sequentially or post
    let created = 0;
    const errors: string[] = [];

    for (const record of records) {
      try {
        await registrationsApi.create(record as RegistrationFormData);
        created++;
      } catch (err: unknown) {
        const error = err as { response?: { data?: { detail?: string } }; message?: string };
        errors.push(error.response?.data?.detail || error.message || 'Unknown error');
      }
    }
    return { created, errors };
  },
};
