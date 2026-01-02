import axiosInstance from '../../configs/axio.config';
import type { ApiResponse } from '../../types/api.types';

export type AttendanceStatus =
  | 'Present'
  | 'Absent'
  | 'Half Day'
  | 'Leave'
  | 'Holiday'
  | 'Weekend';

export interface AttendanceRecord {
  id: number;
  employee_id: number;
  employee_name: string;
  employee_email: string;
  employee_department?: string;
  attendance_date: string;
  status: AttendanceStatus;
  punch_in_time?: string;
  punch_out_time?: string;
  total_hours?: number;
  remarks?: string;
  marked_by?: number;
  marked_by_name?: string;
  createdate?: string;
  updatedate?: string;
}

export interface GetAttendanceParams {
  attendance_date?: string;
  employee_id?: number;
  department_id?: number;
  status?: AttendanceStatus;
  page?: number;
  limit?: number;
}

export interface MarkAttendancePayload {
  employee_id: number;
  attendance_date: string;
  status: AttendanceStatus;
  punch_in_time?: string;
  punch_out_time?: string;
  remarks?: string;
}

export interface UpdateAttendancePayload extends MarkAttendancePayload {
  id: number;
}

export const fetchAttendance = async (
  params?: GetAttendanceParams
): Promise<ApiResponse<AttendanceRecord[]>> => {
  const response = await axiosInstance.get('/attendance', { params });
  return response.data;
};

export const fetchAttendanceById = async (
  id: number
): Promise<ApiResponse<AttendanceRecord>> => {
  const response = await axiosInstance.get(`/attendance/${id}`);
  return response.data;
};

export const markAttendance = async (
  data: MarkAttendancePayload
): Promise<ApiResponse<AttendanceRecord>> => {
  const response = await axiosInstance.post('/attendance', data);
  return response.data;
};

export const updateAttendance = async (
  data: UpdateAttendancePayload
): Promise<ApiResponse<AttendanceRecord>> => {
  const { id, ...payload } = data;
  const response = await axiosInstance.put(`/attendance/${id}`, payload);
  return response.data;
};

export const deleteAttendance = async (
  id: number
): Promise<ApiResponse<void>> => {
  const response = await axiosInstance.delete(`/attendance/${id}`);
  return response.data;
};

export const punchIn = async (data: {
  latitude?: number;
  longitude?: number;
  address?: string;
}): Promise<ApiResponse<AttendanceRecord>> => {
  const response = await axiosInstance.post('/attendance/punch', {
    action_type: 'punch_in',
    ...data,
  });
  return response.data;
};

export const punchOut = async (data: {
  latitude?: number;
  longitude?: number;
  address?: string;
}): Promise<ApiResponse<AttendanceRecord>> => {
  const response = await axiosInstance.post('/attendance/punch', {
    action_type: 'punch_out',
    ...data,
  });
  return response.data;
};

export default {
  fetchAttendance,
  fetchAttendanceById,
  markAttendance,
  updateAttendance,
  deleteAttendance,
  punchIn,
  punchOut,
};

export type { ApiResponse };
