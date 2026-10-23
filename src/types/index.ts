export type UserRole = 'admin' | 'checkin_staff';
export type PassType = 'one_day' | 'exclusive';
export type PaymentStatus = 'pending' | 'verified' | 'failed';
export type EventStatus = 'upcoming' | 'active' | 'completed';
export type CheckinMethod = 'qr_scan' | 'manual_search';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  venue: string;
  description?: string;
  capacity: number;
  is_exclusive_eligible: boolean;
  status: EventStatus;
  created_at: string;
}

export interface Registration {
  id: string;
  registration_id: string;
  attendee_name: string;
  phone: string;
  email?: string;
  pass_id: string;
  event_id?: string;
  payment_status: PaymentStatus;
  payment_reference?: string;
  notes?: string;
  created_at: string;
  pass?: Pass;
}

export interface Pass {
  id: string;
  pass_type: PassType;
  registration_id: string;
  qr_token: string;
  valid_event_id?: string;
  total_credits: number;
  used_credits: number;
  remaining_credits: number;
  is_active: boolean;
  created_at: string;
}

export interface Checkin {
  id: string;
  pass_id: string;
  registration_id: string;
  event_id: string;
  checked_in_at: string;
  checked_in_by: string;
  method: CheckinMethod;
  attendee_name?: string;
  registration_id_human?: string;
}

export interface DashboardMetrics {
  total_capacity: number;
  registered: number;
  available_slots: number;
  payment_pending: number;
  checked_in: number;
  not_arrived: number;
  exclusive_members: number;
}

export interface CheckinScanResult {
  success: boolean;
  attendee_name?: string;
  pass_type?: PassType;
  remaining_credits?: number;
  registration_id?: string;
  check_in_time?: string;
  error_code?: string;
  error_message?: string;
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface RegistrationFormData {
  attendee_name: string;
  phone: string;
  email?: string;
  pass_type: PassType;
  event_id?: string;
  payment_status: PaymentStatus;
  payment_reference?: string;
  notes?: string;
}

export interface EventFormData {
  name: string;
  date: string;
  venue: string;
  description?: string;
  capacity: number;
  is_exclusive_eligible: boolean;
}
