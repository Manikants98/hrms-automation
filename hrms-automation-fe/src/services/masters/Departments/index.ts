import axiosInstance from 'configs/axio.config';
import type { ApiResponse } from '../../../types/api.types';

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  parent_id?: number | null;
  manager_id?: number | null;
  is_active: 'Y' | 'N';
  createdate?: string;
  updatedate?: string | null;
  manager?: {
    id: number;
    name: string;
    email: string;
  } | null;
  parent_department?: {
    id: number;
    name: string;
    code: string;
  } | null;
}

export interface ManageDepartmentPayload {
  name: string;
  code: string;
  description?: string;
  parent_id?: number;
  manager_id?: number;
  is_active?: 'Y' | 'N';
}

export interface UpdateDepartmentPayload extends ManageDepartmentPayload {
  id: number;
}

export interface GetDepartmentsParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  isActive?: 'Y' | 'N';
  parent_id?: number;
  manager_id?: number;
}

export interface DepartmentDropdown {
  id: number;
  name: string;
  code: string;
}

export const departmentsService = {
  async fetchDepartments(
    params?: GetDepartmentsParams
  ): Promise<ApiResponse<Department[]>> {
    const response = await axiosInstance.get('/departments', { params });
    return response.data;
  },

  async fetchDepartmentById(id: number): Promise<ApiResponse<Department>> {
    const response = await axiosInstance.get(`/departments/${id}`);
    return response.data;
  },

  async fetchDepartmentsDropdown(): Promise<ApiResponse<DepartmentDropdown[]>> {
    const response = await axiosInstance.get('/departments-dropdown');
    return response.data;
  },

  async createDepartment(
    payload: ManageDepartmentPayload
  ): Promise<ApiResponse<Department>> {
    const response = await axiosInstance.post('/departments', payload);
    return response.data;
  },

  async updateDepartment(
    payload: UpdateDepartmentPayload
  ): Promise<ApiResponse<Department>> {
    const { id, ...data } = payload;
    const response = await axiosInstance.put(`/departments/${id}`, data);
    return response.data;
  },

  async deleteDepartment(id: number): Promise<ApiResponse<null>> {
    const response = await axiosInstance.delete(`/departments/${id}`);
    return response.data;
  },
};

