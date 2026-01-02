import { validationResult } from 'express-validator';
import prisma from '../../configs/prisma.client';
import { paginate } from '../../utils/paginate';

const serializeHiringStage = (stage: any) => ({
  id: stage.id,
  name: stage.name,
  code: stage.code,
  description: stage.description,
  sequence_order: stage.sequence_order,
  is_active: stage.is_active,
  createdate: stage.createdate,
  updatedate: stage.updatedate,
});

export const hiringStagesController = {
  async createHiringStage(req: any, res: any): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const { name, code, description, sequence_order, is_active } = req.body;

      const existingCode = await prisma.hiring_stages.findUnique({
        where: { code },
      });

      if (existingCode) {
        res.error('Hiring stage code already exists', 400);
        return;
      }

      const existingName = await prisma.hiring_stages.findUnique({
        where: { name },
      });

      if (existingName) {
        res.error('Hiring stage name already exists', 400);
        return;
      }

      const hiringStage = await prisma.hiring_stages.create({
        data: {
          name,
          code,
          description,
          sequence_order,
          is_active: is_active || 'Y',
          createdby: req.user?.id || 1,
          updatedby: req.user?.id || 1,
        },
      });

      res.success(
        'Hiring stage created successfully',
        serializeHiringStage(hiringStage),
        201
      );
    } catch (error: any) {
      console.error('Create hiring stage error:', error);
      res.error(error.message || 'Failed to create hiring stage', 500);
    }
  },

  async getHiringStages(req: any, res: any): Promise<void> {
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
        model: prisma.hiring_stages,
        filters,
        page: page_num,
        limit: limit_num,
        orderBy: { sequence_order: 'asc' },
      });

      const total = await prisma.hiring_stages.count();
      const active = await prisma.hiring_stages.count({
        where: { is_active: 'Y' },
      });
      const inactive = await prisma.hiring_stages.count({
        where: { is_active: 'N' },
      });

      res.success(
        data.map(serializeHiringStage),
        'Hiring stages fetched successfully',
        200,
        {
          ...pagination,
          stats: {
            total_hiring_stages: total,
            active_hiring_stages: active,
            inactive_hiring_stages: inactive,
          },
        }
      );
    } catch (error: any) {
      console.error('Get hiring stages error:', error);
      res.error(error.message || 'Failed to fetch hiring stages', 500);
    }
  },

  async getHiringStageById(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      const hiringStage = await prisma.hiring_stages.findUnique({
        where: { id: parseInt(id) },
      });

      if (!hiringStage) {
        res.error('Hiring stage not found', 404);
        return;
      }

      res.success(
        'Hiring stage fetched successfully',
        serializeHiringStage(hiringStage)
      );
    } catch (error: any) {
      console.error('Get hiring stage error:', error);
      res.error(error.message || 'Failed to fetch hiring stage', 500);
    }
  },

  async updateHiringStage(req: any, res: any): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const { id } = req.params;
      const { name, code, description, sequence_order, is_active } = req.body;

      const existing = await prisma.hiring_stages.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existing) {
        res.error('Hiring stage not found', 404);
        return;
      }

      if (code && code !== existing.code) {
        const codeExists = await prisma.hiring_stages.findUnique({
          where: { code },
        });
        if (codeExists) {
          res.error('Hiring stage code already exists', 400);
          return;
        }
      }

      if (name && name !== existing.name) {
        const nameExists = await prisma.hiring_stages.findUnique({
          where: { name },
        });
        if (nameExists) {
          res.error('Hiring stage name already exists', 400);
          return;
        }
      }

      const hiringStage = await prisma.hiring_stages.update({
        where: { id: parseInt(id) },
        data: {
          name,
          code,
          description,
          sequence_order,
          is_active,
          updatedby: req.user?.id || 1,
          updatedate: new Date(),
        },
      });

      res.success(
        'Hiring stage updated successfully',
        serializeHiringStage(hiringStage)
      );
    } catch (error: any) {
      console.error('Update hiring stage error:', error);
      res.error(error.message || 'Failed to update hiring stage', 500);
    }
  },

  async deleteHiringStage(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      const hiringStage = await prisma.hiring_stages.findUnique({
        where: { id: parseInt(id) },
      });

      if (!hiringStage) {
        res.error('Hiring stage not found', 404);
        return;
      }

      await prisma.hiring_stages.delete({
        where: { id: parseInt(id) },
      });

      res.success('Hiring stage deleted successfully', null);
    } catch (error: any) {
      console.error('Delete hiring stage error:', error);
      res.error(error.message || 'Failed to delete hiring stage', 500);
    }
  },

  async getHiringStagesDropdown(req: any, res: any): Promise<void> {
    try {
      const { search = '' } = req.query;

      const filters: any = { is_active: 'Y' };

      if (search) {
        filters.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { code: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const hiringStages = await prisma.hiring_stages.findMany({
        where: filters,
        select: {
          id: true,
          name: true,
          code: true,
          sequence_order: true,
        },
        orderBy: { sequence_order: 'asc' },
        take: 100,
      });

      res.success('Hiring stages dropdown fetched successfully', hiringStages);
    } catch (error: any) {
      console.error('Get hiring stages dropdown error:', error);
      res.error(error.message || 'Failed to fetch hiring stages dropdown', 500);
    }
  },
};
