import { validationResult } from 'express-validator';
import prisma from '../../configs/prisma.client';
import { paginate } from '../../utils/paginate';

const serializeCandidate = (candidate: any) => ({
  id: candidate.id,
  name: candidate.name,
  email: candidate.email,
  phone_number: candidate.phone_number,
  job_posting_id: candidate.job_posting_id,
  current_hiring_stage_id: candidate.current_hiring_stage_id,
  resume_url: candidate.resume_url,
  cover_letter_url: candidate.cover_letter_url,
  application_date: candidate.application_date,
  status: candidate.status,
  notes: candidate.notes,
  experience_years: candidate.experience_years,
  skills: candidate.skills,
  expected_salary: candidate.expected_salary,
  current_salary: candidate.current_salary,
  notice_period: candidate.notice_period,
  availability_date: candidate.availability_date,
  is_active: candidate.is_active,
  createdate: candidate.createdate,
  updatedate: candidate.updatedate,
  job_posting: candidate.candidates_job_posting
    ? {
        id: candidate.candidates_job_posting.id,
        job_title: candidate.candidates_job_posting.job_title,
      }
    : null,
  hiring_stage: candidate.candidates_stage
    ? {
        id: candidate.candidates_stage.id,
        name: candidate.candidates_stage.name,
        code: candidate.candidates_stage.code,
      }
    : null,
});

export const candidatesController = {
  async createCandidate(req: any, res: any): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const {
        name,
        email,
        phone_number,
        job_posting_id,
        current_hiring_stage_id,
        resume_url,
        cover_letter_url,
        application_date,
        status,
        notes,
        experience_years,
        skills,
        expected_salary,
        current_salary,
        notice_period,
        availability_date,
        is_active,
      } = req.body;

      const candidate = await prisma.candidates.create({
        data: {
          name,
          email,
          phone_number,
          job_posting_id,
          current_hiring_stage_id,
          resume_url,
          cover_letter_url,
          application_date: application_date ? new Date(application_date) : new Date(),
          status: status || 'Applied',
          notes,
          experience_years,
          skills,
          expected_salary,
          current_salary,
          notice_period,
          availability_date: availability_date ? new Date(availability_date) : null,
          is_active: is_active || 'Y',
          createdby: req.user?.id || 1,
          updatedby: req.user?.id || 1,
        },
        include: {
          candidates_job_posting: {
            select: {
              id: true,
              job_title: true,
            },
          },
          candidates_stage: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      res.success('Candidate created successfully', serializeCandidate(candidate), 201);
    } catch (error: any) {
      console.error('Create candidate error:', error);
      res.error(error.message || 'Failed to create candidate', 500);
    }
  },

  async getCandidates(req: any, res: any): Promise<void> {
    try {
      const { page = '1', limit = '10', search = '', isActive, job_posting_id, status, current_hiring_stage_id } = req.query;

      const page_num = parseInt(page as string, 10);
      const limit_num = parseInt(limit as string, 10);
      const searchLower = (search as string).toLowerCase();

      const filters: any = {};

      if (isActive) {
        filters.is_active = isActive as string;
      }

      if (job_posting_id) {
        filters.job_posting_id = parseInt(job_posting_id as string);
      }

      if (status) {
        filters.status = status as string;
      }

      if (current_hiring_stage_id) {
        filters.current_hiring_stage_id = parseInt(current_hiring_stage_id as string);
      }

      if (search) {
        filters.OR = [
          { name: { contains: searchLower, mode: 'insensitive' } },
          { email: { contains: searchLower, mode: 'insensitive' } },
          { phone_number: { contains: searchLower, mode: 'insensitive' } },
          { skills: { contains: searchLower, mode: 'insensitive' } },
        ];
      }

      const { data, pagination } = await paginate({
        model: prisma.candidates,
        filters,
        page: page_num,
        limit: limit_num,
        orderBy: { createdate: 'desc' },
        include: {
          candidates_job_posting: {
            select: {
              id: true,
              job_title: true,
            },
          },
          candidates_stage: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      const total = await prisma.candidates.count();
      const active = await prisma.candidates.count({ where: { is_active: 'Y' } });
      const inactive = await prisma.candidates.count({ where: { is_active: 'N' } });
      const byStatus = await prisma.$queryRaw`
        SELECT status, COUNT(*)::int as count
        FROM candidates
        GROUP BY status
      ` as { status: string; count: number }[];

      res.success(
        'Candidates fetched successfully',
        data.map(serializeCandidate),
        200,
        {
          ...pagination,
          stats: {
            total_candidates: total,
            active_candidates: active,
            inactive_candidates: inactive,
            by_status: byStatus.reduce((acc, item) => {
              acc[item.status] = item.count;
              return acc;
            }, {} as Record<string, number>),
          },
        }
      );
    } catch (error: any) {
      console.error('Get candidates error:', error);
      res.error(error.message || 'Failed to fetch candidates', 500);
    }
  },

  async getCandidateById(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      const candidate = await prisma.candidates.findUnique({
        where: { id: parseInt(id) },
        include: {
          candidates_job_posting: {
            select: {
              id: true,
              job_title: true,
              department_id: true,
              designation_id: true,
            },
          },
          candidates_stage: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      if (!candidate) {
        res.error('Candidate not found', 404);
        return;
      }

      res.success('Candidate fetched successfully', serializeCandidate(candidate));
    } catch (error: any) {
      console.error('Get candidate error:', error);
      res.error(error.message || 'Failed to fetch candidate', 500);
    }
  },

  async updateCandidate(req: any, res: any): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.validationError(errors.array(), 400);
        return;
      }

      const { id } = req.params;
      const {
        name,
        email,
        phone_number,
        job_posting_id,
        current_hiring_stage_id,
        resume_url,
        cover_letter_url,
        application_date,
        status,
        notes,
        experience_years,
        skills,
        expected_salary,
        current_salary,
        notice_period,
        availability_date,
        is_active,
      } = req.body;

      const existing = await prisma.candidates.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existing) {
        res.error('Candidate not found', 404);
        return;
      }

      const candidate = await prisma.candidates.update({
        where: { id: parseInt(id) },
        data: {
          name,
          email,
          phone_number,
          job_posting_id,
          current_hiring_stage_id,
          resume_url,
          cover_letter_url,
          application_date: application_date ? new Date(application_date) : undefined,
          status,
          notes,
          experience_years,
          skills,
          expected_salary,
          current_salary,
          notice_period,
          availability_date: availability_date ? new Date(availability_date) : undefined,
          is_active,
          updatedby: req.user?.id || 1,
          updatedate: new Date(),
        },
        include: {
          candidates_job_posting: {
            select: {
              id: true,
              job_title: true,
            },
          },
          candidates_stage: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      res.success('Candidate updated successfully', serializeCandidate(candidate));
    } catch (error: any) {
      console.error('Update candidate error:', error);
      res.error(error.message || 'Failed to update candidate', 500);
    }
  },

  async deleteCandidate(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      const candidate = await prisma.candidates.findUnique({
        where: { id: parseInt(id) },
      });

      if (!candidate) {
        res.error('Candidate not found', 404);
        return;
      }

      await prisma.candidates.delete({
        where: { id: parseInt(id) },
      });

      res.success('Candidate deleted successfully', null);
    } catch (error: any) {
      console.error('Delete candidate error:', error);
      res.error(error.message || 'Failed to delete candidate', 500);
    }
  },
};
