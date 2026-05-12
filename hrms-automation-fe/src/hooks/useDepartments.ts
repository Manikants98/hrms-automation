import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import {
  departmentsService,
  type Department,
  type ManageDepartmentPayload,
  type UpdateDepartmentPayload,
  type GetDepartmentsParams,
  type DepartmentDropdown,
} from '../services/masters/Departments';
import type { ApiResponse } from '../types/api.types';

export type {
  Department,
  ManageDepartmentPayload,
  UpdateDepartmentPayload,
  GetDepartmentsParams,
  DepartmentDropdown,
} from '../services/masters/Departments';

export const departmentQueryKeys = {
  all: ['departments'] as const,
  lists: () => [...departmentQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...departmentQueryKeys.lists(), params] as const,
  details: () => [...departmentQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...departmentQueryKeys.details(), id] as const,
  dropdown: () => [...departmentQueryKeys.all, 'dropdown'] as const,
};

export const useDepartments = (
  params?: GetDepartmentsParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<Department[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: departmentQueryKeys.list(params),
    queryFn: () => departmentsService.fetchDepartments(params),
    ...options,
  });
};

export const useDepartmentById = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<Department>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: departmentQueryKeys.detail(id),
    queryFn: () => departmentsService.fetchDepartmentById(id),
    enabled: !!id,
    ...options,
  });
};

export const useDepartmentsDropdown = (
  options?: Omit<
    UseQueryOptions<ApiResponse<DepartmentDropdown[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: departmentQueryKeys.dropdown(),
    queryFn: () => departmentsService.fetchDepartmentsDropdown(),
    ...options,
  });
};

export const useCreateDepartment = (options?: {
  onSuccess?: (
    data: ApiResponse<Department>,
    variables: ManageDepartmentPayload
  ) => void;
  onError?: (error: any, variables: ManageDepartmentPayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: ManageDepartmentPayload) =>
      departmentsService.createDepartment(payload),
    loadingMessage: 'Creating department...',
    invalidateQueries: [...departmentQueryKeys.all],
    ...options,
  });
};

export const useUpdateDepartment = (options?: {
  onSuccess?: (
    data: ApiResponse<Department>,
    variables: UpdateDepartmentPayload
  ) => void;
  onError?: (error: any, variables: UpdateDepartmentPayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: UpdateDepartmentPayload) =>
      departmentsService.updateDepartment(payload),
    loadingMessage: 'Updating department...',
    invalidateQueries: [...departmentQueryKeys.all],
    ...options,
  });
};

export const useDeleteDepartment = (options?: {
  onSuccess?: (data: ApiResponse<null>, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  return useApiMutation({
    mutationFn: (id: number) => departmentsService.deleteDepartment(id),
    loadingMessage: 'Deleting department...',
    invalidateQueries: [...departmentQueryKeys.all],
    ...options,
  });
};
