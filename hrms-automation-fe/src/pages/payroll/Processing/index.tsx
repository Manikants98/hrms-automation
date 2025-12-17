import { Add, Download, Visibility } from '@mui/icons-material';
import {
  Alert,
  Box,
  Chip,
  FormControl,
  MenuItem,
  Select as MuiSelect,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { useExportToExcel } from 'hooks/useImportExport';
import {
  useDeletePayrollProcessing,
  usePayrollProcessing,
  type PayrollProcessing,
  type PayrollStatus,
} from 'hooks/usePayrollProcessing';
import { usePermission } from 'hooks/usePermission';
import { Calendar, DollarSign, FileText, TrendingUp } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { ActionButton, DeleteButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import ProcessPayroll from './ProcessPayroll';
import ViewPayrollDetails from './ViewPayrollDetails';

const PayrollProcessingPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PayrollStatus | 'all'>(
    'all'
  );
  const [monthFilter, setMonthFilter] = useState<string>('');
  const [yearFilter, setYearFilter] = useState<number | ''>('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] =
    useState<PayrollProcessing | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission('user' as any);

  const {
    data: payrollProcessingResponse,
    isLoading,
    error,
    refetch,
  } = usePayrollProcessing(
    {
      search,
      page,
      limit,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      payrollMonth: monthFilter || undefined,
      payrollYear: yearFilter ? Number(yearFilter) : undefined,
    },
    {
      enabled: isRead !== false,
    }
  );

  const payrollProcessing = payrollProcessingResponse?.data || [];
  const totalCount = payrollProcessingResponse?.meta?.total_count || 0;
  const currentPage = (payrollProcessingResponse?.meta?.current_page || 1) - 1;

  const deletePayrollProcessingMutation = useDeletePayrollProcessing();
  const exportToExcelMutation = useExportToExcel();

  const stats = payrollProcessingResponse?.stats as any;
  const totalProcessed = stats?.total_processed ?? payrollProcessing.length;
  const totalPaid = stats?.total_paid ?? 0;
  const totalDraft = stats?.total_draft ?? 0;
  const totalNetSalary = stats?.total_net_salary ?? 0;

  const handleProcessPayroll = useCallback(() => {
    setDrawerOpen(true);
  }, []);

  const handleViewPayrollDetails = useCallback((payroll: PayrollProcessing) => {
    setSelectedPayroll(payroll);
    setDetailDrawerOpen(true);
  }, []);

  const handleDeletePayrollProcessing = useCallback(
    async (id: number) => {
      try {
        await deletePayrollProcessingMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting payroll processing:', error);
      }
    },
    [deletePayrollProcessingMutation]
  );

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
        payrollMonth: monthFilter || undefined,
        payrollYear: yearFilter ? Number(yearFilter) : undefined,
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'payroll_processing',
        filters,
      });
    } catch (error) {
      console.error('Error exporting payroll processing:', error);
    }
  }, [exportToExcelMutation, search, statusFilter, monthFilter, yearFilter]);

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

  const payrollProcessingColumns: TableColumn<PayrollProcessing>[] = [
    {
      id: 'payroll_period',
      label: 'Payroll Period',
      render: (_value, row) => (
        <Box>
          <Typography variant="body1" className="!font-medium !text-gray-900">
            {getMonthName(row.payroll_month)} {row.payroll_year}
          </Typography>
          <Typography variant="caption" className="!text-gray-500">
            Processed: {dayjs(row.processing_date).format('DD-MM-YYYY')}
          </Typography>
        </Box>
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
      id: 'total_leave_deductions',
      label: 'Leave Deductions',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-orange-600 !font-medium">
          ₹{row.total_leave_deductions.toLocaleString()}
        </Typography>
      ),
    },
    {
      id: 'total_net_salary',
      label: 'Net Salary',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-blue-600 !font-semibold">
          ₹{row.total_net_salary.toLocaleString()}
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
      id: 'processed_by',
      label: 'Processed By',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.processed_by_name || '-'}
        </Typography>
      ),
    },
    ...(isUpdate || isDelete || isRead
      ? [
          {
            id: 'action',
            label: 'Actions',
            sortable: false,
            render: (_value: any, row: PayrollProcessing) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <ActionButton
                    onClick={() => handleViewPayrollDetails(row)}
                    tooltip={`View ${getMonthName(row.payroll_month)} ${row.payroll_year} Payroll Details`}
                    icon={<Visibility fontSize="small" />}
                    color="info"
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeletePayrollProcessing(row.id)}
                    tooltip={`Delete ${getMonthName(row.payroll_month)} ${row.payroll_year} Payroll`}
                    itemName={`${getMonthName(row.payroll_month)} ${row.payroll_year} payroll`}
                    confirmDelete={true}
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
          <p className="!font-bold text-xl !text-gray-900">
            Payroll Processing
          </p>
          <p className="!text-gray-500 text-sm">
            Process and manage employee payroll with leave deductions
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Processed"
          value={totalProcessed}
          icon={<FileText className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Total Paid"
          value={totalPaid}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
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
          Failed to load payroll processing records. Please try again.
        </Alert>
      )}

      <Table
        data={payrollProcessing}
        columns={payrollProcessingColumns}
        compact
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Payroll Processing"
                      value={search}
                      onChange={handleSearchChange}
                      debounceMs={400}
                      showClear={true}
                      className="!w-80"
                    />
                    <FormControl size="small" className="!w-40">
                      <MuiSelect
                        value={statusFilter}
                        onChange={e =>
                          setStatusFilter(
                            e.target.value as PayrollStatus | 'all'
                          )
                        }
                      >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="Draft">Draft</MenuItem>
                        <MenuItem value="Processed">Processed</MenuItem>
                        <MenuItem value="Paid">Paid</MenuItem>
                        <MenuItem value="Cancelled">Cancelled</MenuItem>
                      </MuiSelect>
                    </FormControl>
                    <FormControl size="small" className="!w-40">
                      <MuiSelect
                        value={monthFilter}
                        onChange={e => {
                          setMonthFilter(e.target.value);
                          setPage(1);
                        }}
                        displayEmpty
                      >
                        <MenuItem value="">All Months</MenuItem>
                        {monthOptions.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </MuiSelect>
                    </FormControl>
                    <FormControl size="small" className="!w-40">
                      <MuiSelect
                        value={yearFilter}
                        onChange={e => {
                          setYearFilter(
                            e.target.value ? Number(e.target.value) : ''
                          );
                          setPage(1);
                        }}
                        displayEmpty
                      >
                        <MenuItem value="">All Years</MenuItem>
                        {yearOptions.map(year => (
                          <MenuItem key={year} value={year}>
                            {year}
                          </MenuItem>
                        ))}
                      </MuiSelect>
                    </FormControl>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isRead && (
                  <PopConfirm
                    title="Export Payroll Processing"
                    description="Are you sure you want to export the current payroll processing data to Excel? This will include all filtered results."
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
                {isCreate && (
                  <Button
                    variant="contained"
                    className="!capitalize"
                    disableElevation
                    startIcon={<Add />}
                    onClick={handleProcessPayroll}
                  >
                    Process Payroll
                  </Button>
                )}
              </div>
            </div>
          ) : (
            false
          )
        }
        getRowId={payroll => payroll.id}
        initialOrderBy="processing_date"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead !== false}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No payroll processing records found matching "${search}"`
            : 'No payroll processing records found in the system'
        }
      />

      <ProcessPayroll
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        onSuccess={() => {
          refetch();
        }}
      />

      <ViewPayrollDetails
        selectedPayroll={selectedPayroll}
        setSelectedPayroll={setSelectedPayroll}
        drawerOpen={detailDrawerOpen}
        setDrawerOpen={setDetailDrawerOpen}
      />
    </>
  );
};

export default PayrollProcessingPage;
