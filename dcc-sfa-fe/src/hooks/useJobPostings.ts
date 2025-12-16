import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import type { ApiResponse } from '../types/api.types';

export interface JobPosting {
  id: number;
  job_title: string;
  reporting_manager_id?: number;
  reporting_manager_name?: string;
  department_id?: number;
  department_name?: string;
  due_date?: string;
  annual_salary_from?: number;
  annual_salary_to?: number;
  currency_code?: string;
  designation_id?: number;
  designation_name?: string;
  experience?: string;
  posting_date?: string;
  closing_date?: string;
  is_internal_job?: 'Y' | 'N';
  hiring_stages?: HiringStageSequence[];
  attachments_required?: AttachmentRequired[];
  description?: string;
  createdate?: string;
  updatedate?: string;
  is_active: 'Y' | 'N';
}

export interface HiringStageSequence {
  id: number;
  hiring_stage_id: number;
  hiring_stage_name: string;
  hiring_stage_code: string;
  sequence: number;
}

export interface AttachmentRequired {
  id: number;
  attachment_type_id: number;
  attachment_type_name: string;
  sequence: number;
}

export interface GetJobPostingsParams {
  search?: string;
  page?: number;
  limit?: number;
  isActive?: 'Y' | 'N';
  department_id?: number;
  designation_id?: number;
}

export interface ManageJobPostingPayload {
  job_title: string;
  reporting_manager_id?: number;
  department_id?: number;
  due_date?: string;
  annual_salary_from?: number;
  annual_salary_to?: number;
  currency_code?: string;
  designation_id?: number;
  experience?: string;
  posting_date?: string;
  closing_date?: string;
  is_internal_job?: 'Y' | 'N';
  hiring_stages?: Array<{ hiring_stage_id: number; sequence: number }>;
  attachments_required?: Array<{
    attachment_type_id: number;
    sequence: number;
  }>;
  description?: string;
  is_active: 'Y' | 'N';
}

export interface UpdateJobPostingPayload extends ManageJobPostingPayload {
  id: number;
}

