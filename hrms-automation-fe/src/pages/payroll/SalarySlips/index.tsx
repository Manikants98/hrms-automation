import { Download, Visibility } from '@mui/icons-material';
import { Alert, Box, Chip, MenuItem, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useEmployees } from 'hooks/useEmployees';
import { useExportToExcel } from 'hooks/useImportExport';
import { usePermission } from 'hooks/usePermission';
import {
  useSalarySlips,
  type PayrollStatus,
  type SalarySlip,
} from 'hooks/useSalarySlips';
import { Calendar, DollarSign, FileText, TrendingUp } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { ActionButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import ViewSalarySlip from './ViewSalarySlip';

const SalarySlipsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PayrollStatus | 'all'>(
    'all'
  );
  const [employeeFilter, setEmployeeFilter] = useState<number | ''>('');
  const [monthFilter, setMonthFilter] = useState<string>('');
  const [yearFilter, setYearFilter] = useState<number | ''>('');
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedSalarySlip, setSelectedSalarySlip] =
    useState<SalarySlip | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isRead } = usePermission('user' as any);

  const {
    data: salarySlipsResponse,
    isLoading,
    error,
  } = useSalarySlips(
    {
      search,
      page,
      limit,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      employeeId: employeeFilter ? Number(employeeFilter) : undefined,
      payrollMonth: monthFilter || undefined,
      payrollYear: yearFilter ? Number(yearFilter) : undefined,
    },
    {
      enabled: isRead !== false,
    }
  );

  const { data: employeesResponse } = useEmployees({
    isActive: 'Y',
    limit: 1000,
  });

  const salarySlips = salarySlipsResponse?.data || [];
  const totalCount = salarySlipsResponse?.meta?.total_count || 0;
  const currentPage = (salarySlipsResponse?.meta?.current_page || 1) - 1;
  const employees = employeesResponse?.data || [];

  const exportToExcelMutation = useExportToExcel();

  const stats = salarySlipsResponse?.stats as any;
  const totalPaid = stats?.total_paid ?? 0;
  const totalProcessed = stats?.total_processed ?? 0;
  const totalDraft = stats?.total_draft ?? 0;
  const totalNetSalary = stats?.total_net_salary ?? 0;

  const handleViewSalarySlip = useCallback((slip: SalarySlip) => {
    setSelectedSalarySlip(slip);
    setDetailDrawerOpen(true);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    setPage(newPage + 1);
  };

  const handleExportToExcel = useCallback(async () => {
    try {
      const filters = {
        search,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        employeeId: employeeFilter ? Number(employeeFilter) : undefined,
        payrollMonth: monthFilter || undefined,
        payrollYear: yearFilter ? Number(yearFilter) : undefined,
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'salary_slips',
        filters,
      });
    } catch (error) {
      console.error('Error exporting salary slips:', error);
    }
  }, [
    exportToExcelMutation,
    search,
    statusFilter,
    employeeFilter,
    monthFilter,
    yearFilter,
  ]);

  const getStatusColor = (status: PayrollStatus) => {
    switch (status) {
      case 'Processed':
        return 'success';
      case 'Paid':
        return 'info';
      case 'Draft':
        return 'warning';
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

  const salarySlipsColumns: TableColumn<SalarySlip>[] = [
    {
      id: 'employee_name',
      label: 'Employee',
      render: (_value, row) => (
        <Box>
          <Typography variant="body1" className="!font-medium !text-gray-900">
            {row.employee_name}
          </Typography>
          <Typography variant="caption" className="!text-gray-500">
            {row.employee_code || '-'} | {row.employee_email || '-'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'payroll_period',
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
      label: 'Total Earnings',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-green-600 !font-medium">
          ₹{row.total_earnings.toLocaleString()}
        </Typography>
      ),
    },
    {
      id: 'total_deductions',
      label: 'Total Deductions',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-red-600 !font-medium">
          ₹{row.total_deductions.toLocaleString()}
        </Typography>
      ),
    },
    {
      id: 'leave_deductions',
      label: 'Leave Deductions',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-orange-600 !font-medium">
          ₹{row.leave_deductions.toLocaleString()}
        </Typography>
      ),
    },
    {
      id: 'net_salary',
      label: 'Net Salary',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-blue-600 !font-semibold">
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
          color={getStatusColor(row.status) as any}
          size="small"
        />
      ),
    },
    {
      id: 'paid_date',
      label: 'Paid Date',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.paid_date ? dayjs(row.paid_date).format('DD-MM-YYYY') : '-'}
        </Typography>
      ),
    },
    ...(isUpdate || isRead
      ? [
          {
            id: 'action',
            label: 'Actions',
            sortable: false,
            render: (_value: any, row: SalarySlip) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <ActionButton
                    onClick={() => handleViewSalarySlip(row)}
                    tooltip={`View Salary Slip for ${row.employee_name} - ${getMonthName(row.payroll_month)} ${row.payroll_year}`}
                    icon={<Visibility fontSize="small" />}
                    color="info"
                  />
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const month = String(i + 1).padStart(2, '0');
    return { value: month, label: getMonthName(month) };
  });

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <>
      <Box className="!mb-3 !flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">Salary Slips</p>
          <p className="!text-gray-500 text-sm">
            View and manage employee salary slips
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Paid"
          value={totalPaid}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Total Processed"
          value={totalProcessed}
          icon={<FileText className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Total Draft"
          value={totalDraft}
          icon={<Calendar className="w-6 h-6" />}
          color="orange"
          isLoading={isLoading}
        />
        <StatsCard
          title="Total Net Salary"
          value={`₹${totalNetSalary.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load salary slips. Please try again.
        </Alert>
      )}

      <Table
        data={salarySlips}
        columns={salarySlipsColumns}
        compact
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Salary Slips"
                      value={search}
                      onChange={handleSearchChange}
                      debounceMs={400}
                      showClear={true}
                      className="!w-80"
                    />
                    <Select
                      value={statusFilter}
                      setValue={val => {
                        setStatusFilter((val as PayrollStatus) || 'all');
                      }}
                      size="small"
                      className="!w-40"
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="Draft">Draft</MenuItem>
                      <MenuItem value="Processed">Processed</MenuItem>
                      <MenuItem value="Paid">Paid</MenuItem>
                      <MenuItem value="Cancelled">Cancelled</MenuItem>
                    </Select>
                    <Select
                      value={employeeFilter || ''}
                      setValue={val => {
                        setEmployeeFilter(val ? Number(val) : '');
                        setPage(1);
                      }}
                      size="small"
                      className="!w-40"
                      placeholder="All Employees"
                    >
                      <MenuItem value="">All Employees</MenuItem>
                      {employees.map(emp => (
                        <MenuItem key={emp.id} value={emp.id}>
                          {emp.name}
                        </MenuItem>
                      ))}
                    </Select>
                    <Select
                      value={monthFilter}
                      setValue={val => {
                        setMonthFilter(String(val || ''));
                        setPage(1);
                      }}
                      size="small"
                      className="!w-40"
                      placeholder="All Months"
                    >
                      <MenuItem value="">All Months</MenuItem>
                      {monthOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    <Select
                      value={yearFilter || ''}
                      setValue={val => {
                        setYearFilter(val ? Number(val) : '');
                        setPage(1);
                      }}
                      size="small"
                      className="!w-40"
                      placeholder="All Years"
                    >
                      <MenuItem value="">All Years</MenuItem>
                      {yearOptions.map(year => (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      ))}
                    </Select>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isRead && (
                  <PopConfirm
                    title="Export Salary Slips"
                    description="Are you sure you want to export the current salary slips data to Excel? This will include all filtered results."
                    onConfirm={handleExportToExcel}
                    confirmText="Export"
                    cancelText="Cancel"
                    placement="top"
                  >
                    <Button
                      variant="outlined"
                      className="!capitalize"
                      startIcon={<Download />}
                      disabled={exportToExcelMutation.isPending}
                    >
                      {exportToExcelMutation.isPending
                        ? 'Exporting...'
                        : 'Export'}
                    </Button>
                  </PopConfirm>
                )}
              </div>
            </div>
          ) : (
            false
          )
        }
        getRowId={slip => slip.id}
        initialOrderBy="processed_date"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead !== false}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No salary slips found matching "${search}"`
            : 'No salary slips found in the system'
        }
      />

      <ViewSalarySlip
        selectedSalarySlip={selectedSalarySlip}
        setSelectedSalarySlip={setSelectedSalarySlip}
        drawerOpen={detailDrawerOpen}
        setDrawerOpen={setDetailDrawerOpen}
      />
    </>
  );
};

export default SalarySlipsPage;
