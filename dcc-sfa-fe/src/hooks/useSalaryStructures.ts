import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import type { ApiResponse } from '../types/api.types';

export type SalaryStructureType =
  | 'Basic Salary'
  | 'HRA'
  | 'Transport Allowance'
  | 'Medical Allowance'
  | 'Provident Fund'
  | 'Tax Deduction'
  | 'Insurance'
  | 'Bonus'
  | 'Overtime'
  | 'Allowance'
  | 'Loan Deduction'
  | 'Other Deduction'
  | 'Other Earnings';

export type SalaryStructureCategory = 'Earnings' | 'Deductions';

export type SalaryStructureStatus = 'Active' | 'Inactive';

export interface SalaryStructureItem {
  id?: number;
  structure_type: SalaryStructureType;
  value: number;
  category: SalaryStructureCategory;
  is_default: boolean;
}

export interface SalaryStructure {
  id: number;
  employee_id: number;
  employee_name: string;
  employee_code?: string;
  employee_email?: string;
  start_date: string;
  end_date: string;
  status: SalaryStructureStatus;
  structure_items: SalaryStructureItem[];
  createdate?: string;
  updatedate?: string;
}

export interface GetSalaryStructuresParams {
  search?: string;
  page?: number;
  limit?: number;
  employeeId?: number;
  status?: SalaryStructureStatus;
  startDate?: string;
  endDate?: string;
}

export interface ManageSalaryStructurePayload {
  employee_id: number;
  start_date: string;
  end_date: string;
  status: SalaryStructureStatus;
  structure_items: SalaryStructureItem[];
}

export interface UpdateSalaryStructurePayload extends ManageSalaryStructurePayload {
  id: number;
}

const defaultStructureTypes: {
  type: SalaryStructureType;
  category: SalaryStructureCategory;
  is_default: boolean;
}[] = [
  { type: 'Basic Salary', category: 'Earnings', is_default: true },
  { type: 'HRA', category: 'Earnings', is_default: true },
  { type: 'Provident Fund', category: 'Deductions', is_default: true },
  { type: 'Tax Deduction', category: 'Deductions', is_default: true },
];

const mockSalaryStructures: SalaryStructure[] = [
  {
    id: 1,
    employee_id: 1,
    employee_name: 'John Doe',
    employee_code: 'EMP001',
    employee_email: 'john.doe@hrms.com',
    start_date: '2025-01-01',
    end_date: '2025-12-31',
    status: 'Active',
    structure_items: [
      {
        id: 1,
        structure_type: 'Basic Salary',
        value: 80000,
        category: 'Earnings',
        is_default: true,
      },
      {
        id: 2,
        structure_type: 'HRA',
        value: 20000,
        category: 'Earnings',
        is_default: true,
      },
      {
        id: 3,
        structure_type: 'Transport Allowance',
        value: 5000,
        category: 'Earnings',
        is_default: false,
      },
      {
        id: 4,
        structure_type: 'Provident Fund',
        value: 8000,
        category: 'Deductions',
        is_default: true,
      },
      {
        id: 5,
        structure_type: 'Tax Deduction',
        value: 12000,
        category: 'Deductions',
        is_default: true,
      },
    ],
    createdate: '2025-01-01T10:00:00Z',
    updatedate: '2025-01-01T10:00:00Z',
  },
  {
    id: 2,
    employee_id: 2,
    employee_name: 'Jane Smith',
    employee_code: 'EMP002',
    employee_email: 'jane.smith@hrms.com',
    start_date: '2025-01-01',
    end_date: '2025-12-31',
    status: 'Active',
    structure_items: [
      {
        id: 6,
        structure_type: 'Basic Salary',
        value: 90000,
        category: 'Earnings',
        is_default: true,
      },
      {
        id: 7,
        structure_type: 'HRA',
        value: 22500,
        category: 'Earnings',
        is_default: true,
      },
      {
        id: 8,
        structure_type: 'Medical Allowance',
        value: 3000,
        category: 'Earnings',
        is_default: false,
      },
      {
        id: 9,
        structure_type: 'Provident Fund',
        value: 9000,
        category: 'Deductions',
        is_default: true,
      },
      {
        id: 10,
        structure_type: 'Tax Deduction',
        value: 15000,
        category: 'Deductions',
        is_default: true,
      },
    ],
    createdate: '2025-01-01T10:00:00Z',
    updatedate: '2025-01-01T10:00:00Z',
  },
];

let mockData = [...mockSalaryStructures];
let nextId = Math.max(...mockData.map(s => s.id), 0) + 1;
let nextItemId =
  Math.max(...mockData.flatMap(s => s.structure_items.map(i => i.id || 0)), 0) +
  1;

