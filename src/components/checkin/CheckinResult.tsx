import { CheckCircle, XCircle, AlertCircle, ShieldCheck, Ticket } from 'lucide-react';
import type { CheckinScanResult } from '../../types';
import { formatDateTime } from '../../utils/format';

interface CheckinResultProps {
  result: CheckinScanResult;
  onScanNext?: () => void;
}

type ResultState =
  | 'success'
  | 'already_checked_in'
  | 'payment_pending'
  | 'no_credits'
  | 'wrong_event'
  | 'error';

function getResultState(result: CheckinScanResult): ResultState {
  if (result.success) return 'success';
  const code = (result.error_code || '').toUpperCase();
  switch (code) {
    case 'ALREADY_CHECKED_IN':
      return 'already_checked_in';
    case 'PAYMENT_PENDING':
      return 'payment_pending';
    case 'NO_CREDITS':
      return 'no_credits';
    case 'WRONG_EVENT':
      return 'wrong_event';
    default:
      return 'error';
  }
}

export function CheckinResult({ result, onScanNext }: CheckinResultProps) {
  const state = getResultState(result);

  if (state === 'success') {
    const isExclusive = result.pass_type === 'exclusive';
    return (
      <div className="rounded-xl border-2 border-neo-lime bg-[#064e3b]/30 p-5 sm:p-6 text-center shadow-brutal transition-all animate-in fade-in zoom-in-95 duration-200 text-white">
        {/* Top Header Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-neo-lime text-neo-black text-xs font-black tracking-wider uppercase mb-3 border-2 border-neo-black shadow-brutal-sm">
          <ShieldCheck className="h-4 w-4 stroke-[3]" />
          VERIFIED GATE PASS
        </div>

        {/* Attendee Name */}
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">
          {result.attendee_name || 'Attendee'}
        </h2>

        {result.registration_id && (
          <p className="text-xs text-gray-400 mb-4 font-mono font-bold">
            {result.registration_id}
          </p>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 my-4 bg-[#171622] p-4 rounded-xl border-2 border-white/20 shadow-brutal-sm text-left">
          <div>
            <p className="text-[11px] font-black uppercase text-gray-400">Pass Type</p>
            <p className="text-sm font-black text-white flex items-center gap-1 mt-0.5">
              <Ticket className="h-4 w-4 text-neo-lime stroke-[2.5]" />
              {isExclusive ? 'Exclusive' : 'One-day pass'}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-black uppercase text-gray-400">Gate Status</p>
            <p className="text-sm font-black text-neo-lime flex items-center gap-1 mt-0.5">
              <CheckCircle className="h-4 w-4 text-neo-lime stroke-[3]" />
              In Gate
            </p>
          </div>

          {isExclusive && (
            <div className="col-span-2 pt-2 border-t-2 border-white/10">
              <p className="text-[11px] font-black uppercase text-gray-400">
                Credits Remaining
              </p>
              <p className="text-sm font-black text-neo-yellow mt-0.5">
                {result.remaining_credits ?? 2} of 3
              </p>
            </div>
          )}
        </div>

        {/* Status indicator */}
        <div className="flex items-center justify-center gap-2 text-neo-lime font-black text-base mt-2">
          <CheckCircle className="h-5 w-5 stroke-[3]" />
          Entry Approved
        </div>

        {result.check_in_time && (
          <p className="text-[11px] font-bold text-gray-400 mt-1">
            Recorded {formatDateTime(result.check_in_time)}
          </p>
        )}

        {onScanNext && (
          <button
            onClick={onScanNext}
            className="mt-4 inline-flex items-center justify-center w-full h-11 px-4 rounded-lg bg-neo-purple text-white font-black text-xs uppercase tracking-wider hover:bg-indigo-600 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all border-2 border-white/20 shadow-brutal"
          >
            Scan Next Attendee
          </button>
        )}
      </div>
    );
  }

  // Error / Warning states
  const isAlreadyCheckedIn = state === 'already_checked_in';

  return (
    <div
      className={`rounded-xl border-2 p-5 sm:p-6 text-center shadow-brutal transition-all animate-in fade-in zoom-in-95 duration-200 text-white ${
        isAlreadyCheckedIn
          ? 'bg-amber-950/30 border-neo-yellow'
          : 'bg-rose-950/30 border-neo-peach'
      }`}
    >
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-black tracking-wider uppercase mb-3 border-2 border-neo-black shadow-brutal-sm ${
          isAlreadyCheckedIn
            ? 'bg-neo-yellow text-neo-black'
            : 'bg-neo-peach text-white'
        }`}
      >
        {isAlreadyCheckedIn ? (
          <AlertCircle className="h-4 w-4 stroke-[3]" />
        ) : (
          <XCircle className="h-4 w-4 stroke-[3]" />
        )}
        {isAlreadyCheckedIn ? 'ALREADY CHECKED IN' : 'SCAN FAILED'}
      </div>

      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
        {result.error_message || 'Verification Error'}
      </h2>

      {result.attendee_name && (
        <p className="text-sm font-black text-gray-300 mb-3">
          Attendee: {result.attendee_name}
        </p>
      )}

      {onScanNext && (
        <button
          onClick={onScanNext}
          className="mt-4 inline-flex items-center justify-center w-full h-11 px-4 rounded-lg bg-[#171622] text-white font-black text-xs uppercase tracking-wider hover:bg-white/10 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all border-2 border-white/20 shadow-brutal"
        >
          Try Again / Next Scan
        </button>
      )}
    </div>
  );
}
