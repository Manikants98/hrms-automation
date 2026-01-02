import prisma from '../../configs/prisma.client';
import logger from '../../configs/logger';

interface MockLeaveApplication {
  employee_id: number;
  leave_type_id: number;
  start_date: Date;
  end_date: Date;
  total_days: number;
  reason: string;
  approval_status: string;
  approved_by?: number;
  approved_date?: Date;
  rejection_reason?: string;
  is_active: string;
}

const mockLeaveApplications: Omit<MockLeaveApplication, 'employee_id' | 'leave_type_id' | 'approved_by'>[] = [
  {
    start_date: new Date('2025-02-01'),
    end_date: new Date('2025-02-05'),
    total_days: 5,
    reason: 'Family vacation',
    approval_status: 'Pending',
    is_active: 'Y',
  },
  {
    start_date: new Date('2025-01-20'),
    end_date: new Date('2025-01-21'),
    total_days: 2,
    reason: 'Medical appointment',
    approval_status: 'Approved',
    approved_date: new Date('2025-01-16'),
    is_active: 'Y',
  },
  {
    start_date: new Date('2025-01-25'),
    end_date: new Date('2025-01-25'),
    total_days: 1,
    reason: 'Personal work',
    approval_status: 'Rejected',
    approved_date: new Date('2025-01-16'),
    rejection_reason: 'Insufficient leave balance',
    is_active: 'Y',
  },
  {
    start_date: new Date('2025-02-10'),
    end_date: new Date('2025-02-12'),
    total_days: 3,
    reason: 'Personal vacation',
    approval_status: 'Pending',
    is_active: 'Y',
  },
  {
    start_date: new Date('2025-01-18'),
    end_date: new Date('2025-01-18'),
    total_days: 1,
    reason: 'Fever and cold',
    approval_status: 'Approved',
    approved_date: new Date('2025-01-17'),
    is_active: 'Y',
  },
];

export const seedLeaveApplications = async () => {
  logger.info('🌱 Seeding leave applications...');

  try {
    const employees = await prisma.users.findMany({
      where: { is_active: 'Y', role_id: { not: 1 } },
      take: 5,
    });

    const leaveTypes = await prisma.leave_types.findMany({
      where: { is_active: 'Y' },
    });

    const approver = await prisma.users.findFirst({
      where: { role_id: { in: [3, 7] } },
    });

    if (employees.length === 0 || leaveTypes.length === 0) {
      logger.warn('No employees or leave types found. Skipping leave applications seeding.');
      return;
    }

    let applicationsCreated = 0;
    let applicationsSkipped = 0;

    for (let i = 0; i < mockLeaveApplications.length; i++) {
      const application = mockLeaveApplications[i];
      const employee = employees[i % employees.length];
      const leaveType = leaveTypes[i % leaveTypes.length];

      const existingApplication = await prisma.leave_applications.findFirst({
        where: {
          employee_id: employee.id,
          start_date: application.start_date,
          end_date: application.end_date,
        },
      });

      if (!existingApplication) {
        await prisma.leave_applications.create({
          data: {
            employee_id: employee.id,
            leave_type_id: leaveType.id,
            start_date: application.start_date,
            end_date: application.end_date,
            total_days: application.total_days,
            reason: application.reason,
            approval_status: application.approval_status,
            approved_by: application.approval_status !== 'Pending' ? (approver?.id ?? null) : null,
            approved_date: application.approved_date,
            rejection_reason: application.rejection_reason,
            is_active: application.is_active,
            createdate: new Date(),
            createdby: employee.id,
          },
        });
        applicationsCreated++;
      } else {
        applicationsSkipped++;
      }
    }

    logger.info(
      `✅ Leave applications seeded: ${applicationsCreated} created, ${applicationsSkipped} skipped`
    );
  } catch (error) {
    logger.error('Error seeding leave applications:', error);
    throw error;
  }
};

export const clearLeaveApplications = async () => {
  logger.info('Clearing leave applications...');
  await prisma.leave_applications.deleteMany({});
  logger.info('Leave applications cleared.');
};
