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
import { hiringStagesController } from '../controllers/hiringStages.controller';
import {
  createHiringStageValidation,
  updateHiringStageValidation,
} from '../validations/hiringStages.validation';

const router = Router();

router.post(
  '/hiring-stages',
  authenticateToken,
  auditCreate('hiring_stages'),
  requirePermission([{ module: 'hiring-stage', action: 'create' }]),
  createHiringStageValidation,
  hiringStagesController.createHiringStage
);

router.get(
  '/hiring-stages',
  authenticateToken,
  requirePermission([{ module: 'hiring-stage', action: 'read' }]),
  hiringStagesController.getHiringStages
);

router.get(
  '/hiring-stages-dropdown',
  authenticateToken,
  hiringStagesController.getHiringStagesDropdown
);

router.get(
  '/hiring-stages/:id',
  authenticateToken,
  requirePermission([{ module: 'hiring-stage', action: 'read' }]),
  hiringStagesController.getHiringStageById
);

router.put(
  '/hiring-stages/:id',
  authenticateToken,
  auditUpdate('hiring_stages'),
  requirePermission([{ module: 'hiring-stage', action: 'update' }]),
  updateHiringStageValidation,
  hiringStagesController.updateHiringStage
);

router.delete(
  '/hiring-stages/:id',
  authenticateToken,
  auditDelete('hiring_stages'),
  requirePermission([{ module: 'hiring-stage', action: 'delete' }]),
  hiringStagesController.deleteHiringStage
);

export default router;
