import { Add, Block, CheckCircle, Download, Upload } from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  FormControl,
  MenuItem,
  Select as MuiSelect,
  Typography,
} from '@mui/material';
import {
  useJobPostings,
  useDeleteJobPosting,
  type JobPosting,
} from 'hooks/useJobPostings';
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
import ImportJobPosting from './ImportJobPosting';
import ManageJobPosting from './ManageJobPosting';

const JobPostingsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedJobPosting, setSelectedJobPosting] =
    useState<JobPosting | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission('user' as any);

  const {
    data: jobPostingsResponse,
    isLoading,
    error,
  } = useJobPostings(
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

  const jobPostings = jobPostingsResponse?.data || [];
  const totalCount = jobPostingsResponse?.meta?.total_count || 0;
  const currentPage = (jobPostingsResponse?.meta?.current_page || 1) - 1;

  const deleteJobPostingMutation = useDeleteJobPosting();
  const exportToExcelMutation = useExportToExcel();

  const stats = jobPostingsResponse?.stats as any;
  const totalJobPostings = stats?.total_job_postings ?? jobPostings.length;
  const activeJobPostings =
    stats?.active_job_postings ??
    jobPostings.filter(jp => jp.is_active === 'Y').length;
  const inactiveJobPostings =
    stats?.inactive_job_postings ??
    jobPostings.filter(jp => jp.is_active === 'N').length;
  const newJobPostingsThisMonth = stats?.new_job_postings ?? 0;

  const handleCreateJobPosting = useCallback(() => {
    setSelectedJobPosting(null);
    setDrawerOpen(true);
  }, []);

  const handleEditJobPosting = useCallback((jobPosting: JobPosting) => {
    setSelectedJobPosting(jobPosting);
    setDrawerOpen(true);
  }, []);

  const handleDeleteJobPosting = useCallback(
    async (id: number) => {
      try {
        await deleteJobPostingMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting job posting:', error);
      }
    },
    [deleteJobPostingMutation]
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
        tableName: 'job_postings',
        filters,
      });
    } catch (error) {
      console.error('Error exporting job postings:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const jobPostingColumns: TableColumn<JobPosting>[] = [
    {
      id: 'job_title',
      label: 'Job Title',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.job_title}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <Briefcase className="w-5 h-5" />
          </Avatar>
          <Box className="!max-w-xs">
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.job_title}
            </Typography>
          </Box>
        </Box>
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
      id: 'reporting_manager_name',
      label: 'Reporting Manager',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.reporting_manager_name || '-'}
        </Typography>
      ),
    },
    {
      id: 'salary_range',
      label: 'Salary Range',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.annual_salary_from && row.annual_salary_to
            ? `${row.currency_code || ''} ${row.annual_salary_from.toLocaleString()} - ${row.annual_salary_to.toLocaleString()}`
            : '-'}
        </Typography>
      ),
    },
    {
      id: 'posting_date',
      label: 'Posting Date',
      render: (_value, row) =>
        formatDate(row.posting_date) || (
          <span className="italic text-gray-400">No Date</span>
        ),
    },
    {
      id: 'closing_date',
      label: 'Closing Date',
      render: (_value, row) =>
        formatDate(row.closing_date) || (
          <span className="italic text-gray-400">No Date</span>
        ),
    },
    {
      id: 'is_internal_job',
      label: 'Internal Job',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.is_internal_job === 'Y' ? 'Yes' : 'No'}
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
            render: (_value: any, row: JobPosting) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditJobPosting(row)}
                    tooltip={`Edit ${row.job_title}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteJobPosting(row.id)}
                    tooltip={`Delete ${row.job_title}`}
                    itemName={row.job_title}
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
          <p className="!font-bold text-xl !text-gray-900">Job Postings</p>
          <p className="!text-gray-500 text-sm">
            Manage job postings and recruitment opportunities
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Job Postings"
          value={totalJobPostings}
          icon={<Briefcase className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Postings"
          value={activeJobPostings}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Inactive Postings"
          value={inactiveJobPostings}
          icon={<Block className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
        <StatsCard
          title="New This Month"
          value={newJobPostingsThisMonth}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load job postings. Please try again.
        </Alert>
      )}

      <Table
        data={jobPostings}
        columns={jobPostingColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Job Posting"
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
                    title="Export Job Postings"
                    description="Are you sure you want to export the current job postings data to Excel? This will include all filtered results."
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
                    onClick={handleCreateJobPosting}
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
        getRowId={jobPosting => jobPosting.id}
        initialOrderBy="job_title"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead !== false}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No job postings found matching "${search}"`
            : 'No job postings found in the system'
        }
      />

      <ManageJobPosting
        selectedJobPosting={selectedJobPosting}
        setSelectedJobPosting={setSelectedJobPosting}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportJobPosting
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default JobPostingsPage;
