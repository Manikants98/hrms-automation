import prisma from '../../configs/prisma.client';

interface MockDepartment {
  name: string;
  code: string;
  description: string;
  parent_id?: number | null;
  manager_id?: number | null;
  is_active: string;
}

const mockDepartments: MockDepartment[] = [
  {
    name: 'Engineering',
    code: 'ENG',
    description: 'Engineering and Development department',
    is_active: 'Y',
  },
  {
    name: 'Human Resources',
    code: 'HR',
    description: 'Human Resources management and operations',
    is_active: 'Y',
  },
  {
    name: 'Finance',
    code: 'FIN',
    description: 'Finance and Accounting department',
    is_active: 'Y',
  },
  {
    name: 'Sales',
    code: 'SALES',
    description: 'Sales and Business Development',
    is_active: 'Y',
  },
  {
    name: 'Marketing',
    code: 'MKT',
    description: 'Marketing and Brand Management',
    is_active: 'Y',
  },
  {
    name: 'Operations',
    code: 'OPS',
    description: 'Operations and Support',
    is_active: 'Y',
  },
  {
    name: 'IT',
    code: 'IT',
    description: 'Information Technology',
    is_active: 'Y',
  },
  {
    name: 'Admin',
    code: 'ADM',
    description: 'Administration and Facilities',
    is_active: 'Y',
  },
];

export const seedDepartments = async () => {
  console.log('🌱 Seeding departments...');

  try {
    const existingCount = await prisma.departments.count();
    
    if (existingCount > 0) {
      console.log('⏭️  Departments already seeded. Skipping...');
      return;
    }

    for (const dept of mockDepartments) {
      await prisma.departments.create({
        data: {
          ...dept,
          createdby: 1,
          updatedby: 1,
        },
      });
    }

    console.log(`✅ Successfully seeded ${mockDepartments.length} departments`);
  } catch (error) {
    console.error('❌ Error seeding departments:', error);
    throw error;
  }
};
