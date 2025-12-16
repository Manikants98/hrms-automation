import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import type { ApiResponse } from '../types/api.types';
import type { LeaveType } from './useLeaveApplications';

export type { LeaveType } from './useLeaveApplications';

export type LeaveBalanceStatus = 'Active' | 'Inactive';

export interface LeaveBalanceItem {
  id?: number;
  leave_type: LeaveType;
  total_allocated: number;
  used: number;
  leave_balance: number;
}

export interface LeaveBalance {
  id: number;
  employee_id: number;
  employee_name: string;
  employee_code?: string;
  employee_email?: string;
  start_date: string;
  end_date: string;
  status: LeaveBalanceStatus;
  leave_type_items: LeaveBalanceItem[];
  createdate?: string;
  updatedate?: string;
}

export interface GetLeaveBalancesParams {
  search?: string;
  page?: number;
  limit?: number;
  employeeId?: number;
  status?: LeaveBalanceStatus;
  startDate?: string;
  endDate?: string;
}

export interface ManageLeaveBalancePayload {
  employee_id: number;
  start_date: string;
  end_date: string;
  status: LeaveBalanceStatus;
  leave_type_items: LeaveBalanceItem[];
}

export interface UpdateLeaveBalancePayload extends ManageLeaveBalancePayload {
  id: number;
}

const mockLeaveBalances: LeaveBalance[] = [
  {
    id: 1,
    employee_id: 1,
    employee_name: 'jkl',
    employee_code: 'EMPJ14567999',
    employee_email: 'jkl@hrms.com',
    start_date: '2025-12-04',
    end_date: '2025-12-31',
    status: 'Active',
    leave_type_items: [
      {
        id: 1,
        leave_type: 'Casual',
        total_allocated: 12,
        used: 0,
        leave_balance: 12,
      },
      {
        id: 2,
        leave_type: 'Marriage',
        total_allocated: 5,
        used: 0,
        leave_balance: 5,
      },
      {
        id: 3,
        leave_type: 'Annual',
        total_allocated: 20,
        used: 0,
        leave_balance: 20,
      },
    ],
    createdate: '2025-12-04T10:00:00Z',
    updatedate: '2025-12-04T10:00:00Z',
  },
  {
    id: 2,
    employee_id: 2,
    employee_name: 'lkj',
    employee_code: 'EMPL14568000',
    employee_email: 'lkj@hrms.com',
    start_date: '2025-12-05',
    end_date: '2025-12-31',
    status: 'Inactive',
    leave_type_items: [
      {
        id: 4,
        leave_type: 'Sick',
        total_allocated: 10,
        used: 2,
        leave_balance: 8,
      },
      {
        id: 5,
        leave_type: 'Casual',
        total_allocated: 12,
        used: 4,
        leave_balance: 8,
      },
    ],
    createdate: '2025-12-05T10:00:00Z',
    updatedate: '2025-12-05T10:00:00Z',
  },
];

let mockData = [...mockLeaveBalances];
let nextId = Math.max(...mockData.map(b => b.id), 0) + 1;
let nextItemId =
  Math.max(
    ...mockData.flatMap(b => b.leave_type_items.map(i => i.id || 0)),
    0
  ) + 1;

const fetchLeaveBalances = async (
  params?: GetLeaveBalancesParams
): Promise<ApiResponse<LeaveBalance[]>> => {
  await new Promise(resolve => setTimeout(resolve, 500));

  let filtered = [...mockData];

  if (params?.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(
      balance =>
        balance.employee_name.toLowerCase().includes(searchLower) ||
        balance.employee_code?.toLowerCase().includes(searchLower) ||
        balance.employee_email?.toLowerCase().includes(searchLower)
    );
  }

  if (params?.employeeId) {
    filtered = filtered.filter(
      balance => balance.employee_id === params.employeeId
    );
  }

  if (params?.status) {
    filtered = filtered.filter(balance => balance.status === params.status);
  }

  if (params?.startDate) {
    filtered = filtered.filter(
      balance => balance.start_date >= params.startDate!
    );
  }

  if (params?.endDate) {
    filtered = filtered.filter(balance => balance.end_date <= params.endDate!);
  }

  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginated = filtered.slice(startIndex, endIndex);

  const totalAllocated = filtered.reduce(
    (sum, b) =>
      sum +
      b.leave_type_items.reduce(
        (itemSum, item) => itemSum + item.total_allocated,
        0
      ),
    0
  );
  const totalUsed = filtered.reduce(
    (sum, b) =>
      sum +
      b.leave_type_items.reduce((itemSum, item) => itemSum + item.used, 0),
    0
  );
  const totalRemaining = filtered.reduce(
    (sum, b) =>
      sum +
      b.leave_type_items.reduce(
        (itemSum, item) => itemSum + item.leave_balance,
        0
      ),
    0
  );

  return {
    success: true,
    message: 'Leave balances fetched successfully',
    data: paginated,
    meta: {
      total_count: filtered.length,
      current_page: page,
      total_pages: Math.ceil(filtered.length / limit),
    },
    stats: {
      total_employees: new Set(filtered.map(b => b.employee_id)).size,
      total_allocated: totalAllocated,
      total_used: totalUsed,
      total_remaining: totalRemaining,
    } as any,
  };
};

