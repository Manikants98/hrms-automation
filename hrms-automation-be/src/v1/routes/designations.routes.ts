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
import { designationsController } from '../controllers/designations.controller';
import {
  createDesignationValidation,
  updateDesignationValidation,
} from '../validations/designations.validation';

const router = Router();

router.post(
  '/designations',
  authenticateToken,
  auditCreate('designations'),
  requirePermission([{ module: 'designation', action: 'create' }]),
  createDesignationValidation,
  designationsController.createDesignation
);

router.get(
  '/designations',
  authenticateToken,
  requirePermission([{ module: 'designation', action: 'read' }]),
  designationsController.getDesignations
);

router.get(
  '/designations-dropdown',
  authenticateToken,
  designationsController.getDesignationsDropdown
);

router.get(
  '/designations/:id',
  authenticateToken,
  requirePermission([{ module: 'designation', action: 'read' }]),
  designationsController.getDesignationById
);

router.put(
  '/designations/:id',
  authenticateToken,
  auditUpdate('designations'),
  requirePermission([{ module: 'designation', action: 'update' }]),
  updateDesignationValidation,
  designationsController.updateDesignation
);

router.delete(
  '/designations/:id',
  authenticateToken,
  auditDelete('designations'),
  requirePermission([{ module: 'designation', action: 'delete' }]),
  designationsController.deleteDesignation
);

export default router;
