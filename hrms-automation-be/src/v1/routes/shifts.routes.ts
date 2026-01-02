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
import { shiftsController } from '../controllers/shifts.controller';
import {
  createShiftValidation,
  updateShiftValidation,
} from '../validations/shifts.validation';

const router = Router();

router.post(
  '/shifts',
  authenticateToken,
  auditCreate('shifts'),
  requirePermission([{ module: 'shift', action: 'create' }]),
  createShiftValidation,
  shiftsController.createShift
);

router.get(
  '/shifts',
  authenticateToken,
  requirePermission([{ module: 'shift', action: 'read' }]),
  shiftsController.getShifts
);

router.get(
  '/shifts-dropdown',
  authenticateToken,
  shiftsController.getShiftsDropdown
);

router.get(
  '/shifts/:id',
  authenticateToken,
  requirePermission([{ module: 'shift', action: 'read' }]),
  shiftsController.getShiftById
);

router.put(
  '/shifts/:id',
  authenticateToken,
  auditUpdate('shifts'),
  requirePermission([{ module: 'shift', action: 'update' }]),
  updateShiftValidation,
  shiftsController.updateShift
);

router.delete(
  '/shifts/:id',
  authenticateToken,
  auditDelete('shifts'),
  requirePermission([{ module: 'shift', action: 'delete' }]),
  shiftsController.deleteShift
);

export default router;
