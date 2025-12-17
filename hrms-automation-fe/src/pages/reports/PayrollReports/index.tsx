import { Download } from '@mui/icons-material';
import { Avatar, Box, Chip, MenuItem, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useEmployees } from 'hooks/useEmployees';
import { useExportToExcel } from 'hooks/useImportExport';
import {
  usePayrollProcessing,
  type PayrollProcessing,
  type PayrollStatus,
} from 'hooks/usePayrollProcessing';
import { useSalarySlips, type SalarySlip } from 'hooks/useSalarySlips';
import {
  Briefcase,
  CheckCircle,
  Clock,
  DollarSign,
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

const PayrollReports: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [employeeFilter, setEmployeeFilter] = useState<number | undefined>();
  const [departmentFilter, setDepartmentFilter] = useState<
    number | undefined
  >();
  const [monthFilter, setMonthFilter] = useState<string>('');
  const [yearFilter, setYearFilter] = useState<number | ''>('');
  const [payrollPage, setPayrollPage] = useState(0);
  const [payrollRowsPerPage, setPayrollRowsPerPage] = useState(10);
  const [slipsPage, setSlipsPage] = useState(0);
  const [slipsRowsPerPage, setSlipsRowsPerPage] = useState(10);

  const { data: employeesResponse, isLoading: employeesLoading } = useEmployees(
    {
      isActive: 'Y',
      limit: 1000,
    }
  );

  const { data: payrollProcessingResponse, isLoading: payrollLoading } =
    usePayrollProcessing({
      search,
      status:
        statusFilter !== 'all' ? (statusFilter as PayrollStatus) : undefined,
      employeeId: employeeFilter,
      payrollMonth: monthFilter || undefined,
      payrollYear: yearFilter ? Number(yearFilter) : undefined,
      limit: 1000,
    });

  const { data: salarySlipsResponse, isLoading: salarySlipsLoading } =
    useSalarySlips({
      search,
      employeeId: employeeFilter,
      payrollMonth: monthFilter || undefined,
      payrollYear: yearFilter ? Number(yearFilter) : undefined,
      status:
        statusFilter !== 'all' ? (statusFilter as PayrollStatus) : undefined,
      limit: 1000,
    });

  const employees = employeesResponse?.data || [];
  const payrollProcessing = payrollProcessingResponse?.data || [];
  const salarySlips = salarySlipsResponse?.data || [];

  const filteredPayrollProcessing = useMemo(() => {
    let filtered = [...payrollProcessing];

    if (departmentFilter) {
      filtered = filtered.filter(payroll =>
        payroll.items.some(item => {
          const emp = employees.find(e => e.id === item.employee_id);
          return emp?.department_id === departmentFilter;
        })
      );
    }

    return filtered;
  }, [payrollProcessing, departmentFilter, employees]);

  const filteredSalarySlips = useMemo(() => {
    let filtered = [...salarySlips];

    if (departmentFilter) {
      filtered = filtered.filter(slip => {
        const emp = employees.find(e => e.id === slip.employee_id);
        return emp?.department_id === departmentFilter;
      });
    }

    return filtered;
  }, [salarySlips, departmentFilter, employees]);

  const paginatedPayrollProcessing = useMemo(() => {
    const startIndex = payrollPage * payrollRowsPerPage;
    const endIndex = startIndex + payrollRowsPerPage;
    return filteredPayrollProcessing.slice(startIndex, endIndex);
  }, [filteredPayrollProcessing, payrollPage, payrollRowsPerPage]);

  const paginatedSalarySlips = useMemo(() => {
    const startIndex = slipsPage * slipsRowsPerPage;
    const endIndex = startIndex + slipsRowsPerPage;
    return filteredSalarySlips.slice(startIndex, endIndex);
  }, [filteredSalarySlips, slipsPage, slipsRowsPerPage]);

  React.useEffect(() => {
    setPayrollPage(0);
    setSlipsPage(0);
  }, [
    search,
    statusFilter,
    employeeFilter,
    departmentFilter,
    monthFilter,
    yearFilter,
  ]);

  const stats = useMemo(() => {
    const totalPayrollRecords = filteredPayrollProcessing.length;
    const totalProcessed = filteredPayrollProcessing.filter(
      p => p.status === 'Processed'
    ).length;
    const totalPaid = filteredPayrollProcessing.filter(
      p => p.status === 'Paid'
    ).length;
    const totalDraft = filteredPayrollProcessing.filter(
      p => p.status === 'Draft'
    ).length;

    const totalEarnings = filteredPayrollProcessing.reduce(
      (sum, p) => sum + p.total_earnings,
      0
    );
    const totalDeductions = filteredPayrollProcessing.reduce(
      (sum, p) => sum + p.total_deductions,
      0
    );
    const totalLeaveDeductions = filteredPayrollProcessing.reduce(
      (sum, p) => sum + p.total_leave_deductions,
      0
    );
    const totalNetSalary = filteredPayrollProcessing.reduce(
      (sum, p) => sum + p.total_net_salary,
      0
    );

    return {
      totalPayrollRecords,
      totalProcessed,
      totalPaid,
      totalDraft,
      totalEarnings,
      totalDeductions,
      totalLeaveDeductions,
      totalNetSalary,
    };
  }, [filteredPayrollProcessing]);

  const exportToExcelMutation = useExportToExcel();

  const handleExportToExcel = useCallback(async () => {
    try {
      await exportToExcelMutation.mutateAsync({
        tableName: 'payroll_reports',
        filters: {
          search,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          employee_id: employeeFilter,
          department_id: departmentFilter,
          payroll_month: monthFilter,
          payroll_year: yearFilter,
        },
      });
    } catch (error) {
      console.error('Error exporting payroll reports to Excel:', error);
    }
  }, [
    exportToExcelMutation,
    search,
    statusFilter,
    employeeFilter,
    departmentFilter,
    monthFilter,
    yearFilter,
  ]);

  const getStatusColor = (status: PayrollStatus) => {
    switch (status) {
      case 'Draft':
        return 'default';
      case 'Processed':
        return 'info';
      case 'Paid':
        return 'success';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getMonthName = (month: string) => {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const monthNum = parseInt(month, 10);
    return monthNames[monthNum - 1] || month;
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

  const payrollProcessingColumns: TableColumn<PayrollProcessing>[] = [
    {
      id: 'payroll_month',
      label: 'Payroll Period',
      render: (_value, row) => (
        <Typography variant="body2" className="!font-medium !text-gray-900">
          {getMonthName(row.payroll_month)} {row.payroll_year}
        </Typography>
      ),
    },
    {
      id: 'processing_date',
      label: 'Processing Date',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {formatDate(row.processing_date) || '-'}
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
      id: 'total_employees',
      label: 'Employees',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.total_employees}
        </Typography>
      ),
    },
    {
      id: 'total_earnings',
      label: 'Total Earnings',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          ₹{row.total_earnings.toLocaleString()}
        </Typography>
      ),
    },
    {
      id: 'total_deductions',
      label: 'Total Deductions',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          ₹{row.total_deductions.toLocaleString()}
        </Typography>
      ),
    },
    {
      id: 'total_leave_deductions',
      label: 'Leave Deductions',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          ₹{row.total_leave_deductions.toLocaleString()}
        </Typography>
      ),
    },
    {
      id: 'total_net_salary',
      label: 'Net Salary',
      render: (_value, row) => (
        <Typography variant="body2" className="!font-medium !text-gray-900">
          ₹{row.total_net_salary.toLocaleString()}
        </Typography>
      ),
    },
  ];

  const salarySlipColumns: TableColumn<SalarySlip>[] = [
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
      id: 'payroll_month',
      label: 'Payroll Period',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {getMonthName(row.payroll_month)} {row.payroll_year}
        </Typography>
      ),
    },
    {
      id: 'basic_salary',
      label: 'Basic Salary',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          ₹{row.basic_salary.toLocaleString()}
        </Typography>
      ),
    },
    {
      id: 'total_earnings',
      label: 'Earnings',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          ₹{row.total_earnings.toLocaleString()}
        </Typography>
      ),
    },
    {
      id: 'total_deductions',
      label: 'Deductions',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          ₹{row.total_deductions.toLocaleString()}
        </Typography>
      ),
    },
    {
      id: 'leave_deductions',
      label: 'Leave Deductions',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          ₹{row.leave_deductions.toLocaleString()}
        </Typography>
      ),
    },
    {
      id: 'net_salary',
      label: 'Net Salary',
      render: (_value, row) => (
        <Typography variant="body2" className="!font-medium !text-gray-900">
          ₹{row.net_salary.toLocaleString()}
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
      id: 'processed_date',
      label: 'Processed Date',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {formatDate(row.processed_date) || '-'}
        </Typography>
      ),
    },
  ];

  const isLoading = payrollLoading || salarySlipsLoading || employeesLoading;

  const monthOptions = [
    { value: '', label: 'All Months' },
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i).map(
    year => ({ value: year, label: year.toString() })
  );

  return (
    <div className="flex flex-col gap-5">
      <Box className="!flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">Payroll Reports</p>
          <p className="!text-gray-500 text-sm">
            Comprehensive reports on payroll processing, salary slips, and
            financial summaries
          </p>
        </Box>
        <PopConfirm
          title="Export Report to Excel"
          description="Are you sure you want to export the current payroll reports data to Excel? This will include all filtered results."
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
          title="Total Payroll Records"
          value={stats.totalPayrollRecords}
          icon={<FileText className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Processed"
          value={stats.totalProcessed}
          icon={<CheckCircle className="w-6 h-6" />}
          color="indigo"
          isLoading={isLoading}
        />
        <StatsCard
          title="Paid"
          value={stats.totalPaid}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Draft"
          value={stats.totalDraft}
          icon={<Clock className="w-6 h-6" />}
          color="orange"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Total Earnings"
          value={`₹${stats.totalEarnings.toLocaleString()}`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Total Deductions"
          value={`₹${stats.totalDeductions.toLocaleString()}`}
          icon={<TrendingDown className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
        <StatsCard
          title="Leave Deductions"
          value={`₹${stats.totalLeaveDeductions.toLocaleString()}`}
          icon={<XCircle className="w-6 h-6" />}
          color="orange"
          isLoading={isLoading}
        />
        <StatsCard
          title="Net Salary"
          value={`₹${stats.totalNetSalary.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6" />}
          color="blue"
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
            <MenuItem value="Draft">Draft</MenuItem>
            <MenuItem value="Processed">Processed</MenuItem>
            <MenuItem value="Paid">Paid</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
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
          <Select
            value={monthFilter}
            setValue={setMonthFilter}
            label="Month"
            placeholder="All Months"
            fullWidth
          >
            {monthOptions.map(month => (
              <MenuItem key={month.value} value={month.value}>
                {month.label}
              </MenuItem>
            ))}
          </Select>
          <Select
            value={yearFilter?.toString() || ''}
            setValue={value => setYearFilter(value ? Number(value) : '')}
            label="Year"
            placeholder="All Years"
            fullWidth
          >
            <MenuItem value="">All Years</MenuItem>
            {yearOptions.map(year => (
              <MenuItem key={year.value} value={year.value.toString()}>
                {year.label}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      <Table
        actions={
          <div className="!flex !justify-between !items-center">
            <Typography className="!font-semibold !text-gray-900">
              Payroll Processing Report
            </Typography>
          </div>
        }
        data={paginatedPayrollProcessing}
        columns={payrollProcessingColumns}
        getRowId={row => row.id}
        loading={isLoading}
        totalCount={filteredPayrollProcessing.length}
        page={payrollPage}
        rowsPerPage={payrollRowsPerPage}
        onPageChange={setPayrollPage}
        emptyMessage="No payroll processing records found"
      />

      <Table
        actions={
          <div className="!flex !justify-between !items-center">
            <Typography className="!font-semibold !text-gray-900">
              Salary Slips Report
            </Typography>
          </div>
        }
        data={paginatedSalarySlips}
        columns={salarySlipColumns}
        getRowId={row => row.id}
        loading={isLoading}
        totalCount={filteredSalarySlips.length}
        page={slipsPage}
        rowsPerPage={slipsRowsPerPage}
        onPageChange={setSlipsPage}
        emptyMessage="No salary slips found"
      />
    </div>
  );
};

export default PayrollReports;
