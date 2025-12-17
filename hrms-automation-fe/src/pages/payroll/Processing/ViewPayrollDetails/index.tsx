import { Box, Chip, Typography } from '@mui/material';
import dayjs from 'dayjs';
import {
  usePayrollProcessingById,
  type PayrollProcessing,
  type PayrollProcessingItem,
  type PayrollStatus,
} from 'hooks/usePayrollProcessing';
import React, { useMemo } from 'react';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Table, { type TableColumn } from 'shared/Table';

interface ViewPayrollDetailsProps {
  selectedPayroll: PayrollProcessing | null;
  setSelectedPayroll: (payroll: PayrollProcessing | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

const ViewPayrollDetails: React.FC<ViewPayrollDetailsProps> = ({
  selectedPayroll,
  setSelectedPayroll,
  drawerOpen,
  setDrawerOpen,
}) => {
  const { data: payrollResponse, isLoading } = usePayrollProcessingById(
    selectedPayroll?.id || 0,
    {
      enabled: !!selectedPayroll?.id && drawerOpen,
    }
  );

  const payroll = payrollResponse?.data || selectedPayroll;

  const handleCancel = () => {
    setSelectedPayroll(null);
    setDrawerOpen(false);
  };

  const getStatusColor = (status: PayrollStatus) => {
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

  type PayrollItemWithIndex = PayrollProcessingItem & { index: number };

  const itemColumns: TableColumn<PayrollItemWithIndex>[] = [
    {
      id: 'employee_name',
      label: 'Employee',
      render: (_value: unknown, row: PayrollItemWithIndex) => (
        <Box>
          <Typography variant="body2" className="!font-medium !text-gray-900">
            {row.employee_name}
          </Typography>
          <Typography variant="caption" className="!text-gray-500">
            {row.employee_code || '-'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'basic_salary',
      label: 'Basic Salary',
      render: (_value: unknown, row: PayrollItemWithIndex) => (
        <Typography variant="body2" className="!text-gray-900">
          ₹{row.basic_salary.toLocaleString()}
        </Typography>
      ),
    },
    {
      id: 'total_earnings',
      label: 'Total Earnings',
      render: (_value: unknown, row: PayrollItemWithIndex) => (
        <Typography variant="body2" className="!text-green-600 !font-medium">
          ₹{row.total_earnings.toLocaleString()}
        </Typography>
      ),
    },
    {
      id: 'total_deductions',
      label: 'Total Deductions',
      render: (_value: unknown, row: PayrollItemWithIndex) => (
        <Typography variant="body2" className="!text-red-600 !font-medium">
          ₹{row.total_deductions.toLocaleString()}
        </Typography>
      ),
    },
    {
      id: 'leave_deductions',
      label: 'Leave',
      render: (_value: unknown, row: PayrollItemWithIndex) => (
        <Typography variant="body2" className="!text-orange-600 !font-medium">
          ₹{row.leave_deductions.toLocaleString()}
        </Typography>
      ),
    },
    {
      id: 'net_salary',
      label: 'Net Salary',
      render: (_value: unknown, row: PayrollItemWithIndex) => (
        <Typography variant="body2" className="!text-blue-600 !font-semibold">
          ₹{row.net_salary.toLocaleString()}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (_value: unknown, row: PayrollItemWithIndex) => (
        <Chip
          label={row.status}
          color={getStatusColor(row.status) as any}
          size="small"
        />
      ),
    },
  ];

  const tableData = useMemo<PayrollItemWithIndex[]>(() => {
    if (!payroll?.items) return [];
    return payroll.items.map((item, index) => ({
      ...item,
      index,
    }));
  }, [payroll?.items]);

  if (!payroll) return null;

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={`Payroll Details - ${getMonthName(payroll.payroll_month)} ${payroll.payroll_year}`}
      size="large"
    >
      <Box className="!p-5">
        <Box className="!mb-6 !p-4 !bg-gray-50 !rounded-lg">
          <Typography
            variant="subtitle1"
            className="!font-semibold !mb-3 !text-gray-900"
          >
            Payroll Summary
          </Typography>
          <Box className="!grid !grid-cols-2 md:!grid-cols-4 !gap-4">
            <Box>
              <Typography variant="body2" className="!text-gray-600 !mb-1">
                Total Employees
              </Typography>
              <Typography variant="h6" className="!text-gray-900">
                {payroll.total_employees}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" className="!text-gray-600 !mb-1">
                Total Earnings
              </Typography>
              <Typography variant="h6" className="!text-green-600">
                ₹{payroll.total_earnings.toLocaleString()}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" className="!text-gray-600 !mb-1">
                Total Deductions
              </Typography>
              <Typography variant="h6" className="!text-red-600">
                ₹{payroll.total_deductions.toLocaleString()}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" className="!text-gray-600 !mb-1">
                Net Salary
              </Typography>
              <Typography variant="h6" className="!text-blue-600">
                ₹{payroll.total_net_salary.toLocaleString()}
              </Typography>
            </Box>
          </Box>
          <Box className="!mt-4 !pt-4 !border-t !border-gray-200">
            <Box className="!grid !grid-cols-2 md:!grid-cols-3 !gap-4">
              <Box>
                <Typography variant="body2" className="!text-gray-600 !mb-1">
                  Processing Date
                </Typography>
                <Typography variant="body2" className="!text-gray-900">
                  {dayjs(payroll.processing_date).format('DD-MM-YYYY')}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" className="!text-gray-600 !mb-1">
                  Status
                </Typography>
                <Chip
                  label={payroll.status}
                  color={getStatusColor(payroll.status) as any}
                  size="small"
                />
              </Box>
              <Box>
                <Typography variant="body2" className="!text-gray-600 !mb-1">
                  Processed By
                </Typography>
                <Typography variant="body2" className="!text-gray-900">
                  {payroll.processed_by_name || '-'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box className="!mb-6">
          <Typography
            variant="subtitle1"
            className="!font-semibold !mb-3 !text-gray-900"
          >
            Employee Payroll Items
          </Typography>
          <Table
            data={tableData}
            columns={itemColumns}
            pagination={false}
            sortable={false}
            compact
            loading={isLoading}
            emptyMessage="No payroll items found"
          />
        </Box>

        <Box className="!flex !justify-end gap-1 !mt-6">
          <Button
            type="button"
            variant="outlined"
            onClick={handleCancel}
            className="!mr-3"
          >
            Close
          </Button>
        </Box>
      </Box>
    </CustomDrawer>
  );
};

export default ViewPayrollDetails;
