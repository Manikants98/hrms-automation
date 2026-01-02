import axiosInstance from '../../configs/axio.config';
import type { ApiResponse } from '../../types/api.types';

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

export interface ManagePayrollProcessingPayload {
  payroll_month: string;
  payroll_year: number;
  status: PayrollStatus;
  items: PayrollProcessingItem[];
}

export interface UpdatePayrollProcessingPayload extends ManagePayrollProcessingPayload {
  id: number;
}

export interface PayPayrollPayload {
  id: number;
  paid_date: string;
}

export const fetchPayrollProcessing = async (
  params?: GetPayrollProcessingParams
): Promise<ApiResponse<PayrollProcessing[]>> => {
  const response = await axiosInstance.get('/payroll-processing', { params });
  // Handle backend response where data is in message field
  const responseData = response.data;
  if (responseData.success && Array.isArray(responseData.message)) {
    return {
      ...responseData,
      data: responseData.message,
      message: responseData.data || 'Payroll processing records fetched successfully'
    };
  }
  return responseData;
};

export const fetchPayrollProcessingById = async (
  id: number
): Promise<ApiResponse<PayrollProcessing>> => {
  const response = await axiosInstance.get(`/payroll-processing/${id}`);
  return response.data;
};

export const processPayroll = async (
  data: ProcessPayrollPayload
): Promise<ApiResponse<PayrollProcessing>> => {
  const response = await axiosInstance.post('/payroll-processing/process', data);
  return response.data;
};

export const updatePayrollItem = async (
  data: UpdatePayrollItemPayload
): Promise<ApiResponse<PayrollProcessingItem>> => {
  const { id, ...payload } = data;
  const response = await axiosInstance.put(`/payroll-processing/item/${id}`, payload);
  return response.data;
};

export const createPayrollProcessing = async (
  data: ManagePayrollProcessingPayload
): Promise<ApiResponse<PayrollProcessing>> => {
  const response = await axiosInstance.post('/payroll-processing', data);
  return response.data;
};

export const updatePayrollProcessing = async (
  data: UpdatePayrollProcessingPayload
): Promise<ApiResponse<PayrollProcessing>> => {
  const { id, ...payload } = data;
  const response = await axiosInstance.put(`/payroll-processing/${id}`, payload);
  return response.data;
};

export const payPayroll = async (
  data: PayPayrollPayload
): Promise<ApiResponse<PayrollProcessing>> => {
  const response = await axiosInstance.post(`/payroll-processing/${data.id}/pay`, { paid_date: data.paid_date });
  return response.data;
};

export const deletePayrollProcessing = async (
  id: number
): Promise<ApiResponse<void>> => {
  const response = await axiosInstance.delete(`/payroll-processing/${id}`);
  return response.data;
};

export const calculateLeaveDeduction = (
  employeeId: number,
  salaryStructure: any,
  leaveApplications: any[],
  month: string,
  year: number
): number => {
  // Filter leave applications for the specific employee and month/year
  const employeeLeaveApplications = leaveApplications.filter(
    (app: any) =>
      app.employee_id === employeeId &&
      app.status === 'Approved' &&
      app.leave_date &&
      new Date(app.leave_date).getMonth() + 1 === parseInt(month.split('-')[1]) &&
      new Date(app.leave_date).getFullYear() === year
  );

  // Calculate total leave days
  const totalLeaveDays = employeeLeaveApplications.reduce(
    (sum: number, app: any) => sum + (app.days || 1),
    0
  );

  // Get basic salary from salary structure
  const basicSalary = salaryStructure.structure_items?.find(
    (item: any) => item.structure_type === 'Basic Salary'
  )?.value || 0;

  // Calculate daily salary (assuming 30 days in a month)
  const dailySalary = basicSalary / 30;

  // Return total leave deduction
  return totalLeaveDays * dailySalary;
};

export default {
  fetchPayrollProcessing,
  fetchPayrollProcessingById,
  createPayrollProcessing,
  updatePayrollProcessing,
  processPayroll,
  payPayroll,
  updatePayrollItem,
  deletePayrollProcessing,
};
