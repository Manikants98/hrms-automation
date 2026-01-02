import prisma from '../../configs/prisma.client';

interface MockAttachmentType {
  name: string;
  code: string;
  description: string;
  is_active: string;
}

const mockAttachmentTypes: MockAttachmentType[] = [
  {
    name: 'Resume / CV',
    code: 'RESUME',
    description: 'Candidate resume or curriculum vitae',
    is_active: 'Y',
  },
  {
    name: 'Cover Letter',
    code: 'COVER_LETTER',
    description: 'Cover letter from candidate',
    is_active: 'Y',
  },
  {
    name: 'Portfolio',
    code: 'PORTFOLIO',
    description: 'Work portfolio and samples',
    is_active: 'Y',
  },
  {
    name: 'References',
    code: 'REFERENCES',
    description: 'Professional references',
    is_active: 'Y',
  },
  {
    name: 'Certifications',
    code: 'CERTIFICATIONS',
    description: 'Professional certifications and licenses',
    is_active: 'Y',
  },
  {
    name: 'Educational Documents',
    code: 'EDU_DOCS',
    description: 'Educational certificates and transcripts',
    is_active: 'Y',
  },
];

export const seedAttachmentTypes = async () => {
  console.log('🌱 Seeding attachment types...');

  try {
    const existingCount = await prisma.attachment_types.count();
    
    if (existingCount > 0) {
      console.log('⏭️  Attachment types already seeded. Skipping...');
      return;
    }

    for (const type of mockAttachmentTypes) {
      await prisma.attachment_types.create({
        data: {
          ...type,
          createdby: 1,
          updatedby: 1,
        },
      });
    }

    console.log(`✅ Successfully seeded ${mockAttachmentTypes.length} attachment types`);
  } catch (error) {
    console.error('❌ Error seeding attachment types:', error);
    throw error;
  }
};
