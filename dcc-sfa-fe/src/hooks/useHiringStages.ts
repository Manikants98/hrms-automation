import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import type { ApiResponse } from '../types/api.types';

export interface HiringStage {
  id: number;
  name: string;
  code: string;
  description?: string;
  createdate?: string;
  updatedate?: string;
  is_active: 'Y' | 'N';
}

export interface GetHiringStagesParams {
  search?: string;
  page?: number;
  limit?: number;
  isActive?: 'Y' | 'N';
}

export interface ManageHiringStagePayload {
  name: string;
  code: string;
  description?: string;
  is_active: 'Y' | 'N';
}

export interface UpdateHiringStagePayload extends ManageHiringStagePayload {
  id: number;
}

const mockHiringStages: HiringStage[] = [
  {
    id: 1,
    name: 'Application Received',
    code: 'APP_REC',
    description: 'Initial application received from candidate',
    createdate: '2024-01-15T10:00:00Z',
    updatedate: '2024-01-15T10:00:00Z',
    is_active: 'Y',
  },
  {
    id: 2,
    name: 'Screening',
    code: 'SCREEN',
    description: 'Initial resume and qualification screening',
    createdate: '2024-01-16T10:00:00Z',
    updatedate: '2024-01-16T10:00:00Z',
    is_active: 'Y',
  },
  {
    id: 3,
    name: 'Interview',
    code: 'INTERVIEW',
    description: 'Technical and HR interview stage',
    createdate: '2024-01-17T10:00:00Z',
    updatedate: '2024-01-17T10:00:00Z',
    is_active: 'Y',
  },
  {
    id: 4,
    name: 'Offer Extended',
    code: 'OFFER',
    description: 'Job offer has been extended to candidate',
    createdate: '2024-01-18T10:00:00Z',
    updatedate: '2024-01-18T10:00:00Z',
    is_active: 'Y',
  },
  {
    id: 5,
    name: 'Onboarding',
    code: 'ONBOARD',
    description: 'Candidate accepted offer and onboarding process',
    createdate: '2024-01-19T10:00:00Z',
    updatedate: '2024-01-19T10:00:00Z',
    is_active: 'Y',
  },
];

let mockData = [...mockHiringStages];
let nextId = Math.max(...mockData.map(s => s.id)) + 1;

const fetchHiringStages = async (
  params?: GetHiringStagesParams
): Promise<ApiResponse<HiringStage[]>> => {
  await new Promise(resolve => setTimeout(resolve, 500));

  let filtered = [...mockData];

  if (params?.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(
      stage =>
        stage.name.toLowerCase().includes(searchLower) ||
        stage.code.toLowerCase().includes(searchLower) ||
        stage.description?.toLowerCase().includes(searchLower)
    );
  }

  if (params?.isActive) {
    filtered = filtered.filter(stage => stage.is_active === params.isActive);
  }

  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginated = filtered.slice(startIndex, endIndex);

  return {
    success: true,
    message: 'Hiring stages fetched successfully',
    data: paginated,
    meta: {
      total_count: filtered.length,
      current_page: page,
      total_pages: Math.ceil(filtered.length / limit),
    },
    stats: {
      total_hiring_stages: mockData.length,
      active_hiring_stages: mockData.filter(s => s.is_active === 'Y').length,
      inactive_hiring_stages: mockData.filter(s => s.is_active === 'N').length,
      new_hiring_stages: 0,
    } as any,
  };
};

const fetchHiringStageById = async (
  id: number
): Promise<ApiResponse<HiringStage>> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const stage = mockData.find(s => s.id === id);
  if (!stage) {
    throw new Error('Hiring stage not found');
  }
  return {
    success: true,
    message: 'Hiring stage fetched successfully',
    data: stage,
  };
};

const createHiringStage = async (
  payload: ManageHiringStagePayload
): Promise<ApiResponse<HiringStage>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const newStage: HiringStage = {
    id: nextId++,
    ...payload,
    createdate: new Date().toISOString(),
    updatedate: new Date().toISOString(),
  };
  mockData.push(newStage);
  return {
    success: true,
    message: 'Hiring stage created successfully',
    data: newStage,
  };
};

const updateHiringStage = async (
  payload: UpdateHiringStagePayload
): Promise<ApiResponse<HiringStage>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockData.findIndex(s => s.id === payload.id);
  if (index === -1) {
    throw new Error('Hiring stage not found');
  }
  mockData[index] = {
    ...mockData[index],
    ...payload,
    updatedate: new Date().toISOString(),
  };
  return {
    success: true,
    message: 'Hiring stage updated successfully',
    data: mockData[index],
  };
};

const deleteHiringStage = async (id: number): Promise<ApiResponse<void>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockData.findIndex(s => s.id === id);
  if (index === -1) {
    throw new Error('Hiring stage not found');
  }
  mockData.splice(index, 1);
  return { success: true, message: 'Hiring stage deleted successfully' };
};

export const hiringStageKeys = {
  all: ['hiringStages'] as const,
  lists: () => [...hiringStageKeys.all, 'list'] as const,
  list: (params?: GetHiringStagesParams) =>
    [...hiringStageKeys.lists(), params] as const,
  details: () => [...hiringStageKeys.all, 'detail'] as const,
  detail: (id: number) => [...hiringStageKeys.details(), id] as const,
};

export const useHiringStages = (
  params?: GetHiringStagesParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<HiringStage[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: hiringStageKeys.list(params),
    queryFn: () => fetchHiringStages(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useHiringStage = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<HiringStage>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: hiringStageKeys.detail(id),
    queryFn: () => fetchHiringStageById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateHiringStage = (options?: {
  onSuccess?: (
    data: ApiResponse<HiringStage>,
    variables: ManageHiringStagePayload
  ) => void;
  onError?: (error: any, variables: ManageHiringStagePayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: ManageHiringStagePayload) =>
      createHiringStage(payload),
    loadingMessage: 'Creating hiring stage...',
    invalidateQueries: ['hiringStages'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useUpdateHiringStage = (options?: {
  onSuccess?: (
    data: ApiResponse<HiringStage>,
    variables: UpdateHiringStagePayload
  ) => void;
  onError?: (error: any, variables: UpdateHiringStagePayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: UpdateHiringStagePayload) =>
      updateHiringStage(payload),
    loadingMessage: 'Updating hiring stage...',
    invalidateQueries: ['hiringStages'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useDeleteHiringStage = (options?: {
  onSuccess?: (data: ApiResponse<void>, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  return useApiMutation({
    mutationFn: (id: number) => deleteHiringStage(id),
    loadingMessage: 'Deleting hiring stage...',
    invalidateQueries: ['hiringStages'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};
