import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import type { ApiResponse } from '../types/api.types';

export interface Employee {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
  employee_id?: string;
  department_id?: number;
  department_name?: string;
  designation_id?: number;
  designation_name?: string;
  shift_id?: number;
  shift_name?: string;
  reporting_manager_id?: number;
  reporting_manager_name?: string;
  joining_date?: string;
  address?: string;
  profile_image?: string;
  salary?: number;
  currency_code?: string;
  createdate?: string;
  updatedate?: string;
  is_active: 'Y' | 'N';
}

export interface GetEmployeesParams {
  search?: string;
  page?: number;
  limit?: number;
  isActive?: 'Y' | 'N';
  department_id?: number;
  designation_id?: number;
  shift_id?: number;
}

export interface ManageEmployeePayload {
  name: string;
  email: string;
  phone_number?: string;
  employee_id?: string;
  department_id?: number;
  designation_id?: number;
  shift_id?: number;
  reporting_manager_id?: number;
  joining_date?: string;
  address?: string;
  profile_image?: string;
  salary?: number;
  currency_code?: string;
  is_active: 'Y' | 'N';
}

export interface UpdateEmployeePayload extends ManageEmployeePayload {
  id: number;
}

const mockDepartments = [
  { id: 1, name: 'Engineering' },
  { id: 2, name: 'Product' },
  { id: 3, name: 'Design' },
  { id: 4, name: 'Analytics' },
  { id: 5, name: 'Marketing' },
  { id: 6, name: 'Sales' },
  { id: 7, name: 'HR' },
  { id: 8, name: 'Finance' },
];

const mockDesignations = [
  { id: 1, name: 'Senior Engineer' },
  { id: 2, name: 'Product Manager' },
  { id: 3, name: 'UX Designer' },
  { id: 4, name: 'Data Analyst' },
  { id: 5, name: 'Marketing Manager' },
  { id: 6, name: 'Sales Executive' },
  { id: 7, name: 'HR Manager' },
  { id: 8, name: 'Finance Manager' },
];

const mockShifts = [
  { id: 1, name: 'Day Shift' },
  { id: 2, name: 'Evening Shift' },
  { id: 3, name: 'Night Shift' },
  { id: 4, name: 'Flexible' },
];

