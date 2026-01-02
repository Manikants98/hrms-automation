import { Router } from 'express';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import { reportsController } from '../controllers/reports.controller';

const router = Router();

router.get(
  '/reports/attendance',
  authenticateToken,
  requirePermission([{ module: 'report', action: 'read' }]),
  reportsController.getAttendanceReport
);

router.get(
  '/reports/leaves',
  authenticateToken,
  requirePermission([{ module: 'report', action: 'read' }]),
  reportsController.getLeaveReport
);

router.get(
  '/reports/payroll',
  authenticateToken,
  requirePermission([{ module: 'report', action: 'read' }]),
  reportsController.getPayrollReport
);

router.get(
  '/reports/hiring',
  authenticateToken,
  requirePermission([{ module: 'report', action: 'read' }]),
  reportsController.getHiringReport
);

router.get(
  '/reports/employees',
  authenticateToken,
  requirePermission([{ module: 'report', action: 'read' }]),
  reportsController.getEmployeeReport
);

export default router;
