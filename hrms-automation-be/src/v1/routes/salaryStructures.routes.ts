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
import { salaryStructuresController } from '../controllers/salaryStructures.controller';
import {
  createSalaryStructureValidation,
  updateSalaryStructureValidation,
} from '../validations/salaryStructures.validation';

const router = Router();

router.post(
  '/salary-structures',
  authenticateToken,
  auditCreate('salary_structures'),
  requirePermission([{ module: 'salary-structure', action: 'create' }]),
  createSalaryStructureValidation,
  salaryStructuresController.createSalaryStructure
);

router.get(
  '/salary-structures',
  authenticateToken,
  requirePermission([{ module: 'salary-structure', action: 'read' }]),
  salaryStructuresController.getSalaryStructures
);

router.get(
  '/salary-structures/:id',
  authenticateToken,
  requirePermission([{ module: 'salary-structure', action: 'read' }]),
  salaryStructuresController.getSalaryStructureById
);

router.put(
  '/salary-structures/:id',
  authenticateToken,
  auditUpdate('salary_structures'),
  requirePermission([{ module: 'salary-structure', action: 'update' }]),
  updateSalaryStructureValidation,
  salaryStructuresController.updateSalaryStructure
);

router.delete(
  '/salary-structures/:id',
  authenticateToken,
  auditDelete('salary_structures'),
  requirePermission([{ module: 'salary-structure', action: 'delete' }]),
  salaryStructuresController.deleteSalaryStructure
);

export default router;
