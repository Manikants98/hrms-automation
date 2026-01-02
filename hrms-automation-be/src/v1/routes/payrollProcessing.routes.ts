import { Router } from 'express';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import { auditCreate, auditDelete } from '../../middlewares/audit.middleware';
import { payrollProcessingController } from '../controllers/payrollProcessing.controller';
import { processPayrollValidation } from '../validations/payrollProcessing.validation';

const router = Router();

router.post(
  '/payroll-processing',
  authenticateToken,
  auditCreate('payroll_processing'),
  requirePermission([{ module: 'payroll-processing', action: 'create' }]),
  processPayrollValidation,
  payrollProcessingController.processPayroll
);

router.get(
  '/payroll-processing',
  authenticateToken,
  requirePermission([{ module: 'payroll-processing', action: 'read' }]),
  payrollProcessingController.getPayrollProcessing
);

router.get(
  '/payroll-processing/:id',
  authenticateToken,
  requirePermission([{ module: 'payroll-processing', action: 'read' }]),
  payrollProcessingController.getPayrollProcessingById
);

router.delete(
  '/payroll-processing/:id',
  authenticateToken,
  auditDelete('payroll_processing'),
  requirePermission([{ module: 'payroll-processing', action: 'delete' }]),
  payrollProcessingController.deletePayrollProcessing
);

export default router;
