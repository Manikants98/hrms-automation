import prisma from '../../configs/prisma.client';

interface MockLeaveType {
  name: string;
  code: string;
  max_days_per_year: number;
  is_paid: string;
  requires_approval: string;
  description: string;
  is_active: string;
}

const mockLeaveTypes: MockLeaveType[] = [
  {
    name: 'Annual',
    code: 'ANNUAL',
    max_days_per_year: 20,
    is_paid: 'Y',
    requires_approval: 'Y',
    description: 'Annual vacation leave',
    is_active: 'Y',
  },
  {
    name: 'Sick',
    code: 'SICK',
    max_days_per_year: 10,
    is_paid: 'Y',
    requires_approval: 'N',
    description: 'Medical and sick leave',
    is_active: 'Y',
  },
  {
    name: 'Casual',
    code: 'CASUAL',
    max_days_per_year: 12,
    is_paid: 'Y',
    requires_approval: 'Y',
    description: 'Casual leave for personal matters',
    is_active: 'Y',
  },
  {
    name: 'Emergency',
    code: 'EMERGENCY',
    max_days_per_year: 5,
    is_paid: 'Y',
    requires_approval: 'N',
    description: 'Emergency leave for urgent situations',
    is_active: 'Y',
  },
  {
    name: 'Maternity',
    code: 'MATERNITY',
    max_days_per_year: 90,
    is_paid: 'Y',
    requires_approval: 'Y',
    description: 'Maternity leave',
    is_active: 'Y',
  },
  {
    name: 'Paternity',
    code: 'PATERNITY',
    max_days_per_year: 15,
    is_paid: 'Y',
    requires_approval: 'Y',
    description: 'Paternity leave',
    is_active: 'Y',
  },
  {
    name: 'Unpaid',
    code: 'UNPAID',
    max_days_per_year: 30,
    is_paid: 'N',
    requires_approval: 'Y',
    description: 'Unpaid leave',
    is_active: 'Y',
  },
  {
    name: 'Marriage',
    code: 'MARRIAGE',
    max_days_per_year: 5,
    is_paid: 'Y',
    requires_approval: 'Y',
    description: 'Marriage leave',
    is_active: 'Y',
  },
];

export const seedLeaveTypes = async () => {
  console.log('🌱 Seeding leave types...');

  try {
    const existingCount = await prisma.leave_types.count();
    
    if (existingCount > 0) {
      console.log('⏭️  Leave types already seeded. Skipping...');
      return;
    }

    for (const leaveType of mockLeaveTypes) {
      await prisma.leave_types.create({
        data: {
          ...leaveType,
          createdby: 1,
          updatedby: 1,
        },
      });
    }

    console.log(`✅ Successfully seeded ${mockLeaveTypes.length} leave types`);
  } catch (error) {
    console.error('❌ Error seeding leave types:', error);
    throw error;
  }
};
