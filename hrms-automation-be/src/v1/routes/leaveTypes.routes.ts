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
import { leaveTypesController } from '../controllers/leaveTypes.controller';
import {
  createLeaveTypeValidation,
  updateLeaveTypeValidation,
} from '../validations/leaveTypes.validation';

const router = Router();

router.post(
  '/leave-types',
  authenticateToken,
  auditCreate('leave_types'),
  requirePermission([{ module: 'leave-type', action: 'create' }]),
  createLeaveTypeValidation,
  leaveTypesController.createLeaveType
);

router.get(
  '/leave-types',
  authenticateToken,
  requirePermission([{ module: 'leave-type', action: 'read' }]),
  leaveTypesController.getLeaveTypes
);

router.get(
  '/leave-types-dropdown',
  authenticateToken,
  leaveTypesController.getLeaveTypesDropdown
);

router.get(
  '/leave-types/:id',
  authenticateToken,
  requirePermission([{ module: 'leave-type', action: 'read' }]),
  leaveTypesController.getLeaveTypeById
);

router.put(
  '/leave-types/:id',
  authenticateToken,
  auditUpdate('leave_types'),
  requirePermission([{ module: 'leave-type', action: 'update' }]),
  updateLeaveTypeValidation,
  leaveTypesController.updateLeaveType
);

router.delete(
  '/leave-types/:id',
  authenticateToken,
  auditDelete('leave_types'),
  requirePermission([{ module: 'leave-type', action: 'delete' }]),
  leaveTypesController.deleteLeaveType
);

export default router;
