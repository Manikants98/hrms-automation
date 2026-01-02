import { Router } from 'express';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { leaveApplicationsController } from '../controllers/leaveApplications.controller';
import {
  createLeaveApplicationValidation,
  updateLeaveApplicationValidation,
  rejectLeaveApplicationValidation,
} from '../validations/leaveApplications.validation';

const router = Router();

router.post(
  '/leave-applications',
  authenticateToken,
  auditCreate('leave_applications'),
  requirePermission([{ module: 'leave-application', action: 'create' }]),
  createLeaveApplicationValidation,
  leaveApplicationsController.createLeaveApplication
);

router.get(
  '/leave-applications',
  authenticateToken,
  requirePermission([{ module: 'leave-application', action: 'read' }]),
  leaveApplicationsController.getLeaveApplications
);

router.get(
  '/leave-applications/:id',
  authenticateToken,
  requirePermission([{ module: 'leave-application', action: 'read' }]),
  leaveApplicationsController.getLeaveApplicationById
);

router.put(
  '/leave-applications/:id',
  authenticateToken,
  auditUpdate('leave_applications'),
  requirePermission([{ module: 'leave-application', action: 'update' }]),
  updateLeaveApplicationValidation,
  leaveApplicationsController.updateLeaveApplication
);

router.delete(
  '/leave-applications/:id',
  authenticateToken,
  auditDelete('leave_applications'),
  requirePermission([{ module: 'leave-application', action: 'delete' }]),
  leaveApplicationsController.deleteLeaveApplication
);

router.post(
  '/leave-applications/:id/approve',
  authenticateToken,
  auditUpdate('leave_applications'),
  requirePermission([{ module: 'leave-application', action: 'update' }]),
  leaveApplicationsController.approveLeaveApplication
);

router.post(
  '/leave-applications/:id/reject',
  authenticateToken,
  auditUpdate('leave_applications'),
  requirePermission([{ module: 'leave-application', action: 'update' }]),
  rejectLeaveApplicationValidation,
  leaveApplicationsController.rejectLeaveApplication
);

export default router;
