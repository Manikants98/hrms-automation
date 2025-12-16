import { Download } from '@mui/icons-material';
import { Box, Chip, MenuItem, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useCandidates, type Candidate } from 'hooks/useCandidates';
import { useExportToExcel } from 'hooks/useImportExport';
import { useHiringStages } from 'hooks/useHiringStages';
import { useJobPostings, type JobPosting } from 'hooks/useJobPostings';
import {
  Briefcase,
  CheckCircle,
  Clock,
  FileText,
  TrendingUp,
  User,
  Users,
  XCircle,
} from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import Input from 'shared/Input';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';

const HiringReports: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [jobPostingFilter, setJobPostingFilter] = useState<
    number | undefined
  >();
  const [hiringStageFilter, setHiringStageFilter] = useState<
    number | undefined
  >();
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const { data: candidatesResponse, isLoading: candidatesLoading } =
    useCandidates({
      search,
      status:
        statusFilter !== 'all'
          ? (statusFilter as Candidate['status'])
          : undefined,
      job_posting_id: jobPostingFilter,
      current_hiring_stage_id: hiringStageFilter,
      limit: 1000,
    });

  const { data: jobPostingsResponse } = useJobPostings({
    isActive: 'Y',
    limit: 1000,
  });

  const { data: hiringStagesResponse } = useHiringStages({
    isActive: 'Y',
    limit: 1000,
  });

  const candidates = candidatesResponse?.data || [];
  const jobPostings = jobPostingsResponse?.data || [];
  const hiringStages = hiringStagesResponse?.data || [];

  const filteredCandidates = useMemo(() => {
    let filtered = [...candidates];

    if (dateFrom) {
      filtered = filtered.filter(
        c =>
          c.application_date &&
          dayjs(c.application_date).isAfter(dayjs(dateFrom).subtract(1, 'day'))
      );
    }

    if (dateTo) {
      filtered = filtered.filter(
        c =>
          c.application_date &&
          dayjs(c.application_date).isBefore(dayjs(dateTo).add(1, 'day'))
      );
    }

    return filtered;
  }, [candidates, dateFrom, dateTo]);

  const stats = useMemo(() => {
    const totalCandidates = filteredCandidates.length;
    const candidatesInInterview = filteredCandidates.filter(
      c => c.status === 'Interview'
    ).length;
    const candidatesOffered = filteredCandidates.filter(
      c => c.status === 'Offer'
    ).length;
    const candidatesHired = filteredCandidates.filter(
      c => c.status === 'Hired'
    ).length;
    const candidatesRejected = filteredCandidates.filter(
      c => c.status === 'Rejected'
    ).length;
    const candidatesScreening = filteredCandidates.filter(
      c => c.status === 'Screening'
    ).length;
    const candidatesApplied = filteredCandidates.filter(
      c => c.status === 'Applied'
    ).length;

    const candidatesByJobPosting = filteredCandidates.reduce(
      (acc, candidate) => {
        const jobTitle = candidate.job_posting_title || 'Unknown';
        acc[jobTitle] = (acc[jobTitle] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const candidatesByStage = filteredCandidates.reduce(
      (acc, candidate) => {
        const stageName = candidate.current_hiring_stage_name || 'Not Assigned';
        acc[stageName] = (acc[stageName] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const candidatesByStatus = filteredCandidates.reduce(
      (acc, candidate) => {
        acc[candidate.status] = (acc[candidate.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalCandidates,
      candidatesInInterview,
      candidatesOffered,
      candidatesHired,
      candidatesRejected,
      candidatesScreening,
      candidatesApplied,
      candidatesByJobPosting,
      candidatesByStage,
      candidatesByStatus,
    };
  }, [filteredCandidates]);

  const exportToExcelMutation = useExportToExcel();

  const handleExportToExcel = useCallback(async () => {
    try {
      await exportToExcelMutation.mutateAsync({
        tableName: 'hiring_reports',
        filters: {
          search,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          job_posting_id: jobPostingFilter,
          current_hiring_stage_id: hiringStageFilter,
          date_from: dateFrom,
          date_to: dateTo,
        },
      });
    } catch (error) {
      console.error('Error exporting hiring reports to Excel:', error);
    }
  }, [
    exportToExcelMutation,
    search,
    statusFilter,
    jobPostingFilter,
    hiringStageFilter,
    dateFrom,
    dateTo,
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Applied':
        return 'default';
      case 'Screening':
        return 'info';
      case 'Interview':
        return 'warning';
      case 'Offer':
        return 'info';
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
      label: 'Candidate Name',
      render: (_value, row) => (
        <Typography variant="body2" className="!font-medium !text-gray-900">
          {row.name}
        </Typography>
      ),
    },
    {
      id: 'email',
      label: 'Email',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.email}
        </Typography>
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
          color={getStatusColor(row.status)}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      id: 'application_date',
      label: 'Application Date',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {formatDate(row.application_date) || '-'}
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
  ];

  const jobPostingColumns: TableColumn<JobPosting>[] = [
    {
      id: 'job_title',
      label: 'Job Title',
      render: (_value, row) => (
        <Typography variant="body2" className="!font-medium !text-gray-900">
          {row.job_title}
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
      id: 'posting_date',
      label: 'Posting Date',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {formatDate(row.posting_date) || '-'}
        </Typography>
      ),
    },
    {
      id: 'closing_date',
      label: 'Closing Date',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {formatDate(row.closing_date) || '-'}
        </Typography>
      ),
    },
    {
      id: 'candidate_count',
      label: 'Candidates',
      render: (_value, row) => {
        const count = filteredCandidates.filter(
          c => c.job_posting_id === row.id
        ).length;
        return (
          <Typography variant="body2" className="!text-gray-900">
            {count}
          </Typography>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <Box className="!flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">Hiring Reports</p>
          <p className="!text-gray-500 text-sm">
            Comprehensive reports on hiring activities, candidates, and job
            postings
          </p>
        </Box>
        <PopConfirm
          title="Export Report to Excel"
          description="Are you sure you want to export the current hiring reports data to Excel? This will include all filtered results."
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
          title="Total Candidates"
          value={stats.totalCandidates}
          icon={<Users className="w-6 h-6" />}
          color="blue"
          isLoading={candidatesLoading}
        />
        <StatsCard
          title="In Interview"
          value={stats.candidatesInInterview}
          icon={<Clock className="w-6 h-6" />}
          color="orange"
          isLoading={candidatesLoading}
        />
        <StatsCard
          title="Offer Extended"
          value={stats.candidatesOffered}
          icon={<CheckCircle className="w-6 h-6" />}
          color="blue"
          isLoading={candidatesLoading}
        />
        <StatsCard
          title="Hired"
          value={stats.candidatesHired}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
          isLoading={candidatesLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Rejected"
          value={stats.candidatesRejected}
          icon={<XCircle className="w-6 h-6" />}
          color="red"
          isLoading={candidatesLoading}
        />
        <StatsCard
          title="Screening"
          value={stats.candidatesScreening}
          icon={<FileText className="w-6 h-6" />}
          color="cyan"
          isLoading={candidatesLoading}
        />
        <StatsCard
          title="Applied"
          value={stats.candidatesApplied}
          icon={<User className="w-6 h-6" />}
          color="purple"
          isLoading={candidatesLoading}
        />
        <StatsCard
          title="Active Job Postings"
          value={jobPostings.length}
          icon={<Briefcase className="w-6 h-6" />}
          color="green"
          isLoading={candidatesLoading}
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
            placeholder="Search candidates..."
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
            <MenuItem value="Applied">Applied</MenuItem>
            <MenuItem value="Screening">Screening</MenuItem>
            <MenuItem value="Interview">Interview</MenuItem>
            <MenuItem value="Offer">Offer</MenuItem>
            <MenuItem value="Hired">Hired</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
            <MenuItem value="Withdrawn">Withdrawn</MenuItem>
          </Select>
          <Select
            value={jobPostingFilter?.toString() || ''}
            setValue={value =>
              setJobPostingFilter(value ? Number(value) : undefined)
            }
            label="Job Posting"
            placeholder="All Job Postings"
            fullWidth
          >
            <MenuItem value="">All Job Postings</MenuItem>
            {jobPostings.map(jp => (
              <MenuItem key={jp.id} value={jp.id.toString()}>
                {jp.job_title}
              </MenuItem>
            ))}
          </Select>
          <Select
            value={hiringStageFilter?.toString() || ''}
            setValue={value =>
              setHiringStageFilter(value ? Number(value) : undefined)
            }
            label="Hiring Stage"
            placeholder="All Stages"
            fullWidth
          >
            <MenuItem value="">All Stages</MenuItem>
            {hiringStages.map(stage => (
              <MenuItem key={stage.id} value={stage.id.toString()}>
                {stage.name}
              </MenuItem>
            ))}
          </Select>
          <Input
            type="date"
            label="Date From"
            value={dateFrom}
            setValue={setDateFrom}
            fullWidth
          />
          <Input
            type="date"
            label="Date To"
            value={dateTo}
            setValue={setDateTo}
            fullWidth
          />
        </Box>
      </Box>

      <Table
        actions={
          <div className="!flex !justify-between !items-center">
            <Typography className="!font-semibold !text-gray-900">
              Candidates Report
            </Typography>
          </div>
        }
        data={filteredCandidates}
        columns={candidateColumns}
        getRowId={row => row.id}
        loading={candidatesLoading}
        totalCount={candidatesResponse?.data?.length || 0}
        page={0}
        rowsPerPage={10}
        onPageChange={() => {}}
        emptyMessage="No candidates found"
      />

      <Table
        actions={
          <div className="!flex !justify-between !items-center">
            <Typography className="!font-semibold !text-gray-900">
              Job Postings Report
            </Typography>
          </div>
        }
        data={jobPostings}
        columns={jobPostingColumns}
        getRowId={row => row.id}
        loading={candidatesLoading}
        totalCount={jobPostingsResponse?.meta?.total_count || 0}
        page={0}
        rowsPerPage={10}
        onPageChange={() => {}}
        emptyMessage="No job postings found"
      />
    </div>
  );
};

export default HiringReports;
