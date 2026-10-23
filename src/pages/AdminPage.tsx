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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Administration & System</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Manage check-in volunteers, admin credentials, and offline synchronization
          </p>
        </div>

        <Button
          onClick={() => setIsStaffModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white self-start sm:self-auto"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      {/* Offline Status & Sync Card */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              {isOffline ? (
                <WifiOff className="h-5 w-5 text-amber-500" />
              ) : (
                <Wifi className="h-5 w-5 text-emerald-500" />
              )}
              Offline Mode & Synchronization
            </span>
            <Badge variant={isOffline ? 'warning' : 'success'}>
              {isOffline ? 'Offline' : 'Connected'}
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs">
            The PWA stores check-in records locally in IndexedDB when internet connection is lost.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Queued Offline Scans: <span className="text-indigo-600">{pendingCount}</span>
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
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
              className="border-gray-300"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Staff Accounts Management */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-600" />
            Gate Staff & Roles
          </CardTitle>
          <CardDescription className="text-xs">
            Check-in staff have access to the scanner and attendee directory; admins can manage events and staff.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-6 text-sm text-gray-500">Loading staff...</div>
          ) : staffList.length === 0 ? (
            <p className="text-center py-6 text-xs text-gray-400">No staff accounts found.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {staffList.map((member) => (
                <div key={member.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900 truncate">{member.name}</p>
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
                    <p className="text-xs text-gray-400 truncate">{member.email}</p>
                  </div>

                  {member.is_active && member.role !== 'admin' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs h-8 px-2"
                      onClick={() => {
                        if (confirm(`Deactivate staff member ${member.name}?`)) {
                          deactivateMutation.mutate(member.id);
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Deactivate
                    </Button>
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
