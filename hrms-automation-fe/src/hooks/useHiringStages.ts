import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import type { ApiResponse } from '../types/api.types';
import hiringStagesService, { 
  type HiringStage, 
  type GetHiringStagesParams, 
  type ManageHiringStagePayload, 
  type UpdateHiringStagePayload 
} from '../services/hiringStages';

// Re-export types from service
export type { 
  HiringStage, 
  GetHiringStagesParams, 
  ManageHiringStagePayload, 
  UpdateHiringStagePayload 
} from '../services/hiringStages';

export const hiringStageKeys = {
  all: ['hiringStages'] as const,
  lists: () => [...hiringStageKeys.all, 'list'] as const,
  list: (params?: GetHiringStagesParams) =>
    [...hiringStageKeys.lists(), params] as const,
  details: () => [...hiringStageKeys.all, 'detail'] as const,
  detail: (id: number) => [...hiringStageKeys.details(), id] as const,
};

export const useHiringStages = (
  params?: GetHiringStagesParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<HiringStage[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: hiringStageKeys.list(params),
    queryFn: () => hiringStagesService.fetchHiringStages(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useHiringStage = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<HiringStage>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: hiringStageKeys.detail(id),
    queryFn: () => hiringStagesService.fetchHiringStageById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateHiringStage = (options?: {
  onSuccess?: (
    data: ApiResponse<HiringStage>,
    variables: ManageHiringStagePayload
  ) => void;
  onError?: (error: any, variables: ManageHiringStagePayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: ManageHiringStagePayload) =>
      hiringStagesService.createHiringStage(payload),
    loadingMessage: 'Creating hiring stage...',
    invalidateQueries: ['hiringStages'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useUpdateHiringStage = (options?: {
  onSuccess?: (
    data: ApiResponse<HiringStage>,
    variables: UpdateHiringStagePayload
  ) => void;
  onError?: (error: any, variables: UpdateHiringStagePayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: UpdateHiringStagePayload) =>
      hiringStagesService.updateHiringStage(payload),
    loadingMessage: 'Updating hiring stage...',
    invalidateQueries: ['hiringStages'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useDeleteHiringStage = (options?: {
  onSuccess?: (data: ApiResponse<void>, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  return useApiMutation({
    mutationFn: (id: number) => hiringStagesService.deleteHiringStage(id),
    loadingMessage: 'Deleting hiring stage...',
    invalidateQueries: ['hiringStages'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};
