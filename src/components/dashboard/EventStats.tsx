import type { DashboardMetrics } from '../../types';

interface EventStatsProps {
  metrics: DashboardMetrics;
  eventName?: string;
}

export function EventStats({ metrics, eventName }: EventStatsProps) {
  const registrationPercent =
    metrics.total_capacity > 0
      ? Math.round((metrics.registered / metrics.total_capacity) * 100)
      : 0;
  const checkinPercent =
    metrics.registered > 0
      ? Math.round((metrics.checked_in / metrics.registered) * 100)
      : 0;
  const paymentPercent =
    metrics.registered > 0
      ? Math.round((metrics.payment_pending / metrics.registered) * 100)
      : 0;

  return (
    <div className="bg-white border-2 border-neo-black rounded-xl p-4 shadow-brutal flex flex-col justify-between gap-4 h-full">
      <div className="flex items-center justify-between border-b-2 border-neo-black pb-2.5">
        <h3 className="text-sm font-black uppercase text-neo-black tracking-tight truncate">
          {eventName ? `${eventName} Breakdown` : 'Event Breakdown'}
        </h3>
        <span className="text-[10px] font-black uppercase bg-neo-yellow border-2 border-neo-black shadow-brutal-sm px-2 py-0.5 rounded">
          Live
        </span>
      </div>

      <div className="space-y-4">
        {/* Registration Fill */}
        <div>
          <div className="flex justify-between items-baseline text-xs mb-1 font-bold">
            <span className="uppercase text-gray-600 font-black text-[11px]">
              Registration Fill
            </span>
            <span className="font-black text-neo-purple">{registrationPercent}%</span>
          </div>
          <div className="h-3 w-full bg-neo-bg border-2 border-neo-black rounded-md overflow-hidden flex">
            <div
              className="h-full bg-neo-purple border-r-2 border-neo-black transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, registrationPercent))}%` }}
            />
          </div>
          <p className="text-[11px] font-bold text-gray-500 mt-1">
            {metrics.registered} / {metrics.total_capacity} claimed
          </p>
        </div>

        {/* Check-in Rate */}
        <div>
          <div className="flex justify-between items-baseline text-xs mb-1 font-bold">
            <span className="uppercase text-gray-600 font-black text-[11px]">
              Check-in Rate
            </span>
            <span className="font-black text-emerald-600">{checkinPercent}%</span>
          </div>
          <div className="h-3 w-full bg-neo-bg border-2 border-neo-black rounded-md overflow-hidden flex">
            <div
              className="h-full bg-neo-lime border-r-2 border-neo-black transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, checkinPercent))}%` }}
            />
          </div>
          <p className="text-[11px] font-bold text-gray-500 mt-1">
            {metrics.checked_in} of {metrics.registered} entered
          </p>
        </div>

        {/* Payment Pending */}
        <div>
          <div className="flex justify-between items-baseline text-xs mb-1 font-bold">
            <span className="uppercase text-gray-600 font-black text-[11px]">
              Payment Pending
            </span>
            <span className="font-black text-neo-peach">{paymentPercent}%</span>
          </div>
          <div className="h-3 w-full bg-neo-bg border-2 border-neo-black rounded-md overflow-hidden flex">
            <div
              className="h-full bg-neo-peach border-r-2 border-neo-black transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, paymentPercent))}%` }}
            />
          </div>
          <p className="text-[11px] font-bold text-gray-500 mt-1">
            {metrics.payment_pending} awaiting verification
          </p>
        </div>
      </div>
    </div>
  );
}
