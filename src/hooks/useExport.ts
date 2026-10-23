import { useQuery } from '@tanstack/react-query';
import { registrationsApi } from '../api/registrations';
import { exportRegistrationsToCSV, exportToExcel } from '../utils/export';
import toast from 'react-hot-toast';

export function useExport(filters?: { event_id?: string; payment_status?: string; pass_type?: string }) {
  const { isLoading } = useQuery({
    queryKey: ['registrations-export', filters],
    queryFn: () => registrationsApi.list({ ...filters, page: 1 }),
    enabled: false,
  });

  const exportCSV = async () => {
    try {
      const result = await registrationsApi.list({ ...filters });
      exportRegistrationsToCSV(result.results, 'aftermiles-attendees.csv');
      toast.success('CSV exported successfully');
    } catch {
      toast.error('Export failed');
    }
  };

  const exportExcel = async () => {
    try {
      const result = await registrationsApi.list({ ...filters });
      exportToExcel(result.results, 'aftermiles-attendees.xlsx');
      toast.success('Excel exported successfully');
    } catch {
      toast.error('Export failed');
    }
  };

  return { exportCSV, exportExcel, isExporting: isLoading };
}
