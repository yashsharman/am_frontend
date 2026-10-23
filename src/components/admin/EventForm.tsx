import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { eventsApi } from '../../api/events';
import type { Event, EventFormData } from '../../types';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'Event name is required'),
  date: z.string().min(1, 'Date is required'),
  venue: z.string().min(2, 'Venue is required'),
  description: z.string().optional(),
  capacity: z.number().int().min(1, 'Capacity must be at least 1'),
  is_exclusive_eligible: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface EventFormProps {
  open: boolean;
  onClose: () => void;
  event?: Event;
}

export function EventForm({ open, onClose, event }: EventFormProps) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(event);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: event
      ? {
          name: event.name,
          date: event.date,
          venue: event.venue,
          description: event.description || '',
          capacity: event.capacity,
          is_exclusive_eligible: event.is_exclusive_eligible,
        }
      : {
          is_exclusive_eligible: false,
          capacity: 100,
        },
  });

  const isExclusive = watch('is_exclusive_eligible');

  const mutation = useMutation({
    mutationFn: (data: EventFormData) =>
      isEdit ? eventsApi.update(event!.id, data) : eventsApi.create(data),
    onSuccess: () => {
      toast.success(isEdit ? 'Event updated!' : 'Event created!');
      queryClient.invalidateQueries({ queryKey: ['events'] });
      reset();
      onClose();
    },
    onError: () => {
      toast.error('Failed to save event. Please try again.');
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data as EventFormData);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) { reset(); onClose(); } }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Event' : 'Create New Event'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Event Name *</Label>
            <Input id="name" {...register('name')} placeholder="Summer Rave 2026" className="mt-1" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input id="date" type="date" {...register('date')} className="mt-1" />
              {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date.message}</p>}
            </div>
            <div>
              <Label htmlFor="capacity">Capacity *</Label>
              <Input id="capacity" type="number" {...register('capacity', { valueAsNumber: true })} placeholder="500" className="mt-1" />
              {errors.capacity && <p className="text-xs text-red-500 mt-1">{errors.capacity.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="venue">Venue *</Label>
            <Input id="venue" {...register('venue')} placeholder="Club XYZ, Mumbai" className="mt-1" />
            {errors.venue && <p className="text-xs text-red-500 mt-1">{errors.venue.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              {...register('description')}
              placeholder="Event details..."
              rows={3}
              className="mt-1 flex w-full rounded-lg border-2 border-white/20 bg-[#0e0d15] px-3.5 py-2 text-sm font-bold text-white shadow-brutal-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neo-purple focus-visible:border-neo-purple resize-none"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-[#0e0d15] rounded-xl border-2 border-white/15">
            <div>
              <p className="text-sm font-black uppercase text-white">Exclusive Pass Eligible</p>
              <p className="text-xs font-bold text-gray-400">Allow exclusive pass holders to attend</p>
            </div>
            <Switch
              checked={isExclusive}
              onCheckedChange={(val) => setValue('is_exclusive_eligible', val)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { reset(); onClose(); }}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />{isEdit ? 'Updating...' : 'Creating...'}</>
              ) : (
                isEdit ? 'Update Event' : 'Create Event'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
