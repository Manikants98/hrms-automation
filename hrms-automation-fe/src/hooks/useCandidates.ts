import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import type { ApiResponse } from '../types/api.types';

export interface Candidate {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
  job_posting_id: number;
  job_posting_title?: string;
  current_hiring_stage_id?: number;
  current_hiring_stage_name?: string;
  resume_url?: string;
  cover_letter_url?: string;
  application_date?: string;
  status:
    | 'Applied'
    | 'Screening'
    | 'Interview'
    | 'Offer'
    | 'Hired'
    | 'Rejected'
    | 'Withdrawn';
  notes?: string;
  experience_years?: number;
  skills?: string;
  expected_salary?: number;
  current_salary?: number;
  notice_period?: string;
  availability_date?: string;
  createdate?: string;
  updatedate?: string;
  is_active: 'Y' | 'N';
}

export interface GetCandidatesParams {
  search?: string;
  page?: number;
  limit?: number;
  isActive?: 'Y' | 'N';
  job_posting_id?: number;
  status?: Candidate['status'];
  current_hiring_stage_id?: number;
}

export interface ManageCandidatePayload {
  name: string;
  email: string;
  phone_number?: string;
  job_posting_id: number;
  current_hiring_stage_id?: number;
  resume_url?: string;
  cover_letter_url?: string;
  application_date?: string;
  status: Candidate['status'];
  notes?: string;
  experience_years?: number;
  skills?: string;
  expected_salary?: number;
  current_salary?: number;
  notice_period?: string;
  availability_date?: string;
  is_active: 'Y' | 'N';
}

export interface UpdateCandidatePayload extends ManageCandidatePayload {
  id: number;
}

