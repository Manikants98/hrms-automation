import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import type { ApiResponse } from '../types/api.types';
import salarySlipsService, { 
  type SalarySlip, 
  type GetSalarySlipsParams, 
  type ManageSalarySlipPayload, 
  type UpdateSalarySlipPayload 
} from '../services/salarySlips';

// Re-export types from service
export type { 
  SalarySlip, 
  GetSalarySlipsParams, 
  ManageSalarySlipPayload, 
  UpdateSalarySlipPayload 
} from '../services/salarySlips';

export const salarySlipKeys = {
  all: ['salarySlips'] as const,
  lists: () => [...salarySlipKeys.all, 'list'] as const,
  list: (params?: GetSalarySlipsParams) =>
    [...salarySlipKeys.lists(), params] as const,
  details: () => [...salarySlipKeys.all, 'detail'] as const,
  detail: (id: number) => [...salarySlipKeys.details(), id] as const,
};

export const useSalarySlips = (
  params?: GetSalarySlipsParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<SalarySlip[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: salarySlipKeys.list(params),
    queryFn: () => salarySlipsService.fetchSalarySlips(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useSalarySlip = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<SalarySlip>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: salarySlipKeys.detail(id),
    queryFn: () => salarySlipsService.fetchSalarySlipById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// Export alias for backward compatibility
export const useSalarySlipById = useSalarySlip;

export const useCreateSalarySlip = (options?: {
  onSuccess?: (
    data: ApiResponse<SalarySlip>,
    variables: ManageSalarySlipPayload
  ) => void;
  onError?: (error: any, variables: ManageSalarySlipPayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: ManageSalarySlipPayload) =>
      salarySlipsService.createSalarySlip(payload),
    loadingMessage: 'Creating salary slip...',
    invalidateQueries: ['salarySlips'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useUpdateSalarySlip = (options?: {
  onSuccess?: (
    data: ApiResponse<SalarySlip>,
    variables: UpdateSalarySlipPayload
  ) => void;
  onError?: (error: any, variables: UpdateSalarySlipPayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: UpdateSalarySlipPayload) =>
      salarySlipsService.updateSalarySlip(payload),
    loadingMessage: 'Updating salary slip...',
    invalidateQueries: ['salarySlips'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useDeleteSalarySlip = (options?: {
  onSuccess?: (data: ApiResponse<void>, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  return useApiMutation({
    mutationFn: (id: number) => salarySlipsService.deleteSalarySlip(id),
    loadingMessage: 'Deleting salary slip...',
    invalidateQueries: ['salarySlips'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};
