import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checkinsApi } from '../api/checkins';
import { useCheckinStore } from '../stores/checkinStore';
import { db } from '../db/offlineDb';
import { useOffline } from './useOffline';
import type { CheckinScanResult, Checkin } from '../types';
import toast from 'react-hot-toast';

export function useCheckin() {
  const queryClient = useQueryClient();
  const { currentEvent, addRecentCheckin } = useCheckinStore();
  const { isOffline } = useOffline();
  const [lastResult, setLastResult] = useState<CheckinScanResult | null>(null);

  const scanMutation = useMutation({
    mutationFn: async ({ qrToken, eventId }: { qrToken: string; eventId: string }) => {
      if (isOffline) {
        // Queue for later sync
        await db.pendingCheckins.add({
          qr_token: qrToken,
          event_id: eventId,
          method: 'qr_scan',
          client_timestamp: new Date().toISOString(),
          device_id: navigator.userAgent.slice(0, 50),
        });
        return {
          success: true,
          attendee_name: 'Queued (Offline)',
          error_message: 'Check-in queued for sync when online',
        } as CheckinScanResult;
      }
      return checkinsApi.scan(qrToken, eventId);
    },
    onSuccess: (result) => {
      setLastResult(result);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['checkins-event'] });
        queryClient.invalidateQueries({ queryKey: ['event-metrics'] });
        queryClient.invalidateQueries({ queryKey: ['checkins-history'] });
        // Add to recent list
        queryClient.invalidateQueries({ queryKey: ['checkins-event'] });
        queryClient.invalidateQueries({ queryKey: ['event-metrics'] });
        queryClient.invalidateQueries({ queryKey: ['checkins-history'] });
        const checkin: Checkin = {
          id: crypto.randomUUID(),
          pass_id: '',
          registration_id: result.registration_id || '',
          event_id: currentEvent?.id || '',
          checked_in_at: result.check_in_time || new Date().toISOString(),
          checked_in_by: '',
          method: 'qr_scan',
          attendee_name: result.attendee_name,
        };
        addRecentCheckin(checkin);
      }
    },
    onError: (error) => {
      console.error('Check-in error:', error);
      setLastResult({
        success: false,
        error_code: 'NETWORK_ERROR',
        error_message: 'Network error. Please try again.',
      });
    },
  });

  const manualCheckinMutation = useMutation({
    mutationFn: ({ registrationId, eventId }: { registrationId: string; eventId: string }) =>
      checkinsApi.manualCheckin(registrationId, eventId),
    onSuccess: (result) => {
      setLastResult(result);
      if (result.success) {
        toast.success(`Checked in: ${result.attendee_name}`);
        queryClient.invalidateQueries({ queryKey: ['checkins-event'] });
        queryClient.invalidateQueries({ queryKey: ['event-metrics'] });
        queryClient.invalidateQueries({ queryKey: ['checkins-history'] });
        const checkin: Checkin = {
          id: crypto.randomUUID(),
          pass_id: '',
          registration_id: result.registration_id || '',
          event_id: currentEvent?.id || '',
          checked_in_at: result.check_in_time || new Date().toISOString(),
          checked_in_by: '',
          method: 'manual_search',
          attendee_name: result.attendee_name,
        };
        addRecentCheckin(checkin);
      } else {
        toast.error(result.error_message || 'Check-in failed');
      }
    },
    onError: () => {
      toast.error('Manual check-in failed');
    },
  });

  const clearResult = () => setLastResult(null);

  const syncOfflineQueue = async () => {
    if (isOffline) return;
    const pending = await db.pendingCheckins.where('synced').equals(0).toArray();
    if (pending.length === 0) return;

    try {
      const result = await checkinsApi.syncOfflineQueue(
        pending.map((p) => ({
          qr_token: p.qr_token,
          event_id: p.event_id,
          method: p.method,
          client_timestamp: p.client_timestamp,
          device_id: p.device_id,
        }))
      );
      await db.pendingCheckins.bulkDelete(pending.map((p) => p.id!));
      toast.success(`Synced ${result.synced} offline check-ins`);
    } catch {
      toast.error('Failed to sync offline queue');
    }
  };

  return {
    lastResult,
    clearResult,
    scan: ({ qrToken, eventId }: { qrToken: string; eventId: string }) => {
      if (scanMutation.isPending) return;
      scanMutation.mutate({ qrToken, eventId });
    },
    manualCheckin: manualCheckinMutation.mutate,
    isScanning: scanMutation.isPending,
    isManualChecking: manualCheckinMutation.isPending,
    syncOfflineQueue,
    currentEvent,
  };
}
