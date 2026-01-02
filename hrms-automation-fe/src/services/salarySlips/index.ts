export interface EmployeeInfo {
  id: number;
  name: string;
  email: string;
  employee_id: string;
}

export interface SalarySlip {
  id: number;
  payroll_processing_id: number;
  employee_id: number;
  payroll_month: string;
  payroll_year: number;
  basic_salary: number;
  total_earnings: number;
  total_deductions: number;
  leave_deductions: number;
  net_salary: number;
  processed_date?: string | null;
  paid_date?: string | null;
  status: 'Draft' | 'Processed' | 'Paid';
  remarks?: string | null;
  earnings_breakdown?: Array<{
    component: string;
    amount: number;
  }>;
  deductions_breakdown?: Array<{
    component: string;
    amount: number;
  }>;
  employee: EmployeeInfo;
  createdate?: string;
  updatedate?: string | null;
  is_active: 'Y' | 'N';
}

export interface GetSalarySlipsParams {
  search?: string;
  page?: number;
  limit?: number;
  employee_id?: number;
  payroll_month?: string;
  payroll_year?: number;
  status?: SalarySlip['status'];
  isActive?: 'Y' | 'N';
}

export interface ManageSalarySlipPayload {
  payroll_processing_id: number;
  employee_id: number;
  payroll_month: string;
  payroll_year: number;
  basic_salary: number;
  total_earnings: number;
  total_deductions: number;
  leave_deductions: number;
  net_salary: number;
  remarks?: string;
  earnings_breakdown?: Array<{
    component: string;
    amount: number;
  }>;
  deductions_breakdown?: Array<{
    component: string;
    amount: number;
  }>;
}

export interface UpdateSalarySlipPayload extends ManageSalarySlipPayload {
  id: number;
}

export interface SalarySlipsStats {
  total_slips: number;
  total_paid: number;
  total_processed: number;
  total_draft: number;
}

export interface SalarySlipApiMeta {
  requestDuration: number;
  timestamp: string;
  current_page: number;
  total_pages: number;
  total_count: number;
  has_next: boolean;
  has_previous: boolean;
  stats: SalarySlipsStats;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  meta: SalarySlipApiMeta;
  data: T;
}

const MOCK_SALARY_SLIPS: SalarySlip[] = [
  {
    id: 5,
    payroll_processing_id: 1,
    employee_id: 12,
    payroll_month: '12',
    payroll_year: 2025,
    basic_salary: 31200,
    total_earnings: 49400,
    total_deductions: 11544,
    leave_deductions: 816,
    net_salary: 37040,
    processed_date: '2025-12-18T00:00:00.000Z',
    paid_date: null,
    status: 'Processed',
    remarks: null,
    is_active: 'Y',
    createdate: '2025-12-18T17:05:28.728Z',
    updatedate: null,
    employee: {
      id: 12,
      name: 'Jane Employee',
      email: 'employee2@mkx.com',
      employee_id: 'EMP-005',
    },
  },
  {
    id: 4,
    payroll_processing_id: 1,
    employee_id: 11,
    payroll_month: '12',
    payroll_year: 2025,
    basic_salary: 30000,
    total_earnings: 47500,
    total_deductions: 11100,
    leave_deductions: 319,
    net_salary: 36081,
    processed_date: '2025-12-18T00:00:00.000Z',
    paid_date: null,
    status: 'Processed',
    remarks: null,
    is_active: 'Y',
    createdate: '2025-12-18T17:05:28.318Z',
    updatedate: null,
    employee: {
      id: 11,
      name: 'John Employee',
      email: 'employee1@mkx.com',
      employee_id: 'EMP-004',
    },
  },
  {
    id: 3,
    payroll_processing_id: 1,
    employee_id: 10,
    payroll_month: '12',
    payroll_year: 2025,
    basic_salary: 45000,
    total_earnings: 71250,
    total_deductions: 16650,
    leave_deductions: 813,
    net_salary: 53787,
    processed_date: '2025-12-18T00:00:00.000Z',
    paid_date: null,
    status: 'Processed',
    remarks: null,
    is_active: 'Y',
    createdate: '2025-12-18T17:05:27.908Z',
    updatedate: null,
    employee: {
      id: 10,
      name: 'Payroll Manager',
      email: 'payroll.manager@mkx.com',
      employee_id: 'EMP-003',
    },
  },
  {
    id: 2,
    payroll_processing_id: 1,
    employee_id: 9,
    payroll_month: '12',
    payroll_year: 2025,
    basic_salary: 36000,
    total_earnings: 57000,
    total_deductions: 13320,
    leave_deductions: 888,
    net_salary: 42792,
    processed_date: '2025-12-18T00:00:00.000Z',
    paid_date: null,
    status: 'Processed',
    remarks: null,
    is_active: 'Y',
    createdate: '2025-12-18T17:05:27.499Z',
    updatedate: null,
    employee: {
      id: 9,
      name: 'Recruiter',
      email: 'recruiter@mkx.com',
      employee_id: 'EMP-002',
    },
  },
  {
    id: 1,
    payroll_processing_id: 1,
    employee_id: 8,
    payroll_month: '12',
    payroll_year: 2025,
    basic_salary: 48000,
    total_earnings: 76000,
    total_deductions: 17760,
    leave_deductions: 1192,
    net_salary: 57048,
    processed_date: '2025-12-18T00:00:00.000Z',
    paid_date: null,
    status: 'Processed',
    remarks: null,
    is_active: 'Y',
    createdate: '2025-12-18T17:05:27.110Z',
    updatedate: null,
    employee: {
      id: 8,
      name: 'HR Manager',
      email: 'hr.manager@mkx.com',
      employee_id: 'EMP-001',
    },
  },
];

