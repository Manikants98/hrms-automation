import { Router } from 'express';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import { auditUpdate } from '../../middlewares/audit.middleware';
import { salarySlipsController } from '../controllers/salarySlips.controller';

const router = Router();

router.get(
  '/salary-slips',
  authenticateToken,
  requirePermission([{ module: 'salary-slip', action: 'read' }]),
  salarySlipsController.getSalarySlips
);

router.get(
  '/salary-slips/:id',
  authenticateToken,
  requirePermission([{ module: 'salary-slip', action: 'read' }]),
  salarySlipsController.getSalarySlipById
);

router.put(
  '/salary-slips/:id',
  authenticateToken,
  auditUpdate('salary_slips'),
  requirePermission([{ module: 'salary-slip', action: 'update' }]),
  salarySlipsController.updateSalarySlip
);

export default router;
