import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  Edit2,
  Trash2,
  Star,
} from 'lucide-react';
import { eventsApi } from '../api/events';
import { EventForm } from '../components/admin/EventForm';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { formatDate } from '../utils/format';
import type { Event } from '../types';
import toast from 'react-hot-toast';

export function EventsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>(undefined);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventsApi.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventsApi.delete(id),
    onSuccess: () => {
      toast.success('Event deleted');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: () => toast.error('Failed to delete event'),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Events Management</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Create events, set capacity thresholds, and manage exclusive pass rules
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingEvent(undefined);
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Create Event
        </Button>
      </div>

      {/* Events List */}
      {isLoading ? (
        <div className="text-center py-12 text-sm text-gray-500">Loading events...</div>
      ) : events.length === 0 ? (
        <Card className="border-dashed border-2 p-8 text-center bg-gray-50/50">
          <Calendar className="h-12 w-12 text-indigo-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">No Events Yet</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1 mb-4">
            Click the button below to schedule your first event with capacity controls.
          </p>
          <Button
            onClick={() => {
              setEditingEvent(undefined);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {events.map((event) => (
            <Card
              key={event.id}
              className="border border-gray-200 shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-base font-bold text-gray-900 truncate">
                      {event.name}
                    </CardTitle>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                  </div>

                  <Badge
                    variant={
                      event.status === 'active'
                        ? 'success'
                        : event.status === 'completed'
                        ? 'secondary'
                        : 'default'
                    }
                    className="capitalize text-[11px] shrink-0"
                  >
                    {event.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 flex-1">
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{event.venue}</span>
                </div>

                {event.description && (
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {event.description}
                  </p>
                )}

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-gray-700 font-medium">
                    <Users className="h-3.5 w-3.5 text-gray-400" />
                    <span>Capacity: {event.capacity} max</span>
                  </div>

                  {event.is_exclusive_eligible ? (
                    <span className="inline-flex items-center gap-1 text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      Exclusive Eligible
                    </span>
                  ) : (
                    <span className="text-gray-400">One-day only</span>
                  )}
                </div>
              </CardContent>

              {/* Action buttons footer */}
              <div className="p-3 bg-gray-50/80 border-t border-gray-100 rounded-b-xl flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2.5 text-gray-600 hover:text-gray-900"
                  onClick={() => {
                    setEditingEvent(event);
                    setIsModalOpen(true);
                  }}
                >
                  <Edit2 className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete event "${event.name}"?`)) {
                      deleteMutation.mutate(event.id);
                    }
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <EventForm
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(undefined);
        }}
        event={editingEvent}
      />
    </div>
  );
}
