import prisma from '../../configs/prisma.client';
import logger from '../../configs/logger';

interface MockAttendance {
  user_id: number;
  attendance_date: Date;
  punch_in_time: Date;
  punch_out_time?: Date;
  total_hours?: number;
  work_type: string;
  status: string;
  remarks?: string;
  is_active: string;
}

const generateAttendanceRecords = (): MockAttendance[] => {
  const records: MockAttendance[] = [];
  const today = new Date();
  const userIds = [2, 3, 4, 5, 6];
  
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    date.setHours(0, 0, 0, 0);
    
    userIds.forEach((userId, index) => {
      const punchInTime = new Date(date);
      punchInTime.setHours(9 + (index % 3) * 0.25, (index * 5) % 60, 0, 0);
      
      const punchOutTime = new Date(date);
      punchOutTime.setHours(18 + (index % 3) * 0.25, (index * 5) % 60, 0, 0);
      
      let status = 'Present';
      let totalHours = 9;
      let punchOut: Date | undefined = punchOutTime;
      let remarks = '';
      
      const random = (dayOffset + index) % 10;
      if (random === 0) {
        status = 'Absent';
        punchOut = undefined;
        totalHours = 0;
        remarks = 'Sick leave';
      } else if (random === 1) {
        status = 'Leave';
        punchOut = undefined;
        totalHours = 0;
        remarks = 'Annual leave';
      } else if (random === 2) {
        status = 'Half Day';
        punchOut = new Date(date);
        punchOut.setHours(13, 0, 0, 0);
        totalHours = 4;
        remarks = 'Personal work';
      }
      
      records.push({
        user_id: userId,
        attendance_date: date,
        punch_in_time: punchInTime,
        punch_out_time: punchOut,
        total_hours: totalHours,
        work_type: 'office',
        status: status,
        remarks: remarks,
        is_active: 'Y',
      });
    });
  }
  
  return records;
};

export const seedAttendance = async () => {
  logger.info('🌱 Seeding attendance records...');

  try {
    const users = await prisma.users.findMany({
      where: { is_active: 'Y', role_id: { not: 1 } },
      take: 5,
    });

    if (users.length === 0) {
      logger.warn('No users found. Skipping attendance seeding.');
      return;
    }

    const attendanceRecords = generateAttendanceRecords();
    let recordsCreated = 0;
    let recordsSkipped = 0;

    for (const record of attendanceRecords) {
      const user = users.find(u => u.id === record.user_id) || users[0];
      
      const existingRecord = await prisma.attendance.findFirst({
        where: {
          user_id: user.id,
          attendance_date: record.attendance_date,
        },
      });

      if (!existingRecord) {
        await prisma.attendance.create({
          data: {
            user_id: user.id,
            attendance_date: record.attendance_date,
            punch_in_time: record.punch_in_time,
            punch_out_time: record.punch_out_time,
            total_hours: record.total_hours,
            work_type: record.work_type,
            status: record.status,
            remarks: record.remarks,
            is_active: record.is_active,
            createdate: new Date(),
            createdby: 1,
          },
        });
        recordsCreated++;
      } else {
        recordsSkipped++;
      }
    }

    logger.info(
      `✅ Attendance records seeded: ${recordsCreated} created, ${recordsSkipped} skipped`
    );
  } catch (error) {
    logger.error('Error seeding attendance:', error);
    throw error;
  }
};

export const clearAttendance = async () => {
  logger.info('Clearing attendance records...');
  await prisma.attendance.deleteMany({});
  logger.info('Attendance records cleared.');
};
