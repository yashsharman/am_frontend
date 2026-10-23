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
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Attendee Directory</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            {data?.count ?? 0} registered attendees total
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={exportCSV}
          disabled={isExporting}
          className="self-start sm:self-auto border-gray-300"
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export to CSV'}
        </Button>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or REG-ID..."
            className="pl-9 text-sm border-gray-200"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger className="text-xs h-9 border-gray-200">
              <SelectValue placeholder="All Events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {events.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="text-xs h-9 border-gray-200">
              <SelectValue placeholder="All Payments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payment Statuses</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={passTypeFilter} onValueChange={setPassTypeFilter}>
            <SelectTrigger className="text-xs h-9 border-gray-200">
              <SelectValue placeholder="All Pass Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pass Types</SelectItem>
              <SelectItem value="one_day">One-Day Pass</SelectItem>
              <SelectItem value="exclusive">Exclusive (3 Credits)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Attendees Display: Responsive (Cards on Mobile, Table on Desktop) */}
      {isLoading ? (
        <div className="text-center py-12 text-sm text-gray-500">Loading attendees...</div>
      ) : registrations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <User className="h-10 w-10 text-gray-300 mx-auto mb-2" />
          <p className="text-base font-semibold text-gray-800">No Attendees Found</p>
          <p className="text-xs text-gray-400 mt-1">Try adjusting your search query or filters.</p>
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
                  className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{reg.attendee_name}</h3>
                      <p className="text-[11px] font-mono text-gray-400">{reg.registration_id}</p>
                    </div>

                    <Badge
                      variant={
                        reg.payment_status === 'verified'
                          ? 'success'
                          : reg.payment_status === 'pending'
                          ? 'warning'
                          : 'danger'
                      }
                      className="text-[10px] capitalize"
                    >
                      {reg.payment_status}
                    </Badge>
                  </div>

                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-gray-400" />
                      <span>{formatPhone(reg.phone)}</span>
                    </div>
                    {reg.email && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                        <span className="truncate">{reg.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <Badge variant={isExclusive ? 'default' : 'secondary'} className="text-[10px]">
                        {isExclusive ? '⭐ Exclusive' : '🎫 One Day'}
                      </Badge>
                      {isExclusive && pass && (
                        <span className="text-[11px] text-indigo-700 font-medium">
                          {pass.remaining_credits} credits left
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {pass && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                          onClick={() => setSelectedPassReg(reg)}
                          title="View QR Pass"
                        >
                          <QrCode className="h-3.5 w-3.5 mr-1" />
                          QR
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-gray-500 hover:text-gray-700"
                        onClick={() => setEditingReg(reg)}
                        title="Edit Registration"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-rose-500 hover:text-rose-700"
                        onClick={() => {
                          if (confirm(`Delete registration for ${reg.attendee_name}?`)) {
                            deleteMutation.mutate(reg.id);
                          }
                        }}
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (>= lg screens) */}
          <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/75 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Attendee</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Pass Type</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {registrations.map((reg) => {
                  const pass = reg.pass;
                  const isExclusive = pass?.pass_type === 'exclusive';
                  return (
                    <tr key={reg.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{reg.attendee_name}</div>
                        <div className="text-xs text-gray-400 font-mono">{reg.registration_id}</div>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-600">
                        <div>{formatPhone(reg.phone)}</div>
                        {reg.email && <div className="text-gray-400">{reg.email}</div>}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={isExclusive ? 'default' : 'secondary'} className="text-xs">
                          {isExclusive ? '⭐ Exclusive' : '🎫 One Day'}
                        </Badge>
                        {isExclusive && pass && (
                          <div className="text-xs text-indigo-700 mt-0.5 font-medium">
                            {pass.remaining_credits} credits left
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            reg.payment_status === 'verified'
                              ? 'success'
                              : reg.payment_status === 'pending'
                              ? 'warning'
                              : 'danger'
                          }
                          className="capitalize text-xs"
                        >
                          {reg.payment_status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500">
                        {formatDate(reg.created_at)}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        {pass && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                            onClick={() => setSelectedPassReg(reg)}
                            title="View Pass"
                          >
                            <QrCode className="h-4 w-4 mr-1" />
                            Pass
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingReg(reg)}
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:text-rose-700"
                          onClick={() => {
                            if (confirm(`Delete registration for ${reg.attendee_name}?`)) {
                              deleteMutation.mutate(reg.id);
                            }
                          }}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-center">Attendee QR Pass</DialogTitle>
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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Attendee: {editingReg.attendee_name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
                      className={`py-2 px-3 rounded-lg text-xs font-semibold capitalize border transition-all ${
                        editingReg.payment_status === status
                          ? status === 'verified'
                            ? 'bg-green-600 text-white border-green-600'
                            : status === 'pending'
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-red-600 text-white border-red-600'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-xs text-gray-500 pt-2 border-t border-gray-100 space-y-1">
                <p>Registration ID: <span className="font-mono text-gray-800">{editingReg.registration_id}</span></p>
                <p>Phone: <span className="text-gray-800">{editingReg.phone}</span></p>
                {editingReg.payment_reference && (
                  <p>Payment Ref: <span className="text-gray-800 font-mono">{editingReg.payment_reference}</span></p>
                )}
                {editingReg.notes && (
                  <p>Notes: <span className="text-gray-800 italic">{editingReg.notes}</span></p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
