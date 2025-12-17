import ProtectedRoute from 'components/ProtectedRoute';
import PermissionGuard from 'shared/PermissionGuard';
import Layout from 'layout';
import Login from 'pages/auth/Login';
import PrivacyPolicy from 'pages/auth/PrivacyPolicy';
import HRDashboard from 'pages/dashboard';
import LoginHistoryPage from 'pages/masters/LoginHistory';
import RolePermissions from 'pages/masters/RolePermissions';
import Users from 'pages/masters/Users';
import UserDetail from 'pages/masters/Users/UserDetail';
import NotFound from 'pages/NotFound';
import Unauthorized from 'pages/Unauthorized';
import Profile from 'pages/Profile';
import AttendanceReports from 'pages/reports/AttendanceReports';
import AuditLogs from 'pages/reports/AuditLogs';
import EmployeeReports from 'pages/reports/EmployeeReports';
import HiringReports from 'pages/reports/HiringReports';
import LeaveReports from 'pages/reports/LeaveReports';
import PayrollReports from 'pages/reports/PayrollReports';
import SystemSettings from 'pages/settings/SystemSettings';
import AttendanceDashboard from 'pages/attendance/Dashboard';
import Attendance from 'pages/attendance/Attendance';
import LeaveApplication from 'pages/attendance/LeaveApplication';
import LeaveBalance from 'pages/attendance/LeaveBalance';
import HiringDashboard from 'pages/hiring/Dashboard';
import HiringStages from 'pages/hiring/HiringStages';
import JobPostings from 'pages/hiring/JobPostings';
import Candidates from 'pages/hiring/Candidates';
import Employees from 'pages/masters/Employees';
import PayrollDashboard from 'pages/payroll/Dashboard';
import SalaryStructure from 'pages/payroll/SalaryStructure';
import PayrollProcessing from 'pages/payroll/Processing';
import SalarySlips from 'pages/payroll/SalarySlips';
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter(
  [
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/privacy-policy',
      element: <PrivacyPolicy />,
    },
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: '/',
          element: <HRDashboard />,
        },
        {
          path: '/dashboard',
          element: <HRDashboard />,
        },
        {
          path: '/hiring/dashboard',
          element: <HiringDashboard />,
        },
        {
          path: '/hiring/hiring-stages',
          element: <HiringStages />,
        },
        {
          path: '/hiring/job-postings',
          element: <JobPostings />,
        },
        {
          path: '/hiring/candidates',
          element: <Candidates />,
        },
        {
          path: '/masters/employees',
          element: <Employees />,
        },
        {
          path: '/attendance/dashboard',
          element: <AttendanceDashboard />,
        },
        {
          path: '/attendance/attendance',
          element: <Attendance />,
        },
        {
          path: '/attendance/leave-application',
          element: <LeaveApplication />,
        },
        {
          path: '/attendance/leave-balance',
          element: <LeaveBalance />,
        },
        {
          path: '/payroll/dashboard',
          element: <PayrollDashboard />,
        },
        {
          path: '/payroll/salary-structure',
          element: <SalaryStructure />,
        },
        {
          path: '/payroll/processing',
          element: <PayrollProcessing />,
        },
        {
          path: '/payroll/salary-slips',
          element: <SalarySlips />,
        },
        {
          path: '/reports/hiring',
          element: <HiringReports />,
        },
        {
          path: '/reports/attendance',
          element: <AttendanceReports />,
        },
        {
          path: '/reports/payroll',
          element: <PayrollReports />,
        },
        {
          path: '/reports/employees',
          element: <EmployeeReports />,
        },
        {
          path: '/reports/leaves',
          element: <LeaveReports />,
        },
        {
          path: '/reports/audit-logs',
          element: <AuditLogs />,
        },
        {
          path: '/masters/users',
          element: (
            <PermissionGuard module="user" action="read">
              <Users />
            </PermissionGuard>
          ),
        },
        {
          path: '/masters/users/:id',
          element: (
            <PermissionGuard module="user" action="read">
              <UserDetail />
            </PermissionGuard>
          ),
        },
        {
          path: '/masters/roles',
          element: (
            <PermissionGuard module="role" action="read">
              <RolePermissions />
            </PermissionGuard>
          ),
        },
        {
          path: '/settings/login-history',
          element: (
            <PermissionGuard module="login-history" action="read">
              <LoginHistoryPage />
            </PermissionGuard>
          ),
        },
        {
          path: '/settings/system',
          element: (
            <PermissionGuard module="setting" action="read">
              <SystemSettings />
            </PermissionGuard>
          ),
        },
        {
          path: '/profile',
          element: (
            <PermissionGuard module="profile" action="read">
              <Profile />
            </PermissionGuard>
          ),
        },
        {
          path: '/unauthorized',
          element: <Unauthorized />,
        },
        {
          path: '*',
          element: <NotFound />,
        },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
