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
    <div className="space-y-4 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-neo-yellow border-2 border-neo-black shadow-brutal-sm flex items-center justify-center font-black text-xs text-neo-black">
              <Clock className="h-4 w-4 stroke-[2.5]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neo-black">
              Gate Audit Stream
            </h1>
          </div>
          <p className="text-xs font-bold text-gray-600 mt-1">
            Chronological audit trail of all verified entry scans
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={exportHistory}
          disabled={filteredCheckins.length === 0}
          className="self-start sm:self-auto"
        >
          <Download className="h-4 w-4 mr-2 stroke-[2.5]" />
          Export History Log
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border-2 border-neo-black shadow-brutal flex flex-col sm:flex-row gap-3">
        <div className="sm:w-72">
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger className="h-11 text-xs font-black uppercase border-2 border-neo-black shadow-brutal-sm">
              <SelectValue placeholder="Select Event" />
            </SelectTrigger>
            <SelectContent className="border-2 border-neo-black shadow-brutal-lg rounded-xl">
              {events.map((e) => (
                <SelectItem key={e.id} value={e.id} className="font-bold text-xs uppercase">
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 stroke-[2.5]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search attendee by name or ID..."
            className="pl-10"
          />
        </div>
      </div>

      {/* History List: Mobile Cards & Desktop Table */}
      {isLoading ? (
        <div className="text-center py-12 text-xs font-black uppercase text-gray-500">
          Loading check-in logs...
        </div>
      ) : filteredCheckins.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-neo-black shadow-brutal p-8 text-center">
          <Clock className="h-10 w-10 text-gray-400 mx-auto mb-2" />
          <p className="text-base font-black uppercase text-neo-black">
            No Check-ins Recorded
          </p>
          <p className="text-xs font-bold text-gray-500 mt-1">
            Attendees who have been scanned at the gate will show up here live.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card List */}
          <div className="grid grid-cols-1 gap-2.5 lg:hidden">
            {filteredCheckins.map((ci) => {
              const initials = ci.attendee_name
                ? ci.attendee_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                : 'AT';

              return (
                <div
                  key={ci.id}
                  className="bg-white p-3.5 rounded-xl border-2 border-neo-black shadow-brutal flex items-center justify-between gap-3 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-brutal-sm transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-neo-yellow border-2 border-neo-black shadow-brutal-sm flex items-center justify-center font-black text-xs text-neo-black shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-neo-black truncate">
                        {ci.attendee_name || 'Verified Attendee'}
                      </p>
                      <p className="text-xs text-gray-500 font-mono font-bold">
                        {ci.registration_id_human || ci.registration_id.slice(-8)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-bold">
                          {ci.method === 'qr_scan' ? '⚡ QR Scan' : '🔍 Manual Entry'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-neo-black bg-neo-lime px-2 py-0.5 rounded border-2 border-neo-black shadow-brutal-sm">
                      <CheckCircle className="h-3 w-3 stroke-[3]" />
                      In Gate
                    </span>
                    <p className="text-[11px] font-bold text-gray-500 mt-1">
                      {formatDateTime(ci.checked_in_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-xl border-2 border-neo-black shadow-brutal overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-neo-bg border-b-2 border-neo-black text-xs font-black text-neo-black uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Attendee</th>
                  <th className="py-3.5 px-4">Verification Method</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-100">
                {filteredCheckins.map((ci) => (
                  <tr key={ci.id} className="hover:bg-neo-bg/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-black text-neo-black">
                        {ci.attendee_name || 'Verified Attendee'}
                      </div>
                      <div className="text-xs text-gray-500 font-mono font-bold">
                        {ci.registration_id_human || ci.registration_id}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="secondary" className="text-xs font-bold">
                        {ci.method === 'qr_scan' ? '⚡ Camera QR Scan' : '🔍 Manual Search Check-in'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-neo-black bg-neo-lime px-2.5 py-0.5 rounded border-2 border-neo-black shadow-brutal-sm">
                        <CheckCircle className="h-3.5 w-3.5 stroke-[3]" />
                        In Gate
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-bold text-gray-700">
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
