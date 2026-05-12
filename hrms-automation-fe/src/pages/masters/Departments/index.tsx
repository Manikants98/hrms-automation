import { Add, Block, CheckCircle } from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  FormControl,
  MenuItem,
  Select as MuiSelect,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  useDepartments,
  useDeleteDepartment,
  type Department,
} from 'hooks/useDepartments';
import { usePermission } from 'hooks/usePermission';
import { Building2, TrendingUp } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import SearchInput from 'shared/SearchInput';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import ManageDepartment from './ManageDepartment';

const DepartmentsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission(
    'department' as any
  );

  const {
    data: departmentsResponse,
    isLoading,
    error,
  } = useDepartments(
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
    },
    {
      enabled: isRead !== false,
    }
  );

  const departments = Array.isArray(departmentsResponse?.data)
    ? departmentsResponse.data
    : [];
  const totalCount = departmentsResponse?.meta?.total_count || 0;
  const currentPage = (departmentsResponse?.meta?.current_page || 1) - 1;

  const deleteDepartmentMutation = useDeleteDepartment();

  const stats = departmentsResponse?.stats as any;
  const totalDepartments = stats?.total_departments ?? departments.length;
  const activeDepartments =
    stats?.active_departments ??
    departments.filter(d => d.is_active === 'Y').length;
  const inactiveDepartments =
    stats?.inactive_departments ??
    departments.filter(d => d.is_active === 'N').length;

  const handleCreateDepartment = useCallback(() => {
    setSelectedDepartment(null);
    setDrawerOpen(true);
  }, []);

  const handleEditDepartment = useCallback((department: Department) => {
    setSelectedDepartment(department);
    setDrawerOpen(true);
  }, []);

  const handleDeleteDepartment = useCallback(
    async (id: number) => {
      try {
        await deleteDepartmentMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting department:', error);
      }
    },
    [deleteDepartmentMutation]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    setPage(newPage + 1);
  };

  const departmentColumns: TableColumn<Department>[] = [
    {
      id: 'name',
      label: 'Name',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.name}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <Building2 className="w-5 h-5" />
          </Avatar>
          <Box className="!max-w-xs">
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.name}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'code',
      label: 'Code',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.code}
        </Typography>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      render: (_value, row) => (
        <Tooltip title={row.description || ''} placement="top" arrow>
          <Typography
            variant="body2"
            className="!text-gray-900"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              maxWidth: '300px',
              cursor: row.description ? 'help' : 'default',
            }}
          >
            {row.description || (
              <span className="italic text-gray-400">No Description</span>
            )}
          </Typography>
        </Tooltip>
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
            render: (_value: any, row: Department) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditDepartment(row)}
                    tooltip={`Edit ${row.name}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteDepartment(row.id)}
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
          <p className="!font-bold text-xl !text-gray-900">Departments</p>
          <p className="!text-gray-500 text-sm">
            Manage departments and organizational structure
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatsCard
          title="Total Departments"
          value={totalDepartments}
          icon={<Building2 className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Departments"
          value={activeDepartments}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Inactive Departments"
          value={inactiveDepartments}
          icon={<Block className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load departments. Please try again.
        </Alert>
      )}

      <Table
        data={departments}
        columns={departmentColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Department"
                      value={search}
                      onChange={handleSearchChange}
                      debounceMs={400}
                      showClear={true}
                      className="!w-80"
                    />
                    <FormControl size="small" className="!w-32">
                      <MuiSelect
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                      >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                      </MuiSelect>
                    </FormControl>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isCreate && (
                  <Button
                    variant="contained"
                    className="!capitalize"
                    disableElevation
                    startIcon={<Add />}
                    onClick={handleCreateDepartment}
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
        getRowId={department => department.id}
        initialOrderBy="name"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead !== false}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No departments found matching "${search}"`
            : 'No departments found in the system'
        }
      />

      <ManageDepartment
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />
    </>
  );
};

export default DepartmentsPage;