const mockCandidates: Candidate[] = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@hrms.com',
    phone_number: '+1-555-0101',
    job_posting_id: 1,
    job_posting_title: 'Senior Software Engineer',
    current_hiring_stage_id: 2,
    current_hiring_stage_name: 'Technical Interview',
    resume_url: '/resumes/john-smith-resume.pdf',
    cover_letter_url: '/cover-letters/john-smith-cover.pdf',
    application_date: '2025-12-05',
    status: 'Interview',
    notes: 'Strong technical background, excellent communication skills',
    experience_years: 7,
    skills: 'React, Node.js, TypeScript, AWS',
    expected_salary: 110000,
    current_salary: 95000,
    notice_period: '2 weeks',
    availability_date: '2026-01-15',
    createdate: '2025-12-05T10:00:00Z',
    updatedate: '2025-12-10T10:00:00Z',
    is_active: 'Y',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@hrms.com',
    phone_number: '+1-555-0102',
    job_posting_id: 2,
    job_posting_title: 'Product Manager',
    current_hiring_stage_id: 1,
    current_hiring_stage_name: 'Application Review',
    resume_url: '/resumes/sarah-johnson-resume.pdf',
    application_date: '2025-12-08',
    status: 'Screening',
    notes: 'Previous experience in product management, MBA graduate',
    experience_years: 8,
    skills: 'Product Strategy, Agile, Data Analysis',
    expected_salary: 130000,
    current_salary: 115000,
    notice_period: '1 month',
    availability_date: '2026-02-01',
    createdate: '2025-12-08T10:00:00Z',
    updatedate: '2025-12-08T10:00:00Z',
    is_active: 'Y',
  },
  {
    id: 3,
    name: 'Michael Chen',
    email: 'michael.chen@hrms.com',
    phone_number: '+1-555-0103',
    job_posting_id: 1,
    job_posting_title: 'Senior Software Engineer',
    current_hiring_stage_id: 3,
    current_hiring_stage_name: 'HR Round',
    resume_url: '/resumes/michael-chen-resume.pdf',
    application_date: '2025-12-03',
    status: 'Interview',
    notes: 'Passed technical interview, moving to HR round',
    experience_years: 6,
    skills: 'Python, Django, PostgreSQL, Docker',
    expected_salary: 105000,
    current_salary: 90000,
    notice_period: '3 weeks',
    availability_date: '2026-01-20',
    createdate: '2025-12-03T10:00:00Z',
    updatedate: '2025-12-12T10:00:00Z',
    is_active: 'Y',
  },
  {
    id: 4,
    name: 'Emily Davis',
    email: 'emily.davis@hrms.com',
    phone_number: '+1-555-0104',
    job_posting_id: 3,
    job_posting_title: 'UX Designer',
    current_hiring_stage_id: 2,
    current_hiring_stage_name: 'Portfolio Review',
    resume_url: '/resumes/emily-davis-resume.pdf',
    cover_letter_url: '/cover-letters/emily-davis-cover.pdf',
    application_date: '2025-12-12',
    status: 'Screening',
    notes: 'Impressive portfolio, strong design thinking',
    experience_years: 4,
    skills: 'Figma, Sketch, User Research, Prototyping',
    expected_salary: 85000,
    current_salary: 75000,
    notice_period: '2 weeks',
    availability_date: '2026-01-10',
    createdate: '2025-12-12T10:00:00Z',
    updatedate: '2025-12-12T10:00:00Z',
    is_active: 'Y',
  },
  {
    id: 5,
    name: 'David Wilson',
    email: 'david.wilson@hrms.com',
    phone_number: '+1-555-0105',
    job_posting_id: 4,
    job_posting_title: 'Data Analyst',
    current_hiring_stage_id: 2,
    current_hiring_stage_name: 'Technical Interview',
    resume_url: '/resumes/david-wilson-resume.pdf',
    application_date: '2025-12-10',
    status: 'Interview',
    notes: 'Strong analytical skills, SQL expert',
    experience_years: 3,
    skills: 'SQL, Python, Tableau, Excel',
    expected_salary: 75000,
    current_salary: 65000,
    notice_period: '2 weeks',
    availability_date: '2026-01-05',
    createdate: '2025-12-10T10:00:00Z',
    updatedate: '2025-12-15T10:00:00Z',
    is_active: 'Y',
  },
  {
    id: 6,
    name: 'Lisa Anderson',
    email: 'lisa.anderson@hrms.com',
    phone_number: '+1-555-0106',
    job_posting_id: 5,
    job_posting_title: 'Marketing Manager',
    current_hiring_stage_id: 1,
    current_hiring_stage_name: 'Application Review',
    resume_url: '/resumes/lisa-anderson-resume.pdf',
    application_date: '2025-12-06',
    status: 'Applied',
    notes: 'New application, pending review',
    experience_years: 7,
    skills: 'Digital Marketing, SEO, Content Strategy',
    expected_salary: 100000,
    current_salary: 90000,
    notice_period: '1 month',
    availability_date: '2026-02-15',
    createdate: '2025-12-06T10:00:00Z',
    updatedate: '2025-12-06T10:00:00Z',
    is_active: 'Y',
  },
  {
    id: 7,
    name: 'Robert Brown',
    email: 'robert.brown@hrms.com',
    phone_number: '+1-555-0107',
    job_posting_id: 1,
    job_posting_title: 'Senior Software Engineer',
    current_hiring_stage_id: 1,
    current_hiring_stage_name: 'Application Review',
    resume_url: '/resumes/robert-brown-resume.pdf',
    application_date: '2025-12-01',
    status: 'Rejected',
    notes: 'Did not meet minimum requirements',
    experience_years: 3,
    skills: 'JavaScript, HTML, CSS',
    expected_salary: 80000,
    current_salary: 70000,
    notice_period: '2 weeks',
    createdate: '2025-12-01T10:00:00Z',
    updatedate: '2025-12-05T10:00:00Z',
    is_active: 'N',
  },
  {
    id: 8,
    name: 'Jennifer Taylor',
    email: 'jennifer.taylor@hrms.com',
    phone_number: '+1-555-0108',
    job_posting_id: 2,
    job_posting_title: 'Product Manager',
    current_hiring_stage_id: 3,
    current_hiring_stage_name: 'HR Round',
    resume_url: '/resumes/jennifer-taylor-resume.pdf',
    application_date: '2025-12-04',
    status: 'Offer',
    notes: 'Offer extended, waiting for response',
    experience_years: 9,
    skills: 'Product Management, Scrum, Analytics',
    expected_salary: 140000,
    current_salary: 125000,
    notice_period: '1 month',
    availability_date: '2026-02-01',
    createdate: '2025-12-04T10:00:00Z',
    updatedate: '2025-12-18T10:00:00Z',
    is_active: 'Y',
  },
  {
    id: 9,
    name: 'Kevin Martinez',
    email: 'kevin.martinez@hrms.com',
    phone_number: '+1-555-0109',
    job_posting_id: 1,
    job_posting_title: 'Senior Software Engineer',
    current_hiring_stage_id: 1,
    current_hiring_stage_name: 'Application Review',
    resume_url: '/resumes/kevin-martinez-resume.pdf',
    application_date: '2025-12-11',
    status: 'Applied',
    notes: 'New application',
    experience_years: 5,
    skills: 'Java, Spring Boot, Microservices',
    expected_salary: 100000,
    current_salary: 85000,
    notice_period: '3 weeks',
    availability_date: '2026-01-25',
    createdate: '2025-12-11T10:00:00Z',
    updatedate: '2025-12-11T10:00:00Z',
    is_active: 'Y',
  },
  {
    id: 10,
    name: 'Rachel Green',
    email: 'rachel.green@hrms.com',
    phone_number: '+1-555-0110',
    job_posting_id: 3,
    job_posting_title: 'UX Designer',
    current_hiring_stage_id: 3,
    current_hiring_stage_name: 'HR Round',
    resume_url: '/resumes/rachel-green-resume.pdf',
    application_date: '2025-12-09',
    status: 'Hired',
    notes: 'Successfully completed all rounds',
    experience_years: 5,
    skills: 'Figma, Adobe XD, User Research',
    expected_salary: 90000,
    current_salary: 80000,
    notice_period: '2 weeks',
    availability_date: '2026-01-08',
    createdate: '2025-12-09T10:00:00Z',
    updatedate: '2025-12-20T10:00:00Z',
    is_active: 'Y',
  },
];

