import { Add, Block, CheckCircle, Download, Upload } from '@mui/icons-material';
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
  useHiringStages,
  useDeleteHiringStage,
  type HiringStage,
} from 'hooks/useHiringStages';
import { useExportToExcel } from 'hooks/useImportExport';
import { usePermission } from 'hooks/usePermission';
import { Briefcase, TrendingUp } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import ImportHiringStage from './ImportHiringStage';
import ManageHiringStage from './ManageHiringStage';

const HiringStagesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedHiringStage, setSelectedHiringStage] =
    useState<HiringStage | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission('user' as any);

  const {
    data: hiringStagesResponse,
    isLoading,
    error,
  } = useHiringStages(
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

  const hiringStages = hiringStagesResponse?.data || [];
  const totalCount = hiringStagesResponse?.meta?.total_count || 0;
  const currentPage = (hiringStagesResponse?.meta?.current_page || 1) - 1;

  const deleteHiringStageMutation = useDeleteHiringStage();
  const exportToExcelMutation = useExportToExcel();

  const stats = hiringStagesResponse?.stats as any;
  const totalHiringStages = stats?.total_hiring_stages ?? hiringStages.length;
  const activeHiringStages =
    stats?.active_hiring_stages ??
    hiringStages.filter(hs => hs.is_active === 'Y').length;
  const inactiveHiringStages =
    stats?.inactive_hiring_stages ??
    hiringStages.filter(hs => hs.is_active === 'N').length;
  const newHiringStagesThisMonth = stats?.new_hiring_stages ?? 0;

  const handleCreateHiringStage = useCallback(() => {
    setSelectedHiringStage(null);
    setDrawerOpen(true);
  }, []);

  const handleEditHiringStage = useCallback((hiringStage: HiringStage) => {
    setSelectedHiringStage(hiringStage);
    setDrawerOpen(true);
  }, []);

  const handleDeleteHiringStage = useCallback(
    async (id: number) => {
      try {
        await deleteHiringStageMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting hiring stage:', error);
      }
    },
    [deleteHiringStageMutation]
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
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'hiring_stages',
        filters,
      });
    } catch (error) {
      console.error('Error exporting hiring stages:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const hiringStageColumns: TableColumn<HiringStage>[] = [
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
    {
      id: 'updatedate',
      label: 'Updated Date',
      render: (_value, row) =>
        formatDate(row.updatedate) || (
          <span className="italic text-gray-400">No Date</span>
        ),
    },
    ...(isUpdate || isDelete || isRead
      ? [
          {
            id: 'action',
            label: 'Actions',
            sortable: false,
            render: (_value: any, row: HiringStage) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditHiringStage(row)}
                    tooltip={`Edit ${row.name}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteHiringStage(row.id)}
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
          <p className="!font-bold text-xl !text-gray-900">Hiring Stage</p>
          <p className="!text-gray-500 text-sm">
            Manage hiring stages and recruitment workflow
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Hiring Stages"
          value={totalHiringStages}
          icon={<Briefcase className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Stages"
          value={activeHiringStages}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Inactive Stages"
          value={inactiveHiringStages}
          icon={<Block className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
        <StatsCard
          title="New This Month"
          value={newHiringStagesThisMonth}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load hiring stages. Please try again.
        </Alert>
      )}

      <Table
        data={hiringStages}
        columns={hiringStageColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Hiring Stage"
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
                {isRead && (
                  <PopConfirm
                    title="Export Hiring Stages"
                    description="Are you sure you want to export the current hiring stages data to Excel? This will include all filtered results."
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
                    onClick={handleCreateHiringStage}
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
        getRowId={hiringStage => hiringStage.id}
        initialOrderBy="name"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead !== false}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No hiring stages found matching "${search}"`
            : 'No hiring stages found in the system'
        }
      />

      <ManageHiringStage
        selectedHiringStage={selectedHiringStage}
        setSelectedHiringStage={setSelectedHiringStage}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportHiringStage
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default HiringStagesPage;
