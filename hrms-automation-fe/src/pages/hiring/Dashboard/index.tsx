import { Box, Chip, Typography } from '@mui/material';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { useCandidates } from 'hooks/useCandidates';
import { useHiringStages } from 'hooks/useHiringStages';
import { useJobPostings } from 'hooks/useJobPostings';
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
import React, { useMemo } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import StatsCard from 'shared/StatsCard';
import Table from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import type { Candidate } from 'hooks/useCandidates';
import type { HiringStage } from 'hooks/useHiringStages';
import type { JobPosting } from 'hooks/useJobPostings';

const normalizeArray = <T,>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];

  if (value && typeof value === 'object') {
    const v = value as any;
    if (Array.isArray(v.data)) return v.data as T[];
    if (Array.isArray(v.items)) return v.items as T[];
    if (Array.isArray(v.rows)) return v.rows as T[];
    if (Array.isArray(v.result)) return v.result as T[];
  }

  return [];
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const HiringDashboard: React.FC = () => {
  const { data: hiringStagesResponse, isLoading: stagesLoading } =
    useHiringStages({ isActive: 'Y' });
  const { data: jobPostingsResponse, isLoading: postingsLoading } =
    useJobPostings({ isActive: 'Y' });
  const { data: candidatesResponse, isLoading: candidatesLoading } =
    useCandidates({ isActive: 'Y' });

  const hiringStages = normalizeArray<HiringStage>(hiringStagesResponse?.data);
  const jobPostings = normalizeArray<JobPosting>(jobPostingsResponse?.data);
  const candidates = normalizeArray<Candidate>(candidatesResponse?.data);

  const stats = useMemo(() => {
    const totalHiringStages = hiringStages.length;
    const activeJobPostings = jobPostings.filter(
      jp => jp.is_active === 'Y'
    ).length;
    const totalCandidates = candidates.length;
    const activeCandidates = candidates.filter(c => c.is_active === 'Y').length;

    const candidatesByStatus = candidates.reduce(
      (acc, candidate) => {
        acc[candidate.status] = (acc[candidate.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const candidatesInInterview = candidates.filter(
      c => c.status === 'Interview'
    ).length;
    const candidatesOffered = candidates.filter(
      c => c.status === 'Offer'
    ).length;
    const candidatesHired = candidates.filter(c => c.status === 'Hired').length;
    const candidatesRejected = candidates.filter(
      c => c.status === 'Rejected'
    ).length;

    const recentCandidates = [...candidates]
      .sort(
        (a, b) =>
          new Date(b.application_date || '').getTime() -
          new Date(a.application_date || '').getTime()
      )
      .slice(0, 5);

    const recentJobPostings = [...jobPostings]
      .sort(
        (a, b) =>
          new Date(b.posting_date || '').getTime() -
          new Date(a.posting_date || '').getTime()
      )
      .slice(0, 5);

    const candidatesByStage = candidates.reduce(
      (acc, candidate) => {
        const stageName = candidate.current_hiring_stage_name || 'Not Assigned';
        acc[stageName] = (acc[stageName] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalHiringStages,
      activeJobPostings,
      totalCandidates,
      activeCandidates,
      candidatesByStatus,
      candidatesInInterview,
      candidatesOffered,
      candidatesHired,
      candidatesRejected,
      recentCandidates,
      recentJobPostings,
      candidatesByStage,
    };
  }, [hiringStages, jobPostings, candidates]);

  const isLoading = stagesLoading || postingsLoading || candidatesLoading;

  const statusChartData = useMemo(() => {
    const labels = Object.keys(stats.candidatesByStatus);
    const data = Object.values(stats.candidatesByStatus);

    return {
      labels,
      datasets: [
        {
          label: 'Candidates by Status',
          data,
          backgroundColor: [
            '#3b82f6',
            '#10b981',
            '#f59e0b',
            '#8b5cf6',
            '#ef4444',
            '#6b7280',
            '#ec4899',
          ],
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    };
  }, [stats.candidatesByStatus]);

  const pipelineChartData = useMemo(() => {
    const stages = hiringStages.map(stage => stage.name);
    const data = stages.map(
      stageName => stats.candidatesByStage[stageName] || 0
    );

    return {
      labels: stages,
      datasets: [
        {
          label: 'Candidates in Pipeline',
          data,
          backgroundColor: '#3b82f6',
          borderColor: '#2563eb',
          borderWidth: 1,
        },
      ],
    };
  }, [hiringStages, stats.candidatesByStage]);

  const getStatusColor = (status: string) => {
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

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
        <div>
          <h2 className="text-2xl font-semibold text-blue-600 mb-1">
            Hiring Dashboard
          </h2>
          <p className="text-gray-500 text-sm">
            Overview of hiring activities, candidates, and job postings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Hiring Stages"
          value={stats.totalHiringStages}
          icon={<Briefcase className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Job Postings"
          value={stats.activeJobPostings}
          icon={<FileText className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Total Candidates"
          value={stats.totalCandidates}
          icon={<Users className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Candidates"
          value={stats.activeCandidates}
          icon={<User className="w-6 h-6" />}
          color="cyan"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="In Interview"
          value={stats.candidatesInInterview}
          icon={<Clock className="w-6 h-6" />}
          color="orange"
          isLoading={isLoading}
        />
        <StatsCard
          title="Offer Extended"
          value={stats.candidatesOffered}
          icon={<CheckCircle className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Hired"
          value={stats.candidatesHired}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Rejected"
          value={stats.candidatesRejected}
          icon={<XCircle className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Candidates by Status
          </h3>
          <div className="h-64">
            <Doughnut
              data={statusChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce(
                          (a: number, b: number) => a + b,
                          0
                        );
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value} (${percentage}%)`;
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Hiring Pipeline
          </h3>
          <div className="h-64">
            <Bar
              data={pipelineChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        return `Candidates: ${context.parsed.y}`;
                      },
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-sm p-4 rounded-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Recent Candidates
          </h3>
          <Table
            data={stats.recentCandidates}
            compact
            columns={[
              {
                id: 'name',
                label: 'Name',
                render: (_value, row: Candidate) => (
                  <Box>
                    <Typography
                      variant="body2"
                      className="!font-medium !text-gray-900"
                    >
                      {row.name}
                    </Typography>
                  </Box>
                ),
              },
              {
                id: 'job_posting_title',
                label: 'Job Posting',
                render: (_value, row: Candidate) => (
                  <Typography variant="body2" className="!text-gray-900">
                    {row.job_posting_title || '-'}
                  </Typography>
                ),
              },
              {
                id: 'status',
                label: 'Status',
                render: (_value, row: Candidate) => (
                  <Chip
                    label={row.status}
                    color={getStatusColor(row.status) as any}
                    size="small"
                  />
                ),
              },
              {
                id: 'application_date',
                label: 'Date',
                render: (_value, row: Candidate) => (
                  <Typography variant="body2" className="!text-gray-900">
                    {formatDate(row.application_date) || '-'}
                  </Typography>
                ),
              },
            ]}
            getRowId={(row: Candidate) => row.id}
            pagination={false}
            sortable={false}
            emptyMessage="No recent candidates"
          />
        </div>

        <div className="bg-white shadow-sm p-4 rounded-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Recent Job Postings
          </h3>
          <Table
            compact
            data={stats.recentJobPostings}
            columns={[
              {
                id: 'job_title',
                label: 'Job Title',
                render: (_value, row: JobPosting) => (
                  <Typography
                    variant="body2"
                    className="!font-medium !text-gray-900"
                  >
                    {row.job_title}
                  </Typography>
                ),
              },
              {
                id: 'department_name',
                label: 'Department',
                render: (_value, row: JobPosting) => (
                  <Typography variant="body2" className="!text-gray-900">
                    {row.department_name || '-'}
                  </Typography>
                ),
              },
              {
                id: 'closing_date',
                label: 'Closing Date',
                render: (_value, row: JobPosting) => (
                  <Typography variant="body2" className="!text-gray-900">
                    {formatDate(row.closing_date) || '-'}
                  </Typography>
                ),
              },
              {
                id: 'is_active',
                label: 'Status',
                render: (_value, row: JobPosting) => (
                  <Chip
                    label={row.is_active === 'Y' ? 'Active' : 'Inactive'}
                    color={row.is_active === 'Y' ? 'success' : 'default'}
                    size="small"
                  />
                ),
              },
            ]}
            getRowId={(row: JobPosting) => row.id}
            pagination={false}
            sortable={false}
            emptyMessage="No recent job postings"
          />
        </div>
      </div>
    </div>
  );
};

export default HiringDashboard;
