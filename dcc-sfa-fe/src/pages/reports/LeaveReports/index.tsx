import { Download } from '@mui/icons-material';
import { Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useEmployees } from 'hooks/useEmployees';
import { useExportToExcel } from 'hooks/useImportExport';
import {
  useLeaveApplications,
  type LeaveApplication,
  type ApprovalStatus,
  type LeaveType,
} from 'hooks/useLeaveApplications';
import { useLeaveBalances } from 'hooks/useLeaveBalances';
import {
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  TrendingDown,
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

const LeaveReports: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>('all');
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

  const {
    data: leaveApplicationsResponse,
    isLoading: leaveApplicationsLoading,
  } = useLeaveApplications({
    search,
    approvalStatus:
      statusFilter !== 'all' ? (statusFilter as ApprovalStatus) : undefined,
    leaveType:
      leaveTypeFilter !== 'all' ? (leaveTypeFilter as LeaveType) : undefined,
    employeeId: employeeFilter,
    startDate: dateFrom || undefined,
    endDate: dateTo || undefined,
    limit: 1000,
  });

  const { data: leaveBalancesResponse, isLoading: leaveBalancesLoading } =
    useLeaveBalances({
      limit: 1000,
    });

  const employees = employeesResponse?.data || [];
  const leaveApplications = leaveApplicationsResponse?.data || [];
  const leaveBalances = leaveBalancesResponse?.data || [];

  const filteredLeaveApplications = useMemo(() => {
    let filtered = [...leaveApplications];

    if (departmentFilter) {
      filtered = filtered.filter(app => {
        const emp = employees.find(e => e.id === app.employee_id);
        return emp?.department_id === departmentFilter;
      });
    }

    return filtered;
  }, [leaveApplications, departmentFilter, employees]);

  const paginatedLeaveApplications = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredLeaveApplications.slice(startIndex, endIndex);
  }, [filteredLeaveApplications, page, rowsPerPage]);

  React.useEffect(() => {
    setPage(0);
  }, [
    search,
    statusFilter,
    leaveTypeFilter,
    employeeFilter,
    departmentFilter,
    dateFrom,
    dateTo,
  ]);

  const stats = useMemo(() => {
    const totalApplications = filteredLeaveApplications.length;
    const pendingCount = filteredLeaveApplications.filter(
      app => app.approval_status === 'Pending'
    ).length;
    const approvedCount = filteredLeaveApplications.filter(
      app => app.approval_status === 'Approved'
    ).length;
    const rejectedCount = filteredLeaveApplications.filter(
      app => app.approval_status === 'Rejected'
    ).length;
    const cancelledCount = filteredLeaveApplications.filter(
      app => app.approval_status === 'Cancelled'
    ).length;

    const totalDays = filteredLeaveApplications.reduce(
      (sum, app) => sum + app.total_days,
      0
    );
    const averageDays =
      totalApplications > 0 ? (totalDays / totalApplications).toFixed(1) : '0';

    const applicationsByLeaveType = filteredLeaveApplications.reduce(
      (acc, app) => {
        acc[app.leave_type] = (acc[app.leave_type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const applicationsByStatus = filteredLeaveApplications.reduce(
      (acc, app) => {
        acc[app.approval_status] = (acc[app.approval_status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const applicationsByDepartment = filteredLeaveApplications.reduce(
      (acc, app) => {
        const emp = employees.find(e => e.id === app.employee_id);
        const dept = emp?.department_name || 'Unknown';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const totalAllocated = leaveBalances.reduce((sum, balance) => {
      return (
        sum +
        balance.leave_type_items.reduce(
          (itemSum, item) => itemSum + item.total_allocated,
          0
        )
      );
    }, 0);

    const totalUsed = leaveBalances.reduce((sum, balance) => {
      return (
        sum +
        balance.leave_type_items.reduce(
          (itemSum, item) => itemSum + item.used,
          0
        )
      );
    }, 0);

    const totalBalance = leaveBalances.reduce((sum, balance) => {
      return (
        sum +
        balance.leave_type_items.reduce(
          (itemSum, item) => itemSum + item.leave_balance,
          0
        )
      );
    }, 0);

    return {
      totalApplications,
      pendingCount,
      approvedCount,
      rejectedCount,
      cancelledCount,
      totalDays,
      averageDays,
      applicationsByLeaveType,
      applicationsByStatus,
      applicationsByDepartment,
      totalAllocated,
      totalUsed,
      totalBalance,
    };
  }, [filteredLeaveApplications, employees, leaveBalances]);

  const exportToExcelMutation = useExportToExcel();

  const handleExportToExcel = useCallback(async () => {
    try {
      await exportToExcelMutation.mutateAsync({
        tableName: 'leave_reports',
        filters: {
          search,
          approval_status: statusFilter !== 'all' ? statusFilter : undefined,
          leave_type: leaveTypeFilter !== 'all' ? leaveTypeFilter : undefined,
          employee_id: employeeFilter,
          department_id: departmentFilter,
          start_date: dateFrom,
          end_date: dateTo,
        },
      });
    } catch (error) {
      console.error('Error exporting leave reports to Excel:', error);
    }
  }, [
    exportToExcelMutation,
    search,
    statusFilter,
    leaveTypeFilter,
    employeeFilter,
    departmentFilter,
    dateFrom,
    dateTo,
  ]);

  const getStatusColor = (status: ApprovalStatus) => {
    switch (status) {
      case 'Pending':
        return 'warning';
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'error';
      case 'Cancelled':
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

  const leaveTypeOptions: LeaveType[] = [
    'Annual',
    'Sick',
    'Casual',
    'Emergency',
    'Maternity',
    'Paternity',
    'Unpaid',
    'Marriage',
    'Earned',
    'Informal',
    'Formal',
    'Normal',
  ];

  const leaveApplicationColumns: TableColumn<LeaveApplication>[] = [
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
      id: 'leave_type',
      label: 'Leave Type',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.leave_type}
        </Typography>
      ),
    },
    {
      id: 'start_date',
      label: 'Start Date',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {formatDate(row.start_date) || '-'}
        </Typography>
      ),
    },
    {
      id: 'end_date',
      label: 'End Date',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {formatDate(row.end_date) || '-'}
        </Typography>
      ),
    },
    {
      id: 'total_days',
      label: 'Total Days',
      render: (_value, row) => (
        <Typography variant="body2" className="!font-medium !text-gray-900">
          {row.total_days} {row.total_days === 1 ? 'day' : 'days'}
        </Typography>
      ),
    },
    {
      id: 'approval_status',
      label: 'Status',
      render: (_value, row) => (
        <Chip
          label={row.approval_status}
          color={getStatusColor(row.approval_status)}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      id: 'approved_by_name',
      label: 'Approved By',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.approved_by_name || '-'}
        </Typography>
      ),
    },
    {
      id: 'approved_date',
      label: 'Approved Date',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {formatDate(row.approved_date) || '-'}
        </Typography>
      ),
    },
    {
      id: 'reason',
      label: 'Reason',
      render: (_value, row) => (
        <Typography
          variant="body2"
          className="!text-gray-900 !max-w-xs !truncate"
          title={row.reason}
        >
          {row.reason || '-'}
        </Typography>
      ),
    },
  ];

  const isLoading =
    leaveApplicationsLoading || employeesLoading || leaveBalancesLoading;

  return (
    <div className="flex flex-col gap-5">
      <Box className="!flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">Leave Reports</p>
          <p className="!text-gray-500 text-sm">
            Comprehensive reports on leave applications, approvals, and leave
            balances
          </p>
        </Box>
        <PopConfirm
          title="Export Report to Excel"
          description="Are you sure you want to export the current leave reports data to Excel? This will include all filtered results."
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
          title="Total Applications"
          value={stats.totalApplications}
          icon={<FileText className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Pending"
          value={stats.pendingCount}
          icon={<Clock className="w-6 h-6" />}
          color="orange"
          isLoading={isLoading}
        />
        <StatsCard
          title="Approved"
          value={stats.approvedCount}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Rejected"
          value={stats.rejectedCount}
          icon={<XCircle className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Total Days"
          value={stats.totalDays}
          icon={<Calendar className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Average Days"
          value={stats.averageDays}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Total Allocated"
          value={stats.totalAllocated}
          icon={<TrendingUp className="w-6 h-6" />}
          color="indigo"
          isLoading={isLoading}
        />
        <StatsCard
          title="Total Used"
          value={stats.totalUsed}
          icon={<TrendingDown className="w-6 h-6" />}
          color="orange"
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
            label="Approval Status"
            placeholder="All Statuses"
            fullWidth
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </Select>
          <Select
            value={leaveTypeFilter}
            setValue={setLeaveTypeFilter}
            label="Leave Type"
            placeholder="All Leave Types"
            fullWidth
          >
            <MenuItem value="all">All Leave Types</MenuItem>
            {leaveTypeOptions.map(type => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
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
            label="Start Date From"
            value={dateFrom}
            setValue={setDateFrom}
            fullWidth
          />
          <Input
            type="date"
            label="Start Date To"
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
              Leave Applications Report
            </Typography>
          </div>
        }
        data={paginatedLeaveApplications}
        columns={leaveApplicationColumns}
        getRowId={row => row.id}
        loading={isLoading}
        totalCount={filteredLeaveApplications.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        emptyMessage="No leave applications found"
      />
    </div>
  );
};

export default LeaveReports;
