import { validationResult } from 'express-validator';
import prisma from '../../configs/prisma.client';
import { paginate } from '../../utils/paginate';

const serializeSalaryStructure = (structure: any) => ({
  id: structure.id,
  employee_id: structure.employee_id,
  start_date: structure.start_date,
  end_date: structure.end_date,
  status: structure.status,
  is_active: structure.is_active,
  createdate: structure.createdate,
  updatedate: structure.updatedate,
  employee: structure.salary_structures_employee
    ? {
        id: structure.salary_structures_employee.id,
        name: structure.salary_structures_employee.name,
        email: structure.salary_structures_employee.email,
        employee_id: structure.salary_structures_employee.employee_id,
      }
    : null,
  structure_items: structure.salary_structure_items?.map((item: any) => ({
    id: item.id,
    structure_type: item.structure_type,
    value: item.value,
    category: item.category,
    is_default: item.is_default,
  })) || [],
});

export const salaryStructuresController = {
  async createSalaryStructure(req: any, res: any): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const { employee_id, start_date, end_date, status, structure_items, is_active } = req.body;

      const salaryStructure = await prisma.salary_structures.create({
        data: {
          employee_id,
          start_date: new Date(start_date),
          end_date: new Date(end_date),
          status: status || 'Active',
          is_active: is_active || 'Y',
          createdby: req.user?.id || 1,
          updatedby: req.user?.id || 1,
        },
      });

      if (structure_items && Array.isArray(structure_items)) {
        await Promise.all(
          structure_items.map((item: any) =>
            prisma.salary_structure_items.create({
              data: {
                salary_structure_id: salaryStructure.id,
                structure_type: item.structure_type,
                value: item.value,
                category: item.category,
                is_default: item.is_default || false,
                createdby: req.user?.id || 1,
              },
            })
          )
        );
      }

      const fullStructure = await prisma.salary_structures.findUnique({
        where: { id: salaryStructure.id },
        include: {
          salary_structures_employee: {
            select: {
              id: true,
              name: true,
              email: true,
              employee_id: true,
            },
          },
          salary_structure_items: true,
        },
      });

      res.success('Salary structure created successfully', serializeSalaryStructure(fullStructure), 201);
    } catch (error: any) {
      console.error('Create salary structure error:', error);
      res.error(error.message || 'Failed to create salary structure', 500);
    }
  },

  async getSalaryStructures(req: any, res: any): Promise<void> {
    try {
      const { page = '1', limit = '10', search = '', employee_id, status } = req.query;

      const page_num = parseInt(page as string, 10);
      const limit_num = parseInt(limit as string, 10);
      const searchLower = (search as string).toLowerCase();

      const filters: any = {};

      if (employee_id) {
        filters.employee_id = parseInt(employee_id as string);
      }

      if (status) {
        filters.status = status as string;
      }

      if (search) {
        filters.OR = [
          {
            salary_structures_employee: {
              name: { contains: searchLower, mode: 'insensitive' },
            },
          },
          {
            salary_structures_employee: {
              email: { contains: searchLower, mode: 'insensitive' },
            },
          },
        ];
      }

      const { data, pagination } = await paginate({
        model: prisma.salary_structures,
        filters,
        page: page_num,
        limit: limit_num,
        orderBy: { createdate: 'desc' },
        include: {
          salary_structures_employee: {
            select: {
              id: true,
              name: true,
              email: true,
              employee_id: true,
            },
          },
          salary_structure_items: true,
        },
      });

      const total = await prisma.salary_structures.count();
      const active = await prisma.salary_structures.count({ where: { status: 'Active' } });
      const inactive = await prisma.salary_structures.count({ where: { status: 'Inactive' } });

      res.success(
        'Salary structures fetched successfully',
        data.map(serializeSalaryStructure),
        200,
        {
          ...pagination,
          stats: {
            total_structures: total,
            active_structures: active,
            inactive_structures: inactive,
          },
        }
      );
    } catch (error: any) {
      console.error('Get salary structures error:', error);
      res.error(error.message || 'Failed to fetch salary structures', 500);
    }
  },

  async getSalaryStructureById(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      const salaryStructure = await prisma.salary_structures.findUnique({
        where: { id: parseInt(id) },
        include: {
          salary_structures_employee: {
            select: {
              id: true,
              name: true,
              email: true,
              employee_id: true,
            },
          },
          salary_structure_items: true,
        },
      });

      if (!salaryStructure) {
        res.error('Salary structure not found', 404);
        return;
      }

      res.success('Salary structure fetched successfully', serializeSalaryStructure(salaryStructure));
    } catch (error: any) {
      console.error('Get salary structure error:', error);
      res.error(error.message || 'Failed to fetch salary structure', 500);
    }
  },

  async updateSalaryStructure(req: any, res: any): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const { id } = req.params;
      const { employee_id, start_date, end_date, status, structure_items, is_active } = req.body;

      const existing = await prisma.salary_structures.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existing) {
        res.error('Salary structure not found', 404);
        return;
      }

      const salaryStructure = await prisma.salary_structures.update({
        where: { id: parseInt(id) },
        data: {
          employee_id,
          start_date: start_date ? new Date(start_date) : undefined,
          end_date: end_date ? new Date(end_date) : undefined,
          status,
          is_active,
          updatedby: req.user?.id || 1,
          updatedate: new Date(),
        },
      });

      if (structure_items && Array.isArray(structure_items)) {
        await prisma.salary_structure_items.deleteMany({
          where: { salary_structure_id: salaryStructure.id },
        });

        await Promise.all(
          structure_items.map((item: any) =>
            prisma.salary_structure_items.create({
              data: {
                salary_structure_id: salaryStructure.id,
                structure_type: item.structure_type,
                value: item.value,
                category: item.category,
                is_default: item.is_default || false,
                createdby: req.user?.id || 1,
              },
            })
          )
        );
      }

      const fullStructure = await prisma.salary_structures.findUnique({
        where: { id: salaryStructure.id },
        include: {
          salary_structures_employee: {
            select: {
              id: true,
              name: true,
              email: true,
              employee_id: true,
            },
          },
          salary_structure_items: true,
        },
      });

      res.success('Salary structure updated successfully', serializeSalaryStructure(fullStructure));
    } catch (error: any) {
      console.error('Update salary structure error:', error);
      res.error(error.message || 'Failed to update salary structure', 500);
    }
  },

  async deleteSalaryStructure(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      const salaryStructure = await prisma.salary_structures.findUnique({
        where: { id: parseInt(id) },
      });

      if (!salaryStructure) {
        res.error('Salary structure not found', 404);
        return;
      }

      await prisma.salary_structures.delete({
        where: { id: parseInt(id) },
      });

      res.success('Salary structure deleted successfully', null);
    } catch (error: any) {
      console.error('Delete salary structure error:', error);
      res.error(error.message || 'Failed to delete salary structure', 500);
    }
  },
};
