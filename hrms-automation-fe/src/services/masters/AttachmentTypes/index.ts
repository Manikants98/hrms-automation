import axiosInstance from 'configs/axio.config';
import type { ApiResponse } from '../../../types/api.types';

export interface AttachmentType {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  is_active: 'Y' | 'N';
  createdate?: string;
  updatedate?: string | null;
}

export interface ManageAttachmentTypePayload {
  name: string;
  code: string;
  description?: string;
  is_active?: 'Y' | 'N';
}

export interface UpdateAttachmentTypePayload extends ManageAttachmentTypePayload {
  id: number;
}

export interface GetAttachmentTypesParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  isActive?: 'Y' | 'N';
}

export interface AttachmentTypeDropdown {
  description: string;
  id: number;
  name: string;
  code: string;
}

export const attachmentTypesService = {
  async fetchAttachmentTypes(
    params?: GetAttachmentTypesParams
  ): Promise<ApiResponse<AttachmentType[]>> {
    const response = await axiosInstance.get('/attachment-types', { params });
    return response.data;
  },

  async fetchAttachmentTypeById(id: number): Promise<ApiResponse<AttachmentType>> {
    const response = await axiosInstance.get(`/attachment-types/${id}`);
    return response.data;
  },

  async fetchAttachmentTypesDropdown(): Promise<ApiResponse<AttachmentTypeDropdown[]>> {
    const response = await axiosInstance.get('/attachment-types-dropdown');
    return response.data;
  },

  async createAttachmentType(
    payload: ManageAttachmentTypePayload
  ): Promise<ApiResponse<AttachmentType>> {
    const response = await axiosInstance.post('/attachment-types', payload);
    return response.data;
  },

  async updateAttachmentType(
    payload: UpdateAttachmentTypePayload
  ): Promise<ApiResponse<AttachmentType>> {
    const { id, ...data } = payload;
    const response = await axiosInstance.put(`/attachment-types/${id}`, data);
    return response.data;
  },

  async deleteAttachmentType(id: number): Promise<ApiResponse<null>> {
    const response = await axiosInstance.delete(`/attachment-types/${id}`);
    return response.data;
  },
};

