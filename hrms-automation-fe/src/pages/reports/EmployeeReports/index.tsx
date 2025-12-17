import { CheckCircle, Download } from '@mui/icons-material';
import { Avatar, Box, MenuItem, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useEmployees, type Employee } from 'hooks/useEmployees';
import { useExportToExcel } from 'hooks/useImportExport';
import { Briefcase, TrendingUp, User, Users, XCircle } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { ActiveInactive } from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import Input from 'shared/Input';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';

const EmployeeReports: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<
    number | undefined
  >();
  const [designationFilter, setDesignationFilter] = useState<
    number | undefined
  >();
  const [joiningDateFrom, setJoiningDateFrom] = useState<string>('');
  const [joiningDateTo, setJoiningDateTo] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);

  const { data: employeesResponse, isLoading: employeesLoading } = useEmployees(
    {
      search,
      isActive:
        statusFilter === 'all'
          ? undefined
          : statusFilter === 'active'
            ? 'Y'
            : 'N',
      department_id: departmentFilter,
      designation_id: designationFilter,
      limit: 1000,
    }
  );

  const employees = employeesResponse?.data || [];

  const filteredEmployees = useMemo(() => {
    let filtered = [...employees];

    if (joiningDateFrom) {
      filtered = filtered.filter(
        emp =>
          emp.joining_date &&
          dayjs(emp.joining_date).isAfter(
            dayjs(joiningDateFrom).subtract(1, 'day')
          )
      );
    }

    if (joiningDateTo) {
      filtered = filtered.filter(
        emp =>
          emp.joining_date &&
          dayjs(emp.joining_date).isBefore(dayjs(joiningDateTo).add(1, 'day'))
      );
    }

    return filtered;
  }, [employees, joiningDateFrom, joiningDateTo]);

  const paginatedEmployees = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredEmployees.slice(startIndex, endIndex);
  }, [filteredEmployees, page, rowsPerPage]);

  React.useEffect(() => {
    setPage(0);
  }, [
    search,
    statusFilter,
    departmentFilter,
    designationFilter,
    joiningDateFrom,
    joiningDateTo,
  ]);

  const stats = useMemo(() => {
    const totalEmployees = filteredEmployees.length;
    const activeEmployees = filteredEmployees.filter(
      e => e.is_active === 'Y'
    ).length;
    const inactiveEmployees = filteredEmployees.filter(
      e => e.is_active === 'N'
    ).length;

    const employeesByDepartment = filteredEmployees.reduce(
      (acc, emp) => {
        const dept = emp.department_name || 'Unknown';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const employeesByDesignation = filteredEmployees.reduce(
      (acc, emp) => {
        const desig = emp.designation_name || 'Unknown';
        acc[desig] = (acc[desig] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const totalSalary = filteredEmployees.reduce(
      (sum, emp) => sum + (emp.salary || 0),
      0
    );
    const averageSalary =
      totalEmployees > 0
        ? Math.round(totalSalary / totalEmployees).toLocaleString()
        : '0';

    const newEmployeesThisMonth = filteredEmployees.filter(emp => {
      if (!emp.joining_date) return false;
      const joiningDate = dayjs(emp.joining_date);
      const now = dayjs();
      return (
        joiningDate.month() === now.month() && joiningDate.year() === now.year()
      );
    }).length;

    const employeesWithSalary = filteredEmployees.filter(
      e => e.salary && e.salary > 0
    ).length;

    return {
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      employeesByDepartment,
      employeesByDesignation,
      averageSalary,
      newEmployeesThisMonth,
      employeesWithSalary,
    };
  }, [filteredEmployees]);

  const exportToExcelMutation = useExportToExcel();

  const handleExportToExcel = useCallback(async () => {
    try {
      await exportToExcelMutation.mutateAsync({
        tableName: 'employee_reports',
        filters: {
          search,
          isActive:
            statusFilter === 'all'
              ? undefined
              : statusFilter === 'active'
                ? 'Y'
                : 'N',
          department_id: departmentFilter,
          designation_id: designationFilter,
          joining_date_from: joiningDateFrom,
          joining_date_to: joiningDateTo,
        },
      });
    } catch (error) {
      console.error('Error exporting employee reports to Excel:', error);
    }
  }, [
    exportToExcelMutation,
    search,
    statusFilter,
    departmentFilter,
    designationFilter,
    joiningDateFrom,
    joiningDateTo,
  ]);

  const uniqueDepartments = useMemo(() => {
    const deptMap = new Map<number, string>();
    employees.forEach(emp => {
      if (emp.department_id && emp.department_name) {
        deptMap.set(emp.department_id, emp.department_name);
      }
    });
    return Array.from(deptMap.entries()).map(([id, name]) => ({ id, name }));
  }, [employees]);

  const uniqueDesignations = useMemo(() => {
    const desigMap = new Map<number, string>();
    employees.forEach(emp => {
      if (emp.designation_id && emp.designation_name) {
        desigMap.set(emp.designation_id, emp.designation_name);
      }
    });
    return Array.from(desigMap.entries()).map(([id, name]) => ({ id, name }));
  }, [employees]);

  const employeeColumns: TableColumn<Employee>[] = [
    {
      id: 'name',
      label: 'Employee Name',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.name}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <User className="w-5 h-5" />
          </Avatar>
          <Box className="!max-w-xs">
            <Typography variant="body2" className="!font-medium !text-gray-900">
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
      id: 'reporting_manager_name',
      label: 'Reporting Manager',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.reporting_manager_name || '-'}
        </Typography>
      ),
    },
    {
      id: 'joining_date',
      label: 'Joining Date',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {formatDate(row.joining_date) || '-'}
        </Typography>
      ),
    },
    {
      id: 'salary',
      label: 'Salary',
      render: (_value, row) => (
        <Typography variant="body2" className="!font-medium !text-gray-900">
          {row.salary && row.currency_code
            ? `${row.currency_code} ${row.salary.toLocaleString()}`
            : '-'}
        </Typography>
      ),
    },
    {
      id: 'phone_number',
      label: 'Phone',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.phone_number || '-'}
        </Typography>
      ),
    },
    {
      id: 'is_active',
      label: 'Status',
      render: (_value, row) => <ActiveInactive value={row.is_active} />,
    },
  ];

  const isLoading = employeesLoading;

  return (
    <div className="flex flex-col gap-5">
      <Box className="!flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">Employee Reports</p>
          <p className="!text-gray-500 text-sm">
            Comprehensive reports on employee information, departments,
            designations, and organizational structure
          </p>
        </Box>
        <PopConfirm
          title="Export Report to Excel"
          description="Are you sure you want to export the current employee reports data to Excel? This will include all filtered results."
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
          title="Total Employees"
          value={stats.totalEmployees}
          icon={<Users className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Employees"
          value={stats.activeEmployees}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Inactive Employees"
          value={stats.inactiveEmployees}
          icon={<XCircle className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
        <StatsCard
          title="New This Month"
          value={stats.newEmployeesThisMonth}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Employees with Salary"
          value={stats.employeesWithSalary}
          icon={<Briefcase className="w-6 h-6" />}
          color="indigo"
          isLoading={isLoading}
        />
        <StatsCard
          title="Average Salary"
          value={`₹${stats.averageSalary}`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Total Departments"
          value={Object.keys(stats.employeesByDepartment).length}
          icon={<Briefcase className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Total Designations"
          value={Object.keys(stats.employeesByDesignation).length}
          icon={<User className="w-6 h-6" />}
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
            label="Status"
            placeholder="All Statuses"
            fullWidth
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
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
            value={designationFilter?.toString() || ''}
            setValue={value =>
              setDesignationFilter(value ? Number(value) : undefined)
            }
            label="Designation"
            placeholder="All Designations"
            fullWidth
          >
            <MenuItem value="">All Designations</MenuItem>
            {uniqueDesignations.map(desig => (
              <MenuItem key={desig.id} value={desig.id.toString()}>
                {desig.name}
              </MenuItem>
            ))}
          </Select>
          <Input
            type="date"
            label="Joining Date From"
            value={joiningDateFrom}
            setValue={setJoiningDateFrom}
            fullWidth
          />
          <Input
            type="date"
            label="Joining Date To"
            value={joiningDateTo}
            setValue={setJoiningDateTo}
            fullWidth
          />
        </Box>
      </Box>

      <Table
        actions={
          <div className="!flex !justify-between !items-center">
            <Typography className="!font-semibold !text-gray-900">
              Employee Details Report
            </Typography>
          </div>
        }
        data={paginatedEmployees}
        columns={employeeColumns}
        getRowId={row => row.id}
        loading={isLoading}
        totalCount={filteredEmployees.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        emptyMessage="No employees found"
      />
    </div>
  );
};

export default EmployeeReports;
