import { Router } from 'express';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import { workflowController } from '../controllers/workflow.controller';

const router = Router();

router.get(
  '/',
  authenticateToken,
  requirePermission([{ module: 'workflow', action: 'read' }]),
  workflowController.getWorkflows
);

router.get(
  '/:id',
  authenticateToken,
  requirePermission([{ module: 'workflow', action: 'read' }]),
  workflowController.getWorkflowById
);

export default router;
