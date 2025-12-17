import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { ApiResponse } from '../types/api.types';
import type { PayrollStatus } from './usePayrollProcessing';

export type { PayrollStatus };

export interface SalarySlip {
  id: number;
  employee_id: number;
  employee_name: string;
  employee_code?: string;
  employee_email?: string;
  payroll_month: string;
  payroll_year: number;
  basic_salary: number;
  total_earnings: number;
  total_deductions: number;
  leave_deductions: number;
  net_salary: number;
  processed_date: string;
  paid_date?: string;
  status: PayrollStatus;
  payroll_processing_id: number;
  remarks?: string;
  createdate?: string;
  updatedate?: string;
}

export interface GetSalarySlipsParams {
  search?: string;
  page?: number;
  limit?: number;
  employeeId?: number;
  payrollMonth?: string;
  payrollYear?: number;
  status?: PayrollStatus;
}

const mockSalarySlips: SalarySlip[] = [
  {
    id: 1,
    employee_id: 1,
    employee_name: 'John Doe',
    employee_code: 'EMP001',
    employee_email: 'john.doe@hrms.com',
    payroll_month: '01',
    payroll_year: 2025,
    basic_salary: 80000,
    total_earnings: 105000,
    total_deductions: 20000,
    leave_deductions: 0,
    net_salary: 85000,
    processed_date: '2025-01-31',
    status: 'Paid',
    paid_date: '2025-02-05',
    payroll_processing_id: 1,
  },
  {
    id: 2,
    employee_id: 2,
    employee_name: 'Jane Smith',
    employee_code: 'EMP002',
    employee_email: 'jane.smith@hrms.com',
    payroll_month: '01',
    payroll_year: 2025,
    basic_salary: 90000,
    total_earnings: 120000,
    total_deductions: 24000,
    leave_deductions: 5000,
    net_salary: 91000,
    processed_date: '2025-01-31',
    status: 'Paid',
    paid_date: '2025-02-05',
    payroll_processing_id: 1,
  },
  {
    id: 3,
    employee_id: 3,
    employee_name: 'Mike Johnson',
    employee_code: 'EMP003',
    employee_email: 'mike.johnson@hrms.com',
    payroll_month: '01',
    payroll_year: 2025,
    basic_salary: 75000,
    total_earnings: 95000,
    total_deductions: 18000,
    leave_deductions: 3000,
    net_salary: 74000,
    processed_date: '2025-01-31',
    status: 'Paid',
    paid_date: '2025-02-05',
    payroll_processing_id: 1,
  },
  {
    id: 4,
    employee_id: 4,
    employee_name: 'Sarah Williams',
    employee_code: 'EMP004',
    employee_email: 'sarah.williams@hrms.com',
    payroll_month: '01',
    payroll_year: 2025,
    basic_salary: 85000,
    total_earnings: 110000,
    total_deductions: 22000,
    leave_deductions: 2000,
    net_salary: 86000,
    processed_date: '2025-01-31',
    status: 'Paid',
    paid_date: '2025-02-05',
    payroll_processing_id: 1,
  },
  {
    id: 5,
    employee_id: 5,
    employee_name: 'David Brown',
    employee_code: 'EMP005',
    employee_email: 'david.brown@hrms.com',
    payroll_month: '01',
    payroll_year: 2025,
    basic_salary: 70000,
    total_earnings: 90000,
    total_deductions: 16000,
    leave_deductions: 5000,
    net_salary: 69000,
    processed_date: '2025-01-31',
    status: 'Paid',
    paid_date: '2025-02-05',
    payroll_processing_id: 1,
  },
  {
    id: 6,
    employee_id: 1,
    employee_name: 'John Doe',
    employee_code: 'EMP001',
    employee_email: 'john.doe@hrms.com',
    payroll_month: '02',
    payroll_year: 2025,
    basic_salary: 80000,
    total_earnings: 105000,
    total_deductions: 20000,
    leave_deductions: 0,
    net_salary: 85000,
    processed_date: '2025-02-28',
    status: 'Processed',
    payroll_processing_id: 2,
  },
  {
    id: 7,
    employee_id: 2,
    employee_name: 'Jane Smith',
    employee_code: 'EMP002',
    employee_email: 'jane.smith@hrms.com',
    payroll_month: '02',
    payroll_year: 2025,
    basic_salary: 90000,
    total_earnings: 120000,
    total_deductions: 24000,
    leave_deductions: 3000,
    net_salary: 93000,
    processed_date: '2025-02-28',
    status: 'Processed',
    payroll_processing_id: 2,
  },
  {
    id: 8,
    employee_id: 3,
    employee_name: 'Mike Johnson',
    employee_code: 'EMP003',
    employee_email: 'mike.johnson@hrms.com',
    payroll_month: '02',
    payroll_year: 2025,
    basic_salary: 75000,
    total_earnings: 95000,
    total_deductions: 18000,
    leave_deductions: 0,
    net_salary: 77000,
    processed_date: '2025-02-28',
    status: 'Processed',
    payroll_processing_id: 2,
  },
  {
    id: 9,
    employee_id: 4,
    employee_name: 'Sarah Williams',
    employee_code: 'EMP004',
    employee_email: 'sarah.williams@hrms.com',
    payroll_month: '02',
    payroll_year: 2025,
    basic_salary: 85000,
    total_earnings: 110000,
    total_deductions: 22000,
    leave_deductions: 4000,
    net_salary: 84000,
    processed_date: '2025-02-28',
    status: 'Processed',
    payroll_processing_id: 2,
  },
  {
    id: 10,
    employee_id: 5,
    employee_name: 'David Brown',
    employee_code: 'EMP005',
    employee_email: 'david.brown@hrms.com',
    payroll_month: '02',
    payroll_year: 2025,
    basic_salary: 70000,
    total_earnings: 90000,
    total_deductions: 16000,
    leave_deductions: 2000,
    net_salary: 72000,
    processed_date: '2025-02-28',
    status: 'Processed',
    payroll_processing_id: 2,
  },
  {
    id: 11,
    employee_id: 6,
    employee_name: 'Emily Davis',
    employee_code: 'EMP006',
    employee_email: 'emily.davis@hrms.com',
    payroll_month: '02',
    payroll_year: 2025,
    basic_salary: 65000,
    total_earnings: 80000,
    total_deductions: 15000,
    leave_deductions: 3000,
    net_salary: 62000,
    processed_date: '2025-02-28',
    status: 'Processed',
    payroll_processing_id: 2,
  },
  {
    id: 12,
    employee_id: 1,
    employee_name: 'John Doe',
    employee_code: 'EMP001',
    employee_email: 'john.doe@hrms.com',
    payroll_month: '03',
    payroll_year: 2025,
    basic_salary: 80000,
    total_earnings: 105000,
    total_deductions: 20000,
    leave_deductions: 2000,
    net_salary: 83000,
    processed_date: '2025-03-31',
    status: 'Paid',
    paid_date: '2025-04-05',
    payroll_processing_id: 3,
  },
  {
    id: 13,
    employee_id: 2,
    employee_name: 'Jane Smith',
    employee_code: 'EMP002',
    employee_email: 'jane.smith@hrms.com',
    payroll_month: '03',
    payroll_year: 2025,
    basic_salary: 90000,
    total_earnings: 120000,
    total_deductions: 24000,
    leave_deductions: 0,
    net_salary: 96000,
    processed_date: '2025-03-31',
    status: 'Paid',
    paid_date: '2025-04-05',
    payroll_processing_id: 3,
  },
  {
    id: 14,
    employee_id: 3,
    employee_name: 'Mike Johnson',
    employee_code: 'EMP003',
    employee_email: 'mike.johnson@hrms.com',
    payroll_month: '03',
    payroll_year: 2025,
    basic_salary: 75000,
    total_earnings: 95000,
    total_deductions: 18000,
    leave_deductions: 4000,
    net_salary: 73000,
    processed_date: '2025-03-31',
    status: 'Paid',
    paid_date: '2025-04-05',
    payroll_processing_id: 3,
  },
  {
    id: 15,
    employee_id: 4,
    employee_name: 'Sarah Williams',
    employee_code: 'EMP004',
    employee_email: 'sarah.williams@hrms.com',
    payroll_month: '03',
    payroll_year: 2025,
    basic_salary: 85000,
    total_earnings: 110000,
    total_deductions: 22000,
    leave_deductions: 3000,
    net_salary: 85000,
    processed_date: '2025-03-31',
    status: 'Paid',
    paid_date: '2025-04-05',
    payroll_processing_id: 3,
  },
  {
    id: 16,
    employee_id: 5,
    employee_name: 'David Brown',
    employee_code: 'EMP005',
    employee_email: 'david.brown@hrms.com',
    payroll_month: '03',
    payroll_year: 2025,
    basic_salary: 70000,
    total_earnings: 90000,
    total_deductions: 16000,
    leave_deductions: 5000,
    net_salary: 69000,
    processed_date: '2025-03-31',
    status: 'Paid',
    paid_date: '2025-04-05',
    payroll_processing_id: 3,
  },
  {
    id: 17,
    employee_id: 6,
    employee_name: 'Emily Davis',
    employee_code: 'EMP006',
    employee_email: 'emily.davis@hrms.com',
    payroll_month: '03',
    payroll_year: 2025,
    basic_salary: 65000,
    total_earnings: 80000,
    total_deductions: 15000,
    leave_deductions: 2000,
    net_salary: 63000,
    processed_date: '2025-03-31',
    status: 'Paid',
    paid_date: '2025-04-05',
    payroll_processing_id: 3,
  },
  {
    id: 18,
    employee_id: 7,
    employee_name: 'Robert Wilson',
    employee_code: 'EMP007',
    employee_email: 'robert.wilson@hrms.com',
    payroll_month: '03',
    payroll_year: 2025,
    basic_salary: 72000,
    total_earnings: 92000,
    total_deductions: 17000,
    leave_deductions: 2000,
    net_salary: 73000,
    processed_date: '2025-03-31',
    status: 'Paid',
    paid_date: '2025-04-05',
    payroll_processing_id: 3,
  },
  {
    id: 19,
    employee_id: 1,
    employee_name: 'John Doe',
    employee_code: 'EMP001',
    employee_email: 'john.doe@hrms.com',
    payroll_month: '04',
    payroll_year: 2025,
    basic_salary: 80000,
    total_earnings: 105000,
    total_deductions: 20000,
    leave_deductions: 0,
    net_salary: 85000,
    processed_date: '2025-04-30',
    status: 'Processed',
    payroll_processing_id: 4,
  },
  {
    id: 20,
    employee_id: 2,
    employee_name: 'Jane Smith',
    employee_code: 'EMP002',
    employee_email: 'jane.smith@hrms.com',
    payroll_month: '04',
    payroll_year: 2025,
    basic_salary: 90000,
    total_earnings: 120000,
    total_deductions: 24000,
    leave_deductions: 2000,
    net_salary: 94000,
    processed_date: '2025-04-30',
    status: 'Processed',
    payroll_processing_id: 4,
  },
  {
    id: 21,
    employee_id: 3,
    employee_name: 'Mike Johnson',
    employee_code: 'EMP003',
    employee_email: 'mike.johnson@hrms.com',
    payroll_month: '04',
    payroll_year: 2025,
    basic_salary: 75000,
    total_earnings: 95000,
    total_deductions: 18000,
    leave_deductions: 3000,
    net_salary: 74000,
    processed_date: '2025-04-30',
    status: 'Processed',
    payroll_processing_id: 4,
  },
  {
    id: 22,
    employee_id: 4,
    employee_name: 'Sarah Williams',
    employee_code: 'EMP004',
    employee_email: 'sarah.williams@hrms.com',
    payroll_month: '04',
    payroll_year: 2025,
    basic_salary: 85000,
    total_earnings: 110000,
    total_deductions: 22000,
    leave_deductions: 0,
    net_salary: 88000,
    processed_date: '2025-04-30',
    status: 'Processed',
    payroll_processing_id: 4,
  },
  {
    id: 23,
    employee_id: 5,
    employee_name: 'David Brown',
    employee_code: 'EMP005',
    employee_email: 'david.brown@hrms.com',
    payroll_month: '04',
    payroll_year: 2025,
    basic_salary: 70000,
    total_earnings: 90000,
    total_deductions: 16000,
    leave_deductions: 3000,
    net_salary: 71000,
    processed_date: '2025-04-30',
    status: 'Processed',
    payroll_processing_id: 4,
  },
  {
    id: 24,
    employee_id: 6,
    employee_name: 'Emily Davis',
    employee_code: 'EMP006',
    employee_email: 'emily.davis@hrms.com',
    payroll_month: '04',
    payroll_year: 2025,
    basic_salary: 65000,
    total_earnings: 80000,
    total_deductions: 15000,
    leave_deductions: 2000,
    net_salary: 63000,
    processed_date: '2025-04-30',
    status: 'Processed',
    payroll_processing_id: 4,
  },
  {
    id: 25,
    employee_id: 1,
    employee_name: 'John Doe',
    employee_code: 'EMP001',
    employee_email: 'john.doe@hrms.com',
    payroll_month: '05',
    payroll_year: 2025,
    basic_salary: 80000,
    total_earnings: 105000,
    total_deductions: 20000,
    leave_deductions: 0,
    net_salary: 85000,
    processed_date: '2025-05-31',
    status: 'Draft',
    payroll_processing_id: 5,
  },
  {
    id: 26,
    employee_id: 2,
    employee_name: 'Jane Smith',
    employee_code: 'EMP002',
    employee_email: 'jane.smith@hrms.com',
    payroll_month: '05',
    payroll_year: 2025,
    basic_salary: 90000,
    total_earnings: 120000,
    total_deductions: 24000,
    leave_deductions: 2000,
    net_salary: 94000,
    processed_date: '2025-05-31',
    status: 'Draft',
    payroll_processing_id: 5,
  },
  {
    id: 27,
    employee_id: 3,
    employee_name: 'Mike Johnson',
    employee_code: 'EMP003',
    employee_email: 'mike.johnson@hrms.com',
    payroll_month: '05',
    payroll_year: 2025,
    basic_salary: 75000,
    total_earnings: 95000,
    total_deductions: 18000,
    leave_deductions: 3000,
    net_salary: 74000,
    processed_date: '2025-05-31',
    status: 'Draft',
    payroll_processing_id: 5,
  },
  {
    id: 28,
    employee_id: 4,
    employee_name: 'Sarah Williams',
    employee_code: 'EMP004',
    employee_email: 'sarah.williams@hrms.com',
    payroll_month: '05',
    payroll_year: 2025,
    basic_salary: 85000,
    total_earnings: 110000,
    total_deductions: 22000,
    leave_deductions: 0,
    net_salary: 88000,
    processed_date: '2025-05-31',
    status: 'Draft',
    payroll_processing_id: 5,
  },
  {
    id: 29,
    employee_id: 5,
    employee_name: 'David Brown',
    employee_code: 'EMP005',
    employee_email: 'david.brown@hrms.com',
    payroll_month: '05',
    payroll_year: 2025,
    basic_salary: 70000,
    total_earnings: 90000,
    total_deductions: 16000,
    leave_deductions: 3000,
    net_salary: 71000,
    processed_date: '2025-05-31',
    status: 'Draft',
    payroll_processing_id: 5,
  },
  {
    id: 30,
    employee_id: 1,
    employee_name: 'John Doe',
    employee_code: 'EMP001',
    employee_email: 'john.doe@hrms.com',
    payroll_month: '06',
    payroll_year: 2025,
    basic_salary: 80000,
    total_earnings: 105000,
    total_deductions: 20000,
    leave_deductions: 5000,
    net_salary: 80000,
    processed_date: '2025-06-30',
    status: 'Paid',
    paid_date: '2025-07-05',
    payroll_processing_id: 6,
  },
  {
    id: 31,
    employee_id: 2,
    employee_name: 'Jane Smith',
    employee_code: 'EMP002',
    employee_email: 'jane.smith@hrms.com',
    payroll_month: '06',
    payroll_year: 2025,
    basic_salary: 90000,
    total_earnings: 120000,
    total_deductions: 24000,
    leave_deductions: 0,
    net_salary: 96000,
    processed_date: '2025-06-30',
    status: 'Paid',
    paid_date: '2025-07-05',
    payroll_processing_id: 6,
  },
  {
    id: 32,
    employee_id: 3,
    employee_name: 'Mike Johnson',
    employee_code: 'EMP003',
    employee_email: 'mike.johnson@hrms.com',
    payroll_month: '06',
    payroll_year: 2025,
    basic_salary: 75000,
    total_earnings: 95000,
    total_deductions: 18000,
    leave_deductions: 4000,
    net_salary: 73000,
    processed_date: '2025-06-30',
    status: 'Paid',
    paid_date: '2025-07-05',
    payroll_processing_id: 6,
  },
  {
    id: 33,
    employee_id: 4,
    employee_name: 'Sarah Williams',
    employee_code: 'EMP004',
    employee_email: 'sarah.williams@hrms.com',
    payroll_month: '06',
    payroll_year: 2025,
    basic_salary: 85000,
    total_earnings: 110000,
    total_deductions: 22000,
    leave_deductions: 2000,
    net_salary: 86000,
    processed_date: '2025-06-30',
    status: 'Paid',
    paid_date: '2025-07-05',
    payroll_processing_id: 6,
  },
  {
    id: 34,
    employee_id: 5,
    employee_name: 'David Brown',
    employee_code: 'EMP005',
    employee_email: 'david.brown@hrms.com',
    payroll_month: '06',
    payroll_year: 2025,
    basic_salary: 70000,
    total_earnings: 90000,
    total_deductions: 16000,
    leave_deductions: 2000,
    net_salary: 72000,
    processed_date: '2025-06-30',
    status: 'Paid',
    paid_date: '2025-07-05',
    payroll_processing_id: 6,
  },
  {
    id: 35,
    employee_id: 6,
    employee_name: 'Emily Davis',
    employee_code: 'EMP006',
    employee_email: 'emily.davis@hrms.com',
    payroll_month: '06',
    payroll_year: 2025,
    basic_salary: 65000,
    total_earnings: 80000,
    total_deductions: 15000,
    leave_deductions: 2000,
    net_salary: 63000,
    processed_date: '2025-06-30',
    status: 'Paid',
    paid_date: '2025-07-05',
    payroll_processing_id: 6,
  },
];

