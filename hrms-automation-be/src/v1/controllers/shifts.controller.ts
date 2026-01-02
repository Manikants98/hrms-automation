import { validationResult } from 'express-validator';
import prisma from '../../configs/prisma.client';
import { paginate } from '../../utils/paginate';

const serializeShift = (shift: any) => ({
  id: shift.id,
  name: shift.name,
  code: shift.code,
  start_time: shift.start_time,
  end_time: shift.end_time,
  break_duration: shift.break_duration,
  description: shift.description,
  is_active: shift.is_active,
  createdate: shift.createdate,
  updatedate: shift.updatedate,
});

export const shiftsController = {
  async createShift(req: any, res: any): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const { name, code, start_time, end_time, break_duration, description, is_active } = req.body;

      const existingCode = await prisma.shifts.findUnique({
        where: { code },
      });

      if (existingCode) {
        res.error('Shift code already exists', 400);
        return;
      }

      const existingName = await prisma.shifts.findUnique({
        where: { name },
      });

      if (existingName) {
        res.error('Shift name already exists', 400);
        return;
      }

      const shift = await prisma.shifts.create({
        data: {
          name,
          code,
          start_time,
          end_time,
          break_duration,
          description,
          is_active: is_active || 'Y',
          createdby: req.user?.id || 1,
          updatedby: req.user?.id || 1,
        },
      });

      res.success('Shift created successfully', serializeShift(shift), 201);
    } catch (error: any) {
      console.error('Create shift error:', error);
      res.error(error.message || 'Failed to create shift', 500);
    }
  },

  async getShifts(req: any, res: any): Promise<void> {
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
        model: prisma.shifts,
        filters,
        page: page_num,
        limit: limit_num,
        orderBy: { createdate: 'desc' },
      });

      const total = await prisma.shifts.count();
      const active = await prisma.shifts.count({ where: { is_active: 'Y' } });
      const inactive = await prisma.shifts.count({ where: { is_active: 'N' } });

      res.success(
        data.map(serializeShift),
        'Shifts fetched successfully',
        200,
        {
          ...pagination,
          stats: {
            total_shifts: total,
            active_shifts: active,
            inactive_shifts: inactive,
          },
        }
      );
    } catch (error: any) {
      console.error('Get shifts error:', error);
      res.error(error.message || 'Failed to fetch shifts', 500);
    }
  },

  async getShiftById(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      const shift = await prisma.shifts.findUnique({
        where: { id: parseInt(id) },
      });

      if (!shift) {
        res.error('Shift not found', 404);
        return;
      }

      res.success('Shift fetched successfully', serializeShift(shift));
    } catch (error: any) {
      console.error('Get shift error:', error);
      res.error(error.message || 'Failed to fetch shift', 500);
    }
  },

  async updateShift(req: any, res: any): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const { id } = req.params;
      const { name, code, start_time, end_time, break_duration, description, is_active } = req.body;

      const existing = await prisma.shifts.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existing) {
        res.error('Shift not found', 404);
        return;
      }

      if (code && code !== existing.code) {
        const codeExists = await prisma.shifts.findUnique({
          where: { code },
        });
        if (codeExists) {
          res.error('Shift code already exists', 400);
          return;
        }
      }

      if (name && name !== existing.name) {
        const nameExists = await prisma.shifts.findUnique({
          where: { name },
        });
        if (nameExists) {
          res.error('Shift name already exists', 400);
          return;
        }
      }

      const shift = await prisma.shifts.update({
        where: { id: parseInt(id) },
        data: {
          name,
          code,
          start_time,
          end_time,
          break_duration,
          description,
          is_active,
          updatedby: req.user?.id || 1,
          updatedate: new Date(),
        },
      });

      res.success('Shift updated successfully', serializeShift(shift));
    } catch (error: any) {
      console.error('Update shift error:', error);
      res.error(error.message || 'Failed to update shift', 500);
    }
  },

  async deleteShift(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      const shift = await prisma.shifts.findUnique({
        where: { id: parseInt(id) },
      });

      if (!shift) {
        res.error('Shift not found', 404);
        return;
      }

      await prisma.shifts.delete({
        where: { id: parseInt(id) },
      });

      res.success('Shift deleted successfully', null);
    } catch (error: any) {
      console.error('Delete shift error:', error);
      res.error(error.message || 'Failed to delete shift', 500);
    }
  },

  async getShiftsDropdown(req: any, res: any): Promise<void> {
    try {
      const { search = '' } = req.query;

      const filters: any = { is_active: 'Y' };

      if (search) {
        filters.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { code: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const shifts = await prisma.shifts.findMany({
        where: filters,
        select: {
          id: true,
          name: true,
          code: true,
          start_time: true,
          end_time: true,
        },
        orderBy: { name: 'asc' },
        take: 100,
      });

      res.success('Shifts dropdown fetched successfully', shifts);
    } catch (error: any) {
      console.error('Get shifts dropdown error:', error);
      res.error(error.message || 'Failed to fetch shifts dropdown', 500);
    }
  },
};
