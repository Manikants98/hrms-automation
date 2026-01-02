import { Router } from 'express';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import { approvalWorkflowsController } from '../controllers/approvalWorkflows.controller';

const router = Router();

router.get(
  '/',
  authenticateToken,
  requirePermission([{ module: 'approval', action: 'read' }]),
  approvalWorkflowsController.getApprovalWorkflows
);

router.get(
  '/:id',
  authenticateToken,
  requirePermission([{ module: 'approval', action: 'read' }]),
  approvalWorkflowsController.getApprovalWorkflowById
);

router.post(
  '/:id/approve',
  authenticateToken,
  requirePermission([{ module: 'approval', action: 'update' }]),
  approvalWorkflowsController.approveWorkflow
);

router.post(
  '/:id/reject',
  authenticateToken,
  requirePermission([{ module: 'approval', action: 'update' }]),
  approvalWorkflowsController.rejectWorkflow
);

export default router;
