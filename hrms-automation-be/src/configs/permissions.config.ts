export type Modules =
  | 'user'
  | 'role'
  | 'permission'
  | 'company'
  | 'department'
  | 'designation'
  | 'shift'
  | 'attendance'
  | 'leave-type'
  | 'leave-application'
  | 'leave-balance'
  | 'salary-structure'
  | 'payroll-processing'
  | 'salary-slip'
  | 'hiring-stage'
  | 'attachment-type'
  | 'job-posting'
  | 'candidate'
  | 'login-history'
  | 'api-token'
  | 'notification'
  | 'setting'
  | 'audit-log'
  | 'report'
  | 'workflow'
  | 'approval'
  | 'profile';

export type Actions = 'create' | 'read' | 'update' | 'delete';

export interface PermissionCheck {
  module: Modules;
  action: Actions;
}

export const buildPermissionName = (
  module: Modules,
  action: Actions
): string => {
  const moduleKey = module.toLowerCase().replace(/-/g, '_');
  const actionKey = action.toLowerCase();
  return `${moduleKey}_${actionKey}`;
};

export const isAdminRole = (roleName: string): boolean => {
  const roleLower = roleName.toLowerCase();
  return roleLower.includes('admin') || roleLower.includes('super admin');
};

const hasPermission = (
  userPermissions: string[],
  permissionName: string
): boolean => {
  if (userPermissions.includes('*')) {
    return true;
  }
  return userPermissions.includes(permissionName);
};

const hasModulePermission = (
  userPermissions: string[],
  module: Modules,
  action: Actions
): boolean => {
  const permissionName = buildPermissionName(module, action);
  return hasPermission(userPermissions, permissionName);
};

export const hasAnyModulePermissions = (
  userPermissions: string[],
  permissions: Array<{ module: Modules; action: Actions }>
): boolean => {
  if (userPermissions.includes('*')) {
    return true;
  }
  return permissions.some(p =>
    hasModulePermission(userPermissions, p.module, p.action)
  );
};

export const hasAllModulePermissions = (
  userPermissions: string[],
  permissions: Array<{ module: Modules; action: Actions }>
): boolean => {
  if (userPermissions.includes('*')) {
    return true;
  }
  return permissions.every(p =>
    hasModulePermission(userPermissions, p.module, p.action)
  );
};

const MODULE_DISPLAY_NAMES: Record<string, string> = {
  user: 'User',
  role: 'Role',
  permission: 'Permission',
  company: 'Company',
  department: 'Department',
  designation: 'Designation',
  shift: 'Shift',
  attendance: 'Attendance',
  'leave-type': 'Leave Type',
  'leave-application': 'Leave Application',
  'leave-balance': 'Leave Balance',
  'salary-structure': 'Salary Structure',
  'payroll-processing': 'Payroll Processing',
  'salary-slip': 'Salary Slip',
  'hiring-stage': 'Hiring Stage',
  'attachment-type': 'Attachment Type',
  'job-posting': 'Job Posting',
  candidate: 'Candidate',
  'login-history': 'Login History',
  'api-token': 'API Token',
  notification: 'Notification',
  setting: 'Setting',
  'audit-log': 'Audit Log',
  report: 'Report',
  workflow: 'Workflow',
  approval: 'Approval',
  profile: 'Profile',
};

const ACTION_DISPLAY_NAMES: Record<string, string> = {
  read: 'read',
  create: 'create',
  update: 'update',
  delete: 'delete',
  import: 'import',
  export: 'export',
  approve: 'approve',
  reject: 'reject',
};

export const formatPermissionErrorMessage = (
  permissions: Array<{ module: Modules; action: Actions }>
): string => {
  if (permissions.length === 0) {
    return "You don't have permission to access this resource.";
  }

  if (permissions.length === 1) {
    const { module, action } = permissions[0];
    const moduleName = MODULE_DISPLAY_NAMES[module] || module;
    const actionName = ACTION_DISPLAY_NAMES[action] || action;
    return `You don't have permission for ${actionName} the ${moduleName}.`;
  }

  const permissionDescriptions = permissions.map(({ module, action }) => {
    const moduleName = MODULE_DISPLAY_NAMES[module] || module;
    const actionName = ACTION_DISPLAY_NAMES[action] || action;
    return `${actionName} ${moduleName}`;
  });

  const lastPermission = permissionDescriptions.pop();
  const permissionsList =
    permissionDescriptions.join(', ') + ` or ${lastPermission}`;

  return `You don't have permission to ${permissionsList}.`;
};
