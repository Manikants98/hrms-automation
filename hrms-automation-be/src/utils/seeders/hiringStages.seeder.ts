import prisma from '../../configs/prisma.client';

interface MockHiringStage {
  name: string;
  code: string;
  description: string;
  sequence_order: number;
  is_active: string;
}

const mockHiringStages: MockHiringStage[] = [
  {
    name: 'Application Received',
    code: 'APP_REC',
    description: 'Initial application received from candidate',
    sequence_order: 1,
    is_active: 'Y',
  },
  {
    name: 'Resume Screening',
    code: 'SCREEN',
    description: 'Resume and qualification screening',
    sequence_order: 2,
    is_active: 'Y',
  },
  {
    name: 'Technical Interview',
    code: 'TECH_INT',
    description: 'Technical skills assessment interview',
    sequence_order: 3,
    is_active: 'Y',
  },
  {
    name: 'HR Round',
    code: 'HR_RND',
    description: 'HR interview and culture fit assessment',
    sequence_order: 4,
    is_active: 'Y',
  },
  {
    name: 'Manager Round',
    code: 'MGR_RND',
    description: 'Interview with hiring manager',
    sequence_order: 5,
    is_active: 'Y',
  },
  {
    name: 'Portfolio Review',
    code: 'PORT_REV',
    description: 'Portfolio and work sample review',
    sequence_order: 6,
    is_active: 'Y',
  },
  {
    name: 'Offer Extended',
    code: 'OFFER',
    description: 'Job offer extended to candidate',
    sequence_order: 7,
    is_active: 'Y',
  },
  {
    name: 'Onboarding',
    code: 'ONBOARD',
    description: 'Candidate onboarding process',
    sequence_order: 8,
    is_active: 'Y',
  },
];

export const seedHiringStages = async () => {
  console.log('🌱 Seeding hiring stages...');

  try {
    const existingCount = await prisma.hiring_stages.count();
    
    if (existingCount > 0) {
      console.log('⏭️  Hiring stages already seeded. Skipping...');
      return;
    }

    for (const stage of mockHiringStages) {
      await prisma.hiring_stages.create({
        data: {
          ...stage,
          createdby: 1,
          updatedby: 1,
        },
      });
    }

    console.log(`✅ Successfully seeded ${mockHiringStages.length} hiring stages`);
  } catch (error) {
    console.error('❌ Error seeding hiring stages:', error);
    throw error;
  }
};
