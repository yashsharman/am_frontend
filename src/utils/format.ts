import { format, parseISO, isValid } from 'date-fns';

export function formatDate(dateStr: string, fmt = 'dd MMM yyyy'): string {
  try {
    const d = parseISO(dateStr);
    return isValid(d) ? format(d, fmt) : dateStr;
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  return formatDate(dateStr, 'dd MMM yyyy, hh:mm a');
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

export function formatPassType(passType: string): string {
  return passType === 'exclusive' ? 'Exclusive' : 'One Day';
}

export function formatPaymentStatus(status: string): string {
  switch (status) {
    case 'verified': return 'Verified';
    case 'pending': return 'Pending';
    case 'failed': return 'Failed';
    default: return status;
  }
}
