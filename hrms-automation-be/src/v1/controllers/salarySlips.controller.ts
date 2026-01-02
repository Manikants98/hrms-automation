import prisma from '../../configs/prisma.client';
import { paginate } from '../../utils/paginate';

const serializeSalarySlip = (slip: any) => ({
  id: slip.id,
  payroll_processing_id: slip.payroll_processing_id,
  employee_id: slip.employee_id,
  payroll_month: slip.payroll_month,
  payroll_year: slip.payroll_year,
  basic_salary: slip.basic_salary,
  total_earnings: slip.total_earnings,
  total_deductions: slip.total_deductions,
  leave_deductions: slip.leave_deductions,
  net_salary: slip.net_salary,
  processed_date: slip.processed_date,
  paid_date: slip.paid_date,
  status: slip.status,
  remarks: slip.remarks,
  is_active: slip.is_active,
  createdate: slip.createdate,
  updatedate: slip.updatedate,
  employee: slip.salary_slips_employee
    ? {
        id: slip.salary_slips_employee.id,
        name: slip.salary_slips_employee.name,
        email: slip.salary_slips_employee.email,
        employee_id: slip.salary_slips_employee.employee_id,
      }
    : null,
});

export const salarySlipsController = {
  async getSalarySlips(req: any, res: any): Promise<void> {
    try {
      const {
        page = '1',
        limit = '10',
        search = '',
        employee_id,
        payroll_month,
        payroll_year,
        status,
      } = req.query;

      const page_num = parseInt(page as string, 10);
      const limit_num = parseInt(limit as string, 10);
      const searchLower = (search as string).toLowerCase();

      const filters: any = {};

      if (employee_id) {
        filters.employee_id = parseInt(employee_id as string);
      }

      if (payroll_month) {
        filters.payroll_month = payroll_month as string;
      }

      if (payroll_year) {
        filters.payroll_year = parseInt(payroll_year as string);
      }

      if (status) {
        filters.status = status as string;
      }

      if (search) {
        filters.OR = [
          {
            salary_slips_employee: {
              name: { contains: searchLower, mode: 'insensitive' },
            },
          },
          {
            salary_slips_employee: {
              email: { contains: searchLower, mode: 'insensitive' },
            },
          },
          {
            salary_slips_employee: {
              employee_id: { contains: searchLower, mode: 'insensitive' },
            },
          },
        ];
      }

      const { data, pagination } = await paginate({
        model: prisma.salary_slips,
        filters,
        page: page_num,
        limit: limit_num,
        orderBy: { createdate: 'desc' },
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
      });

      const total = await prisma.salary_slips.count();
      const paid = await prisma.salary_slips.count({
        where: { status: 'Paid' },
      });
      const processed = await prisma.salary_slips.count({
        where: { status: 'Processed' },
      });
      const draft = await prisma.salary_slips.count({
        where: { status: 'Draft' },
      });

      res.success(
        'Salary slips fetched successfully',
        data.map(serializeSalarySlip),
        200,
        {
          ...pagination,
          stats: {
            total_slips: total,
            total_paid: paid,
            total_processed: processed,
            total_draft: draft,
          },
        }
      );
    } catch (error: any) {
      console.error('Get salary slips error:', error);
      res.error(error.message || 'Failed to fetch salary slips', 500);
    }
  },

  async getSalarySlipById(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      const salarySlip = await prisma.salary_slips.findUnique({
        where: { id: parseInt(id) },
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
      });

      if (!salarySlip) {
        res.error('Salary slip not found', 404);
        return;
      }

      res.success(
        'Salary slip fetched successfully',
        serializeSalarySlip(salarySlip)
      );
    } catch (error: any) {
      console.error('Get salary slip error:', error);
      res.error(error.message || 'Failed to fetch salary slip', 500);
    }
  },

  async updateSalarySlip(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;
      const { status, paid_date, remarks } = req.body;

      const existing = await prisma.salary_slips.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existing) {
        res.error('Salary slip not found', 404);
        return;
      }

      const salarySlip = await prisma.salary_slips.update({
        where: { id: parseInt(id) },
        data: {
          status,
          paid_date: paid_date ? new Date(paid_date) : undefined,
          remarks,
          updatedby: req.user?.id || 1,
          updatedate: new Date(),
        },
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
      });

      res.success(
        'Salary slip updated successfully',
        serializeSalarySlip(salarySlip)
      );
    } catch (error: any) {
      console.error('Update salary slip error:', error);
      res.error(error.message || 'Failed to update salary slip', 500);
    }
  },
};
