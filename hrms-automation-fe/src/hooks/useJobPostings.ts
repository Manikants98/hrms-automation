import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import type { ApiResponse } from '../types/api.types';
import jobPostingsService, { 
  type JobPosting, 
  type GetJobPostingsParams, 
  type ManageJobPostingPayload,
  type UpdateJobPostingPayload
} from '../services/jobPostings';

export type { 
  JobPosting, 
  GetJobPostingsParams, 
  ManageJobPostingPayload,
  UpdateJobPostingPayload
} from '../services/jobPostings';

export const jobPostingKeys = {
  all: ['jobPostings'] as const,
  lists: () => [...jobPostingKeys.all, 'list'] as const,
  list: (params?: GetJobPostingsParams) =>
    [...jobPostingKeys.lists(), params] as const,
  details: () => [...jobPostingKeys.all, 'detail'] as const,
  detail: (id: number) => [...jobPostingKeys.details(), id] as const,
};

export const useJobPostings = (
  params?: GetJobPostingsParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<JobPosting[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: jobPostingKeys.list(params),
    queryFn: () => jobPostingsService.fetchJobPostings(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useJobPosting = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<JobPosting>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: jobPostingKeys.detail(id),
    queryFn: () => jobPostingsService.fetchJobPostingById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateJobPosting = (options?: {
  onSuccess?: (
    data: ApiResponse<JobPosting>,
    variables: ManageJobPostingPayload
  ) => void;
  onError?: (error: any, variables: ManageJobPostingPayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: ManageJobPostingPayload) => jobPostingsService.createJobPosting(payload),
    loadingMessage: 'Creating job posting...',
    invalidateQueries: ['jobPostings'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useUpdateJobPosting = (options?: {
  onSuccess?: (
    data: ApiResponse<JobPosting>,
    variables: UpdateJobPostingPayload
  ) => void;
  onError?: (error: any, variables: UpdateJobPostingPayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: UpdateJobPostingPayload) => jobPostingsService.updateJobPosting(payload),
    loadingMessage: 'Updating job posting...',
    invalidateQueries: ['jobPostings'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useDeleteJobPosting = (options?: {
  onSuccess?: (data: ApiResponse<void>, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  return useApiMutation({
    mutationFn: (id: number) => jobPostingsService.deleteJobPosting(id),
    loadingMessage: 'Deleting job posting...',
    invalidateQueries: ['jobPostings'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};
