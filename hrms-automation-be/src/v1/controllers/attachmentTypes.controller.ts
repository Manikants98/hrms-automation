import { validationResult } from 'express-validator';
import prisma from '../../configs/prisma.client';
import { paginate } from '../../utils/paginate';

const serializeAttachmentType = (type: any) => ({
  id: type.id,
  name: type.name,
  code: type.code,
  description: type.description,
  is_active: type.is_active,
  createdate: type.createdate,
  updatedate: type.updatedate,
});

export const attachmentTypesController = {
  async createAttachmentType(req: any, res: any): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const { name, code, description, is_active } = req.body;

      const existingCode = await prisma.attachment_types.findUnique({
        where: { code },
      });

      if (existingCode) {
        res.error('Attachment type code already exists', 400);
        return;
      }

      const existingName = await prisma.attachment_types.findUnique({
        where: { name },
      });

      if (existingName) {
        res.error('Attachment type name already exists', 400);
        return;
      }

      const attachmentType = await prisma.attachment_types.create({
        data: {
          name,
          code,
          description,
          is_active: is_active || 'Y',
          createdby: req.user?.id || 1,
          updatedby: req.user?.id || 1,
        },
      });

      res.success(
        'Attachment type created successfully',
        serializeAttachmentType(attachmentType),
        201
      );
    } catch (error: any) {
      console.error('Create attachment type error:', error);
      res.error(error.message || 'Failed to create attachment type', 500);
    }
  },

  async getAttachmentTypes(req: any, res: any): Promise<void> {
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
        model: prisma.attachment_types,
        filters,
        page: page_num,
        limit: limit_num,
        orderBy: { createdate: 'desc' },
      });

      const total = await prisma.attachment_types.count();
      const active = await prisma.attachment_types.count({
        where: { is_active: 'Y' },
      });
      const inactive = await prisma.attachment_types.count({
        where: { is_active: 'N' },
      });

      res.success(
        'Attachment types fetched successfully',
        data.map(serializeAttachmentType),
        200,
        {
          ...pagination,
          stats: {
            total_attachment_types: total,
            active_attachment_types: active,
            inactive_attachment_types: inactive,
          },
        }
      );
    } catch (error: any) {
      console.error('Get attachment types error:', error);
      res.error(error.message || 'Failed to fetch attachment types', 500);
    }
  },

  async getAttachmentTypeById(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      const attachmentType = await prisma.attachment_types.findUnique({
        where: { id: parseInt(id) },
      });

      if (!attachmentType) {
        res.error('Attachment type not found', 404);
        return;
      }

      res.success(
        'Attachment type fetched successfully',
        serializeAttachmentType(attachmentType)
      );
    } catch (error: any) {
      console.error('Get attachment type error:', error);
      res.error(error.message || 'Failed to fetch attachment type', 500);
    }
  },

  async updateAttachmentType(req: any, res: any): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const { id } = req.params;
      const { name, code, description, is_active } = req.body;

      const existing = await prisma.attachment_types.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existing) {
        res.error('Attachment type not found', 404);
        return;
      }

      if (code && code !== existing.code) {
        const codeExists = await prisma.attachment_types.findUnique({
          where: { code },
        });
        if (codeExists) {
          res.error('Attachment type code already exists', 400);
          return;
        }
      }

      if (name && name !== existing.name) {
        const nameExists = await prisma.attachment_types.findUnique({
          where: { name },
        });
        if (nameExists) {
          res.error('Attachment type name already exists', 400);
          return;
        }
      }

      const attachmentType = await prisma.attachment_types.update({
        where: { id: parseInt(id) },
        data: {
          name,
          code,
          description,
          is_active,
          updatedby: req.user?.id || 1,
          updatedate: new Date(),
        },
      });

      res.success(
        'Attachment type updated successfully',
        serializeAttachmentType(attachmentType)
      );
    } catch (error: any) {
      console.error('Update attachment type error:', error);
      res.error(error.message || 'Failed to update attachment type', 500);
    }
  },

  async deleteAttachmentType(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      const attachmentType = await prisma.attachment_types.findUnique({
        where: { id: parseInt(id) },
      });

      if (!attachmentType) {
        res.error('Attachment type not found', 404);
        return;
      }

      await prisma.attachment_types.delete({
        where: { id: parseInt(id) },
      });

      res.success('Attachment type deleted successfully', null);
    } catch (error: any) {
      console.error('Delete attachment type error:', error);
      res.error(error.message || 'Failed to delete attachment type', 500);
    }
  },

  async getAttachmentTypesDropdown(req: any, res: any): Promise<void> {
    try {
      const { search = '' } = req.query;

      const filters: any = { is_active: 'Y' };

      if (search) {
        filters.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { code: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const attachmentTypes = await prisma.attachment_types.findMany({
        where: filters,
        select: {
          id: true,
          name: true,
          code: true,
        },
        orderBy: { name: 'asc' },
        take: 100,
      });

      res.success(
        'Attachment types dropdown fetched successfully',
        attachmentTypes
      );
    } catch (error: any) {
      console.error('Get attachment types dropdown error:', error);
      res.error(
        error.message || 'Failed to fetch attachment types dropdown',
        500
      );
    }
  },
};
