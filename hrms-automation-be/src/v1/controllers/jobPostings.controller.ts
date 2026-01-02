import { validationResult } from 'express-validator';
import prisma from '../../configs/prisma.client';
import { paginate } from '../../utils/paginate';

const serializeJobPosting = (posting: any) => ({
  id: posting.id,
  job_title: posting.job_title,
  reporting_manager_id: posting.reporting_manager_id,
  department_id: posting.department_id,
  designation_id: posting.designation_id,
  due_date: posting.due_date,
  annual_salary_from: posting.annual_salary_from,
  annual_salary_to: posting.annual_salary_to,
  currency_code: posting.currency_code,
  experience: posting.experience,
  posting_date: posting.posting_date,
  closing_date: posting.closing_date,
  is_internal_job: posting.is_internal_job,
  description: posting.description,
  is_active: posting.is_active,
  createdate: posting.createdate,
  updatedate: posting.updatedate,
  manager: posting.job_postings_manager
    ? {
        id: posting.job_postings_manager.id,
        name: posting.job_postings_manager.name,
        email: posting.job_postings_manager.email,
      }
    : null,
  department: posting.job_postings_department
    ? {
        id: posting.job_postings_department.id,
        name: posting.job_postings_department.name,
        code: posting.job_postings_department.code,
      }
    : null,
  designation: posting.job_postings_designation
    ? {
        id: posting.job_postings_designation.id,
        name: posting.job_postings_designation.name,
        code: posting.job_postings_designation.code,
      }
    : null,
  hiring_stages: posting.job_posting_stages?.map((s: any) => ({
    id: s.id,
    hiring_stage_id: s.hiring_stage_id,
    hiring_stage_name: s.hiring_stage?.name,
    hiring_stage_code: s.hiring_stage?.code,
    sequence: s.sequence,
  })) || [],
  attachments_required: posting.job_posting_attachments?.map((a: any) => ({
    id: a.id,
    attachment_type_id: a.attachment_type_id,
    attachment_type_name: a.attachment_type?.name,
    sequence: a.sequence,
  })) || [],
});

