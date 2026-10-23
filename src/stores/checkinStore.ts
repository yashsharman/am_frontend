import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Event, Checkin } from '../types';

interface CheckinState {
  currentEvent: Event | null;
  recentCheckins: Checkin[];
  offlineQueueCount: number;
  setCurrentEvent: (event: Event | null) => void;
  addRecentCheckin: (checkin: Checkin) => void;
  clearRecentCheckins: () => void;
  setOfflineQueueCount: (count: number) => void;
}

export const useCheckinStore = create<CheckinState>()(
  persist(
    (set) => ({
      currentEvent: null,
      recentCheckins: [],
      offlineQueueCount: 0,

      setCurrentEvent: (event) => set({ currentEvent: event }),

      addRecentCheckin: (checkin) =>
        set((state) => ({
          recentCheckins: [checkin, ...state.recentCheckins].slice(0, 10),
        })),

      clearRecentCheckins: () => set({ recentCheckins: [] }),

      setOfflineQueueCount: (count) => set({ offlineQueueCount: count }),
    }),
    {
      name: 'aftermiles-checkin',
      partialize: (state) => ({
        currentEvent: state.currentEvent,
        recentCheckins: state.recentCheckins,
      }),
    }
  )
);
