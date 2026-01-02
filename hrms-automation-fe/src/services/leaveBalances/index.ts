import axiosInstance from '../../configs/axio.config';
import type { ApiResponse } from '../../types/api.types';

export interface LeaveBalance {
  id: number;
  employee_id: number;
  employee_name?: string;
  employee_code?: string;
  employee_email?: string;
  leave_type_items: Array<{
    leave_type_id: number;
    leave_type_name: string;
    total_allocated: number;
    used: number;
    balance: number;
  }>;
  year: number;
  status: 'Active' | 'Expired';
  createdate?: string;
  updatedate?: string;
  is_active: 'Y' | 'N';
}

export interface LeaveBalanceItem {
  leave_type_id: number;
  leave_type_name: string;
  total_allocated: number;
  used: number;
  balance: number;
}

export type LeaveBalanceStatus = 'Active' | 'Expired';

export type LeaveType =
  | 'Annual'
  | 'Sick'
  | 'Casual'
  | 'Emergency'
  | 'Maternity'
  | 'Paternity'
  | 'Unpaid'
  | 'Marriage'
  | 'Earned'
  | 'Informal'
  | 'Formal'
  | 'Normal';

export interface GetLeaveBalancesParams {
  search?: string;
  page?: number;
  limit?: number;
  employee_id?: number;
  year?: number;
  status?: LeaveBalance['status'];
  isActive?: 'Y' | 'N';
}

export interface ManageLeaveBalancePayload {
  employee_id: number;
  leave_type_items: LeaveBalanceItem[];
  year: number;
  is_active: 'Y' | 'N';
}

export interface UpdateLeaveBalancePayload extends ManageLeaveBalancePayload {
  id: number;
}

export const fetchLeaveBalances = async (
  params?: GetLeaveBalancesParams
): Promise<ApiResponse<LeaveBalance[]>> => {
  const response = await axiosInstance.get('/leave-balances', { params });
  return response.data;
};

export const fetchLeaveBalanceById = async (
  id: number
): Promise<ApiResponse<LeaveBalance>> => {
  const response = await axiosInstance.get(`/leave-balances/${id}`);
  return response.data;
};

export const fetchLeaveBalanceByEmployee = async (
  employeeId: number,
  year?: number
): Promise<ApiResponse<LeaveBalance>> => {
  const params = year ? { year } : {};
  const response = await axiosInstance.get(`/leave-balances/employee/${employeeId}`, { params });
  return response.data;
};

export const createLeaveBalance = async (
  data: ManageLeaveBalancePayload
): Promise<ApiResponse<LeaveBalance>> => {
  const response = await axiosInstance.post('/leave-balances', data);
  return response.data;
};

export const updateLeaveBalance = async (
  data: UpdateLeaveBalancePayload
): Promise<ApiResponse<LeaveBalance>> => {
  const { id, ...payload } = data;
  const response = await axiosInstance.put(`/leave-balances/${id}`, payload);
  return response.data;
};

export const deleteLeaveBalance = async (
  id: number
): Promise<ApiResponse<void>> => {
  const response = await axiosInstance.delete(`/leave-balances/${id}`);
  return response.data;
};

export default {
  fetchLeaveBalances,
  fetchLeaveBalanceById,
  fetchLeaveBalanceByEmployee,
  createLeaveBalance,
  updateLeaveBalance,
  deleteLeaveBalance,
};
