import axiosInstance from 'configs/axio.config';
import type { ApiResponse } from '../../../types/api.types';

export interface Shift {
  id: number;
  name: string;
  code: string;
  start_time: string;
  end_time: string;
  break_duration?: number | null;
  description?: string | null;
  is_active: 'Y' | 'N';
  createdate?: string;
  updatedate?: string | null;
}

export interface ManageShiftPayload {
  name: string;
  code: string;
  start_time: string;
  end_time: string;
  break_duration?: number;
  description?: string;
  is_active?: 'Y' | 'N';
}

export interface UpdateShiftPayload extends ManageShiftPayload {
  id: number;
}

export interface GetShiftsParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  isActive?: 'Y' | 'N';
}

export interface ShiftDropdown {
  id: number;
  name: string;
  code: string;
  start_time: string;
  end_time: string;
}

export const shiftsService = {
  async fetchShifts(params?: GetShiftsParams): Promise<ApiResponse<Shift[]>> {
    const response = await axiosInstance.get('/shifts', { params });
    return response.data;
  },

  async fetchShiftById(id: number): Promise<ApiResponse<Shift>> {
    const response = await axiosInstance.get(`/shifts/${id}`);
    return response.data;
  },

  async fetchShiftsDropdown(): Promise<ApiResponse<ShiftDropdown[]>> {
    const response = await axiosInstance.get('/shifts-dropdown');
    return response.data;
  },

  async createShift(payload: ManageShiftPayload): Promise<ApiResponse<Shift>> {
    const response = await axiosInstance.post('/shifts', payload);
    return response.data;
  },

  async updateShift(payload: UpdateShiftPayload): Promise<ApiResponse<Shift>> {
    const { id, ...data } = payload;
    const response = await axiosInstance.put(`/shifts/${id}`, data);
    return response.data;
  },

  async deleteShift(id: number): Promise<ApiResponse<null>> {
    const response = await axiosInstance.delete(`/shifts/${id}`);
    return response.data;
  },
};
