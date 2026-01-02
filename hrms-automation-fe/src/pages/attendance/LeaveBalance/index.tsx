import { Add, Download, Upload } from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Chip,
  FormControl,
  MenuItem,
  Select as MuiSelect,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { useEmployees } from 'hooks/useEmployees';
import { useExportToExcel } from 'hooks/useImportExport';
import {
  useDeleteLeaveBalance,
  useLeaveBalances,
  type LeaveBalance,
} from 'hooks/useLeaveBalances';
import type { LeaveBalanceStatus } from 'services/leaveBalances';
import { usePermission } from 'hooks/usePermission';
import { Calendar, User } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import ImportLeaveBalance from './ImportLeaveBalance';
import ManageLeaveBalance from './ManageLeaveBalance';

const LeaveBalancePage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeaveBalanceStatus | 'all'>(
    'all'
  );
  const [selectedLeaveBalance, setSelectedLeaveBalance] =
    useState<LeaveBalance | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission('user' as any);

  const { data: employeesResponse, isLoading: employeesLoading } = useEmployees(
    {
      search,
      page,
      limit,
      isActive: 'Y',
    },
    {
      enabled: isRead !== false,
    }
  );

  const {
    data: leaveBalancesResponse,
    isLoading: leaveBalancesLoading,
    error,
  } = useLeaveBalances(
    {
      limit: 1000,
    },
    {
      enabled: isRead !== false,
    }
  );

  const employees = Array.isArray(employeesResponse?.data) ? employeesResponse?.data : [];
  const leaveBalancesData = Array.isArray(leaveBalancesResponse?.data) ? leaveBalancesResponse?.data : [];

  const leaveBalanceMap = React.useMemo(() => {
    const map = new Map<number, LeaveBalance>();
    if (Array.isArray(leaveBalancesData)) {
      leaveBalancesData?.forEach((balance: any) => {
        const existingBalance = map.get(balance.employee_id);
        
        if (existingBalance) {
          // Add to existing employee's leave_type_items
          existingBalance.leave_type_items.push({
            leave_type_id: balance.leave_type_id,
            leave_type_name: balance.leave_type?.name || 'Unknown',
            total_allocated: balance.total_allocated,
            used: balance.used,
            balance: balance.balance,
          });
        } else {
          // Create new employee entry
          map.set(balance.employee_id, {
            id: balance.id,
            employee_id: balance.employee_id,
            employee_name: balance.employee?.name || '',
            employee_email: balance.employee?.email || '',
            leave_type_items: [{
              leave_type_id: balance.leave_type_id,
              leave_type_name: balance.leave_type?.name || 'Unknown',
              total_allocated: balance.total_allocated,
              used: balance.used,
              balance: balance.balance,
            }],
            year: balance.year,
            status: balance.is_active === 'Y' ? 'Active' : 'Expired',
            createdate: balance.createdate,
            updatedate: balance.updatedate,
            is_active: balance.is_active,
          });
        }
      });
    }
    return map;
  }, [leaveBalancesData]);

  const leaveBalances = React.useMemo(() => {
    return employees
      .map(employee => {
        const balance = leaveBalanceMap.get(employee.id);
        if (balance) {
          return {
            ...balance,
            employee_name: employee.name,
            employee_code: employee.employee_id || '',
            employee_email: employee.email,
          };
        }
        return {
          id: 0,
          employee_id: employee.id,
          employee_name: employee.name,
          employee_code: employee.employee_id || '',
          employee_email: employee.email,
          year: new Date().getFullYear(),
          is_active: 'Y' as const,
          status: 'Active' as LeaveBalanceStatus,
          leave_type_items: [],
          createdate: '',
          updatedate: '',
        };
      })
      .filter(item => {
        if (statusFilter === 'all') return true;
        return item.status === statusFilter;
      });
  }, [employees, leaveBalanceMap, statusFilter]);

  const isLoading = employeesLoading || leaveBalancesLoading;
  const totalCount = employeesResponse?.meta?.total_count || 0;
  const currentPage = (employeesResponse?.meta?.current_page || 1) - 1;

  const deleteLeaveBalanceMutation = useDeleteLeaveBalance();
  const exportToExcelMutation = useExportToExcel();

  const employeeStats = employeesResponse?.stats as any;
  const totalEmployees = employeeStats?.total_employees ?? employees.length;

  const stats = React.useMemo(() => {
    let totalAllocated = 0;
    let totalUsed = 0;
    let totalRemaining = 0;

    leaveBalanceMap.forEach((balance) => {
      if (Array.isArray(balance.leave_type_items)) {
        balance.leave_type_items.forEach(item => {
          totalAllocated += item.total_allocated || 0;
          totalUsed += item.used || 0;
          totalRemaining += item.balance || 0;
        });
      }
    });

    return { totalAllocated, totalUsed, totalRemaining };
  }, [leaveBalanceMap]);

  const totalAllocated = stats.totalAllocated;
  const totalUsed = stats.totalUsed;
  const totalRemaining = stats.totalRemaining;

  const handleCreateLeaveBalance = useCallback(() => {
    setSelectedLeaveBalance(null);
    setDrawerOpen(true);
  }, []);

  const handleEditLeaveBalance = useCallback((balance: LeaveBalance) => {
    setSelectedLeaveBalance(balance);
    setDrawerOpen(true);
  }, []);

  const handleDeleteLeaveBalance = useCallback(
    async (id: number) => {
      try {
        await deleteLeaveBalanceMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting leave balance:', error);
      }
    },
    [deleteLeaveBalanceMutation]
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
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'leave_balances',
        filters,
      });
    } catch (error) {
      console.error('Error exporting leave balances:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const getStatusColor = (status: LeaveBalanceStatus) => {
    return status === 'Active' ? 'success' : 'error';
  };

  const leaveBalanceColumns: TableColumn<LeaveBalance>[] = [
    {
      id: 'employee_name',
      label: 'Employee',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.employee_name}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <User className="w-5 h-5" />
          </Avatar>
          <Box className="!max-w-xs">
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.employee_name}
            </Typography>
            <Typography variant="caption" className="!text-gray-500">
              {row.employee_code}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'email',
      label: 'Email',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.employee_email || '-'}
        </Typography>
      ),
    },
    {
      id: 'year',
      label: 'Year',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.year || '-'}
        </Typography>
      ),
    },
    {
      id: 'createdate',
      label: 'Created Date',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.createdate ? dayjs(row.createdate).format('DD-MM-YYYY') : '-'}
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
          variant="outlined"
        />
      ),
    },
    ...(isUpdate || isDelete || isRead
      ? [
          {
            id: 'action',
            label: 'Actions',
            sortable: false,
            render: (_value: any, row: LeaveBalance) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditLeaveBalance(row)}
                    tooltip={
                      row.id > 0
                        ? `Edit ${row.employee_name}'s Leave Balance`
                        : `Create Leave Balance for ${row.employee_name}`
                    }
                  />
                )}
                {isDelete && row.id > 0 && (
                  <DeleteButton
                    onClick={() => handleDeleteLeaveBalance(row.id)}
                    tooltip={`Delete ${row.employee_name}'s Leave Balance`}
                    itemName={`${row.employee_name}'s leave balance`}
                    confirmDelete={true}
                  />
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <Box className="!mb-3 !flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">Leave Balance</p>
          <p className="!text-gray-500 text-sm">
            Manage employee leave balances and allocations
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Employees"
          value={totalEmployees}
          icon={<User className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Total Allocated"
          value={totalAllocated}
          icon={<Calendar className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
        <StatsCard
          title="Total Used"
          value={totalUsed}
          icon={<Calendar className="w-6 h-6" />}
          color="orange"
          isLoading={isLoading}
        />
        <StatsCard
          title="Total Remaining"
          value={totalRemaining}
          icon={<Calendar className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load leave balances. Please try again.
        </Alert>
      )}

      <Table
        data={leaveBalances}
        columns={leaveBalanceColumns}
        compact
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Leave Balance"
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
                            e.target.value as LeaveBalanceStatus | 'all'
                          )
                        }
                      >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Expired">Expired</MenuItem>
                      </MuiSelect>
                    </FormControl>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isRead && (
                  <PopConfirm
                    title="Export Leave Balances"
                    description="Are you sure you want to export the current leave balances data to Excel? This will include all filtered results."
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
                    variant="outlined"
                    className="!capitalize"
                    startIcon={<Upload />}
                    onClick={() => setImportModalOpen(true)}
                  >
                    Import
                  </Button>
                )}
                {isCreate && (
                  <Button
                    variant="contained"
                    className="!capitalize"
                    disableElevation
                    startIcon={<Add />}
                    onClick={handleCreateLeaveBalance}
                  >
                    Create
                  </Button>
                )}
              </div>
            </div>
          ) : (
            false
          )
        }
        getRowId={balance => balance.id}
        initialOrderBy="employee_name"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead !== false}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No leave balances found matching "${search}"`
            : 'No leave balances found in the system'
        }
      />

      <ManageLeaveBalance
        selectedLeaveBalance={selectedLeaveBalance}
        setSelectedLeaveBalance={setSelectedLeaveBalance}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportLeaveBalance
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default LeaveBalancePage;
