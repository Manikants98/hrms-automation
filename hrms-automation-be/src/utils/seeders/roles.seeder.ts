/**
 * @fileoverview Roles Seeder
 * @description Creates HRMS-specific roles for testing and development
 * @author HRMS Team
 * @version 1.0.0
 */

import prisma from '../../configs/prisma.client';

/**
 * @interface MockRole
 * @description Role data structure for seeding
 */
interface MockRole {
  name: string;
  description?: string;
  is_active: string;
  permissions?: string[];
}

/**
 * @constant mockRoles
 * @description Array of HRMS roles with their associated permissions
 * @type {MockRole[]}
 */
const mockRoles: MockRole[] = [
  {
    name: 'Super Admin',
    description: 'Full system access with all permissions',
    is_active: 'Y',
    permissions: ['*'],
  },
  {
    name: 'HR Admin',
    description: 'Human Resources administration with full HR module access',
    is_active: 'Y',
    permissions: ['*'],
  },
  {
    name: 'HR Manager',
    description: 'HR management role with oversight and reporting permissions',
    is_active: 'Y',
    permissions: ['*'],
  },
  {
    name: 'HR Executive',
    description: 'HR operations and employee management',
    is_active: 'Y',
    permissions: ['*'],
  },
  {
    name: 'Recruitment Manager',
    description: 'Recruitment and hiring process management',
    is_active: 'Y',
    permissions: ['*'],
  },
  {
    name: 'Recruiter',
    description: 'Job posting, candidate screening and hiring operations',
    is_active: 'Y',
    permissions: ['*'],
  },
  {
    name: 'Payroll Manager',
    description: 'Payroll processing, salary structure and financial reporting',
    is_active: 'Y',
    permissions: ['*'],
  },
  {
    name: 'Payroll Staff',
    description: 'Payroll data entry and processing operations',
    is_active: 'Y',
    permissions: ['*'],
  },
  {
    name: 'Attendance Manager',
    description: 'Attendance tracking, leave management and reporting',
    is_active: 'Y',
    permissions: ['*'],
  },
  {
    name: 'Department Head',
    description: 'Department management with team oversight and approvals',
    is_active: 'Y',
    permissions: ['*'],
  },
  {
    name: 'Supervisor',
    description: 'Team supervision with attendance and leave approvals',
    is_active: 'Y',
    permissions: ['*'],
  },
  {
    name: 'Employee',
    description: 'Employee self-service for attendance, leaves and profile',
    is_active: 'Y',
    permissions: ['*'],
  },
];

/**
 * @function seedRoles
 * @description Seeds roles table with mock roles data and assigns permissions
 * @description Creates roles if they don't exist and updates permissions if needed
 * @returns {Promise<void>}
 * @throws {Error} If seeding fails
 */
export async function seedRoles(): Promise<void> {
  try {
    for (const role of mockRoles) {
      const existingRole = await prisma.roles.findFirst({
        where: { name: role.name },
      });

      let roleId: number;

      if (!existingRole) {
        const newRole = await prisma.roles.create({
          data: {
            name: role.name,
            description: role.description,
            is_active: role.is_active,
            createdate: new Date(),
            role_key: role.name.toLowerCase().replace(/ /g, '_'),
            createdby: 1,
            log_inst: 1,
          },
        });
        roleId = newRole.id;
      } else {
        roleId = existingRole.id;
      }

      if (role.permissions && role.permissions.length > 0) {
        const needsUpdate = await checkIfPermissionsNeedUpdate(
          roleId,
          role.permissions
        );
        if (needsUpdate) {
          await assignPermissionsToRole(roleId, role.permissions);
        }
      }
    }
  } catch (error) {
    throw error;
  }
}

/**
 * @function checkIfPermissionsNeedUpdate
 * @description Checks if a role's current permissions match the expected permissions
 * @param {number} roleId - The ID of the role to check
 * @param {string[]} expectedPermissionNames - Array of expected permission names (or ['*'] for all)
 * @returns {Promise<boolean>} True if permissions need updating, false otherwise
 */
