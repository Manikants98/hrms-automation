import { validationResult } from 'express-validator';
import prisma from '../../configs/prisma.client';
import { paginate } from '../../utils/paginate';

const serializeDesignation = (designation: any) => ({
  id: designation.id,
  name: designation.name,
  code: designation.code,
  description: designation.description,
  department_id: designation.department_id,
  is_active: designation.is_active,
  createdate: designation.createdate,
  updatedate: designation.updatedate,
  department: designation.designations_department
    ? {
        id: designation.designations_department.id,
        name: designation.designations_department.name,
        code: designation.designations_department.code,
      }
    : null,
});

export const designationsController = {
  async createDesignation(req: any, res: any): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const { name, code, description, department_id, is_active } = req.body;

      const existingCode = await prisma.designations.findUnique({
        where: { code },
      });

      if (existingCode) {
        res.error('Designation code already exists', 400);
        return;
      }

      const existingName = await prisma.designations.findUnique({
        where: { name },
      });

      if (existingName) {
        res.error('Designation name already exists', 400);
        return;
      }

      const designation = await prisma.designations.create({
        data: {
          name,
          code,
          description,
          department_id,
          is_active: is_active || 'Y',
          createdby: req.user?.id || 1,
          updatedby: req.user?.id || 1,
        },
        include: {
          designations_department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      res.success('Designation created successfully', serializeDesignation(designation), 201);
    } catch (error: any) {
      console.error('Create designation error:', error);
      res.error(error.message || 'Failed to create designation', 500);
    }
  },

  async getDesignations(req: any, res: any): Promise<void> {
    try {
      const { page = '1', limit = '10', search = '', isActive, department_id } = req.query;

      const page_num = parseInt(page as string, 10);
      const limit_num = parseInt(limit as string, 10);
      const searchLower = (search as string).toLowerCase();

      const filters: any = {};

      if (isActive) {
        filters.is_active = isActive as string;
      }

      if (department_id) {
        filters.department_id = parseInt(department_id as string);
      }

      if (search) {
        filters.OR = [
          { name: { contains: searchLower, mode: 'insensitive' } },
          { code: { contains: searchLower, mode: 'insensitive' } },
        ];
      }

      const { data, pagination } = await paginate({
        model: prisma.designations,
        filters,
        page: page_num,
        limit: limit_num,
        orderBy: { createdate: 'desc' },
        include: {
          designations_department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      const total = await prisma.designations.count();
      const active = await prisma.designations.count({ where: { is_active: 'Y' } });
      const inactive = await prisma.designations.count({ where: { is_active: 'N' } });

      res.success(
        data.map(serializeDesignation),
        'Designations fetched successfully',
        200,
        {
          ...pagination,
          stats: {
            total_designations: total,
            active_designations: active,
            inactive_designations: inactive,
          },
        }
      );
    } catch (error: any) {
      console.error('Get designations error:', error);
      res.error(error.message || 'Failed to fetch designations', 500);
    }
  },

  async getDesignationById(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      const designation = await prisma.designations.findUnique({
        where: { id: parseInt(id) },
        include: {
          designations_department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      if (!designation) {
        res.error('Designation not found', 404);
        return;
      }

      res.success('Designation fetched successfully', serializeDesignation(designation));
    } catch (error: any) {
      console.error('Get designation error:', error);
      res.error(error.message || 'Failed to fetch designation', 500);
    }
  },

  async updateDesignation(req: any, res: any): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const { id } = req.params;
      const { name, code, description, department_id, is_active } = req.body;

      const existing = await prisma.designations.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existing) {
        res.error('Designation not found', 404);
        return;
      }

      if (code && code !== existing.code) {
        const codeExists = await prisma.designations.findUnique({
          where: { code },
        });
        if (codeExists) {
          res.error('Designation code already exists', 400);
          return;
        }
      }

      if (name && name !== existing.name) {
        const nameExists = await prisma.designations.findUnique({
          where: { name },
        });
        if (nameExists) {
          res.error('Designation name already exists', 400);
          return;
        }
      }

      const designation = await prisma.designations.update({
        where: { id: parseInt(id) },
        data: {
          name,
          code,
          description,
          department_id,
          is_active,
          updatedby: req.user?.id || 1,
          updatedate: new Date(),
        },
        include: {
          designations_department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      res.success('Designation updated successfully', serializeDesignation(designation));
    } catch (error: any) {
      console.error('Update designation error:', error);
      res.error(error.message || 'Failed to update designation', 500);
    }
  },

  async deleteDesignation(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      const designation = await prisma.designations.findUnique({
        where: { id: parseInt(id) },
      });

      if (!designation) {
        res.error('Designation not found', 404);
        return;
      }

      await prisma.designations.delete({
        where: { id: parseInt(id) },
      });

      res.success('Designation deleted successfully', null);
    } catch (error: any) {
      console.error('Delete designation error:', error);
      res.error(error.message || 'Failed to delete designation', 500);
    }
  },

  async getDesignationsDropdown(req: any, res: any): Promise<void> {
    try {
      const { search = '', department_id } = req.query;

      const filters: any = { is_active: 'Y' };

      if (department_id) {
        filters.department_id = parseInt(department_id as string);
      }

      if (search) {
        filters.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { code: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const designations = await prisma.designations.findMany({
        where: filters,
        select: {
          id: true,
          name: true,
          code: true,
          department_id: true,
        },
        orderBy: { name: 'asc' },
        take: 100,
      });

      res.success('Designations dropdown fetched successfully', designations);
    } catch (error: any) {
      console.error('Get designations dropdown error:', error);
      res.error(error.message || 'Failed to fetch designations dropdown', 500);
    }
  },
};
