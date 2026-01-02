import { Download } from '@mui/icons-material';
import { Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import dayjs from 'dayjs';
import {
  useAttendance,
  type AttendanceRecord,
  type AttendanceStatus,
} from 'hooks/useAttendance';
import { useEmployees } from 'hooks/useEmployees';
import { useExportToExcel } from 'hooks/useImportExport';
import {
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  TrendingUp,
  User,
  XCircle,
} from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import Input from 'shared/Input';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';

const AttendanceReports: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [employeeFilter, setEmployeeFilter] = useState<number | undefined>();
  const [departmentFilter, setDepartmentFilter] = useState<
    number | undefined
  >();
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);

  const { data: employeesResponse, isLoading: employeesLoading } = useEmployees(
    {
      isActive: 'Y',
      limit: 1000,
    }
  );

  const { data: attendanceResponse, isLoading: attendanceLoading } =
    useAttendance({
      employee_id: employeeFilter,
      department_id: departmentFilter,
      status:
        statusFilter !== 'all' ? (statusFilter as AttendanceStatus) : undefined,
      limit: 1000,
    });

  const employees = Array.isArray(employeesResponse?.data) ? employeesResponse.data : [];
  const attendanceRecords = Array.isArray(attendanceResponse?.data) ? attendanceResponse.data : [];

  const filteredAttendance = useMemo(() => {
    let filtered = [...attendanceRecords];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        record =>
          record.employee_name.toLowerCase().includes(searchLower) ||
          record.employee_email.toLowerCase().includes(searchLower) ||
          record.employee_department?.toLowerCase().includes(searchLower)
      );
    }

    if (dateFrom) {
      filtered = filtered.filter(
        record =>
          record.attendance_date &&
          dayjs(record.attendance_date).isAfter(
            dayjs(dateFrom).subtract(1, 'day')
          )
      );
    }

    if (dateTo) {
      filtered = filtered.filter(
        record =>
          record.attendance_date &&
          dayjs(record.attendance_date).isBefore(dayjs(dateTo).add(1, 'day'))
      );
    }

    return filtered;
  }, [attendanceRecords, search, dateFrom, dateTo]);

  const paginatedAttendance = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredAttendance.slice(startIndex, endIndex);
  }, [filteredAttendance, page, rowsPerPage]);

  React.useEffect(() => {
    setPage(0);
  }, [
    search,
    statusFilter,
    employeeFilter,
    departmentFilter,
    dateFrom,
    dateTo,
  ]);

  const stats = useMemo(() => {
    const totalRecords = filteredAttendance.length;
    const presentCount = filteredAttendance.filter(
      r => r.status === 'Present'
    ).length;
    const absentCount = filteredAttendance.filter(
      r => r.status === 'Absent'
    ).length;
    const halfDayCount = filteredAttendance.filter(
      r => r.status === 'Half Day'
    ).length;
    const leaveCount = filteredAttendance.filter(
      r => r.status === 'Leave'
    ).length;
    const holidayCount = filteredAttendance.filter(
      r => r.status === 'Holiday'
    ).length;
    const weekendCount = filteredAttendance.filter(
      r => r.status === 'Weekend'
    ).length;

    const totalHours = filteredAttendance.reduce(
      (sum, record) => sum + (record.total_hours || 0),
      0
    );
    const averageHours =
      totalRecords > 0 ? (totalHours / totalRecords).toFixed(1) : '0';

    const attendanceByDepartment = filteredAttendance.reduce(
      (acc, record) => {
        const dept = record.employee_department || 'Unknown';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const attendanceByStatus = filteredAttendance.reduce(
      (acc, record) => {
        acc[record.status] = (acc[record.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const presentRate =
      totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(1) : '0';

    return {
      totalRecords,
      presentCount,
      absentCount,
      halfDayCount,
      leaveCount,
      holidayCount,
      weekendCount,
      totalHours,
      averageHours,
      attendanceByDepartment,
      attendanceByStatus,
      presentRate,
    };
  }, [filteredAttendance]);

  const exportToExcelMutation = useExportToExcel();

  const handleExportToExcel = useCallback(async () => {
    try {
      await exportToExcelMutation.mutateAsync({
        tableName: 'attendance_reports',
        filters: {
          search,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          employee_id: employeeFilter,
          department_id: departmentFilter,
          date_from: dateFrom,
          date_to: dateTo,
        },
      });
    } catch (error) {
      console.error('Error exporting attendance reports to Excel:', error);
    }
  }, [
    exportToExcelMutation,
    search,
    statusFilter,
    employeeFilter,
    departmentFilter,
    dateFrom,
    dateTo,
  ]);

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'Present':
        return 'success';
      case 'Absent':
        return 'error';
      case 'Half Day':
        return 'warning';
      case 'Leave':
        return 'info';
      case 'Holiday':
        return 'default';
      case 'Weekend':
        return 'default';
      default:
        return 'default';
    }
  };

  const uniqueDepartments = useMemo(() => {
    const deptMap = new Map<number, string>();
    employees.forEach(emp => {
      if (emp.department_id && emp.department_name) {
        deptMap.set(emp.department_id, emp.department_name);
      }
    });
    return Array.from(deptMap.entries()).map(([id, name]) => ({ id, name }));
  }, [employees]);

  const attendanceColumns: TableColumn<AttendanceRecord>[] = [
    {
      id: 'employee_name',
      label: 'Employee Name',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.employee_name}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <User className="w-5 h-5" />
          </Avatar>
          <Box className="!max-w-xs">
            <Typography variant="body2" className="!font-medium !text-gray-900">
              {row.employee_name}
            </Typography>
            <Typography variant="caption" className="!text-gray-500">
              {row.employee_email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'employee_department',
      label: 'Department',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.employee_department || '-'}
        </Typography>
      ),
    },
    {
      id: 'attendance_date',
      label: 'Date',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {formatDate(row.attendance_date) || '-'}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (_value, row) => (
        <Chip
          label={row.status}
          color={getStatusColor(row.status)}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      id: 'punch_in_time',
      label: 'Punch In',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.punch_in_time || '-'}
        </Typography>
      ),
    },
    {
      id: 'punch_out_time',
      label: 'Punch Out',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.punch_out_time || '-'}
        </Typography>
      ),
    },
    {
      id: 'total_hours',
      label: 'Total Hours',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.total_hours ? `${row.total_hours} hrs` : '-'}
        </Typography>
      ),
    },
    {
      id: 'remarks',
      label: 'Remarks',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.remarks || '-'}
        </Typography>
      ),
    },
  ];

  const isLoading = attendanceLoading || employeesLoading;

  return (
    <div className="flex flex-col gap-5">
      <Box className="!flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">
            Attendance Reports
          </p>
          <p className="!text-gray-500 text-sm">
            Comprehensive reports on employee attendance, working hours, and
            attendance patterns
          </p>
        </Box>
        <PopConfirm
          title="Export Report to Excel"
          description="Are you sure you want to export the current attendance reports data to Excel? This will include all filtered results."
          onConfirm={handleExportToExcel}
        >
          <Button
            variant="outlined"
            startIcon={<Download />}
            disabled={exportToExcelMutation.isPending}
          >
            {exportToExcelMutation.isPending
              ? 'Exporting...'
              : 'Export to Excel'}
          </Button>
        </PopConfirm>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Total Records"
          value={stats.totalRecords}
          icon={<FileText className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Present"
          value={stats.presentCount}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Absent"
          value={stats.absentCount}
          icon={<XCircle className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
        <StatsCard
          title="Half Day"
          value={stats.halfDayCount}
          icon={<Clock className="w-6 h-6" />}
          color="orange"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="On Leave"
          value={stats.leaveCount}
          icon={<Calendar className="w-6 h-6" />}
          color="cyan"
          isLoading={isLoading}
        />
        <StatsCard
          title="Holidays"
          value={stats.holidayCount}
          icon={<Calendar className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
        <StatsCard
          title="Total Hours"
          value={`${stats.totalHours} hrs`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Present Rate"
          value={`${stats.presentRate}%`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
      </div>

      <Box className="!bg-white !shadow-sm !p-4 !rounded-lg !border !border-gray-100">
        <Typography
          variant="h6"
          className="!font-semibold !mb-4 !text-gray-900"
        >
          Filters
        </Typography>
        <Box className="!grid !grid-cols-1 md:!grid-cols-2 lg:!grid-cols-3 !gap-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search employees..."
            className="!w-full"
          />
          <Select
            value={statusFilter}
            setValue={setStatusFilter}
            label="Status"
            placeholder="All Statuses"
            fullWidth
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="Present">Present</MenuItem>
            <MenuItem value="Absent">Absent</MenuItem>
            <MenuItem value="Half Day">Half Day</MenuItem>
            <MenuItem value="Leave">Leave</MenuItem>
            <MenuItem value="Holiday">Holiday</MenuItem>
            <MenuItem value="Weekend">Weekend</MenuItem>
          </Select>
          <Select
            value={employeeFilter?.toString() || ''}
            setValue={value =>
              setEmployeeFilter(value ? Number(value) : undefined)
            }
            label="Employee"
            placeholder="All Employees"
            fullWidth
          >
            <MenuItem value="">All Employees</MenuItem>
            {employees.map(emp => (
              <MenuItem key={emp.id} value={emp.id.toString()}>
                {emp.name}
              </MenuItem>
            ))}
          </Select>
          <Select
            value={departmentFilter?.toString() || ''}
            setValue={value =>
              setDepartmentFilter(value ? Number(value) : undefined)
            }
            label="Department"
            placeholder="All Departments"
            fullWidth
          >
            <MenuItem value="">All Departments</MenuItem>
            {uniqueDepartments.map(dept => (
              <MenuItem key={dept.id} value={dept.id.toString()}>
                {dept.name}
              </MenuItem>
            ))}
          </Select>
          <Input
            type="date"
            label="Date From"
            value={dateFrom}
            setValue={setDateFrom}
            fullWidth
          />
          <Input
            type="date"
            label="Date To"
            value={dateTo}
            setValue={setDateTo}
            fullWidth
          />
        </Box>
      </Box>

      <Table
        actions={
          <div className="!flex !justify-between !items-center">
            <Typography className="!font-semibold !text-gray-900">
              Attendance Records Report
            </Typography>
          </div>
        }
        data={paginatedAttendance}
        columns={attendanceColumns}
        getRowId={row => row.id}
        loading={isLoading}
        totalCount={filteredAttendance.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        emptyMessage="No attendance records found"
      />
    </div>
  );
};

export default AttendanceReports;
