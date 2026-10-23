import { useOffline } from '../../hooks/useOffline';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const { isOffline } = useOffline();

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium">
      <WifiOff className="h-4 w-4" />
      <span>You're offline — check-ins will be queued and synced when you reconnect</span>
    </div>
  );
}
