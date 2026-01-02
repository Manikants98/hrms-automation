import prisma from '../../configs/prisma.client';
import logger from '../../configs/logger';

interface MockNotification {
  user_id: number;
  type: string;
  category: string;
  title: string;
  message: string;
  data?: string;
  is_read: string;
  priority: string;
  action_url?: string;
  expires_at?: Date;
}

const notificationTemplates = [
  {
    type: 'leave',
    category: 'approval',
    title: 'Leave Application Approved',
    message: 'Your leave application has been approved by your manager.',
    priority: 'high',
    action_url: '/leaves/applications',
  },
  {
    type: 'leave',
    category: 'request',
    title: 'New Leave Application',
    message: 'A new leave application requires your approval.',
    priority: 'high',
    action_url: '/leaves/approvals',
  },
  {
    type: 'attendance',
    category: 'reminder',
    title: 'Attendance Reminder',
    message: 'Please mark your attendance for today.',
    priority: 'medium',
    action_url: '/attendance',
  },
  {
    type: 'payroll',
    category: 'info',
    title: 'Salary Slip Generated',
    message: 'Your salary slip for this month has been generated.',
    priority: 'medium',
    action_url: '/payroll/salary-slips',
  },
  {
    type: 'recruitment',
    category: 'info',
    title: 'New Job Posting',
    message: 'A new job position has been posted.',
    priority: 'low',
    action_url: '/recruitment/job-postings',
  },
  {
    type: 'system',
    category: 'announcement',
    title: 'System Maintenance',
    message: 'System maintenance scheduled for this weekend.',
    priority: 'high',
    action_url: '/announcements',
  },
];

export const seedNotifications = async () => {
  logger.info('🌱 Seeding notifications...');

  try {
    const users = await prisma.users.findMany({
      where: { is_active: 'Y' },
      take: 10,
    });

    if (users.length === 0) {
      logger.warn('No users found. Skipping notifications seeding.');
      return;
    }

    let notificationsCreated = 0;

    for (const user of users) {
      const numNotifications = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < numNotifications; i++) {
        const template = notificationTemplates[i % notificationTemplates.length];
        const isRead = Math.random() > 0.5 ? 'Y' : 'N';
        
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await prisma.notifications.create({
          data: {
            user_id: user.id,
            type: template.type,
            category: template.category,
            title: template.title,
            message: template.message,
            data: JSON.stringify({ user_id: user.id }),
            is_read: isRead,
            priority: template.priority,
            action_url: template.action_url,
            expires_at: expiresAt,
            createdate: new Date(),
            read_at: isRead === 'Y' ? new Date() : null,
            createdby: 1,
          },
        });
        notificationsCreated++;
      }
    }

    logger.info(
      `✅ Notifications seeded: ${notificationsCreated} created`
    );
  } catch (error) {
    logger.error('Error seeding notifications:', error);
    throw error;
  }
};

export const clearNotifications = async () => {
  logger.info('Clearing notifications...');
  await prisma.notifications.deleteMany({});
  logger.info('Notifications cleared.');
};
