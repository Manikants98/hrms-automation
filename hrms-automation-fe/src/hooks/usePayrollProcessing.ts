import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import type { ApiResponse } from '../types/api.types';
import payrollProcessingService, {
  type PayrollProcessing,
  type GetPayrollProcessingParams,
  type ManagePayrollProcessingPayload,
  type UpdatePayrollProcessingPayload,
  type ProcessPayrollPayload,
  type PayPayrollPayload,
} from '../services/payrollProcessing';

// Re-export types and utilities from service
export type {
  PayrollProcessing,
  PayrollStatus,
  GetPayrollProcessingParams,
  ManagePayrollProcessingPayload,
  UpdatePayrollProcessingPayload,
  ProcessPayrollPayload,
  PayPayrollPayload,
  PayrollProcessingItem,
} from '../services/payrollProcessing';
export { calculateLeaveDeduction } from '../services/payrollProcessing';

export const payrollProcessingKeys = {
  all: ['payrollProcessing'] as const,
  lists: () => [...payrollProcessingKeys.all, 'list'] as const,
  list: (params?: GetPayrollProcessingParams) =>
    [...payrollProcessingKeys.lists(), params] as const,
  details: () => [...payrollProcessingKeys.all, 'detail'] as const,
  detail: (id: number) => [...payrollProcessingKeys.details(), id] as const,
};

export const usePayrollProcessing = (
  params?: GetPayrollProcessingParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<PayrollProcessing[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: payrollProcessingKeys.list(params),
    queryFn: () => payrollProcessingService.fetchPayrollProcessing(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const usePayrollProcessingItem = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<PayrollProcessing>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: payrollProcessingKeys.detail(id),
    queryFn: () => payrollProcessingService.fetchPayrollProcessingById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// Export alias for backward compatibility
export const usePayrollProcessingById = usePayrollProcessingItem;

export const useCreatePayrollProcessing = (options?: {
  onSuccess?: (
    data: ApiResponse<PayrollProcessing>,
    variables: ManagePayrollProcessingPayload
  ) => void;
  onError?: (error: any, variables: ManagePayrollProcessingPayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: ManagePayrollProcessingPayload) =>
      payrollProcessingService.createPayrollProcessing(payload),
    loadingMessage: 'Creating payroll processing...',
    invalidateQueries: ['payrollProcessing'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useUpdatePayrollProcessing = (options?: {
  onSuccess?: (
    data: ApiResponse<PayrollProcessing>,
    variables: UpdatePayrollProcessingPayload
  ) => void;
  onError?: (error: any, variables: UpdatePayrollProcessingPayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: UpdatePayrollProcessingPayload) =>
      payrollProcessingService.updatePayrollProcessing(payload),
    loadingMessage: 'Updating payroll processing...',
    invalidateQueries: ['payrollProcessing'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useDeletePayrollProcessing = (options?: {
  onSuccess?: (data: ApiResponse<void>, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  return useApiMutation({
    mutationFn: (id: number) =>
      payrollProcessingService.deletePayrollProcessing(id),
    loadingMessage: 'Deleting payroll processing...',
    invalidateQueries: ['payrollProcessing'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useProcessPayroll = (options?: {
  onSuccess?: (
    data: ApiResponse<PayrollProcessing>,
    variables: ProcessPayrollPayload
  ) => void;
  onError?: (error: any, variables: ProcessPayrollPayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: ProcessPayrollPayload) =>
      payrollProcessingService.processPayroll(payload),
    loadingMessage: 'Processing payroll...',
    invalidateQueries: ['payrollProcessing'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const usePayPayroll = (options?: {
  onSuccess?: (
    data: ApiResponse<PayrollProcessing>,
    variables: PayPayrollPayload
  ) => void;
  onError?: (error: any, variables: PayPayrollPayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: PayPayrollPayload) =>
      payrollProcessingService.payPayroll(payload),
    loadingMessage: 'Paying payroll...',
    invalidateQueries: ['payrollProcessing'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};
