import { CheckCircle, XCircle, AlertCircle, ShieldCheck, Ticket, Clock } from 'lucide-react';
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
  const isAlreadyCheckedIn = state === 'already_checked_in';

  // For both fresh successful scans AND already-scanned passes, show full details!
  if (state === 'success' || isAlreadyCheckedIn) {
    const isExclusive = result.pass_type === 'exclusive';

    return (
      <div
        className={`rounded-xl border-2 p-5 sm:p-6 text-center shadow-brutal transition-all animate-in fade-in zoom-in-95 duration-200 text-white ${
          isAlreadyCheckedIn
            ? 'border-neo-yellow bg-amber-950/30'
            : 'border-neo-lime bg-[#064e3b]/30'
        }`}
      >
        {/* Top Header Badge */}
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-black tracking-wider uppercase mb-3 border-2 border-neo-black shadow-brutal-sm ${
            isAlreadyCheckedIn
              ? 'bg-neo-yellow text-neo-black'
              : 'bg-neo-lime text-neo-black'
          }`}
        >
          {isAlreadyCheckedIn ? (
            <>
              <AlertCircle className="h-4 w-4 stroke-[3]" />
              ALREADY SCANNED / IN GATE
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4 stroke-[3]" />
              VERIFIED GATE PASS
            </>
          )}
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

        {/* Notice banner for already scanned */}
        {isAlreadyCheckedIn && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-amber-950/60 border border-neo-yellow/40 text-neo-yellow text-xs font-black flex items-center justify-center gap-1.5">
            <AlertCircle className="h-4 w-4 shrink-0 stroke-[2.5]" />
            <span>This QR badge was already checked in earlier</span>
          </div>
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
            <p
              className={`text-sm font-black flex items-center gap-1 mt-0.5 ${
                isAlreadyCheckedIn ? 'text-neo-yellow' : 'text-neo-lime'
              }`}
            >
              {isAlreadyCheckedIn ? (
                <>
                  <Clock className="h-4 w-4 text-neo-yellow stroke-[2.5]" />
                  Previously In
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 text-neo-lime stroke-[3]" />
                  In Gate
                </>
              )}
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
        <div
          className={`flex items-center justify-center gap-2 font-black text-base mt-2 ${
            isAlreadyCheckedIn ? 'text-neo-yellow' : 'text-neo-lime'
          }`}
        >
          {isAlreadyCheckedIn ? (
            <>
              <AlertCircle className="h-5 w-5 stroke-[2.5]" />
              Already Admitted
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 stroke-[3]" />
              Entry Approved
            </>
          )}
        </div>

        {result.check_in_time && (
          <p className="text-[11px] font-bold text-gray-400 mt-1">
            {isAlreadyCheckedIn ? 'First scanned' : 'Recorded'}{' '}
            {formatDateTime(result.check_in_time)}
          </p>
        )}

        {onScanNext && (
          <button
            onClick={onScanNext}
            className={`mt-4 inline-flex items-center justify-center w-full h-11 px-4 rounded-lg text-white font-black text-xs uppercase tracking-wider hover:opacity-90 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all border-2 border-white/20 shadow-brutal ${
              isAlreadyCheckedIn ? 'bg-[#1f1d2e]' : 'bg-neo-purple hover:bg-indigo-600'
            }`}
          >
            Scan Next Attendee
          </button>
        )}
      </div>
    );
  }

  // Other Error states (invalid, payment pending, wrong event, etc.)
  return (
    <div className="rounded-xl border-2 p-5 sm:p-6 text-center shadow-brutal transition-all animate-in fade-in zoom-in-95 duration-200 text-white bg-rose-950/30 border-neo-peach">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-black tracking-wider uppercase mb-3 border-2 border-neo-black shadow-brutal-sm bg-neo-peach text-white">
        <XCircle className="h-4 w-4 stroke-[3]" />
        SCAN FAILED
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
