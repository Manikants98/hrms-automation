import axiosInstance from '../../configs/axio.config';
import type { ApiResponse } from '../../types/api.types';

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

export const fetchCandidates = async (
  params?: GetCandidatesParams
): Promise<ApiResponse<Candidate[]>> => {
  const response = await axiosInstance.get('/candidates', { params });
  return response.data;
};

export const fetchCandidateById = async (
  id: number
): Promise<ApiResponse<Candidate>> => {
  const response = await axiosInstance.get(`/candidates/${id}`);
  return response.data;
};

export const createCandidate = async (
  data: ManageCandidatePayload
): Promise<ApiResponse<Candidate>> => {
  const response = await axiosInstance.post('/candidates', data);
  return response.data;
};

export const updateCandidate = async (
  id: number,
  data: Partial<ManageCandidatePayload>
): Promise<ApiResponse<Candidate>> => {
  const response = await axiosInstance.put(`/candidates/${id}`, data);
  return response.data;
};

export const deleteCandidate = async (
  id: number
): Promise<ApiResponse<void>> => {
  const response = await axiosInstance.delete(`/candidates/${id}`);
  return response.data;
};

export default {
  fetchCandidates,
  fetchCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
};
