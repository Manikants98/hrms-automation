import { Chip, Typography } from '@mui/material';
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
import dayjs from 'dayjs';
import { useAttendance, type AttendanceRecord } from 'hooks/useAttendance';
import { useCandidates, type Candidate } from 'hooks/useCandidates';
import { useEmployees } from 'hooks/useEmployees';
import { useJobPostings } from 'hooks/useJobPostings';
import {
  useLeaveApplications,
  type LeaveApplication,
} from 'hooks/useLeaveApplications';
import { usePayrollProcessing } from 'hooks/usePayrollProcessing';
import { useSalarySlips } from 'hooks/useSalarySlips';
import {
  Briefcase,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  TrendingUp,
  User,
  Users,
} from 'lucide-react';
import React, { useMemo } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import StatsCard from 'shared/StatsCard';
import Table from 'shared/Table';
import { formatDate } from 'utils/dateUtils';

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

const HRDashboard: React.FC = () => {
  const today = dayjs().format('YYYY-MM-DD');

  const { data: employeesResponse, isLoading: employeesLoading } = useEmployees(
    {
      isActive: 'Y',
      limit: 1000,
    }
  );

  const { data: attendanceResponse, isLoading: attendanceLoading } =
    useAttendance({
      limit: 1000,
    });

  const {
    data: leaveApplicationsResponse,
    isLoading: leaveApplicationsLoading,
  } = useLeaveApplications({
    limit: 1000,
  });

  const { data: candidatesResponse, isLoading: candidatesLoading } =
    useCandidates({
      limit: 1000,
    });

  const { data: jobPostingsResponse, isLoading: jobPostingsLoading } =
    useJobPostings({
      isActive: 'Y',
      limit: 1000,
    });

  const { data: payrollProcessingResponse, isLoading: payrollLoading } =
    usePayrollProcessing({
      limit: 1000,
    });

  const { data: salarySlipsResponse, isLoading: salarySlipsLoading } =
    useSalarySlips({
      limit: 1000,
    });

  const employees = employeesResponse?.data || [];
  const attendanceRecords = attendanceResponse?.data || [];
  const leaveApplications = leaveApplicationsResponse?.data || [];
  const candidates = candidatesResponse?.data || [];
  const jobPostings = jobPostingsResponse?.data || [];
  const payrollProcessing = payrollProcessingResponse?.data || [];
  const salarySlips = salarySlipsResponse?.data || [];

  const stats = useMemo(() => {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.is_active === 'Y').length;
    const newEmployeesThisMonth = employees.filter(emp => {
      if (!emp.joining_date) return false;
      const joiningDate = dayjs(emp.joining_date);
      const now = dayjs();
      return (
        joiningDate.month() === now.month() && joiningDate.year() === now.year()
      );
    }).length;

    const todayAttendanceRecords = attendanceRecords.filter(
      r => r.attendance_date === today
    );
    const presentToday = todayAttendanceRecords.filter(
      r => r.status === 'Present'
    ).length;
    const absentToday = todayAttendanceRecords.filter(
      r => r.status === 'Absent'
    ).length;
    const onLeaveToday = todayAttendanceRecords.filter(
      r => r.status === 'Leave'
    ).length;
    const attendanceRate =
      totalEmployees > 0
        ? ((presentToday / totalEmployees) * 100).toFixed(1)
        : '0';

    const totalLeaveApplications = leaveApplications.length;
    const pendingLeaveApplications = leaveApplications.filter(
      app => app.approval_status === 'Pending'
    ).length;
    const approvedLeaveApplications = leaveApplications.filter(
      app => app.approval_status === 'Approved'
    ).length;

    const totalCandidates = candidates.length;
    const candidatesHired = candidates.filter(c => c.status === 'Hired').length;
    const candidatesInInterview = candidates.filter(
      c => c.status === 'Interview'
    ).length;
    const activeJobPostings = jobPostings.filter(
      jp => jp.is_active === 'Y'
    ).length;

    const totalPayroll = payrollProcessing.length;
    const totalNetSalary = payrollProcessing.reduce(
      (sum, p) => sum + p.total_net_salary,
      0
    );
    const paidPayroll = payrollProcessing.filter(
      p => p.status === 'Paid'
    ).length;
    const totalSalarySlips = salarySlips.length;

    const attendanceByStatus = todayAttendanceRecords.reduce(
      (acc, record) => {
        acc[record.status] = (acc[record.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const leaveApplicationsByStatus = leaveApplications.reduce(
      (acc, app) => {
        acc[app.approval_status] = (acc[app.approval_status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const candidatesByStatus = candidates.reduce(
      (acc, candidate) => {
        acc[candidate.status] = (acc[candidate.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const employeesByDepartment = employees.reduce(
      (acc, emp) => {
        const dept = emp.department_name || 'Unknown';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = dayjs().subtract(6 - i, 'day');
      return date.format('YYYY-MM-DD');
    });

    const attendanceTrend = last7Days.map(date => {
      const dayRecords = attendanceRecords.filter(
        r => r.attendance_date === date
      );
      const present = dayRecords.filter(r => r.status === 'Present').length;
      return present;
    });

    const recentAttendance = [...attendanceRecords]
      .sort(
        (a, b) =>
          new Date(b.attendance_date || '').getTime() -
          new Date(a.attendance_date || '').getTime()
      )
      .slice(0, 5);

    const recentLeaveApplications = [...leaveApplications]
      .sort(
        (a, b) =>
          new Date(b.createdate || '').getTime() -
          new Date(a.createdate || '').getTime()
      )
      .slice(0, 5);

    const recentCandidates = [...candidates]
      .sort(
        (a, b) =>
          new Date(b.application_date || '').getTime() -
          new Date(a.application_date || '').getTime()
      )
      .slice(0, 5);

    return {
      totalEmployees,
      activeEmployees,
      newEmployeesThisMonth,
      presentToday,
      absentToday,
      onLeaveToday,
      attendanceRate,
      totalLeaveApplications,
      pendingLeaveApplications,
      approvedLeaveApplications,
      totalCandidates,
      candidatesHired,
      candidatesInInterview,
      activeJobPostings,
      totalPayroll,
      totalNetSalary,
      paidPayroll,
      totalSalarySlips,
      attendanceByStatus,
      leaveApplicationsByStatus,
      candidatesByStatus,
      employeesByDepartment,
      attendanceTrend,
      recentAttendance,
      recentLeaveApplications,
      recentCandidates,
      last7Days,
    };
  }, [
    employees,
    attendanceRecords,
    leaveApplications,
    candidates,
    jobPostings,
    payrollProcessing,
    salarySlips,
    today,
  ]);

  const isLoading =
    employeesLoading ||
    attendanceLoading ||
    leaveApplicationsLoading ||
    candidatesLoading ||
    jobPostingsLoading ||
    payrollLoading ||
    salarySlipsLoading;

  const attendanceChartData = useMemo(() => {
    const labels = Object.keys(stats.attendanceByStatus);
    const data = Object.values(stats.attendanceByStatus);

    return {
      labels,
      datasets: [
        {
          label: "Today's Attendance",
          data,
          backgroundColor: [
            '#10b981',
            '#ef4444',
            '#3b82f6',
            '#f59e0b',
            '#6b7280',
          ],
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    };
  }, [stats.attendanceByStatus]);

  const leaveApplicationsChartData = useMemo(() => {
    const labels = Object.keys(stats.leaveApplicationsByStatus);
    const data = Object.values(stats.leaveApplicationsByStatus);

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: ['#f59e0b', '#10b981', '#ef4444', '#6b7280'],
          borderWidth: 0,
        },
      ],
    };
  }, [stats.leaveApplicationsByStatus]);

  const candidatesChartData = useMemo(() => {
    const labels = Object.keys(stats.candidatesByStatus);
    const data = Object.values(stats.candidatesByStatus);

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            '#3b82f6',
            '#10b981',
            '#f59e0b',
            '#8b5cf6',
            '#ef4444',
            '#6b7280',
          ],
          borderWidth: 0,
        },
      ],
    };
  }, [stats.candidatesByStatus]);

  const attendanceTrendData = useMemo(() => {
    return {
      labels: stats.last7Days.map(date => dayjs(date).format('MMM DD')),
      datasets: [
        {
          label: 'Present Employees',
          data: stats.attendanceTrend,
          backgroundColor: '#10b981',
          borderColor: '#10b981',
          borderWidth: 1,
        },
      ],
    };
  }, [stats.attendanceTrend, stats.last7Days]);

  const employeesByDepartmentData = useMemo(() => {
    const sortedDepts = Object.entries(stats.employeesByDepartment)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      labels: sortedDepts.map(([dept]) => dept),
      datasets: [
        {
          label: 'Employees',
          data: sortedDepts.map(([, count]) => count),
          backgroundColor: '#3b82f6',
          borderColor: '#3b82f6',
          borderWidth: 1,
        },
      ],
    };
  }, [stats.employeesByDepartment]);

  const getAttendanceStatusColor = (status: string) => {
    switch (status) {
      case 'Present':
        return 'success';
      case 'Absent':
        return 'error';
      case 'Half Day':
        return 'warning';
      case 'Leave':
        return 'info';
      case 'Not Marked':
        return 'default';
      default:
        return 'default';
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'error';
      case 'Pending':
        return 'warning';
      case 'Cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const getCandidateStatusColor = (status: string) => {
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
            HR Dashboard
          </h2>
          <p className="text-gray-500 text-sm">
            Overview of employees, attendance, leaves, hiring, and payroll
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon={<Users className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Attendance Rate"
          value={`${stats.attendanceRate}%`}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Pending Leaves"
          value={stats.pendingLeaveApplications}
          icon={<Clock className="w-6 h-6" />}
          color="orange"
          isLoading={isLoading}
        />
        <StatsCard
          title="Total Payroll"
          value={`₹${(stats.totalNetSalary / 100000).toFixed(1)}L`}
          icon={<DollarSign className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Active Job Postings"
          value={stats.activeJobPostings}
          icon={<Briefcase className="w-6 h-6" />}
          color="cyan"
          isLoading={isLoading}
        />
        <StatsCard
          title="Candidates in Interview"
          value={stats.candidatesInInterview}
          icon={<User className="w-6 h-6" />}
          color="indigo"
          isLoading={isLoading}
        />
        <StatsCard
          title="Present Today"
          value={stats.presentToday}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Salary Slips"
          value={stats.totalSalarySlips}
          icon={<FileText className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Today's Attendance Status
          </h3>
          {Object.keys(stats.attendanceByStatus).length > 0 ? (
            <div className="h-64">
              <Doughnut
                data={attendanceChartData}
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
          ) : (
            <div className="h-64 flex items-center justify-center">
              <Typography variant="body2" className="!text-gray-500">
                No attendance data available
              </Typography>
            </div>
          )}
        </div>

        <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Leave Applications by Status
          </h3>
          {Object.keys(stats.leaveApplicationsByStatus).length > 0 ? (
            <div className="h-64">
              <Doughnut
                data={leaveApplicationsChartData}
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
          ) : (
            <div className="h-64 flex items-center justify-center">
              <Typography variant="body2" className="!text-gray-500">
                No leave data available
              </Typography>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Candidates by Status
          </h3>
          {Object.keys(stats.candidatesByStatus).length > 0 ? (
            <div className="h-64">
              <Doughnut
                data={candidatesChartData}
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
          ) : (
            <div className="h-64 flex items-center justify-center">
              <Typography variant="body2" className="!text-gray-500">
                No candidate data available
              </Typography>
            </div>
          )}
        </div>

        <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Employees by Department
          </h3>
          {Object.keys(stats.employeesByDepartment).length > 0 ? (
            <div className="h-64">
              <Bar
                data={employeesByDepartmentData}
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
                          return `Employees: ${context.parsed.y}`;
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
                    x: {
                      ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                      },
                    },
                  },
                }}
              />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <Typography variant="body2" className="!text-gray-500">
                No department data available
              </Typography>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Attendance Trend (Last 7 Days)
        </h3>
        {stats.attendanceTrend.length > 0 ? (
          <div className="h-64">
            <Bar
              data={attendanceTrendData}
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
                        return `Present: ${context.parsed.y}`;
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
                  x: {
                    ticks: {
                      maxRotation: 45,
                      minRotation: 45,
                    },
                  },
                },
              }}
            />
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <Typography variant="body2" className="!text-gray-500">
              No attendance trend data available
            </Typography>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Table
          data={stats.recentAttendance}
          compact
          actions={
            <div>
              <Typography className="!text-gray-900 !font-medium">
                Recent Attendance Records
              </Typography>
            </div>
          }
          columns={[
            {
              id: 'employee_name',
              label: 'Employee',
              render: (_value, row: AttendanceRecord) => (
                <Typography
                  variant="body2"
                  className="!font-medium !text-gray-900"
                >
                  {row.employee_name}
                </Typography>
              ),
            },
            {
              id: 'attendance_date',
              label: 'Date',
              render: (_value, row: AttendanceRecord) => (
                <Typography variant="body2" className="!text-gray-900">
                  {row.attendance_date
                    ? dayjs(row.attendance_date).format('DD-MM-YYYY')
                    : '-'}
                </Typography>
              ),
            },
            {
              id: 'status',
              label: 'Status',
              render: (_value, row: AttendanceRecord) => (
                <Chip
                  label={row.status}
                  color={getAttendanceStatusColor(row.status) as any}
                  size="small"
                  variant="outlined"
                />
              ),
            },
            {
              id: 'punch_in_time',
              label: 'Punch In',
              render: (_value, row: AttendanceRecord) => (
                <Typography variant="body2" className="!text-gray-900">
                  {row.punch_in_time || '-'}
                </Typography>
              ),
            },
          ]}
          getRowId={(row: AttendanceRecord) => row.id}
          pagination={false}
          sortable={false}
          emptyMessage="No recent attendance records"
        />

        <Table
          compact
          actions={
            <div>
              <Typography className="!text-gray-900 !font-medium">
                Recent Leave Applications
              </Typography>
            </div>
          }
          data={stats.recentLeaveApplications}
          columns={[
            {
              id: 'employee_name',
              label: 'Employee',
              render: (_value, row: LeaveApplication) => (
                <Typography
                  variant="body2"
                  className="!font-medium !text-gray-900"
                >
                  {row.employee_name}
                </Typography>
              ),
            },
            {
              id: 'leave_type',
              label: 'Leave Type',
              render: (_value, row: LeaveApplication) => (
                <Typography variant="body2" className="!text-gray-900">
                  {row.leave_type}
                </Typography>
              ),
            },
            {
              id: 'approval_status',
              label: 'Status',
              render: (_value, row: LeaveApplication) => (
                <Chip
                  label={row.approval_status}
                  color={getApprovalStatusColor(row.approval_status) as any}
                  size="small"
                  variant="outlined"
                />
              ),
            },
            {
              id: 'createdate',
              label: 'Applied Date',
              render: (_value, row: LeaveApplication) => (
                <Typography variant="body2" className="!text-gray-900">
                  {formatDate(row.createdate) || '-'}
                </Typography>
              ),
            },
          ]}
          getRowId={(row: LeaveApplication) => row.id}
          pagination={false}
          sortable={false}
          emptyMessage="No recent leave applications"
        />

        <Table
          compact
          actions={
            <div>
              <Typography className="!text-gray-900 !font-medium">
                Recent Candidates
              </Typography>
            </div>
          }
          data={stats.recentCandidates}
          columns={[
            {
              id: 'name',
              label: 'Name',
              render: (_value, row: Candidate) => (
                <Typography
                  variant="body2"
                  className="!font-medium !text-gray-900"
                >
                  {row.name}
                </Typography>
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
                  color={getCandidateStatusColor(row.status) as any}
                  size="small"
                  variant="outlined"
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
    </div>
  );
};

export default HRDashboard;
