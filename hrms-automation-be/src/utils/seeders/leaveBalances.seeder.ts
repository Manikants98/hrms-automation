import prisma from '../../configs/prisma.client';
import logger from '../../configs/logger';

export const seedLeaveBalances = async () => {
  logger.info('🌱 Seeding leave balances...');

  try {
    const employees = await prisma.users.findMany({
      where: { is_active: 'Y', role_id: { not: 1 } },
    });

    const leaveTypes = await prisma.leave_types.findMany({
      where: { is_active: 'Y' },
    });

    if (employees.length === 0 || leaveTypes.length === 0) {
      logger.warn('No employees or leave types found. Skipping leave balances seeding.');
      return;
    }

    const currentYear = new Date().getFullYear();
    let balancesCreated = 0;
    let balancesSkipped = 0;

    for (const employee of employees) {
      for (const leaveType of leaveTypes) {
        const existingBalance = await prisma.leave_balances.findFirst({
          where: {
            employee_id: employee.id,
            leave_type_id: leaveType.id,
            year: currentYear,
          },
        });

        if (!existingBalance) {
          const totalAllocated = leaveType.max_days_per_year || 12;
          const used = Math.floor(Math.random() * 5);
          const balance = totalAllocated - used;

          await prisma.leave_balances.create({
            data: {
              employee_id: employee.id,
              leave_type_id: leaveType.id,
              total_allocated: totalAllocated,
              used: used,
              balance: balance,
              year: currentYear,
              is_active: 'Y',
              createdate: new Date(),
              createdby: 1,
            },
          });
          balancesCreated++;
        } else {
          balancesSkipped++;
        }
      }
    }

    logger.info(
      `✅ Leave balances seeded: ${balancesCreated} created, ${balancesSkipped} skipped`
    );
  } catch (error) {
    logger.error('Error seeding leave balances:', error);
    throw error;
  }
};

export const clearLeaveBalances = async () => {
  logger.info('Clearing leave balances...');
  await prisma.leave_balances.deleteMany({});
  logger.info('Leave balances cleared.');
};
