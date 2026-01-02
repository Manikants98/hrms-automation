import { Box, Chip, Divider, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useSalarySlipById, type SalarySlip } from 'hooks/useSalarySlips';
import React from 'react';
import CustomDrawer from 'shared/Drawer';

interface ViewSalarySlipProps {
  selectedSalarySlip: SalarySlip | null;
  setSelectedSalarySlip: (slip: SalarySlip | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

const ViewSalarySlip: React.FC<ViewSalarySlipProps> = ({
  selectedSalarySlip,
  setSelectedSalarySlip,
  drawerOpen,
  setDrawerOpen,
}) => {
  const { data: salarySlipResponse } = useSalarySlipById(
    selectedSalarySlip?.id || 0,
    {
      enabled: !!selectedSalarySlip?.id && drawerOpen,
    }
  );

  const salarySlip = salarySlipResponse?.data || selectedSalarySlip;

  const handleCancel = () => {
    setSelectedSalarySlip(null);
    setDrawerOpen(false);
  };

  const getStatusColor = (status: SalarySlip['status']) => {
    switch (status) {
      case 'Processed':
        return 'success';
      case 'Paid':
        return 'info';
      case 'Draft':
        return 'warning';
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

  if (!salarySlip) return null;

  const monthName = getMonthName(salarySlip.payroll_month);

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={`Salary Slip - ${salarySlip.employee?.name || 'N/A'}`}
      size="medium"
    >
      <Box className="!p-5 print-container">
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-container,
            .print-container * {
              visibility: visible;
            }
            .print-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 20px;
            }
            .no-print {
              display: none !important;
            }
            .print-container .MuiBox-root {
              page-break-inside: avoid;
              margin-bottom: 12px !important;
            }
          }
        `}</style>
        <Box className="!mb-6 !p-4 !bg-gray-50 !rounded-lg">
          <Typography
            variant="h6"
            className="!font-bold !mb-4 !text-center !text-gray-900"
          >
            Salary Slip for {monthName} {salarySlip.payroll_year}
          </Typography>

          <Box className="!grid !grid-cols-2 !gap-4 !mb-4">
            <Box>
              <Typography variant="body2" className="!text-gray-600 !mb-1">
                Employee Name
              </Typography>
              <Typography
                variant="body1"
                className="!font-medium !text-gray-900"
              >
                {salarySlip.employee?.name || '-'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" className="!text-gray-600 !mb-1">
                Employee Code
              </Typography>
              <Typography variant="body1" className="!text-gray-900">
                {salarySlip.employee?.employee_id || '-'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" className="!text-gray-600 !mb-1">
                Email
              </Typography>
              <Typography variant="body1" className="!text-gray-900">
                {salarySlip.employee?.email || '-'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" className="!text-gray-600 !mb-1">
                Status
              </Typography>
              <Chip
                label={salarySlip.status}
                color={getStatusColor(salarySlip.status) as any}
                size="small"
              />
            </Box>
            <Box>
              <Typography variant="body2" className="!text-gray-600 !mb-1">
                Processed Date
              </Typography>
              <Typography variant="body1" className="!text-gray-900">
                {dayjs(salarySlip.processed_date).format('DD-MM-YYYY')}
              </Typography>
            </Box>
            {salarySlip.paid_date && (
              <Box>
                <Typography variant="body2" className="!text-gray-600 !mb-1">
                  Paid Date
                </Typography>
                <Typography variant="body1" className="!text-gray-900">
                  {dayjs(salarySlip.paid_date).format('DD-MM-YYYY')}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        <Box className="!mb-6">
          <Typography
            variant="subtitle1"
            className="!font-semibold !mb-3 !text-gray-900"
          >
            Earnings
          </Typography>
          <Box className="!p-4 !bg-green-50 !rounded-lg">
            <Box className="!flex !justify-between !items-center !mb-2">
              <Typography variant="body2" className="!text-gray-700">
                Basic Salary
              </Typography>
              <Typography
                variant="body2"
                className="!font-medium !text-gray-900"
              >
                ₹{salarySlip.basic_salary.toLocaleString()}
              </Typography>
            </Box>
            <Divider className="!my-2" />
            <Box className="!flex !justify-between !items-center">
              <Typography
                variant="body1"
                className="!font-semibold !text-gray-900"
              >
                Total Earnings
              </Typography>
              <Typography
                variant="body1"
                className="!font-semibold !text-green-600"
              >
                ₹{salarySlip.total_earnings.toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box className="!mb-6">
          <Typography
            variant="subtitle1"
            className="!font-semibold !mb-3 !text-gray-900"
          >
            Deductions
          </Typography>
          <Box className="!p-4 !bg-red-50 !rounded-lg">
            {salarySlip.leave_deductions > 0 && (
              <>
                <Box className="!flex !justify-between !items-center !mb-2">
                  <Typography variant="body2" className="!text-gray-700">
                    Regular Deductions
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-medium !text-gray-900"
                  >
                    ₹{salarySlip.total_deductions.toLocaleString()}
                  </Typography>
                </Box>
                <Box className="!flex !justify-between !items-center !mb-2">
                  <Typography variant="body2" className="!text-gray-700">
                    Leave Deductions
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-medium !text-gray-900"
                  >
                    ₹{salarySlip.leave_deductions.toLocaleString()}
                  </Typography>
                </Box>
                <Divider className="!my-2" />
              </>
            )}
            {salarySlip.leave_deductions === 0 && (
              <>
                <Box className="!flex !justify-between !items-center !mb-2">
                  <Typography variant="body2" className="!text-gray-700">
                    Regular Deductions
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-medium !text-gray-900"
                  >
                    ₹{salarySlip.total_deductions.toLocaleString()}
                  </Typography>
                </Box>
                <Divider className="!my-2" />
              </>
            )}
            <Box className="!flex !justify-between !items-center">
              <Typography
                variant="body1"
                className="!font-semibold !text-gray-900"
              >
                Total Deductions
              </Typography>
              <Typography
                variant="body1"
                className="!font-semibold !text-red-600"
              >
                ₹
                {(
                  salarySlip.total_deductions + salarySlip.leave_deductions
                ).toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box className="!mb-6 !p-4 !bg-blue-50 !rounded-lg">
          <Typography
            variant="subtitle1"
            className="!font-semibold !mb-2 !text-gray-900"
          >
            Net Salary
          </Typography>
          <Typography
            variant="h5"
            className="!font-bold !text-blue-600 !text-center"
          >
            ₹{salarySlip.net_salary.toLocaleString()}
          </Typography>
        </Box>
      </Box>
    </CustomDrawer>
  );
};

export default ViewSalarySlip;
