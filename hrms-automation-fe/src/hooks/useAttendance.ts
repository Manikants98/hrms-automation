import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import type { ApiResponse } from '../types/api.types';
import * as attendanceService from '../services/attendance';
import type {
  AttendanceStatus,
  AttendanceRecord,
  GetAttendanceParams,
  MarkAttendancePayload,
  UpdateAttendancePayload,
} from '../services/attendance';

export type {
  AttendanceStatus,
  AttendanceRecord,
  GetAttendanceParams,
  MarkAttendancePayload,
  UpdateAttendancePayload,
};

export const attendanceKeys = {
  all: ['attendance'] as const,
  lists: () => [...attendanceKeys.all, 'list'] as const,
  list: (params?: GetAttendanceParams) =>
    [...attendanceKeys.lists(), params] as const,
  details: () => [...attendanceKeys.all, 'detail'] as const,
  detail: (id: number) => [...attendanceKeys.details(), id] as const,
};

export const useAttendance = (
  params?: GetAttendanceParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<AttendanceRecord[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: attendanceKeys.list(params),
    queryFn: () => attendanceService.fetchAttendance(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useAttendanceRecord = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<AttendanceRecord>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: attendanceKeys.detail(id),
    queryFn: () => attendanceService.fetchAttendanceById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useMarkAttendance = (options?: {
  onSuccess?: (
    data: ApiResponse<AttendanceRecord>,
    variables: MarkAttendancePayload
  ) => void;
  onError?: (error: any, variables: MarkAttendancePayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: MarkAttendancePayload) =>
      attendanceService.markAttendance(payload),
    loadingMessage: 'Marking attendance...',
    invalidateQueries: ['attendance'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useUpdateAttendance = (options?: {
  onSuccess?: (
    data: ApiResponse<AttendanceRecord>,
    variables: UpdateAttendancePayload
  ) => void;
  onError?: (error: any, variables: UpdateAttendancePayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: UpdateAttendancePayload) =>
      attendanceService.updateAttendance(payload),
    loadingMessage: 'Updating attendance...',
    invalidateQueries: ['attendance'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useDeleteAttendance = (options?: {
  onSuccess?: (data: ApiResponse<void>, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  return useApiMutation({
    mutationFn: (id: number) => attendanceService.deleteAttendance(id),
    loadingMessage: 'Deleting attendance record...',
    invalidateQueries: ['attendance'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};
