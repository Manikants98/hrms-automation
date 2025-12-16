import { Box, MenuItem, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useEmployees } from 'hooks/useEmployees';
import { useLeaveApplications } from 'hooks/useLeaveApplications';
import {
  calculateLeaveDeduction,
  useProcessPayroll,
} from 'hooks/usePayrollProcessing';
import { useSalaryStructures } from 'hooks/useSalaryStructures';
import React, { useMemo } from 'react';
import { processPayrollValidationSchema } from 'schemas/payrollProcessing.schema';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';

interface ProcessPayrollProps {
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  onSuccess?: () => void;
}

interface PayrollCalculationRow {
  employee_id: number;
  employee_name: string;
  employee_code: string;
  employee_email: string;
  basic_salary: number;
  total_earnings: number;
  total_deductions: number;
  leave_deductions: number;
  net_salary: number;
}

const ProcessPayroll: React.FC<ProcessPayrollProps> = ({
  drawerOpen,
  setDrawerOpen,
  onSuccess,
}) => {
  const processPayrollMutation = useProcessPayroll({
    onSuccess: () => {
      onSuccess?.();
      setDrawerOpen(false);
    },
  });

  const handleCancel = () => {
    setDrawerOpen(false);
  };

  const formik = useFormik({
    initialValues: {
      payroll_month: new Date().toISOString().slice(5, 7),
      payroll_year: new Date().getFullYear(),
    } as { payroll_month: string; payroll_year: number },
    validationSchema: processPayrollValidationSchema,
    onSubmit: async values => {
      try {
        await processPayrollMutation.mutateAsync({
          payroll_month: values.payroll_month,
          payroll_year: values.payroll_year,
          process_all: true,
        });
      } catch (error) {
        console.error('Error processing payroll:', error);
      }
    },
  });

  const { data: employeesResponse } = useEmployees({
    isActive: 'Y',
    limit: 1000,
  });

  const { data: salaryStructuresResponse } = useSalaryStructures({
    limit: 1000,
  });

  const { data: leaveApplicationsResponse } = useLeaveApplications({
    limit: 1000,
  });

  const employees = employeesResponse?.data || [];
  const salaryStructures = salaryStructuresResponse?.data || [];
  const leaveApplications = leaveApplicationsResponse?.data || [];

  const payrollCalculations = useMemo(() => {
    if (!formik.values.payroll_month || !formik.values.payroll_year) {
      return [];
    }

    const month = formik.values.payroll_month;
    const year = formik.values.payroll_year;

    return employees.map(employee => {
      const salaryStructure = salaryStructures.find(
        s => s.employee_id === employee.id && s.status === 'Active'
      );

      if (!salaryStructure) {
        return {
          employee_id: employee.id,
          employee_name: employee.name,
          employee_code: employee.employee_id || '',
          employee_email: employee.email,
          basic_salary: 0,
          total_earnings: 0,
          total_deductions: 0,
          leave_deductions: 0,
          net_salary: 0,
        };
      }

      const earnings = salaryStructure.structure_items
        .filter(item => item.category === 'Earnings')
        .reduce((sum, item) => sum + Number(item.value || 0), 0);

      const deductions = salaryStructure.structure_items
        .filter(item => item.category === 'Deductions')
        .reduce((sum, item) => sum + Number(item.value || 0), 0);

      const basicSalary =
        salaryStructure.structure_items.find(
          item => item.structure_type === 'Basic Salary'
        )?.value || 0;

      const leaveDeductions = calculateLeaveDeduction(
        employee.id,
        salaryStructure,
        leaveApplications,
        month,
        year
      );

      const netSalary = earnings - deductions - leaveDeductions;

      return {
        employee_id: employee.id,
        employee_name: employee.name,
        employee_code: employee.employee_id || '',
        employee_email: employee.email,
        basic_salary: Number(basicSalary),
        total_earnings: earnings,
        total_deductions: deductions,
        leave_deductions: leaveDeductions,
        net_salary: netSalary,
      };
    });
  }, [
    employees,
    salaryStructures,
    leaveApplications,
    formik.values.payroll_month,
    formik.values.payroll_year,
  ]);

  const totalEarnings = useMemo(() => {
    return payrollCalculations.reduce(
      (sum, calc) => sum + calc.total_earnings,
      0
    );
  }, [payrollCalculations]);

  const totalDeductions = useMemo(() => {
    return payrollCalculations.reduce(
      (sum, calc) => sum + calc.total_deductions,
      0
    );
  }, [payrollCalculations]);

  const totalLeaveDeductions = useMemo(() => {
    return payrollCalculations.reduce(
      (sum, calc) => sum + calc.leave_deductions,
      0
    );
  }, [payrollCalculations]);

  const totalNetSalary = useMemo(() => {
    return payrollCalculations.reduce((sum, calc) => sum + calc.net_salary, 0);
  }, [payrollCalculations]);

  const columns: TableColumn<PayrollCalculationRow>[] = [
    {
      id: 'employee_name',
      label: 'Employee',
      render: (_value, row) => (
        <Typography variant="body2" className="!font-medium !text-gray-900">
          {row.employee_name}
        </Typography>
      ),
    },
    {
      id: 'employee_code',
      label: 'Code',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.employee_code || '-'}
        </Typography>
      ),
    },
    {
      id: 'basic_salary',
      label: 'Basic Salary',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          ₹{row.basic_salary.toLocaleString()}
        </Typography>
      ),
    },
    {
      id: 'total_earnings',
      label: 'Total Earnings',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-green-600 !font-medium">
          ₹{row.total_earnings.toLocaleString()}
        </Typography>
      ),
    },
    {
      id: 'total_deductions',
      label: 'Total Deductions',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-red-600 !font-medium">
          ₹{row.total_deductions.toLocaleString()}
        </Typography>
      ),
    },
    {
      id: 'leave_deductions',
      label: 'Leave Deductions',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-orange-600 !font-medium">
          ₹{row.leave_deductions.toLocaleString()}
        </Typography>
      ),
    },
    {
      id: 'net_salary',
      label: 'Net Salary',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-blue-600 !font-semibold">
          ₹{row.net_salary.toLocaleString()}
        </Typography>
      ),
    },
  ];

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title="Process Payroll"
      size="large"
    >
      <Box className="!p-5">
        <form onSubmit={formik.handleSubmit}>
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-x-5 !gap-y-4 !mb-6">
            <Select
              name="payroll_month"
              label="Payroll Month"
              formik={formik}
              required
              fullWidth
            >
              {Array.from({ length: 12 }, (_, i) => {
                const month = String(i + 1).padStart(2, '0');
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
                return (
                  <MenuItem key={month} value={month}>
                    {monthNames[i]}
                  </MenuItem>
                );
              })}
            </Select>

            <Input
              name="payroll_year"
              label="Payroll Year"
              type="number"
              formik={formik}
              required
              slotProps={{
                htmlInput: {
                  min: 2000,
                  max: 2100,
                },
              }}
            />
          </Box>

          <Box className="!mb-6">
            <Table
              data={payrollCalculations}
              columns={columns}
              pagination={false}
              sortable={false}
              compact
              emptyMessage="No employees found or no salary structures configured"
            />
          </Box>

          <Box className="!mb-6 !p-4 !bg-gray-50 !rounded-lg">
            <Typography
              variant="subtitle1"
              className="!font-semibold !mb-3 !text-gray-900"
            >
              Summary
            </Typography>
            <Box className="!grid !grid-cols-2 md:!grid-cols-4 !gap-4">
              <Box>
                <Typography variant="body2" className="!text-gray-600 !mb-1">
                  Total Earnings
                </Typography>
                <Typography variant="h6" className="!text-green-600">
                  ₹{totalEarnings.toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" className="!text-gray-600 !mb-1">
                  Total Deductions
                </Typography>
                <Typography variant="h6" className="!text-red-600">
                  ₹{totalDeductions.toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" className="!text-gray-600 !mb-1">
                  Leave Deductions
                </Typography>
                <Typography variant="h6" className="!text-orange-600">
                  ₹{totalLeaveDeductions.toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" className="!text-gray-600 !mb-1">
                  Total Net Salary
                </Typography>
                <Typography variant="h6" className="!text-blue-600">
                  ₹{totalNetSalary.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box className="!flex !justify-end gap-1 !mt-6">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              className="!mr-3"
              disabled={processPayrollMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={processPayrollMutation.isPending}
            >
              {processPayrollMutation.isPending
                ? 'Processing...'
                : 'Process Payroll'}
            </Button>
          </Box>
        </form>
      </Box>
    </CustomDrawer>
  );
};

export default ProcessPayroll;
