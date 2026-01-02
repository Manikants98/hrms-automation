import prisma from '../../configs/prisma.client';
import logger from '../../configs/logger';

interface MockPermission {
  name: string;
  module: string;
  action: string;
  description?: string;
  is_active: string;
}

const mockPermissions: MockPermission[] = [
  { name: 'users.create', module: 'users', action: 'create', description: 'Create new users', is_active: 'Y' },
  { name: 'users.read', module: 'users', action: 'read', description: 'View users', is_active: 'Y' },
  { name: 'users.update', module: 'users', action: 'update', description: 'Update users', is_active: 'Y' },
  { name: 'users.delete', module: 'users', action: 'delete', description: 'Delete users', is_active: 'Y' },
  
  { name: 'attendance.create', module: 'attendance', action: 'create', description: 'Create attendance records', is_active: 'Y' },
  { name: 'attendance.read', module: 'attendance', action: 'read', description: 'View attendance records', is_active: 'Y' },
  { name: 'attendance.update', module: 'attendance', action: 'update', description: 'Update attendance records', is_active: 'Y' },
  { name: 'attendance.delete', module: 'attendance', action: 'delete', description: 'Delete attendance records', is_active: 'Y' },
  
  { name: 'leaves.create', module: 'leaves', action: 'create', description: 'Create leave applications', is_active: 'Y' },
  { name: 'leaves.read', module: 'leaves', action: 'read', description: 'View leave applications', is_active: 'Y' },
  { name: 'leaves.update', module: 'leaves', action: 'update', description: 'Update leave applications', is_active: 'Y' },
  { name: 'leaves.delete', module: 'leaves', action: 'delete', description: 'Delete leave applications', is_active: 'Y' },
  { name: 'leaves.approve', module: 'leaves', action: 'approve', description: 'Approve leave applications', is_active: 'Y' },
  { name: 'leaves.reject', module: 'leaves', action: 'reject', description: 'Reject leave applications', is_active: 'Y' },
  
  { name: 'payroll.create', module: 'payroll', action: 'create', description: 'Create payroll records', is_active: 'Y' },
  { name: 'payroll.read', module: 'payroll', action: 'read', description: 'View payroll records', is_active: 'Y' },
  { name: 'payroll.update', module: 'payroll', action: 'update', description: 'Update payroll records', is_active: 'Y' },
  { name: 'payroll.delete', module: 'payroll', action: 'delete', description: 'Delete payroll records', is_active: 'Y' },
  { name: 'payroll.process', module: 'payroll', action: 'process', description: 'Process payroll', is_active: 'Y' },
  
  { name: 'recruitment.create', module: 'recruitment', action: 'create', description: 'Create job postings', is_active: 'Y' },
  { name: 'recruitment.read', module: 'recruitment', action: 'read', description: 'View job postings', is_active: 'Y' },
  { name: 'recruitment.update', module: 'recruitment', action: 'update', description: 'Update job postings', is_active: 'Y' },
  { name: 'recruitment.delete', module: 'recruitment', action: 'delete', description: 'Delete job postings', is_active: 'Y' },
  
  { name: 'candidates.create', module: 'candidates', action: 'create', description: 'Create candidates', is_active: 'Y' },
  { name: 'candidates.read', module: 'candidates', action: 'read', description: 'View candidates', is_active: 'Y' },
  { name: 'candidates.update', module: 'candidates', action: 'update', description: 'Update candidates', is_active: 'Y' },
  { name: 'candidates.delete', module: 'candidates', action: 'delete', description: 'Delete candidates', is_active: 'Y' },
  
  { name: 'departments.create', module: 'departments', action: 'create', description: 'Create departments', is_active: 'Y' },
  { name: 'departments.read', module: 'departments', action: 'read', description: 'View departments', is_active: 'Y' },
  { name: 'departments.update', module: 'departments', action: 'update', description: 'Update departments', is_active: 'Y' },
  { name: 'departments.delete', module: 'departments', action: 'delete', description: 'Delete departments', is_active: 'Y' },
  
  { name: 'roles.create', module: 'roles', action: 'create', description: 'Create roles', is_active: 'Y' },
  { name: 'roles.read', module: 'roles', action: 'read', description: 'View roles', is_active: 'Y' },
  { name: 'roles.update', module: 'roles', action: 'update', description: 'Update roles', is_active: 'Y' },
  { name: 'roles.delete', module: 'roles', action: 'delete', description: 'Delete roles', is_active: 'Y' },
  
  { name: 'reports.read', module: 'reports', action: 'read', description: 'View reports', is_active: 'Y' },
  { name: 'reports.export', module: 'reports', action: 'export', description: 'Export reports', is_active: 'Y' },
  
  { name: 'settings.read', module: 'settings', action: 'read', description: 'View settings', is_active: 'Y' },
  { name: 'settings.update', module: 'settings', action: 'update', description: 'Update settings', is_active: 'Y' },
];

export const seedPermissions = async () => {
  logger.info('🌱 Seeding permissions...');

  try {
    let permissionsCreated = 0;
    let permissionsSkipped = 0;

    for (const permission of mockPermissions) {
      const existingPermission = await prisma.permissions.findFirst({
        where: { name: permission.name },
      });

      if (!existingPermission) {
        await prisma.permissions.create({
          data: {
            name: permission.name,
            module: permission.module,
            action: permission.action,
            description: permission.description,
            is_active: permission.is_active,
            createdate: new Date(),
            createdby: 1,
          },
        });
        permissionsCreated++;
      } else {
        permissionsSkipped++;
      }
    }

    logger.info(
      `✅ Permissions seeded: ${permissionsCreated} created, ${permissionsSkipped} skipped`
    );
  } catch (error) {
    logger.error('Error seeding permissions:', error);
    throw error;
  }
};

export const clearPermissions = async () => {
  logger.info('Clearing permissions...');
  await prisma.permissions.deleteMany({
    where: {
      name: {
        in: mockPermissions.map(p => p.name),
      },
    },
  });
  logger.info('Permissions cleared.');
};
