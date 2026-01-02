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
import { candidatesController } from '../controllers/candidates.controller';
import {
  createCandidateValidation,
  updateCandidateValidation,
} from '../validations/candidates.validation';

const router = Router();

router.post(
  '/candidates',
  authenticateToken,
  auditCreate('candidates'),
  requirePermission([{ module: 'candidate', action: 'create' }]),
  createCandidateValidation,
  candidatesController.createCandidate
);

router.get(
  '/candidates',
  authenticateToken,
  requirePermission([{ module: 'candidate', action: 'read' }]),
  candidatesController.getCandidates
);

router.get(
  '/candidates/:id',
  authenticateToken,
  requirePermission([{ module: 'candidate', action: 'read' }]),
  candidatesController.getCandidateById
);

router.put(
  '/candidates/:id',
  authenticateToken,
  auditUpdate('candidates'),
  requirePermission([{ module: 'candidate', action: 'update' }]),
  updateCandidateValidation,
  candidatesController.updateCandidate
);

router.delete(
  '/candidates/:id',
  authenticateToken,
  auditDelete('candidates'),
  requirePermission([{ module: 'candidate', action: 'delete' }]),
  candidatesController.deleteCandidate
);

export default router;
