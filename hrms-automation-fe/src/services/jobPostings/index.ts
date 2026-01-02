import axiosInstance from '../../configs/axio.config';
import type { ApiResponse } from '../../types/api.types';

export interface JobPosting {
  id: number;
  job_title: string;
  reporting_manager_id?: number;
  reporting_manager_name?: string;
  department_id?: number;
  department_name?: string;
  designation_id?: number;
  designation_name?: string;
  due_date?: string;
  annual_salary_from?: number;
  annual_salary_to?: number;
  currency_code?: string;
  experience?: string;
  posting_date: string;
  closing_date?: string;
  is_internal_job: 'Y' | 'N';
  hiring_stages?: Array<{
    hiring_stage_id: number;
    sequence: number;
    name: string;
    hiring_stage_name: string;
    hiring_stage_code: string;
  }>;
  attachments_required?: Array<{
    attachment_type_name: any;
    attachment_type_id: any;
    id: number;
    name: string;
    sequence: number;
  }>;
  description?: string;
  status: 'Draft' | 'Open' | 'Closed' | 'On Hold';
  createdate?: string;
  updatedate?: string;
  is_active: 'Y' | 'N';
}

export interface HiringStageSequence {
  id: number;
  name: string;
  sequence: number;
}

export interface AttachmentRequired {
  id: number;
  name: string;
  sequence: number;
}

export type JobPostingStatus = 'Draft' | 'Open' | 'Closed' | 'On Hold';

export interface GetJobPostingsParams {
  search?: string;
  page?: number;
  limit?: number;
  isActive?: 'Y' | 'N';
  status?: JobPosting['status'];
  department_id?: number;
  is_internal_job?: 'Y' | 'N';
}

export interface ManageJobPostingPayload {
  job_title: string;
  reporting_manager_id?: number;
  department_id?: number;
  designation_id?: number;
  due_date?: string;
  annual_salary_from?: number;
  annual_salary_to?: number;
  currency_code?: string;
  experience?: string;
  posting_date: string;
  closing_date?: string;
  is_internal_job: 'Y' | 'N';
  hiring_stage_ids?: number[];
  attachment_type_ids?: number[];
  description?: string;
  status: JobPosting['status'];
  is_active: 'Y' | 'N';
}

export interface UpdateJobPostingPayload extends ManageJobPostingPayload {
  id: number;
}

export const fetchJobPostings = async (
  params?: GetJobPostingsParams
): Promise<ApiResponse<JobPosting[]>> => {
  const response = await axiosInstance.get('/job-postings', { params });
  return response.data;
};

export const fetchJobPostingById = async (
  id: number
): Promise<ApiResponse<JobPosting>> => {
  const response = await axiosInstance.get(`/job-postings/${id}`);
  return response.data;
};

export const createJobPosting = async (
  data: ManageJobPostingPayload
): Promise<ApiResponse<JobPosting>> => {
  const response = await axiosInstance.post('/job-postings', data);
  return response.data;
};

export const updateJobPosting = async (
  data: UpdateJobPostingPayload
): Promise<ApiResponse<JobPosting>> => {
  const { id, ...payload } = data;
  const response = await axiosInstance.put(`/job-postings/${id}`, payload);
  return response.data;
};

export const deleteJobPosting = async (
  id: number
): Promise<ApiResponse<void>> => {
  const response = await axiosInstance.delete(`/job-postings/${id}`);
  return response.data;
};

export default {
  fetchJobPostings,
  fetchJobPostingById,
  createJobPosting,
  updateJobPosting,
  deleteJobPosting,
};
