import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { PassTypeSelector } from './PassTypeSelector';
import { registrationsApi } from '../../api/registrations';
import { eventsApi } from '../../api/events';
import type { Registration, RegistrationFormData } from '../../types';
import toast from 'react-hot-toast';

const schema = z.object({
  attendee_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  pass_type: z.enum(['one_day', 'exclusive']),
  event_id: z.string().optional(),
  payment_status: z.enum(['pending', 'verified', 'failed']),
  payment_reference: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface RegistrationFormProps {
  onSuccess?: (registration: Registration) => void;
}

export function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const queryClient = useQueryClient();

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventsApi.list(),
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      pass_type: 'one_day',
      payment_status: 'pending',
    },
  });

  const passType = watch('pass_type');

  const mutation = useMutation({
    mutationFn: (data: RegistrationFormData) => registrationsApi.create(data),
    onSuccess: (registration) => {
      toast.success('Registration created successfully!');
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      onSuccess?.(registration);
      reset();
    },
    onError: () => {
      toast.error('Failed to create registration. Please try again.');
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate({
      ...data,
      email: data.email || undefined,
      event_id: passType === 'one_day' ? data.event_id : undefined,
    } as RegistrationFormData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Pass Type */}
      <PassTypeSelector
        value={passType}
        onChange={(val) => setValue('pass_type', val)}
      />

      {/* Name */}
      <div>
        <Label htmlFor="attendee_name">Full Name *</Label>
        <Input
          id="attendee_name"
          {...register('attendee_name')}
          placeholder="John Doe"
          className="mt-1"
        />
        {errors.attendee_name && (
          <p className="text-xs text-red-500 mt-1">{errors.attendee_name.message}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <Label htmlFor="phone">Phone Number *</Label>
        <Input
          id="phone"
          {...register('phone')}
          placeholder="+91 98765 43210"
          className="mt-1"
        />
        {errors.phone && (
          <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <Label htmlFor="email">Email (optional)</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="john@example.com"
          className="mt-1"
        />
        {errors.email && (
          <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Event selector — only for one_day */}
      {passType === 'one_day' && (
        <div>
          <Label htmlFor="event_id">Event *</Label>
          <Select onValueChange={(val) => setValue('event_id', val)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select an event" />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.name} — {event.date}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Payment Status */}
      <div>
        <Label htmlFor="payment_status">Payment Status *</Label>
        <Select
          defaultValue="pending"
          onValueChange={(val) => setValue('payment_status', val as 'pending' | 'verified' | 'failed')}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payment Reference */}
      <div>
        <Label htmlFor="payment_reference">Payment Reference</Label>
        <Input
          id="payment_reference"
          {...register('payment_reference')}
          placeholder="UPI/Bank reference number"
          className="mt-1"
        />
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          {...register('notes')}
          placeholder="Any additional notes..."
          rows={2}
          className="mt-1 flex min-h-[60px] w-full rounded-lg border-2 border-white/20 bg-[#0e0d15] px-3.5 py-2 text-sm font-bold text-white shadow-brutal-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neo-purple focus-visible:border-neo-purple resize-none"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-neo-purple text-white shadow-brutal hover:bg-indigo-600 border-2 border-white/20"
        size="lg"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" />Creating...</>
        ) : (
          'Create Registration'
        )}
      </Button>
    </form>
  );
}
