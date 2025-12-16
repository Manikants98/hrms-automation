import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import type { ApiResponse } from '../types/api.types';
import type { SalaryStructure } from './useSalaryStructures';
import type { LeaveApplication } from './useLeaveApplications';

export type PayrollStatus = 'Draft' | 'Processed' | 'Paid' | 'Cancelled';

export interface PayrollProcessingItem {
  id?: number;
  employee_id: number;
  employee_name: string;
  employee_code?: string;
  employee_email?: string;
  basic_salary: number;
  total_earnings: number;
  total_deductions: number;
  leave_deductions: number;
  net_salary: number;
  processed_date?: string;
  paid_date?: string;
  status: PayrollStatus;
  remarks?: string;
}

export interface PayrollProcessing {
  id: number;
  payroll_month: string;
  payroll_year: number;
  processing_date: string;
  status: PayrollStatus;
  total_employees: number;
  total_earnings: number;
  total_deductions: number;
  total_leave_deductions: number;
  total_net_salary: number;
  processed_by?: number;
  processed_by_name?: string;
  items: PayrollProcessingItem[];
  createdate?: string;
  updatedate?: string;
}

export interface GetPayrollProcessingParams {
  search?: string;
  page?: number;
  limit?: number;
  payrollMonth?: string;
  payrollYear?: number;
  status?: PayrollStatus;
  employeeId?: number;
}

export interface ProcessPayrollPayload {
  payroll_month: string;
  payroll_year: number;
  employee_ids?: number[];
  process_all?: boolean;
}

export interface UpdatePayrollItemPayload {
  id: number;
  status: PayrollStatus;
  paid_date?: string;
  remarks?: string;
}