async function checkIfPermissionsNeedUpdate(
  roleId: number,
  expectedPermissionNames: string[]
): Promise<boolean> {
  try {
    if (expectedPermissionNames.includes('*')) {
      const allPermissions = await prisma.permissions.findMany({
        where: { is_active: 'Y' },
        select: { id: true },
      });

      const expectedPermissionIds = allPermissions.map(p => p.id).sort();

      const currentRolePermissions = await prisma.role_permissions.findMany({
        where: {
          role_id: roleId,
          is_active: 'Y',
        },
        select: { permission_id: true },
      });

      const currentPermissionIds = currentRolePermissions
        .map(rp => rp.permission_id)
        .sort();

      if (expectedPermissionIds.length !== currentPermissionIds.length) {
        return true;
      }

      for (let i = 0; i < expectedPermissionIds.length; i++) {
        if (expectedPermissionIds[i] !== currentPermissionIds[i]) {
          return true;
        }
      }

      return false;
    }

    const expectedPermissions = await prisma.permissions.findMany({
      where: {
        name: { in: expectedPermissionNames },
        is_active: 'Y',
      },
      select: { id: true },
    });

    const expectedPermissionIds = expectedPermissions.map(p => p.id).sort();

    const currentRolePermissions = await prisma.role_permissions.findMany({
      where: {
        role_id: roleId,
        is_active: 'Y',
      },
      select: { permission_id: true },
    });

    const currentPermissionIds = currentRolePermissions
      .map(rp => rp.permission_id)
      .sort();

    if (expectedPermissionIds.length !== currentPermissionIds.length) {
      return true;
    }

    for (let i = 0; i < expectedPermissionIds.length; i++) {
      if (expectedPermissionIds[i] !== currentPermissionIds[i]) {
        return true;
      }
    }

    return false;
  } catch (error) {
    return true;
  }
}

/**
 * @function assignPermissionsToRole
 * @description Assigns permissions to a role by permission names
 * @description Supports '*' wildcard to assign all active permissions
 * @param {number} roleId - The ID of the role to assign permissions to
 * @param {string[]} permissionNames - Array of permission names or ['*'] for all permissions
 * @returns {Promise<void>}
 * @throws {Error} If assignment fails
 */
async function assignPermissionsToRole(
  roleId: number,
  permissionNames: string[]
): Promise<void> {
  try {
    if (permissionNames.includes('*')) {
      const allPermissions = await prisma.permissions.findMany({
        where: { is_active: 'Y' },
        select: { id: true },
      });

      const permissionIds = allPermissions.map(p => p.id);
      await assignPermissionIdsToRole(roleId, permissionIds);
      return;
    }

    const permissions = await prisma.permissions.findMany({
      where: {
        name: { in: permissionNames },
        is_active: 'Y',
      },
      select: { id: true, name: true },
    });

    const permissionIds = permissions.map(p => p.id);
    await assignPermissionIdsToRole(roleId, permissionIds);
  } catch (error) {
    throw error;
  }
}

/**
 * @function assignPermissionIdsToRole
 * @description Assigns permissions to a role by permission IDs
 * @description Deletes existing role permissions before assigning new ones
 * @param {number} roleId - The ID of the role to assign permissions to
 * @param {number[]} permissionIds - Array of permission IDs to assign
 * @returns {Promise<void>}
 */
async function assignPermissionIdsToRole(
  roleId: number,
  permissionIds: number[]
): Promise<void> {
  await prisma.role_permissions.deleteMany({
    where: { role_id: roleId },
  });

  if (permissionIds.length > 0) {
    const rolePermissions = permissionIds.map(permissionId => ({
      role_id: roleId,
      permission_id: permissionId,
      is_active: 'Y',
      createdate: new Date(),
      createdby: 1,
      log_inst: 1,
    }));

    await prisma.role_permissions.createMany({
      data: rolePermissions,
    });
  }
}

/**
 * @function clearRoles
 * @description Clears all role_permissions from the database
 * @description Note: Does not delete roles themselves, only their permission assignments
 * @returns {Promise<void>}
 * @throws {Error} If clearing fails
 */
export async function clearRoles(): Promise<void> {
  try {
    await prisma.role_permissions.deleteMany({});
  } catch (error) {
    throw error;
  }
}

/**
 * @exports mockRoles
 * @description Exported mock roles array for use in other modules
 */
export { mockRoles };
