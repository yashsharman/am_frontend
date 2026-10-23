import {
  Users,
  UserCheck,
  Clock,
  Star,
} from "lucide-react";
import { MetricCard } from "./MetricCard";
import type { DashboardMetrics } from "../../types";

interface MetricsGridProps {
  metrics: DashboardMetrics;
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  const regPercent =
    metrics.total_capacity > 0
      ? Math.round((metrics.registered / metrics.total_capacity) * 100)
      : 0;

  const checkinPercent =
    metrics.registered > 0
      ? Math.round((metrics.checked_in / metrics.registered) * 100)
      : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      <MetricCard
        title="Registered"
        value={metrics.registered}
        icon={Users}
        color="purple"
        badge={`${regPercent}%`}
        subtitle={`${metrics.available_slots} slots left`}
      />
      <MetricCard
        title="Checked In"
        value={metrics.checked_in}
        icon={UserCheck}
        color="lime"
        badge={`${checkinPercent}%`}
        subtitle={`${metrics.not_arrived} not arrived`}
      />
      {/* Payment pending metric card commented out for now
      <MetricCard
        title="Awaiting Pay"
        value={metrics.payment_pending}
        icon={AlertCircle}
        color="peach"
        badge={metrics.payment_pending > 0 ? "Pending" : "Clear"}
        subtitle="Unverified passes"
      />
      */}
      <MetricCard
        title="VIP / Exclusive"
        value={metrics.exclusive_members}
        icon={Star}
        color="yellow"
        badge="VIP"
        subtitle="Tier pass holders"
      />
      <MetricCard
        title="Available Slots"
        value={metrics.available_slots}
        icon={Clock}
        color="pink"
        subtitle="Open capacity"
      />
      <MetricCard
        title="Not Arrived"
        value={metrics.not_arrived}
        icon={Clock}
        color="purple"
        subtitle="Expected attendees"
      />
    </div>
  );
}
