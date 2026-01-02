import { Router } from 'express';
import { auditUpdate } from '../../middlewares/audit.middleware';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { attendanceController } from '../controllers/attendance.controller';

const router = Router();

router.get(
  '/attendance',
  authenticateToken,
  attendanceController.getAllAttendance
);

router.post(
  '/attendance/punch',
  authenticateToken,
  auditUpdate('attendance'),
  attendanceController.punch
);

router.get(
  '/attendance/punch/status',
  authenticateToken,
  attendanceController.getPunchStatus
);

export default router;
