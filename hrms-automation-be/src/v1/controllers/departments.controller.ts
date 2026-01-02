import { validationResult } from 'express-validator';
import prisma from '../../configs/prisma.client';
import { paginate } from '../../utils/paginate';

const serializeDepartment = (department: any) => ({
  id: department.id,
  name: department.name,
  code: department.code,
  description: department.description,
  parent_id: department.parent_id,
  manager_id: department.manager_id,
  is_active: department.is_active,
  createdate: department.createdate,
  updatedate: department.updatedate,
  manager: department.departments_manager
    ? {
        id: department.departments_manager.id,
        name: department.departments_manager.name,
        email: department.departments_manager.email,
      }
    : null,
  parent_department: department.departments_parent
    ? {
        id: department.departments_parent.id,
        name: department.departments_parent.name,
        code: department.departments_parent.code,
      }
    : null,
});

export const departmentsController = {
  async createDepartment(req: any, res: any): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const { name, code, description, parent_id, manager_id, is_active } =
        req.body;

      const existingCode = await prisma.departments.findUnique({
        where: { code },
      });

      if (existingCode) {
        res.error('Department code already exists', 400);
        return;
      }

      const department = await prisma.departments.create({
        data: {
          name,
          code,
          description,
          parent_id,
          manager_id,
          is_active: is_active || 'Y',
          createdby: req.user?.id || 1,
          updatedby: req.user?.id || 1,
        },
        include: {
          departments_manager: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          departments_parent: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      res.success(
        'Department created successfully',
        serializeDepartment(department),
        201
      );
    } catch (error: any) {
      console.error('Create department error:', error);
      res.error(error.message || 'Failed to create department', 500);
    }
  },

  async getDepartments(req: any, res: any): Promise<void> {
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
        model: prisma.departments,
        filters,
        page: page_num,
        limit: limit_num,
        orderBy: { createdate: 'desc' },
        include: {
          departments_manager: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          departments_parent: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      const total = await prisma.departments.count();
      const active = await prisma.departments.count({
        where: { is_active: 'Y' },
      });
      const inactive = await prisma.departments.count({
        where: { is_active: 'N' },
      });

      res.success(
        'Departments fetched successfully',
        data.map(serializeDepartment),
        200,
        {
          ...pagination,
          stats: {
            total_departments: total,
            active_departments: active,
            inactive_departments: inactive,
          },
        }
      );
    } catch (error: any) {
      console.error('Get departments error:', error);
      res.error(error.message || 'Failed to fetch departments', 500);
    }
  },

  async getDepartmentById(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      const department = await prisma.departments.findUnique({
        where: { id: parseInt(id) },
        include: {
          departments_manager: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          departments_parent: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          departments_children: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      if (!department) {
        res.error('Department not found', 404);
        return;
      }

      res.success(
        'Department fetched successfully',
        serializeDepartment(department)
      );
    } catch (error: any) {
      console.error('Get department error:', error);
      res.error(error.message || 'Failed to fetch department', 500);
    }
  },

  async updateDepartment(req: any, res: any): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const { id } = req.params;
      const { name, code, description, parent_id, manager_id, is_active } =
        req.body;

      const existing = await prisma.departments.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existing) {
        res.error('Department not found', 404);
        return;
      }

      if (code && code !== existing.code) {
        const codeExists = await prisma.departments.findUnique({
          where: { code },
        });
        if (codeExists) {
          res.error('Department code already exists', 400);
          return;
        }
      }

      const department = await prisma.departments.update({
        where: { id: parseInt(id) },
        data: {
          name,
          code,
          description,
          parent_id,
          manager_id,
          is_active,
          updatedby: req.user?.id || 1,
          updatedate: new Date(),
        },
        include: {
          departments_manager: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          departments_parent: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      res.success(
        'Department updated successfully',
        serializeDepartment(department)
      );
    } catch (error: any) {
      console.error('Update department error:', error);
      res.error(error.message || 'Failed to update department', 500);
    }
  },

  async deleteDepartment(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      const department = await prisma.departments.findUnique({
        where: { id: parseInt(id) },
      });

      if (!department) {
        res.error('Department not found', 404);
        return;
      }

      await prisma.departments.delete({
        where: { id: parseInt(id) },
      });

      res.success('Department deleted successfully', null);
    } catch (error: any) {
      console.error('Delete department error:', error);
      res.error(error.message || 'Failed to delete department', 500);
    }
  },

  async getDepartmentsDropdown(req: any, res: any): Promise<void> {
    try {
      const { search = '' } = req.query;

      const filters: any = { is_active: 'Y' };

      if (search) {
        filters.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { code: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const departments = await prisma.departments.findMany({
        where: filters,
        select: {
          id: true,
          name: true,
          code: true,
        },
        orderBy: { name: 'asc' },
        take: 100,
      });

      res.success('Departments dropdown fetched successfully', departments);
    } catch (error: any) {
      console.error('Get departments dropdown error:', error);
      res.error(error.message || 'Failed to fetch departments dropdown', 500);
    }
  },
};