const mockJobPostings: JobPosting[] = [
  {
    id: 1,
    job_title: 'Senior Software Engineer',
    reporting_manager_id: 1,
    reporting_manager_name: 'John Doe',
    department_id: 1,
    department_name: 'Engineering',
    due_date: '2025-12-31',
    annual_salary_from: 80000,
    annual_salary_to: 120000,
    currency_code: 'USD',
    designation_id: 1,
    designation_name: 'Senior Engineer',
    experience: '5-8 years',
    posting_date: '2025-12-01',
    closing_date: '2025-12-20',
    is_internal_job: 'N',
    hiring_stages: [
      {
        id: 1,
        hiring_stage_id: 1,
        hiring_stage_name: 'Application Review',
        hiring_stage_code: 'APP_REV',
        sequence: 1,
      },
      {
        id: 2,
        hiring_stage_id: 2,
        hiring_stage_name: 'Technical Interview',
        hiring_stage_code: 'TECH_INT',
        sequence: 2,
      },
      {
        id: 3,
        hiring_stage_id: 3,
        hiring_stage_name: 'HR Round',
        hiring_stage_code: 'HR_RND',
        sequence: 3,
      },
    ],
    attachments_required: [
      {
        id: 1,
        attachment_type_id: 1,
        attachment_type_name: 'Resume / CV',
        sequence: 1,
      },
      {
        id: 2,
        attachment_type_id: 2,
        attachment_type_name: 'Cover Letter',
        sequence: 2,
      },
    ],
    description:
      'We are looking for an experienced Senior Software Engineer...',
    createdate: '2025-12-01T10:00:00Z',
    updatedate: '2025-12-01T10:00:00Z',
    is_active: 'Y',
  },
  {
    id: 2,
    job_title: 'Product Manager',
    reporting_manager_id: 2,
    reporting_manager_name: 'Jane Smith',
    department_id: 2,
    department_name: 'Product',
    due_date: '2025-12-25',
    annual_salary_from: 100000,
    annual_salary_to: 150000,
    currency_code: 'USD',
    designation_id: 2,
    designation_name: 'Product Manager',
    experience: '7-10 years',
    posting_date: '2025-12-05',
    closing_date: '2025-12-25',
    is_internal_job: 'N',
    hiring_stages: [
      {
        id: 4,
        hiring_stage_id: 1,
        hiring_stage_name: 'Application Review',
        hiring_stage_code: 'APP_REV',
        sequence: 1,
      },
      {
        id: 5,
        hiring_stage_id: 4,
        hiring_stage_name: 'Manager Round',
        hiring_stage_code: 'MGR_RND',
        sequence: 2,
      },
    ],
    attachments_required: [
      {
        id: 3,
        attachment_type_id: 1,
        attachment_type_name: 'Resume / CV',
        sequence: 1,
      },
    ],
    description: 'Join our product team as a Product Manager...',
    createdate: '2025-12-05T10:00:00Z',
    updatedate: '2025-12-05T10:00:00Z',
    is_active: 'Y',
  },
  {
    id: 3,
    job_title: 'UX Designer',
    reporting_manager_id: 3,
    reporting_manager_name: 'Mike Johnson',
    department_id: 3,
    department_name: 'Design',
    due_date: '2025-12-30',
    annual_salary_from: 70000,
    annual_salary_to: 100000,
    currency_code: 'USD',
    designation_id: 3,
    designation_name: 'UX Designer',
    experience: '3-5 years',
    posting_date: '2025-12-10',
    closing_date: '2025-12-30',
    is_internal_job: 'Y',
    hiring_stages: [
      {
        id: 6,
        hiring_stage_id: 1,
        hiring_stage_name: 'Application Review',
        hiring_stage_code: 'APP_REV',
        sequence: 1,
      },
      {
        id: 7,
        hiring_stage_id: 5,
        hiring_stage_name: 'Portfolio Review',
        hiring_stage_code: 'PORT_REV',
        sequence: 2,
      },
      {
        id: 8,
        hiring_stage_id: 3,
        hiring_stage_name: 'HR Round',
        hiring_stage_code: 'HR_RND',
        sequence: 3,
      },
    ],
    attachments_required: [
      {
        id: 4,
        attachment_type_id: 1,
        attachment_type_name: 'Resume / CV',
        sequence: 1,
      },
      {
        id: 5,
        attachment_type_id: 3,
        attachment_type_name: 'Portfolio',
        sequence: 2,
      },
    ],
    description: 'We are seeking a talented UX Designer...',
    createdate: '2025-12-10T10:00:00Z',
    updatedate: '2025-12-10T10:00:00Z',
    is_active: 'Y',
  },
  {
    id: 4,
    job_title: 'Data Analyst',
    reporting_manager_id: 1,
    reporting_manager_name: 'John Doe',
    department_id: 4,
    department_name: 'Analytics',
    due_date: '2025-12-28',
    annual_salary_from: 60000,
    annual_salary_to: 90000,
    currency_code: 'USD',
    designation_id: 4,
    designation_name: 'Data Analyst',
    experience: '2-4 years',
    posting_date: '2025-12-08',
    closing_date: '2025-12-28',
    is_internal_job: 'N',
    hiring_stages: [
      {
        id: 9,
        hiring_stage_id: 1,
        hiring_stage_name: 'Application Review',
        hiring_stage_code: 'APP_REV',
        sequence: 1,
      },
      {
        id: 10,
        hiring_stage_id: 2,
        hiring_stage_name: 'Technical Interview',
        hiring_stage_code: 'TECH_INT',
        sequence: 2,
      },
    ],
    attachments_required: [
      {
        id: 6,
        attachment_type_id: 1,
        attachment_type_name: 'Resume / CV',
        sequence: 1,
      },
    ],
    description: 'Looking for a Data Analyst to join our analytics team...',
    createdate: '2025-12-08T10:00:00Z',
    updatedate: '2025-12-08T10:00:00Z',
    is_active: 'Y',
  },
  {
    id: 5,
    job_title: 'Marketing Manager',
    reporting_manager_id: 4,
    reporting_manager_name: 'Sarah Williams',
    department_id: 5,
    department_name: 'Marketing',
    due_date: '2025-12-15',
    annual_salary_from: 90000,
    annual_salary_to: 130000,
    currency_code: 'USD',
    designation_id: 5,
    designation_name: 'Marketing Manager',
    experience: '6-9 years',
    posting_date: '2025-12-03',
    closing_date: '2025-12-15',
    is_internal_job: 'N',
    hiring_stages: [
      {
        id: 11,
        hiring_stage_id: 1,
        hiring_stage_name: 'Application Review',
        hiring_stage_code: 'APP_REV',
        sequence: 1,
      },
      {
        id: 12,
        hiring_stage_id: 4,
        hiring_stage_name: 'Manager Round',
        hiring_stage_code: 'MGR_RND',
        sequence: 2,
      },
      {
        id: 13,
        hiring_stage_id: 3,
        hiring_stage_name: 'HR Round',
        hiring_stage_code: 'HR_RND',
        sequence: 3,
      },
    ],
    attachments_required: [
      {
        id: 7,
        attachment_type_id: 1,
        attachment_type_name: 'Resume / CV',
        sequence: 1,
      },
      {
        id: 8,
        attachment_type_id: 4,
        attachment_type_name: 'Portfolio',
        sequence: 2,
      },
    ],
    description: 'Seeking an experienced Marketing Manager...',
    createdate: '2025-12-03T10:00:00Z',
    updatedate: '2025-12-03T10:00:00Z',
    is_active: 'N',
  },
  {
    id: 6,
    job_title: 'Sales Executive',
    reporting_manager_id: 5,
    reporting_manager_name: 'David Wilson',
    department_id: 6,
    department_name: 'Sales',
    due_date: '2025-12-22',
    annual_salary_from: 80000,
    annual_salary_to: 120000,
    currency_code: 'USD',
    designation_id: 6,
    designation_name: 'Sales Executive',
    experience: '3-5 years',
    posting_date: '2025-12-02',
    closing_date: '2025-12-22',
    is_active: 'Y',
    is_internal_job: 'N',
    hiring_stages: [
      {
        id: 14,
        hiring_stage_id: 1,
        hiring_stage_name: 'Application Review',
        hiring_stage_code: 'APP_REV',
        sequence: 1,
      },
    ],
    attachments_required: [
      {
        id: 9,
        attachment_type_id: 1,
        attachment_type_name: 'Resume / CV',
        sequence: 1,
      },
    ],
  },
];

