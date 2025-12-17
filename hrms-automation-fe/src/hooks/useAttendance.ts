import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useApiMutation } from './useApiMutation';
import type { ApiResponse } from '../types/api.types';

export type AttendanceStatus =
  | 'Present'
  | 'Absent'
  | 'Half Day'
  | 'Leave'
  | 'Holiday'
  | 'Weekend';

export interface AttendanceRecord {
  id: number;
  employee_id: number;
  employee_name: string;
  employee_email: string;
  employee_department?: string;
  attendance_date: string;
  status: AttendanceStatus;
  punch_in_time?: string;
  punch_out_time?: string;
  total_hours?: number;
  remarks?: string;
  marked_by?: number;
  marked_by_name?: string;
  createdate?: string;
  updatedate?: string;
}

export interface GetAttendanceParams {
  attendance_date?: string;
  employee_id?: number;
  department_id?: number;
  status?: AttendanceStatus;
  page?: number;
  limit?: number;
}

export interface MarkAttendancePayload {
  employee_id: number;
  attendance_date: string;
  status: AttendanceStatus;
  punch_in_time?: string;
  punch_out_time?: string;
  remarks?: string;
}

export interface UpdateAttendancePayload extends MarkAttendancePayload {
  id: number;
}

const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: 1,
    employee_id: 1,
    employee_name: 'John Doe',
    employee_email: 'john.doe@hrms.com',
    employee_department: 'Engineering',
    attendance_date: '2025-01-15',
    status: 'Present',
    punch_in_time: '09:00',
    punch_out_time: '18:00',
    total_hours: 9,
    remarks: '',
    marked_by: 1,
    marked_by_name: 'HR Manager',
    createdate: '2025-01-15T08:00:00Z',
    updatedate: '2025-01-15T18:00:00Z',
  },
  {
    id: 2,
    employee_id: 2,
    employee_name: 'Jane Smith',
    employee_email: 'jane.smith@hrms.com',
    employee_department: 'Product',
    attendance_date: '2025-01-15',
    status: 'Present',
    punch_in_time: '09:15',
    punch_out_time: '18:15',
    total_hours: 9,
    remarks: '',
    marked_by: 1,
    marked_by_name: 'HR Manager',
    createdate: '2025-01-15T08:00:00Z',
    updatedate: '2025-01-15T18:15:00Z',
  },
  {
    id: 3,
    employee_id: 3,
    employee_name: 'Mike Johnson',
    employee_email: 'mike.johnson@hrms.com',
    employee_department: 'Design',
    attendance_date: '2025-01-15',
    status: 'Half Day',
    punch_in_time: '09:00',
    punch_out_time: '13:00',
    total_hours: 4,
    remarks: 'Left early for personal work',
    marked_by: 1,
    marked_by_name: 'HR Manager',
    createdate: '2025-01-15T08:00:00Z',
    updatedate: '2025-01-15T13:00:00Z',
  },
  {
    id: 4,
    employee_id: 4,
    employee_name: 'Sarah Williams',
    employee_email: 'sarah.williams@hrms.com',
    employee_department: 'Analytics',
    attendance_date: '2025-01-15',
    status: 'Absent',
    remarks: 'Sick leave',
    marked_by: 1,
    marked_by_name: 'HR Manager',
    createdate: '2025-01-15T08:00:00Z',
    updatedate: '2025-01-15T08:00:00Z',
  },
  {
    id: 5,
    employee_id: 5,
    employee_name: 'David Brown',
    employee_email: 'david.brown@hrms.com',
    employee_department: 'Marketing',
    attendance_date: '2025-01-15',
    status: 'Leave',
    remarks: 'Annual leave',
    marked_by: 1,
    marked_by_name: 'HR Manager',
    createdate: '2025-01-15T08:00:00Z',
    updatedate: '2025-01-15T08:00:00Z',
  },
  {
    id: 6,
    employee_id: 1,
    employee_name: 'John Doe',
    employee_email: 'john.doe@hrms.com',
    employee_department: 'Engineering',
    attendance_date: '2025-01-14',
    status: 'Present',
    punch_in_time: '08:55',
    punch_out_time: '17:55',
    total_hours: 9,
    remarks: '',
    marked_by: 1,
    marked_by_name: 'HR Manager',
    createdate: '2025-01-14T08:00:00Z',
    updatedate: '2025-01-14T17:55:00Z',
  },
  {
    id: 7,
    employee_id: 2,
    employee_name: 'Jane Smith',
    employee_email: 'jane.smith@hrms.com',
    employee_department: 'Product',
    attendance_date: '2025-01-14',
    status: 'Present',
    punch_in_time: '09:10',
    punch_out_time: '18:10',
    total_hours: 9,
    remarks: '',
    marked_by: 1,
    marked_by_name: 'HR Manager',
    createdate: '2025-01-14T08:00:00Z',
    updatedate: '2025-01-14T18:10:00Z',
  },
  {
    id: 8,
    employee_id: 6,
    employee_name: 'Emily Davis',
    employee_email: 'emily.davis@hrms.com',
    employee_department: 'Sales',
    attendance_date: '2025-01-14',
    status: 'Present',
    punch_in_time: '09:05',
    punch_out_time: '18:05',
    total_hours: 9,
    remarks: '',
    marked_by: 1,
    marked_by_name: 'HR Manager',
    createdate: '2025-01-14T08:00:00Z',
    updatedate: '2025-01-14T18:05:00Z',
  },
  {
    id: 9,
    employee_id: 7,
    employee_name: 'Robert Wilson',
    employee_email: 'robert.wilson@hrms.com',
    employee_department: 'HR',
    attendance_date: '2025-01-14',
    status: 'Present',
    punch_in_time: '08:50',
    punch_out_time: '17:50',
    total_hours: 9,
    remarks: '',
    marked_by: 1,
    marked_by_name: 'HR Manager',
    createdate: '2025-01-14T08:00:00Z',
    updatedate: '2025-01-14T17:50:00Z',
  },
  {
    id: 10,
    employee_id: 8,
    employee_name: 'Lisa Anderson',
    employee_email: 'lisa.anderson@hrms.com',
    employee_department: 'Finance',
    attendance_date: '2025-01-14',
    status: 'Half Day',
    punch_in_time: '09:00',
    punch_out_time: '14:00',
    total_hours: 5,
    remarks: 'Medical appointment',
    marked_by: 1,
    marked_by_name: 'HR Manager',
    createdate: '2025-01-14T08:00:00Z',
    updatedate: '2025-01-14T14:00:00Z',
  },
  {
    id: 11,
    employee_id: 3,
    employee_name: 'Mike Johnson',
    employee_email: 'mike.johnson@hrms.com',
    employee_department: 'Design',
    attendance_date: '2025-01-13',
    status: 'Present',
    punch_in_time: '09:20',
    punch_out_time: '18:20',
    total_hours: 9,
    remarks: '',
    marked_by: 1,
    marked_by_name: 'HR Manager',
    createdate: '2025-01-13T08:00:00Z',
    updatedate: '2025-01-13T18:20:00Z',
  },
  {
    id: 12,
    employee_id: 4,
    employee_name: 'Sarah Williams',
    employee_email: 'sarah.williams@hrms.com',
    employee_department: 'Analytics',
    attendance_date: '2025-01-13',
    status: 'Present',
    punch_in_time: '09:00',
    punch_out_time: '18:00',
    total_hours: 9,
    remarks: '',
    marked_by: 1,
    marked_by_name: 'HR Manager',
    createdate: '2025-01-13T08:00:00Z',
    updatedate: '2025-01-13T18:00:00Z',
  },
  {
    id: 13,
    employee_id: 5,
    employee_name: 'David Brown',
    employee_email: 'david.brown@hrms.com',
    employee_department: 'Marketing',
    attendance_date: '2025-01-13',
    status: 'Absent',
    remarks: 'Personal leave',
    marked_by: 1,
    marked_by_name: 'HR Manager',
    createdate: '2025-01-13T08:00:00Z',
    updatedate: '2025-01-13T08:00:00Z',
  },
  {
    id: 14,
    employee_id: 6,
    employee_name: 'Emily Davis',
    employee_email: 'emily.davis@hrms.com',
    employee_department: 'Sales',
    attendance_date: '2025-01-12',
    status: 'Present',
    punch_in_time: '09:00',
    punch_out_time: '18:00',
    total_hours: 9,
    remarks: '',
    marked_by: 1,
    marked_by_name: 'HR Manager',
    createdate: '2025-01-12T08:00:00Z',
    updatedate: '2025-01-12T18:00:00Z',
  },
  {
    id: 15,
    employee_id: 7,
    employee_name: 'Robert Wilson',
    employee_email: 'robert.wilson@hrms.com',
    employee_department: 'HR',
    attendance_date: '2025-01-12',
    status: 'Present',
    punch_in_time: '08:45',
    punch_out_time: '17:45',
    total_hours: 9,
    remarks: '',
    marked_by: 1,
    marked_by_name: 'HR Manager',
    createdate: '2025-01-12T08:00:00Z',
    updatedate: '2025-01-12T17:45:00Z',
  },
];