const fetchSalarySlips = async (
  params?: GetSalarySlipsParams
): Promise<ApiResponse<SalarySlip[]>> => {
  await new Promise(resolve => setTimeout(resolve, 500));

  let filtered = [...mockSalarySlips];

  if (params?.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(
      slip =>
        slip.employee_name.toLowerCase().includes(searchLower) ||
        slip.employee_code?.toLowerCase().includes(searchLower) ||
        slip.employee_email?.toLowerCase().includes(searchLower)
    );
  }

  if (params?.employeeId) {
    filtered = filtered.filter(slip => slip.employee_id === params.employeeId);
  }

  if (params?.payrollMonth) {
    filtered = filtered.filter(
      slip => slip.payroll_month === params.payrollMonth
    );
  }

  if (params?.payrollYear) {
    filtered = filtered.filter(
      slip => slip.payroll_year === params.payrollYear
    );
  }

  if (params?.status) {
    filtered = filtered.filter(slip => slip.status === params.status);
  }

  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginated = filtered.slice(startIndex, endIndex);

  const totalPaid = filtered.filter(s => s.status === 'Paid').length;
  const totalProcessed = filtered.filter(s => s.status === 'Processed').length;
  const totalDraft = filtered.filter(s => s.status === 'Draft').length;
  const totalNetSalary = filtered
    .filter(s => s.status === 'Paid')
    .reduce((sum, s) => sum + s.net_salary, 0);

  return {
    success: true,
    message: 'Salary slips fetched successfully',
    data: paginated,
    meta: {
      total_count: filtered.length,
      current_page: page,
      total_pages: Math.ceil(filtered.length / limit),
    },
    stats: {
      total_paid: totalPaid,
      total_processed: totalProcessed,
      total_draft: totalDraft,
      total_net_salary: totalNetSalary,
    } as any,
  };
};

export const salarySlipsKeys = {
  all: ['salarySlips'] as const,
  lists: () => [...salarySlipsKeys.all, 'list'] as const,
  list: (params?: GetSalarySlipsParams) =>
    [...salarySlipsKeys.lists(), params] as const,
  details: () => [...salarySlipsKeys.all, 'detail'] as const,
  detail: (id: number) => [...salarySlipsKeys.details(), id] as const,
};

export const useSalarySlips = (
  params?: GetSalarySlipsParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<SalarySlip[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: salarySlipsKeys.list(params),
    queryFn: () => fetchSalarySlips(params),
    staleTime: 1 * 60 * 1000,
    ...options,
  });
};

export const useSalarySlipById = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<SalarySlip>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: salarySlipsKeys.detail(id),
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const slip = mockSalarySlips.find(s => s.id === id);
      if (!slip) {
        throw new Error('Salary slip not found');
      }
      return {
        success: true,
        message: 'Salary slip fetched successfully',
        data: slip,
      };
    },
    enabled: !!id && options?.enabled !== false,
    staleTime: 1 * 60 * 1000,
    ...options,
  });
};