let mockData = [...mockJobPostings];
let nextId = Math.max(...mockData.map(jp => jp.id)) + 1;

const fetchJobPostings = async (
  params?: GetJobPostingsParams
): Promise<ApiResponse<JobPosting[]>> => {
  await new Promise(resolve => setTimeout(resolve, 500));

  let filtered = [...mockData];

  if (params?.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(
      posting =>
        posting.job_title.toLowerCase().includes(searchLower) ||
        posting.department_name?.toLowerCase().includes(searchLower) ||
        posting.designation_name?.toLowerCase().includes(searchLower) ||
        posting.reporting_manager_name?.toLowerCase().includes(searchLower)
    );
  }

  if (params?.isActive) {
    filtered = filtered.filter(
      posting => posting.is_active === params.isActive
    );
  }

  if (params?.department_id) {
    filtered = filtered.filter(
      posting => posting.department_id === params.department_id
    );
  }

  if (params?.designation_id) {
    filtered = filtered.filter(
      posting => posting.designation_id === params.designation_id
    );
  }

  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginated = filtered.slice(startIndex, endIndex);

  return {
    success: true,
    message: 'Job postings fetched successfully',
    data: paginated,
    meta: {
      total_count: filtered.length,
      current_page: page,
      total_pages: Math.ceil(filtered.length / limit),
    },
    stats: {
      total_job_postings: mockData.length,
      active_job_postings: mockData.filter(jp => jp.is_active === 'Y').length,
      inactive_job_postings: mockData.filter(jp => jp.is_active === 'N').length,
      new_job_postings: 0,
    } as any,
  };
};

const fetchJobPostingById = async (
  id: number
): Promise<ApiResponse<JobPosting>> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const posting = mockData.find(jp => jp.id === id);
  if (!posting) {
    throw new Error('Job posting not found');
  }
  return {
    success: true,
    message: 'Job posting fetched successfully',
    data: posting,
  };
};

const createJobPosting = async (
  payload: ManageJobPostingPayload
): Promise<ApiResponse<JobPosting>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const newPosting: JobPosting = {
    id: nextId++,
    ...payload,
    reporting_manager_name: 'Manager Name',
    department_name: 'Department Name',
    designation_name: 'Designation Name',
    hiring_stages: payload.hiring_stages?.map((hs, idx) => ({
      id: idx + 1,
      hiring_stage_id: hs.hiring_stage_id,
      hiring_stage_name: 'Stage Name',
      hiring_stage_code: 'STAGE_CODE',
      sequence: hs.sequence,
    })),
    attachments_required: payload.attachments_required?.map((at, idx) => ({
      id: idx + 1,
      attachment_type_id: at.attachment_type_id,
      attachment_type_name: 'Attachment Name',
      sequence: at.sequence,
    })),
    createdate: new Date().toISOString(),
    updatedate: new Date().toISOString(),
  };
  mockData.push(newPosting);
  return {
    success: true,
    message: 'Job posting created successfully',
    data: newPosting,
  };
};

const updateJobPosting = async (
  payload: UpdateJobPostingPayload
): Promise<ApiResponse<JobPosting>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockData.findIndex(jp => jp.id === payload.id);
  if (index === -1) {
    throw new Error('Job posting not found');
  }
  mockData[index] = {
    ...mockData[index],
    ...payload,
    hiring_stages: payload.hiring_stages?.map((hs, idx) => ({
      id: idx + 1,
      hiring_stage_id: hs.hiring_stage_id,
      hiring_stage_name: 'Stage Name',
      hiring_stage_code: 'STAGE_CODE',
      sequence: hs.sequence,
    })),
    attachments_required: payload.attachments_required?.map((at, idx) => ({
      id: idx + 1,
      attachment_type_id: at.attachment_type_id,
      attachment_type_name: 'Attachment Name',
      sequence: at.sequence,
    })),
    updatedate: new Date().toISOString(),
  };
  return {
    success: true,
    message: 'Job posting updated successfully',
    data: mockData[index],
  };
};

const deleteJobPosting = async (id: number): Promise<ApiResponse<void>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockData.findIndex(jp => jp.id === id);
  if (index === -1) {
    throw new Error('Job posting not found');
  }
  mockData.splice(index, 1);
  return { success: true, message: 'Job posting deleted successfully' };
};

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
    queryFn: () => fetchJobPostings(params),
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
    queryFn: () => fetchJobPostingById(id),
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
    mutationFn: (payload: ManageJobPostingPayload) => createJobPosting(payload),
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
    mutationFn: (payload: UpdateJobPostingPayload) => updateJobPosting(payload),
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
    mutationFn: (id: number) => deleteJobPosting(id),
    loadingMessage: 'Deleting job posting...',
    invalidateQueries: ['jobPostings'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};