const mockPayrollProcessing: PayrollProcessing[] = [
  {
    id: 1,
    payroll_month: '01',
    payroll_year: 2025,
    processing_date: '2025-01-31',
    status: 'Paid',
    total_employees: 5,
    total_earnings: 550000,
    total_deductions: 110000,
    total_leave_deductions: 15000,
    total_net_salary: 425000,
    processed_by: 1,
    processed_by_name: 'HR Manager',
    items: [
      {
        id: 1,
        employee_id: 1,
        employee_name: 'John Doe',
        employee_code: 'EMP001',
        employee_email: 'john.doe@hrms.com',
        basic_salary: 80000,
        total_earnings: 105000,
        total_deductions: 20000,
        leave_deductions: 0,
        net_salary: 85000,
        processed_date: '2025-01-31',
        status: 'Paid',
      },
      {
        id: 2,
        employee_id: 2,
        employee_name: 'Jane Smith',
        employee_code: 'EMP002',
        employee_email: 'jane.smith@hrms.com',
        basic_salary: 90000,
        total_earnings: 120000,
        total_deductions: 24000,
        leave_deductions: 5000,
        net_salary: 91000,
        processed_date: '2025-01-31',
        status: 'Paid',
      },
      {
        id: 3,
        employee_id: 3,
        employee_name: 'Mike Johnson',
        employee_code: 'EMP003',
        employee_email: 'mike.johnson@hrms.com',
        basic_salary: 75000,
        total_earnings: 95000,
        total_deductions: 18000,
        leave_deductions: 3000,
        net_salary: 74000,
        processed_date: '2025-01-31',
        status: 'Paid',
      },
      {
        id: 4,
        employee_id: 4,
        employee_name: 'Sarah Williams',
        employee_code: 'EMP004',
        employee_email: 'sarah.williams@hrms.com',
        basic_salary: 85000,
        total_earnings: 110000,
        total_deductions: 22000,
        leave_deductions: 2000,
        net_salary: 86000,
        processed_date: '2025-01-31',
        status: 'Paid',
      },
      {
        id: 5,
        employee_id: 5,
        employee_name: 'David Brown',
        employee_code: 'EMP005',
        employee_email: 'david.brown@hrms.com',
        basic_salary: 70000,
        total_earnings: 90000,
        total_deductions: 16000,
        leave_deductions: 5000,
        net_salary: 69000,
        processed_date: '2025-01-31',
        status: 'Paid',
      },
    ],
    createdate: '2025-01-31T10:00:00Z',
    updatedate: '2025-01-31T10:00:00Z',
  },
  {
    id: 2,
    payroll_month: '02',
    payroll_year: 2025,
    processing_date: '2025-02-28',
    status: 'Processed',
    total_employees: 6,
    total_earnings: 660000,
    total_deductions: 132000,
    total_leave_deductions: 12000,
    total_net_salary: 516000,
    processed_by: 1,
    processed_by_name: 'HR Manager',
    items: [
      {
        id: 6,
        employee_id: 1,
        employee_name: 'John Doe',
        employee_code: 'EMP001',
        employee_email: 'john.doe@hrms.com',
        basic_salary: 80000,
        total_earnings: 105000,
        total_deductions: 20000,
        leave_deductions: 0,
        net_salary: 85000,
        processed_date: '2025-02-28',
        status: 'Processed',
      },
      {
        id: 7,
        employee_id: 2,
        employee_name: 'Jane Smith',
        employee_code: 'EMP002',
        employee_email: 'jane.smith@hrms.com',
        basic_salary: 90000,
        total_earnings: 120000,
        total_deductions: 24000,
        leave_deductions: 3000,
        net_salary: 93000,
        processed_date: '2025-02-28',
        status: 'Processed',
      },
      {
        id: 8,
        employee_id: 3,
        employee_name: 'Mike Johnson',
        employee_code: 'EMP003',
        employee_email: 'mike.johnson@hrms.com',
        basic_salary: 75000,
        total_earnings: 95000,
        total_deductions: 18000,
        leave_deductions: 0,
        net_salary: 77000,
        processed_date: '2025-02-28',
        status: 'Processed',
      },
      {
        id: 9,
        employee_id: 4,
        employee_name: 'Sarah Williams',
        employee_code: 'EMP004',
        employee_email: 'sarah.williams@hrms.com',
        basic_salary: 85000,
        total_earnings: 110000,
        total_deductions: 22000,
        leave_deductions: 4000,
        net_salary: 84000,
        processed_date: '2025-02-28',
        status: 'Processed',
      },
      {
        id: 10,
        employee_id: 5,
        employee_name: 'David Brown',
        employee_code: 'EMP005',
        employee_email: 'david.brown@hrms.com',
        basic_salary: 70000,
        total_earnings: 90000,
        total_deductions: 16000,
        leave_deductions: 2000,
        net_salary: 72000,
        processed_date: '2025-02-28',
        status: 'Processed',
      },
      {
        id: 11,
        employee_id: 6,
        employee_name: 'Emily Davis',
        employee_code: 'EMP006',
        employee_email: 'emily.davis@hrms.com',
        basic_salary: 65000,
        total_earnings: 80000,
        total_deductions: 15000,
        leave_deductions: 3000,
        net_salary: 62000,
        processed_date: '2025-02-28',
        status: 'Processed',
      },
    ],
    createdate: '2025-02-28T10:00:00Z',
    updatedate: '2025-02-28T10:00:00Z',
  },
  {
    id: 3,
    payroll_month: '03',
    payroll_year: 2025,
    processing_date: '2025-03-31',
    status: 'Paid',
    total_employees: 7,
    total_earnings: 770000,
    total_deductions: 154000,
    total_leave_deductions: 18000,
    total_net_salary: 598000,
    processed_by: 1,
    processed_by_name: 'HR Manager',
    items: [
      {
        id: 12,
        employee_id: 1,
        employee_name: 'John Doe',
        employee_code: 'EMP001',
        employee_email: 'john.doe@hrms.com',
        basic_salary: 80000,
        total_earnings: 105000,
        total_deductions: 20000,
        leave_deductions: 2000,
        net_salary: 83000,
        processed_date: '2025-03-31',
        status: 'Paid',
      },
      {
        id: 13,
        employee_id: 2,
        employee_name: 'Jane Smith',
        employee_code: 'EMP002',
        employee_email: 'jane.smith@hrms.com',
        basic_salary: 90000,
        total_earnings: 120000,
        total_deductions: 24000,
        leave_deductions: 0,
        net_salary: 96000,
        processed_date: '2025-03-31',
        status: 'Paid',
      },
      {
        id: 14,
        employee_id: 3,
        employee_name: 'Mike Johnson',
        employee_code: 'EMP003',
        employee_email: 'mike.johnson@hrms.com',
        basic_salary: 75000,
        total_earnings: 95000,
        total_deductions: 18000,
        leave_deductions: 4000,
        net_salary: 73000,
        processed_date: '2025-03-31',
        status: 'Paid',
      },
      {
        id: 15,
        employee_id: 4,
        employee_name: 'Sarah Williams',
        employee_code: 'EMP004',
        employee_email: 'sarah.williams@hrms.com',
        basic_salary: 85000,
        total_earnings: 110000,
        total_deductions: 22000,
        leave_deductions: 3000,
        net_salary: 85000,
        processed_date: '2025-03-31',
        status: 'Paid',
      },
      {
        id: 16,
        employee_id: 5,
        employee_name: 'David Brown',
        employee_code: 'EMP005',
        employee_email: 'david.brown@hrms.com',
        basic_salary: 70000,
        total_earnings: 90000,
        total_deductions: 16000,
        leave_deductions: 5000,
        net_salary: 69000,
        processed_date: '2025-03-31',
        status: 'Paid',
      },
      {
        id: 17,
        employee_id: 6,
        employee_name: 'Emily Davis',
        employee_code: 'EMP006',
        employee_email: 'emily.davis@hrms.com',
        basic_salary: 65000,
        total_earnings: 80000,
        total_deductions: 15000,
        leave_deductions: 2000,
        net_salary: 63000,
        processed_date: '2025-03-31',
        status: 'Paid',
      },
      {
        id: 18,
        employee_id: 7,
        employee_name: 'Robert Wilson',
        employee_code: 'EMP007',
        employee_email: 'robert.wilson@hrms.com',
        basic_salary: 72000,
        total_earnings: 92000,
        total_deductions: 17000,
        leave_deductions: 2000,
        net_salary: 73000,
        processed_date: '2025-03-31',
        status: 'Paid',
      },
    ],
    createdate: '2025-03-31T10:00:00Z',
    updatedate: '2025-03-31T10:00:00Z',
  },
  {
    id: 4,
    payroll_month: '04',
    payroll_year: 2025,
    processing_date: '2025-04-30',
    status: 'Processed',
    total_employees: 6,
    total_earnings: 660000,
    total_deductions: 132000,
    total_leave_deductions: 10000,
    total_net_salary: 518000,
    processed_by: 1,
    processed_by_name: 'HR Manager',
    items: [
      {
        id: 19,
        employee_id: 1,
        employee_name: 'John Doe',
        employee_code: 'EMP001',
        employee_email: 'john.doe@hrms.com',
        basic_salary: 80000,
        total_earnings: 105000,
        total_deductions: 20000,
        leave_deductions: 0,
        net_salary: 85000,
        processed_date: '2025-04-30',
        status: 'Processed',
      },
      {
        id: 20,
        employee_id: 2,
        employee_name: 'Jane Smith',
        employee_code: 'EMP002',
        employee_email: 'jane.smith@hrms.com',
        basic_salary: 90000,
        total_earnings: 120000,
        total_deductions: 24000,
        leave_deductions: 2000,
        net_salary: 94000,
        processed_date: '2025-04-30',
        status: 'Processed',
      },
      {
        id: 21,
        employee_id: 3,
        employee_name: 'Mike Johnson',
        employee_code: 'EMP003',
        employee_email: 'mike.johnson@hrms.com',
        basic_salary: 75000,
        total_earnings: 95000,
        total_deductions: 18000,
        leave_deductions: 3000,
        net_salary: 74000,
        processed_date: '2025-04-30',
        status: 'Processed',
      },
      {
        id: 22,
        employee_id: 4,
        employee_name: 'Sarah Williams',
        employee_code: 'EMP004',
        employee_email: 'sarah.williams@hrms.com',
        basic_salary: 85000,
        total_earnings: 110000,
        total_deductions: 22000,
        leave_deductions: 0,
        net_salary: 88000,
        processed_date: '2025-04-30',
        status: 'Processed',
      },
      {
        id: 23,
        employee_id: 5,
        employee_name: 'David Brown',
        employee_code: 'EMP005',
        employee_email: 'david.brown@hrms.com',
        basic_salary: 70000,
        total_earnings: 90000,
        total_deductions: 16000,
        leave_deductions: 3000,
        net_salary: 71000,
        processed_date: '2025-04-30',
        status: 'Processed',
      },
      {
        id: 24,
        employee_id: 6,
        employee_name: 'Emily Davis',
        employee_code: 'EMP006',
        employee_email: 'emily.davis@hrms.com',
        basic_salary: 65000,
        total_earnings: 80000,
        total_deductions: 15000,
        leave_deductions: 2000,
        net_salary: 63000,
        processed_date: '2025-04-30',
        status: 'Processed',
      },
    ],
    createdate: '2025-04-30T10:00:00Z',
    updatedate: '2025-04-30T10:00:00Z',
  },
  {
    id: 5,
    payroll_month: '05',
    payroll_year: 2025,
    processing_date: '2025-05-31',
    status: 'Draft',
    total_employees: 5,
    total_earnings: 550000,
    total_deductions: 110000,
    total_leave_deductions: 8000,
    total_net_salary: 432000,
    processed_by: 1,
    processed_by_name: 'HR Manager',
    items: [
      {
        id: 25,
        employee_id: 1,
        employee_name: 'John Doe',
        employee_code: 'EMP001',
        employee_email: 'john.doe@hrms.com',
        basic_salary: 80000,
        total_earnings: 105000,
        total_deductions: 20000,
        leave_deductions: 0,
        net_salary: 85000,
        processed_date: '2025-05-31',
        status: 'Draft',
      },
      {
        id: 26,
        employee_id: 2,
        employee_name: 'Jane Smith',
        employee_code: 'EMP002',
        employee_email: 'jane.smith@hrms.com',
        basic_salary: 90000,
        total_earnings: 120000,
        total_deductions: 24000,
        leave_deductions: 2000,
        net_salary: 94000,
        processed_date: '2025-05-31',
        status: 'Draft',
      },
      {
        id: 27,
        employee_id: 3,
        employee_name: 'Mike Johnson',
        employee_code: 'EMP003',
        employee_email: 'mike.johnson@hrms.com',
        basic_salary: 75000,
        total_earnings: 95000,
        total_deductions: 18000,
        leave_deductions: 3000,
        net_salary: 74000,
        processed_date: '2025-05-31',
        status: 'Draft',
      },
      {
        id: 28,
        employee_id: 4,
        employee_name: 'Sarah Williams',
        employee_code: 'EMP004',
        employee_email: 'sarah.williams@hrms.com',
        basic_salary: 85000,
        total_earnings: 110000,
        total_deductions: 22000,
        leave_deductions: 0,
        net_salary: 88000,
        processed_date: '2025-05-31',
        status: 'Draft',
      },
      {
        id: 29,
        employee_id: 5,
        employee_name: 'David Brown',
        employee_code: 'EMP005',
        employee_email: 'david.brown@hrms.com',
        basic_salary: 70000,
        total_earnings: 90000,
        total_deductions: 16000,
        leave_deductions: 3000,
        net_salary: 71000,
        processed_date: '2025-05-31',
        status: 'Draft',
      },
    ],
    createdate: '2025-05-31T10:00:00Z',
    updatedate: '2025-05-31T10:00:00Z',
  },
  {
    id: 6,
    payroll_month: '06',
    payroll_year: 2025,
    processing_date: '2025-06-30',
    status: 'Paid',
    total_employees: 6,
    total_earnings: 660000,
    total_deductions: 132000,
    total_leave_deductions: 15000,
    total_net_salary: 513000,
    processed_by: 1,
    processed_by_name: 'HR Manager',
    items: [
      {
        id: 30,
        employee_id: 1,
        employee_name: 'John Doe',
        employee_code: 'EMP001',
        employee_email: 'john.doe@hrms.com',
        basic_salary: 80000,
        total_earnings: 105000,
        total_deductions: 20000,
        leave_deductions: 5000,
        net_salary: 80000,
        processed_date: '2025-06-30',
        status: 'Paid',
      },
      {
        id: 31,
        employee_id: 2,
        employee_name: 'Jane Smith',
        employee_code: 'EMP002',
        employee_email: 'jane.smith@hrms.com',
        basic_salary: 90000,
        total_earnings: 120000,
        total_deductions: 24000,
        leave_deductions: 0,
        net_salary: 96000,
        processed_date: '2025-06-30',
        status: 'Paid',
      },
      {
        id: 32,
        employee_id: 3,
        employee_name: 'Mike Johnson',
        employee_code: 'EMP003',
        employee_email: 'mike.johnson@hrms.com',
        basic_salary: 75000,
        total_earnings: 95000,
        total_deductions: 18000,
        leave_deductions: 4000,
        net_salary: 73000,
        processed_date: '2025-06-30',
        status: 'Paid',
      },
      {
        id: 33,
        employee_id: 4,
        employee_name: 'Sarah Williams',
        employee_code: 'EMP004',
        employee_email: 'sarah.williams@hrms.com',
        basic_salary: 85000,
        total_earnings: 110000,
        total_deductions: 22000,
        leave_deductions: 2000,
        net_salary: 86000,
        processed_date: '2025-06-30',
        status: 'Paid',
      },
      {
        id: 34,
        employee_id: 5,
        employee_name: 'David Brown',
        employee_code: 'EMP005',
        employee_email: 'david.brown@hrms.com',
        basic_salary: 70000,
        total_earnings: 90000,
        total_deductions: 16000,
        leave_deductions: 2000,
        net_salary: 72000,
        processed_date: '2025-06-30',
        status: 'Paid',
      },
      {
        id: 35,
        employee_id: 6,
        employee_name: 'Emily Davis',
        employee_code: 'EMP006',
        employee_email: 'emily.davis@hrms.com',
        basic_salary: 65000,
        total_earnings: 80000,
        total_deductions: 15000,
        leave_deductions: 2000,
        net_salary: 63000,
        processed_date: '2025-06-30',
        status: 'Paid',
      },
    ],
    createdate: '2025-06-30T10:00:00Z',
    updatedate: '2025-06-30T10:00:00Z',
  },
];

