import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
  fetchAuditLogs,
  type AuditLogFilters,
  type AuditLogsResponse,
} from '../services/auditLogs';
import type { ApiResponse } from 'types/api.types';

export const auditLogKeys = {
  all: ['audit-logs'] as const,
  lists: () => [...auditLogKeys.all, 'list'] as const,
  list: (filters?: AuditLogFilters) =>
    [...auditLogKeys.lists(), filters] as const,
};

/**
 * Hook to fetch Audit Logs Data
 */
export const useAuditLogs = (
  filters?: AuditLogFilters,
  options?: Omit<
    UseQueryOptions<ApiResponse<AuditLogsResponse>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<ApiResponse<AuditLogsResponse>>({
    queryKey: auditLogKeys.list(filters),
    queryFn: async () => await fetchAuditLogs(filters),
    staleTime: 3 * 60 * 1000,
    ...options,
  });
};