let mockData = [...mockCandidates];
let nextId = Math.max(...mockData.map(c => c.id)) + 1;

const fetchCandidates = async (
  params?: GetCandidatesParams
): Promise<ApiResponse<Candidate[]>> => {
  await new Promise(resolve => setTimeout(resolve, 500));

  let filtered = [...mockData];

  if (params?.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(
      candidate =>
        candidate.name.toLowerCase().includes(searchLower) ||
        candidate.email.toLowerCase().includes(searchLower) ||
        candidate.phone_number?.toLowerCase().includes(searchLower) ||
        candidate.job_posting_title?.toLowerCase().includes(searchLower) ||
        candidate.skills?.toLowerCase().includes(searchLower)
    );
  }

  if (params?.isActive) {
    filtered = filtered.filter(
      candidate => candidate.is_active === params.isActive
    );
  }

  if (params?.job_posting_id) {
    filtered = filtered.filter(
      candidate => candidate.job_posting_id === params.job_posting_id
    );
  }

  if (params?.status) {
    filtered = filtered.filter(candidate => candidate.status === params.status);
  }

  if (params?.current_hiring_stage_id) {
    filtered = filtered.filter(
      candidate =>
        candidate.current_hiring_stage_id === params.current_hiring_stage_id
    );
  }

  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginated = filtered.slice(startIndex, endIndex);

  return {
    success: true,
    message: 'Candidates fetched successfully',
    data: paginated,
    meta: {
      total_count: filtered.length,
      current_page: page,
      total_pages: Math.ceil(filtered.length / limit),
    },
    stats: {
      total_candidates: mockData.length,
      active_candidates: mockData.filter(c => c.is_active === 'Y').length,
      inactive_candidates: mockData.filter(c => c.is_active === 'N').length,
      new_candidates: 0,
      by_status: {
        Applied: mockData.filter(c => c.status === 'Applied').length,
        Screening: mockData.filter(c => c.status === 'Screening').length,
        Interview: mockData.filter(c => c.status === 'Interview').length,
        Offer: mockData.filter(c => c.status === 'Offer').length,
        Hired: mockData.filter(c => c.status === 'Hired').length,
        Rejected: mockData.filter(c => c.status === 'Rejected').length,
        Withdrawn: mockData.filter(c => c.status === 'Withdrawn').length,
      },
    } as any,
  };
};

const fetchCandidateById = async (
  id: number
): Promise<ApiResponse<Candidate>> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const candidate = mockData.find(c => c.id === id);
  if (!candidate) {
    throw new Error('Candidate not found');
  }
  return {
    success: true,
    message: 'Candidate fetched successfully',
    data: candidate,
  };
};

const createCandidate = async (
  payload: ManageCandidatePayload
): Promise<ApiResponse<Candidate>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const newCandidate: Candidate = {
    id: nextId++,
    ...payload,
    job_posting_title: 'Job Title',
    current_hiring_stage_name: 'Stage Name',
    createdate: new Date().toISOString(),
    updatedate: new Date().toISOString(),
  };
  mockData.push(newCandidate);
  return {
    success: true,
    message: 'Candidate created successfully',
    data: newCandidate,
  };
};

const updateCandidate = async (
  payload: UpdateCandidatePayload
): Promise<ApiResponse<Candidate>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockData.findIndex(c => c.id === payload.id);
  if (index === -1) {
    throw new Error('Candidate not found');
  }
  mockData[index] = {
    ...mockData[index],
    ...payload,
    updatedate: new Date().toISOString(),
  };
  return {
    success: true,
    message: 'Candidate updated successfully',
    data: mockData[index],
  };
};

const deleteCandidate = async (id: number): Promise<ApiResponse<void>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockData.findIndex(c => c.id === id);
  if (index === -1) {
    throw new Error('Candidate not found');
  }
  mockData.splice(index, 1);
  return { success: true, message: 'Candidate deleted successfully' };
};

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
    queryFn: () => fetchCandidates(params),
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
    queryFn: () => fetchCandidateById(id),
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
    mutationFn: (payload: ManageCandidatePayload) => createCandidate(payload),
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
    mutationFn: (payload: UpdateCandidatePayload) => updateCandidate(payload),
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
    mutationFn: (id: number) => deleteCandidate(id),
    loadingMessage: 'Deleting candidate...',
    invalidateQueries: ['candidates'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};
