import Dexie, { type Table } from 'dexie';

export interface PendingCheckin {
  id?: number;
  qr_token: string;
  event_id: string;
  method: 'qr_scan' | 'manual_search';
  client_timestamp: string;
  device_id: string;
  synced?: boolean;
}

export interface CachedAttendee {
  pass_id: string;
  event_id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  cached_at: number;
}

class OfflineDatabase extends Dexie {
  pendingCheckins!: Table<PendingCheckin>;
  cachedAttendees!: Table<CachedAttendee>;

  constructor() {
    super('AftermilesDB');
    this.version(1).stores({
      pendingCheckins: '++id, qr_token, event_id, synced',
      cachedAttendees: 'pass_id, event_id, cached_at',
    });
  }
}

export const db = new OfflineDatabase();
