import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import {
  shiftsService,
  type Shift,
  type ManageShiftPayload,
  type UpdateShiftPayload,
  type GetShiftsParams,
  type ShiftDropdown,
} from '../services/masters/Shifts';
import type { ApiResponse } from '../types/api.types';

export type {
  Shift,
  ManageShiftPayload,
  UpdateShiftPayload,
  GetShiftsParams,
  ShiftDropdown,
} from '../services/masters/Shifts';

export const shiftQueryKeys = {
  all: ['shifts'] as const,
  lists: () => [...shiftQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...shiftQueryKeys.lists(), params] as const,
  details: () => [...shiftQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...shiftQueryKeys.details(), id] as const,
  dropdown: () => [...shiftQueryKeys.all, 'dropdown'] as const,
};

export const useShifts = (
  params?: GetShiftsParams,
  options?: Omit<UseQueryOptions<ApiResponse<Shift[]>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: shiftQueryKeys.list(params),
    queryFn: () => shiftsService.fetchShifts(params),
    ...options,
  });
};

export const useShiftById = (
  id: number,
  options?: Omit<UseQueryOptions<ApiResponse<Shift>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: shiftQueryKeys.detail(id),
    queryFn: () => shiftsService.fetchShiftById(id),
    enabled: !!id,
    ...options,
  });
};

export const useShiftsDropdown = (
  options?: Omit<
    UseQueryOptions<ApiResponse<ShiftDropdown[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: shiftQueryKeys.dropdown(),
    queryFn: () => shiftsService.fetchShiftsDropdown(),
    ...options,
  });
};

export const useCreateShift = (options?: {
  onSuccess?: (data: ApiResponse<Shift>, variables: ManageShiftPayload) => void;
  onError?: (error: any, variables: ManageShiftPayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: ManageShiftPayload) =>
      shiftsService.createShift(payload),
    loadingMessage: 'Creating shift...',
    invalidateQueries: [...shiftQueryKeys.all],
    ...options,
  });
};

export const useUpdateShift = (options?: {
  onSuccess?: (data: ApiResponse<Shift>, variables: UpdateShiftPayload) => void;
  onError?: (error: any, variables: UpdateShiftPayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: UpdateShiftPayload) =>
      shiftsService.updateShift(payload),
    loadingMessage: 'Updating shift...',
    invalidateQueries: [...shiftQueryKeys.all],
    ...options,
  });
};

export const useDeleteShift = (options?: {
  onSuccess?: (data: ApiResponse<null>, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  return useApiMutation({
    mutationFn: (id: number) => shiftsService.deleteShift(id),
    loadingMessage: 'Deleting shift...',
    invalidateQueries: [...shiftQueryKeys.all],
    ...options,
  });
};
