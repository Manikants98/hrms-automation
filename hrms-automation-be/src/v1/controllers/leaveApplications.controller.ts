import { validationResult } from 'express-validator';
import prisma from '../../configs/prisma.client';
import { paginate } from '../../utils/paginate';

const serializeLeaveApplication = (app: any) => ({
  id: app.id,
  employee_id: app.employee_id,
  employee_name: app.leave_applications_employee?.name || null,
  employee_email: app.leave_applications_employee?.email || null,
  employee_department: app.leave_applications_employee?.employees_department?.name || null,
  leave_type_id: app.leave_type_id,
  leave_type_name: app.leave_applications_type?.name || null,
  leave_type_code: app.leave_applications_type?.code || null,
  start_date: app.start_date,
  end_date: app.end_date,
  total_days: app.total_days,
  reason: app.reason,
  approval_status: app.approval_status,
  approved_by: app.approved_by,
  approved_by_name: app.leave_applications_approver?.name || null,
  approved_date: app.approved_date,
  rejection_reason: app.rejection_reason,
  is_active: app.is_active,
  createdate: app.createdate,
  updatedate: app.updatedate,
  employee: app.leave_applications_employee
    ? {
        id: app.leave_applications_employee.id,
        name: app.leave_applications_employee.name,
        email: app.leave_applications_employee.email,
        employee_id: app.leave_applications_employee.employee_id,
      }
    : null,
  leave_type: app.leave_applications_type
    ? {
        id: app.leave_applications_type.id,
        name: app.leave_applications_type.name,
        code: app.leave_applications_type.code,
      }
    : null,
  approver: app.leave_applications_approver
    ? {
        id: app.leave_applications_approver.id,
        name: app.leave_applications_approver.name,
        email: app.leave_applications_approver.email,
      }
    : null,
});

