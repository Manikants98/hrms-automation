import axiosInstance from '../../configs/axio.config';
import type { ApiResponse } from '../../types/api.types';

export interface LeaveApplication {
  id: number;
  employee_id: number;
  employee_name?: string;
  employee_email?: string;
  employee_department?: string;
  leave_type_id: number;
  leave_type_name?: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  approval_status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  approved_by?: number;
  approved_by_name?: string;
  approved_date?: string;
  rejection_reason?: string;
  createdate?: string;
  updatedate?: string;
  is_active: 'Y' | 'N';
}

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

export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface GetLeaveApplicationsParams {
  search?: string;
  page?: number;
  limit?: number;
  employee_id?: number;
  leave_type_id?: number;
  approval_status?: LeaveApplication['approval_status'];
  start_date?: string;
  end_date?: string;
  isActive?: 'Y' | 'N';
}

export interface ManageLeaveApplicationPayload {
  employee_id: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  is_active: 'Y' | 'N';
}

export interface CreateLeaveApplicationPayload extends ManageLeaveApplicationPayload {}

export interface UpdateLeaveApplicationPayload extends ManageLeaveApplicationPayload {
  id: number;
}

export interface ApproveLeaveApplicationPayload {
  id: number;
  approved_by: number;
}

export interface RejectLeaveApplicationPayload {
  id: number;
  rejected_by: number;
  rejection_reason: string;
}

export interface ApproveLeavePayload {
  id: number;
  approval_status: 'Approved' | 'Rejected';
  rejection_reason?: string;
}

export const fetchLeaveApplications = async (
  params?: GetLeaveApplicationsParams
): Promise<ApiResponse<LeaveApplication[]>> => {
  const response = await axiosInstance.get('/leave-applications', { params });
  return response.data;
};

export const fetchLeaveApplicationById = async (
  id: number
): Promise<ApiResponse<LeaveApplication>> => {
  const response = await axiosInstance.get(`/leave-applications/${id}`);
  return response.data;
};

export const createLeaveApplication = async (
  data: ManageLeaveApplicationPayload
): Promise<ApiResponse<LeaveApplication>> => {
  const response = await axiosInstance.post('/leave-applications', data);
  return response.data;
};

export const updateLeaveApplication = async (
  id: number,
  data: Partial<ManageLeaveApplicationPayload>
): Promise<ApiResponse<LeaveApplication>> => {
  const response = await axiosInstance.put(`/leave-applications/${id}`, data);
  return response.data;
};

export const approveLeaveApplication = async (
  data: ApproveLeavePayload
): Promise<ApiResponse<LeaveApplication>> => {
  const { id, ...payload } = data;
  const response = await axiosInstance.put(`/leave-applications/${id}/approve`, payload);
  return response.data;
};

export const rejectLeaveApplication = async (
  data: RejectLeaveApplicationPayload
): Promise<ApiResponse<LeaveApplication>> => {
  const { id, ...payload } = data;
  const response = await axiosInstance.put(`/leave-applications/${id}/reject`, payload);
  return response.data;
};

export const deleteLeaveApplication = async (
  id: number
): Promise<ApiResponse<void>> => {
  const response = await axiosInstance.delete(`/leave-applications/${id}`);
  return response.data;
};

export default {
  fetchLeaveApplications,
  fetchLeaveApplicationById,
  createLeaveApplication,
  updateLeaveApplication,
  approveLeaveApplication,
  rejectLeaveApplication,
  deleteLeaveApplication,
};
