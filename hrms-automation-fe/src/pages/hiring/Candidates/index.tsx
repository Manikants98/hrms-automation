import { Add, Block, CheckCircle, Download, Upload } from '@mui/icons-material';
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
import {
  useCandidates,
  useDeleteCandidate,
  type Candidate,
} from 'hooks/useCandidates';
import { useExportToExcel } from 'hooks/useImportExport';
import { usePermission } from 'hooks/usePermission';
import { TrendingUp, User } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import ImportCandidate from './ImportCandidate';
import ManageCandidate from './ManageCandidate';

const CandidatesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [candidateStatusFilter, setCandidateStatusFilter] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission('user' as any);

  const {
    data: candidatesResponse,
    isLoading,
    error,
  } = useCandidates(
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
      status:
        candidateStatusFilter === 'all'
          ? undefined
          : (candidateStatusFilter as Candidate['status']),
    },
    {
      enabled: isRead !== false,
    }
  );

  const candidates = candidatesResponse?.data || [];
  const totalCount = candidatesResponse?.meta?.total_count || 0;
  const currentPage = (candidatesResponse?.meta?.current_page || 1) - 1;

  const deleteCandidateMutation = useDeleteCandidate();
  const exportToExcelMutation = useExportToExcel();

  const stats = candidatesResponse?.stats as any;
  const totalCandidates = stats?.total_candidates ?? candidates.length;
  const activeCandidates =
    stats?.active_candidates ??
    candidates.filter(c => c.is_active === 'Y').length;
  const inactiveCandidates =
    stats?.inactive_candidates ??
    candidates.filter(c => c.is_active === 'N').length;
  const newCandidatesThisMonth = stats?.new_candidates ?? 0;

  const handleCreateCandidate = useCallback(() => {
    setSelectedCandidate(null);
    setDrawerOpen(true);
  }, []);

  const handleEditCandidate = useCallback((candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setDrawerOpen(true);
  }, []);

  const handleDeleteCandidate = useCallback(
    async (id: number) => {
      try {
        await deleteCandidateMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting candidate:', error);
      }
    },
    [deleteCandidateMutation]
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
        status:
          candidateStatusFilter === 'all' ? undefined : candidateStatusFilter,
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'candidates',
        filters,
      });
    } catch (error) {
      console.error('Error exporting candidates:', error);
    }
  }, [exportToExcelMutation, search, statusFilter, candidateStatusFilter]);

  const getStatusColor = (status: Candidate['status']) => {
    switch (status) {
      case 'Applied':
        return 'default';
      case 'Screening':
        return 'info';
      case 'Interview':
        return 'warning';
      case 'Offer':
        return 'primary';
      case 'Hired':
        return 'success';
      case 'Rejected':
        return 'error';
      case 'Withdrawn':
        return 'default';
      default:
        return 'default';
    }
  };

  const candidateColumns: TableColumn<Candidate>[] = [
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
      id: 'job_posting_title',
      label: 'Job Posting',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.job_posting_title || '-'}
        </Typography>
      ),
    },
    {
      id: 'current_hiring_stage_name',
      label: 'Current Stage',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.current_hiring_stage_name || '-'}
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
      id: 'experience_years',
      label: 'Experience',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.experience_years ? `${row.experience_years} years` : '-'}
        </Typography>
      ),
    },
    {
      id: 'application_date',
      label: 'Application Date',
      render: (_value, row) =>
        formatDate(row.application_date) || (
          <span className="italic text-gray-400">No Date</span>
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
            render: (_value: any, row: Candidate) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditCandidate(row)}
                    tooltip={`Edit ${row.name}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteCandidate(row.id)}
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
          <p className="!font-bold text-xl !text-gray-900">Candidates</p>
          <p className="!text-gray-500 text-sm">
            Manage candidates and track their progress through the hiring
            process
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Candidates"
          value={totalCandidates}
          icon={<User className="w-6 h-6" />}
          color="gray"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Candidates"
          value={activeCandidates}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Inactive Candidates"
          value={inactiveCandidates}
          icon={<Block className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
        <StatsCard
          title="New This Month"
          value={newCandidatesThisMonth}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load candidates. Please try again.
        </Alert>
      )}

      <Table
        data={candidates}
        columns={candidateColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Candidate"
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
                    <FormControl size="small" className="!w-40">
                      <MuiSelect
                        value={candidateStatusFilter}
                        onChange={e => setCandidateStatusFilter(e.target.value)}
                      >
                        <MenuItem value="all">All Stages</MenuItem>
                        <MenuItem value="Applied">Applied</MenuItem>
                        <MenuItem value="Screening">Screening</MenuItem>
                        <MenuItem value="Interview">Interview</MenuItem>
                        <MenuItem value="Offer">Offer</MenuItem>
                        <MenuItem value="Hired">Hired</MenuItem>
                        <MenuItem value="Rejected">Rejected</MenuItem>
                        <MenuItem value="Withdrawn">Withdrawn</MenuItem>
                      </MuiSelect>
                    </FormControl>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isRead && (
                  <PopConfirm
                    title="Export Candidates"
                    description="Are you sure you want to export the current candidates data to Excel? This will include all filtered results."
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
                    onClick={handleCreateCandidate}
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
        getRowId={candidate => candidate.id}
        initialOrderBy="name"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead !== false}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No candidates found matching "${search}"`
            : 'No candidates found in the system'
        }
      />

      <ManageCandidate
        selectedCandidate={selectedCandidate}
        setSelectedCandidate={setSelectedCandidate}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportCandidate
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default CandidatesPage;
