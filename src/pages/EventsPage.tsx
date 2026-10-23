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
    <div className="space-y-6 text-white max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
            Events Schedule
          </h1>
          <p className="text-xs sm:text-sm font-bold text-gray-400 mt-0.5">
            Create events, set capacity thresholds, and manage exclusive pass rules
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingEvent(undefined);
            setIsModalOpen(true);
          }}
          className="bg-neo-purple hover:bg-indigo-600 text-white shadow-brutal border-2 border-white/20"
        >
          <Plus className="h-4 w-4 mr-1.5 stroke-[3]" />
          Create Event
        </Button>
      </div>

      {/* Events List */}
      {isLoading ? (
        <div className="text-center py-12 text-xs font-black uppercase text-gray-400">
          Loading events...
        </div>
      ) : events.length === 0 ? (
        <Card className="border-2 border-white/15 bg-[#171622] p-8 text-center text-white shadow-brutal">
          <Calendar className="h-12 w-12 text-neo-lime mx-auto mb-3 stroke-[2.5]" />
          <h3 className="text-lg font-black uppercase tracking-tight text-white">No Events Yet</h3>
          <p className="text-xs font-bold text-gray-400 max-w-sm mx-auto mt-1 mb-4">
            Click the button below to schedule your first event with capacity controls.
          </p>
          <Button
            onClick={() => {
              setEditingEvent(undefined);
              setIsModalOpen(true);
            }}
            className="bg-neo-purple hover:bg-indigo-600 text-white border-2 border-white/20 shadow-brutal"
          >
            <Plus className="h-4 w-4 mr-2 stroke-[3]" />
            Create Event
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {events.map((event) => (
            <Card
              key={event.id}
              className="border-2 border-white/15 bg-[#171622] text-white shadow-brutal hover:border-white/30 transition-all flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-base font-black text-white truncate">
                      {event.name}
                    </CardTitle>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1 font-bold">
                      <Calendar className="h-3.5 w-3.5 shrink-0 text-neo-lime stroke-[2.5]" />
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

              <CardContent className="space-y-3 flex-1 text-white">
                <div className="flex items-center gap-1.5 text-xs text-gray-300 font-bold">
                  <MapPin className="h-3.5 w-3.5 text-neo-peach shrink-0 stroke-[2.5]" />
                  <span className="truncate">{event.venue}</span>
                </div>

                {event.description && (
                  <p className="text-xs text-gray-400 line-clamp-2">
                    {event.description}
                  </p>
                )}

                <div className="pt-2 border-t-2 border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-gray-300 font-bold">
                    <Users className="h-3.5 w-3.5 text-neo-lime stroke-[2.5]" />
                    <span>Capacity: {event.capacity} max</span>
                  </div>

                  {event.is_exclusive_eligible ? (
                    <Badge variant="warning" className="text-[10px]">
                      <Star className="h-3 w-3 mr-1 fill-neo-black text-neo-black stroke-[2.5]" />
                      Exclusive
                    </Badge>
                  ) : (
                    <span className="text-gray-500 font-bold text-[11px]">One-day only</span>
                  )}
                </div>
              </CardContent>

              {/* Action buttons footer */}
              <div className="p-3 bg-[#1f1d2e] border-t-2 border-white/10 rounded-b-xl flex items-center justify-end gap-1.5">
                <button
                  className="h-8 px-2.5 rounded-md bg-[#0e0d15] text-white border-2 border-white/20 shadow-brutal-sm text-xs font-black uppercase flex items-center gap-1 hover:bg-neo-yellow hover:text-neo-black hover:border-neo-black active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                  onClick={() => {
                    setEditingEvent(event);
                    setIsModalOpen(true);
                  }}
                >
                  <Edit2 className="h-3.5 w-3.5 stroke-[2.5]" />
                  Edit
                </button>

                <button
                  className="h-8 px-2.5 rounded-md bg-[#0e0d15] text-rose-400 border-2 border-white/20 shadow-brutal-sm text-xs font-black uppercase flex items-center gap-1 hover:bg-neo-peach hover:text-white active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete event "${event.name}"?`)) {
                      deleteMutation.mutate(event.id);
                    }
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5 stroke-[2.5]" />
                  Delete
                </button>
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