const fetchSalaryStructures = async (
  params?: GetSalaryStructuresParams
): Promise<ApiResponse<SalaryStructure[]>> => {
  await new Promise(resolve => setTimeout(resolve, 500));

  let filtered = [...mockData];

  if (params?.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(
      structure =>
        structure.employee_name.toLowerCase().includes(searchLower) ||
        structure.employee_code?.toLowerCase().includes(searchLower) ||
        structure.employee_email?.toLowerCase().includes(searchLower)
    );
  }

  if (params?.employeeId) {
    filtered = filtered.filter(
      structure => structure.employee_id === params.employeeId
    );
  }

  if (params?.status) {
    filtered = filtered.filter(structure => structure.status === params.status);
  }

  if (params?.startDate) {
    filtered = filtered.filter(
      structure => structure.start_date >= params.startDate!
    );
  }

  if (params?.endDate) {
    filtered = filtered.filter(
      structure => structure.end_date <= params.endDate!
    );
  }

  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginated = filtered.slice(startIndex, endIndex);

  const totalEarnings = filtered.reduce(
    (sum, s) =>
      sum +
      s.structure_items
        .filter(item => item.category === 'Earnings')
        .reduce((itemSum, item) => itemSum + item.value, 0),
    0
  );
  const totalDeductions = filtered.reduce(
    (sum, s) =>
      sum +
      s.structure_items
        .filter(item => item.category === 'Deductions')
        .reduce((itemSum, item) => itemSum + item.value, 0),
    0
  );
  const netSalary = totalEarnings - totalDeductions;

  return {
    success: true,
    message: 'Salary structures fetched successfully',
    data: paginated,
    meta: {
      total_count: filtered.length,
      current_page: page,
      total_pages: Math.ceil(filtered.length / limit),
    },
    stats: {
      total_employees: new Set(filtered.map(s => s.employee_id)).size,
      total_earnings: totalEarnings,
      total_deductions: totalDeductions,
      net_salary: netSalary,
    } as any,
  };
};

const fetchSalaryStructureById = async (
  id: number
): Promise<ApiResponse<SalaryStructure>> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const structure = mockData.find(s => s.id === id);
  if (!structure) {
    throw new Error('Salary structure not found');
  }
  return {
    success: true,
    message: 'Salary structure fetched successfully',
    data: structure,
  };
};

const createSalaryStructure = async (
  payload: ManageSalaryStructurePayload
): Promise<ApiResponse<SalaryStructure>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const newStructure: SalaryStructure = {
    id: nextId++,
    ...payload,
    employee_name: 'Employee Name',
    employee_code: 'EMP00000000',
    employee_email: 'employee@hrms.com',
    structure_items: payload.structure_items.map(item => ({
      ...item,
      id: nextItemId++,
    })),
    createdate: new Date().toISOString(),
    updatedate: new Date().toISOString(),
  };
  mockData.push(newStructure);
  return {
    success: true,
    message: 'Salary structure created successfully',
    data: newStructure,
  };
};

const updateSalaryStructure = async (
  payload: UpdateSalaryStructurePayload
): Promise<ApiResponse<SalaryStructure>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockData.findIndex(s => s.id === payload.id);
  if (index === -1) {
    throw new Error('Salary structure not found');
  }
  mockData[index] = {
    ...mockData[index],
    ...payload,
    structure_items: payload.structure_items.map(item => ({
      ...item,
      id: item.id || nextItemId++,
    })),
    updatedate: new Date().toISOString(),
  };
  return {
    success: true,
    message: 'Salary structure updated successfully',
    data: mockData[index],
  };
};

const deleteSalaryStructure = async (
  id: number
): Promise<ApiResponse<void>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockData.findIndex(s => s.id === id);
  if (index === -1) {
    throw new Error('Salary structure not found');
  }
  mockData.splice(index, 1);
  return {
    success: true,
    message: 'Salary structure deleted successfully',
  };
};

export const salaryStructureKeys = {
  all: ['salaryStructures'] as const,
  lists: () => [...salaryStructureKeys.all, 'list'] as const,
  list: (params?: GetSalaryStructuresParams) =>
    [...salaryStructureKeys.lists(), params] as const,
  details: () => [...salaryStructureKeys.all, 'detail'] as const,
  detail: (id: number) => [...salaryStructureKeys.details(), id] as const,
};

export const useSalaryStructures = (
  params?: GetSalaryStructuresParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<SalaryStructure[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: salaryStructureKeys.list(params),
    queryFn: () => fetchSalaryStructures(params),
    staleTime: 1 * 60 * 1000,
    ...options,
  });
};

export const useSalaryStructure = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<SalaryStructure>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: salaryStructureKeys.detail(id),
    queryFn: () => fetchSalaryStructureById(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
    ...options,
  });
};

export const useCreateSalaryStructure = (options?: {
  onSuccess?: (
    data: ApiResponse<SalaryStructure>,
    variables: ManageSalaryStructurePayload
  ) => void;
  onError?: (error: any, variables: ManageSalaryStructurePayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: ManageSalaryStructurePayload) =>
      createSalaryStructure(payload),
    loadingMessage: 'Creating salary structure...',
    invalidateQueries: ['salaryStructures'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useUpdateSalaryStructure = (options?: {
  onSuccess?: (
    data: ApiResponse<SalaryStructure>,
    variables: UpdateSalaryStructurePayload
  ) => void;
  onError?: (error: any, variables: UpdateSalaryStructurePayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: UpdateSalaryStructurePayload) =>
      updateSalaryStructure(payload),
    loadingMessage: 'Updating salary structure...',
    invalidateQueries: ['salaryStructures'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useDeleteSalaryStructure = (options?: {
  onSuccess?: (data: ApiResponse<void>, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  return useApiMutation({
    mutationFn: (id: number) => deleteSalaryStructure(id),
    loadingMessage: 'Deleting salary structure...',
    invalidateQueries: ['salaryStructures'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export { defaultStructureTypes };
