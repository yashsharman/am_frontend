import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  QrCode,
  UserPlus,
  Calendar,
  Download,
  Plus,
  RefreshCw,
  Clock,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { eventsApi } from '../api/events';
import { checkinsApi } from '../api/checkins';
import { MetricsGrid } from '../components/dashboard/MetricsGrid';
import { EventStats } from '../components/dashboard/EventStats';
import { EventForm } from '../components/admin/EventForm';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useExport } from '../hooks/useExport';
import { useCheckinStore } from '../stores/checkinStore';
import { formatDateTime } from '../utils/format';
import type { DashboardMetrics } from '../types';

export function DashboardPage() {
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const { setCurrentEvent } = useCheckinStore();

  // 1. Fetch Events List
  const { data: events = [], isLoading: isLoadingEvents, refetch: refetchEvents } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventsApi.list(),
  });

  // Automatically select the active or first event
  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      const active = events.find((e) => e.status === 'active') || events[0];
      setSelectedEventId(active.id);
      setCurrentEvent(active);
    }
  }, [events, selectedEventId, setCurrentEvent]);

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  // 2. Fetch Metrics for the Selected Event
  const { data: metrics, isLoading: isLoadingMetrics, refetch: refetchMetrics } = useQuery<DashboardMetrics>({
    queryKey: ['event-metrics', selectedEventId],
    queryFn: () => eventsApi.getMetrics(selectedEventId),
    enabled: Boolean(selectedEventId),
    staleTime: 60 * 1000,
  });

  // 3. Fetch Recent Check-ins for this Event
  const { data: recentCheckinsData, refetch: refetchCheckins } = useQuery({
    queryKey: ['checkins-event', selectedEventId],
    queryFn: () => checkinsApi.listByEvent(selectedEventId),
    enabled: Boolean(selectedEventId),
    staleTime: 60 * 1000,
  });

  const { exportCSV, isExporting } = useExport({ event_id: selectedEventId });

  const defaultMetrics: DashboardMetrics = {
    total_capacity: selectedEvent?.capacity || 0,
    registered: 0,
    available_slots: selectedEvent?.capacity || 0,
    payment_pending: 0,
    checked_in: 0,
    not_arrived: 0,
    exclusive_members: 0,
  };

  const currentMetrics = metrics || defaultMetrics;

  return (
    <div className="space-y-6">
      {/* Top Header / Event Selection Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
            Event Monitoring
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            {events.length > 0 ? (
              <Select
                value={selectedEventId}
                onValueChange={(val) => {
                  setSelectedEventId(val);
                  const evt = events.find((e) => e.id === val);
                  if (evt) setCurrentEvent(evt);
                }}
              >
                <SelectTrigger className="w-full sm:w-[280px] font-semibold text-gray-900 border-gray-300">
                  <SelectValue placeholder="Select Event" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name} ({event.date})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <h2 className="text-xl font-bold text-gray-900">No events found</h2>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchEvents();
                refetchMetrics();
                refetchCheckins();
              }}
              className="text-gray-600"
              title="Refresh Stats"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Button
            asChild
            className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            <Link to="/checkin">
              <QrCode className="h-4 w-4 mr-2" />
              Check-in Gate
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="flex-1 sm:flex-none border-gray-300"
          >
            <Link to="/register">
              <UserPlus className="h-4 w-4 mr-2" />
              Register
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEventModalOpen(true)}
            className="hidden sm:inline-flex border-gray-300"
          >
            <Plus className="h-4 w-4 mr-1" />
            New Event
          </Button>
        </div>
      </div>

      {/* No Events Empty State */}
      {events.length === 0 && !isLoadingEvents && (
        <Card className="border-dashed border-2 p-8 text-center bg-gray-50/50">
          <Calendar className="h-12 w-12 text-indigo-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">No Events Scheduled</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1 mb-4">
            Create your first event to start accepting registrations, generating QR passes, and checking in attendees.
          </p>
          <Button onClick={() => setIsEventModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </Card>
      )}

      {/* 7 Metrics Grid */}
      {events.length > 0 && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Real-Time Attendance Metrics
              </h3>
              {isLoadingMetrics && (
                <span className="text-xs text-indigo-600 flex items-center gap-1">
                  <RefreshCw className="h-3 w-3 animate-spin" /> Updating...
                </span>
              )}
            </div>
            <MetricsGrid metrics={currentMetrics} />
          </div>

          {/* Event Progress & Stats Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <EventStats
                metrics={currentMetrics}
                eventName={selectedEvent?.name}
              />
            </div>

            {/* Recent Check-in Activity */}
            <div className="lg:col-span-2">
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    Live Gate Check-in Stream
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-xs text-indigo-600 hover:text-indigo-700"
                  >
                    <Link to="/history" className="flex items-center gap-1">
                      View all <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto max-h-[300px]">
                  {recentCheckinsData?.items && recentCheckinsData.items.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {recentCheckinsData.items.slice(0, 5).map((ci) => (
                        <div key={ci.id} className="py-2.5 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {ci.attendee_name || 'Verified Attendee'}
                            </p>
                            <p className="text-xs text-gray-400 font-mono">
                              {ci.registration_id_human || ci.method === 'qr_scan' ? '⚡ Camera Scan' : '🔍 Manual Entry'}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Checked in
                            </span>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              {formatDateTime(ci.checked_in_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      <Sparkles className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      No attendees checked in yet for this event.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Actions Footer Bar */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-indigo-950">Data Export & Reporting</p>
              <p className="text-xs text-indigo-700">Download registration records or check-in rosters</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={exportCSV}
              disabled={isExporting}
              className="w-full sm:w-auto bg-white hover:bg-gray-50 border-indigo-200 text-indigo-700"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export Attendee CSV'}
            </Button>
          </div>
        </div>
      )}

      {/* Event Creation Modal */}
      <EventForm
        open={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
      />
    </div>
  );
}
