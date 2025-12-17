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
import { useAttendance, type AttendanceRecord } from 'hooks/useAttendance';
import { useEmployees } from 'hooks/useEmployees';
import {
  useLeaveApplications,
  type LeaveApplication,
} from 'hooks/useLeaveApplications';
import { useLeaveBalances } from 'hooks/useLeaveBalances';
import {
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
import React, { useMemo } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import StatsCard from 'shared/StatsCard';
import Table from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import dayjs from 'dayjs';

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

const AttendanceDashboard: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

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

  const { data: leaveBalancesResponse, isLoading: leaveBalancesLoading } =
    useLeaveBalances({
      limit: 1000,
    });

  const employees = employeesResponse?.data || [];
  const attendanceRecords = attendanceResponse?.data || [];
  const leaveApplications = leaveApplicationsResponse?.data || [];
  const leaveBalances = leaveBalancesResponse?.data || [];

  const stats = useMemo(() => {
    const totalEmployees = employees.length;
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
    const halfDayToday = todayAttendanceRecords.filter(
      r => r.status === 'Half Day'
    ).length;
    const notMarkedToday = totalEmployees - todayAttendanceRecords.length;

    const totalLeaveApplications = leaveApplications.length;
    const pendingLeaveApplications = leaveApplications.filter(
      app => app.approval_status === 'Pending'
    ).length;
    const approvedLeaveApplications = leaveApplications.filter(
      app => app.approval_status === 'Approved'
    ).length;
    const rejectedLeaveApplications = leaveApplications.filter(
      app => app.approval_status === 'Rejected'
    ).length;

    const totalLeaveBalances = leaveBalances.length;
    const activeLeaveBalances = leaveBalances.filter(
      b => b.status === 'Active'
    ).length;

    const attendanceByStatus = todayAttendanceRecords.reduce(
      (acc, record) => {
        acc[record.status] = (acc[record.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    if (notMarkedToday > 0) {
      attendanceByStatus['Not Marked'] = notMarkedToday;
    }

    const leaveApplicationsByStatus = leaveApplications.reduce(
      (acc, app) => {
        acc[app.approval_status] = (acc[app.approval_status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const leaveApplicationsByType = leaveApplications.reduce(
      (acc, app) => {
        acc[app.leave_type] = (acc[app.leave_type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

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

    return {
      totalEmployees,
      presentToday,
      absentToday,
      onLeaveToday,
      halfDayToday,
      notMarkedToday,
      totalLeaveApplications,
      pendingLeaveApplications,
      approvedLeaveApplications,
      rejectedLeaveApplications,
      totalLeaveBalances,
      activeLeaveBalances,
      attendanceByStatus,
      leaveApplicationsByStatus,
      leaveApplicationsByType,
      recentAttendance,
      recentLeaveApplications,
    };
  }, [employees, attendanceRecords, leaveApplications, leaveBalances]);

  const isLoading =
    employeesLoading ||
    attendanceLoading ||
    leaveApplicationsLoading ||
    leaveBalancesLoading;

  const attendanceChartData = useMemo(() => {
    const labels = Object.keys(stats.attendanceByStatus);
    const data = Object.values(stats.attendanceByStatus);

    return {
      labels,
      datasets: [
        {
          label: 'Attendance Status',
          data,
          backgroundColor: [
            '#10b981',
            '#ef4444',
            '#f59e0b',
            '#8b5cf6',
            '#6b7280',
            '#3b82f6',
          ],
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    };
  }, [stats.attendanceByStatus]);

  const leaveStatusChartData = useMemo(() => {
    const labels = Object.keys(stats.leaveApplicationsByStatus);
    const data = Object.values(stats.leaveApplicationsByStatus);

    return {
      labels,
      datasets: [
        {
          label: 'Leave Applications by Status',
          data,
          backgroundColor: ['#f59e0b', '#10b981', '#ef4444', '#6b7280'],
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    };
  }, [stats.leaveApplicationsByStatus]);

  const leaveTypeChartData = useMemo(() => {
    const labels = Object.keys(stats.leaveApplicationsByType);
    const data = Object.values(stats.leaveApplicationsByType);

    return {
      labels,
      datasets: [
        {
          label: 'Leave Applications by Type',
          data,
          backgroundColor: '#3b82f6',
          borderColor: '#2563eb',
          borderWidth: 1,
        },
      ],
    };
  }, [stats.leaveApplicationsByType]);

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

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
        <div>
          <h2 className="text-2xl font-semibold text-blue-600 mb-1">
            Attendance & Leaves Dashboard
          </h2>
          <p className="text-gray-500 text-sm">
            Overview of attendance, leave applications, and leave balances
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon={<Users className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Present Today"
          value={stats.presentToday}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Absent Today"
          value={stats.absentToday}
          icon={<XCircle className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
        <StatsCard
          title="On Leave Today"
          value={stats.onLeaveToday}
          icon={<Calendar className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Leave Applications"
          value={stats.totalLeaveApplications}
          icon={<FileText className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Pending Applications"
          value={stats.pendingLeaveApplications}
          icon={<Clock className="w-6 h-6" />}
          color="orange"
          isLoading={isLoading}
        />
        <StatsCard
          title="Approved Applications"
          value={stats.approvedLeaveApplications}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Leave Balances"
          value={stats.activeLeaveBalances}
          icon={<TrendingUp className="w-6 h-6" />}
          color="cyan"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Today's Attendance Status
          </h3>
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
        </div>

        <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Leave Applications by Status
          </h3>
          <div className="h-64">
            <Doughnut
              data={leaveStatusChartData}
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
      </div>

      <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Leave Applications by Type
        </h3>
        <div className="h-64">
          <Bar
            data={leaveTypeChartData}
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
                      return `Applications: ${context.parsed.y}`;
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-sm p-4 rounded-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Recent Attendance Records
          </h3>
          <Table
            data={stats.recentAttendance}
            compact
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
        </div>

        <div className="bg-white shadow-sm p-4 rounded-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Recent Leave Applications
          </h3>
          <Table
            compact
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
        </div>
      </div>
    </div>
  );
};

export default AttendanceDashboard;
