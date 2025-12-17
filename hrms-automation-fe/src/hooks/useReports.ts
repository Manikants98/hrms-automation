import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
  fetchAttendanceHistoryReport,
  type AttendanceHistoryReportFilters,
  type AttendanceHistoryReportData,
} from '../services/reports/attendance';

export const reportKeys = {
  all: ['reports'] as const,
  lists: () => [...reportKeys.all, 'list'] as const,
  attendanceHistory: (filters?: AttendanceHistoryReportFilters) =>
    [...reportKeys.lists(), 'attendance-history', filters] as const,
};

export const useAttendanceHistoryReport = (
  filters?: AttendanceHistoryReportFilters,
  options?: Omit<
    UseQueryOptions<AttendanceHistoryReportData>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<AttendanceHistoryReportData>({
    queryKey: reportKeys.attendanceHistory(filters),
    queryFn: () => fetchAttendanceHistoryReport(filters),
    staleTime: 3 * 60 * 1000,
    ...options,
  });
};
