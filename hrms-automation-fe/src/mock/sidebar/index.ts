import type { IconType } from 'react-icons';
import {
  MdAccessTime,
  MdAccountBalance,
  MdAssignment,
  MdAttachMoney,
  MdBarChart,
  MdFolder,
  MdPeople,
  MdPerson,
  MdPersonAdd,
  MdSettings,
} from 'react-icons/md';

export interface MenuItem {
  id: string;
  label: string;
  icon?: IconType;
  children?: MenuItem[];
  href?: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboards',
    label: 'Dashboards',
    children: [
      {
        id: 'hr-dashboard',
        label: 'HR Dashboard',
        icon: MdBarChart,
        href: '/dashboard',
      },
    ],
  },
  {
    id: 'masters',
    label: 'Masters',
    children: [
      {
        id: 'hiring-onboard',
        label: 'Hiring and Onboard',
        icon: MdPersonAdd,
        children: [
          {
            id: 'hiring-dashboard',
            label: 'Dashboard',
            href: '/hiring/dashboard',
          },
          {
            id: 'hiring-stages',
            label: 'Hiring Stages',
            href: '/hiring/hiring-stages',
          },
          {
            id: 'job-postings',
            label: 'Job Postings',
            href: '/hiring/job-postings',
          },
          {
            id: 'candidates',
            label: 'Candidates',
            href: '/hiring/candidates',
          },
        ],
      },
      {
        id: 'employees',
        label: 'Employees',
        icon: MdPeople,
        href: '/masters/employees',
      },
      {
        id: 'attendance',
        label: 'Attendance & Leaves',
        icon: MdAccessTime,
        children: [
          {
            id: 'attendance-dashboard',
            label: 'Dashboard',
            href: '/attendance/dashboard',
          },
          {
            id: 'attendance',
            label: 'Attendance',
            href: '/attendance/attendance',
          },
          {
            id: 'leave-application',
            label: 'Leave Application',
            href: '/attendance/leave-application',
          },
          {
            id: 'leave-balance',
            label: 'Leave Balance',
            href: '/attendance/leave-balance',
          },
        ],
      },
      {
        id: 'payroll',
        label: 'Payroll',
        icon: MdAccountBalance,
        children: [
          {
            id: 'payroll-dashboard',
            label: 'Dashboard',
            href: '/payroll/dashboard',
          },
          {
            id: 'salary-structure',
            label: 'Salary Structure',
            href: '/payroll/salary-structure',
          },
          {
            id: 'payroll-processing',
            label: 'Payroll Processing',
            href: '/payroll/processing',
          },
          {
            id: 'salary-slips',
            label: 'Salary Slips',
            href: '/payroll/salary-slips',
          },
        ],
      },
    ],
  },

  {
    id: 'reports',
    label: 'Reports',
    children: [
      {
        id: 'hiring-reports',
        label: 'Hiring Reports',
        icon: MdBarChart,
        href: '/reports/hiring',
      },
      {
        id: 'attendance-reports',
        label: 'Attendance Reports',
        icon: MdAccessTime,
        href: '/reports/attendance',
      },
      {
        id: 'payroll-reports',
        label: 'Payroll Reports',
        icon: MdAttachMoney,
        href: '/reports/payroll',
      },
      {
        id: 'employee-reports',
        label: 'Employee Reports',
        icon: MdPeople,
        href: '/reports/employees',
      },
      {
        id: 'leave-reports',
        label: 'Leave Reports',
        icon: MdAssignment,
        href: '/reports/leaves',
      },
      {
        id: 'audit-logs',
        label: 'Audit Logs',
        icon: MdFolder,
        href: '/reports/audit-logs',
      },
    ],
  },
  {
    id: 'users-management',
    label: 'Users Management',
    icon: MdPeople,
    children: [
      {
        id: 'users',
        label: 'Users',
        href: '/masters/users',
        icon: MdPerson,
      },
      {
        id: 'roles',
        label: 'Role & Permissions',
        href: '/masters/roles',
        icon: MdSettings,
      },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    children: [
      {
        id: 'profile',
        label: 'My Profile',
        icon: MdPerson,
        href: '/profile',
      },
      {
        id: 'login-history',
        label: 'Login History',
        icon: MdAssignment,
        href: '/settings/login-history',
      },
      {
        id: 'system-settings',
        label: 'System Settings',
        icon: MdSettings,
        href: '/settings/system',
      },
    ],
  },
];

export default menuItems;
