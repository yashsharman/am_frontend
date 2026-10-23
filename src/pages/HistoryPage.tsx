import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Clock,
  Search,
  CheckCircle,
  Download,
} from 'lucide-react';
import { eventsApi } from '../api/events';
import { checkinsApi } from '../api/checkins';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { formatDateTime } from '../utils/format';
import * as XLSX from 'xlsx';

export function HistoryPage() {
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [search, setSearch] = useState('');

  // 1. Fetch Events
  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventsApi.list(),
  });

  // Default to first event
  if (events.length > 0 && !selectedEventId) {
    setSelectedEventId(events[0].id);
  }

  // 2. Fetch Check-ins for the Selected Event
  const { data, isLoading } = useQuery({
    queryKey: ['checkins-history', selectedEventId],
    queryFn: () => checkinsApi.listByEvent(selectedEventId),
    enabled: Boolean(selectedEventId),
  });

  const checkins = data?.items || [];

  // Filter check-ins locally by attendee search term
  const filteredCheckins = checkins.filter((ci) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (ci.attendee_name && ci.attendee_name.toLowerCase().includes(q)) ||
      (ci.registration_id_human && ci.registration_id_human.toLowerCase().includes(q)) ||
      (ci.id && ci.id.toLowerCase().includes(q))
    );
  });

  // Export check-ins history
  const exportHistory = () => {
    const selectedEvent = events.find((e) => e.id === selectedEventId);
    const rows = filteredCheckins.map((ci) => ({
      'Attendee Name': ci.attendee_name || 'Attendee',
      'Event': selectedEvent?.name || 'Event',
      'Checked In At': formatDateTime(ci.checked_in_at),
      'Method': ci.method === 'qr_scan' ? 'Camera QR Scan' : 'Manual Search',
      'Registration ID': ci.registration_id_human || ci.registration_id,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Check-in History');
    XLSX.writeFile(wb, `checkin-history-${selectedEvent?.name || 'event'}.xlsx`);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Check-in Audit Log</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Chronological audit trail of all verified entry scans
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={exportHistory}
          disabled={filteredCheckins.length === 0}
          className="self-start sm:self-auto border-gray-300"
        >
          <Download className="h-4 w-4 mr-2" />
          Export History Log
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="sm:w-72">
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger className="h-10 text-xs sm:text-sm border-gray-200">
              <SelectValue placeholder="Select Event" />
            </SelectTrigger>
            <SelectContent>
              {events.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search attendee by name or ID..."
            className="pl-9 h-10 text-sm border-gray-200"
          />
        </div>
      </div>

      {/* History List: Mobile Cards & Desktop Table */}
      {isLoading ? (
        <div className="text-center py-12 text-sm text-gray-500">Loading check-in logs...</div>
      ) : filteredCheckins.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <Clock className="h-10 w-10 text-gray-300 mx-auto mb-2" />
          <p className="text-base font-semibold text-gray-800">No Check-ins Recorded</p>
          <p className="text-xs text-gray-400 mt-1">
            Attendees who have been scanned at the gate will show up here.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card List */}
          <div className="grid grid-cols-1 gap-2.5 lg:hidden">
            {filteredCheckins.map((ci) => (
              <div
                key={ci.id}
                className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {ci.attendee_name || 'Verified Attendee'}
                  </p>
                  <p className="text-xs text-gray-400 font-mono">
                    {ci.registration_id_human || ci.registration_id.slice(-8)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                      {ci.method === 'qr_scan' ? '⚡ QR Scan' : '🔍 Manual Entry'}
                    </Badge>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle className="h-3 w-3" />
                    Entry Allowed
                  </span>
                  <p className="text-[11px] text-gray-500 mt-1">
                    {formatDateTime(ci.checked_in_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/75 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Attendee</th>
                  <th className="py-3 px-4">Verification Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCheckins.map((ci) => (
                  <tr key={ci.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">
                        {ci.attendee_name || 'Verified Attendee'}
                      </div>
                      <div className="text-xs text-gray-400 font-mono">
                        {ci.registration_id_human || ci.registration_id}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className="text-xs font-normal">
                        {ci.method === 'qr_scan' ? '⚡ Camera QR Scan' : '🔍 Manual Search Check-in'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Verified Entry
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">
                      {formatDateTime(ci.checked_in_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
