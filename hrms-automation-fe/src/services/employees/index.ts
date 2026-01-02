import axiosInstance from '../../configs/axio.config';
import type { ApiResponse } from '../../types/api.types';

export interface Employee {
  id: number;
  name: string;
  email: string;
  employee_id?: string;
  phone_number?: string;
  role_id: number;
  role_name?: string;
  department_id?: number;
  department_name?: string;
  designation_id?: number;
  designation_name?: string;
  shift_id?: number;
  shift_name?: string;
  company_id?: number;
  company_name?: string;
  date_of_birth?: string;
  date_of_joining?: string;
  salary?: number;
  profile_image?: string;
  address?: string;
  emergency_contact?: string;
  blood_group?: string;
  status: 'Active' | 'Inactive' | 'On Leave' | 'Terminated';
  createdate?: string;
  updatedate?: string;
  is_active: 'Y' | 'N';
}

export interface GetEmployeesParams {
  search?: string;
  page?: number;
  limit?: number;
  role_id?: number;
  department_id?: number;
  designation_id?: number;
  status?: Employee['status'];
  isActive?: 'Y' | 'N';
}

export interface ManageEmployeePayload {
  name: string;
  email: string;
  employee_id?: string;
  phone_number?: string;
  role_id: number;
  department_id?: number;
  designation_id?: number;
  shift_id?: number;
  company_id?: number;
  date_of_birth?: string;
  date_of_joining?: string;
  salary?: number;
  address?: string;
  emergency_contact?: string;
  blood_group?: string;
  status: Employee['status'];
  is_active: 'Y' | 'N';
}

export interface UpdateEmployeePayload extends ManageEmployeePayload {
  id: number;
}

export const fetchEmployees = async (
  params?: GetEmployeesParams
): Promise<ApiResponse<Employee[]>> => {
  const response = await axiosInstance.get('/users', { params });
  return response.data;
};

export const fetchEmployeeById = async (
  id: number
): Promise<ApiResponse<Employee>> => {
  const response = await axiosInstance.get(`/users/${id}`);
  return response.data;
};

export const createEmployee = async (
  data: ManageEmployeePayload
): Promise<ApiResponse<Employee>> => {
  const response = await axiosInstance.post('/users', data);
  return response.data;
};

export const updateEmployee = async (
  data: UpdateEmployeePayload
): Promise<ApiResponse<Employee>> => {
  const { id, ...payload } = data;
  const response = await axiosInstance.put(`/users/${id}`, payload);
  return response.data;
};

export const deleteEmployee = async (
  id: number
): Promise<ApiResponse<void>> => {
  const response = await axiosInstance.delete(`/users/${id}`);
  return response.data;
};

export const uploadProfileImage = async (
  id: number,
  file: File
): Promise<ApiResponse<{ profile_image: string }>> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axiosInstance.post(`/users/${id}/profile-image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export default {
  fetchEmployees,
  fetchEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  uploadProfileImage,
};
