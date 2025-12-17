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
import {
  usePayrollProcessing,
  type PayrollProcessing,
} from 'hooks/usePayrollProcessing';
import { useSalarySlips, type SalarySlip } from 'hooks/useSalarySlips';
import { useSalaryStructures } from 'hooks/useSalaryStructures';
import {
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
import React, { useMemo } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import StatsCard from 'shared/StatsCard';
import Table from 'shared/Table';

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

const PayrollDashboard: React.FC = () => {
  const { data: payrollProcessingResponse, isLoading: payrollLoading } =
    usePayrollProcessing({
      limit: 1000,
    });

  const { data: salarySlipsResponse, isLoading: salarySlipsLoading } =
    useSalarySlips({
      limit: 1000,
    });

  const { data: salaryStructuresResponse, isLoading: structuresLoading } =
    useSalaryStructures({
      limit: 1000,
    });

  const payrollProcessing = payrollProcessingResponse?.data || [];
  const salarySlips = salarySlipsResponse?.data || [];
  const salaryStructures = salaryStructuresResponse?.data || [];

  const getMonthName = (month: string) => {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const monthNum = parseInt(month, 10);
    return monthNames[monthNum - 1] || month;
  };

  const stats = useMemo(() => {
    const totalProcessed = payrollProcessing.length;
    const totalPaid = payrollProcessing.filter(p => p.status === 'Paid').length;
    const totalDraft = payrollProcessing.filter(
      p => p.status === 'Draft'
    ).length;
    const totalCancelled = payrollProcessing.filter(
      p => p.status === 'Cancelled'
    ).length;

    const totalNetSalary = payrollProcessing.reduce(
      (sum, p) => sum + p.total_net_salary,
      0
    );
    const totalEarnings = payrollProcessing.reduce(
      (sum, p) => sum + p.total_earnings,
      0
    );
    const totalDeductions = payrollProcessing.reduce(
      (sum, p) => sum + p.total_deductions,
      0
    );
    const totalLeaveDeductions = payrollProcessing.reduce(
      (sum, p) => sum + p.total_leave_deductions,
      0
    );

    const totalSalarySlips = salarySlips.length;
    const paidSalarySlips = salarySlips.filter(s => s.status === 'Paid').length;
    const processedSalarySlips = salarySlips.filter(
      s => s.status === 'Processed'
    ).length;

    const totalEmployeesWithStructure = salaryStructures.filter(
      s => s.status === 'Active'
    ).length;

    const payrollByStatus = payrollProcessing.reduce(
      (acc, payroll) => {
        acc[payroll.status] = (acc[payroll.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const salarySlipsByStatus = salarySlips.reduce(
      (acc, slip) => {
        acc[slip.status] = (acc[slip.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const payrollByMonth = payrollProcessing.reduce(
      (acc, payroll) => {
        const monthName = getMonthName(payroll.payroll_month);
        const key = `${monthName} ${payroll.payroll_year}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const recentPayrollProcessing = [...payrollProcessing]
      .sort(
        (a, b) =>
          new Date(b.processing_date || '').getTime() -
          new Date(a.processing_date || '').getTime()
      )
      .slice(0, 5);

    const recentSalarySlips = [...salarySlips]
      .sort(
        (a, b) =>
          new Date(b.processed_date || '').getTime() -
          new Date(a.processed_date || '').getTime()
      )
      .slice(0, 5);

    return {
      totalProcessed,
      totalPaid,
      totalDraft,
      totalCancelled,
      totalNetSalary,
      totalEarnings,
      totalDeductions,
      totalLeaveDeductions,
      totalSalarySlips,
      paidSalarySlips,
      processedSalarySlips,
      totalEmployeesWithStructure,
      payrollByStatus,
      salarySlipsByStatus,
      payrollByMonth,
      recentPayrollProcessing,
      recentSalarySlips,
    };
  }, [payrollProcessing, salarySlips, salaryStructures]);

  const isLoading = payrollLoading || salarySlipsLoading || structuresLoading;

  const payrollStatusChartData = useMemo(() => {
    const labels = Object.keys(stats.payrollByStatus);
    const data = Object.values(stats.payrollByStatus);

    return {
      labels,
      datasets: [
        {
          label: 'Payroll by Status',
          data,
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    };
  }, [stats.payrollByStatus]);

  const salarySlipsStatusChartData = useMemo(() => {
    const labels = Object.keys(stats.salarySlipsByStatus);
    const data = Object.values(stats.salarySlipsByStatus);

    return {
      labels,
      datasets: [
        {
          label: 'Salary Slips by Status',
          data,
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    };
  }, [stats.salarySlipsByStatus]);

  const payrollByMonthChartData = useMemo(() => {
    const labels = Object.keys(stats.payrollByMonth);
    const data = Object.values(stats.payrollByMonth);

    return {
      labels,
      datasets: [
        {
          label: 'Payroll Processing by Month',
          data,
          backgroundColor: '#3b82f6',
          borderColor: '#2563eb',
          borderWidth: 1,
        },
      ],
    };
  }, [stats.payrollByMonth]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processed':
        return 'success';
      case 'Paid':
        return 'info';
      case 'Draft':
        return 'warning';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
        <div>
          <h2 className="text-2xl font-semibold text-blue-600 mb-1">
            Payroll Dashboard
          </h2>
          <p className="text-gray-500 text-sm">
            Overview of payroll processing, salary structures, and salary slips
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Processed"
          value={stats.totalProcessed}
          icon={<FileText className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Total Paid"
          value={stats.totalPaid}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Total Draft"
          value={stats.totalDraft}
          icon={<Clock className="w-6 h-6" />}
          color="orange"
          isLoading={isLoading}
        />
        <StatsCard
          title="Total Net Salary"
          value={`₹${stats.totalNetSalary.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Earnings"
          value={`₹${stats.totalEarnings.toLocaleString()}`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Total Deductions"
          value={`₹${stats.totalDeductions.toLocaleString()}`}
          icon={<XCircle className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
        <StatsCard
          title="Leave Deductions"
          value={`₹${stats.totalLeaveDeductions.toLocaleString()}`}
          icon={<Calendar className="w-6 h-6" />}
          color="orange"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Structures"
          value={stats.totalEmployeesWithStructure}
          icon={<Users className="w-6 h-6" />}
          color="cyan"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Payroll by Status
          </h3>
          <div className="h-64">
            <Doughnut
              data={payrollStatusChartData}
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
                        const percentage =
                          total > 0 ? ((value / total) * 100).toFixed(1) : '0';
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
            Salary Slips by Status
          </h3>
          <div className="h-64">
            <Doughnut
              data={salarySlipsStatusChartData}
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
                        const percentage =
                          total > 0 ? ((value / total) * 100).toFixed(1) : '0';
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
          Payroll Processing by Month
        </h3>
        <div className="h-64">
          <Bar
            data={payrollByMonthChartData}
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
                      return `Processed: ${context.parsed.y}`;
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
            Recent Payroll Processing
          </h3>
          <Table
            data={stats.recentPayrollProcessing}
            compact
            columns={[
              {
                id: 'payroll_period',
                label: 'Payroll Period',
                render: (_value, row: PayrollProcessing) => (
                  <Typography
                    variant="body2"
                    className="!font-medium !text-gray-900"
                  >
                    {getMonthName(row.payroll_month)} {row.payroll_year}
                  </Typography>
                ),
              },
              {
                id: 'total_employees',
                label: 'Employees',
                render: (_value, row: PayrollProcessing) => (
                  <Typography variant="body2" className="!text-gray-900">
                    {row.total_employees}
                  </Typography>
                ),
              },
              {
                id: 'total_net_salary',
                label: 'Net Salary',
                render: (_value, row: PayrollProcessing) => (
                  <Typography
                    variant="body2"
                    className="!text-blue-600 !font-semibold"
                  >
                    ₹{row.total_net_salary.toLocaleString()}
                  </Typography>
                ),
              },
              {
                id: 'status',
                label: 'Status',
                render: (_value, row: PayrollProcessing) => (
                  <Chip
                    label={row.status}
                    color={getStatusColor(row.status) as any}
                    size="small"
                  />
                ),
              },
              {
                id: 'processing_date',
                label: 'Date',
                render: (_value, row: PayrollProcessing) => (
                  <Typography variant="body2" className="!text-gray-900">
                    {dayjs(row.processing_date).format('DD-MM-YYYY')}
                  </Typography>
                ),
              },
            ]}
            getRowId={(row: PayrollProcessing) => row.id}
            pagination={false}
            sortable={false}
            emptyMessage="No recent payroll processing records"
          />
        </div>

        <div className="bg-white shadow-sm p-4 rounded-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Recent Salary Slips
          </h3>
          <Table
            compact
            data={stats.recentSalarySlips}
            columns={[
              {
                id: 'employee_name',
                label: 'Employee',
                render: (_value, row: SalarySlip) => (
                  <Typography
                    variant="body2"
                    className="!font-medium !text-gray-900"
                  >
                    {row.employee_name}
                  </Typography>
                ),
              },
              {
                id: 'payroll_period',
                label: 'Period',
                render: (_value, row: SalarySlip) => (
                  <Typography variant="body2" className="!text-gray-900">
                    {getMonthName(row.payroll_month)} {row.payroll_year}
                  </Typography>
                ),
              },
              {
                id: 'net_salary',
                label: 'Net Salary',
                render: (_value, row: SalarySlip) => (
                  <Typography
                    variant="body2"
                    className="!text-blue-600 !font-semibold"
                  >
                    ₹{row.net_salary.toLocaleString()}
                  </Typography>
                ),
              },
              {
                id: 'status',
                label: 'Status',
                render: (_value, row: SalarySlip) => (
                  <Chip
                    label={row.status}
                    color={getStatusColor(row.status) as any}
                    size="small"
                  />
                ),
              },
            ]}
            getRowId={(row: SalarySlip) => row.id}
            pagination={false}
            sortable={false}
            emptyMessage="No recent salary slips"
          />
        </div>
      </div>
    </div>
  );
};

export default PayrollDashboard;
