import { apiClient } from './client';
import type { Checkin, CheckinScanResult } from '../types';

export const checkinsApi = {
  scan: async (qrToken: string, eventId: string, method: 'qr_scan' | 'manual_search' = 'qr_scan'): Promise<CheckinScanResult> => {
    try {
      const { data } = await apiClient.post('/checkins/scan', {
        qr_token: qrToken,
        event_id: eventId,
        method,
      });
      return {
        success: true,
        attendee_name: data.attendee_name,
        pass_type: data.pass_type,
        remaining_credits: data.remaining_credits,
        registration_id: data.registration_id,
        check_in_time: data.check_in_time,
      };
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { detail?: string | { code?: string; message?: string; checked_in_at?: string } } }; message?: string };
      const detail = error.response?.data?.detail;
      
      let errorCode = 'CHECKIN_FAILED';
      let errorMessage = 'Check-in failed';
      let checkInTime: string | undefined;

      if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (detail && typeof detail === 'object') {
        errorCode = (detail.code || errorCode).toUpperCase();
        errorMessage = detail.message || errorMessage;
        checkInTime = detail.checked_in_at;
      }

      return {
        success: false,
        error_code: errorCode,
        error_message: errorMessage,
        check_in_time: checkInTime,
      };
    }
  },

  searchForCheckin: async (search: string, eventId: string) => {
    const { data } = await apiClient.post('/checkins/search', {
      search,
      event_id: eventId,
    });
    return data.results || [];
  },

  manualCheckin: async (queryOrRegId: string, eventId: string): Promise<CheckinScanResult> => {
    // 1. Search for attendee by query/regId
    const searchResults = await checkinsApi.searchForCheckin(queryOrRegId, eventId);
    if (!searchResults || searchResults.length === 0) {
      return {
        success: false,
        error_code: 'NOT_FOUND',
        error_message: `No registration found matching "${queryOrRegId}"`,
      };
    }

    const matched = searchResults[0];
    if (!matched.pass?.qr_token) {
      return {
        success: false,
        error_code: 'NO_PASS',
        error_message: 'Attendee has no pass assigned',
      };
    }

    // 2. Perform checkin using attendee's pass qr_token
    return checkinsApi.scan(matched.pass.qr_token, eventId, 'manual_search');
  },

  listByEvent: async (eventId: string): Promise<{ items: Checkin[]; total: number }> => {
    const { data } = await apiClient.get(`/checkins/event/${eventId}`);
    return {
      items: data.items || [],
      total: data.total ?? data.items?.length ?? 0,
    };
  },

  syncOfflineQueue: async (records: Array<{ qr_token: string; event_id: string; method: string; client_timestamp: string; device_id: string }>): Promise<{ synced: number; errors: string[] }> => {
    const { data } = await apiClient.post('/checkins/sync', { records });
    return {
      synced: data.success_count ?? 0,
      errors: (data.errors || []).map((e: { error?: string }) => e.error || 'Sync error'),
    };
  },
};