const today = new Date().toISOString().split('T')[0];
const last7Days = Array.from({ length: 7 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (6 - i));
  return date.toISOString().split('T')[0];
});

const additionalAttendanceRecords: AttendanceRecord[] = [];

last7Days.forEach((date, dayIndex) => {
  const employeesForDay = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@hrms.com',
      dept: 'Engineering',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@hrms.com',
      dept: 'Product',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@hrms.com',
      dept: 'Design',
    },
    {
      id: 4,
      name: 'Sarah Williams',
      email: 'sarah.williams@hrms.com',
      dept: 'Analytics',
    },
    {
      id: 5,
      name: 'David Brown',
      email: 'david.brown@hrms.com',
      dept: 'Marketing',
    },
    {
      id: 6,
      name: 'Emily Davis',
      email: 'emily.davis@hrms.com',
      dept: 'Sales',
    },
    {
      id: 7,
      name: 'Robert Wilson',
      email: 'robert.wilson@hrms.com',
      dept: 'HR',
    },
  ];

  employeesForDay.forEach((emp, empIndex) => {
    const recordId = 300 + dayIndex * 10 + empIndex;
    let status: AttendanceStatus = 'Present';
    let punchIn: string | undefined = '09:00';
    let punchOut: string | undefined = '18:00';
    let totalHours = 9;

    if (date === today) {
      if (empIndex === 2) {
        status = 'Half Day';
        punchOut = '13:00';
        totalHours = 4;
      } else if (empIndex === 3) {
        status = 'Absent';
        punchIn = undefined;
        punchOut = undefined;
        totalHours = 0;
      } else if (empIndex === 4) {
        status = 'Leave';
        punchIn = undefined;
        punchOut = undefined;
        totalHours = 0;
      }
    } else {
      const random = (dayIndex + empIndex) % 7;
      if (random === 0) {
        status = 'Absent';
        punchIn = undefined;
        punchOut = undefined;
        totalHours = 0;
      } else if (random === 1) {
        status = 'Leave';
        punchIn = undefined;
        punchOut = undefined;
        totalHours = 0;
      } else if (random === 2) {
        status = 'Half Day';
        punchOut = '13:00';
        totalHours = 4;
      } else {
        punchIn = `09:${String(empIndex * 5).padStart(2, '0')}`;
        punchOut = `18:${String(empIndex * 5).padStart(2, '0')}`;
      }
    }

    additionalAttendanceRecords.push({
      id: recordId,
      employee_id: emp.id,
      employee_name: emp.name,
      employee_email: emp.email,
      employee_department: emp.dept,
      attendance_date: date,
      status,
      punch_in_time: punchIn,
      punch_out_time: punchOut,
      total_hours: totalHours,
      remarks:
        status === 'Absent'
          ? 'Sick leave'
          : status === 'Leave'
            ? 'Annual leave'
            : '',
      marked_by: 1,
      marked_by_name: 'HR Manager',
      createdate: `${date}T08:00:00Z`,
      updatedate: `${date}T${punchOut || '08:00'}:00Z`,
    });
  });
});

