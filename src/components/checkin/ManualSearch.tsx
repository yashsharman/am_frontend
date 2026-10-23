import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';

const schema = z.object({
  query: z.string().min(1, 'Enter a name, phone, or registration ID'),
});

type FormData = z.infer<typeof schema>;

interface ManualSearchProps {
  onCheckin: (registrationId: string) => void;
  isLoading?: boolean;
}

export function ManualSearch({ onCheckin, isLoading = false }: ManualSearchProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    onCheckin(data.query.trim());
  };

  return (
    <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900 mb-3">Manual Check-in</h3>
      <p className="text-sm text-gray-500 mb-4">
        Enter the attendee's registration ID, phone number, or name.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <Label htmlFor="query">Search</Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="query"
              {...register('query')}
              placeholder="REG-XXXX / phone / name"
              className="pl-9"
              autoComplete="off"
            />
          </div>
          {errors.query && (
            <p className="text-xs text-red-500 mt-1">{errors.query.message}</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <><Loader2 className="h-4 w-4 animate-spin mr-2" />Checking in...</>
          ) : (
            <><Search className="h-4 w-4 mr-2" />Check In</>
          )}
        </Button>
      </form>
    </div>
  );
}