const mockEmployees: Employee[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@hrms.com',
    phone_number: '+1-555-0101',
    employee_id: 'EMP001',
    department_id: 1,
    department_name: 'Engineering',
    designation_id: 1,
    designation_name: 'Senior Engineer',
    shift_id: 1,
    shift_name: 'Day Shift',
    reporting_manager_id: 10,
    reporting_manager_name: 'Jane Manager',
    joining_date: '2023-01-15',
    address: '123 Main St, City, State 12345',
    profile_image: '/profiles/john-doe.jpg',
    salary: 120000,
    currency_code: 'USD',
    createdate: '2023-01-15T10:00:00Z',
    updatedate: '2023-01-15T10:00:00Z',
    is_active: 'Y',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@hrms.com',
    phone_number: '+1-555-0102',
    employee_id: 'EMP002',
    department_id: 2,
    department_name: 'Product',
    designation_id: 2,
    designation_name: 'Product Manager',
    shift_id: 1,
    shift_name: 'Day Shift',
    reporting_manager_id: 10,
    reporting_manager_name: 'Jane Manager',
    joining_date: '2023-02-20',
    address: '456 Oak Ave, City, State 12345',
    profile_image: '/profiles/jane-smith.jpg',
    salary: 130000,
    currency_code: 'USD',
    createdate: '2023-02-20T10:00:00Z',
    updatedate: '2023-02-20T10:00:00Z',
    is_active: 'Y',
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike.johnson@hrms.com',
    phone_number: '+1-555-0103',
    employee_id: 'EMP003',
    department_id: 3,
    department_name: 'Design',
    designation_id: 3,
    designation_name: 'UX Designer',
    shift_id: 2,
    shift_name: 'Evening Shift',
    reporting_manager_id: 11,
    reporting_manager_name: 'Sarah Lead',
    joining_date: '2023-03-10',
    address: '789 Pine Rd, City, State 12345',
    salary: 95000,
    currency_code: 'USD',
    createdate: '2023-03-10T10:00:00Z',
    updatedate: '2023-03-10T10:00:00Z',
    is_active: 'Y',
  },
  {
    id: 4,
    name: 'Sarah Williams',
    email: 'sarah.williams@hrms.com',
    phone_number: '+1-555-0104',
    employee_id: 'EMP004',
    department_id: 4,
    department_name: 'Analytics',
    designation_id: 4,
    designation_name: 'Data Analyst',
    shift_id: 1,
    shift_name: 'Day Shift',
    reporting_manager_id: 12,
    reporting_manager_name: 'Tom Director',
    joining_date: '2023-04-05',
    address: '321 Elm St, City, State 12345',
    salary: 85000,
    currency_code: 'USD',
    createdate: '2023-04-05T10:00:00Z',
    updatedate: '2023-04-05T10:00:00Z',
    is_active: 'Y',
  },
  {
    id: 5,
    name: 'David Brown',
    email: 'david.brown@hrms.com',
    phone_number: '+1-555-0105',
    employee_id: 'EMP005',
    department_id: 5,
    department_name: 'Marketing',
    designation_id: 5,
    designation_name: 'Marketing Manager',
    shift_id: 1,
    shift_name: 'Day Shift',
    reporting_manager_id: 13,
    reporting_manager_name: 'Lisa VP',
    joining_date: '2023-05-12',
    address: '654 Maple Dr, City, State 12345',
    salary: 110000,
    currency_code: 'USD',
    createdate: '2023-05-12T10:00:00Z',
    updatedate: '2023-05-12T10:00:00Z',
    is_active: 'Y',
  },
  {
    id: 6,
    name: 'Emily Davis',
    email: 'emily.davis@hrms.com',
    phone_number: '+1-555-0106',
    employee_id: 'EMP006',
    department_id: 6,
    department_name: 'Sales',
    designation_id: 6,
    designation_name: 'Sales Executive',
    shift_id: 3,
    shift_name: 'Night Shift',
    reporting_manager_id: 14,
    reporting_manager_name: 'Robert Sales',
    joining_date: '2023-06-18',
    address: '987 Cedar Ln, City, State 12345',
    salary: 70000,
    currency_code: 'USD',
    createdate: '2023-06-18T10:00:00Z',
    updatedate: '2023-06-18T10:00:00Z',
    is_active: 'Y',
  },
  {
    id: 7,
    name: 'Robert Wilson',
    email: 'robert.wilson@hrms.com',
    phone_number: '+1-555-0107',
    employee_id: 'EMP007',
    department_id: 7,
    department_name: 'HR',
    designation_id: 7,
    designation_name: 'HR Manager',
    shift_id: 1,
    shift_name: 'Day Shift',
    reporting_manager_id: 15,
    reporting_manager_name: 'Mary HR',
    joining_date: '2023-07-22',
    address: '147 Birch Way, City, State 12345',
    salary: 100000,
    currency_code: 'USD',
    createdate: '2023-07-22T10:00:00Z',
    updatedate: '2023-07-22T10:00:00Z',
    is_active: 'Y',
  },
  {
    id: 8,
    name: 'Lisa Anderson',
    email: 'lisa.anderson@hrms.com',
    phone_number: '+1-555-0108',
    employee_id: 'EMP008',
    department_id: 8,
    department_name: 'Finance',
    designation_id: 8,
    designation_name: 'Finance Manager',
    shift_id: 1,
    shift_name: 'Day Shift',
    reporting_manager_id: 16,
    reporting_manager_name: 'Chris Finance',
    joining_date: '2023-08-30',
    address: '258 Spruce Ct, City, State 12345',
    salary: 115000,
    currency_code: 'USD',
    createdate: '2023-08-30T10:00:00Z',
    updatedate: '2023-08-30T10:00:00Z',
    is_active: 'N',
  },
  {
    id: 9,
    name: 'Michael Chen',
    email: 'michael.chen@hrms.com',
    phone_number: '+1-555-0109',
    employee_id: 'EMP009',
    department_id: 1,
    department_name: 'Engineering',
    designation_id: 1,
    designation_name: 'Senior Engineer',
    shift_id: 1,
    shift_name: 'Day Shift',
    reporting_manager_id: 10,
    reporting_manager_name: 'Jane Manager',
    joining_date: '2024-01-10',
    address: '369 Willow St, City, State 12345',
    salary: 125000,
    currency_code: 'USD',
    createdate: '2024-01-10T10:00:00Z',
    updatedate: '2024-01-10T10:00:00Z',
    is_active: 'Y',
  },
  {
    id: 10,
    name: 'Jennifer Taylor',
    email: 'jennifer.taylor@hrms.com',
    phone_number: '+1-555-0110',
    employee_id: 'EMP010',
    department_id: 2,
    department_name: 'Product',
    designation_id: 2,
    designation_name: 'Product Manager',
    shift_id: 1,
    shift_name: 'Day Shift',
    reporting_manager_id: 10,
    reporting_manager_name: 'Jane Manager',
    joining_date: '2024-02-15',
    address: '741 Ash Ave, City, State 12345',
    salary: 135000,
    currency_code: 'USD',
    createdate: '2024-02-15T10:00:00Z',
    updatedate: '2024-02-15T10:00:00Z',
    is_active: 'Y',
  },
  {
    id: 11,
    name: 'Christopher Lee',
    email: 'christopher.lee@hrms.com',
    phone_number: '+1-555-0111',
    employee_id: 'EMP011',
    department_id: 3,
    department_name: 'Design',
    designation_id: 3,
    designation_name: 'UX Designer',
    shift_id: 2,
    shift_name: 'Evening Shift',
    reporting_manager_id: 11,
    reporting_manager_name: 'Sarah Lead',
    joining_date: '2024-03-20',
    address: '852 Poplar Dr, City, State 12345',
    salary: 98000,
    currency_code: 'USD',
    createdate: '2024-03-20T10:00:00Z',
    updatedate: '2024-03-20T10:00:00Z',
    is_active: 'Y',
  },
  {
    id: 12,
    name: 'Amanda Martinez',
    email: 'amanda.martinez@hrms.com',
    phone_number: '+1-555-0112',
    employee_id: 'EMP012',
    department_id: 4,
    department_name: 'Analytics',
    designation_id: 4,
    designation_name: 'Data Analyst',
    shift_id: 1,
    shift_name: 'Day Shift',
    reporting_manager_id: 12,
    reporting_manager_name: 'Tom Director',
    joining_date: '2024-04-05',
    address: '963 Hickory Ln, City, State 12345',
    salary: 88000,
    currency_code: 'USD',
    createdate: '2024-04-05T10:00:00Z',
    updatedate: '2024-04-05T10:00:00Z',
    is_active: 'Y',
  },
  {
    id: 13,
    name: 'James Thompson',
    email: 'james.thompson@hrms.com',
    phone_number: '+1-555-0113',
    employee_id: 'EMP013',
    department_id: 5,
    department_name: 'Marketing',
    designation_id: 5,
    designation_name: 'Marketing Manager',
    shift_id: 1,
    shift_name: 'Day Shift',
    reporting_manager_id: 13,
    reporting_manager_name: 'Lisa VP',
    joining_date: '2024-05-12',
    address: '159 Sycamore Way, City, State 12345',
    salary: 112000,
    currency_code: 'USD',
    createdate: '2024-05-12T10:00:00Z',
    updatedate: '2024-05-12T10:00:00Z',
    is_active: 'Y',
  },
  {
    id: 14,
    name: 'Patricia Garcia',
    email: 'patricia.garcia@hrms.com',
    phone_number: '+1-555-0114',
    employee_id: 'EMP014',
    department_id: 6,
    department_name: 'Sales',
    designation_id: 6,
    designation_name: 'Sales Executive',
    shift_id: 3,
    shift_name: 'Night Shift',
    reporting_manager_id: 14,
    reporting_manager_name: 'Robert Sales',
    joining_date: '2024-06-18',
    address: '357 Magnolia Ct, City, State 12345',
    salary: 72000,
    currency_code: 'USD',
    createdate: '2024-06-18T10:00:00Z',
    updatedate: '2024-06-18T10:00:00Z',
    is_active: 'Y',
  },
  {
    id: 15,
    name: 'Daniel Rodriguez',
    email: 'daniel.rodriguez@hrms.com',
    phone_number: '+1-555-0115',
    employee_id: 'EMP015',
    department_id: 1,
    department_name: 'Engineering',
    designation_id: 1,
    designation_name: 'Senior Engineer',
    shift_id: 1,
    shift_name: 'Day Shift',
    reporting_manager_id: 10,
    reporting_manager_name: 'Jane Manager',
    joining_date: '2024-07-22',
    address: '468 Cypress Rd, City, State 12345',
    salary: 118000,
    currency_code: 'USD',
    createdate: '2024-07-22T10:00:00Z',
    updatedate: '2024-07-22T10:00:00Z',
    is_active: 'Y',
  },
];

