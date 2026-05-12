import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import {
  designationsService,
  type Designation,
  type ManageDesignationPayload,
  type UpdateDesignationPayload,
  type GetDesignationsParams,
  type DesignationDropdown,
} from '../services/masters/Designations';
import type { ApiResponse } from '../types/api.types';

export type {
  Designation,
  ManageDesignationPayload,
  UpdateDesignationPayload,
  GetDesignationsParams,
  DesignationDropdown,
} from '../services/masters/Designations';

export const designationQueryKeys = {
  all: ['designations'] as const,
  lists: () => [...designationQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...designationQueryKeys.lists(), params] as const,
  details: () => [...designationQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...designationQueryKeys.details(), id] as const,
  dropdown: () => [...designationQueryKeys.all, 'dropdown'] as const,
};

export const useDesignations = (
  params?: GetDesignationsParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<Designation[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: designationQueryKeys.list(params),
    queryFn: () => designationsService.fetchDesignations(params),
    ...options,
  });
};

export const useDesignationById = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<Designation>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: designationQueryKeys.detail(id),
    queryFn: () => designationsService.fetchDesignationById(id),
    enabled: !!id,
    ...options,
  });
};

export const useDesignationsDropdown = (
  options?: Omit<
    UseQueryOptions<ApiResponse<DesignationDropdown[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: designationQueryKeys.dropdown(),
    queryFn: () => designationsService.fetchDesignationsDropdown(),
    ...options,
  });
};

export const useCreateDesignation = (options?: {
  onSuccess?: (
    data: ApiResponse<Designation>,
    variables: ManageDesignationPayload
  ) => void;
  onError?: (error: any, variables: ManageDesignationPayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: ManageDesignationPayload) =>
      designationsService.createDesignation(payload),
    loadingMessage: 'Creating designation...',
    invalidateQueries: [...designationQueryKeys.all],
    ...options,
  });
};

export const useUpdateDesignation = (options?: {
  onSuccess?: (
    data: ApiResponse<Designation>,
    variables: UpdateDesignationPayload
  ) => void;
  onError?: (error: any, variables: UpdateDesignationPayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: UpdateDesignationPayload) =>
      designationsService.updateDesignation(payload),
    loadingMessage: 'Updating designation...',
    invalidateQueries: [...designationQueryKeys.all],
    ...options,
  });
};

export const useDeleteDesignation = (options?: {
  onSuccess?: (data: ApiResponse<null>, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  return useApiMutation({
    mutationFn: (id: number) => designationsService.deleteDesignation(id),
    loadingMessage: 'Deleting designation...',
    invalidateQueries: [...designationQueryKeys.all],
    ...options,
  });
};
