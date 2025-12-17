import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import type { ApiResponse } from '../types/api.types';

export type LeaveType =
  | 'Annual'
  | 'Sick'
  | 'Casual'
  | 'Emergency'
  | 'Maternity'
  | 'Paternity'
  | 'Unpaid'
  | 'Marriage'
  | 'Earned'
  | 'Informal'
  | 'Formal'
  | 'Normal';
export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface LeaveApplication {
  id: number;
  employee_id: number;
  employee_name: string;
  employee_email: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  approval_status: ApprovalStatus;
  approved_by?: number;
  approved_by_name?: string;
  approved_date?: string;
  rejection_reason?: string;
  createdate?: string;
  updatedate?: string;
}

export interface GetLeaveApplicationsParams {
  search?: string;
  page?: number;
  limit?: number;
  approvalStatus?: ApprovalStatus;
  leaveType?: LeaveType;
  employeeId?: number;
  startDate?: string;
  endDate?: string;
}

export interface CreateLeaveApplicationPayload {
  employee_id: number;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  reason: string;
}

export interface UpdateLeaveApplicationPayload extends CreateLeaveApplicationPayload {
  id: number;
}

export interface ApproveLeaveApplicationPayload {
  id: number;
  approved_by: number;
}

export interface RejectLeaveApplicationPayload {
  id: number;
  rejected_by: number;
  rejection_reason: string;
}

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
    approval_status: 'Pending',
    createdate: '2025-01-15T10:00:00Z',
    updatedate: '2025-01-15T10:00:00Z',
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
    approved_by: 10,
    approved_by_name: 'Manager Name',
    approved_date: '2025-01-16T10:00:00Z',
    createdate: '2025-01-15T10:00:00Z',
    updatedate: '2025-01-16T10:00:00Z',
  },
  {
    id: 3,
    employee_id: 3,
    employee_name: 'Mike Johnson',
    employee_email: 'mike.johnson@hrms.com',
    leave_type: 'Casual',
    start_date: '2025-01-25',
    end_date: '2025-01-25',
    total_days: 1,
    reason: 'Personal work',
    approval_status: 'Rejected',
    approved_by: 10,
    approved_by_name: 'Manager Name',
    approved_date: '2025-01-16T10:00:00Z',
    rejection_reason: 'Insufficient leave balance',
    createdate: '2025-01-15T10:00:00Z',
    updatedate: '2025-01-16T10:00:00Z',
  },
  {
    id: 4,
    employee_id: 4,
    employee_name: 'Sarah Williams',
    employee_email: 'sarah.williams@hrms.com',
    leave_type: 'Annual',
    start_date: '2025-02-10',
    end_date: '2025-02-12',
    total_days: 3,
    reason: 'Personal vacation',
    approval_status: 'Pending',
    createdate: '2025-01-14T09:00:00Z',
    updatedate: '2025-01-14T09:00:00Z',
  },
  {
    id: 5,
    employee_id: 5,
    employee_name: 'David Brown',
    employee_email: 'david.brown@hrms.com',
    leave_type: 'Sick',
    start_date: '2025-01-18',
    end_date: '2025-01-18',
    total_days: 1,
    reason: 'Fever and cold',
    approval_status: 'Approved',
    approved_by: 10,
    approved_by_name: 'Manager Name',
    approved_date: '2025-01-17T10:00:00Z',
    createdate: '2025-01-14T08:00:00Z',
    updatedate: '2025-01-17T10:00:00Z',
  },
  {
    id: 6,
    employee_id: 6,
    employee_name: 'Emily Davis',
    employee_email: 'emily.davis@hrms.com',
    leave_type: 'Casual',
    start_date: '2025-01-22',
    end_date: '2025-01-22',
    total_days: 1,
    reason: 'Family event',
    approval_status: 'Approved',
    approved_by: 10,
    approved_by_name: 'Manager Name',
    approved_date: '2025-01-15T10:00:00Z',
    createdate: '2025-01-13T10:00:00Z',
    updatedate: '2025-01-15T10:00:00Z',
  },
  {
    id: 7,
    employee_id: 7,
    employee_name: 'Robert Wilson',
    employee_email: 'robert.wilson@hrms.com',
    leave_type: 'Emergency',
    start_date: '2025-01-16',
    end_date: '2025-01-17',
    total_days: 2,
    reason: 'Family emergency',
    approval_status: 'Approved',
    approved_by: 10,
    approved_by_name: 'Manager Name',
    approved_date: '2025-01-15T11:00:00Z',
    createdate: '2025-01-15T10:30:00Z',
    updatedate: '2025-01-15T11:00:00Z',
  },
  {
    id: 8,
    employee_id: 8,
    employee_name: 'Lisa Anderson',
    employee_email: 'lisa.anderson@hrms.com',
    leave_type: 'Maternity',
    start_date: '2025-03-01',
    end_date: '2025-03-31',
    total_days: 31,
    reason: 'Maternity leave',
    approval_status: 'Approved',
    approved_by: 10,
    approved_by_name: 'Manager Name',
    approved_date: '2025-01-12T10:00:00Z',
    createdate: '2025-01-12T09:00:00Z',
    updatedate: '2025-01-12T10:00:00Z',
  },
  {
    id: 9,
    employee_id: 1,
    employee_name: 'John Doe',
    employee_email: 'john.doe@hrms.com',
    leave_type: 'Casual',
    start_date: '2025-01-28',
    end_date: '2025-01-28',
    total_days: 1,
    reason: 'Personal work',
    approval_status: 'Pending',
    createdate: '2025-01-12T10:00:00Z',
    updatedate: '2025-01-12T10:00:00Z',
  },
  {
    id: 10,
    employee_id: 2,
    employee_name: 'Jane Smith',
    employee_email: 'jane.smith@hrms.com',
    leave_type: 'Annual',
    start_date: '2025-02-15',
    end_date: '2025-02-20',
    total_days: 6,
    reason: 'Holiday trip',
    approval_status: 'Pending',
    createdate: '2025-01-11T10:00:00Z',
    updatedate: '2025-01-11T10:00:00Z',
  },
  {
    id: 11,
    employee_id: 3,
    employee_name: 'Mike Johnson',
    employee_email: 'mike.johnson@hrms.com',
    leave_type: 'Sick',
    start_date: '2025-01-19',
    end_date: '2025-01-19',
    total_days: 1,
    reason: 'Doctor appointment',
    approval_status: 'Approved',
    approved_by: 10,
    approved_by_name: 'Manager Name',
    approved_date: '2025-01-18T10:00:00Z',
    createdate: '2025-01-10T10:00:00Z',
    updatedate: '2025-01-18T10:00:00Z',
  },
  {
    id: 12,
    employee_id: 4,
    employee_name: 'Sarah Williams',
    employee_email: 'sarah.williams@hrms.com',
    leave_type: 'Unpaid',
    start_date: '2025-02-25',
    end_date: '2025-02-27',
    total_days: 3,
    reason: 'Extended leave',
    approval_status: 'Pending',
    createdate: '2025-01-09T10:00:00Z',
    updatedate: '2025-01-09T10:00:00Z',
  },
  {
    id: 13,
    employee_id: 5,
    employee_name: 'David Brown',
    employee_email: 'david.brown@hrms.com',
    leave_type: 'Casual',
    start_date: '2025-01-24',
    end_date: '2025-01-24',
    total_days: 1,
    reason: 'Personal',
    approval_status: 'Rejected',
    approved_by: 10,
    approved_by_name: 'Manager Name',
    approved_date: '2025-01-20T10:00:00Z',
    rejection_reason: 'Too many casual leaves this month',
    createdate: '2025-01-08T10:00:00Z',
    updatedate: '2025-01-20T10:00:00Z',
  },
  {
    id: 14,
    employee_id: 6,
    employee_name: 'Emily Davis',
    employee_email: 'emily.davis@hrms.com',
    leave_type: 'Annual',
    start_date: '2025-03-10',
    end_date: '2025-03-15',
    total_days: 6,
    reason: 'Family vacation',
    approval_status: 'Approved',
    approved_by: 10,
    approved_by_name: 'Manager Name',
    approved_date: '2025-01-07T10:00:00Z',
    createdate: '2025-01-07T09:00:00Z',
    updatedate: '2025-01-07T10:00:00Z',
  },
  {
    id: 15,
    employee_id: 7,
    employee_name: 'Robert Wilson',
    employee_email: 'robert.wilson@hrms.com',
    leave_type: 'Sick',
    start_date: '2025-01-17',
    end_date: '2025-01-17',
    total_days: 1,
    reason: 'Health checkup',
    approval_status: 'Approved',
    approved_by: 10,
    approved_by_name: 'Manager Name',
    approved_date: '2025-01-16T10:00:00Z',
    createdate: '2025-01-06T10:00:00Z',
    updatedate: '2025-01-16T10:00:00Z',
  },
];

