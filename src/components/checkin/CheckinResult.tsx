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
      <div className="rounded-xl border-2 border-neo-black bg-[#ECFDF5] p-5 sm:p-6 text-center shadow-brutal transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-neo-lime text-neo-black text-xs font-black tracking-wider uppercase mb-3 border-2 border-neo-black shadow-brutal-sm">
          <ShieldCheck className="h-4 w-4 stroke-[3]" />
          VERIFIED GATE PASS
        </div>

        {/* Attendee Name */}
        <h2 className="text-2xl sm:text-3xl font-black text-neo-black tracking-tight mb-1">
          {result.attendee_name || 'Attendee'}
        </h2>

        {result.registration_id && (
          <p className="text-xs text-gray-600 mb-4 font-mono font-bold">
            {result.registration_id}
          </p>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 my-4 bg-white p-4 rounded-xl border-2 border-neo-black shadow-brutal-sm text-left">
          <div>
            <p className="text-[11px] font-black uppercase text-gray-500">Pass Type</p>
            <p className="text-sm font-black text-neo-black flex items-center gap-1 mt-0.5">
              <Ticket className="h-4 w-4 text-neo-purple stroke-[2.5]" />
              {isExclusive ? 'Exclusive' : 'One-day pass'}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-black uppercase text-gray-500">Gate Status</p>
            <p className="text-sm font-black text-emerald-700 flex items-center gap-1 mt-0.5">
              <CheckCircle className="h-4 w-4 text-emerald-600 stroke-[3]" />
              In Gate
            </p>
          </div>

          {isExclusive && (
            <div className="col-span-2 pt-2 border-t-2 border-gray-100">
              <p className="text-[11px] font-black uppercase text-gray-500">
                Credits Remaining
              </p>
              <p className="text-sm font-black text-neo-purple mt-0.5">
                {result.remaining_credits ?? 2} of 3
              </p>
            </div>
          )}
        </div>

        {/* Status indicator */}
        <div className="flex items-center justify-center gap-2 text-emerald-900 font-black text-base mt-2">
          <CheckCircle className="h-5 w-5 text-emerald-600 stroke-[3]" />
          Entry Approved
        </div>

        {result.check_in_time && (
          <p className="text-[11px] font-bold text-gray-500 mt-1">
            Recorded {formatDateTime(result.check_in_time)}
          </p>
        )}

        {onScanNext && (
          <button
            onClick={onScanNext}
            className="mt-4 inline-flex items-center justify-center w-full h-11 px-4 rounded-lg bg-neo-purple text-white font-black text-xs uppercase tracking-wider hover:bg-indigo-600 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all border-2 border-neo-black shadow-brutal"
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
      className={`rounded-xl border-2 border-neo-black p-5 sm:p-6 text-center shadow-brutal transition-all animate-in fade-in zoom-in-95 duration-200 ${
        isAlreadyCheckedIn ? 'bg-neo-yellow/30' : 'bg-neo-peach/20'
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

      <h2 className="text-xl sm:text-2xl font-black text-neo-black tracking-tight mb-2">
        {result.error_message || 'Verification Error'}
      </h2>

      {result.attendee_name && (
        <p className="text-sm font-black text-neo-black mb-3">
          Attendee: {result.attendee_name}
        </p>
      )}

      {onScanNext && (
        <button
          onClick={onScanNext}
          className="mt-4 inline-flex items-center justify-center w-full h-11 px-4 rounded-lg bg-neo-black text-white font-black text-xs uppercase tracking-wider hover:bg-gray-800 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all border-2 border-neo-black shadow-brutal"
        >
          Try Again / Next Scan
        </button>
      )}
    </div>
  );
}
