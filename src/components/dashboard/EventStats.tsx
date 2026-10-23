import { Progress } from '../ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { DashboardMetrics } from '../../types';

interface EventStatsProps {
  metrics: DashboardMetrics;
  eventName?: string;
}

export function EventStats({ metrics, eventName }: EventStatsProps) {
  const registrationPercent = metrics.total_capacity > 0
    ? Math.round((metrics.registered / metrics.total_capacity) * 100)
    : 0;
  const checkinPercent = metrics.registered > 0
    ? Math.round((metrics.checked_in / metrics.registered) * 100)
    : 0;
  const paymentPercent = metrics.registered > 0
    ? Math.round((metrics.payment_pending / metrics.registered) * 100)
    : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          {eventName ? `${eventName} — Stats` : 'Event Statistics'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Registration Fill</span>
            <span className="font-medium text-gray-900">{registrationPercent}%</span>
          </div>
          <Progress value={registrationPercent} className="h-2" />
          <p className="text-xs text-gray-400 mt-1">
            {metrics.registered} / {metrics.total_capacity} seats filled
          </p>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Check-in Rate</span>
            <span className="font-medium text-green-700">{checkinPercent}%</span>
          </div>
          <Progress value={checkinPercent} className="h-2 [&>div]:bg-green-500" />
          <p className="text-xs text-gray-400 mt-1">
            {metrics.checked_in} of {metrics.registered} checked in
          </p>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Payment Pending</span>
            <span className="font-medium text-amber-700">{paymentPercent}%</span>
          </div>
          <Progress value={paymentPercent} className="h-2 [&>div]:bg-amber-500" />
          <p className="text-xs text-gray-400 mt-1">
            {metrics.payment_pending} awaiting verification
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
