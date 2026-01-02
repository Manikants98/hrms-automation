import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import type { ApiResponse } from '../types/api.types';
import type { 
  LeaveApplication, 
  GetLeaveApplicationsParams, 
  CreateLeaveApplicationPayload,
  UpdateLeaveApplicationPayload,
  ApproveLeaveApplicationPayload,
  RejectLeaveApplicationPayload
} from '../services/leaveApplications';
import leaveApplicationsService from '../services/leaveApplications';

// Re-export types from service for other modules
export type { 
  LeaveApplication, 
  GetLeaveApplicationsParams, 
  CreateLeaveApplicationPayload,
  UpdateLeaveApplicationPayload,
  ApproveLeaveApplicationPayload,
  RejectLeaveApplicationPayload,
  ManageLeaveApplicationPayload,
  LeaveType,
  ApprovalStatus
} from '../services/leaveApplications';

export const leaveApplicationKeys = {
  all: ['leaveApplications'] as const,
  lists: () => [...leaveApplicationKeys.all, 'list'] as const,
  list: (params?: GetLeaveApplicationsParams) =>
    [...leaveApplicationKeys.lists(), params] as const,
  details: () => [...leaveApplicationKeys.all, 'detail'] as const,
  detail: (id: number) => [...leaveApplicationKeys.details(), id] as const,
};

export const useLeaveApplications = (
  params?: GetLeaveApplicationsParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<LeaveApplication[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: leaveApplicationKeys.list(params),
    queryFn: () => leaveApplicationsService.fetchLeaveApplications(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useLeaveApplication = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<LeaveApplication>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: leaveApplicationKeys.detail(id),
    queryFn: () => leaveApplicationsService.fetchLeaveApplicationById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateLeaveApplication = (options?: {
  onSuccess?: (
    data: ApiResponse<LeaveApplication>,
    variables: CreateLeaveApplicationPayload
  ) => void;
  onError?: (error: any, variables: CreateLeaveApplicationPayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: CreateLeaveApplicationPayload) =>
      leaveApplicationsService.createLeaveApplication(payload),
    loadingMessage: 'Creating leave application...',
    invalidateQueries: ['leaveApplications'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useUpdateLeaveApplication = (options?: {
  onSuccess?: (
    data: ApiResponse<LeaveApplication>,
    variables: UpdateLeaveApplicationPayload
  ) => void;
  onError?: (error: any, variables: UpdateLeaveApplicationPayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: UpdateLeaveApplicationPayload & { id: number }) => {
      const { id, ...data } = payload;
      return leaveApplicationsService.updateLeaveApplication(id, data);
    },
    loadingMessage: 'Updating leave application...',
    invalidateQueries: ['leaveApplications'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useDeleteLeaveApplication = (options?: {
  onSuccess?: (data: ApiResponse<void>, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  return useApiMutation({
    mutationFn: (id: number) => leaveApplicationsService.deleteLeaveApplication(id),
    loadingMessage: 'Deleting leave application...',
    invalidateQueries: ['leaveApplications'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useApproveLeaveApplication = (options?: {
  onSuccess?: (
    data: ApiResponse<LeaveApplication>,
    variables: ApproveLeaveApplicationPayload
  ) => void;
  onError?: (error: any, variables: ApproveLeaveApplicationPayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: ApproveLeaveApplicationPayload & { approval_status: 'Approved' }) =>
      leaveApplicationsService.approveLeaveApplication(payload),
    loadingMessage: 'Approving leave application...',
    invalidateQueries: ['leaveApplications'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useRejectLeaveApplication = (options?: {
  onSuccess?: (
    data: ApiResponse<LeaveApplication>,
    variables: RejectLeaveApplicationPayload
  ) => void;
  onError?: (error: any, variables: RejectLeaveApplicationPayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: RejectLeaveApplicationPayload & { id: number }) =>
      leaveApplicationsService.rejectLeaveApplication(payload),
    loadingMessage: 'Rejecting leave application...',
    invalidateQueries: ['leaveApplications'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};