export const leaveApplicationsController = {
  async createLeaveApplication(req: any, res: any): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const { employee_id, leave_type_id, start_date, end_date, reason } = req.body;

      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      const total_days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // Check for overlapping leave applications
      const overlapping = await prisma.leave_applications.findFirst({
        where: {
          employee_id,
          approval_status: { in: ['Pending', 'Approved'] },
          OR: [
            {
              start_date: { lte: endDate },
              end_date: { gte: startDate },
            },
          ],
        },
      });

      if (overlapping) {
        res.error('Leave dates overlap with an existing leave application', 400);
        return;
      }

      // Check leave balance
      const leaveBalance = await prisma.leave_balances.findFirst({
        where: {
          employee_id,
          leave_type_id,
          year: new Date().getFullYear(),
        },
      });

      if (!leaveBalance) {
        res.error('No leave balance found for this leave type', 404);
        return;
      }

      if (leaveBalance.balance < total_days) {
        res.error(`Insufficient leave balance. Available: ${leaveBalance.balance} days, Requested: ${total_days} days`, 400);
        return;
      }

      const leaveApplication = await prisma.leave_applications.create({
        data: {
          employee_id,
          leave_type_id,
          start_date: startDate,
          end_date: endDate,
          total_days,
          reason,
          approval_status: 'Pending',
          createdby: req.user?.id || 1,
          updatedby: req.user?.id || 1,
        },
        include: {
          leave_applications_employee: {
            select: {
              id: true,
              name: true,
              email: true,
              employee_id: true,
            },
          },
          leave_applications_type: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      res.success('Leave application created successfully', serializeLeaveApplication(leaveApplication), 201);
    } catch (error: any) {
      console.error('Create leave application error:', error);
      res.error(error.message || 'Failed to create leave application', 500);
    }
  },

  async getLeaveApplications(req: any, res: any): Promise<void> {
    try {
      const { page = '1', limit = '10', search = '', approval_status, leave_type_id, employee_id } = req.query;

      const page_num = parseInt(page as string, 10);
      const limit_num = parseInt(limit as string, 10);
      const searchLower = (search as string).toLowerCase();

      const filters: any = {};

      if (approval_status) {
        filters.approval_status = approval_status as string;
      }

      if (leave_type_id) {
        filters.leave_type_id = parseInt(leave_type_id as string);
      }

      if (employee_id) {
        filters.employee_id = parseInt(employee_id as string);
      }

      if (search) {
        filters.OR = [
          { reason: { contains: searchLower, mode: 'insensitive' } },
          {
            leave_applications_employee: {
              name: { contains: searchLower, mode: 'insensitive' },
            },
          },
        ];
      }

      const { data, pagination } = await paginate({
        model: prisma.leave_applications,
        filters,
        page: page_num,
        limit: limit_num,
        orderBy: { createdate: 'desc' },
        include: {
          leave_applications_employee: {
            select: {
              id: true,
              name: true,
              email: true,
              employee_id: true,
              employees_department: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          leave_applications_type: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          leave_applications_approver: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      const total = await prisma.leave_applications.count();
      const pending = await prisma.leave_applications.count({ where: { approval_status: 'Pending' } });
      const approved = await prisma.leave_applications.count({ where: { approval_status: 'Approved' } });
      const rejected = await prisma.leave_applications.count({ where: { approval_status: 'Rejected' } });

      res.success(
        'Leave applications fetched successfully',
        data.map(serializeLeaveApplication),
        200,
        {
          ...pagination,
          stats: {
            total_applications: total,
            pending_applications: pending,
            approved_applications: approved,
            rejected_applications: rejected,
          },
        }
      );
    } catch (error: any) {
      console.error('Get leave applications error:', error);
      res.error(error.message || 'Failed to fetch leave applications', 500);
    }
  },

  async getLeaveApplicationById(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      const leaveApplication = await prisma.leave_applications.findUnique({
        where: { id: parseInt(id) },
        include: {
          leave_applications_employee: {
            select: {
              id: true,
              name: true,
              email: true,
              employee_id: true,
            },
          },
          leave_applications_type: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          leave_applications_approver: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!leaveApplication) {
        res.error('Leave application not found', 404);
        return;
      }

      res.success('Leave application fetched successfully', serializeLeaveApplication(leaveApplication));
    } catch (error: any) {
      console.error('Get leave application error:', error);
      res.error(error.message || 'Failed to fetch leave application', 500);
    }
  },

  async updateLeaveApplication(req: any, res: any): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const { id } = req.params;
      const { employee_id, leave_type_id, start_date, end_date, reason } = req.body;

      const existing = await prisma.leave_applications.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existing) {
        res.error('Leave application not found', 404);
        return;
      }

      if (existing.approval_status !== 'Pending') {
        res.error('Cannot update approved or rejected leave applications', 400);
        return;
      }

      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      const total_days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // Check for overlapping leave applications
      const overlapping = await prisma.leave_applications.findFirst({
        where: {
          employee_id,
          id: { not: parseInt(id) },
          approval_status: { in: ['Pending', 'Approved'] },
          OR: [
            {
              start_date: { lte: endDate },
              end_date: { gte: startDate },
            },
          ],
        },
      });

      if (overlapping) {
        res.error('Leave dates overlap with an existing leave application', 400);
        return;
      }

      // Check leave balance for updated dates
      const leaveBalance = await prisma.leave_balances.findFirst({
        where: {
          employee_id,
          leave_type_id,
          year: new Date().getFullYear(),
        },
      });

      if (!leaveBalance) {
        res.error('No leave balance found for this leave type', 404);
        return;
      }

      if (leaveBalance.balance < total_days) {
        res.error(`Insufficient leave balance. Available: ${leaveBalance.balance} days, Requested: ${total_days} days`, 400);
        return;
      }

      const leaveApplication = await prisma.leave_applications.update({
        where: { id: parseInt(id) },
        data: {
          employee_id,
          leave_type_id,
          start_date: startDate,
          end_date: endDate,
          total_days,
          reason,
          updatedby: req.user?.id || 1,
          updatedate: new Date(),
        },
        include: {
          leave_applications_employee: {
            select: {
              id: true,
              name: true,
              email: true,
              employee_id: true,
            },
          },
          leave_applications_type: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      res.success('Leave application updated successfully', serializeLeaveApplication(leaveApplication));
    } catch (error: any) {
      console.error('Update leave application error:', error);
      res.error(error.message || 'Failed to update leave application', 500);
    }
  },

  async deleteLeaveApplication(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      const leaveApplication = await prisma.leave_applications.findUnique({
        where: { id: parseInt(id) },
      });

      if (!leaveApplication) {
        res.error('Leave application not found', 404);
        return;
      }

      if (leaveApplication.approval_status === 'Approved') {
        res.error('Cannot delete approved leave applications', 400);
        return;
      }

      await prisma.leave_applications.delete({
        where: { id: parseInt(id) },
      });

      res.success('Leave application deleted successfully', null);
    } catch (error: any) {
      console.error('Delete leave application error:', error);
      res.error(error.message || 'Failed to delete leave application', 500);
    }
  },

  async approveLeaveApplication(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      const existing = await prisma.leave_applications.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existing) {
        res.error('Leave application not found', 404);
        return;
      }

      if (existing.approval_status !== 'Pending') {
        res.error('Leave application is already processed', 400);
        return;
      }

      const leaveApplication = await prisma.leave_applications.update({
        where: { id: parseInt(id) },
        data: {
          approval_status: 'Approved',
          approved_by: req.user?.id || 1,
          approved_date: new Date(),
          updatedby: req.user?.id || 1,
          updatedate: new Date(),
        },
        include: {
          leave_applications_employee: {
            select: {
              id: true,
              name: true,
              email: true,
              employee_id: true,
            },
          },
          leave_applications_type: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          leave_applications_approver: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Update leave balance
      const updateResult = await prisma.leave_balances.updateMany({
        where: {
          employee_id: existing.employee_id,
          leave_type_id: existing.leave_type_id,
          year: new Date(existing.start_date).getFullYear(),
        },
        data: {
          used: {
            increment: existing.total_days,
          },
          balance: {
            decrement: existing.total_days,
          },
          updatedby: req.user?.id || 1,
          updatedate: new Date(),
        },
      });

      if (updateResult.count === 0) {
        // Rollback approval if balance update failed
        await prisma.leave_applications.update({
          where: { id: parseInt(id) },
          data: {
            approval_status: 'Pending',
            approved_by: null,
            approved_date: null,
          },
        });
        res.error('Failed to update leave balance. Leave application not approved.', 500);
        return;
      }

      res.success('Leave application approved successfully', serializeLeaveApplication(leaveApplication));
    } catch (error: any) {
      console.error('Approve leave application error:', error);
      res.error(error.message || 'Failed to approve leave application', 500);
    }
  },

  async rejectLeaveApplication(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;
      const { rejection_reason } = req.body;

      const existing = await prisma.leave_applications.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existing) {
        res.error('Leave application not found', 404);
        return;
      }

      if (existing.approval_status !== 'Pending') {
        res.error('Leave application is already processed', 400);
        return;
      }

      const leaveApplication = await prisma.leave_applications.update({
        where: { id: parseInt(id) },
        data: {
          approval_status: 'Rejected',
          approved_by: req.user?.id || 1,
          approved_date: new Date(),
          rejection_reason,
          updatedby: req.user?.id || 1,
          updatedate: new Date(),
        },
        include: {
          leave_applications_employee: {
            select: {
              id: true,
              name: true,
              email: true,
              employee_id: true,
            },
          },
          leave_applications_type: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          leave_applications_approver: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      res.success('Leave application rejected successfully', serializeLeaveApplication(leaveApplication));
    } catch (error: any) {
      console.error('Reject leave application error:', error);
      res.error(error.message || 'Failed to reject leave application', 500);
    }
  },
};
