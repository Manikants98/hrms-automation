import { validationResult } from 'express-validator';
import prisma from '../../configs/prisma.client';
import { paginate } from '../../utils/paginate';

const serializePayrollProcessing = (payroll: any) => ({
  id: payroll.id,
  payroll_month: payroll.payroll_month,
  payroll_year: payroll.payroll_year,
  processing_date: payroll.processing_date,
  status: payroll.status,
  total_employees: payroll.total_employees,
  total_earnings: payroll.total_earnings,
  total_deductions: payroll.total_deductions,
  total_leave_deductions: payroll.total_leave_deductions,
  total_net_salary: payroll.total_net_salary,
  processed_by: payroll.processed_by,
  is_active: payroll.is_active,
  createdate: payroll.createdate,
  updatedate: payroll.updatedate,
  processor: payroll.payroll_processing_processor
    ? {
        id: payroll.payroll_processing_processor.id,
        name: payroll.payroll_processing_processor.name,
        email: payroll.payroll_processing_processor.email,
      }
    : null,
  items:
    payroll.salary_slips?.map((slip: any) => ({
      id: slip.id,
      employee_id: slip.employee_id,
      employee_name: slip.salary_slips_employee?.name,
      employee_code: slip.salary_slips_employee?.employee_id,
      employee_email: slip.salary_slips_employee?.email,
      basic_salary: slip.basic_salary,
      total_earnings: slip.total_earnings,
      total_deductions: slip.total_deductions,
      leave_deductions: slip.leave_deductions,
      net_salary: slip.net_salary,
      processed_date: slip.processed_date,
      paid_date: slip.paid_date,
      status: slip.status,
      remarks: slip.remarks,
    })) || [],
});