let mockData = [...mockLeaveApplications];
let nextId = Math.max(...mockData.map(l => l.id), 0) + 1;

const calculateDays = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

const fetchLeaveApplications = async (
  params?: GetLeaveApplicationsParams
): Promise<ApiResponse<LeaveApplication[]>> => {
  await new Promise(resolve => setTimeout(resolve, 500));

  let filtered = [...mockData];

  if (params?.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(
      app =>
        app.employee_name.toLowerCase().includes(searchLower) ||
        app.employee_email.toLowerCase().includes(searchLower) ||
        app.reason.toLowerCase().includes(searchLower)
    );
  }

  if (params?.approvalStatus) {
    filtered = filtered.filter(
      app => app.approval_status === params.approvalStatus
    );
  }

  if (params?.leaveType) {
    filtered = filtered.filter(app => app.leave_type === params.leaveType);
  }

  if (params?.employeeId) {
    filtered = filtered.filter(app => app.employee_id === params.employeeId);
  }

  if (params?.startDate) {
    filtered = filtered.filter(app => app.start_date >= params.startDate!);
  }

  if (params?.endDate) {
    filtered = filtered.filter(app => app.end_date <= params.endDate!);
  }

  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginated = filtered.slice(startIndex, endIndex);

  return {
    success: true,
    message: 'Leave applications fetched successfully',
    data: paginated,
    meta: {
      total_count: filtered.length,
      current_page: page,
      total_pages: Math.ceil(filtered.length / limit),
    },
    stats: {
      total_applications: mockData.length,
      pending_applications: mockData.filter(
        a => a.approval_status === 'Pending'
      ).length,
      approved_applications: mockData.filter(
        a => a.approval_status === 'Approved'
      ).length,
      rejected_applications: mockData.filter(
        a => a.approval_status === 'Rejected'
      ).length,
    } as any,
  };
};