let mockData = [...mockAttendanceRecords, ...additionalAttendanceRecords];
let nextId = Math.max(...mockData.map(a => a.id), 0) + 1;

const fetchAttendance = async (
  params?: GetAttendanceParams
): Promise<ApiResponse<AttendanceRecord[]>> => {
  await new Promise(resolve => setTimeout(resolve, 500));

  let filtered = [...mockData];

  if (params?.attendance_date) {
    filtered = filtered.filter(
      record => record.attendance_date === params.attendance_date
    );
  }

  if (params?.employee_id) {
    filtered = filtered.filter(
      record => record.employee_id === params.employee_id
    );
  }

  if (params?.status) {
    filtered = filtered.filter(record => record.status === params.status);
  }

  const page = params?.page || 1;
  const limit = params?.limit || 100;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginated = filtered.slice(startIndex, endIndex);

  return {
    success: true,
    message: 'Attendance records fetched successfully',
    data: paginated,
    meta: {
      total_count: filtered.length,
      current_page: page,
      total_pages: Math.ceil(filtered.length / limit),
    },
  };
};

const fetchAttendanceById = async (
  id: number
): Promise<ApiResponse<AttendanceRecord>> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const record = mockData.find(a => a.id === id);
  if (!record) {
    throw new Error('Attendance record not found');
  }
  return {
    success: true,
    message: 'Attendance record fetched successfully',
    data: record,
  };
};