const fetchLeaveBalanceById = async (
  id: number
): Promise<ApiResponse<LeaveBalance>> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const balance = mockData.find(b => b.id === id);
  if (!balance) {
    throw new Error('Leave balance not found');
  }
  return {
    success: true,
    message: 'Leave balance fetched successfully',
    data: balance,
  };
};

const createLeaveBalance = async (
  payload: ManageLeaveBalancePayload
): Promise<ApiResponse<LeaveBalance>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const newBalance: LeaveBalance = {
    id: nextId++,
    ...payload,
    employee_name: 'Employee Name',
    employee_code: 'EMP00000000',
    employee_email: 'employee@hrms.com',
    leave_type_items: payload.leave_type_items.map(item => ({
      ...item,
      id: nextItemId++,
      leave_balance: item.total_allocated - item.used,
    })),
    createdate: new Date().toISOString(),
    updatedate: new Date().toISOString(),
  };
  mockData.push(newBalance);
  return {
    success: true,
    message: 'Leave balance created successfully',
    data: newBalance,
  };
};

const updateLeaveBalance = async (
  payload: UpdateLeaveBalancePayload
): Promise<ApiResponse<LeaveBalance>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockData.findIndex(b => b.id === payload.id);
  if (index === -1) {
    throw new Error('Leave balance not found');
  }
  mockData[index] = {
    ...mockData[index],
    ...payload,
    leave_type_items: payload.leave_type_items.map(item => ({
      ...item,
      id: item.id || nextItemId++,
      leave_balance: item.total_allocated - item.used,
    })),
    updatedate: new Date().toISOString(),
  };
  return {
    success: true,
    message: 'Leave balance updated successfully',
    data: mockData[index],
  };
};

const deleteLeaveBalance = async (id: number): Promise<ApiResponse<void>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockData.findIndex(b => b.id === id);
  if (index === -1) {
    throw new Error('Leave balance not found');
  }
  mockData.splice(index, 1);
  return { success: true, message: 'Leave balance deleted successfully' };
};

export const leaveBalanceKeys = {
  all: ['leaveBalances'] as const,
  lists: () => [...leaveBalanceKeys.all, 'list'] as const,
  list: (params?: GetLeaveBalancesParams) =>
    [...leaveBalanceKeys.lists(), params] as const,
  details: () => [...leaveBalanceKeys.all, 'detail'] as const,
  detail: (id: number) => [...leaveBalanceKeys.details(), id] as const,
};

export const useLeaveBalances = (
  params?: GetLeaveBalancesParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<LeaveBalance[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: leaveBalanceKeys.list(params),
    queryFn: () => fetchLeaveBalances(params),
    staleTime: 1 * 60 * 1000,
    ...options,
  });
};

export const useLeaveBalance = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<LeaveBalance>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: leaveBalanceKeys.detail(id),
    queryFn: () => fetchLeaveBalanceById(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
    ...options,
  });
};

export const useCreateLeaveBalance = (options?: {
  onSuccess?: (
    data: ApiResponse<LeaveBalance>,
    variables: ManageLeaveBalancePayload
  ) => void;
  onError?: (error: any, variables: ManageLeaveBalancePayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: ManageLeaveBalancePayload) =>
      createLeaveBalance(payload),
    loadingMessage: 'Creating leave balance...',
    invalidateQueries: ['leaveBalances'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useUpdateLeaveBalance = (options?: {
  onSuccess?: (
    data: ApiResponse<LeaveBalance>,
    variables: UpdateLeaveBalancePayload
  ) => void;
  onError?: (error: any, variables: UpdateLeaveBalancePayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: UpdateLeaveBalancePayload) =>
      updateLeaveBalance(payload),
    loadingMessage: 'Updating leave balance...',
    invalidateQueries: ['leaveBalances'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useDeleteLeaveBalance = (options?: {
  onSuccess?: (data: ApiResponse<void>, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  return useApiMutation({
    mutationFn: (id: number) => deleteLeaveBalance(id),
    loadingMessage: 'Deleting leave balance...',
    invalidateQueries: ['leaveBalances'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};
