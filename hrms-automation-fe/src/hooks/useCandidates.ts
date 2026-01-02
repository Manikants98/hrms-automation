import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import type { ApiResponse } from '../types/api.types';
import candidatesService, {
  type Candidate,
  type GetCandidatesParams,
  type ManageCandidatePayload,
  type UpdateCandidatePayload,
} from '../services/candidates';

export type {
  Candidate,
  GetCandidatesParams,
  ManageCandidatePayload,
  UpdateCandidatePayload,
} from '../services/candidates';

export const candidateKeys = {
  all: ['candidates'] as const,
  lists: () => [...candidateKeys.all, 'list'] as const,
  list: (params?: GetCandidatesParams) =>
    [...candidateKeys.lists(), params] as const,
  details: () => [...candidateKeys.all, 'detail'] as const,
  detail: (id: number) => [...candidateKeys.details(), id] as const,
};

export const useCandidates = (
  params?: GetCandidatesParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<Candidate[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: candidateKeys.list(params),
    queryFn: () => candidatesService.fetchCandidates(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCandidate = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<Candidate>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: candidateKeys.detail(id),
    queryFn: () => candidatesService.fetchCandidateById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateCandidate = (options?: {
  onSuccess?: (
    data: ApiResponse<Candidate>,
    variables: ManageCandidatePayload
  ) => void;
  onError?: (error: any, variables: ManageCandidatePayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: ManageCandidatePayload) =>
      candidatesService.createCandidate(payload),
    loadingMessage: 'Creating candidate...',
    invalidateQueries: ['candidates'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useUpdateCandidate = (options?: {
  onSuccess?: (
    data: ApiResponse<Candidate>,
    variables: UpdateCandidatePayload
  ) => void;
  onError?: (error: any, variables: UpdateCandidatePayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: UpdateCandidatePayload) => {
      const { id, ...data } = payload;
      return candidatesService.updateCandidate(id, data);
    },
    loadingMessage: 'Updating candidate...',
    invalidateQueries: ['candidates'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useDeleteCandidate = (options?: {
  onSuccess?: (data: ApiResponse<void>, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  return useApiMutation({
    mutationFn: (id: number) => candidatesService.deleteCandidate(id),
    loadingMessage: 'Deleting candidate...',
    invalidateQueries: ['candidates'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};