let mockData = [...mockEmployees];
let nextId = Math.max(...mockData.map(e => e.id)) + 1;

const fetchEmployees = async (
  params?: GetEmployeesParams
): Promise<ApiResponse<Employee[]>> => {
  await new Promise(resolve => setTimeout(resolve, 500));

  let filtered = [...mockData];

  if (params?.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(
      employee =>
        employee.name.toLowerCase().includes(searchLower) ||
        employee.email.toLowerCase().includes(searchLower) ||
        employee.employee_id?.toLowerCase().includes(searchLower) ||
        employee.phone_number?.toLowerCase().includes(searchLower) ||
        employee.department_name?.toLowerCase().includes(searchLower) ||
        employee.designation_name?.toLowerCase().includes(searchLower)
    );
  }

  if (params?.isActive) {
    filtered = filtered.filter(
      employee => employee.is_active === params.isActive
    );
  }

  if (params?.department_id) {
    filtered = filtered.filter(
      employee => employee.department_id === params.department_id
    );
  }

  if (params?.designation_id) {
    filtered = filtered.filter(
      employee => employee.designation_id === params.designation_id
    );
  }

  if (params?.shift_id) {
    filtered = filtered.filter(
      employee => employee.shift_id === params.shift_id
    );
  }

  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginated = filtered.slice(startIndex, endIndex);

  return {
    success: true,
    message: 'Employees fetched successfully',
    data: paginated,
    meta: {
      total_count: filtered.length,
      current_page: page,
      total_pages: Math.ceil(filtered.length / limit),
    },
    stats: {
      total_employees: mockData.length,
      active_employees: mockData.filter(e => e.is_active === 'Y').length,
      inactive_employees: mockData.filter(e => e.is_active === 'N').length,
      new_employees: 0,
    } as any,
  };
};

