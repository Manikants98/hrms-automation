import axiosInstance from '../../configs/axio.config';
import type { ApiResponse } from '../../types/api.types';

export interface HiringStage {
  id: number;
  name: string;
  code: string;
  description?: string;
  sequence_order: number;
  createdate?: string;
  updatedate?: string;
  is_active: 'Y' | 'N';
}

export interface GetHiringStagesParams {
  search?: string;
  page?: number;
  limit?: number;
  isActive?: 'Y' | 'N';
}

export interface ManageHiringStagePayload {
  name: string;
  code: string;
  description?: string;
  sequence_order: number;
  is_active: 'Y' | 'N';
}

export interface UpdateHiringStagePayload extends ManageHiringStagePayload {
  id: number;
}

export const fetchHiringStages = async (
  params?: GetHiringStagesParams
): Promise<ApiResponse<HiringStage[]>> => {
  const response = await axiosInstance.get('/hiring-stages', { params });
  return response.data;
};

export const fetchHiringStageById = async (
  id: number
): Promise<ApiResponse<HiringStage>> => {
  const response = await axiosInstance.get(`/hiring-stages/${id}`);
  return response.data;
};

export const createHiringStage = async (
  data: ManageHiringStagePayload
): Promise<ApiResponse<HiringStage>> => {
  const response = await axiosInstance.post('/hiring-stages', data);
  return response.data;
};

export const updateHiringStage = async (
  data: UpdateHiringStagePayload
): Promise<ApiResponse<HiringStage>> => {
  const { id, ...payload } = data;
  const response = await axiosInstance.put(`/hiring-stages/${id}`, payload);
  return response.data;
};

export const deleteHiringStage = async (
  id: number
): Promise<ApiResponse<void>> => {
  const response = await axiosInstance.delete(`/hiring-stages/${id}`);
  return response.data;
};

export default {
  fetchHiringStages,
  fetchHiringStageById,
  createHiringStage,
  updateHiringStage,
  deleteHiringStage,
};