export const jobPostingsController = {
  async createJobPosting(req: any, res: any): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const {
        job_title,
        reporting_manager_id,
        department_id,
        designation_id,
        due_date,
        annual_salary_from,
        annual_salary_to,
        currency_code,
        experience,
        posting_date,
        closing_date,
        is_internal_job,
        description,
        hiring_stages,
        attachments_required,
        is_active,
      } = req.body;

      const jobPosting = await prisma.job_postings.create({
        data: {
          job_title,
          reporting_manager_id,
          department_id,
          designation_id,
          due_date: due_date ? new Date(due_date) : null,
          annual_salary_from,
          annual_salary_to,
          currency_code,
          experience,
          posting_date: posting_date ? new Date(posting_date) : new Date(),
          closing_date: closing_date ? new Date(closing_date) : null,
          is_internal_job: is_internal_job || 'N',
          description,
          is_active: is_active || 'Y',
          createdby: req.user?.id || 1,
          updatedby: req.user?.id || 1,
        },
      });

      if (hiring_stages && Array.isArray(hiring_stages)) {
        await Promise.all(
          hiring_stages.map((stage: any) =>
            prisma.job_posting_stages.create({
              data: {
                job_posting_id: jobPosting.id,
                hiring_stage_id: stage.hiring_stage_id,
                sequence: stage.sequence,
                createdby: req.user?.id || 1,
              },
            })
          )
        );
      }

      if (attachments_required && Array.isArray(attachments_required)) {
        await Promise.all(
          attachments_required.map((attachment: any) =>
            prisma.job_posting_attachments.create({
              data: {
                job_posting_id: jobPosting.id,
                attachment_type_id: attachment.attachment_type_id,
                sequence: attachment.sequence,
                createdby: req.user?.id || 1,
              },
            })
          )
        );
      }

      const fullJobPosting = await prisma.job_postings.findUnique({
        where: { id: jobPosting.id },
        include: {
          job_postings_manager: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          job_postings_department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          job_postings_designation: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          job_posting_stages: {
            include: {
              hiring_stage: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
          job_posting_attachments: {
            include: {
              attachment_type: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      res.success('Job posting created successfully', serializeJobPosting(fullJobPosting), 201);
    } catch (error: any) {
      console.error('Create job posting error:', error);
      res.error(error.message || 'Failed to create job posting', 500);
    }
  },

  async getJobPostings(req: any, res: any): Promise<void> {
    try {
      const { page = '1', limit = '10', search = '', isActive, department_id, designation_id } = req.query;

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

      if (designation_id) {
        filters.designation_id = parseInt(designation_id as string);
      }

      if (search) {
        filters.OR = [
          { job_title: { contains: searchLower, mode: 'insensitive' } },
          { description: { contains: searchLower, mode: 'insensitive' } },
        ];
      }

      const { data, pagination } = await paginate({
        model: prisma.job_postings,
        filters,
        page: page_num,
        limit: limit_num,
        orderBy: { createdate: 'desc' },
        include: {
          job_postings_manager: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          job_postings_department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          job_postings_designation: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          job_posting_stages: {
            include: {
              hiring_stage: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
          job_posting_attachments: {
            include: {
              attachment_type: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      const total = await prisma.job_postings.count();
      const active = await prisma.job_postings.count({ where: { is_active: 'Y' } });
      const inactive = await prisma.job_postings.count({ where: { is_active: 'N' } });

      res.success(
        'Job postings fetched successfully',
        data.map(serializeJobPosting),
        200,
        {
          ...pagination,
          stats: {
            total_job_postings: total,
            active_job_postings: active,
            inactive_job_postings: inactive,
          },
        }
      );
    } catch (error: any) {
      console.error('Get job postings error:', error);
      res.error(error.message || 'Failed to fetch job postings', 500);
    }
  },

  async getJobPostingById(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      const jobPosting = await prisma.job_postings.findUnique({
        where: { id: parseInt(id) },
        include: {
          job_postings_manager: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          job_postings_department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          job_postings_designation: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          job_posting_stages: {
            include: {
              hiring_stage: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
            orderBy: {
              sequence: 'asc',
            },
          },
          job_posting_attachments: {
            include: {
              attachment_type: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: {
              sequence: 'asc',
            },
          },
        },
      });

      if (!jobPosting) {
        res.error('Job posting not found', 404);
        return;
      }

      res.success('Job posting fetched successfully', serializeJobPosting(jobPosting));
    } catch (error: any) {
      console.error('Get job posting error:', error);
      res.error(error.message || 'Failed to fetch job posting', 500);
    }
  },

  async updateJobPosting(req: any, res: any): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const { id } = req.params;
      const {
        job_title,
        reporting_manager_id,
        department_id,
        designation_id,
        due_date,
        annual_salary_from,
        annual_salary_to,
        currency_code,
        experience,
        posting_date,
        closing_date,
        is_internal_job,
        description,
        hiring_stages,
        attachments_required,
        is_active,
      } = req.body;

      const existing = await prisma.job_postings.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existing) {
        res.error('Job posting not found', 404);
        return;
      }

      const jobPosting = await prisma.job_postings.update({
        where: { id: parseInt(id) },
        data: {
          job_title,
          reporting_manager_id,
          department_id,
          designation_id,
          due_date: due_date ? new Date(due_date) : undefined,
          annual_salary_from,
          annual_salary_to,
          currency_code,
          experience,
          posting_date: posting_date ? new Date(posting_date) : undefined,
          closing_date: closing_date ? new Date(closing_date) : undefined,
          is_internal_job,
          description,
          is_active,
          updatedby: req.user?.id || 1,
          updatedate: new Date(),
        },
      });

      if (hiring_stages && Array.isArray(hiring_stages)) {
        await prisma.job_posting_stages.deleteMany({
          where: { job_posting_id: jobPosting.id },
        });

        await Promise.all(
          hiring_stages.map((stage: any) =>
            prisma.job_posting_stages.create({
              data: {
                job_posting_id: jobPosting.id,
                hiring_stage_id: stage.hiring_stage_id,
                sequence: stage.sequence,
                createdby: req.user?.id || 1,
              },
            })
          )
        );
      }

      if (attachments_required && Array.isArray(attachments_required)) {
        await prisma.job_posting_attachments.deleteMany({
          where: { job_posting_id: jobPosting.id },
        });

        await Promise.all(
          attachments_required.map((attachment: any) =>
            prisma.job_posting_attachments.create({
              data: {
                job_posting_id: jobPosting.id,
                attachment_type_id: attachment.attachment_type_id,
                sequence: attachment.sequence,
                createdby: req.user?.id || 1,
              },
            })
          )
        );
      }

      const fullJobPosting = await prisma.job_postings.findUnique({
        where: { id: jobPosting.id },
        include: {
          job_postings_manager: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          job_postings_department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          job_postings_designation: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          job_posting_stages: {
            include: {
              hiring_stage: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
          job_posting_attachments: {
            include: {
              attachment_type: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      res.success('Job posting updated successfully', serializeJobPosting(fullJobPosting));
    } catch (error: any) {
      console.error('Update job posting error:', error);
      res.error(error.message || 'Failed to update job posting', 500);
    }
  },

  async deleteJobPosting(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      const jobPosting = await prisma.job_postings.findUnique({
        where: { id: parseInt(id) },
      });

      if (!jobPosting) {
        res.error('Job posting not found', 404);
        return;
      }

      await prisma.job_postings.delete({
        where: { id: parseInt(id) },
      });

      res.success('Job posting deleted successfully', null);
    } catch (error: any) {
      console.error('Delete job posting error:', error);
      res.error(error.message || 'Failed to delete job posting', 500);
    }
  },

  async getJobPostingsDropdown(req: any, res: any): Promise<void> {
    try {
      const { search = '' } = req.query;

      const filters: any = { is_active: 'Y' };

      if (search) {
        filters.OR = [
          { job_title: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const jobPostings = await prisma.job_postings.findMany({
        where: filters,
        select: {
          id: true,
          job_title: true,
          department_id: true,
          designation_id: true,
        },
        orderBy: { createdate: 'desc' },
        take: 100,
      });

      res.success('Job postings dropdown fetched successfully', jobPostings);
    } catch (error: any) {
      console.error('Get job postings dropdown error:', error);
      res.error(error.message || 'Failed to fetch job postings dropdown', 500);
    }
  },
};