let mockData = [...mockPayrollProcessing];
let nextId = Math.max(...mockData.map(p => p.id), 0) + 1;

const calculateLeaveDeduction = (
  employeeId: number,
  salaryStructure: SalaryStructure | undefined,
  leaveApplications: LeaveApplication[],
  payrollMonth: string,
  payrollYear: number
): number => {
  if (!salaryStructure) return 0;

  const basicSalary =
    salaryStructure.structure_items.find(
      item => item.structure_type === 'Basic Salary'
    )?.value || 0;

  if (basicSalary === 0) return 0;

  const monthStart = `${payrollYear}-${payrollMonth}-01`;
  const monthEnd = `${payrollYear}-${payrollMonth}-31`;

  const relevantLeaves = leaveApplications.filter(
    leave =>
      leave.employee_id === employeeId &&
      leave.approval_status === 'Approved' &&
      leave.start_date <= monthEnd &&
      leave.end_date >= monthStart &&
      (leave.leave_type === 'Unpaid' ||
        leave.leave_type === 'Casual' ||
        leave.leave_type === 'Sick')
  );

  const workingDaysInMonth = 22;
  let totalLeaveDays = 0;

  relevantLeaves.forEach(leave => {
    const leaveStart = new Date(
      Math.max(
        new Date(leave.start_date).getTime(),
        new Date(monthStart).getTime()
      )
    );
    const leaveEnd = new Date(
      Math.min(new Date(leave.end_date).getTime(), new Date(monthEnd).getTime())
    );
    const daysDiff =
      Math.floor(
        (leaveEnd.getTime() - leaveStart.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
    totalLeaveDays += daysDiff;
  });

  const dailySalary = basicSalary / workingDaysInMonth;
  return Math.round(dailySalary * totalLeaveDays);
};

const fetchPayrollProcessing = async (
  params?: GetPayrollProcessingParams
): Promise<ApiResponse<PayrollProcessing[]>> => {
  await new Promise(resolve => setTimeout(resolve, 500));

  let filtered = [...mockData];

  if (params?.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(
      payroll =>
        payroll.payroll_month.toLowerCase().includes(searchLower) ||
        payroll.processed_by_name?.toLowerCase().includes(searchLower) ||
        payroll.items.some(
          item =>
            item.employee_name.toLowerCase().includes(searchLower) ||
            item.employee_code?.toLowerCase().includes(searchLower)
        )
    );
  }

  if (params?.payrollMonth) {
    filtered = filtered.filter(
      payroll => payroll.payroll_month === params.payrollMonth
    );
  }

  if (params?.payrollYear) {
    filtered = filtered.filter(
      payroll => payroll.payroll_year === params.payrollYear
    );
  }

  if (params?.status) {
    filtered = filtered.filter(payroll => payroll.status === params.status);
  }

  if (params?.employeeId) {
    filtered = filtered.filter(payroll =>
      payroll.items.some(item => item.employee_id === params.employeeId)
    );
  }

  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginated = filtered.slice(startIndex, endIndex);

  const totalProcessed = filtered.length;
  const totalPaid = filtered.filter(p => p.status === 'Paid').length;
  const totalDraft = filtered.filter(p => p.status === 'Draft').length;
  const totalNetSalary = filtered.reduce(
    (sum, p) => sum + p.total_net_salary,
    0
  );

  return {
    success: true,
    message: 'Payroll processing records fetched successfully',
    data: paginated,
    meta: {
      total_count: filtered.length,
      current_page: page,
      total_pages: Math.ceil(filtered.length / limit),
    },
    stats: {
      total_processed: totalProcessed,
      total_paid: totalPaid,
      total_draft: totalDraft,
      total_net_salary: totalNetSalary,
    } as any,
  };
};

const fetchPayrollProcessingById = async (
  id: number
): Promise<ApiResponse<PayrollProcessing>> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const payroll = mockData.find(p => p.id === id);
  if (!payroll) {
    throw new Error('Payroll processing record not found');
  }
  return {
    success: true,
    message: 'Payroll processing record fetched successfully',
    data: payroll,
  };
};

const processPayroll = async (
  payload: ProcessPayrollPayload
): Promise<ApiResponse<PayrollProcessing>> => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const mockEmployees = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@hrms.com',
      employee_id: 'EMP001',
      is_active: 'Y' as const,
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@hrms.com',
      employee_id: 'EMP002',
      is_active: 'Y' as const,
    },
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
    },
  ];

  const mockLeaveApplications: LeaveApplication[] = [
    {
      id: 1,
      employee_id: 1,
      employee_name: 'John Doe',
      employee_email: 'john.doe@hrms.com',
      leave_type: 'Annual',
      start_date: '2025-02-01',
      end_date: '2025-02-05',
      total_days: 5,
      reason: 'Family vacation',
      approval_status: 'Approved',
    },
    {
      id: 2,
      employee_id: 2,
      employee_name: 'Jane Smith',
      employee_email: 'jane.smith@hrms.com',
      leave_type: 'Sick',
      start_date: '2025-01-20',
      end_date: '2025-01-21',
      total_days: 2,
      reason: 'Medical appointment',
      approval_status: 'Approved',
    },
    {
      id: 3,
      employee_id: 2,
      employee_name: 'Jane Smith',
      employee_email: 'jane.smith@hrms.com',
      leave_type: 'Casual',
      start_date: '2025-01-25',
      end_date: '2025-01-25',
      total_days: 1,
      reason: 'Personal work',
      approval_status: 'Approved',
    },
  ];

  const employeesToProcess = payload.process_all
    ? mockEmployees.filter(emp => emp.is_active === 'Y')
    : mockEmployees.filter(
        emp => emp.is_active === 'Y' && payload.employee_ids?.includes(emp.id)
      );

  const payrollItems: PayrollProcessingItem[] = [];
  let totalEarnings = 0;
  let totalDeductions = 0;
  let totalLeaveDeductions = 0;
  let nextItemId = 1;

  employeesToProcess.forEach(employee => {
    const salaryStructure = mockSalaryStructures.find(
      s => s.employee_id === employee.id && s.status === 'Active'
    );

    if (!salaryStructure) {
      return;
    }

    const earnings = salaryStructure.structure_items
      .filter(item => item.category === 'Earnings')
      .reduce((sum, item) => sum + Number(item.value || 0), 0);

    const deductions = salaryStructure.structure_items
      .filter(item => item.category === 'Deductions')
      .reduce((sum, item) => sum + Number(item.value || 0), 0);

    const basicSalary =
      salaryStructure.structure_items.find(
        item => item.structure_type === 'Basic Salary'
      )?.value || 0;

    const leaveDeductions = calculateLeaveDeduction(
      employee.id,
      salaryStructure,
      mockLeaveApplications,
      payload.payroll_month,
      payload.payroll_year
    );

    const netSalary = earnings - deductions - leaveDeductions;

    payrollItems.push({
      id: nextItemId++,
      employee_id: employee.id,
      employee_name: employee.name,
      employee_code: employee.employee_id || '',
      employee_email: employee.email,
      basic_salary: Number(basicSalary),
      total_earnings: earnings,
      total_deductions: deductions,
      leave_deductions: leaveDeductions,
      net_salary: netSalary,
      processed_date: new Date().toISOString().split('T')[0],
      status: 'Processed',
    });

    totalEarnings += earnings;
    totalDeductions += deductions;
    totalLeaveDeductions += leaveDeductions;
  });

  const totalNetSalary = totalEarnings - totalDeductions - totalLeaveDeductions;

  const newPayroll: PayrollProcessing = {
    id: nextId++,
    payroll_month: payload.payroll_month,
    payroll_year: payload.payroll_year,
    processing_date: new Date().toISOString().split('T')[0],
    status: 'Processed',
    total_employees: payrollItems.length,
    total_earnings: totalEarnings,
    total_deductions: totalDeductions,
    total_leave_deductions: totalLeaveDeductions,
    total_net_salary: totalNetSalary,
    processed_by: 1,
    processed_by_name: 'HR Manager',
    items: payrollItems,
    createdate: new Date().toISOString(),
    updatedate: new Date().toISOString(),
  };

  mockData.push(newPayroll);
  return {
    success: true,
    message: 'Payroll processed successfully with leave deductions',
    data: newPayroll,
  };
};

