import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Download,
  QrCode,
  Edit2,
  Trash2,
  User,
  Phone,
  Mail,
  X,
  Users,
} from 'lucide-react';
import { registrationsApi } from '../api/registrations';
import { eventsApi } from '../api/events';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { PassCard } from '../components/registration/PassCard';
import { useExport } from '../hooks/useExport';
import { formatDate, formatPhone } from '../utils/format';
import type { Registration } from '../types';
import toast from 'react-hot-toast';

export function AttendeesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [passTypeFilter, setPassTypeFilter] = useState<string>('all');
  const [selectedPassReg, setSelectedPassReg] = useState<Registration | null>(null);
  const [editingReg, setEditingReg] = useState<Registration | null>(null);

  // Fetch events for filter dropdown
  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventsApi.list(),
  });

  // Fetch registrations with active filters
  const { data, isLoading } = useQuery({
    queryKey: ['registrations', search, selectedEventId, paymentFilter, passTypeFilter],
    queryFn: () =>
      registrationsApi.list({
        search: search || undefined,
        event_id: selectedEventId === 'all' ? undefined : selectedEventId,
        payment_status: paymentFilter === 'all' ? undefined : paymentFilter,
        pass_type: passTypeFilter === 'all' ? undefined : passTypeFilter,
      }),
  });

  const registrations = data?.results || [];

  const { exportCSV, isExporting } = useExport({
    event_id: selectedEventId === 'all' ? undefined : selectedEventId,
    payment_status: paymentFilter === 'all' ? undefined : paymentFilter,
    pass_type: passTypeFilter === 'all' ? undefined : passTypeFilter,
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => registrationsApi.delete(id),
    onSuccess: () => {
      toast.success('Attendee registration deleted');
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
    },
    onError: () => toast.error('Failed to delete registration'),
  });

  // Quick Payment Status Update Mutation
  const updatePaymentMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'verified' | 'pending' | 'failed' }) =>
      registrationsApi.update(id, { payment_status: status }),
    onSuccess: () => {
      toast.success('Payment status updated');
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      setEditingReg(null);
    },
  });

  return (
    <div className="space-y-4 max-w-5xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-neo-yellow border-2 border-neo-black shadow-brutal-sm flex items-center justify-center font-black text-xs text-neo-black">
              <Users className="h-4 w-4 stroke-[2.5]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neo-black">
              Attendee Directory
            </h1>
          </div>
          <p className="text-xs font-bold text-gray-600 mt-1">
            {data?.count ?? 0} registered attendees total across all tiers
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={exportCSV}
          disabled={isExporting}
          className="self-start sm:self-auto"
        >
          <Download className="h-4 w-4 mr-2 stroke-[2.5]" />
          {isExporting ? 'Exporting...' : 'Export to CSV'}
        </Button>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border-2 border-neo-black shadow-brutal space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 stroke-[2.5]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by attendee name, phone, or REG-ID..."
            className="pl-10"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-neo-black"
            >
              <X className="h-4 w-4 stroke-[2.5]" />
            </button>
          )}
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger className="text-xs font-black uppercase h-10 border-2 border-neo-black shadow-brutal-sm">
              <SelectValue placeholder="All Events" />
            </SelectTrigger>
            <SelectContent className="border-2 border-neo-black shadow-brutal-lg rounded-xl">
              <SelectItem value="all" className="font-bold text-xs uppercase">
                All Events
              </SelectItem>
              {events.map((e) => (
                <SelectItem key={e.id} value={e.id} className="font-bold text-xs uppercase">
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="text-xs font-black uppercase h-10 border-2 border-neo-black shadow-brutal-sm">
              <SelectValue placeholder="All Payments" />
            </SelectTrigger>
            <SelectContent className="border-2 border-neo-black shadow-brutal-lg rounded-xl">
              <SelectItem value="all" className="font-bold text-xs uppercase">
                All Payments
              </SelectItem>
              <SelectItem value="verified" className="font-bold text-xs uppercase">
                Verified
              </SelectItem>
              <SelectItem value="pending" className="font-bold text-xs uppercase">
                Pending
              </SelectItem>
              <SelectItem value="failed" className="font-bold text-xs uppercase">
                Failed
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={passTypeFilter} onValueChange={setPassTypeFilter}>
            <SelectTrigger className="text-xs font-black uppercase h-10 border-2 border-neo-black shadow-brutal-sm">
              <SelectValue placeholder="All Pass Types" />
            </SelectTrigger>
            <SelectContent className="border-2 border-neo-black shadow-brutal-lg rounded-xl">
              <SelectItem value="all" className="font-bold text-xs uppercase">
                All Pass Types
              </SelectItem>
              <SelectItem value="one_day" className="font-bold text-xs uppercase">
                One-Day Pass
              </SelectItem>
              <SelectItem value="exclusive" className="font-bold text-xs uppercase">
                Exclusive (3 Credits)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Attendees Display: Responsive (Cards on Mobile, Table on Desktop) */}
      {isLoading ? (
        <div className="text-center py-12 text-xs font-black uppercase text-gray-500">
          Loading attendees directory...
        </div>
      ) : registrations.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-neo-black shadow-brutal p-8 text-center">
          <User className="h-10 w-10 text-gray-400 mx-auto mb-2" />
          <p className="text-base font-black uppercase text-neo-black">No Attendees Found</p>
          <p className="text-xs font-bold text-gray-500 mt-1">
            Try adjusting your search query or filter tags.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card List View (< lg screens) */}
          <div className="grid grid-cols-1 gap-3 lg:hidden">
            {registrations.map((reg) => {
              const pass = reg.pass;
              const isExclusive = pass?.pass_type === 'exclusive';
              return (
                <div
                  key={reg.id}
                  className="bg-white p-4 rounded-xl border-2 border-neo-black shadow-brutal space-y-2.5 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-brutal-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-black text-neo-black text-sm">{reg.attendee_name}</h3>
                      <p className="text-[11px] font-mono font-bold text-gray-500">
                        {reg.registration_id}
                      </p>
                    </div>

                    <Badge
                      variant={
                        reg.payment_status === 'verified'
                          ? 'success'
                          : reg.payment_status === 'pending'
                          ? 'warning'
                          : 'destructive'
                      }
                      className="text-[10px]"
                    >
                      {reg.payment_status}
                    </Badge>
                  </div>

                  <div className="text-xs font-bold text-gray-700 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-neo-purple stroke-[2.5]" />
                      <span>{formatPhone(reg.phone)}</span>
                    </div>
                    {reg.email && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="h-3.5 w-3.5 text-neo-purple stroke-[2.5]" />
                        <span className="truncate">{reg.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t-2 border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant={isExclusive ? 'warning' : 'secondary'}
                        className="text-[10px]"
                      >
                        {isExclusive ? '⭐ Exclusive' : '🎫 One Day'}
                      </Badge>
                      {isExclusive && pass && (
                        <span className="text-[11px] text-neo-purple font-black">
                          {pass.remaining_credits} credits left
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {pass && (
                        <button
                          className="h-8 px-2 rounded-md bg-neo-purple text-white border-2 border-neo-black shadow-brutal-sm text-[11px] font-black uppercase flex items-center gap-1 hover:bg-indigo-600 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                          onClick={() => setSelectedPassReg(reg)}
                          title="View QR Pass"
                        >
                          <QrCode className="h-3.5 w-3.5 stroke-[2.5]" />
                          QR
                        </button>
                      )}
                      <button
                        className="w-8 h-8 rounded-md bg-white border-2 border-neo-black shadow-brutal-sm flex items-center justify-center text-neo-black hover:bg-neo-yellow active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                        onClick={() => setEditingReg(reg)}
                        title="Edit Registration"
                      >
                        <Edit2 className="h-3.5 w-3.5 stroke-[2.5]" />
                      </button>
                      <button
                        className="w-8 h-8 rounded-md bg-white border-2 border-neo-black shadow-brutal-sm flex items-center justify-center text-rose-600 hover:bg-neo-peach hover:text-white active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                        onClick={() => {
                          if (confirm(`Delete registration for ${reg.attendee_name}?`)) {
                            deleteMutation.mutate(reg.id);
                          }
                        }}
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (>= lg screens) */}
          <div className="hidden lg:block bg-white rounded-xl border-2 border-neo-black shadow-brutal overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-neo-bg border-b-2 border-neo-black text-xs font-black text-neo-black uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Attendee</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Pass Tier</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Registered Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-100">
                {registrations.map((reg) => {
                  const pass = reg.pass;
                  const isExclusive = pass?.pass_type === 'exclusive';
                  return (
                    <tr key={reg.id} className="hover:bg-neo-bg/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-black text-neo-black">{reg.attendee_name}</div>
                        <div className="text-xs text-gray-500 font-mono font-bold">
                          {reg.registration_id}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-bold text-gray-700">
                        <div>{formatPhone(reg.phone)}</div>
                        {reg.email && <div className="text-gray-500">{reg.email}</div>}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={isExclusive ? 'warning' : 'secondary'}
                          className="text-xs"
                        >
                          {isExclusive ? '⭐ Exclusive' : '🎫 One Day'}
                        </Badge>
                        {isExclusive && pass && (
                          <div className="text-xs text-neo-purple mt-0.5 font-black">
                            {pass.remaining_credits} credits left
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            reg.payment_status === 'verified'
                              ? 'success'
                              : reg.payment_status === 'pending'
                              ? 'warning'
                              : 'destructive'
                          }
                          className="text-xs"
                        >
                          {reg.payment_status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-bold text-gray-600">
                        {formatDate(reg.created_at)}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        {pass && (
                          <button
                            className="h-8 px-2.5 rounded-md bg-neo-purple text-white border-2 border-neo-black shadow-brutal-sm text-xs font-black uppercase inline-flex items-center gap-1 hover:bg-indigo-600 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                            onClick={() => setSelectedPassReg(reg)}
                            title="View Pass"
                          >
                            <QrCode className="h-3.5 w-3.5 stroke-[2.5]" />
                            Pass
                          </button>
                        )}
                        <button
                          className="w-8 h-8 rounded-md bg-white border-2 border-neo-black shadow-brutal-sm inline-flex items-center justify-center text-neo-black hover:bg-neo-yellow active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                          onClick={() => setEditingReg(reg)}
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5 stroke-[2.5]" />
                        </button>
                        <button
                          className="w-8 h-8 rounded-md bg-white border-2 border-neo-black shadow-brutal-sm inline-flex items-center justify-center text-rose-600 hover:bg-neo-peach hover:text-white active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                          onClick={() => {
                            if (confirm(`Delete registration for ${reg.attendee_name}?`)) {
                              deleteMutation.mutate(reg.id);
                            }
                          }}
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5 stroke-[2.5]" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* QR Pass Viewing Modal */}
      {selectedPassReg && selectedPassReg.pass && (
        <Dialog open={Boolean(selectedPassReg)} onOpenChange={() => setSelectedPassReg(null)}>
          <DialogContent className="max-w-sm border-2 border-neo-black shadow-brutal-lg rounded-2xl bg-white">
            <DialogHeader>
              <DialogTitle className="text-center font-black uppercase tracking-tight text-neo-black">
                Attendee QR Pass
              </DialogTitle>
            </DialogHeader>
            <PassCard
              registration={selectedPassReg}
              pass={selectedPassReg.pass}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Registration / Quick Payment Status Modal */}
      {editingReg && (
        <Dialog open={Boolean(editingReg)} onOpenChange={() => setEditingReg(null)}>
          <DialogContent className="max-w-md border-2 border-neo-black shadow-brutal-lg rounded-2xl bg-white">
            <DialogHeader>
              <DialogTitle className="font-black uppercase tracking-tight text-neo-black">
                Edit Attendee: {editingReg.attendee_name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-black text-neo-black uppercase tracking-wider">
                  Payment Status
                </label>
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  {(['verified', 'pending', 'failed'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() =>
                        updatePaymentMutation.mutate({ id: editingReg.id, status })
                      }
                      className={`py-2 px-3 rounded-lg text-xs font-black uppercase border-2 border-neo-black shadow-brutal-sm transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                        editingReg.payment_status === status
                          ? status === 'verified'
                            ? 'bg-neo-lime text-neo-black'
                            : status === 'pending'
                            ? 'bg-neo-yellow text-neo-black'
                            : 'bg-neo-peach text-white'
                          : 'bg-white text-neo-black hover:bg-neo-bg'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-xs font-bold text-gray-700 pt-2 border-t-2 border-gray-100 space-y-1">
                <p>
                  Registration ID:{' '}
                  <span className="font-mono text-neo-black">{editingReg.registration_id}</span>
                </p>
                <p>
                  Phone: <span className="text-neo-black">{editingReg.phone}</span>
                </p>
                {editingReg.payment_reference && (
                  <p>
                    Payment Ref:{' '}
                    <span className="text-neo-black font-mono">
                      {editingReg.payment_reference}
                    </span>
                  </p>
                )}
                {editingReg.notes && (
                  <p>
                    Notes: <span className="text-neo-black italic">{editingReg.notes}</span>
                  </p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
