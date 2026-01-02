import { validationResult } from 'express-validator';
import prisma from '../../configs/prisma.client';
import { paginate } from '../../utils/paginate';

const serializeLeaveType = (leaveType: any) => ({
  id: leaveType.id,
  name: leaveType.name,
  code: leaveType.code,
  max_days_per_year: leaveType.max_days_per_year,
  is_paid: leaveType.is_paid,
  requires_approval: leaveType.requires_approval,
  description: leaveType.description,
  is_active: leaveType.is_active,
  createdate: leaveType.createdate,
  updatedate: leaveType.updatedate,
});

export const leaveTypesController = {
  async createLeaveType(req: any, res: any): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const { name, code, max_days_per_year, is_paid, requires_approval, description, is_active } = req.body;

      const existingCode = await prisma.leave_types.findUnique({
        where: { code },
      });

      if (existingCode) {
        res.error('Leave type code already exists', 400);
        return;
      }

      const existingName = await prisma.leave_types.findUnique({
        where: { name },
      });

      if (existingName) {
        res.error('Leave type name already exists', 400);
        return;
      }

      const leaveType = await prisma.leave_types.create({
        data: {
          name,
          code,
          max_days_per_year,
          is_paid: is_paid || 'Y',
          requires_approval: requires_approval || 'Y',
          description,
          is_active: is_active || 'Y',
          createdby: req.user?.id || 1,
          updatedby: req.user?.id || 1,
        },
      });

      res.success('Leave type created successfully', serializeLeaveType(leaveType), 201);
    } catch (error: any) {
      console.error('Create leave type error:', error);
      res.error(error.message || 'Failed to create leave type', 500);
    }
  },

  async getLeaveTypes(req: any, res: any): Promise<void> {
    try {
      const { page = '1', limit = '10', search = '', isActive } = req.query;

      const page_num = parseInt(page as string, 10);
      const limit_num = parseInt(limit as string, 10);
      const searchLower = (search as string).toLowerCase();

      const filters: any = {};

      if (isActive) {
        filters.is_active = isActive as string;
      }

      if (search) {
        filters.OR = [
          { name: { contains: searchLower, mode: 'insensitive' } },
          { code: { contains: searchLower, mode: 'insensitive' } },
        ];
      }

      const { data, pagination } = await paginate({
        model: prisma.leave_types,
        filters,
        page: page_num,
        limit: limit_num,
        orderBy: { createdate: 'desc' },
      });

      const total = await prisma.leave_types.count();
      const active = await prisma.leave_types.count({ where: { is_active: 'Y' } });
      const inactive = await prisma.leave_types.count({ where: { is_active: 'N' } });

      res.success(
        data.map(serializeLeaveType),
        'Leave types fetched successfully',
        200,
        {
          ...pagination,
          stats: {
            total_leave_types: total,
            active_leave_types: active,
            inactive_leave_types: inactive,
          },
        }
      );
    } catch (error: any) {
      console.error('Get leave types error:', error);
      res.error(error.message || 'Failed to fetch leave types', 500);
    }
  },

  async getLeaveTypeById(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      const leaveType = await prisma.leave_types.findUnique({
        where: { id: parseInt(id) },
      });

      if (!leaveType) {
        res.error('Leave type not found', 404);
        return;
      }

      res.success('Leave type fetched successfully', serializeLeaveType(leaveType));
    } catch (error: any) {
      console.error('Get leave type error:', error);
      res.error(error.message || 'Failed to fetch leave type', 500);
    }
  },

  async updateLeaveType(req: any, res: any): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const { id } = req.params;
      const { name, code, max_days_per_year, is_paid, requires_approval, description, is_active } = req.body;

      const existing = await prisma.leave_types.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existing) {
        res.error('Leave type not found', 404);
        return;
      }

      if (code && code !== existing.code) {
        const codeExists = await prisma.leave_types.findUnique({
          where: { code },
        });
        if (codeExists) {
          res.error('Leave type code already exists', 400);
          return;
        }
      }

      if (name && name !== existing.name) {
        const nameExists = await prisma.leave_types.findUnique({
          where: { name },
        });
        if (nameExists) {
          res.error('Leave type name already exists', 400);
          return;
        }
      }

      const leaveType = await prisma.leave_types.update({
        where: { id: parseInt(id) },
        data: {
          name,
          code,
          max_days_per_year,
          is_paid,
          requires_approval,
          description,
          is_active,
          updatedby: req.user?.id || 1,
          updatedate: new Date(),
        },
      });

      res.success('Leave type updated successfully', serializeLeaveType(leaveType));
    } catch (error: any) {
      console.error('Update leave type error:', error);
      res.error(error.message || 'Failed to update leave type', 500);
    }
  },

  async deleteLeaveType(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      const leaveType = await prisma.leave_types.findUnique({
        where: { id: parseInt(id) },
      });

      if (!leaveType) {
        res.error('Leave type not found', 404);
        return;
      }

      await prisma.leave_types.delete({
        where: { id: parseInt(id) },
      });

      res.success('Leave type deleted successfully', null);
    } catch (error: any) {
      console.error('Delete leave type error:', error);
      res.error(error.message || 'Failed to delete leave type', 500);
    }
  },

  async getLeaveTypesDropdown(req: any, res: any): Promise<void> {
    try {
      const { search = '' } = req.query;

      const filters: any = { is_active: 'Y' };

      if (search) {
        filters.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { code: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const leaveTypes = await prisma.leave_types.findMany({
        where: filters,
        select: {
          id: true,
          name: true,
          code: true,
          max_days_per_year: true,
          is_paid: true,
        },
        orderBy: { name: 'asc' },
        take: 100,
      });

      res.success('Leave types dropdown fetched successfully', leaveTypes);
    } catch (error: any) {
      console.error('Get leave types dropdown error:', error);
      res.error(error.message || 'Failed to fetch leave types dropdown', 500);
    }
  },
};
