import {
  Users,
  UserCheck,
  UserX,
  Clock,
  AlertCircle,
  Star,
  BarChart3,
} from 'lucide-react';
import { MetricCard } from './MetricCard';
import type { DashboardMetrics } from '../../types';

interface MetricsGridProps {
  metrics: DashboardMetrics;
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  const checkinPercent = metrics.registered > 0
    ? Math.round((metrics.checked_in / metrics.registered) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <MetricCard
        title="Total Capacity"
        value={metrics.total_capacity}
        icon={BarChart3}
        color="indigo"
        subtitle="Event capacity"
      />
      <MetricCard
        title="Registered"
        value={metrics.registered}
        icon={Users}
        color="blue"
        subtitle={`${metrics.available_slots} slots available`}
      />
      <MetricCard
        title="Checked In"
        value={metrics.checked_in}
        icon={UserCheck}
        color="green"
        subtitle={`${checkinPercent}% attendance`}
      />
      <MetricCard
        title="Not Arrived"
        value={metrics.not_arrived}
        icon={UserX}
        color="gray"
        subtitle="Registered but not checked in"
      />
      <MetricCard
        title="Payment Pending"
        value={metrics.payment_pending}
        icon={AlertCircle}
        color="amber"
        subtitle="Awaiting payment verification"
      />
      <MetricCard
        title="Available Slots"
        value={metrics.available_slots}
        icon={Clock}
        color="purple"
        subtitle="Open registrations"
      />
      <MetricCard
        title="Exclusive Members"
        value={metrics.exclusive_members}
        icon={Star}
        color="indigo"
        subtitle="Multi-event pass holders"
      />
    </div>
  );
}
