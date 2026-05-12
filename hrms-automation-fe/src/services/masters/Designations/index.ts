import axiosInstance from 'configs/axio.config';
import type { ApiResponse } from '../../../types/api.types';

export interface Designation {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  department_id?: number | null;
  is_active: 'Y' | 'N';
  createdate?: string;
  updatedate?: string | null;
  department?: {
    id: number;
    name: string;
    code: string;
  } | null;
}

export interface ManageDesignationPayload {
  name: string;
  code: string;
  description?: string;
  department_id?: number;
  is_active?: 'Y' | 'N';
}

export interface UpdateDesignationPayload extends ManageDesignationPayload {
  id: number;
}

export interface GetDesignationsParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  isActive?: 'Y' | 'N';
  department_id?: number;
}

export interface DesignationDropdown {
  id: number;
  name: string;
  code: string;
}

export const designationsService = {
  async fetchDesignations(
    params?: GetDesignationsParams
  ): Promise<ApiResponse<Designation[]>> {
    const response = await axiosInstance.get('/designations', { params });
    return response.data;
  },

  async fetchDesignationById(id: number): Promise<ApiResponse<Designation>> {
    const response = await axiosInstance.get(`/designations/${id}`);
    return response.data;
  },

  async fetchDesignationsDropdown(): Promise<ApiResponse<DesignationDropdown[]>> {
    const response = await axiosInstance.get('/designations-dropdown');
    return response.data;
  },

  async createDesignation(
    payload: ManageDesignationPayload
  ): Promise<ApiResponse<Designation>> {
    const response = await axiosInstance.post('/designations', payload);
    return response.data;
  },

  async updateDesignation(
    payload: UpdateDesignationPayload
  ): Promise<ApiResponse<Designation>> {
    const { id, ...data } = payload;
    const response = await axiosInstance.put(`/designations/${id}`, data);
    return response.data;
  },

  async deleteDesignation(id: number): Promise<ApiResponse<null>> {
    const response = await axiosInstance.delete(`/designations/${id}`);
    return response.data;
  },
};