const updatePayrollItem = async (
  payload: UpdatePayrollItemPayload
): Promise<ApiResponse<PayrollProcessingItem>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const payroll = mockData.find(p =>
    p.items.some(item => item.id === payload.id)
  );
  if (!payroll) {
    throw new Error('Payroll item not found');
  }
  const itemIndex = payroll.items.findIndex(item => item.id === payload.id);
  if (itemIndex === -1) {
    throw new Error('Payroll item not found');
  }
  payroll.items[itemIndex] = {
    ...payroll.items[itemIndex],
    ...payload,
  };
  return {
    success: true,
    message: 'Payroll item updated successfully',
    data: payroll.items[itemIndex],
  };
};

const deletePayrollProcessing = async (
  id: number
): Promise<ApiResponse<void>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockData.findIndex(p => p.id === id);
  if (index === -1) {
    throw new Error('Payroll processing record not found');
  }
  mockData.splice(index, 1);
  return {
    success: true,
    message: 'Payroll processing record deleted successfully',
  };
};

export const payrollProcessingKeys = {
  all: ['payrollProcessing'] as const,
  lists: () => [...payrollProcessingKeys.all, 'list'] as const,
  list: (params?: GetPayrollProcessingParams) =>
    [...payrollProcessingKeys.lists(), params] as const,
  details: () => [...payrollProcessingKeys.all, 'detail'] as const,
  detail: (id: number) => [...payrollProcessingKeys.details(), id] as const,
};