const fetchLeaveApplicationById = async (
  id: number
): Promise<ApiResponse<LeaveApplication>> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const application = mockData.find(a => a.id === id);
  if (!application) {
    throw new Error('Leave application not found');
  }
  return {
    success: true,
    message: 'Leave application fetched successfully',
    data: application,
  };
};

const createLeaveApplication = async (
  payload: CreateLeaveApplicationPayload
): Promise<ApiResponse<LeaveApplication>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const totalDays = calculateDays(payload.start_date, payload.end_date);
  const newApplication: LeaveApplication = {
    id: nextId++,
    ...payload,
    employee_name: 'Employee Name',
    employee_email: 'employee@hrms.com',
    total_days: totalDays,
    approval_status: 'Pending',
    createdate: new Date().toISOString(),
    updatedate: new Date().toISOString(),
  };
  mockData.push(newApplication);
  return {
    success: true,
    message: 'Leave application created successfully',
    data: newApplication,
  };
};

const updateLeaveApplication = async (
  payload: UpdateLeaveApplicationPayload
): Promise<ApiResponse<LeaveApplication>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockData.findIndex(a => a.id === payload.id);
  if (index === -1) {
    throw new Error('Leave application not found');
  }
  const totalDays = calculateDays(payload.start_date, payload.end_date);
  mockData[index] = {
    ...mockData[index],
    ...payload,
    total_days: totalDays,
    updatedate: new Date().toISOString(),
  };
  return {
    success: true,
    message: 'Leave application updated successfully',
    data: mockData[index],
  };
};

const deleteLeaveApplication = async (
  id: number
): Promise<ApiResponse<void>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockData.findIndex(a => a.id === id);
  if (index === -1) {
    throw new Error('Leave application not found');
  }
  mockData.splice(index, 1);
  return { success: true, message: 'Leave application deleted successfully' };
};

