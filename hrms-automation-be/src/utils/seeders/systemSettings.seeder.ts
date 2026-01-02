import prisma from '../../configs/prisma.client';
import logger from '../../configs/logger';

interface MockSystemSetting {
  key_name: string;
  key_value: string;
  value_type: string;
  description?: string;
  is_active: string;
}

const mockSystemSettings: MockSystemSetting[] = [
  {
    key_name: 'company_name',
    key_value: 'HRMS Company',
    value_type: 'string',
    description: 'Company name displayed in the system',
    is_active: 'Y',
  },
  {
    key_name: 'working_hours_per_day',
    key_value: '9',
    value_type: 'number',
    description: 'Standard working hours per day',
    is_active: 'Y',
  },
  {
    key_name: 'working_days_per_week',
    key_value: '5',
    value_type: 'number',
    description: 'Standard working days per week',
    is_active: 'Y',
  },
  {
    key_name: 'currency',
    key_value: 'USD',
    value_type: 'string',
    description: 'Default currency code',
    is_active: 'Y',
  },
  {
    key_name: 'date_format',
    key_value: 'YYYY-MM-DD',
    value_type: 'string',
    description: 'Date format used in the system',
    is_active: 'Y',
  },
  {
    key_name: 'time_format',
    key_value: '24h',
    value_type: 'string',
    description: 'Time format (12h or 24h)',
    is_active: 'Y',
  },
  {
    key_name: 'timezone',
    key_value: 'UTC',
    value_type: 'string',
    description: 'System timezone',
    is_active: 'Y',
  },
  {
    key_name: 'leave_approval_required',
    key_value: 'true',
    value_type: 'boolean',
    description: 'Whether leave applications require approval',
    is_active: 'Y',
  },
  {
    key_name: 'max_leave_days_per_request',
    key_value: '30',
    value_type: 'number',
    description: 'Maximum number of leave days per request',
    is_active: 'Y',
  },
  {
    key_name: 'probation_period_days',
    key_value: '90',
    value_type: 'number',
    description: 'Probation period in days for new employees',
    is_active: 'Y',
  },
  {
    key_name: 'notice_period_days',
    key_value: '30',
    value_type: 'number',
    description: 'Standard notice period in days',
    is_active: 'Y',
  },
  {
    key_name: 'late_arrival_grace_minutes',
    key_value: '15',
    value_type: 'number',
    description: 'Grace period for late arrival in minutes',
    is_active: 'Y',
  },
  {
    key_name: 'enable_notifications',
    key_value: 'true',
    value_type: 'boolean',
    description: 'Enable system notifications',
    is_active: 'Y',
  },
  {
    key_name: 'enable_email_notifications',
    key_value: 'true',
    value_type: 'boolean',
    description: 'Enable email notifications',
    is_active: 'Y',
  },
  {
    key_name: 'payroll_processing_day',
    key_value: '25',
    value_type: 'number',
    description: 'Day of month for payroll processing',
    is_active: 'Y',
  },
];

export const seedSystemSettings = async () => {
  logger.info('🌱 Seeding system settings...');

  try {
    let settingsCreated = 0;
    let settingsSkipped = 0;

    for (const setting of mockSystemSettings) {
      const existingSetting = await prisma.system_settings.findFirst({
        where: { key_name: setting.key_name },
      });

      if (!existingSetting) {
        await prisma.system_settings.create({
          data: {
            key_name: setting.key_name,
            key_value: setting.key_value,
            value_type: setting.value_type,
            description: setting.description,
            is_active: setting.is_active,
            createdate: new Date(),
            createdby: 1,
          },
        });
        settingsCreated++;
      } else {
        settingsSkipped++;
      }
    }

    logger.info(
      `✅ System settings seeded: ${settingsCreated} created, ${settingsSkipped} skipped`
    );
  } catch (error) {
    logger.error('Error seeding system settings:', error);
    throw error;
  }
};

export const clearSystemSettings = async () => {
  logger.info('Clearing system settings...');
  await prisma.system_settings.deleteMany({
    where: {
      key_name: {
        in: mockSystemSettings.map(s => s.key_name),
      },
    },
  });
  logger.info('System settings cleared.');
};
