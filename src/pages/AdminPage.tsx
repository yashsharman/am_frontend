import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UserPlus,
  Users,
  Wifi,
  WifiOff,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { adminApi } from '../api/admin';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { useCheckin } from '../hooks/useCheckin';
import { useOffline } from '../hooks/useOffline';
import { db } from '../db/offlineDb';
import { useLiveQuery } from 'dexie-react-hooks';
import toast from 'react-hot-toast';

export function AdminPage() {
  const queryClient = useQueryClient();
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'checkin_staff'>('checkin_staff');

  const { isOffline } = useOffline();
  const { syncOfflineQueue } = useCheckin();

  // Watch offline queued checkins count via Dexie
  const pendingOfflineScans = useLiveQuery(
    () => db.pendingCheckins.where('synced').equals(0).toArray(),
    []
  );

  const pendingCount = pendingOfflineScans?.length || 0;

  // 1. Fetch Staff List
  const { data: staffList = [], isLoading } = useQuery({
    queryKey: ['admin-staff'],
    queryFn: adminApi.listStaff,
  });

  // 2. Create Staff Mutation
  const createMutation = useMutation({
    mutationFn: () => adminApi.createStaff({ name, email, password, role }),
    onSuccess: () => {
      toast.success('Staff user created');
      queryClient.invalidateQueries({ queryKey: ['admin-staff'] });
      setIsStaffModalOpen(false);
      setName('');
      setEmail('');
      setPassword('');
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { detail?: string } } };
      toast.error(error.response?.data?.detail || 'Failed to create staff');
    },
  });

  // 3. Deactivate Staff Mutation
  const deactivateMutation = useMutation({
    mutationFn: (id: string) => adminApi.deactivateStaff(id),
    onSuccess: () => {
      toast.success('Staff account deactivated');
      queryClient.invalidateQueries({ queryKey: ['admin-staff'] });
    },
    onError: () => toast.error('Failed to deactivate staff'),
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
            Administration & System
          </h1>
          <p className="text-xs sm:text-sm font-bold text-gray-400 mt-0.5">
            Manage check-in volunteers, admin credentials, and offline synchronization
          </p>
        </div>

        <Button
          onClick={() => setIsStaffModalOpen(true)}
          className="bg-neo-purple hover:bg-indigo-600 text-white self-start sm:self-auto border-2 border-white/20 shadow-brutal"
        >
          <UserPlus className="h-4 w-4 mr-2 stroke-[2.5]" />
          Add Staff Member
        </Button>
      </div>

      {/* Offline Status & Sync Card */}
      <Card className="border-2 border-white/15 bg-[#171622] shadow-brutal">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              {isOffline ? (
                <WifiOff className="h-5 w-5 text-neo-peach stroke-[2.5]" />
              ) : (
                <Wifi className="h-5 w-5 text-neo-lime stroke-[2.5]" />
              )}
              Offline Mode & Synchronization
            </span>
            <Badge variant={isOffline ? 'warning' : 'success'}>
              {isOffline ? 'Offline' : 'Connected'}
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs font-bold text-gray-400">
            The PWA stores check-in records locally in IndexedDB when internet connection is lost.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0e0d15] border-2 border-white/15">
            <div>
              <p className="text-sm font-black uppercase text-white">
                Queued Offline Scans: <span className="text-neo-lime">{pendingCount}</span>
              </p>
              <p className="text-xs font-bold text-gray-400 mt-0.5">
                {pendingCount === 0
                  ? 'All local scans are fully synchronized with the cloud backend.'
                  : 'Pending scans waiting to be sent to the server.'}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => syncOfflineQueue()}
              disabled={isOffline || pendingCount === 0}
            >
              <RefreshCw className="h-4 w-4 mr-2 stroke-[2.5]" />
              Sync Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Staff Accounts Management */}
      <Card className="border-2 border-white/15 bg-[#171622] shadow-brutal">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-white">
            <Users className="h-4 w-4 text-neo-purple stroke-[2.5]" />
            Gate Staff & Roles
          </CardTitle>
          <CardDescription className="text-xs font-bold text-gray-400">
            Check-in staff have access to the scanner and attendee directory; admins can manage events and staff.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-6 text-xs font-black uppercase text-gray-400">Loading staff...</div>
          ) : staffList.length === 0 ? (
            <p className="text-center py-6 text-xs font-bold text-gray-400">No staff accounts found.</p>
          ) : (
            <div className="divide-y-2 divide-white/10">
              {staffList.map((member) => (
                <div key={member.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-white truncate">{member.name}</p>
                      <Badge
                        variant={member.role === 'admin' ? 'default' : 'secondary'}
                        className="text-[10px] capitalize"
                      >
                        {member.role.replace('_', ' ')}
                      </Badge>
                      {!member.is_active && (
                        <Badge variant="danger" className="text-[10px]">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs font-bold text-gray-400 truncate mt-0.5">{member.email}</p>
                  </div>

                  {member.is_active && member.role !== 'admin' && (
                    <button
                      className="h-8 px-2.5 rounded-md bg-[#0e0d15] text-rose-400 border-2 border-white/20 shadow-brutal-sm text-xs font-black uppercase inline-flex items-center gap-1 hover:bg-neo-peach hover:text-white active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                      onClick={() => {
                        if (confirm(`Deactivate staff member ${member.name}?`)) {
                          deactivateMutation.mutate(member.id);
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 stroke-[2.5]" />
                      Deactivate
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Staff Modal */}
      <Dialog open={isStaffModalOpen} onOpenChange={setIsStaffModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate();
            }}
            className="space-y-4 pt-2"
          >
            <div>
              <Label htmlFor="staff-name">Full Name *</Label>
              <Input
                id="staff-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rohan Sharma"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="staff-email">Email Address *</Label>
              <Input
                id="staff-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rohan@aftermiles.com"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="staff-password">Temporary Password *</Label>
              <Input
                id="staff-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="staff-role">Role *</Label>
              <Select value={role} onValueChange={(val) => setRole(val as 'admin' | 'checkin_staff')}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checkin_staff">Check-in Staff (Scanner & Directory)</SelectItem>
                  <SelectItem value="admin">Administrator (Full Control)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsStaffModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Account'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
