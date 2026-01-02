import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import type { ApiResponse } from '../types/api.types';
import leaveBalancesService, {
  type LeaveBalance,
  type GetLeaveBalancesParams,
  type ManageLeaveBalancePayload,
  type UpdateLeaveBalancePayload,
} from '../services/leaveBalances';

// Re-export types from service
export type {
  LeaveBalance,
  GetLeaveBalancesParams,
  ManageLeaveBalancePayload,
  UpdateLeaveBalancePayload,
  LeaveBalanceItem,
  LeaveBalanceStatus,
  LeaveType,
} from '../services/leaveBalances';

export const leaveBalanceKeys = {
  all: ['leaveBalances'] as const,
  lists: () => [...leaveBalanceKeys.all, 'list'] as const,
  list: (params?: GetLeaveBalancesParams) =>
    [...leaveBalanceKeys.lists(), params] as const,
  details: () => [...leaveBalanceKeys.all, 'detail'] as const,
  detail: (id: number) => [...leaveBalanceKeys.details(), id] as const,
};

export const useLeaveBalances = (
  params?: GetLeaveBalancesParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<LeaveBalance[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: leaveBalanceKeys.list(params),
    queryFn: () => leaveBalancesService.fetchLeaveBalances(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useLeaveBalance = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<LeaveBalance>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: leaveBalanceKeys.detail(id),
    queryFn: () => leaveBalancesService.fetchLeaveBalanceById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateLeaveBalance = (options?: {
  onSuccess?: (
    data: ApiResponse<LeaveBalance>,
    variables: ManageLeaveBalancePayload
  ) => void;
  onError?: (error: any, variables: ManageLeaveBalancePayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: ManageLeaveBalancePayload) =>
      leaveBalancesService.createLeaveBalance(payload),
    loadingMessage: 'Creating leave balance...',
    invalidateQueries: ['leaveBalances'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useUpdateLeaveBalance = (options?: {
  onSuccess?: (
    data: ApiResponse<LeaveBalance>,
    variables: UpdateLeaveBalancePayload
  ) => void;
  onError?: (error: any, variables: UpdateLeaveBalancePayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: UpdateLeaveBalancePayload) =>
      leaveBalancesService.updateLeaveBalance(payload),
    loadingMessage: 'Updating leave balance...',
    invalidateQueries: ['leaveBalances'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useDeleteLeaveBalance = (options?: {
  onSuccess?: (data: ApiResponse<void>, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  return useApiMutation({
    mutationFn: (id: number) => leaveBalancesService.deleteLeaveBalance(id),
    loadingMessage: 'Deleting leave balance...',
    invalidateQueries: ['leaveBalances'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};
