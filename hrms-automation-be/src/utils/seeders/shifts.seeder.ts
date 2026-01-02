import prisma from '../../configs/prisma.client';

interface MockShift {
  name: string;
  code: string;
  start_time: string;
  end_time: string;
  break_duration: number;
  description: string;
  is_active: string;
}

const mockShifts: MockShift[] = [
  {
    name: 'Day Shift',
    code: 'DAY',
    start_time: '09:00',
    end_time: '18:00',
    break_duration: 60,
    description: 'Regular day shift from 9 AM to 6 PM',
    is_active: 'Y',
  },
  {
    name: 'Evening Shift',
    code: 'EVE',
    start_time: '14:00',
    end_time: '23:00',
    break_duration: 60,
    description: 'Evening shift from 2 PM to 11 PM',
    is_active: 'Y',
  },
  {
    name: 'Night Shift',
    code: 'NIGHT',
    start_time: '23:00',
    end_time: '08:00',
    break_duration: 60,
    description: 'Night shift from 11 PM to 8 AM',
    is_active: 'Y',
  },
  {
    name: 'Flexible Shift',
    code: 'FLEX',
    start_time: '10:00',
    end_time: '19:00',
    break_duration: 60,
    description: 'Flexible work hours',
    is_active: 'Y',
  },
  {
    name: 'Morning Shift',
    code: 'MORN',
    start_time: '06:00',
    end_time: '15:00',
    break_duration: 60,
    description: 'Morning shift from 6 AM to 3 PM',
    is_active: 'Y',
  },
];

export const seedShifts = async () => {
  console.log('🌱 Seeding shifts...');

  try {
    const existingCount = await prisma.shifts.count();
    
    if (existingCount > 0) {
      console.log('⏭️  Shifts already seeded. Skipping...');
      return;
    }

    for (const shift of mockShifts) {
      await prisma.shifts.create({
        data: {
          ...shift,
          createdby: 1,
          updatedby: 1,
        },
      });
    }

    console.log(`✅ Successfully seeded ${mockShifts.length} shifts`);
  } catch (error) {
    console.error('❌ Error seeding shifts:', error);
    throw error;
  }
};
