import { Router } from 'express';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import { approvalWorkflowSetupController } from '../controllers/approvalWorkflowSetup.controller';

const router = Router();

router.get(
  '/',
  authenticateToken,
  requirePermission([{ module: 'approval', action: 'read' }]),
  approvalWorkflowSetupController.getApprovalWorkflowSetups
);

router.get(
  '/:id',
  authenticateToken,
  requirePermission([{ module: 'approval', action: 'read' }]),
  approvalWorkflowSetupController.getApprovalWorkflowSetupById
);

export default router;