export const usePayrollProcessing = (
  params?: GetPayrollProcessingParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<PayrollProcessing[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: payrollProcessingKeys.list(params),
    queryFn: () => fetchPayrollProcessing(params),
    staleTime: 1 * 60 * 1000,
    ...options,
  });
};

export const usePayrollProcessingById = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<PayrollProcessing>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: payrollProcessingKeys.detail(id),
    queryFn: () => fetchPayrollProcessingById(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
    ...options,
  });
};

export const useProcessPayroll = (options?: {
  onSuccess?: (
    data: ApiResponse<PayrollProcessing>,
    variables: ProcessPayrollPayload
  ) => void;
  onError?: (error: any, variables: ProcessPayrollPayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: ProcessPayrollPayload) => processPayroll(payload),
    loadingMessage: 'Processing payroll...',
    invalidateQueries: ['payrollProcessing'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useUpdatePayrollItem = (options?: {
  onSuccess?: (
    data: ApiResponse<PayrollProcessingItem>,
    variables: UpdatePayrollItemPayload
  ) => void;
  onError?: (error: any, variables: UpdatePayrollItemPayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: UpdatePayrollItemPayload) =>
      updatePayrollItem(payload),
    loadingMessage: 'Updating payroll item...',
    invalidateQueries: ['payrollProcessing'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useDeletePayrollProcessing = (options?: {
  onSuccess?: (data: ApiResponse<void>, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  return useApiMutation({
    mutationFn: (id: number) => deletePayrollProcessing(id),
    loadingMessage: 'Deleting payroll processing record...',
    invalidateQueries: ['payrollProcessing'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export { calculateLeaveDeduction };
