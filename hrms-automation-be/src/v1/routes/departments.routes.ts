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
import { departmentsController } from '../controllers/departments.controller';
import {
  createDepartmentValidation,
  updateDepartmentValidation,
} from '../validations/departments.validation';

const router = Router();

router.post(
  '/departments',
  authenticateToken,
  auditCreate('departments'),
  requirePermission([{ module: 'department', action: 'create' }]),
  createDepartmentValidation,
  departmentsController.createDepartment
);

router.get(
  '/departments',
  authenticateToken,
  requirePermission([{ module: 'department', action: 'read' }]),
  departmentsController.getDepartments
);

router.get(
  '/departments-dropdown',
  authenticateToken,
  departmentsController.getDepartmentsDropdown
);

router.get(
  '/departments/:id',
  authenticateToken,
  requirePermission([{ module: 'department', action: 'read' }]),
  departmentsController.getDepartmentById
);

router.put(
  '/departments/:id',
  authenticateToken,
  auditUpdate('departments'),
  requirePermission([{ module: 'department', action: 'update' }]),
  updateDepartmentValidation,
  departmentsController.updateDepartment
);

router.delete(
  '/departments/:id',
  authenticateToken,
  auditDelete('departments'),
  requirePermission([{ module: 'department', action: 'delete' }]),
  departmentsController.deleteDepartment
);

export default router;