const approveLeaveApplication = async (
  payload: ApproveLeaveApplicationPayload
): Promise<ApiResponse<LeaveApplication>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockData.findIndex(a => a.id === payload.id);
  if (index === -1) {
    throw new Error('Leave application not found');
  }
  mockData[index] = {
    ...mockData[index],
    approval_status: 'Approved',
    approved_by: payload.approved_by,
    approved_by_name: 'Manager Name',
    approved_date: new Date().toISOString(),
    updatedate: new Date().toISOString(),
  };
  return {
    success: true,
    message: 'Leave application approved successfully',
    data: mockData[index],
  };
};

const rejectLeaveApplication = async (
  payload: RejectLeaveApplicationPayload
): Promise<ApiResponse<LeaveApplication>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockData.findIndex(a => a.id === payload.id);
  if (index === -1) {
    throw new Error('Leave application not found');
  }
  mockData[index] = {
    ...mockData[index],
    approval_status: 'Rejected',
    approved_by: payload.rejected_by,
    approved_by_name: 'Manager Name',
    approved_date: new Date().toISOString(),
    rejection_reason: payload.rejection_reason,
    updatedate: new Date().toISOString(),
  };
  return {
    success: true,
    message: 'Leave application rejected successfully',
    data: mockData[index],
  };
};

export const leaveApplicationKeys = {
  all: ['leaveApplications'] as const,
  lists: () => [...leaveApplicationKeys.all, 'list'] as const,
  list: (params?: GetLeaveApplicationsParams) =>
    [...leaveApplicationKeys.lists(), params] as const,
  details: () => [...leaveApplicationKeys.all, 'detail'] as const,
  detail: (id: number) => [...leaveApplicationKeys.details(), id] as const,
};

export const useLeaveApplications = (
  params?: GetLeaveApplicationsParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<LeaveApplication[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: leaveApplicationKeys.list(params),
    queryFn: () => fetchLeaveApplications(params),
    staleTime: 1 * 60 * 1000,
    ...options,
  });
};

export const useLeaveApplication = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<LeaveApplication>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: leaveApplicationKeys.detail(id),
    queryFn: () => fetchLeaveApplicationById(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
    ...options,
  });
};

export const useCreateLeaveApplication = (options?: {
  onSuccess?: (
    data: ApiResponse<LeaveApplication>,
    variables: CreateLeaveApplicationPayload
  ) => void;
  onError?: (error: any, variables: CreateLeaveApplicationPayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: CreateLeaveApplicationPayload) =>
      createLeaveApplication(payload),
    loadingMessage: 'Creating leave application...',
    invalidateQueries: ['leaveApplications'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useUpdateLeaveApplication = (options?: {
  onSuccess?: (
    data: ApiResponse<LeaveApplication>,
    variables: UpdateLeaveApplicationPayload
  ) => void;
  onError?: (error: any, variables: UpdateLeaveApplicationPayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: UpdateLeaveApplicationPayload) =>
      updateLeaveApplication(payload),
    loadingMessage: 'Updating leave application...',
    invalidateQueries: ['leaveApplications'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useDeleteLeaveApplication = (options?: {
  onSuccess?: (data: ApiResponse<void>, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  return useApiMutation({
    mutationFn: (id: number) => deleteLeaveApplication(id),
    loadingMessage: 'Deleting leave application...',
    invalidateQueries: ['leaveApplications'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useApproveLeaveApplication = (options?: {
  onSuccess?: (
    data: ApiResponse<LeaveApplication>,
    variables: ApproveLeaveApplicationPayload
  ) => void;
  onError?: (error: any, variables: ApproveLeaveApplicationPayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: ApproveLeaveApplicationPayload) =>
      approveLeaveApplication(payload),
    loadingMessage: 'Approving leave application...',
    invalidateQueries: ['leaveApplications'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useRejectLeaveApplication = (options?: {
  onSuccess?: (
    data: ApiResponse<LeaveApplication>,
    variables: RejectLeaveApplicationPayload
  ) => void;
  onError?: (error: any, variables: RejectLeaveApplicationPayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: RejectLeaveApplicationPayload) =>
      rejectLeaveApplication(payload),
    loadingMessage: 'Rejecting leave application...',
    invalidateQueries: ['leaveApplications'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};
