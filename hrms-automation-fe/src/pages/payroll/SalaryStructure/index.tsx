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
import { usePermission } from 'hooks/usePermission';
import {
  useDeleteSalaryStructure,
  useSalaryStructures,
  type SalaryStructure,
} from 'hooks/useSalaryStructures';
import type { SalaryStructure as SalaryStructureType } from 'services/salaryStructures';

type SalaryStructureStatus = SalaryStructureType['status'];
import { DollarSign, TrendingDown, TrendingUp, User } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import ImportSalaryStructure from './ImportSalaryStructure';
import ManageSalaryStructure from './ManageSalaryStructure';

const SalaryStructurePage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    SalaryStructureStatus | 'all'
  >('all');
  const [selectedSalaryStructure, setSelectedSalaryStructure] =
    useState<SalaryStructure | null>(null);
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
    data: salaryStructuresResponse,
    isLoading: salaryStructuresLoading,
    error,
  } = useSalaryStructures(
    {
      limit: 1000,
    },
    {
      enabled: isRead !== false,
    }
  );

  const employees = Array.isArray(employeesResponse?.data) ? employeesResponse.data : [];
  const salaryStructuresData = Array.isArray(salaryStructuresResponse?.data) ? salaryStructuresResponse.data : [];

  const salaryStructureMap = React.useMemo(() => {
    const map = new Map<number, SalaryStructure>();
    salaryStructuresData.forEach(structure => {
      map.set(structure.employee_id, structure);
    });
    return map;
  }, [salaryStructuresData]);

  const salaryStructures = React.useMemo(() => {
    return employees
      .map(employee => {
        const structure = salaryStructureMap.get(employee.id);
        if (structure) {
          return {
            ...structure,
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
          start_date: '',
          end_date: '',
          status: 'Active' as SalaryStructureStatus,
          structure_items: [],
          createdate: '',
          updatedate: '',
          is_active: 'Y' as const,
        };
      })
      .filter(item => {
        if (statusFilter === 'all') return true;
        return item.status === statusFilter;
      });
  }, [employees, salaryStructureMap, statusFilter]);

  const isLoading = employeesLoading || salaryStructuresLoading;
  const totalCount = employeesResponse?.meta?.total_count || 0;
  const currentPage = (employeesResponse?.meta?.current_page || 1) - 1;

  const deleteSalaryStructureMutation = useDeleteSalaryStructure();
  const exportToExcelMutation = useExportToExcel();

  const employeeStats = employeesResponse?.stats as any;
  const totalEmployees = employeeStats?.total_employees ?? employees.length;

  const stats = React.useMemo(() => {
    let totalEarnings = 0;
    let totalDeductions = 0;
    let netSalary = 0;

    salaryStructuresData.forEach(structure => {
      const earnings = structure.structure_items
        .filter(item => item.category === 'Earnings')
        .reduce((sum, item) => sum + (item.value || 0), 0);
      const deductions = structure.structure_items
        .filter(item => item.category === 'Deductions')
        .reduce((sum, item) => sum + (item.value || 0), 0);

      totalEarnings += earnings;
      totalDeductions += deductions;
      netSalary += earnings - deductions;
    });

    return { totalEarnings, totalDeductions, netSalary };
  }, [salaryStructuresData]);

  const totalEarnings = stats.totalEarnings;
  const totalDeductions = stats.totalDeductions;
  const netSalary = stats.netSalary;

  const handleCreateSalaryStructure = useCallback(() => {
    setSelectedSalaryStructure(null);
    setDrawerOpen(true);
  }, []);

  const handleEditSalaryStructure = useCallback(
    (structure: SalaryStructure) => {
      setSelectedSalaryStructure(structure);
      setDrawerOpen(true);
    },
    []
  );

  const handleDeleteSalaryStructure = useCallback(
    async (id: number) => {
      try {
        await deleteSalaryStructureMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting salary structure:', error);
      }
    },
    [deleteSalaryStructureMutation]
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
        tableName: 'salary_structures',
        filters,
      });
    } catch (error) {
      console.error('Error exporting salary structures:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const getStatusColor = (status: SalaryStructureStatus) => {
    return status === 'Active' ? 'success' : 'error';
  };

  const salaryStructureColumns: TableColumn<SalaryStructure>[] = [
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
              {row.employee_email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'employee_code',
      label: 'Employee Code',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.employee_code || '-'}
        </Typography>
      ),
    },
    {
      id: 'start_date',
      label: 'Start Date',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.start_date ? dayjs(row.start_date).format('DD-MM-YYYY') : '-'}
        </Typography>
      ),
    },
    {
      id: 'end_date',
      label: 'End Date',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.end_date ? dayjs(row.end_date).format('DD-MM-YYYY') : '-'}
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
        />
      ),
    },
    ...(isUpdate || isDelete || isRead
      ? [
          {
            id: 'action',
            label: 'Actions',
            sortable: false,
            render: (_value: any, row: SalaryStructure) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditSalaryStructure(row)}
                    tooltip={
                      row.id > 0
                        ? `Edit ${row.employee_name}'s Salary Structure`
                        : `Create Salary Structure for ${row.employee_name}`
                    }
                  />
                )}
                {isDelete && row.id > 0 && (
                  <DeleteButton
                    onClick={() => handleDeleteSalaryStructure(row.id)}
                    tooltip={`Delete ${row.employee_name}'s Salary Structure`}
                    itemName={`${row.employee_name}'s salary structure`}
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
          <p className="!font-bold text-xl !text-gray-900">Salary Structure</p>
          <p className="!text-gray-500 text-sm">
            Manage employee salary structures and components
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
          title="Total Earnings"
          value={`₹${totalEarnings.toLocaleString()}`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Total Deductions"
          value={`₹${totalDeductions.toLocaleString()}`}
          icon={<TrendingDown className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
        <StatsCard
          title="Net Salary"
          value={`₹${netSalary.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load salary structures. Please try again.
        </Alert>
      )}

      <Table
        data={salaryStructures}
        columns={salaryStructureColumns}
        compact
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Salary Structure"
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
                            e.target.value as SalaryStructureStatus | 'all'
                          )
                        }
                      >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Inactive">Inactive</MenuItem>
                      </MuiSelect>
                    </FormControl>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isRead && (
                  <PopConfirm
                    title="Export Salary Structures"
                    description="Are you sure you want to export the current salary structures data to Excel? This will include all filtered results."
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
                    onClick={handleCreateSalaryStructure}
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
        getRowId={structure => structure.id}
        initialOrderBy="employee_name"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead !== false}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No salary structures found matching "${search}"`
            : 'No salary structures found in the system'
        }
      />

      <ManageSalaryStructure
        selectedSalaryStructure={selectedSalaryStructure}
        setSelectedSalaryStructure={setSelectedSalaryStructure}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportSalaryStructure
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default SalaryStructurePage;
