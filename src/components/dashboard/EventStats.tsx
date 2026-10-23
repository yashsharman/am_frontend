import { CheckCircle2, Users } from 'lucide-react';
import type { DashboardMetrics } from '../../types';

interface EventStatsProps {
  metrics: DashboardMetrics;
  eventName?: string;
}

export function EventStats({ metrics, eventName }: EventStatsProps) {
  const regPercent =
    metrics.total_capacity > 0
      ? Math.round((metrics.registered / metrics.total_capacity) * 100)
      : 0;

  const checkinPercent =
    metrics.registered > 0
      ? Math.round((metrics.checked_in / metrics.registered) * 100)
      : 0;

  return (
    <div className="bg-[#171622] rounded-xl border-2 border-white/15 p-5 shadow-brutal space-y-4 text-white">
      {eventName && (
        <div className="flex items-center justify-between pb-3 border-b-2 border-white/10">
          <h3 className="font-black text-white uppercase tracking-tight text-sm">
            {eventName}
          </h3>
          <span className="text-xs font-bold text-gray-400">Live Status</span>
        </div>
      )}

      <div className="space-y-3.5">
        {/* Registration Progress */}
        <div>
          <div className="flex justify-between items-baseline text-xs mb-1 font-bold">
            <span className="uppercase text-gray-400 font-black text-[11px] flex items-center gap-1">
              <Users className="h-3 w-3 text-neo-purple" />
              Capacity Filled
            </span>
            <span className="font-black text-neo-purple">{regPercent}%</span>
          </div>
          <div className="h-3 w-full bg-[#0e0d15] border-2 border-white/20 rounded-md overflow-hidden flex">
            <div
              className="h-full bg-neo-purple border-r-2 border-white/30 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, regPercent))}%` }}
            />
          </div>
          <p className="text-[11px] font-bold text-gray-400 mt-1">
            {metrics.registered} of {metrics.total_capacity} slots booked
          </p>
        </div>

        {/* Check-in Progress */}
        <div>
          <div className="flex justify-between items-baseline text-xs mb-1 font-bold">
            <span className="uppercase text-gray-400 font-black text-[11px] flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-neo-lime" />
              Check-in Turnout
            </span>
            <span className="font-black text-neo-lime">{checkinPercent}%</span>
          </div>
          <div className="h-3 w-full bg-[#0e0d15] border-2 border-white/20 rounded-md overflow-hidden flex">
            <div
              className="h-full bg-neo-lime border-r-2 border-neo-black transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, checkinPercent))}%` }}
            />
          </div>
          <p className="text-[11px] font-bold text-gray-400 mt-1">
            {metrics.checked_in} of {metrics.registered} entered
          </p>
        </div>

        {/* Payment Pending (Commented out for now)
        <div>
          <div className="flex justify-between items-baseline text-xs mb-1 font-bold">
            <span className="uppercase text-gray-400 font-black text-[11px]">
              Payment Pending
            </span>
            <span className="font-black text-neo-peach">{paymentPercent}%</span>
          </div>
          <div className="h-3 w-full bg-[#0e0d15] border-2 border-white/20 rounded-md overflow-hidden flex">
            <div
              className="h-full bg-neo-peach border-r-2 border-white/30 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, paymentPercent))}%` }}
            />
          </div>
          <p className="text-[11px] font-bold text-gray-400 mt-1">
            {metrics.payment_pending} awaiting verification
          </p>
        </div>
        */}
      </div>
    </div>
  );
}