const fetchEmployeeById = async (
  id: number
): Promise<ApiResponse<Employee>> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const employee = mockData.find(e => e.id === id);
  if (!employee) {
    throw new Error('Employee not found');
  }
  return {
    success: true,
    message: 'Employee fetched successfully',
    data: employee,
  };
};

const createEmployee = async (
  payload: ManageEmployeePayload
): Promise<ApiResponse<Employee>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const department = mockDepartments.find(d => d.id === payload.department_id);
  const designation = mockDesignations.find(
    d => d.id === payload.designation_id
  );
  const shift = mockShifts.find(s => s.id === payload.shift_id);
  const newEmployee: Employee = {
    id: nextId++,
    ...payload,
    department_name: department?.name,
    designation_name: designation?.name,
    shift_name: shift?.name,
    reporting_manager_name: 'Manager Name',
    createdate: new Date().toISOString(),
    updatedate: new Date().toISOString(),
  };
  mockData.push(newEmployee);
  return {
    success: true,
    message: 'Employee created successfully',
    data: newEmployee,
  };
};

const updateEmployee = async (
  payload: UpdateEmployeePayload
): Promise<ApiResponse<Employee>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockData.findIndex(e => e.id === payload.id);
  if (index === -1) {
    throw new Error('Employee not found');
  }
  const department = mockDepartments.find(d => d.id === payload.department_id);
  const designation = mockDesignations.find(
    d => d.id === payload.designation_id
  );
  const shift = mockShifts.find(s => s.id === payload.shift_id);
  mockData[index] = {
    ...mockData[index],
    ...payload,
    department_name: department?.name,
    designation_name: designation?.name,
    shift_name: shift?.name,
    updatedate: new Date().toISOString(),
  };
  return {
    success: true,
    message: 'Employee updated successfully',
    data: mockData[index],
  };
};

const deleteEmployee = async (id: number): Promise<ApiResponse<void>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockData.findIndex(e => e.id === id);
  if (index === -1) {
    throw new Error('Employee not found');
  }
  mockData.splice(index, 1);
  return { success: true, message: 'Employee deleted successfully' };
};

export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (params?: GetEmployeesParams) =>
    [...employeeKeys.lists(), params] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: number) => [...employeeKeys.details(), id] as const,
};

export const useEmployees = (
  params?: GetEmployeesParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<Employee[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: () => fetchEmployees(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useEmployee = (
  id: number,
  options?: Omit<UseQueryOptions<ApiResponse<Employee>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => fetchEmployeeById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateEmployee = (options?: {
  onSuccess?: (
    data: ApiResponse<Employee>,
    variables: ManageEmployeePayload
  ) => void;
  onError?: (error: any, variables: ManageEmployeePayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: ManageEmployeePayload) => createEmployee(payload),
    loadingMessage: 'Creating employee...',
    invalidateQueries: ['employees'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useUpdateEmployee = (options?: {
  onSuccess?: (
    data: ApiResponse<Employee>,
    variables: UpdateEmployeePayload
  ) => void;
  onError?: (error: any, variables: UpdateEmployeePayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: UpdateEmployeePayload) => updateEmployee(payload),
    loadingMessage: 'Updating employee...',
    invalidateQueries: ['employees'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useDeleteEmployee = (options?: {
  onSuccess?: (data: ApiResponse<void>, variables: number) => void;
  onError?: (error: any, variables: number) => void;
}) => {
  return useApiMutation({
    mutationFn: (id: number) => deleteEmployee(id),
    loadingMessage: 'Deleting employee...',
    invalidateQueries: ['employees'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};
