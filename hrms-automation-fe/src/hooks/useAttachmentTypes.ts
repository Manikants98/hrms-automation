import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import {
  attachmentTypesService,
  type AttachmentType,
  type ManageAttachmentTypePayload,
  type UpdateAttachmentTypePayload,
  type GetAttachmentTypesParams,
  type AttachmentTypeDropdown,
} from '../services/masters/AttachmentTypes';
import type { ApiResponse } from '../types/api.types';

export type {
  AttachmentType,
  ManageAttachmentTypePayload,
  UpdateAttachmentTypePayload,
  GetAttachmentTypesParams,
  AttachmentTypeDropdown,
} from '../services/masters/AttachmentTypes';

export const attachmentTypeQueryKeys = {
  all: ['attachmentTypes'] as const,
  lists: () => [...attachmentTypeQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...attachmentTypeQueryKeys.lists(), params] as const,
  details: () => [...attachmentTypeQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...attachmentTypeQueryKeys.details(), id] as const,
  dropdown: () => [...attachmentTypeQueryKeys.all, 'dropdown'] as const,
};

export const useAttachmentTypes = (
  params?: GetAttachmentTypesParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<AttachmentType[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: attachmentTypeQueryKeys.list(params),
    queryFn: () => attachmentTypesService.fetchAttachmentTypes(params),
    ...options,
  });
};

export const useAttachmentTypeById = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<AttachmentType>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: attachmentTypeQueryKeys.detail(id),
    queryFn: () => attachmentTypesService.fetchAttachmentTypeById(id),
    enabled: !!id,
    ...options,
  });
};

export const useAttachmentTypesDropdown = (
  options?: Omit<
    UseQueryOptions<ApiResponse<AttachmentTypeDropdown[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: attachmentTypeQueryKeys.dropdown(),
    queryFn: () => attachmentTypesService.fetchAttachmentTypesDropdown(),
    ...options,
  });
};

export const useCreateAttachmentType = (options?: {
  onSuccess?: (
    data: ApiResponse<AttachmentType>,
    variables: ManageAttachmentTypePayload
  ) => void;
  onError?: (error: any, variables: ManageAttachmentTypePayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: ManageAttachmentTypePayload) =>
      attachmentTypesService.createAttachmentType(payload),
    loadingMessage: 'Creating attachment type...',
    invalidateQueries: [...attachmentTypeQueryKeys.all],
    ...options,
  });
};

export const useUpdateAttachmentType = (options?: {
  onSuccess?: (
    data: ApiResponse<AttachmentType>,
    variables: UpdateAttachmentTypePayload
  ) => void;
  onError?: (error: any, variables: UpdateAttachmentTypePayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: UpdateAttachmentTypePayload) =>
      attachmentTypesService.updateAttachmentType(payload),
    loadingMessage: 'Updating attachment type...',
    invalidateQueries: [...attachmentTypeQueryKeys.all],
    ...options,
  });
};

export const useDeleteAttachmentType = (options?: {
  onSuccess?: (data: ApiResponse<null>, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  return useApiMutation({
    mutationFn: (id: number) => attachmentTypesService.deleteAttachmentType(id),
    loadingMessage: 'Deleting attachment type...',
    invalidateQueries: [...attachmentTypeQueryKeys.all],
    ...options,
  });
};