const MOCK_META: SalarySlipApiMeta = {
  requestDuration: 4445,
  timestamp: '2025-12-29T17:46:37.843Z',
  current_page: 1,
  total_pages: 1,
  total_count: 5,
  has_next: false,
  has_previous: false,
  stats: {
    total_slips: 5,
    total_paid: 0,
    total_processed: 5,
    total_draft: 0,
  },
  total: 5,
  page: 1,
  limit: 10,
  totalPages: 1,
};

export const fetchSalarySlips = async (
  _params?: GetSalarySlipsParams
): Promise<ApiResponse<SalarySlip[]>> => {
  return Promise.resolve({
    success: true,
    message: 'Salary slips fetched successfully',
    meta: MOCK_META,
    data: MOCK_SALARY_SLIPS,
  });
};

export const fetchSalarySlipById = async (
  id: number
): Promise<ApiResponse<SalarySlip>> => {
  const slip = MOCK_SALARY_SLIPS.find(slip => slip.id === id);
  if (!slip) {
    throw new Error('Salary slip not found');
  }
  return Promise.resolve({
    success: true,
    message: 'Salary slip fetched successfully',
    meta: MOCK_META,
    data: slip,
  });
};

export const fetchSalarySlipByEmployee = async (
  employeeId: number,
  month?: string,
  year?: number
): Promise<ApiResponse<SalarySlip[]>> => {
  let results = MOCK_SALARY_SLIPS.filter(
    slip => slip.employee_id === employeeId
  );
  if (month) results = results.filter(slip => slip.payroll_month === month);
  if (year) results = results.filter(slip => slip.payroll_year === year);
  return Promise.resolve({
    success: true,
    message: 'Salary slips fetched successfully',
    meta: MOCK_META,
    data: results,
  });
};

export const downloadSalarySlip = async (_id: number): Promise<Blob> => {
  return new Blob([], { type: 'application/pdf' });
};

export const emailSalarySlip = async (
  _id: number
): Promise<ApiResponse<void>> => {
  return Promise.resolve({
    success: true,
    message: 'Salary slip emailed successfully',
    meta: MOCK_META,
    data: undefined as unknown as void,
  });
};

export const createSalarySlip = async (
  data: ManageSalarySlipPayload
): Promise<ApiResponse<SalarySlip>> => {
  const newId =
    MOCK_SALARY_SLIPS.length > 0
      ? Math.max(...MOCK_SALARY_SLIPS.map(s => s.id)) + 1
      : 1;
  const slip: SalarySlip = {
    id: newId,
    payroll_processing_id: data.payroll_processing_id,
    employee_id: data.employee_id,
    payroll_month: data.payroll_month,
    payroll_year: data.payroll_year,
    basic_salary: data.basic_salary,
    total_earnings: data.total_earnings,
    total_deductions: data.total_deductions,
    leave_deductions: data.leave_deductions,
    net_salary: data.net_salary,
    processed_date: new Date().toISOString(),
    paid_date: null,
    status: 'Draft',
    remarks: data.remarks ?? null,
    earnings_breakdown: data.earnings_breakdown,
    deductions_breakdown: data.deductions_breakdown,
    employee: {
      id: data.employee_id,
      name: 'Mock Name',
      email: 'mock@mkx.com',
      employee_id: 'EMP-MOCK',
    },
    createdate: new Date().toISOString(),
    updatedate: null,
    is_active: 'Y',
  };
  MOCK_SALARY_SLIPS.push(slip);
  return Promise.resolve({
    success: true,
    message: 'Salary slip created successfully',
    meta: MOCK_META,
    data: slip,
  });
};

export const updateSalarySlip = async (
  data: UpdateSalarySlipPayload
): Promise<ApiResponse<SalarySlip>> => {
  const index = MOCK_SALARY_SLIPS.findIndex(slip => slip.id === data.id);
  if (index === -1) throw new Error('Salary slip not found');
  const old = MOCK_SALARY_SLIPS[index];
  const updated: SalarySlip = {
    ...old,
    ...data,
    updatedate: new Date().toISOString(),
  };
  MOCK_SALARY_SLIPS[index] = updated;
  return Promise.resolve({
    success: true,
    message: 'Salary slip updated successfully',
    meta: MOCK_META,
    data: updated,
  });
};

export const deleteSalarySlip = async (
  id: number
): Promise<ApiResponse<void>> => {
  const idx = MOCK_SALARY_SLIPS.findIndex(s => s.id === id);
  if (idx !== -1) MOCK_SALARY_SLIPS.splice(idx, 1);
  return Promise.resolve({
    success: true,
    message: 'Salary slip deleted successfully',
    meta: MOCK_META,
    data: undefined as unknown as void,
  });
};

export default {
  fetchSalarySlips,
  fetchSalarySlipById,
  fetchSalarySlipByEmployee,
  downloadSalarySlip,
  emailSalarySlip,
  createSalarySlip,
  updateSalarySlip,
  deleteSalarySlip,
};
