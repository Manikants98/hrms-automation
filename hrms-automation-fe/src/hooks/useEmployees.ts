import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import type { ApiResponse } from '../types/api.types';
import employeesService, { 
  type Employee, 
  type GetEmployeesParams, 
  type ManageEmployeePayload, 
  type UpdateEmployeePayload 
} from '../services/employees';

// Re-export types from service
export type { 
  Employee, 
  GetEmployeesParams, 
  ManageEmployeePayload, 
  UpdateEmployeePayload 
} from '../services/employees';

export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (params?: GetEmployeesParams) =>
    [...employeeKeys.lists(), params] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: number) => [...employeeKeys.details(), id] as const,
};

export const useEmployees = (
  params?: GetEmployeesParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<Employee[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: () => employeesService.fetchEmployees(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useEmployee = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<Employee>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => employeesService.fetchEmployeeById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateEmployee = (options?: {
  onSuccess?: (
    data: ApiResponse<Employee>,
    variables: ManageEmployeePayload
  ) => void;
  onError?: (error: any, variables: ManageEmployeePayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: ManageEmployeePayload) =>
      employeesService.createEmployee(payload),
    loadingMessage: 'Creating employee...',
    invalidateQueries: ['employees'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useUpdateEmployee = (options?: {
  onSuccess?: (
    data: ApiResponse<Employee>,
    variables: UpdateEmployeePayload
  ) => void;
  onError?: (error: any, variables: UpdateEmployeePayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: UpdateEmployeePayload) =>
      employeesService.updateEmployee(payload),
    loadingMessage: 'Updating employee...',
    invalidateQueries: ['employees'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useDeleteEmployee = (options?: {
  onSuccess?: (data: ApiResponse<void>, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  return useApiMutation({
    mutationFn: (id: number) => employeesService.deleteEmployee(id),
    loadingMessage: 'Deleting employee...',
    invalidateQueries: ['employees'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};
