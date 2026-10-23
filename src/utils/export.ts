import * as XLSX from 'xlsx';
import type { Registration } from '../types';
import { formatDate, formatPassType, formatPaymentStatus, formatPhone } from './format';

export function exportRegistrationsToCSV(registrations: Registration[], filename = 'attendees.csv') {
  const rows = registrations.map((r) => ({
    'Registration ID': r.registration_id,
    'Name': r.attendee_name,
    'Phone': formatPhone(r.phone),
    'Email': r.email || '',
    'Pass Type': formatPassType(r.pass?.pass_type || ''),
    'Payment Status': formatPaymentStatus(r.payment_status),
    'Payment Ref': r.payment_reference || '',
    'Credits Used': r.pass?.used_credits ?? '',
    'Credits Remaining': r.pass?.remaining_credits ?? '',
    'Registered At': formatDate(r.created_at),
    'Notes': r.notes || '',
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Attendees');
  XLSX.writeFile(wb, filename);
}

export function exportToExcel(registrations: Registration[], filename = 'attendees.xlsx') {
  exportRegistrationsToCSV(registrations, filename);
}

export function parseImportFile(file: File): Promise<Partial<Registration>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);
        const mapped = rows.map((row) => ({
          attendee_name: row['Name'] || row['name'] || '',
          phone: row['Phone'] || row['phone'] || '',
          email: row['Email'] || row['email'] || '',
          payment_reference: row['Payment Ref'] || row['payment_reference'] || '',
          notes: row['Notes'] || row['notes'] || '',
        }));
        resolve(mapped);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
