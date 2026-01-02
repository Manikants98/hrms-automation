import axiosInstance from '../configs/axio.config';
import type { ApiResponse } from '../types/api.types';

export interface AuditLogFilters {
  page?: number;
  limit?: number;
  table_name?: string;
  action?: 'CREATE' | 'UPDATE' | 'DELETE';
  user_id?: number;
  start_date?: string;
  end_date?: string;
}

export interface AuditLogData {
  id: number;
  table_name: string;
  record_id: number;
  action: string;
  changed_data: any;
  changed_by: number;
  user_name: string;
  user_email: string;
  employee_id: string | null;
  changed_at: string;
  ip_address: string | null;
  device_info: string | null;
  session_id: string | null;
}

export interface AuditLogsResponse {
  logs: AuditLogData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  statistics: {
    total_logs: number;
    by_action: {
      CREATE: number;
      UPDATE: number;
      DELETE: number;
    };
    unique_tables: Array<{ table_name: string }>;
    unique_users: Array<{ changed_by: number }>;
    unique_tables_count: number;
    unique_users_count: number;
  };
}

/**
 * Fetch Audit Logs Data
 */
export const fetchAuditLogs = async (
  filters?: AuditLogFilters
): Promise<ApiResponse<AuditLogsResponse>> => {
  const response = await axiosInstance.get('/audit-logs', { params: filters });
  return response.data;
};

export default {
  fetchAuditLogs,
};
