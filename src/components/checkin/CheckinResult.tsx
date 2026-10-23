import { CheckCircle, XCircle, AlertCircle, Clock, ShieldCheck, Ticket } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { CheckinScanResult } from '../../types';
import { formatDateTime } from '../../utils/format';

interface CheckinResultProps {
  result: CheckinScanResult;
  onScanNext?: () => void;
}

type ResultState = 'success' | 'already_checked_in' | 'payment_pending' | 'no_credits' | 'wrong_event' | 'error';

function getResultState(result: CheckinScanResult): ResultState {
  if (result.success) return 'success';
  const code = (result.error_code || '').toUpperCase();
  switch (code) {
    case 'ALREADY_CHECKED_IN': return 'already_checked_in';
    case 'PAYMENT_PENDING': return 'payment_pending';
    case 'NO_CREDITS': return 'no_credits';
    case 'WRONG_EVENT': return 'wrong_event';
    default: return 'error';
  }
}

export function CheckinResult({ result, onScanNext }: CheckinResultProps) {
  const state = getResultState(result);

  if (state === 'success') {
    const isExclusive = result.pass_type === 'exclusive';
    return (
      <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50/90 p-5 sm:p-6 text-center shadow-lg transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold tracking-wider uppercase mb-3 border border-emerald-300">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          VERIFIED ATTENDEE
        </div>

        {/* Attendee Name */}
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-1">
          {result.attendee_name || 'Attendee'}
        </h2>

        {result.registration_id && (
          <p className="text-xs text-gray-500 mb-4 font-mono font-medium">{result.registration_id}</p>
        )}

        {/* Card info grid matching the user prompt */}
        <div className="grid grid-cols-2 gap-3 my-4 bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-emerald-200 text-left">
          <div>
            <p className="text-xs text-gray-500 font-medium">Pass type</p>
            <p className="text-sm font-semibold text-gray-900 flex items-center gap-1 mt-0.5">
              <Ticket className="h-4 w-4 text-emerald-600" />
              {isExclusive ? 'Exclusive' : 'One-day pass'}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 font-medium">Payment status</p>
            <p className="text-sm font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              Verified
            </p>
          </div>

          {isExclusive && (
            <div className="col-span-2 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 font-medium">Event credits remaining</p>
              <p className="text-base font-bold text-indigo-700 mt-0.5">
                {result.remaining_credits ?? 2} of 3
              </p>
            </div>
          )}
        </div>

        {/* Status indicator */}
        <div className="flex items-center justify-center gap-2 text-emerald-800 font-bold text-lg mt-2">
          <CheckCircle className="h-6 w-6 text-emerald-600 fill-emerald-100" />
          Check-in successful
        </div>

        {result.check_in_time && (
          <p className="text-xs text-gray-500 mt-2">
            Recorded at {formatDateTime(result.check_in_time)}
          </p>
        )}

        {onScanNext && (
          <button
            onClick={onScanNext}
            className="mt-4 inline-flex items-center justify-center w-full py-2 px-4 rounded-lg bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-sm"
          >
            Scan Next Attendee
          </button>
        )}
      </div>
    );
  }

  // Error / Warning states
  const isAlreadyCheckedIn = state === 'already_checked_in';
  const isPaymentPending = state === 'payment_pending';
  const isNoCredits = state === 'no_credits';
  const isWrongEvent = state === 'wrong_event';

  let title = 'Check-in Failed';
  let badgeText = 'ENTRY DENIED';
  let badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
  let containerBg = 'bg-rose-50/90 border-rose-400';
  let icon = <XCircle className="h-14 w-14 text-rose-500 mx-auto mb-2" />;

  if (isAlreadyCheckedIn) {
    title = 'Already Checked In';
    badgeText = 'DUPLICATE SCAN';
    badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
    containerBg = 'bg-amber-50/90 border-amber-400';
    icon = <AlertCircle className="h-14 w-14 text-amber-500 mx-auto mb-2" />;
  } else if (isPaymentPending) {
    title = 'Payment Status Pending';
    badgeText = 'PAYMENT UNVERIFIED';
    badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
    containerBg = 'bg-amber-50/90 border-amber-400';
  } else if (isNoCredits) {
    title = 'No Credits Remaining';
    badgeText = 'PASS EXHAUSTED';
  } else if (isWrongEvent) {
    title = 'Not Valid for This Event';
    badgeText = 'INVALID EVENT';
  }

  return (
    <div className={cn('rounded-2xl border-2 p-5 sm:p-6 text-center shadow-lg transition-all animate-in fade-in zoom-in-95 duration-200', containerBg)}>
      <div className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-3 border', badgeColor)}>
        {badgeText}
      </div>

      {icon}

      {result.attendee_name && (
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{result.attendee_name}</h2>
      )}

      {result.registration_id && (
        <p className="text-xs text-gray-500 font-mono mb-2">{result.registration_id}</p>
      )}

      <p className="text-lg font-bold text-gray-900 mb-2">{title}</p>

      {result.error_message && (
        <p className="text-sm text-gray-700 bg-white/70 p-3 rounded-lg border border-gray-200 max-w-sm mx-auto mb-3">
          {result.error_message}
        </p>
      )}

      {isAlreadyCheckedIn && result.check_in_time && (
        <div className="flex items-center justify-center gap-1.5 text-xs text-amber-800 font-medium">
          <Clock className="h-3.5 w-3.5" />
          First scanned at: {formatDateTime(result.check_in_time)}
        </div>
      )}

      {onScanNext && (
        <button
          onClick={onScanNext}
          className="mt-4 inline-flex items-center justify-center w-full py-2 px-4 rounded-lg bg-gray-900 text-white font-medium text-sm hover:bg-gray-800 active:scale-[0.98] transition-all"
        >
          Dismiss & Scan Next
        </button>
      )}
    </div>
  );
}
