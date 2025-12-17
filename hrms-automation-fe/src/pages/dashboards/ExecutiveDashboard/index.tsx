import React, { useMemo } from 'react';
import {
  FaUsers,
  FaClipboardList,
  FaMoneyBillWave,
  FaCalendarCheck,
  FaBriefcase,
  FaChartLine,
} from 'react-icons/fa';
import { Skeleton } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut, Pie, Chart } from 'react-chartjs-2';
import { useEmployees } from 'hooks/useEmployees';
import { useAttendance } from 'hooks/useAttendance';
import { useCandidates } from 'hooks/useCandidates';
import { useJobPostings } from 'hooks/useJobPostings';
import { usePayrollProcessing } from 'hooks/usePayrollProcessing';
import { useLeaveApplications } from 'hooks/useLeaveApplications';
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

const ExecutiveDashboard: React.FC = () => {
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

  const {
    data: leaveApplicationsResponse,
    isLoading: leaveApplicationsLoading,
  } = useLeaveApplications({
    limit: 1000,
  });

  const employees = employeesResponse?.data || [];
  const attendanceRecords = attendanceResponse?.data || [];
  const candidates = candidatesResponse?.data || [];
  const jobPostings = jobPostingsResponse?.data || [];
  const payrollProcessing = payrollProcessingResponse?.data || [];
  const leaveApplications = leaveApplicationsResponse?.data || [];

  const CHART_COLORS = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6',
    cyan: '#06b6d4',
  };

  const getColorClasses = (color: string) => {
    const colorMap: {
      [key: string]: {
        bg: string;
        text: string;
        icon: string;
        progress: string;
      };
    } = {
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        icon: 'bg-blue-100',
        progress: 'bg-blue-500',
      },
      pink: {
        bg: 'bg-pink-50',
        text: 'text-pink-600',
        icon: 'bg-pink-100',
        progress: 'bg-pink-500',
      },
      cyan: {
        bg: 'bg-cyan-50',
        text: 'text-cyan-600',
        icon: 'bg-cyan-100',
        progress: 'bg-cyan-500',
      },
      green: {
        bg: 'bg-green-50',
        text: 'text-green-600',
        icon: 'bg-green-100',
        progress: 'bg-green-500',
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        icon: 'bg-purple-100',
        progress: 'bg-purple-500',
      },
      orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        icon: 'bg-orange-100',
        progress: 'bg-orange-500',
      },
    };
    return colorMap[color] || colorMap.blue;
  };

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

    const today = dayjs().format('YYYY-MM-DD');
    const todayAttendance = attendanceRecords.filter(
      r => r.attendance_date === today
    );
    const presentToday = todayAttendance.filter(
      r => r.status === 'Present'
    ).length;
    const attendanceRate =
      totalEmployees > 0
        ? ((presentToday / totalEmployees) * 100).toFixed(1)
        : '0';

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
    const totalEarnings = payrollProcessing.reduce(
      (sum, p) => sum + p.total_earnings,
      0
    );
    const paidPayroll = payrollProcessing.filter(
      p => p.status === 'Paid'
    ).length;

    const totalLeaveApplications = leaveApplications.length;
    const pendingLeaveApplications = leaveApplications.filter(
      app => app.approval_status === 'Pending'
    ).length;
    const approvedLeaveApplications = leaveApplications.filter(
      app => app.approval_status === 'Approved'
    ).length;

    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = dayjs().subtract(29 - i, 'day');
      return date.format('YYYY-MM-DD');
    });

    const attendanceTrend = last30Days.map(date => {
      const dayRecords = attendanceRecords.filter(
        r => r.attendance_date === date
      );
      const present = dayRecords.filter(r => r.status === 'Present').length;
      return present;
    });

    const employeeGrowth = last30Days.map(date => {
      return employees.filter(emp => {
        if (!emp.joining_date) return false;
        return dayjs(emp.joining_date).isBefore(dayjs(date).add(1, 'day'));
      }).length;
    });

    const payrollByMonth = payrollProcessing.reduce(
      (acc, payroll) => {
        const monthKey = `${payroll.payroll_year}-${payroll.payroll_month}`;
        if (!acc[monthKey]) {
          acc[monthKey] = {
            count: 0,
            total: 0,
            month: payroll.payroll_month,
            year: payroll.payroll_year,
          };
        }
        acc[monthKey].count += 1;
        acc[monthKey].total += payroll.total_net_salary;
        return acc;
      },
      {} as Record<
        string,
        { count: number; total: number; month: string; year: number }
      >
    );

    const getMonthName = (month: string) => {
      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      const monthNum = parseInt(month, 10);
      return monthNames[monthNum - 1] || month;
    };

    const payrollMonths = Object.values(payrollByMonth)
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return parseInt(a.month) - parseInt(b.month);
      })
      .slice(-6);

    const candidatesByStatus = candidates.reduce(
      (acc, candidate) => {
        acc[candidate.status] = (acc[candidate.status] || 0) + 1;
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

    const employeesByDepartment = employees.reduce(
      (acc, emp) => {
        const dept = emp.department_name || 'Unknown';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalEmployees,
      activeEmployees,
      newEmployeesThisMonth,
      attendanceRate,
      presentToday,
      totalCandidates,
      candidatesHired,
      candidatesInInterview,
      activeJobPostings,
      totalPayroll,
      totalNetSalary,
      totalEarnings,
      paidPayroll,
      totalLeaveApplications,
      pendingLeaveApplications,
      approvedLeaveApplications,
      attendanceTrend,
      employeeGrowth,
      payrollMonths,
      candidatesByStatus,
      leaveApplicationsByStatus,
      employeesByDepartment,
      getMonthName,
    };
  }, [
    employees,
    attendanceRecords,
    candidates,
    jobPostings,
    payrollProcessing,
    leaveApplications,
  ]);

  const stats_cards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees.toLocaleString(),
      description: `+${stats.newEmployeesThisMonth} New This Month`,
      icon: FaUsers,
      color: 'blue',
      progress:
        stats.totalEmployees > 0
          ? Math.min((stats.activeEmployees / stats.totalEmployees) * 100, 100)
          : 0,
    },
    {
      title: 'Attendance Rate',
      value: `${stats.attendanceRate}%`,
      description: `${stats.presentToday} Present Today`,
      icon: FaCalendarCheck,
      color: 'green',
      progress: parseFloat(stats.attendanceRate),
    },
    {
      title: 'Total Payroll',
      value: `₹${(stats.totalNetSalary / 100000).toFixed(1)}L`,
      description: `${stats.paidPayroll} Paid This Month`,
      icon: FaMoneyBillWave,
      color: 'purple',
      progress:
        stats.totalPayroll > 0
          ? Math.min((stats.paidPayroll / stats.totalPayroll) * 100, 100)
          : 0,
    },
    {
      title: 'Active Job Postings',
      value: stats.activeJobPostings.toLocaleString(),
      description: `${stats.candidatesInInterview} In Interview`,
      icon: FaBriefcase,
      color: 'cyan',
      progress:
        stats.activeJobPostings > 0
          ? Math.min(
              (stats.candidatesHired / stats.activeJobPostings) * 10,
              100
            )
          : 0,
    },
  ];

  const lineChartLabels = Array.from({ length: 30 }, (_, i) => {
    const date = dayjs().subtract(29 - i, 'day');
    return date.format('MMM DD');
  });

  const attendanceTrendData = {
    labels: lineChartLabels,
    datasets: [
      {
        label: 'Daily Attendance',
        data: stats.attendanceTrend,
        borderColor: CHART_COLORS.success,
        backgroundColor: CHART_COLORS.success + '20',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const employeeGrowthData = {
    labels: lineChartLabels,
    datasets: [
      {
        label: 'Total Employees',
        data: stats.employeeGrowth,
        borderColor: CHART_COLORS.primary,
        backgroundColor: CHART_COLORS.primary + '20',
        tension: 0.4,
        fill: false,
      },
    ],
  };

  const payrollByMonthData = {
    labels: stats.payrollMonths.map(
      p => `${stats.getMonthName(p.month)} ${p.year}`
    ),
    datasets: [
      {
        label: 'Net Salary (₹)',
        data: stats.payrollMonths.map(p => p.total / 1000),
        backgroundColor: CHART_COLORS.warning,
        borderColor: CHART_COLORS.warning,
        borderWidth: 1,
      },
    ],
  };

  const candidatesByStatusData = {
    labels: Object.keys(stats.candidatesByStatus).map(
      label => label.charAt(0).toUpperCase() + label.slice(1)
    ),
    datasets: [
      {
        data: Object.values(stats.candidatesByStatus),
        backgroundColor: [
          CHART_COLORS.primary,
          CHART_COLORS.success,
          CHART_COLORS.warning,
          CHART_COLORS.danger,
          CHART_COLORS.purple,
          CHART_COLORS.cyan,
        ],
        borderWidth: 0,
      },
    ],
  };

  const leaveApplicationsByStatusData = {
    labels: Object.keys(stats.leaveApplicationsByStatus).map(
      label => label.charAt(0).toUpperCase() + label.slice(1)
    ),
    datasets: [
      {
        data: Object.values(stats.leaveApplicationsByStatus),
        backgroundColor: [
          CHART_COLORS.warning,
          CHART_COLORS.success,
          CHART_COLORS.danger,
          CHART_COLORS.primary,
        ],
        borderWidth: 0,
      },
    ],
  };

  const employeesByDepartmentData = {
    labels: Object.keys(stats.employeesByDepartment).slice(0, 5),
    datasets: [
      {
        label: 'Employees',
        data: Object.values(stats.employeesByDepartment).slice(0, 5),
        backgroundColor: CHART_COLORS.primary,
        borderColor: CHART_COLORS.primary,
        borderWidth: 1,
      },
    ],
  };

  const composedChartData = {
    labels: lineChartLabels,
    datasets: [
      {
        label: 'Attendance',
        data: stats.attendanceTrend,
        type: 'bar' as const,
        backgroundColor: CHART_COLORS.success,
        borderColor: CHART_COLORS.success,
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        label: 'Employees',
        data: stats.employeeGrowth,
        type: 'line' as const,
        borderColor: CHART_COLORS.primary,
        backgroundColor: CHART_COLORS.primary + '20',
        tension: 0.4,
        fill: false,
        yAxisID: 'y1',
      },
    ],
  };

  const hasLineChartData = stats.attendanceTrend.length > 0;
  const hasPieChartData = Object.keys(stats.candidatesByStatus).length > 0;
  const hasBarChartData = stats.payrollMonths.length > 0;
  const hasComposedChartData = stats.attendanceTrend.length > 0;

  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  const lineChartOptions = {
    ...commonChartOptions,
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  const barChartOptions = {
    ...commonChartOptions,
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  const doughnutChartOptions = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          },
        },
      },
    },
  };

  const composedChartOptions = {
    ...commonChartOptions,
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const isLoading =
    employeesLoading ||
    attendanceLoading ||
    candidatesLoading ||
    jobPostingsLoading ||
    payrollLoading ||
    leaveApplicationsLoading;

  const HeaderSkeleton = () => (
    <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <Skeleton variant="text" width={280} height={32} className="!mb-2" />
          <Skeleton variant="text" width={400} height={20} />
        </div>
        <div className="flex gap-3">
          <Skeleton
            variant="rectangular"
            width={140}
            height={28}
            className="!rounded-full"
          />
          <Skeleton
            variant="rectangular"
            width={100}
            height={28}
            className="!rounded-full"
          />
          <Skeleton
            variant="rectangular"
            width={150}
            height={28}
            className="!rounded-full"
          />
        </div>
      </div>
    </div>
  );

  const StatsCardSkeleton = () => (
    <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <Skeleton variant="text" width={120} height={16} />
        <Skeleton
          variant="circular"
          width={32}
          height={32}
          className="!bg-gray-200"
        />
      </div>
      <div className="flex items-end gap-2 mb-4">
        <Skeleton variant="text" width={100} height={32} />
        <Skeleton variant="text" width={140} height={16} />
      </div>
      <Skeleton
        variant="rectangular"
        width="100%"
        height={8}
        className="!rounded-full !bg-gray-200"
      />
    </div>
  );

  const ChartSkeleton = ({ height = 288 }: { height?: number }) => (
    <div className="relative" style={{ height: `${height}px` }}>
      <div className="absolute inset-0 flex flex-col">
        <div className="flex-1 relative">
          <div className="absolute left-0 top-0 bottom-12 flex flex-col justify-between w-12">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton
                key={i}
                variant="text"
                width={40}
                height={12}
                className="!bg-gray-200"
              />
            ))}
          </div>
          <div className="absolute left-12 right-0 top-0 bottom-12 flex items-end justify-between gap-2 px-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
              <Skeleton
                key={i}
                variant="rectangular"
                width="8%"
                style={{
                  height: `${60 + (i % 3) * 15}%`,
                }}
                className="!bg-gray-200 !rounded-t"
              />
            ))}
          </div>
          <div className="absolute left-12 right-0 bottom-0 h-12 flex items-center justify-between px-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
              <Skeleton
                key={i}
                variant="text"
                width={30}
                height={12}
                className="!bg-gray-200"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const DoughnutChartSkeleton = () => (
    <div className="h-72 w-full flex flex-col items-center justify-center">
      <div className="relative mb-6">
        <Skeleton
          variant="circular"
          width={200}
          height={200}
          className="!bg-gray-200"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton
            variant="circular"
            width={100}
            height={100}
            className="!bg-white"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
        {[1, 2].map(i => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton
              variant="rectangular"
              width={12}
              height={12}
              className="!bg-gray-200 !rounded"
            />
            <Skeleton variant="text" width={80} height={14} />
          </div>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <HeaderSkeleton />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
              <ChartSkeleton height={288} />
            </div>
          </div>
          <div className="md:col-span-1">
            <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
              <DoughnutChartSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-blue-600 mb-1">
              HRMS Executive Dashboard
            </h2>
            <p className="text-gray-500 text-sm">
              Track your workforce, attendance, hiring, and payroll performance
            </p>
          </div>
          <div className="flex gap-3">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              {stats.attendanceRate}% Attendance Rate
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {stats.totalEmployees} Employees
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              ₹{(stats.totalNetSalary / 100000).toFixed(1)}L Payroll
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats_cards.map(stat => {
          const colors = getColorClasses(stat.color);

          return (
            <div
              key={stat.title}
              className="bg-white shadow-sm p-6 rounded-lg border border-gray-100"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm text-gray-500 font-medium">
                  {stat.title}
                </span>
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-lg ${colors.icon}`}
                >
                  <stat.icon size={16} />
                </div>
              </div>

              <div className="flex items-end gap-2 mb-4">
                <span className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </span>
                <span className={`text-sm font-medium ${colors.text}`}>
                  {stat.description}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${colors.progress}`}
                  style={{ width: `${Math.min(stat.progress, 100)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Attendance Trend (Last 30 Days)
            </h3>
            {hasLineChartData ? (
              <div className="h-72 w-full">
                <Line data={attendanceTrendData} options={lineChartOptions} />
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-gray-400 mx-auto mb-2 flex justify-center">
                    <FaChartLine size={48} />
                  </div>
                  <span className="text-gray-500">
                    No attendance data available
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Candidates by Status
            </h3>
            {hasPieChartData ? (
              <div className="h-72 w-full flex items-center justify-center">
                <Doughnut
                  data={candidatesByStatusData}
                  options={doughnutChartOptions}
                />
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-gray-400 mx-auto mb-2 flex justify-center">
                    <FaClipboardList size={48} />
                  </div>
                  <span className="text-gray-500">
                    No candidate data available
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Payroll Processing by Month
          </h3>
          {hasBarChartData ? (
            <div className="h-72 w-full">
              <Bar data={payrollByMonthData} options={barChartOptions} />
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-gray-400 mx-auto mb-2 flex justify-center">
                  <FaMoneyBillWave size={48} />
                </div>
                <span className="text-gray-500">No payroll data available</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Leave Applications by Status
          </h3>
          {Object.keys(stats.leaveApplicationsByStatus).length > 0 ? (
            <div className="h-72 w-full flex items-center justify-center">
              <Doughnut
                data={leaveApplicationsByStatusData}
                options={doughnutChartOptions}
              />
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-gray-400 mx-auto mb-2 flex justify-center">
                  <FaCalendarCheck size={48} />
                </div>
                <span className="text-gray-500">No leave data available</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Employee Growth Trend
          </h3>
          {hasLineChartData ? (
            <div className="h-72 w-full">
              <Line data={employeeGrowthData} options={lineChartOptions} />
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-gray-400 mx-auto mb-2 flex justify-center">
                  <FaUsers size={48} />
                </div>
                <span className="text-gray-500">
                  No employee data available
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Employees by Department
          </h3>
          {Object.keys(stats.employeesByDepartment).length > 0 ? (
            <div className="h-72 w-full">
              <Bar data={employeesByDepartmentData} options={barChartOptions} />
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-gray-400 mx-auto mb-2 flex justify-center">
                  <FaBriefcase size={48} />
                </div>
                <span className="text-gray-500">
                  No department data available
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {hasComposedChartData && (
        <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Attendance vs Employee Growth
          </h3>
          <div className="h-80 w-full">
            <Chart
              type="bar"
              data={composedChartData as any}
              options={composedChartOptions}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutiveDashboard;
