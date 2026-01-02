import prisma from '../../configs/prisma.client';
import logger from '../../configs/logger';

interface MockCandidate {
  name: string;
  email: string;
  phone_number?: string;
  job_posting_id: number;
  current_hiring_stage_id?: number;
  resume_url?: string;
  cover_letter_url?: string;
  application_date: Date;
  status: string;
  notes?: string;
  experience_years?: number;
  skills?: string;
  expected_salary?: number;
  current_salary?: number;
  notice_period?: string;
  availability_date?: Date;
  is_active: string;
}

const mockCandidatesData: Omit<MockCandidate, 'job_posting_id' | 'current_hiring_stage_id'>[] = [
  {
    name: 'John Smith',
    email: 'john.smith@candidate.com',
    phone_number: '+1-555-0101',
    resume_url: '/resumes/john-smith-resume.pdf',
    cover_letter_url: '/cover-letters/john-smith-cover.pdf',
    application_date: new Date('2025-01-05'),
    status: 'Interview',
    notes: 'Strong technical background, excellent communication skills',
    experience_years: 7,
    skills: 'React, Node.js, TypeScript, AWS',
    expected_salary: 110000,
    current_salary: 95000,
    notice_period: '2 weeks',
    availability_date: new Date('2026-01-15'),
    is_active: 'Y',
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@candidate.com',
    phone_number: '+1-555-0102',
    resume_url: '/resumes/sarah-johnson-resume.pdf',
    application_date: new Date('2025-01-08'),
    status: 'Screening',
    notes: 'Previous experience in product management, MBA graduate',
    experience_years: 8,
    skills: 'Product Strategy, Agile, Data Analysis',
    expected_salary: 130000,
    current_salary: 115000,
    notice_period: '1 month',
    availability_date: new Date('2026-02-01'),
    is_active: 'Y',
  },
  {
    name: 'Michael Chen',
    email: 'michael.chen@candidate.com',
    phone_number: '+1-555-0103',
    resume_url: '/resumes/michael-chen-resume.pdf',
    application_date: new Date('2025-01-03'),
    status: 'Interview',
    notes: 'Passed technical interview, moving to HR round',
    experience_years: 6,
    skills: 'Python, Django, PostgreSQL, Docker',
    expected_salary: 105000,
    current_salary: 90000,
    notice_period: '3 weeks',
    availability_date: new Date('2026-01-20'),
    is_active: 'Y',
  },
  {
    name: 'Emily Davis',
    email: 'emily.davis@candidate.com',
    phone_number: '+1-555-0104',
    resume_url: '/resumes/emily-davis-resume.pdf',
    cover_letter_url: '/cover-letters/emily-davis-cover.pdf',
    application_date: new Date('2025-01-12'),
    status: 'Screening',
    notes: 'Impressive portfolio, strong design thinking',
    experience_years: 4,
    skills: 'Figma, Sketch, User Research, Prototyping',
    expected_salary: 85000,
    current_salary: 75000,
    notice_period: '2 weeks',
    availability_date: new Date('2026-01-10'),
    is_active: 'Y',
  },
  {
    name: 'David Wilson',
    email: 'david.wilson@candidate.com',
    phone_number: '+1-555-0105',
    resume_url: '/resumes/david-wilson-resume.pdf',
    application_date: new Date('2025-01-10'),
    status: 'Interview',
    notes: 'Strong analytical skills, SQL expert',
    experience_years: 3,
    skills: 'SQL, Python, Tableau, Excel',
    expected_salary: 75000,
    current_salary: 65000,
    notice_period: '2 weeks',
    availability_date: new Date('2026-01-05'),
    is_active: 'Y',
  },
];

export const seedCandidates = async () => {
  logger.info('🌱 Seeding candidates...');

  try {
    const jobPostings = await prisma.job_postings.findMany({
      where: { is_active: 'Y' },
      include: {
        job_posting_stages: {
          include: {
            hiring_stage: true,
          },
          orderBy: {
            sequence: 'asc',
          },
        },
      },
    });

    if (jobPostings.length === 0) {
      logger.warn('No job postings found. Skipping candidates seeding.');
      return;
    }

    let candidatesCreated = 0;
    let candidatesSkipped = 0;

    for (let i = 0; i < mockCandidatesData.length; i++) {
      const candidateData = mockCandidatesData[i];
      const jobPosting = jobPostings[i % jobPostings.length];
      const hiringStage = jobPosting.job_posting_stages[0];

      const existingCandidate = await prisma.candidates.findFirst({
        where: {
          email: candidateData.email,
        },
      });

      if (!existingCandidate) {
        await prisma.candidates.create({
          data: {
            name: candidateData.name,
            email: candidateData.email,
            phone_number: candidateData.phone_number,
            job_posting_id: jobPosting.id,
            current_hiring_stage_id: hiringStage?.hiring_stage_id,
            resume_url: candidateData.resume_url,
            cover_letter_url: candidateData.cover_letter_url,
            application_date: candidateData.application_date,
            status: candidateData.status,
            notes: candidateData.notes,
            experience_years: candidateData.experience_years,
            skills: candidateData.skills,
            expected_salary: candidateData.expected_salary,
            current_salary: candidateData.current_salary,
            notice_period: candidateData.notice_period,
            availability_date: candidateData.availability_date,
            is_active: candidateData.is_active,
            createdate: new Date(),
            createdby: 1,
          },
        });
        candidatesCreated++;
      } else {
        candidatesSkipped++;
      }
    }

    logger.info(
      `✅ Candidates seeded: ${candidatesCreated} created, ${candidatesSkipped} skipped`
    );
  } catch (error) {
    logger.error('Error seeding candidates:', error);
    throw error;
  }
};

export const clearCandidates = async () => {
  logger.info('Clearing candidates...');
  await prisma.candidates.deleteMany({});
  logger.info('Candidates cleared.');
};