const markAttendance = async (
  payload: MarkAttendancePayload
): Promise<ApiResponse<AttendanceRecord>> => {
  await new Promise(resolve => setTimeout(resolve, 500));

  const existingRecord = mockData.find(
    r =>
      r.employee_id === payload.employee_id &&
      r.attendance_date === payload.attendance_date
  );

  if (existingRecord) {
    existingRecord.status = payload.status;
    existingRecord.punch_in_time = payload.punch_in_time;
    existingRecord.punch_out_time = payload.punch_out_time;
    existingRecord.remarks = payload.remarks;

    if (payload.punch_in_time && payload.punch_out_time) {
      const [inHours, inMinutes] = payload.punch_in_time.split(':').map(Number);
      const [outHours, outMinutes] = payload.punch_out_time
        .split(':')
        .map(Number);
      const totalMinutes =
        outHours * 60 + outMinutes - (inHours * 60 + inMinutes);
      existingRecord.total_hours = Math.round((totalMinutes / 60) * 100) / 100;
    } else {
      existingRecord.total_hours = undefined;
    }

    existingRecord.updatedate = new Date().toISOString();
    return {
      success: true,
      message: 'Attendance updated successfully',
      data: existingRecord,
    };
  }

  let totalHours: number | undefined;
  if (payload.punch_in_time && payload.punch_out_time) {
    const [inHours, inMinutes] = payload.punch_in_time.split(':').map(Number);
    const [outHours, outMinutes] = payload.punch_out_time
      .split(':')
      .map(Number);
    const totalMinutes =
      outHours * 60 + outMinutes - (inHours * 60 + inMinutes);
    totalHours = Math.round((totalMinutes / 60) * 100) / 100;
  }

  const newRecord: AttendanceRecord = {
    id: nextId++,
    ...payload,
    employee_name: 'Employee Name',
    employee_email: 'employee@hrms.com',
    total_hours: totalHours,
    marked_by: 1,
    marked_by_name: 'HR Manager',
    createdate: new Date().toISOString(),
    updatedate: new Date().toISOString(),
  };
  mockData.push(newRecord);
  return {
    success: true,
    message: 'Attendance marked successfully',
    data: newRecord,
  };
};

const updateAttendance = async (
  payload: UpdateAttendancePayload
): Promise<ApiResponse<AttendanceRecord>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockData.findIndex(a => a.id === payload.id);
  if (index === -1) {
    throw new Error('Attendance record not found');
  }
  mockData[index] = {
    ...mockData[index],
    ...payload,
    updatedate: new Date().toISOString(),
  };
  return {
    success: true,
    message: 'Attendance updated successfully',
    data: mockData[index],
  };
};

export const attendanceKeys = {
  all: ['attendance'] as const,
  lists: () => [...attendanceKeys.all, 'list'] as const,
  list: (params?: GetAttendanceParams) =>
    [...attendanceKeys.lists(), params] as const,
  details: () => [...attendanceKeys.all, 'detail'] as const,
  detail: (id: number) => [...attendanceKeys.details(), id] as const,
};

export const useAttendance = (
  params?: GetAttendanceParams,
  options?: Omit<
    UseQueryOptions<ApiResponse<AttendanceRecord[]>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: attendanceKeys.list(params),
    queryFn: () => fetchAttendance(params),
    staleTime: 1 * 60 * 1000,
    ...options,
  });
};

export const useAttendanceRecord = (
  id: number,
  options?: Omit<
    UseQueryOptions<ApiResponse<AttendanceRecord>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: attendanceKeys.detail(id),
    queryFn: () => fetchAttendanceById(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
    ...options,
  });
};

export const useMarkAttendance = (options?: {
  onSuccess?: (
    data: ApiResponse<AttendanceRecord>,
    variables: MarkAttendancePayload
  ) => void;
  onError?: (error: any, variables: MarkAttendancePayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: MarkAttendancePayload) => markAttendance(payload),
    loadingMessage: 'Marking attendance...',
    invalidateQueries: ['attendance'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useUpdateAttendance = (options?: {
  onSuccess?: (
    data: ApiResponse<AttendanceRecord>,
    variables: UpdateAttendancePayload
  ) => void;
  onError?: (error: any, variables: UpdateAttendancePayload) => void;
}) => {
  return useApiMutation({
    mutationFn: (payload: UpdateAttendancePayload) => updateAttendance(payload),
    loadingMessage: 'Updating attendance...',
    invalidateQueries: ['attendance'],
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};
