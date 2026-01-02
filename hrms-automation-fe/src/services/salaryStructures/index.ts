import axiosInstance from '../../configs/axio.config';
import type { ApiResponse } from '../../types/api.types';

export interface SalaryStructureItem {
  id?: number;
  structure_type: string;
  value: number;
  category: 'Earnings' | 'Deductions';
  is_default: boolean;
}

export interface SalaryStructure {
  id: number;
  employee_id: number;
  employee_name?: string;
  employee_email?: string;
  employee_code?: string;
  start_date: string;
  end_date?: string;
  status: 'Active' | 'Inactive' | 'Draft';
  structure_items: SalaryStructureItem[];
  createdate?: string;
  updatedate?: string;
  is_active: 'Y' | 'N';
}

export interface GetSalaryStructuresParams {
  search?: string;
  page?: number;
  limit?: number;
  employee_id?: number;
  status?: SalaryStructure['status'];
  isActive?: 'Y' | 'N';
}

export interface ManageSalaryStructurePayload {
  employee_id: number;
  start_date: string;
  end_date?: string;
  status: SalaryStructure['status'];
  structure_items: SalaryStructureItem[];
  is_active: 'Y' | 'N';
}

export interface UpdateSalaryStructurePayload extends ManageSalaryStructurePayload {
  id: number;
}

export type SalaryStructureType = string;

export type SalaryStructureCategory = 'Earnings' | 'Deductions';

export type SalaryStructureStatus = 'Active' | 'Inactive' | 'Draft';

export const defaultStructureTypes = [
  { type: 'Basic Salary', category: 'Earnings' as SalaryStructureCategory, is_default: true },
  { type: 'HRA', category: 'Earnings' as SalaryStructureCategory, is_default: true },
  { type: 'Provident Fund', category: 'Deductions' as SalaryStructureCategory, is_default: true },
  { type: 'Tax Deduction', category: 'Deductions' as SalaryStructureCategory, is_default: true },
];

export const fetchSalaryStructures = async (
  params?: GetSalaryStructuresParams
): Promise<ApiResponse<SalaryStructure[]>> => {
  const response = await axiosInstance.get('/salary-structures', { params });
  return response.data;
};

export const fetchSalaryStructureById = async (
  id: number
): Promise<ApiResponse<SalaryStructure>> => {
  const response = await axiosInstance.get(`/salary-structures/${id}`);
  return response.data;
};

export const fetchSalaryStructureByEmployee = async (
  employeeId: number
): Promise<ApiResponse<SalaryStructure>> => {
  const response = await axiosInstance.get(`/salary-structures/employee/${employeeId}`);
  return response.data;
};

export const createSalaryStructure = async (
  data: ManageSalaryStructurePayload
): Promise<ApiResponse<SalaryStructure>> => {
  const response = await axiosInstance.post('/salary-structures', data);
  return response.data;
};

export const updateSalaryStructure = async (
  data: UpdateSalaryStructurePayload
): Promise<ApiResponse<SalaryStructure>> => {
  const { id, ...payload } = data;
  const response = await axiosInstance.put(`/salary-structures/${id}`, payload);
  return response.data;
};

export const deleteSalaryStructure = async (
  id: number
): Promise<ApiResponse<void>> => {
  const response = await axiosInstance.delete(`/salary-structures/${id}`);
  return response.data;
};

export default {
  fetchSalaryStructures,
  fetchSalaryStructureById,
  fetchSalaryStructureByEmployee,
  createSalaryStructure,
  updateSalaryStructure,
  deleteSalaryStructure,
};
