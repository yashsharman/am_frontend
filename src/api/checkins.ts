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
      const error = err as {
        response?: {
          status?: number;
          data?: {
            detail?:
              | string
              | {
                  code?: string;
                  message?: string;
                  checked_in_at?: string;
                  attendee_name?: string;
                  pass_type?: 'one_day' | 'exclusive';
                  remaining_credits?: number;
                  registration_id?: string;
                };
          };
        };
        message?: string;
      };
      const detail = error.response?.data?.detail;
      
      let errorCode = 'CHECKIN_FAILED';
      let errorMessage = 'Check-in failed';
      let checkInTime: string | undefined;
      let attendeeName: string | undefined;
      let passType: 'one_day' | 'exclusive' | undefined;
      let remainingCredits: number | undefined;
      let registrationId: string | undefined;

      if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (detail && typeof detail === 'object') {
        errorCode = (detail.code || errorCode).toUpperCase();
        errorMessage = detail.message || errorMessage;
        checkInTime = detail.checked_in_at;
        attendeeName = detail.attendee_name;
        passType = detail.pass_type;
        remainingCredits = detail.remaining_credits;
        registrationId = detail.registration_id;
      }

      // Fallback: If attendee details weren't in error payload (e.g. older backend or unexpected format),
      // resolve the pass using qrToken to fetch attendee info!
      if (!attendeeName && qrToken) {
        try {
          const { data: passInfo } = await apiClient.get(`/passes/token/${qrToken}`);
          if (passInfo && passInfo.registration) {
            attendeeName = passInfo.registration.attendee_name;
            registrationId = passInfo.registration.registration_id;
            passType = passInfo.pass_type;
            remainingCredits = passInfo.remaining_credits;
          }
        } catch {
          // Ignore fallback fetch error
        }
      }

      return {
        success: false,
        error_code: errorCode,
        error_message: errorMessage,
        check_in_time: checkInTime,
        attendee_name: attendeeName,
        pass_type: passType,
        remaining_credits: remainingCredits,
        registration_id: registrationId,
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
