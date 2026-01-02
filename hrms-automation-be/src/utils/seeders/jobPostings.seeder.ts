import prisma from '../../configs/prisma.client';
import logger from '../../configs/logger';

interface MockJobPosting {
  job_title: string;
  reporting_manager_id?: number;
  department_id?: number;
  designation_id?: number;
  due_date?: Date;
  annual_salary_from?: number;
  annual_salary_to?: number;
  currency_code?: string;
  experience?: string;
  posting_date: Date;
  closing_date?: Date;
  is_internal_job: string;
  description?: string;
  is_active: string;
}

const mockJobPostings: Omit<MockJobPosting, 'reporting_manager_id' | 'department_id' | 'designation_id'>[] = [
  {
    job_title: 'Senior Software Engineer',
    due_date: new Date('2025-12-31'),
    annual_salary_from: 80000,
    annual_salary_to: 120000,
    currency_code: 'USD',
    experience: '5-8 years',
    posting_date: new Date('2025-01-01'),
    closing_date: new Date('2025-12-20'),
    is_internal_job: 'N',
    description: 'We are looking for an experienced Senior Software Engineer to join our team. The ideal candidate will have strong experience in full-stack development.',
    is_active: 'Y',
  },
  {
    job_title: 'Product Manager',
    due_date: new Date('2025-12-25'),
    annual_salary_from: 100000,
    annual_salary_to: 150000,
    currency_code: 'USD',
    experience: '7-10 years',
    posting_date: new Date('2025-01-05'),
    closing_date: new Date('2025-12-25'),
    is_internal_job: 'N',
    description: 'Join our product team as a Product Manager. You will be responsible for defining product strategy and roadmap.',
    is_active: 'Y',
  },
  {
    job_title: 'UX Designer',
    due_date: new Date('2025-12-30'),
    annual_salary_from: 70000,
    annual_salary_to: 100000,
    currency_code: 'USD',
    experience: '3-5 years',
    posting_date: new Date('2025-01-10'),
    closing_date: new Date('2025-12-30'),
    is_internal_job: 'Y',
    description: 'We are seeking a talented UX Designer to create intuitive and engaging user experiences.',
    is_active: 'Y',
  },
  {
    job_title: 'Data Analyst',
    due_date: new Date('2025-12-28'),
    annual_salary_from: 60000,
    annual_salary_to: 90000,
    currency_code: 'USD',
    experience: '2-4 years',
    posting_date: new Date('2025-01-08'),
    closing_date: new Date('2025-12-28'),
    is_internal_job: 'N',
    description: 'Looking for a Data Analyst to join our analytics team and help drive data-driven decisions.',
    is_active: 'Y',
  },
];

export const seedJobPostings = async () => {
  logger.info('🌱 Seeding job postings...');

  try {
    const managers = await prisma.users.findMany({
      where: { 
        is_active: 'Y',
        role_id: { not: 1 }
      },
      take: 4,
    });

    const departments = await prisma.departments.findMany({
      where: { is_active: 'Y' },
      take: 4,
    });

    const designations = await prisma.designations.findMany({
      where: { is_active: 'Y' },
      take: 4,
    });

    const hiringStages = await prisma.hiring_stages.findMany({
      where: { is_active: 'Y' },
      orderBy: { sequence_order: 'asc' },
    });

    const attachmentTypes = await prisma.attachment_types.findMany({
      where: { is_active: 'Y' },
      take: 2,
    });

    if (managers.length === 0 || departments.length === 0) {
      logger.warn('No users or departments found. Skipping job postings seeding.');
      return;
    }

    let postingsCreated = 0;
    let postingsSkipped = 0;

    for (let i = 0; i < mockJobPostings.length; i++) {
      const posting = mockJobPostings[i];
      const manager = managers[i % managers.length];
      const department = departments[i % departments.length];
      const designation = designations[i % designations.length];

      const existingPosting = await prisma.job_postings.findFirst({
        where: {
          job_title: posting.job_title,
          posting_date: posting.posting_date,
        },
      });

      if (!existingPosting) {
        const jobPosting = await prisma.job_postings.create({
          data: {
            job_title: posting.job_title,
            reporting_manager_id: manager.id,
            department_id: department.id,
            designation_id: designation?.id,
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
            createdate: new Date(),
            createdby: manager.id,
          },
        });

        if (hiringStages.length > 0) {
          for (let j = 0; j < Math.min(3, hiringStages.length); j++) {
            await prisma.job_posting_stages.create({
              data: {
                job_posting_id: jobPosting.id,
                hiring_stage_id: hiringStages[j].id,
                sequence: j + 1,
                is_active: 'Y',
                createdate: new Date(),
                createdby: manager.id,
              },
            });
          }
        }

        if (attachmentTypes.length > 0) {
          for (let k = 0; k < Math.min(2, attachmentTypes.length); k++) {
            await prisma.job_posting_attachments.create({
              data: {
                job_posting_id: jobPosting.id,
                attachment_type_id: attachmentTypes[k].id,
                sequence: k + 1,
                is_active: 'Y',
                createdate: new Date(),
                createdby: manager.id,
              },
            });
          }
        }

        postingsCreated++;
      } else {
        postingsSkipped++;
      }
    }

    logger.info(
      `✅ Job postings seeded: ${postingsCreated} created, ${postingsSkipped} skipped`
    );
  } catch (error) {
    logger.error('Error seeding job postings:', error);
    throw error;
  }
};

export const clearJobPostings = async () => {
  logger.info('Clearing job postings...');
  await prisma.job_posting_attachments.deleteMany({});
  await prisma.job_posting_stages.deleteMany({});
  await prisma.job_postings.deleteMany({});
  logger.info('Job postings cleared.');
};
