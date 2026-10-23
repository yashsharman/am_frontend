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
    <div className="p-4 bg-white rounded-xl border-2 border-neo-black shadow-brutal space-y-3">
      <div>
        <h3 className="text-base font-black uppercase tracking-tight text-neo-black">
          Manual Gate Lookup
        </h3>
        <p className="text-xs font-bold text-gray-600 mt-0.5">
          Enter the attendee registration ID (REG-...), phone, or full name.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 pt-1">
        <div>
          <Label htmlFor="query" className="font-black text-xs uppercase tracking-wider text-neo-black">
            Search Attendee
          </Label>
          <div className="relative mt-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 stroke-[2.5]" />
            <Input
              id="query"
              {...register('query')}
              placeholder="REG-XXXX / phone / name"
              className="pl-10"
              autoComplete="off"
            />
          </div>
          {errors.query && (
            <p className="text-xs font-bold text-rose-600 mt-1">{errors.query.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full bg-neo-purple text-white shadow-brutal hover:bg-indigo-600" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Verifying pass...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2 stroke-[2.5]" />
              Check In Attendee
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
