import { validationResult } from 'express-validator';
import prisma from '../../configs/prisma.client';
import { paginate } from '../../utils/paginate';

const serializeLeaveBalance = (balance: any) => ({
  id: balance.id,
  employee_id: balance.employee_id,
  leave_type_id: balance.leave_type_id,
  total_allocated: balance.total_allocated,
  used: balance.used,
  balance: balance.balance,
  year: balance.year,
  is_active: balance.is_active,
  createdate: balance.createdate,
  updatedate: balance.updatedate,
  employee: balance.leave_balances_employee
    ? {
        id: balance.leave_balances_employee.id,
        name: balance.leave_balances_employee.name,
        email: balance.leave_balances_employee.email,
        employee_id: balance.leave_balances_employee.employee_id,
      }
    : null,
  leave_type: balance.leave_balances_type
    ? {
        id: balance.leave_balances_type.id,
        name: balance.leave_balances_type.name,
        code: balance.leave_balances_type.code,
      }
    : null,
});

export const leaveBalancesController = {
  async createLeaveBalance(req: any, res: any): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const { employee_id, leave_type_id, total_allocated, year, is_active } =
        req.body;

      const existing = await prisma.leave_balances.findFirst({
        where: {
          employee_id,
          leave_type_id,
          year,
        },
      });

      if (existing) {
        res.error(
          'Leave balance for this employee, leave type, and year already exists',
          400
        );
        return;
      }

      const leaveBalance = await prisma.leave_balances.create({
        data: {
          employee_id,
          leave_type_id,
          total_allocated,
          used: 0,
          balance: total_allocated,
          year,
          is_active: is_active || 'Y',
          createdby: req.user?.id || 1,
          updatedby: req.user?.id || 1,
        },
        include: {
          leave_balances_employee: {
            select: {
              id: true,
              name: true,
              email: true,
              employee_id: true,
            },
          },
          leave_balances_type: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      res.success(
        'Leave balance created successfully',
        serializeLeaveBalance(leaveBalance),
        201
      );
    } catch (error: any) {
      console.error('Create leave balance error:', error);
      res.error(error.message || 'Failed to create leave balance', 500);
    }
  },

  async getLeaveBalances(req: any, res: any): Promise<void> {
    try {
      const {
        page = '1',
        limit = '10',
        search = '',
        employee_id,
        leave_type_id,
        year,
      } = req.query;

      const page_num = parseInt(page as string, 10);
      const limit_num = parseInt(limit as string, 10);
      const searchLower = (search as string).toLowerCase();

      const filters: any = {};

      if (employee_id) {
        filters.employee_id = parseInt(employee_id as string);
      }

      if (leave_type_id) {
        filters.leave_type_id = parseInt(leave_type_id as string);
      }

      if (year) {
        filters.year = parseInt(year as string);
      }

      if (search) {
        filters.OR = [
          {
            leave_balances_employee: {
              name: { contains: searchLower, mode: 'insensitive' },
            },
          },
          {
            leave_balances_employee: {
              email: { contains: searchLower, mode: 'insensitive' },
            },
          },
        ];
      }

      const { data, pagination } = await paginate({
        model: prisma.leave_balances,
        filters,
        page: page_num,
        limit: limit_num,
        orderBy: { createdate: 'desc' },
        include: {
          leave_balances_employee: {
            select: {
              id: true,
              name: true,
              email: true,
              employee_id: true,
            },
          },
          leave_balances_type: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      const total = await prisma.leave_balances.count();
      const aggregates = await prisma.leave_balances.aggregate({
        _sum: {
          total_allocated: true,
          used: true,
          balance: true,
        },
      });

      res.success(
        'Leave balances fetched successfully',
        data.map(serializeLeaveBalance),
        200,
        {
          ...pagination,
          stats: {
            total_balances: total,
            total_allocated: aggregates._sum.total_allocated || 0,
            total_used: aggregates._sum.used || 0,
            total_remaining: aggregates._sum.balance || 0,
          },
        }
      );
    } catch (error: any) {
      console.error('Get leave balances error:', error);
      res.error(error.message || 'Failed to fetch leave balances', 500);
    }
  },

  async getLeaveBalanceById(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      const leaveBalance = await prisma.leave_balances.findUnique({
        where: { id: parseInt(id) },
        include: {
          leave_balances_employee: {
            select: {
              id: true,
              name: true,
              email: true,
              employee_id: true,
            },
          },
          leave_balances_type: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      if (!leaveBalance) {
        res.error('Leave balance not found', 404);
        return;
      }

      res.success(
        'Leave balance fetched successfully',
        serializeLeaveBalance(leaveBalance)
      );
    } catch (error: any) {
      console.error('Get leave balance error:', error);
      res.error(error.message || 'Failed to fetch leave balance', 500);
    }
  },

  async updateLeaveBalance(req: any, res: any): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const { id } = req.params;
      const { total_allocated, used, is_active } = req.body;

      const existing = await prisma.leave_balances.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existing) {
        res.error('Leave balance not found', 404);
        return;
      }

      const newUsed = used !== undefined ? used : existing.used;
      const newAllocated =
        total_allocated !== undefined
          ? total_allocated
          : existing.total_allocated;
      const newBalance = newAllocated - newUsed;

      const leaveBalance = await prisma.leave_balances.update({
        where: { id: parseInt(id) },
        data: {
          total_allocated: newAllocated,
          used: newUsed,
          balance: newBalance,
          is_active,
          updatedby: req.user?.id || 1,
          updatedate: new Date(),
        },
        include: {
          leave_balances_employee: {
            select: {
              id: true,
              name: true,
              email: true,
              employee_id: true,
            },
          },
          leave_balances_type: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      res.success(
        'Leave balance updated successfully',
        serializeLeaveBalance(leaveBalance)
      );
    } catch (error: any) {
      console.error('Update leave balance error:', error);
      res.error(error.message || 'Failed to update leave balance', 500);
    }
  },

  async deleteLeaveBalance(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      const leaveBalance = await prisma.leave_balances.findUnique({
        where: { id: parseInt(id) },
      });

      if (!leaveBalance) {
        res.error('Leave balance not found', 404);
        return;
      }

      await prisma.leave_balances.delete({
        where: { id: parseInt(id) },
      });

      res.success('Leave balance deleted successfully', null);
    } catch (error: any) {
      console.error('Delete leave balance error:', error);
      res.error(error.message || 'Failed to delete leave balance', 500);
    }
  },
};
