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
  useDesignations,
  useDeleteDesignation,
  type Designation,
} from 'hooks/useDesignations';
import { usePermission } from 'hooks/usePermission';
import { Briefcase } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import SearchInput from 'shared/SearchInput';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import ManageDesignation from './ManageDesignation';

const DesignationsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDesignation, setSelectedDesignation] =
    useState<Designation | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission(
    'designation' as any
  );

  const {
    data: designationsResponse,
    isLoading,
    error,
  } = useDesignations(
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

  const designations = Array.isArray(designationsResponse?.data)
    ? designationsResponse.data
    : [];
  const totalCount = designationsResponse?.meta?.total_count || 0;
  const currentPage = (designationsResponse?.meta?.current_page || 1) - 1;

  const deleteDesignationMutation = useDeleteDesignation();

  const stats = designationsResponse?.stats as any;
  const totalDesignations = stats?.total_designations ?? designations.length;
  const activeDesignations =
    stats?.active_designations ??
    designations.filter(d => d.is_active === 'Y').length;
  const inactiveDesignations =
    stats?.inactive_designations ??
    designations.filter(d => d.is_active === 'N').length;

  const handleCreateDesignation = useCallback(() => {
    setSelectedDesignation(null);
    setDrawerOpen(true);
  }, []);

  const handleEditDesignation = useCallback((designation: Designation) => {
    setSelectedDesignation(designation);
    setDrawerOpen(true);
  }, []);

  const handleDeleteDesignation = useCallback(
    async (id: number) => {
      try {
        await deleteDesignationMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting designation:', error);
      }
    },
    [deleteDesignationMutation]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    setPage(newPage + 1);
  };

  const designationColumns: TableColumn<Designation>[] = [
    {
      id: 'name',
      label: 'Name',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.name}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <Briefcase className="w-5 h-5" />
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
            render: (_value: any, row: Designation) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditDesignation(row)}
                    tooltip={`Edit ${row.name}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteDesignation(row.id)}
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
          <p className="!font-bold text-xl !text-gray-900">Designations</p>
          <p className="!text-gray-500 text-sm">
            Manage designations and job titles
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatsCard
          title="Total Designations"
          value={totalDesignations}
          icon={<Briefcase className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Designations"
          value={activeDesignations}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Inactive Designations"
          value={inactiveDesignations}
          icon={<Block className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load designations. Please try again.
        </Alert>
      )}

      <Table
        data={designations}
        columns={designationColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Designation"
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
                    onClick={handleCreateDesignation}
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
        getRowId={designation => designation.id}
        initialOrderBy="name"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead !== false}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No designations found matching "${search}"`
            : 'No designations found in the system'
        }
      />

      <ManageDesignation
        selectedDesignation={selectedDesignation}
        setSelectedDesignation={setSelectedDesignation}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />
    </>
  );
};

export default DesignationsPage;
