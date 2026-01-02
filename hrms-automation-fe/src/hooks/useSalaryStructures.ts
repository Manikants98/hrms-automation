import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import type { ApiResponse } from '../types/api.types';
import salaryStructuresService, { 
  type SalaryStructure, 
  type GetSalaryStructuresParams, 
  type ManageSalaryStructurePayload, 
  type UpdateSalaryStructurePayload,
  defaultStructureTypes 
} from '../services/salaryStructures';

// Re-export types from service
export type { 
  SalaryStructure, 
  GetSalaryStructuresParams, 
  ManageSalaryStructurePayload, 
  UpdateSalaryStructurePayload,
  SalaryStructureItem,
  SalaryStructureType,
  SalaryStructureCategory,
  SalaryStructureStatus 
} from '../services/salaryStructures';

export { defaultStructureTypes };

export const salaryStructureKeys = {
  all: ['salaryStructures'] as const,
  lists: () => [...salaryStructureKeys.all, 'list'] as const,
  list: (params?: GetSalaryStructuresParams) =>
    [...salaryStructureKeys.lists(), params] as const,
  details: () => [...salaryStructureKeys.all, 'detail'] as const,
  detail: (id: number) => [...salaryStructureKeys.details(), id] as const,
};

export const useSalaryStructures = (
  params?: GetSalaryStructuresParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<SalaryStructure[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: salaryStructureKeys.list(params),
    queryFn: () => salaryStructuresService.fetchSalaryStructures(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useSalaryStructure = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<SalaryStructure>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: salaryStructureKeys.detail(id),
    queryFn: () => salaryStructuresService.fetchSalaryStructureById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateSalaryStructure = (options?: {
  onSuccess?: (
    data: ApiResponse<SalaryStructure>,
    variables: ManageSalaryStructurePayload
  ) => void;
  onError?: (error: any, variables: ManageSalaryStructurePayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: ManageSalaryStructurePayload) =>
      salaryStructuresService.createSalaryStructure(payload),
    loadingMessage: 'Creating salary structure...',
    invalidateQueries: ['salaryStructures'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useUpdateSalaryStructure = (options?: {
  onSuccess?: (
    data: ApiResponse<SalaryStructure>,
    variables: UpdateSalaryStructurePayload
  ) => void;
  onError?: (error: any, variables: UpdateSalaryStructurePayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: UpdateSalaryStructurePayload) =>
      salaryStructuresService.updateSalaryStructure(payload),
    loadingMessage: 'Updating salary structure...',
    invalidateQueries: ['salaryStructures'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useDeleteSalaryStructure = (options?: {
  onSuccess?: (data: ApiResponse<void>, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  return useApiMutation({
    mutationFn: (id: number) => salaryStructuresService.deleteSalaryStructure(id),
    loadingMessage: 'Deleting salary structure...',
    invalidateQueries: ['salaryStructures'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};
