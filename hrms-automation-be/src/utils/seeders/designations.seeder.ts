import prisma from '../../configs/prisma.client';

interface MockDesignation {
  name: string;
  code: string;
  description: string;
  department_id?: number | null;
  is_active: string;
}

const mockDesignations: MockDesignation[] = [
  {
    name: 'Software Engineer',
    code: 'SE',
    description: 'Software development and programming',
    is_active: 'Y',
  },
  {
    name: 'Senior Software Engineer',
    code: 'SSE',
    description: 'Senior level software development',
    is_active: 'Y',
  },
  {
    name: 'Team Lead',
    code: 'TL',
    description: 'Team leadership and coordination',
    is_active: 'Y',
  },
  {
    name: 'Manager',
    code: 'MGR',
    description: 'Departmental management',
    is_active: 'Y',
  },
  {
    name: 'HR Executive',
    code: 'HR_EXE',
    description: 'HR operations and employee relations',
    is_active: 'Y',
  },
  {
    name: 'HR Manager',
    code: 'HR_MGR',
    description: 'HR department management',
    is_active: 'Y',
  },
  {
    name: 'Accountant',
    code: 'ACC',
    description: 'Accounting and bookkeeping',
    is_active: 'Y',
  },
  {
    name: 'Finance Manager',
    code: 'FIN_MGR',
    description: 'Finance department management',
    is_active: 'Y',
  },
  {
    name: 'Sales Executive',
    code: 'SALES_EXE',
    description: 'Sales operations and client management',
    is_active: 'Y',
  },
  {
    name: 'Marketing Executive',
    code: 'MKT_EXE',
    description: 'Marketing campaigns and brand promotion',
    is_active: 'Y',
  },
  {
    name: 'Admin Executive',
    code: 'ADM_EXE',
    description: 'Administrative tasks and support',
    is_active: 'Y',
  },
  {
    name: 'IT Support',
    code: 'IT_SUP',
    description: 'IT support and maintenance',
    is_active: 'Y',
  },
];

export const seedDesignations = async () => {
  console.log('🌱 Seeding designations...');

  try {
    const existingCount = await prisma.designations.count();
    
    if (existingCount > 0) {
      console.log('⏭️  Designations already seeded. Skipping...');
      return;
    }

    for (const desig of mockDesignations) {
      await prisma.designations.create({
        data: {
          ...desig,
          createdby: 1,
          updatedby: 1,
        },
      });
    }

    console.log(`✅ Successfully seeded ${mockDesignations.length} designations`);
  } catch (error) {
    console.error('❌ Error seeding designations:', error);
    throw error;
  }
};
