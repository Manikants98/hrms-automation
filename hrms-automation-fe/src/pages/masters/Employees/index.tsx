import { Add, Block, CheckCircle, Download, Upload } from '@mui/icons-material';
import { Alert, Avatar, Box, MenuItem, Typography } from '@mui/material';
import {
  useEmployees,
  useDeleteEmployee,
  type Employee,
} from 'hooks/useEmployees';
import { useExportToExcel } from 'hooks/useImportExport';
import { usePermission } from 'hooks/usePermission';
import { User, TrendingUp, Users } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import ImportEmployee from './ImportEmployee';
import ManageEmployee from './ManageEmployee';

const EmployeesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission('user' as any);

  const {
    data: employeesResponse,
    isLoading,
    error,
  } = useEmployees(
    {
      search,
      page,
      limit,
      isActive:
        statusFilter === 'all'
          ? undefined
          : statusFilter === 'active'
            ? 'Y'
            : 'N',
      department_id:
        departmentFilter === 'all' ? undefined : Number(departmentFilter),
    },
    {
      enabled: isRead !== false,
    }
  );

  const employees = Array.isArray(employeesResponse?.data)
    ? employeesResponse.data
    : [];
  const totalCount = employeesResponse?.meta?.total_count || 0;
  const currentPage = (employeesResponse?.meta?.current_page || 1) - 1;

  const deleteEmployeeMutation = useDeleteEmployee();
  const exportToExcelMutation = useExportToExcel();

  const stats = employeesResponse?.stats as any;
  const totalEmployees = stats?.total_employees ?? employees.length;
  const activeEmployees =
    stats?.active_employees ??
    employees.filter(e => e.is_active === 'Y').length;
  const inactiveEmployees =
    stats?.inactive_employees ??
    employees.filter(e => e.is_active === 'N').length;
  const newEmployeesThisMonth = stats?.new_employees ?? 0;

  const handleCreateEmployee = useCallback(() => {
    setSelectedEmployee(null);
    setDrawerOpen(true);
  }, []);

  const handleEditEmployee = useCallback((employee: Employee) => {
    setSelectedEmployee(employee);
    setDrawerOpen(true);
  }, []);

  const handleDeleteEmployee = useCallback(
    async (id: number) => {
      try {
        await deleteEmployeeMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    },
    [deleteEmployeeMutation]
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
        isActive:
          statusFilter === 'all'
            ? undefined
            : statusFilter === 'active'
              ? 'Y'
              : 'N',
        department_id:
          departmentFilter === 'all' ? undefined : Number(departmentFilter),
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'employees',
        filters,
      });
    } catch (error) {
      console.error('Error exporting employees:', error);
    }
  }, [exportToExcelMutation, search, statusFilter, departmentFilter]);

  const employeeColumns: TableColumn<Employee>[] = [
    {
      id: 'name',
      label: 'Name',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.name}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <User className="w-5 h-5" />
          </Avatar>
          <Box className="!max-w-xs">
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.name}
            </Typography>
            <Typography variant="caption" className="!text-gray-500">
              {row.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'employee_id',
      label: 'Employee ID',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.employee_id || '-'}
        </Typography>
      ),
    },
    {
      id: 'department_name',
      label: 'Department',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.department_name || '-'}
        </Typography>
      ),
    },
    {
      id: 'designation_name',
      label: 'Designation',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.designation_name || '-'}
        </Typography>
      ),
    },
    {
      id: 'shift_name',
      label: 'Shift',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.shift_name || '-'}
        </Typography>
      ),
    },
    {
      id: 'department_name',
      label: 'Department',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.department_name || '-'}
        </Typography>
      ),
    },
    {
      id: 'date_of_joining',
      label: 'Joining Date',
      render: (_value, row) =>
        formatDate(row.date_of_joining) || (
          <span className="italic text-gray-400">No Date</span>
        ),
    },
    {
      id: 'salary',
      label: 'Salary',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.salary ? `${row.salary.toLocaleString()}` : '-'}
        </Typography>
      ),
    },
    {
      id: 'createdate',
      label: 'Created Date',
      render: (_value, row) =>
        formatDate(row.createdate) || (
          <span className="italic text-gray-400">No Date</span>
        ),
    },
    ...(isUpdate || isDelete || isRead
      ? [
          {
            id: 'action',
            label: 'Actions',
            sortable: false,
            render: (_value: any, row: Employee) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditEmployee(row)}
                    tooltip={`Edit ${row.name}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteEmployee(row.id)}
                    tooltip={`Delete ${row.name}`}
                    itemName={row.name}
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
          <p className="!font-bold text-xl !text-gray-900">Employees</p>
          <p className="!text-gray-500 text-sm">
            Manage employee information, departments, designations, and shifts
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Employees"
          value={totalEmployees}
          icon={<Users className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Employees"
          value={activeEmployees}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Inactive Employees"
          value={inactiveEmployees}
          icon={<Block className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
        <StatsCard
          title="New This Month"
          value={newEmployeesThisMonth}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load employees. Please try again.
        </Alert>
      )}

      <Table
        data={employees}
        columns={employeeColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Employee"
                      value={search}
                      onChange={handleSearchChange}
                      debounceMs={400}
                      showClear={true}
                      className="!w-80"
                    />
                    <Select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="!w-32"
                      size="small"
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                    <Select
                      value={departmentFilter}
                      onChange={e => setDepartmentFilter(e.target.value)}
                      className="!w-40"
                      size="small"
                    >
                      <MenuItem value="all">All Departments</MenuItem>
                      <MenuItem value="1">Engineering</MenuItem>
                      <MenuItem value="2">Product</MenuItem>
                      <MenuItem value="3">Design</MenuItem>
                      <MenuItem value="4">Analytics</MenuItem>
                      <MenuItem value="5">Marketing</MenuItem>
                      <MenuItem value="6">Sales</MenuItem>
                      <MenuItem value="7">HR</MenuItem>
                      <MenuItem value="8">Finance</MenuItem>
                    </Select>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isRead && (
                  <PopConfirm
                    title="Export Employees"
                    description="Are you sure you want to export the current employees data to Excel? This will include all filtered results."
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
                    onClick={handleCreateEmployee}
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
        getRowId={employee => employee.id}
        initialOrderBy="name"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead !== false}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No employees found matching "${search}"`
            : 'No employees found in the system'
        }
      />

      <ManageEmployee
        selectedEmployee={selectedEmployee}
        setSelectedEmployee={setSelectedEmployee}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportEmployee
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default EmployeesPage;