export const payrollProcessingController = {
  async processPayroll(req: any, res: any): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const { payroll_month, payroll_year, employee_ids, process_all } =
        req.body;

      const existing = await prisma.payroll_processing.findUnique({
        where: {
          payroll_month_payroll_year: {
            payroll_month,
            payroll_year,
          },
        },
      });

      if (existing) {
        res.error('Payroll for this month and year already exists', 400);
        return;
      }

      let employeesToProcess;
      if (process_all) {
        employeesToProcess = await prisma.users.findMany({
          where: { is_active: 'Y' },
          include: {
            salary_structures_employee: {
              where: { status: 'Active', is_active: 'Y' },
              include: {
                salary_structure_items: true,
              },
            },
          },
        });
      } else {
        employeesToProcess = await prisma.users.findMany({
          where: {
            id: { in: employee_ids },
            is_active: 'Y',
          },
          include: {
            salary_structures_employee: {
              where: { status: 'Active', is_active: 'Y' },
              include: {
                salary_structure_items: true,
              },
            },
          },
        });
      }

      const payrollItems: any[] = [];
      let totalEarnings = 0;
      let totalDeductions = 0;
      let totalLeaveDeductions = 0;

      for (const employee of employeesToProcess) {
        const salaryStructure = employee.salary_structures_employee[0];

        if (!salaryStructure) continue;

        const earnings = salaryStructure.salary_structure_items
          .filter((item: any) => item.category === 'Earnings')
          .reduce((sum: number, item: any) => sum + Number(item.value), 0);

        const deductions = salaryStructure.salary_structure_items
          .filter((item: any) => item.category === 'Deductions')
          .reduce((sum: number, item: any) => sum + Number(item.value), 0);

        const basicSalary =
          salaryStructure.salary_structure_items.find(
            (item: any) => item.structure_type === 'Basic Salary'
          )?.value || 0;

        // Calculate leave deductions for unpaid leaves
        const startOfMonth = new Date(payroll_year, parseInt(payroll_month) - 1, 1);
        const endOfMonth = new Date(payroll_year, parseInt(payroll_month), 0);

        const approvedLeaves = await prisma.leave_applications.findMany({
          where: {
            employee_id: employee.id,
            approval_status: 'Approved',
            start_date: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
          include: {
            leave_applications_type: {
              select: {
                is_paid: true,
              },
            },
          },
        });

        const unpaidLeaveDays = approvedLeaves
          .filter((leave: any) => leave.leave_applications_type?.is_paid === false)
          .reduce((total: number, leave: any) => total + leave.total_days, 0);

        const dailySalary = Number(basicSalary) / 30;
        const leaveDeductions = Math.round(unpaidLeaveDays * dailySalary * 100) / 100;

        const netSalary = earnings - deductions - leaveDeductions;

        payrollItems.push({
          employee_id: employee.id,
          payroll_month,
          payroll_year,
          basic_salary: Number(basicSalary),
          total_earnings: earnings,
          total_deductions: deductions,
          leave_deductions: leaveDeductions,
          net_salary: netSalary,
          processed_date: new Date(),
          status: 'Processed',
          createdby: req.user?.id || 1,
        });

        totalEarnings += earnings;
        totalDeductions += deductions;
        totalLeaveDeductions += leaveDeductions;
      }

      const totalNetSalary =
        totalEarnings - totalDeductions - totalLeaveDeductions;

      const payrollProcessing = await prisma.payroll_processing.create({
        data: {
          payroll_month,
          payroll_year,
          processing_date: new Date(),
          status: 'Processed',
          total_employees: payrollItems.length,
          total_earnings: totalEarnings,
          total_deductions: totalDeductions,
          total_leave_deductions: totalLeaveDeductions,
          total_net_salary: totalNetSalary,
          processed_by: req.user?.id || 1,
          createdby: req.user?.id || 1,
          updatedby: req.user?.id || 1,
        },
      });

      await Promise.all(
        payrollItems.map(item =>
          prisma.salary_slips.create({
            data: {
              ...item,
              payroll_processing_id: payrollProcessing.id,
            },
          })
        )
      );

      const fullPayroll = await prisma.payroll_processing.findUnique({
        where: { id: payrollProcessing.id },
        include: {
          payroll_processing_processor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          salary_slips: {
            include: {
              salary_slips_employee: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  employee_id: true,
                },
              },
            },
          },
        },
      });

      res.success(
        'Payroll processed successfully',
        serializePayrollProcessing(fullPayroll),
        201
      );
    } catch (error: any) {
      console.error('Process payroll error:', error);
      res.error(error.message || 'Failed to process payroll', 500);
    }
  },

  async getPayrollProcessing(req: any, res: any): Promise<void> {
    try {
      const {
        page = '1',
        limit = '10',
        payroll_month,
        payroll_year,
        status,
      } = req.query;

      const page_num = parseInt(page as string, 10);
      const limit_num = parseInt(limit as string, 10);

      const filters: any = {};

      if (payroll_month) {
        filters.payroll_month = payroll_month as string;
      }

      if (payroll_year) {
        filters.payroll_year = parseInt(payroll_year as string);
      }

      if (status) {
        filters.status = status as string;
      }

      const { data, pagination } = await paginate({
        model: prisma.payroll_processing,
        filters,
        page: page_num,
        limit: limit_num,
        orderBy: { createdate: 'desc' },
        include: {
          payroll_processing_processor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          salary_slips: {
            include: {
              salary_slips_employee: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  employee_id: true,
                },
              },
            },
          },
        },
      });

      const total = await prisma.payroll_processing.count();
      const processed = await prisma.payroll_processing.count({
        where: { status: 'Processed' },
      });
      const paid = await prisma.payroll_processing.count({
        where: { status: 'Paid' },
      });
      const draft = await prisma.payroll_processing.count({
        where: { status: 'Draft' },
      });

      res.success(
        'Payroll processing records fetched successfully',
        data.map(serializePayrollProcessing),
        200,
        {
          ...pagination,
          stats: {
            total_processed: total,
            total_paid: paid,
            total_draft: draft,
            total_payrolls: total,
          },
        }
      );
    } catch (error: any) {
      console.error('Get payroll processing error:', error);
      res.error(error.message || 'Failed to fetch payroll processing', 500);
    }
  },

  async getPayrollProcessingById(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      const payrollProcessing = await prisma.payroll_processing.findUnique({
        where: { id: parseInt(id) },
        include: {
          payroll_processing_processor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          salary_slips: {
            include: {
              salary_slips_employee: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  employee_id: true,
                },
              },
            },
          },
        },
      });

      if (!payrollProcessing) {
        res.error('Payroll processing record not found', 404);
        return;
      }

      res.success(
        'Payroll processing record fetched successfully',
        serializePayrollProcessing(payrollProcessing)
      );
    } catch (error: any) {
      console.error('Get payroll processing error:', error);
      res.error(error.message || 'Failed to fetch payroll processing', 500);
    }
  },

  async deletePayrollProcessing(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      const payrollProcessing = await prisma.payroll_processing.findUnique({
        where: { id: parseInt(id) },
      });

      if (!payrollProcessing) {
        res.error('Payroll processing record not found', 404);
        return;
      }

      if (payrollProcessing.status === 'Paid') {
        res.error('Cannot delete paid payroll', 400);
        return;
      }

      await prisma.payroll_processing.delete({
        where: { id: parseInt(id) },
      });

      res.success('Payroll processing record deleted successfully', null);
    } catch (error: any) {
      console.error('Delete payroll processing error:', error);
      res.error(error.message || 'Failed to delete payroll processing', 500);
    }
  },
};
